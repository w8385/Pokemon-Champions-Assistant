import test from 'node:test'
import assert from 'node:assert/strict'
import { readQuickSaved, quickItem, quickMoveSupported } from '../src/quickDamageState.ts'
import { CHAMPIONS_ITEM_OPTIONS } from '../src/championsItems.ts'

test('restored null, arrays and primitives are empty records', () => {
  for (const raw of ['null', '[]', '42', '"text"', '{broken']) assert.deepEqual(readQuickSaved(raw), {})
  assert.deepEqual(readQuickSaved('{"move":"Flamethrower"}'), { move: 'Flamethrower' })
})

test('restored Quick items retain incompatible, explicit blank and unknown originals', () => {
  assert.equal(quickItem('いのちのたま', '한카리아스나이트', CHAMPIONS_ITEM_OPTIONS), 'いのちのたま')
  assert.equal(quickItem('', '한카리아스나이트', CHAMPIONS_ITEM_OPTIONS), '')
  assert.equal(quickItem('いのちのたま', null, CHAMPIONS_ITEM_OPTIONS), 'いのちのたま')
  assert.equal(quickItem('unknown', null, CHAMPIONS_ITEM_OPTIONS), 'unknown')
})

test('supported variable hit and target-weight moves remain selectable without admitting unknown variable power', () => {
  for (const name of ['스케일샷', '트리플악셀']) assert.equal(quickMoveSupported(name, { category: 'physical', power: 20, variablePower: true }), true)
  for (const name of ['로우킥', '풀묶기', '안다리걸기', '안다리 걸기']) assert.equal(quickMoveSupported(name, { category: 'physical', power: 0, variablePower: true }), true)
  assert.equal(quickMoveSupported('분노의주먹', { category: 'physical', power: 50, variablePower: true }), false)
  assert.equal(quickMoveSupported('칼춤', { category: 'status', power: 0 }), false)
  assert.equal(quickMoveSupported('무릎차기', { category: 'physical', power: 130 }), true)
  for (const name of ['객기', '병상첨병']) assert.equal(quickMoveSupported(name, { category: 'physical', power: 70 }, true), false)
})
