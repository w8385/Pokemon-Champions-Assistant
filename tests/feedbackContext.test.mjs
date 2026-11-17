import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

let server
let resolveFeedbackScreen
let createFeedbackContext
let feedbackScreenLabel

const baseView = {
  mainSection: 'home',
  activeTab: 'party',
  sampleWorkbenchTab: 'builder',
  sampleLibraryDetailOpen: false,
  dexSearchMode: 'pokemon',
  dexDetailOpen: false,
}

test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  ;({ resolveFeedbackScreen, createFeedbackContext, feedbackScreenLabel } = await server.ssrLoadModule('/src/app/feedbackContext.ts'))
})

test.after(async () => { await server?.close() })

test('every application view maps to a canonical feedback screen without user state', () => {
  const cases = [
    [{ mainSection: 'home' }, { id: 'home', section: 'home', view: 'root', depth: 'root', canonicalRoute: '#/' }],
    [{ mainSection: 'party' }, { id: 'party', section: 'party', view: 'root', depth: 'root', canonicalRoute: '#/party' }],
    [{ mainSection: 'quickDamage' }, { id: 'damage', section: 'quickDamage', view: 'root', depth: 'root', canonicalRoute: '#/damage' }],
    [{ mainSection: 'speedLine' }, { id: 'speed-line', section: 'speedLine', view: 'root', depth: 'root', canonicalRoute: '#/speed-line' }],
    ...['party', 'pick', 'speed', 'power'].map(tab => [
      { mainSection: 'single', activeTab: tab },
      { id: `single.${tab}`, section: 'single', view: tab, depth: 'root', canonicalRoute: `#/single?tab=${tab}` },
    ]),
    ...['party', 'pick', 'power'].map(tab => [
      { mainSection: 'double', activeTab: tab },
      { id: `double.${tab}`, section: 'double', view: tab, depth: 'root', canonicalRoute: `#/double?tab=${tab}` },
    ]),
    ...['builder', 'speed', 'damage'].map(tab => [
      { mainSection: 'sample', sampleWorkbenchTab: tab },
      { id: `sample.${tab}`, section: 'sample', view: tab, depth: 'root', canonicalRoute: `#/sample-builder?sampleTab=${tab}` },
    ]),
    [{ mainSection: 'sample', sampleWorkbenchTab: 'library', sampleLibraryDetailOpen: false }, { id: 'sample.library.list', section: 'sample', view: 'library', depth: 'list', canonicalRoute: '#/sample-builder?sampleTab=library' }],
    [{ mainSection: 'sample', sampleWorkbenchTab: 'library', sampleLibraryDetailOpen: true }, { id: 'sample.library.detail', section: 'sample', view: 'library', depth: 'detail', canonicalRoute: '#/sample-builder?sampleTab=library&detail=1' }],
    ...['pokemon', 'move', 'ability', 'item'].flatMap(mode => [false, true].map(detail => [
      { mainSection: 'dex', dexSearchMode: mode, dexDetailOpen: detail },
      { id: `dex.${mode}.${detail ? 'detail' : 'list'}`, section: 'dex', view: mode, depth: detail ? 'detail' : 'list', canonicalRoute: `#/dex?dexTab=${mode}&detail=${detail ? '1' : '0'}` },
    ])),
  ]
  for (const [input, expected] of cases) assert.deepEqual(resolveFeedbackScreen({ ...baseView, ...input }), expected)
})

test('legacy doubles speed state is normalized to its supported damage view', () => {
  assert.deepEqual(resolveFeedbackScreen({ ...baseView, mainSection: 'double', activeTab: 'speed' }), {
    id: 'double.power', section: 'double', view: 'power', depth: 'root', canonicalRoute: '#/double?tab=power',
  })
})

test('context has an exact privacy-minimal schema and drops arbitrary private markers', () => {
  const marker = 'PRIVATE_SEARCH_SOURCE_SLOT_9182'
  const context = createFeedbackContext({
    view: {
      ...baseView,
      mainSection: 'dex',
      dexSearchMode: 'move',
      dexDetailOpen: true,
      query: marker,
      sourceId: marker,
      selectedPokemon: marker,
    },
    locale: 'ko',
    viewport: { width: 389.6, height: 843.7, pointer: 'coarse' },
    app: { version: '0.1.0', revision: 'abcdef123456' },
  })
  assert.deepEqual(Object.keys(context), ['schemaVersion', 'screen', 'locale', 'viewport', 'app'])
  assert.deepEqual(Object.keys(context.screen), ['id', 'section', 'view', 'depth', 'canonicalRoute'])
  assert.deepEqual(Object.keys(context.viewport), ['width', 'height', 'pointer'])
  assert.deepEqual(Object.keys(context.app), ['version', 'revision'])
  assert.deepEqual(context.viewport, { width: 390, height: 844, pointer: 'coarse' })
  assert.doesNotMatch(JSON.stringify(context), new RegExp(marker))
})

test('viewport and build tokens are bounded and normalized', () => {
  const context = createFeedbackContext({
    view: baseView,
    locale: 'en',
    viewport: { width: Number.NaN, height: 99_999, pointer: 'stylus' },
    app: { version: ' release 0.1.0 ! ', revision: ' feature/unsafe sha ' },
  })
  assert.deepEqual(context.viewport, { width: 1, height: 10_000, pointer: 'unknown' })
  assert.deepEqual(context.app, { version: 'release0.1.0', revision: 'featureunsafesha' })
})

test('screen labels are localized from canonical state only', () => {
  const screen = resolveFeedbackScreen({ ...baseView, mainSection: 'dex', dexSearchMode: 'ability', dexDetailOpen: true })
  assert.equal(feedbackScreenLabel(screen, 'ko'), '도감 · 특성 · 상세')
  assert.equal(feedbackScreenLabel(screen, 'en'), 'Dex · Ability · Detail')
  assert.equal(feedbackScreenLabel(screen, 'ja'), '図鑑 · 特性 · 詳細')
})

test('context module never reads URL, storage, DOM copy, or browser identity', () => {
  const source = readFileSync(new URL('../src/app/feedbackContext.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /window\.location|location\.(?:href|hash|search)|localStorage|sessionStorage|userAgent|document\./)
})
