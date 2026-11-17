const DEFAULT_ALLOWED_ORIGINS = [
  'https://w8385.dev',
  'https://midnight.tail8a61.ts.net',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const CATEGORIES = new Set(['bug', 'feature', 'data', 'ui', 'other'])
const LOCALES = new Set(['ko', 'en', 'ja'])
const POINTERS = new Set(['coarse', 'fine', 'unknown'])
const JSON_BODY_LIMIT_BYTES = 12_000
const SCREENSHOT_LIMIT_BYTES = 1_800_000
const MULTIPART_BODY_LIMIT_BYTES = 1_900_000
const SCREENSHOT_MAX_EDGE = 10_000
const SCREENSHOT_MAX_PIXELS = 4_000_000
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]
const PNG_CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let value = 0; value < 256; value += 1) {
    let crc = value
    for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    table[value] = crc >>> 0
  }
  return table
})()
const MESSAGE_LIMIT_CODE_POINTS = 1_500
const CACHE_TTL_MS = 10 * 60 * 1_000
const ALLOWED_PATHS = new Set(['/', '/Pokemon-Champions-Assistant/api/feedback'])

const SCREEN_VIEWS = {
  home: new Set(['root']),
  party: new Set(['root']),
  quickDamage: new Set(['root']),
  speedLine: new Set(['root']),
  single: new Set(['party', 'pick', 'speed', 'power']),
  double: new Set(['party', 'pick', 'power']),
  sample: new Set(['builder', 'speed', 'damage', 'library']),
  dex: new Set(['pokemon', 'move', 'ability', 'item']),
}

function parsePositiveInteger(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback
}

function ownKeysAre(value, required, optional = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return required.every(key => Object.hasOwn(value, key))
    && keys.every(key => required.includes(key) || optional.includes(key))
}

function allowedOrigins(env) {
  const configured = typeof env.ALLOWED_ORIGINS === 'string'
    ? env.ALLOWED_ORIGINS.split(',').map(value => value.trim()).filter(Boolean)
    : []
  return new Set(configured.length ? configured : DEFAULT_ALLOWED_ORIGINS)
}

function corsHeaders(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'access-control-max-age': '86400',
    'vary': 'Origin',
  }
}

function responseHeaders(origin) {
  return {
    ...corsHeaders(origin),
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  }
}

function json(origin, status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...responseHeaders(origin), ...extraHeaders },
  })
}

async function readBoundedBody(request, limit) {
  if (!request.body) return { ok: true, value: new Uint8Array() }
  const reader = request.body.getReader()
  const chunks = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > limit) {
        await reader.cancel('body-too-large')
        return { ok: false, code: 'too-large' }
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    return { ok: true, value: bytes }
  } catch {
    try { await reader.cancel('invalid-body') } catch { /* The stream may already be closed. */ }
    return { ok: false, code: 'invalid' }
  }
}

function decodeUtf8(bytes) {
  try {
    return { ok: true, value: new TextDecoder('utf-8', { fatal: true }).decode(bytes) }
  } catch {
    return { ok: false, code: 'invalid' }
  }
}

async function validateScreenshot(file) {
  if (!file || typeof file !== 'object' || typeof file.arrayBuffer !== 'function') return { ok: false, code: 'invalid' }
  if (file.type !== 'image/png') return { ok: false, code: 'invalid' }
  if (!Number.isFinite(file.size) || file.size < 57) return { ok: false, code: 'invalid' }
  if (file.size > SCREENSHOT_LIMIT_BYTES) return { ok: false, code: 'too-large' }
  let bytes
  try {
    bytes = new Uint8Array(await file.arrayBuffer())
  } catch {
    return { ok: false, code: 'invalid' }
  }
  if (PNG_SIGNATURE.some((byte, idx) => bytes[idx] !== byte)) return { ok: false, code: 'invalid' }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 8
  let chunks = 0
  let width = 0
  let height = 0
  let sawHeader = false
  let sawPalette = false
  let sawImageData = false
  let imageDataEnded = false
  let imageDataBytes = 0
  let sawEnd = false
  while (offset < bytes.length) {
    chunks += 1
    if (chunks > 2_048 || offset + 12 > bytes.length) return { ok: false, code: 'invalid' }
    const length = view.getUint32(offset)
    const chunkEnd = offset + 12 + length
    if (chunkEnd > bytes.length) return { ok: false, code: 'invalid' }
    const typeOffset = offset + 4
    const typeBytes = bytes.slice(typeOffset, typeOffset + 4)
    if ([...typeBytes].some(byte => !((byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122)))) return { ok: false, code: 'invalid' }
    const type = String.fromCharCode(...typeBytes)
    let crc = 0xffffffff
    for (let idx = typeOffset; idx < offset + 8 + length; idx += 1) crc = PNG_CRC_TABLE[(crc ^ bytes[idx]) & 0xff] ^ (crc >>> 8)
    if ((crc ^ 0xffffffff) >>> 0 !== view.getUint32(offset + 8 + length)) return { ok: false, code: 'invalid' }
    if (!sawHeader) {
      if (type !== 'IHDR' || length !== 13) return { ok: false, code: 'invalid' }
      width = view.getUint32(offset + 8)
      height = view.getUint32(offset + 12)
      const bitDepth = bytes[offset + 16]
      const colorType = bytes[offset + 17]
      const allowedDepths = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] }
      if (!allowedDepths[colorType]?.includes(bitDepth) || bytes[offset + 18] !== 0 || bytes[offset + 19] !== 0 || ![0, 1].includes(bytes[offset + 20])) {
        return { ok: false, code: 'invalid' }
      }
      sawHeader = true
    } else if (type === 'IHDR') {
      return { ok: false, code: 'invalid' }
    } else if (type === 'PLTE') {
      if (sawPalette || sawImageData || length < 3 || length > 768 || length % 3 !== 0) return { ok: false, code: 'invalid' }
      sawPalette = true
    } else if (type === 'IDAT') {
      if (imageDataEnded) return { ok: false, code: 'invalid' }
      sawImageData = true
      imageDataBytes += length
    } else if (type === 'IEND') {
      if (length !== 0 || !sawImageData || !imageDataBytes || chunkEnd !== bytes.length) return { ok: false, code: 'invalid' }
      sawEnd = true
    } else {
      if (sawImageData) imageDataEnded = true
      if (typeBytes[0] >= 65 && typeBytes[0] <= 90) return { ok: false, code: 'invalid' }
    }
    offset = chunkEnd
    if (sawEnd) break
  }
  if (!sawHeader || !sawImageData || !sawEnd || offset !== bytes.length) return { ok: false, code: 'invalid' }
  if (!width || !height || width > SCREENSHOT_MAX_EDGE || height > SCREENSHOT_MAX_EDGE || width * height > SCREENSHOT_MAX_PIXELS) {
    return { ok: false, code: 'invalid' }
  }
  return { ok: true, value: file }
}

async function parseBody(request, contentType, bytes) {
  const normalizedContentType = contentType.toLowerCase()
  if (normalizedContentType.startsWith('application/json')) {
    const decoded = decodeUtf8(bytes)
    if (!decoded.ok) return decoded
    try {
      return { ok: true, value: { payload: JSON.parse(decoded.value), screenshot: null } }
    } catch {
      return { ok: false, code: 'invalid' }
    }
  }
  if (!normalizedContentType.startsWith('multipart/form-data')) return { ok: false, code: 'invalid' }
  let form
  try {
    form = await new Request('https://feedback.invalid/', {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: bytes,
    }).formData()
  } catch {
    return { ok: false, code: 'invalid' }
  }
  const entries = [...form.entries()]
  if (entries.length !== 2 || entries.some(([key]) => key !== 'payload_json' && key !== 'screenshot')) {
    return { ok: false, code: 'invalid' }
  }
  if (entries.filter(([key]) => key === 'payload_json').length !== 1 || entries.filter(([key]) => key === 'screenshot').length !== 1) {
    return { ok: false, code: 'invalid' }
  }
  const rawPayload = form.get('payload_json')
  if (typeof rawPayload !== 'string' || new TextEncoder().encode(rawPayload).byteLength > JSON_BODY_LIMIT_BYTES) {
    return { ok: false, code: 'invalid' }
  }
  let payload
  try {
    payload = JSON.parse(rawPayload)
  } catch {
    return { ok: false, code: 'invalid' }
  }
  const screenshot = await validateScreenshot(form.get('screenshot'))
  if (!screenshot.ok) return screenshot
  return { ok: true, value: { payload, screenshot: screenshot.value } }
}

function validDiscordWebhook(value) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
      && ['discord.com', 'discordapp.com', 'canary.discord.com', 'ptb.discord.com'].includes(url.hostname)
      && url.pathname.startsWith('/api/webhooks/')
  } catch {
    return false
  }
}

function expectedScreen(screen) {
  if (screen.section === 'home') return { id: 'home', route: '#/', depth: 'root' }
  if (screen.section === 'party') return { id: 'party', route: '#/party', depth: 'root' }
  if (screen.section === 'quickDamage') return { id: 'damage', route: '#/damage', depth: 'root' }
  if (screen.section === 'speedLine') return { id: 'speed-line', route: '#/speed-line', depth: 'root' }
  if (screen.section === 'single' || screen.section === 'double') {
    return { id: `${screen.section}.${screen.view}`, route: `#/${screen.section}?tab=${screen.view}`, depth: 'root' }
  }
  if (screen.section === 'sample') {
    const depth = screen.view === 'library' ? screen.depth : 'root'
    return { id: `sample.${screen.view}${depth === 'root' ? '' : `.${depth}`}`, route: `#/sample-builder?sampleTab=${screen.view}${depth === 'detail' ? '&detail=1' : ''}`, depth }
  }
  if (screen.section === 'dex') {
    return { id: `dex.${screen.view}.${screen.depth}`, route: `#/dex?dexTab=${screen.view}&detail=${screen.depth === 'detail' ? '1' : '0'}`, depth: screen.depth }
  }
  return null
}

function validateScreen(screen) {
  if (!ownKeysAre(screen, ['id', 'section', 'view', 'depth', 'canonicalRoute'])) return false
  const views = SCREEN_VIEWS[screen.section]
  if (!views?.has(screen.view)) return false
  if (screen.section === 'sample' && screen.view === 'library' && screen.depth !== 'list' && screen.depth !== 'detail') return false
  if (screen.section === 'dex' && screen.depth !== 'list' && screen.depth !== 'detail') return false
  const expected = expectedScreen(screen)
  return Boolean(expected
    && expected.id === screen.id
    && expected.route === screen.canonicalRoute
    && expected.depth === screen.depth)
}

function validateContext(context) {
  if (!ownKeysAre(context, ['schemaVersion', 'screen', 'locale', 'viewport', 'app'])) return false
  if (context.schemaVersion !== 1 || !validateScreen(context.screen) || !LOCALES.has(context.locale)) return false
  if (!ownKeysAre(context.viewport, ['width', 'height', 'pointer'])) return false
  if (!Number.isInteger(context.viewport.width) || context.viewport.width < 1 || context.viewport.width > 10_000) return false
  if (!Number.isInteger(context.viewport.height) || context.viewport.height < 1 || context.viewport.height > 10_000) return false
  if (!POINTERS.has(context.viewport.pointer)) return false
  if (!ownKeysAre(context.app, ['version', 'revision'])) return false
  if (typeof context.app.version !== 'string' || !/^[A-Za-z0-9._-]{1,40}$/.test(context.app.version)) return false
  if (typeof context.app.revision !== 'string' || !/^[A-Za-z0-9._-]{1,40}$/.test(context.app.revision)) return false
  return true
}

function validatePayload(payload) {
  if (!ownKeysAre(payload, ['schemaVersion', 'submissionId', 'category', 'message'], ['context', 'website'])) {
    return { ok: false, code: 'invalid' }
  }
  if (payload.schemaVersion !== 1 || !CATEGORIES.has(payload.category)) return { ok: false, code: 'invalid' }
  if (typeof payload.submissionId !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(payload.submissionId)) {
    return { ok: false, code: 'invalid' }
  }
  if (payload.website !== undefined && typeof payload.website !== 'string') return { ok: false, code: 'invalid' }
  if (typeof payload.message !== 'string') return { ok: false, code: 'invalid' }
  const message = payload.message.trim()
  const length = [...message].length
  if (!length) return { ok: false, code: 'invalid' }
  if (length > MESSAGE_LIMIT_CODE_POINTS) return { ok: false, code: 'too-large' }
  if (payload.context !== undefined && payload.context !== null && !validateContext(payload.context)) {
    return { ok: false, code: 'invalid' }
  }
  return {
    ok: true,
    value: {
      schemaVersion: 1,
      submissionId: payload.submissionId,
      category: payload.category,
      message,
      context: payload.context ?? null,
      website: payload.website ?? '',
    },
  }
}

function screenText(context) {
  if (!context) return 'Not included'
  return context.screen.id
}

function discordPayload(payload, now, hasScreenshot = false) {
  const categoryLabels = {
    bug: 'Bug',
    feature: 'Feature idea',
    data: 'Data correction',
    ui: 'UI / UX',
    other: 'Other',
  }
  const fields = [{ name: 'Screen', value: screenText(payload.context), inline: true }]
  if (payload.context) {
    fields.push(
      { name: 'Locale', value: payload.context.locale, inline: true },
      { name: 'Viewport', value: `${payload.context.viewport.width}×${payload.context.viewport.height} · ${payload.context.viewport.pointer}`, inline: true },
      { name: 'Release', value: `${payload.context.app.version} · ${payload.context.app.revision}`, inline: false },
    )
  }
  const embed = {
    title: categoryLabels[payload.category],
    description: payload.message,
    color: payload.category === 'bug' ? 0xef4444 : payload.category === 'data' ? 0xf59e0b : 0x60a5fa,
    fields,
    footer: { text: `Submission ${payload.submissionId}` },
    timestamp: new Date(now).toISOString(),
    ...(hasScreenshot ? { image: { url: 'attachment://feedback-screenshot.png' } } : {}),
  }
  return {
    username: 'Champions Feedback',
    allowed_mentions: { parse: [] },
    embeds: [embed],
    ...(hasScreenshot ? { attachments: [{ id: 0, filename: 'feedback-screenshot.png', description: 'Current app viewport' }] } : {}),
  }
}

function pruneMap(map, now) {
  for (const [key, value] of map) {
    if (value.expiresAt <= now) map.delete(key)
  }
}

export function createFeedbackWorker({ fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  const rateBuckets = new Map()
  const successfulSubmissions = new Map()

  return {
    async fetch(request, env = {}) {
      const origin = request.headers.get('origin') ?? ''
      if (!allowedOrigins(env).has(origin)) {
        return new Response(JSON.stringify({ ok: false, code: 'origin-not-allowed' }), {
          status: 403,
          headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'vary': 'Origin' },
        })
      }

      const requestPath = new URL(request.url).pathname.replace(/\/$/, '') || '/'
      if (!ALLOWED_PATHS.has(requestPath)) return json(origin, 404, { ok: false, code: 'not-found' })
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) })
      if (request.method !== 'POST') return json(origin, 405, { ok: false, code: 'method-not-allowed' }, { allow: 'POST, OPTIONS' })

      const contentType = request.headers.get('content-type')?.trim() ?? ''
      const normalizedContentType = contentType.toLowerCase()
      const isJson = normalizedContentType.startsWith('application/json')
      const isMultipart = normalizedContentType.startsWith('multipart/form-data')
      if (!isJson && !isMultipart) return json(origin, 415, { ok: false, code: 'invalid' })
      const bodyLimit = isMultipart ? MULTIPART_BODY_LIMIT_BYTES : JSON_BODY_LIMIT_BYTES
      const declaredLength = Number(request.headers.get('content-length'))
      if (Number.isFinite(declaredLength) && declaredLength > bodyLimit) {
        return json(origin, 413, { ok: false, code: 'too-large' })
      }

      const currentTime = now()
      if ((rateBuckets.size + successfulSubmissions.size) % 32 === 0) {
        pruneMap(rateBuckets, currentTime)
        pruneMap(successfulSubmissions, currentTime)
      }
      const ip = request.headers.get('cf-connecting-ip')
      const rateLimitMax = parsePositiveInteger(env.RATE_LIMIT_MAX, 5, 1, 100)
      const rateLimitWindowMs = parsePositiveInteger(env.RATE_LIMIT_WINDOW_SECONDS, 60, 10, 3_600) * 1_000
      if (ip && typeof env.FEEDBACK_RATE_LIMITER?.limit === 'function') {
        try {
          const edgeLimit = await env.FEEDBACK_RATE_LIMITER.limit({ key: ip })
          if (!edgeLimit.success) {
            return json(origin, 429, { ok: false, code: 'rate-limited' }, { 'retry-after': String(Math.ceil(rateLimitWindowMs / 1_000)) })
          }
        } catch {
          // Fail open to the isolate-local fallback below if the optional binding is unavailable.
        }
      }
      if (ip) {
        const existing = rateBuckets.get(ip)
        const bucket = existing && existing.expiresAt > currentTime
          ? existing
          : { count: 0, expiresAt: currentTime + rateLimitWindowMs }
        bucket.count += 1
        rateBuckets.set(ip, bucket)
        if (bucket.count > rateLimitMax) {
          const retrySeconds = Math.max(1, Math.ceil((bucket.expiresAt - currentTime) / 1_000))
          return json(origin, 429, { ok: false, code: 'rate-limited' }, { 'retry-after': String(retrySeconds) })
        }
      }

      const body = await readBoundedBody(request, bodyLimit)
      if (!body.ok) return json(origin, body.code === 'too-large' ? 413 : 400, { ok: false, code: body.code })
      const parsed = await parseBody(request, contentType, body.value)
      if (!parsed.ok) return json(origin, parsed.code === 'too-large' ? 413 : 400, { ok: false, code: parsed.code })
      const validated = validatePayload(parsed.value.payload)
      if (!validated.ok) return json(origin, validated.code === 'too-large' ? 413 : 400, { ok: false, code: validated.code })
      const payload = validated.value
      const screenshot = parsed.value.screenshot

      // Quiet success keeps the honeypot useful without telling automated senders how it was detected.
      if (payload.website) return json(origin, 202, { ok: true })
      const cached = successfulSubmissions.get(payload.submissionId)
      if (cached && cached.expiresAt > currentTime) return json(origin, 202, { ok: true, duplicate: true })

      if (!validDiscordWebhook(env.DISCORD_WEBHOOK_URL)) return json(origin, 503, { ok: false, code: 'unavailable' })
      const timeoutMs = parsePositiveInteger(env.DISCORD_TIMEOUT_MS, 8_000, 1_000, 20_000)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      let discordResponse
      try {
        const discordUrl = new URL(env.DISCORD_WEBHOOK_URL)
        discordUrl.searchParams.set('wait', 'true')
        const webhookPayload = discordPayload(payload, currentTime, Boolean(screenshot))
        let discordBody = JSON.stringify(webhookPayload)
        let discordHeaders = { 'content-type': 'application/json' }
        if (screenshot) {
          const form = new FormData()
          form.set('payload_json', JSON.stringify(webhookPayload))
          form.set('files[0]', screenshot, 'feedback-screenshot.png')
          discordBody = form
          discordHeaders = undefined
        }
        discordResponse = await fetchImpl(discordUrl.toString(), {
          method: 'POST',
          ...(discordHeaders ? { headers: discordHeaders } : {}),
          body: discordBody,
          signal: controller.signal,
        })
      } catch {
        return json(origin, 502, { ok: false, code: 'unavailable' })
      } finally {
        clearTimeout(timeout)
      }
      if (!discordResponse.ok) return json(origin, 502, { ok: false, code: 'unavailable' })

      successfulSubmissions.set(payload.submissionId, { expiresAt: currentTime + CACHE_TTL_MS })
      return json(origin, 202, { ok: true, receiptId: payload.submissionId })
    },
  }
}

export default createFeedbackWorker()
