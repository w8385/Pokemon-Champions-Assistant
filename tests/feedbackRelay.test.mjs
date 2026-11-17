import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { createFeedbackWorker } from '../feedback-relay/worker.mjs'

const origin = 'https://w8385.dev'
const webhook = 'https://discord.com/api/webhooks/123/token'
const wranglerConfig = readFileSync(new URL('../feedback-relay/wrangler.toml', import.meta.url), 'utf8')
const decodablePng = await sharp({ create: { width: 2, height: 2, channels: 4, background: { r: 22, g: 31, b: 45, alpha: 1 } } }).png().toBuffer()

function decodablePngBlob() {
  return new Blob([decodablePng], { type: 'image/png' })
}

function payload(overrides = {}) {
  return {
    schemaVersion: 1,
    submissionId: 'feedback_test_1234',
    category: 'ui',
    message: 'The effort editor is hard to scan.',
    website: '',
    context: {
      schemaVersion: 1,
      screen: { id: 'single.party', section: 'single', view: 'party', depth: 'root', canonicalRoute: '#/single?tab=party' },
      locale: 'ko',
      viewport: { width: 390, height: 844, pointer: 'coarse' },
      app: { version: '0.1.0', revision: 'abc1234' },
    },
    ...overrides,
  }
}

function request(body = payload(), headers = {}) {
  return new Request('https://feedback.example.test/', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.8', ...headers },
    body: JSON.stringify(body),
  })
}

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data = new Uint8Array()) {
  const typeBytes = new TextEncoder().encode(type)
  const bytes = new Uint8Array(12 + data.length)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, data.length)
  bytes.set(typeBytes, 4)
  bytes.set(data, 8)
  view.setUint32(8 + data.length, crc32(new Uint8Array([...typeBytes, ...data])))
  return bytes
}

function pngBlob({ width = 390, height = 844, type = 'image/png', size = 0, validSignature = true, noIdat = false, noIend = false, trailing = false, corruptCrc = false, truncate = false } = {}) {
  const header = new Uint8Array(13)
  const headerView = new DataView(header.buffer)
  headerView.setUint32(0, width)
  headerView.setUint32(4, height)
  header.set([8, 6, 0, 0, 0], 8)
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk('IHDR', header)]
  if (!noIdat) parts.push(pngChunk('IDAT', new Uint8Array([1])))
  if (!noIend) parts.push(pngChunk('IEND'))
  let bytes = new Uint8Array(parts.reduce((total, part) => total + part.length, 0) + (trailing ? 1 : 0))
  let offset = 0
  for (const part of parts) { bytes.set(part, offset); offset += part.length }
  if (!validSignature) bytes[0] = 0
  if (corruptCrc) bytes[29] ^= 1
  if (trailing) bytes[bytes.length - 1] = 1
  if (truncate) bytes = bytes.slice(0, -3)
  if (size > bytes.length) {
    const padded = new Uint8Array(size)
    padded.set(bytes)
    bytes = padded
  }
  return new Blob([bytes], { type })
}

function multipartRequest(body = payload(), { screenshot = decodablePngBlob(), extra = false, ip = '203.0.113.18' } = {}) {
  const form = new FormData()
  form.set('payload_json', JSON.stringify(body))
  form.set('screenshot', screenshot, 'untrusted-client-name.png')
  if (extra) form.set('unexpected', 'private')
  return new Request('https://feedback.example.test/', {
    method: 'POST',
    headers: { origin, 'cf-connecting-ip': ip },
    body: form,
  })
}

function rawMultipartRequest(body = payload(), {
  boundary = 'FeedbackBoundary-MiXeD-Case-A1',
  screenshot = decodablePngBlob(),
  ip = '203.0.113.29',
} = {}) {
  const multipart = new Blob([
    `--${boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\n\r\n${JSON.stringify(body)}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="screenshot"; filename="capture.png"\r\nContent-Type: image/png\r\n\r\n`,
    screenshot,
    `\r\n--${boundary}--\r\n`,
  ])
  return new Request('https://feedback.example.test/', {
    method: 'POST',
    headers: {
      origin,
      'cf-connecting-ip': ip,
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    body: multipart,
  })
}

test('tracked Worker route owns only the feedback API path and contains no webhook secret', () => {
  assert.match(wranglerConfig, /workers_dev\s*=\s*false/)
  assert.match(wranglerConfig, /w8385\.dev\/Pokemon-Champions-Assistant\/api\/feedback\*/)
  assert.match(wranglerConfig, /name\s*=\s*"FEEDBACK_RATE_LIMITER"[\s\S]*limit\s*=\s*5[\s\S]*period\s*=\s*60/)
  assert.doesNotMatch(wranglerConfig, /DISCORD_WEBHOOK_URL\s*=/)
  assert.doesNotMatch(wranglerConfig, /discord(?:app)?\.com\/api\/webhooks\//)
})

test('valid feedback is relayed once with mentions disabled and privacy-minimal context', async () => {
  const calls = []
  const worker = createFeedbackWorker({
    now: () => Date.parse('2026-11-17T10:00:00.000Z'),
    fetchImpl: async (...args) => { calls.push(args); return new Response(null, { status: 204 }) },
  })
  const response = await worker.fetch(request(), { DISCORD_WEBHOOK_URL: webhook })
  assert.equal(response.status, 202)
  assert.equal(response.headers.get('access-control-allow-origin'), origin)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], `${webhook}?wait=true`)
  const sent = JSON.parse(calls[0][1].body)
  assert.deepEqual(sent.allowed_mentions, { parse: [] })
  assert.equal(sent.embeds[0].description, payload().message)
  assert.equal(sent.embeds[0].fields[0].value, 'single.party')
  assert.doesNotMatch(JSON.stringify(sent), /userAgent|location|search|pokemon/i)

  const duplicate = await worker.fetch(request(), { DISCORD_WEBHOOK_URL: webhook })
  assert.equal(duplicate.status, 202)
  assert.equal((await duplicate.json()).duplicate, true)
  assert.equal(calls.length, 1)
})

test('validated screenshot is forwarded to Discord as a fixed-name multipart attachment', async () => {
  const calls = []
  const worker = createFeedbackWorker({
    now: () => Date.parse('2026-11-17T10:00:00.000Z'),
    fetchImpl: async (...args) => { calls.push(args); return new Response(null, { status: 204 }) },
  })
  const response = await worker.fetch(multipartRequest(), { DISCORD_WEBHOOK_URL: webhook })
  assert.equal(response.status, 202)
  assert.equal(calls.length, 1)
  const options = calls[0][1]
  assert.ok(options.body instanceof FormData)
  assert.equal(options.headers, undefined)
  const sent = JSON.parse(options.body.get('payload_json'))
  assert.deepEqual(sent.allowed_mentions, { parse: [] })
  assert.deepEqual(sent.attachments, [{ id: 0, filename: 'feedback-screenshot.png', description: 'Current app viewport' }])
  assert.equal(sent.embeds[0].image.url, 'attachment://feedback-screenshot.png')
  const attached = options.body.get('files[0]')
  assert.equal(attached.name, 'feedback-screenshot.png')
  assert.equal(attached.type, 'image/png')
  assert.ok(attached.size >= 58)
  const decoded = await sharp(Buffer.from(await attached.arrayBuffer())).metadata()
  assert.deepEqual({ width: decoded.width, height: decoded.height, format: decoded.format }, { width: 2, height: 2, format: 'png' })
})

test('mixed-case multipart boundary is preserved while parsing', async () => {
  const calls = []
  const worker = createFeedbackWorker({
    fetchImpl: async (...args) => { calls.push(args); return new Response(null, { status: 204 }) },
  })
  const response = await worker.fetch(rawMultipartRequest(), { DISCORD_WEBHOOK_URL: webhook })
  assert.equal(response.status, 202)
  assert.equal(calls.length, 1)
  assert.ok(calls[0][1].body instanceof FormData)
  assert.equal(calls[0][1].body.get('files[0]').type, 'image/png')
})

test('duplicate screenshot submission is forwarded to Discord only once', async () => {
  const calls = []
  const worker = createFeedbackWorker({
    fetchImpl: async (...args) => { calls.push(args); return new Response(null, { status: 204 }) },
  })
  const first = await worker.fetch(multipartRequest(), { DISCORD_WEBHOOK_URL: webhook })
  const duplicate = await worker.fetch(multipartRequest(), { DISCORD_WEBHOOK_URL: webhook })
  assert.equal(first.status, 202)
  assert.equal(duplicate.status, 202)
  assert.equal((await duplicate.json()).duplicate, true)
  assert.equal(calls.length, 1)
})

test('multipart screenshot rejects unsafe types, bytes, dimensions, size and extra fields', async t => {
  const cases = [
    ['mime', multipartRequest(payload({ submissionId: 'feedback_mime_1234' }), { screenshot: pngBlob({ type: 'image/jpeg' }), ip: '203.0.113.19' }), 400],
    ['signature', multipartRequest(payload({ submissionId: 'feedback_sig_1234' }), { screenshot: pngBlob({ validSignature: false }), ip: '203.0.113.20' }), 400],
    ['dimensions', multipartRequest(payload({ submissionId: 'feedback_dim_1234' }), { screenshot: pngBlob({ width: 5_000, height: 5_000 }), ip: '203.0.113.21' }), 400],
    ['size', multipartRequest(payload({ submissionId: 'feedback_size_1234' }), { screenshot: pngBlob({ size: 1_800_001 }), ip: '203.0.113.22' }), 413],
    ['extra field', multipartRequest(payload({ submissionId: 'feedback_extra_1234' }), { extra: true, ip: '203.0.113.23' }), 400],
    ['missing IDAT', multipartRequest(payload({ submissionId: 'feedback_idat_1234' }), { screenshot: pngBlob({ noIdat: true }), ip: '203.0.113.24' }), 400],
    ['missing IEND', multipartRequest(payload({ submissionId: 'feedback_iend_1234' }), { screenshot: pngBlob({ noIend: true }), ip: '203.0.113.25' }), 400],
    ['trailing bytes', multipartRequest(payload({ submissionId: 'feedback_trail_1234' }), { screenshot: pngBlob({ trailing: true }), ip: '203.0.113.26' }), 400],
    ['bad CRC', multipartRequest(payload({ submissionId: 'feedback_crc_1234' }), { screenshot: pngBlob({ corruptCrc: true }), ip: '203.0.113.27' }), 400],
    ['truncated chunk', multipartRequest(payload({ submissionId: 'feedback_cut_1234' }), { screenshot: pngBlob({ truncate: true }), ip: '203.0.113.28' }), 400],
  ]
  for (const [name, incoming, expected] of cases) await t.test(name, async () => {
    let calls = 0
    const worker = createFeedbackWorker({ fetchImpl: async () => { calls += 1; return new Response(null, { status: 204 }) } })
    assert.equal((await worker.fetch(incoming, { DISCORD_WEBHOOK_URL: webhook })).status, expected)
    assert.equal(calls, 0)
  })
})

test('origin, content type, body size, category and canonical screens are strictly checked', async () => {
  const worker = createFeedbackWorker({ fetchImpl: async () => new Response(null, { status: 204 }) })
  const disallowed = await worker.fetch(new Request('https://feedback.example.test/', {
    method: 'POST', headers: { origin: 'https://attacker.example', 'content-type': 'application/json' }, body: '{}',
  }), { DISCORD_WEBHOOK_URL: webhook })
  assert.equal(disallowed.status, 403)
  assert.equal(disallowed.headers.get('access-control-allow-origin'), null)

  assert.equal((await worker.fetch(request(payload({ category: 'admin' })), { DISCORD_WEBHOOK_URL: webhook })).status, 400)
  assert.equal((await worker.fetch(request(payload({ context: { ...payload().context, screen: { id: 'dex.move.detail', section: 'dex', view: 'move', depth: 'detail', canonicalRoute: '#/dex?dexTab=move&detail=1', query: 'private' } } })), { DISCORD_WEBHOOK_URL: webhook })).status, 400)
  assert.equal((await worker.fetch(request(payload({ context: { ...payload().context, app: { version: '0.1.0\n@everyone', revision: 'abc1234' } } })), { DISCORD_WEBHOOK_URL: webhook })).status, 400)
  assert.equal((await worker.fetch(request(payload({ unexpected: true })), { DISCORD_WEBHOOK_URL: webhook })).status, 400)
  assert.equal((await worker.fetch(request(payload({ message: 'x'.repeat(1_501) })), { DISCORD_WEBHOOK_URL: webhook })).status, 413)

  let pulls = 0
  let cancelled = false
  const oversizedStream = new ReadableStream({
    pull(controller) {
      pulls += 1
      controller.enqueue(new Uint8Array(7_000))
      if (pulls >= 3) controller.close()
    },
    cancel() { cancelled = true },
  })
  const streamed = new Request('https://feedback.example.test/', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.9' },
    body: oversizedStream,
    duplex: 'half',
  })
  assert.equal((await worker.fetch(streamed, { DISCORD_WEBHOOK_URL: webhook })).status, 413)
  assert.ok(pulls <= 2)
  assert.equal(cancelled, true)
})

test('oversized multipart body is cancelled before it is fully consumed', async () => {
  let pulls = 0
  let cancelled = false
  const oversizedStream = new ReadableStream({
    pull(controller) {
      pulls += 1
      controller.enqueue(new Uint8Array(1_000_000))
      if (pulls >= 3) controller.close()
    },
    cancel() { cancelled = true },
  })
  const incoming = new Request('https://feedback.example.test/', {
    method: 'POST',
    headers: {
      origin,
      'content-type': 'multipart/form-data; boundary=FeedbackBoundary',
      'cf-connecting-ip': '203.0.113.30',
    },
    body: oversizedStream,
    duplex: 'half',
  })
  let calls = 0
  const worker = createFeedbackWorker({ fetchImpl: async () => { calls += 1; return new Response(null, { status: 204 }) } })
  assert.equal((await worker.fetch(incoming, { DISCORD_WEBHOOK_URL: webhook })).status, 413)
  assert.ok(pulls <= 2)
  assert.equal(cancelled, true)
  assert.equal(calls, 0)
})

test('honeypot is a quiet success and OPTIONS exposes only the approved CORS contract', async () => {
  let calls = 0
  const worker = createFeedbackWorker({ fetchImpl: async () => { calls += 1; return new Response(null, { status: 204 }) } })
  const trapped = await worker.fetch(request(payload({ website: 'https://spam.example' })), { DISCORD_WEBHOOK_URL: webhook })
  assert.equal(trapped.status, 202)
  assert.equal(calls, 0)

  const preflight = await worker.fetch(new Request('https://feedback.example.test/', { method: 'OPTIONS', headers: { origin } }), {})
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('access-control-allow-methods'), 'POST, OPTIONS')
  assert.equal(preflight.headers.get('access-control-allow-credentials'), null)
})

test('multipart honeypot is a quiet success without Discord delivery', async () => {
  let calls = 0
  const worker = createFeedbackWorker({ fetchImpl: async () => { calls += 1; return new Response(null, { status: 204 }) } })
  const trapped = await worker.fetch(multipartRequest(payload({
    submissionId: 'feedback_trap_1234',
    website: 'https://spam.example',
  }), { ip: '203.0.113.31' }), { DISCORD_WEBHOOK_URL: webhook })
  assert.equal(trapped.status, 202)
  assert.deepEqual(await trapped.json(), { ok: true })
  assert.equal(calls, 0)
})

test('per-isolate IP throttle returns a retry hint and Discord failures stay generic', async () => {
  let time = 1_000
  const worker = createFeedbackWorker({ now: () => time, fetchImpl: async () => new Response(null, { status: 500 }) })
  const failed = await worker.fetch(request(), { DISCORD_WEBHOOK_URL: webhook, RATE_LIMIT_MAX: '1' })
  assert.equal(failed.status, 502)
  assert.deepEqual(await failed.json(), { ok: false, code: 'unavailable' })

  const limited = await worker.fetch(request(payload({ submissionId: 'feedback_test_5678' })), { DISCORD_WEBHOOK_URL: webhook, RATE_LIMIT_MAX: '1' })
  assert.equal(limited.status, 429)
  assert.equal(limited.headers.get('retry-after'), '60')
  time += 61_000
  const afterWindow = await worker.fetch(request(payload({ submissionId: 'feedback_test_9012' })), { DISCORD_WEBHOOK_URL: 'https://example.com/not-discord' })
  assert.equal(afterWindow.status, 503)
})

test('Cloudflare rate-limit binding blocks before parsing or Discord delivery', async () => {
  let discordCalls = 0
  const keys = []
  const worker = createFeedbackWorker({ fetchImpl: async () => { discordCalls += 1; return new Response(null, { status: 204 }) } })
  const response = await worker.fetch(request(), {
    DISCORD_WEBHOOK_URL: webhook,
    FEEDBACK_RATE_LIMITER: { limit: async ({ key }) => { keys.push(key); return { success: false } } },
  })
  assert.equal(response.status, 429)
  assert.equal(response.headers.get('retry-after'), '60')
  assert.deepEqual(keys, ['203.0.113.8'])
  assert.equal(discordCalls, 0)
})
