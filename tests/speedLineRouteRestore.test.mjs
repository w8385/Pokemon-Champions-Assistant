import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSpeedLineState, writeSpeedLineState } from '../src/speedLineState.ts'
import * as restore from '../src/speedLineRouteRestore.ts'

const parsed = (query) => parseSpeedLineState(new URLSearchParams(query))
const canonical = (state) => {
  const params = new URLSearchParams()
  writeSpeedLineState(params, state)
  return parsed(params.toString())
}

test('bad URL warnings survive a second restore of its normalized canonical state', () => {
  const valid = parsed('slv=3&q=qwilfish')
  const bad = parsed('slv=3&ref=missing-species&refStage=7&refEp=33&q=qwilfish')
  assert.deepEqual(bad.warnings, ['refEp', 'refStage'])
  let snapshot = restore.mergeSpeedLineRoute(valid, bad)
  assert.equal(snapshot.state.referenceKey, 'missing-species')
  snapshot = restore.mergeSpeedLineRoute(snapshot, canonical(snapshot.state))
  assert.deepEqual(snapshot.warnings, ['refEp', 'refStage'])
})

test('a new different valid URL clears previous repair warnings', () => {
  const bad = parsed('slv=3&ref=missing-species&refStage=7&refEp=33')
  const next = parsed('slv=3&ref=missing-species&refEp=5&refStage=1')
  const snapshot = restore.mergeSpeedLineRoute(bad, next)
  assert.deepEqual(snapshot.warnings, [])
  assert.equal(snapshot.state.referenceEffort, 5)
  assert.equal(snapshot.state.referenceStage, 1)
})

test('explicit condition edit clears stale warnings even if canonical URL restores again', () => {
  const bad = parsed('slv=3&ref=missing-species&refStage=7&refEp=33')
  const edited = restore.speedLineRouteAfterEdit({ ...bad.state, referenceStage: 1 })
  assert.deepEqual(edited.warnings, [])
  assert.deepEqual(restore.mergeSpeedLineRoute(edited, canonical(edited.state)).warnings, [])
})

test('old links migrate to canonical version without losing their warnings or changing defaults', () => {
  const old = parsed('slv=1&ref=missing-species&refStage=7&refEp=33')
  assert.equal(old.state.items, 'normal')
  assert.equal(old.state.abilityMode, 'off')
  const next = restore.mergeSpeedLineRoute(old, canonical(old.state))
  assert.deepEqual(next.warnings, ['refEp', 'refStage'])
  assert.equal(next.state.referenceKey, 'missing-species')
  assert.equal(next.state.items, 'normal')
  assert.equal(next.state.abilityMode, 'off')
})
