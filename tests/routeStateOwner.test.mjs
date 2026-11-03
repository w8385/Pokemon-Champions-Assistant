import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { parseViewStateFromUrl, syncViewStateToUrl } from '../src/app/routeState.ts'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const route = readFileSync(new URL('../src/app/routeState.ts', import.meta.url), 'utf8')
const baseline = { parseViewStateFromUrl: '4ad3f6020b6d53af6e22368ab386a1900a2e3cebcb2f3dc91bb54f18bbad782a', syncViewStateToUrl: '3824a73d7e5776c8c93155b6f83ae3c4132ab88a173735149bd3e85fa1b44897' }
const hash = value => createHash('sha256').update(value).digest('hex')

function browser(href) {
  let current = href
  const calls = []
  const location = { get href() { return current }, get hash() { return new URL(current).hash } }
  const history = { state: { retained: true }, replaceState(state, title, value) { calls.push({ method: 'replaceState', state, title }); current = String(value) } }
  globalThis.window = { location, history }
  return { calls, get href() { return current }, set href(value) { current = value } }
}

test('actual route module owns unchanged parser and serializer bodies; App consumes without ghosts', () => {
  for (const name of ['parseViewStateFromUrl', 'syncViewStateToUrl']) {
    const start = route.indexOf(`export function ${name}(`)
    const end = route.indexOf('\n}', start)
    assert.ok(start >= 0 && end > start, name)
    assert.equal(hash(route.slice(start, end + 2).replace('export function', 'function')), baseline[name])
    assert.doesNotMatch(app, new RegExp(`function ${name}\\(`))
  }
  assert.match(app, /import \{ parseViewStateFromUrl, syncViewStateToUrl \} from '\.\/app\/routeState'/)
})

test('SSR and malformed route retain null parser and no-op writer', () => {
  delete globalThis.window
  assert.equal(parseViewStateFromUrl(), null)
  syncViewStateToUrl({ mainSection: 'home' })
  browser('https://example.test/#/sample-library/%E0%A4%A')
  assert.equal(parseViewStateFromUrl(), null)
})

test('route parse retains aliases, raw keys, invalid warnings, and slot values', () => {
  try {
    browser('https://example.test/#/sample-library/youtube%3Aabc?lang=ja&format=double&q=raw%20text&my=2&opp=3')
    const library = parseViewStateFromUrl()
    assert.equal(library.mainSection, 'sample')
    assert.equal(library.sampleWorkbenchTab, 'library')
    assert.equal(library.librarySourceId, 'youtube:abc')
    assert.equal(library.selectedMy, 2)
    assert.equal(library.selectedOpp, 3)
    browser('https://example.test/#/sample-builder?sampleTab=rankers')
    assert.equal(parseViewStateFromUrl().sampleWorkbenchTab, 'library')
    browser('https://example.test/#/speed-line?view=ranges&item=scarf&my=0&opp=4')
    const speed = parseViewStateFromUrl()
    assert.equal(speed.speedLineState.view, 'detail')
    assert.equal(speed.selectedMy, 0)
    assert.equal(speed.selectedOpp, 4)
    browser('https://example.test/#/double?tab=speed')
    assert.equal(parseViewStateFromUrl().activeTab, 'power')
  } finally { delete globalThis.window }
})

test('writer keeps parameter order, original placeholder, replace semantics, no-op and party edit', () => {
  try {
    const b = browser('https://example.test/Pokemon-Champions-Assistant/#/party?edit=2')
    syncViewStateToUrl({ mainSection: 'party', selectedMy: 2, selectedOpp: 3 })
    assert.equal(new URL(b.href).hash, '#/party?my=2&opp=3&edit=2')
    assert.deepEqual(b.calls, [{ method: 'replaceState', state: { retained: true }, title: '' }])
    syncViewStateToUrl({ mainSection: 'party', selectedMy: 2, selectedOpp: 3 })
    assert.equal(b.calls.length, 1)
    const original = route.slice(route.indexOf('export function parseViewStateFromUrl('), route.indexOf('\n}', route.indexOf('export function parseViewStateFromUrl(')) + 2)
    assert.match(original, /https:\/\/openclaw\.local/)
  } finally { delete globalThis.window }
})
