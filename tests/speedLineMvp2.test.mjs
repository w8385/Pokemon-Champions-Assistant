import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSpeedComparison, buildSpeedScenario } from '../src/speedLine.ts'
import { applyChoiceScarf } from '../src/speedModifiers.ts'
import { calculateSpeedInvestment } from '../src/speedLineInvestment.ts'

const garchomp = Object.freeze({ key: 'garchomp', name_ko: '한카리아스', name_en: 'Garchomp', speed: 102 })
const charizard = Object.freeze({ key: 'charizard', name_ko: '리자몽', name_en: 'Charizard', speed: 100 })
const mega = Object.freeze({ ...charizard, key: 'mega-charizard', speed: 100 })
const state = { referenceKey: 'garchomp', referenceEffort: 31, referenceNature: 'boost', listEffort: 32, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10, items: 'both', targetKey: null, targetItem: 'normal' }

test('odd and even actual Speed receive scarf modifier only after nature flooring', () => {
  assert.equal(applyChoiceScarf(167), 250)
  assert.equal(applyChoiceScarf(168), 252)
})
test('normal and scarf scenarios have distinct identities and effective differences without mutating species', () => {
  const result = buildSpeedComparison([garchomp, charizard, mega], state)
  assert.equal(result.reference.speed, 168)
  const normal = result.entries.find(e => e.id === 'charizard:normal')
  const scarf = result.entries.find(e => e.id === 'charizard:scarf')
  assert.deepEqual([normal.actualSpeed, normal.effectiveSpeed, normal.speed, normal.difference, normal.relation], [167, 167, 167, 1, 'faster'])
  assert.deepEqual([scarf.actualSpeed, scarf.effectiveSpeed, scarf.speed, scarf.difference, scarf.relation, scarf.hypothetical], [167, 250, 250, -82, 'slower', false])
  assert.equal(result.entries.find(e => e.id === 'mega-charizard:scarf').hypothetical, true)
  assert.equal(charizard.speed, 100)
})
test('item modes, effective sort ties, relation and around filter compose', () => {
  const rows = [garchomp, charizard, { ...charizard, key: 'blastoise' }]
  const both = buildSpeedComparison(rows, { ...state, referenceKey: 'charizard', referenceEffort: 32, sort: 'asc', query: 'Charizard' })
  assert.deepEqual(both.entries.map(e => e.id), ['blastoise:normal', 'charizard:normal', 'blastoise:scarf', 'charizard:scarf'])
  assert.deepEqual(buildSpeedComparison(rows, { ...state, items: 'normal', query: 'Charizard', comparison: 'faster', rangeMode: 'around', gap: 1 }).entries.map(e => e.id), ['blastoise:normal', 'charizard:normal'])
  assert.deepEqual(buildSpeedComparison(rows, { ...state, items: 'scarf', query: 'Charizard', comparison: 'slower', rangeMode: 'around', gap: 82 }).entries.map(e => e.id), ['blastoise:scarf', 'charizard:scarf'])
  assert.deepEqual(buildSpeedComparison(rows, { ...state, items: 'scarf', query: 'Charizard', rangeMode: 'around', gap: 81 }).entries, [])
})
test('unselected and unknown references do not invent comparisons, but retain scenarios', () => {
  const missing = buildSpeedComparison([charizard], { ...state, referenceKey: 'unknown' })
  assert.equal(missing.referenceMissing, true)
  assert.equal(missing.reference, null)
  assert.equal(missing.entries.length, 2)
  assert.ok(missing.entries.every(e => e.difference === null))
})
test('investment enumerates normal tie and strict pass with predecessor', () => {
  const target = buildSpeedScenario(charizard, 32, 'boost', 'normal')
  const result = calculateSpeedInvestment(garchomp, 'boost', 31, target)
  assert.deepEqual(result, { targetSpeed: 167, tieEffort: 30, passEffort: 31, currentSpeed: 168, maxSpeed: 169, alreadyAhead: true, additionalEffort: 0, tieSpeed: 167, passSpeed: 168, previousPassSpeed: 167 })
})
test('investment uses target scarf effective speed and independently fixed reference nature', () => {
  const base150 = { ...garchomp, speed: 150 }
  const target = buildSpeedScenario(charizard, 0, 'neutral', 'scarf')
  assert.equal(target.effectiveSpeed, 180)
  const result = calculateSpeedInvestment(base150, 'neutral', 0, target)
  assert.deepEqual([result.tieEffort, result.passEffort, result.previousPassSpeed, result.passSpeed, result.additionalEffort], [10, 11, 180, 181, 11])
  const impossible = calculateSpeedInvestment(garchomp, 'boost', 31, buildSpeedScenario(charizard, 32, 'boost', 'scarf'))
  assert.deepEqual([impossible.targetSpeed, impossible.tieEffort, impossible.passEffort, impossible.maxSpeed, impossible.additionalEffort], [250, null, null, 169, null])
})
test('inverse handles jumps, plateaus, minimum zero, and unreachable equality', () => {
  const target = (speed) => ({ effectiveSpeed: speed })
  const base100 = { ...charizard, speed: 100 }
  const jump = calculateSpeedInvestment(base100, 'boost', 0, target(142))
  assert.deepEqual([jump.tieEffort, jump.passEffort, jump.previousPassSpeed, jump.passSpeed], [null, 10, 141, 143])
  const plateau = calculateSpeedInvestment(base100, 'lower', 1, target(108))
  assert.deepEqual([plateau.tieEffort, plateau.passEffort, plateau.previousPassSpeed, plateau.passSpeed], [0, 2, 108, 109])
  const zero = calculateSpeedInvestment({ ...charizard, speed: 150 }, 'boost', 0, target(180))
  assert.deepEqual([zero.passEffort, zero.previousPassSpeed, zero.alreadyAhead, zero.additionalEffort], [0, null, true, 0])
})
