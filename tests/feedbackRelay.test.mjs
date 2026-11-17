import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createFeedbackWorker } from '../feedback-relay/worker.mjs'

const origin = 'https://w8385.dev'
const webhook = 'https://discord.com/api/webhooks/123/token'
const wranglerConfig = readFileSync(new URL('../feedback-relay/wrangler.toml', import.meta.url), 'utf8')

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
