import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultSpeedLineState, parseSpeedLineState, writeSpeedLineState } from '../src/speedLineState.ts'
import { normalizeSearchText, speciesSearchCandidates, searchPokemon } from '../src/pokemonSearch.ts'

const rows = [
  { key: 'charizard', name_ko: '리자몽', name_en: 'Charizard', speed: 100 },
  { key: 'mega-charizard', name_ko: '메가리자몽', name_en: 'Mega Charizard', speed: 100 },
  { key: 'rotom-wash', name_ko: '워시로토무', name_en: 'Rotom Wash', speed: 86 },
  { key: 'mr-mime', name_ko: '마임맨', name_en: 'Mr. Mime', speed: 90 },
]
test('normalization and Japanese resolver reuse existing aliases and scoring', () => {
  assert.equal(normalizeSearchText('Mr. Mime!'), 'mrmime')
  assert.ok(speciesSearchCandidates(rows[2]).includes('로토무워시'))
  assert.deepEqual(searchPokemon(rows, 'リザードン').map(r => r.key), ['charizard', 'mega-charizard'])
  assert.equal(searchPokemon(rows, '메가 리자몽')[0].key, 'mega-charizard')
  assert.deepEqual(searchPokemon(rows, 'MIME', { includeMega: false, limit: 1 }).map(r => r.key), ['mr-mime'])
  assert.deepEqual(searchPokemon(rows, 'rtw', { allowLoose: false }), [])
  assert.deepEqual(searchPokemon(rows, 'rtw', { allowLoose: true }).map(r => r.key), ['rotom-wash'])
})
test('empty search retains roster order; caller rows and reference/list searches stay independent', () => {
  assert.deepEqual(searchPokemon(rows, '').map(r => r.key), rows.map(r => r.key))
  assert.deepEqual(searchPokemon(rows, '리자몽', { includeMega: false }).map(r => r.key), ['charizard'])
  assert.deepEqual(searchPokemon(rows, '워시').map(r => r.key), ['rotom-wash'])
})
test('v1 omitted items remains normal; absent and v2 default both', () => {
  assert.equal(defaultSpeedLineState.items, 'both')
  assert.equal(parseSpeedLineState(new URLSearchParams('slv=1&my=0&opp=1')).state.items, 'normal')
  assert.equal(parseSpeedLineState(new URLSearchParams('my=0&opp=1')).state.items, 'both')
  assert.equal(parseSpeedLineState(new URLSearchParams('slv=2')).state.items, 'both')
})
test('v2 roundtrip persists committed target identity and item but never drafts or affects slots', () => {
  const params = new URLSearchParams('my=0&opp=1&other=keep')
  const state = { ...defaultSpeedLineState, referenceKey: 'unknown-reference', targetKey: 'unknown-target', targetItem: 'scarf', items: 'scarf', query: '리자몽' }
  writeSpeedLineState(params, state)
  assert.deepEqual([params.get('slv'), params.get('items'), params.get('target'), params.get('targetItem'), params.get('my'), params.get('opp'), params.get('other')], ['2', 'scarf', 'unknown-target', 'scarf', '0', '1', 'keep'])
  assert.equal(params.has('refSearch'), false)
  assert.deepEqual(parseSpeedLineState(params), { state, warnings: [] })
  writeSpeedLineState(params, { ...state, targetKey: null })
  assert.equal(params.has('target'), false)
  assert.equal(params.has('targetItem'), false)
})
test('invalid values warn and default without discarding unknown keys', () => {
  const { state, warnings } = parseSpeedLineState(new URLSearchParams('slv=2&items=bogus&target=missing&targetItem=bogus&ref=missing-ref&refEp=-1&gap=Infinity'))
  assert.deepEqual([state.items, state.targetKey, state.targetItem, state.referenceKey, state.referenceEffort, state.gap], ['both', 'missing', 'normal', 'missing-ref', 32, 10])
  assert.deepEqual(warnings, ['refEp', 'gap', 'items', 'targetItem'])
  assert.equal(parseSpeedLineState(new URLSearchParams('slv=2&target=missing')).state.targetItem, 'normal')
  assert.deepEqual(parseSpeedLineState(new URLSearchParams('slv=3&items=scarf&target=missing')).state, defaultSpeedLineState)
})
test('orphan invalid target item warns but does not select a target', () => {
  const parsed = parseSpeedLineState(new URLSearchParams('slv=2&targetItem=invalid'))
  assert.equal(parsed.state.targetKey, null)
  assert.equal(parsed.state.targetItem, 'normal')
  assert.deepEqual(parsed.warnings, ['targetItem'])
})
