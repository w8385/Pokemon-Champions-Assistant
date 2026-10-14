import test from 'node:test'
import assert from 'node:assert/strict'
import { restoreQuickMoves, replaceQuickMove, quickMoveSuggestions } from '../src/quickDamageState.ts'

const options = [{ name: '무릎차기' }, { name: '인파이트' }, { name: '칼춤' }]
test('legacy scalar migrates to the first of four slots only when catalogued', () => {
  assert.deepEqual(restoreQuickMoves(undefined, '무릎차기', options), ['무릎차기', '', '', ''])
  assert.deepEqual(restoreQuickMoves(undefined, 'invented', options), ['', '', '', ''])
})
test('four independent slots preserve registered moves and remove unsupported records', () => {
  const moves = ['무릎차기', '인파이트', '칼춤', 'invented']
  assert.deepEqual(restoreQuickMoves(moves, '', options), ['무릎차기', '인파이트', '칼춤', ''])
  assert.deepEqual(replaceQuickMove(moves, 3, '인파이트'), ['무릎차기', '인파이트', '칼춤', '인파이트'])
})
test('suggestions only expose known catalog entries and ranked prefix hits', () => {
  assert.deepEqual(quickMoveSuggestions('인', options).map(x => x.name), ['인파이트'])
})
