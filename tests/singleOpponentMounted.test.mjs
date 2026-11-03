import test from 'node:test'
import assert from 'node:assert/strict'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import React from 'react'

const original = Object.fromEntries(['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, globalThis[key]]))
const dom = new Window({ url: 'http://localhost/#/single' })
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement']) globalThis[key] = key === 'window' ? dom : dom[key]
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.navigator })
globalThis.localStorage = dom.localStorage
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
const { act } = React
const server = await createServer({ server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom', logLevel: 'silent' })
try {
  const { useOpponentEntries } = await server.ssrLoadModule('/src/features/single/useOpponentEntries.ts')
  const { draftStorageKey } = await server.ssrLoadModule('/src/adapters/persistence/comparisonDraftState.ts')
  const empty = () => ({ key: '', item: '', ability: '', notes: '', revealedMoves: [], picked: false, hpEv: 0, defenseEv: 0, spDefenseEv: 0, speedEv: 0, natureBoost: false, scarf: false, speedStage: 0, defenseNature: 1, spDefenseNature: 1 })
  const mount = async (entries = Array.from({ length: 6 }, empty)) => {
    const node = dom.document.createElement('div'); dom.document.body.append(node)
    const root = createRoot(node)
    let state
    const props = { initialOpponents: entries, initialSelectedOpp: 0, emptyOpponents: Array.from({ length: 6 }, empty), siteLanguage: 'ko', resolveSpeciesKey: () => null, resolveAbilityInput: (_options, raw) => raw, movePoolByKey: {}, onCloseOpponentItem() {}, onDismissOpponentItem() {}, onFocusOpponentItem() {}, onCloseOpponentMove() {} }
    function Harness() { state = useOpponentEntries(props); return null }
    await act(async () => root.render(React.createElement(Harness)))
    return { get state() { return state }, close: async () => { await act(async () => root.unmount()); await Promise.resolve(); node.remove() } }
  }
  await test('mounted owner preserves same-key raw record and selected A→B→A; batched effort edits compose', async () => {
    const originalRecord = { ...empty(), key: 'garchomp', item: 'unknown-raw', ability: 'unknown-ability', notes: 'raw', revealedMoves: ['unknown', '', 'other'] }
    const app = await mount([originalRecord, { ...empty(), key: 'starmie' }, ...Array.from({ length: 4 }, empty)])
    try {
      await act(async () => { app.state.selectOpponentSpecies(0, 'garchomp'); app.state.setSelectedOpp(1); app.state.setSelectedOpp(0) })
      assert.strictEqual(app.state.opponents[0], originalRecord)
      await act(async () => { app.state.setOpponentField(0, { notes: 'new' }); app.state.setOpponentField(0, { speedEv: 9 }) })
      assert.equal(app.state.opponents[0].notes, 'new')
      assert.equal(app.state.opponents[0].speedEv, 9)
      assert.equal(app.state.opponents[0].item, 'unknown-raw')
    } finally { await app.close() }
  })
  await test('mounted reset snapshots then confirms then removes; canceled/failed preserve slots, revision and other keys', async () => {
    const app = await mount([{ ...empty(), key: 'garchomp' }, ...Array.from({ length: 5 }, empty)])
    const defenderKey = draftStorageKey('defender', 0), ownKey = draftStorageKey('attacker', 0)
    dom.localStorage.setItem(defenderKey, '{invalid'); dom.localStorage.setItem(ownKey, 'own-raw'); dom.localStorage.setItem('quick-independent', 'quick-raw')
    const confirm = dom.confirm, alert = dom.alert
    try {
      dom.confirm = () => false
      await act(async () => assert.equal(app.state.resetSingleOpponentEntry(''), false))
      assert.equal(app.state.opponents[0].key, 'garchomp')
      assert.equal(dom.localStorage.getItem(defenderKey), '{invalid')
      assert.equal(app.state.opponentResetRevision, 0)
      dom.confirm = () => true; dom.alert = () => {}
      await act(async () => assert.equal(app.state.resetSingleOpponentEntry(''), true))
      assert.equal(app.state.opponents[0].key, '')
      assert.equal(app.state.opponentResetRevision, 1)
      assert.equal(dom.localStorage.getItem(defenderKey), null)
      assert.equal(dom.localStorage.getItem(ownKey), 'own-raw')
      assert.equal(dom.localStorage.getItem('quick-independent'), 'quick-raw')
    } finally { dom.confirm = confirm; dom.alert = alert; await app.close(); dom.localStorage.clear() }
  })
  await test('registration, raw same-key identity, pick cap and Double mutation share owner', async () => {
    const raw = { ...empty(), key: 'garchomp', item: 'unknown-raw', ability: 'original-ability', notes: 'source', revealedMoves: ['a', '', 'c'], picked: true }
    const app = await mount([raw, ...Array.from({ length: 5 }, empty)])
    try {
      dom.localStorage.setItem('standalone-original', 'quick-raw')
      await act(async () => app.state.setOpponentDraftIdentity('defender', 'dirty-key'))
      assert.equal(app.state.singleDraftIdentity.defender, 'dirty-key')
      await act(async () => app.state.registerSingleOpponentSpecies('garchomp'))
      assert.strictEqual(app.state.opponents[0], raw)
      assert.equal(app.state.selectedOpp, 1)
      assert.equal(app.state.singleDraftIdentity.defender, '')
      assert.deepEqual(app.state.opponents[0].revealedMoves, ['a', '', 'c'])
      await act(async () => { app.state.setOpponentField(0, { notes: 'edited' }); app.state.updateDoubleOpponentBulkAt(0, { speedEv: 7 }) })
      assert.equal(app.state.opponents[0].notes, 'edited')
      assert.equal(app.state.opponents[0].speedEv, 7)
      await act(async () => app.state.registerSingleOpponentSpecies('starmie'))
      assert.equal(app.state.opponents[1].key, 'starmie')
      assert.equal(app.state.selectedOpp, 2)
      await act(async () => { app.state.toggleOpponentPicked(1); app.state.setOpponentField(2, { key: 'maushold' }) })
      await act(async () => { app.state.toggleOpponentPicked(2); app.state.setOpponentField(3, { key: 'cinderace' }) })
      await act(async () => app.state.toggleOpponentPicked(3))
      assert.equal(app.state.opponents.filter(member => member.picked).length, 3)
      await act(async () => { app.state.setOpponentField(4, { key: 'charizard' }) })
      await act(async () => app.state.toggleOpponentPicked(4))
      assert.equal(app.state.opponents[4].picked, false)
      await act(async () => app.state.clearOpponentSlot(0))
      assert.equal(app.state.opponents[0].key, '')
      assert.equal(app.state.opponents[1].key, 'starmie')
      await act(async () => app.state.resetOpponentsForFreshEntry())
      assert.equal(app.state.opponents.every(member => !member.key), true)
      await act(async () => app.state.setSelectedOpp(5))
      await act(async () => app.state.registerSingleOpponentSpecies('garchomp'))
      assert.equal(app.state.opponents[5].key, 'garchomp')
      assert.equal(app.state.selectedOpp, 0, 'last slot wraps to the next empty slot')
      await act(async () => { for (let slot = 0; slot < 5; slot++) app.state.setOpponentField(slot, { key: 'starmie' }) })
      await act(async () => app.state.registerSingleOpponentSpecies('starmie'))
      assert.equal(app.state.selectedOpp, 0, 'full registration retains the selected slot')
      assert.equal(dom.localStorage.getItem('standalone-original'), 'quick-raw')
    } finally { await app.close(); dom.localStorage.clear() }
  })
  await test('read failure and partial remove rollback keep registered state and revision', async () => {
    const app = await mount([{ ...empty(), key: 'garchomp' }, ...Array.from({ length: 5 }, empty)])
    const first = draftStorageKey('defender', 0), second = draftStorageKey('defender', 1)
    const originalStorage = globalThis.localStorage, originalConfirm = dom.confirm, originalAlert = dom.alert
    dom.localStorage.setItem(first, 'first'); dom.localStorage.setItem(second, '{invalid'); dom.localStorage.setItem('main-original', 'unchanged')
    let confirms = 0, alerts = []
    dom.confirm = () => { confirms++; return true }; dom.alert = message => alerts.push(message)
    try {
      globalThis.localStorage = { getItem() { throw Error('denied') } }
      await act(async () => assert.equal(app.state.resetSingleOpponentEntry(''), false))
      assert.equal(confirms, 0)
      assert.equal(app.state.opponentResetRevision, 0)
      globalThis.localStorage = { getItem: key => dom.localStorage.getItem(key), removeItem(key) { if (key === second) throw Error('denied'); dom.localStorage.removeItem(key) }, setItem: (key, value) => dom.localStorage.setItem(key, value) }
      await act(async () => assert.equal(app.state.resetSingleOpponentEntry(''), false))
      assert.equal(dom.localStorage.getItem(first), 'first')
      assert.equal(dom.localStorage.getItem(second), '{invalid')
      assert.equal(dom.localStorage.getItem('main-original'), 'unchanged')
      assert.equal(app.state.opponents[0].key, 'garchomp')
      assert.equal(app.state.opponentResetRevision, 0)
      assert.equal(confirms, 1)
      assert.equal(alerts.length, 2)
    } finally { globalThis.localStorage = originalStorage; dom.confirm = originalConfirm; dom.alert = originalAlert; await app.close(); dom.localStorage.clear() }
  })
} finally {
  await server.close()
  dom.close()
  for (const [key, value] of Object.entries(original)) if (key === 'navigator') { if (value === undefined) delete globalThis[key]; else Object.defineProperty(globalThis, key, { configurable: true, value }) } else if (value === undefined) delete globalThis[key]; else globalThis[key] = value
}
