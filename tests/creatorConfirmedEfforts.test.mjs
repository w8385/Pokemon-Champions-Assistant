import test from 'node:test'
import assert from 'node:assert/strict'
import { m6TopTenSamples } from '../src/m6TopTenSamples.ts'
import { confirmedCreatorEfforts } from '../src/creatorConfirmedEfforts.ts'

const rank4 = m6TopTenSamples.filter(e => e.rank.includes('최종4위'))
test('all six explicit effort values enable other-form calculation without a post-Mega ability or import build', () => {
  for (const e of [rank4[1],rank4[5]]) {
    assert.equal(e.status, 'partial')
    assert.equal(e.build, null)
    assert.equal(e.partialBuild.ability, undefined)
    assert.deepEqual(confirmedCreatorEfforts(e.build, e.partialBuild), e.partialBuild.evsKnown)
    assert.notEqual(e.partialBuild.actualStatsForm, e.pokemonKey)
  }
})
test('incomplete, inferred, or invalid investments never gain a calculated alternate-form stat', () => {
  const sparse = m6TopTenSamples.find(e => e.rank.includes('최종6위') && e.pokemonKey === 'mega-lucario')
  assert.equal(confirmedCreatorEfforts(sparse.build, sparse.partialBuild), null)
  const v = rank4[5].partialBuild.evsKnown
  assert.equal(confirmedCreatorEfforts(null, { evsKnown: { ...v, attack: undefined } }), null)
  assert.equal(confirmedCreatorEfforts(null, { evsKnown: { ...v, attack: 33 } }), null)
  assert.equal(confirmedCreatorEfforts(null, { evsKnown: { ...v, attack: 32 } }), null)
})
