import test from 'node:test'
import assert from 'node:assert/strict'
import { restoreQuickMoves, replaceQuickMove, quickMoveSuggestions } from '../src/quickDamageState.ts'

const options = [{ name: '무릎차기' }, { name: '인파이트' }, { name: '칼춤' }]
test('legacy scalar migrates without erasing an unknown historical move', () => {
  assert.deepEqual(restoreQuickMoves(undefined, '무릎차기', options), ['무릎차기', '', '', ''])
  assert.deepEqual(restoreQuickMoves(undefined, 'invented', options), ['invented', '', '', ''])
})
test('four independent slots preserve recorded moves even outside the pinned snapshot', () => {
  const moves = ['무릎차기', '인파이트', '칼춤', 'invented']
  assert.deepEqual(restoreQuickMoves(moves, '', options), moves)
  assert.deepEqual(replaceQuickMove(moves, 3, '인파이트'), ['무릎차기', '인파이트', '칼춤', '인파이트'])
})
test('suggestions only expose known catalog entries and ranked prefix hits', () => {
  assert.deepEqual(quickMoveSuggestions('인', options).map(x => x.name), ['인파이트'])
})
