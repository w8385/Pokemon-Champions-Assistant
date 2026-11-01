import test from 'node:test'
import assert from 'node:assert/strict'
import { compareFrozenReference } from '../scripts/check-damage-parity.mjs'

for (const outcome of compareFrozenReference()) {
  test(`pinned full calculateChampions 16-roll fixture: ${outcome.id}`, () => {
    assert.deepEqual(outcome.actual, outcome.expected)
    assert.equal(outcome.match, true)
  })
}
