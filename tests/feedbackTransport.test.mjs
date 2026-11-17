import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let server
let transport

const context = {
  schemaVersion: 1,
  screen: { id: 'single.party', section: 'single', view: 'party', depth: 'root', canonicalRoute: '#/single?tab=party' },
  locale: 'ko',
  viewport: { width: 390, height: 844, pointer: 'coarse' },
  app: { version: '0.1.0', revision: 'abc1234' },
}

function request(overrides = {}) {
  return {
    schemaVersion: 1,
    submissionId: 'feedback_test_1234',
    category: 'ui',
    message: '슬라이더의 끝이 헷갈립니다.',
    context,
    website: '',
    ...overrides,
  }
}

test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  transport = await server.ssrLoadModule('/src/features/feedback/feedbackTransport.ts')
})

test.after(async () => { await server?.close() })

test('successful relay uses privacy-preserving fetch options and an explicit payload', async () => {
  const calls = []
  const result = await transport.postFeedback(request(), {
    endpoint: 'https://feedback.example.test/',
    fetchImpl: async (...args) => { calls.push(args); return new Response(JSON.stringify({ receiptId: 'receipt-1' }), { status: 202, headers: { 'content-type': 'application/json' } }) },
  })
  assert.deepEqual(result, { ok: true, receiptId: 'receipt-1' })
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'https://feedback.example.test/')
  assert.equal(calls[0][1].method, 'POST')
  assert.equal(calls[0][1].credentials, 'omit')
  assert.equal(calls[0][1].cache, 'no-store')
  assert.equal(calls[0][1].referrerPolicy, 'no-referrer')
  assert.deepEqual(Object.keys(JSON.parse(calls[0][1].body)), ['schemaVersion', 'submissionId', 'category', 'message', 'context', 'website'])
})

test('HTTP failures map to stable user-facing result codes without reading server bodies', async t => {
  const cases = [
    [400, {}, { ok: false, code: 'invalid', retryable: false }],
    [422, {}, { ok: false, code: 'invalid', retryable: false }],
    [413, {}, { ok: false, code: 'too-large', retryable: false }],
    [429, { 'retry-after': '7' }, { ok: false, code: 'rate-limited', retryable: true, retryAfterMs: 7_000 }],
    [500, {}, { ok: false, code: 'unavailable', retryable: true }],
    [504, {}, { ok: false, code: 'timeout', retryable: true }],
  ]
  for (const [status, headers, expected] of cases) await t.test(String(status), async () => {
    const result = await transport.postFeedback(request(), {
      endpoint: 'https://feedback.example.test/',
      fetchImpl: async () => new Response('PRIVATE SERVER DETAIL', { status, headers }),
    })
    assert.deepEqual(result, expected)
    assert.doesNotMatch(JSON.stringify(result), /PRIVATE SERVER DETAIL/)
  })
})

test('timeout aborts the relay request and remains retryable', async () => {
  const result = await transport.postFeedback(request(), {
    endpoint: 'https://feedback.example.test/',
    timeoutMs: 5,
    fetchImpl: async (_url, options) => await new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    }),
  })
  assert.deepEqual(result, { ok: false, code: 'timeout', retryable: true })
})

test('invalid client input is rejected before fetch and Unicode length counts code points', async () => {
  let calls = 0
  const fetchImpl = async () => { calls += 1; return new Response(null, { status: 204 }) }
  assert.equal(transport.feedbackMessageLength('가😀'), 2)
  assert.deepEqual(await transport.postFeedback(request({ message: '' }), { endpoint: 'https://feedback.example.test/', fetchImpl }), { ok: false, code: 'invalid', retryable: false })
  assert.deepEqual(await transport.postFeedback(request({ message: 'x'.repeat(1_501) }), { endpoint: 'https://feedback.example.test/', fetchImpl }), { ok: false, code: 'too-large', retryable: false })
  assert.equal(calls, 0)
})

test('request construction drops unknown data and GitHub fallback prefills only safe context', () => {
  const marker = 'PRIVATE_RAW_HASH_QUERY_2718'
  const built = transport.createFeedbackRequest({
    submissionId: 'feedback_test_1234', category: 'bug', message: '  broken  ', context, website: ' ', rawUrl: marker, party: marker,
  })
  assert.deepEqual(Object.keys(built), ['schemaVersion', 'submissionId', 'category', 'message', 'context', 'website'])
  assert.equal(built.message, 'broken')
  assert.doesNotMatch(JSON.stringify(built), new RegExp(marker))
  const url = new URL(transport.buildFeedbackIssueUrl(built))
  assert.equal(url.origin, 'https://github.com')
  assert.equal(url.pathname, '/w8385/Pokemon-Champions-Assistant/issues/new')
  assert.match(url.searchParams.get('body'), /single\.party/)
  assert.match(url.searchParams.get('body'), /390 × 844/)
  assert.doesNotMatch(url.toString(), new RegExp(marker))
})
