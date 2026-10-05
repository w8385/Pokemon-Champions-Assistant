import test from 'node:test'
import assert from 'node:assert/strict'
import { applySpeedStage } from '../src/speedModifiers.ts'
import { buildSpeedComparison, buildSpeedScenario } from '../src/speedLine.ts'
import { calculateSpeedInvestment } from '../src/speedLineInvestment.ts'
import { defaultSpeedLineState, parseSpeedLineState, writeSpeedLineState } from '../src/speedLineState.ts'

const garchomp = Object.freeze({ key: 'garchomp', name_ko: '한카리아스', name_en: 'Garchomp', speed: 102 })
const charizard = Object.freeze({ key: 'charizard', name_ko: '리자몽', name_en: 'Charizard', speed: 100 })
const state = { ...defaultSpeedLineState, referenceKey: 'garchomp', referenceEffort: 31, referenceNature: 'boost' }

test('stage helper floors after multiplying actual speed and leaves stage zero unchanged', () => {
  assert.deepEqual([-6, -1, 0, 1, 6].map(stage => applySpeedStage(168, stage)), [42, 112, 168, 252, 672])
  assert.equal(applySpeedStage(167, 1), 250)
  assert.equal(applySpeedStage(169, -1), 112)
})

test('reference effective speed drives scarf difference, relation, range and hidden reference', () => {
  const boosted = buildSpeedComparison([garchomp, charizard], { ...state, referenceStage: 1, items: 'scarf', query: 'Charizard', comparison: 'faster', rangeMode: 'around', gap: 2 })
  assert.deepEqual([boosted.reference.row.key, boosted.reference.actualSpeed, boosted.reference.effectiveSpeed, boosted.reference.speed], ['garchomp', 168, 252, 252])
  assert.deepEqual(boosted.entries.map(entry => [entry.id, entry.actualSpeed, entry.effectiveSpeed, entry.difference, entry.relation]), [['charizard:scarf', 167, 250, 2, 'faster']])
  assert.equal(buildSpeedComparison([garchomp, charizard], { ...state, referenceStage: 1, items: 'scarf', comparison: 'slower' }).entries.some(entry => entry.id === 'charizard:scarf'), false)
  assert.equal(buildSpeedComparison([garchomp, charizard], { ...state, referenceStage: 1, items: 'scarf', rangeMode: 'around', gap: 1 }).entries.some(entry => entry.id === 'charizard:scarf'), false)
  assert.equal(buildSpeedComparison([garchomp, charizard], { ...state, referenceStage: 1, items: 'scarf', sort: 'asc' }).entries[0].effectiveSpeed, 250)
  assert.equal(garchomp.speed, 102)
})

test('inverse enumerates staged forward speeds for a scarf target and previous effort', () => {
  const result = calculateSpeedInvestment(garchomp, 'boost', 31, buildSpeedScenario(charizard, 32, 'boost', 'scarf'), 1)
  assert.deepEqual([result.targetSpeed, result.currentActualSpeed, result.currentSpeed, result.maxActualSpeed, result.maxSpeed], [250, 168, 252, 169, 253])
  assert.deepEqual([result.tieEffort, result.tieSpeed, result.passEffort, result.passSpeed, result.previousPassSpeed], [30, 250, 31, 252, 250])
  assert.equal(result.alreadyAhead, true)
})

test('negative stage can make an otherwise reachable target unreachable', () => {
  const result = calculateSpeedInvestment(garchomp, 'boost', 31, { effectiveSpeed: 167 }, -1)
  assert.deepEqual([result.currentActualSpeed, result.currentSpeed, result.maxActualSpeed, result.maxSpeed, result.tieEffort, result.passEffort, result.additionalEffort], [168, 112, 169, 112, null, null, null])
})

test('legacy four-argument inversion remains unstaged', () => {
  const result = calculateSpeedInvestment(garchomp, 'boost', 31, { effectiveSpeed: 167 })
  assert.deepEqual([result.currentActualSpeed, result.currentSpeed, result.maxActualSpeed, result.maxSpeed, result.tieEffort, result.passEffort], [168, 168, 169, 169, 30, 31])
  assert.equal(buildSpeedComparison([garchomp], { ...state, referenceStage: undefined }).reference.speed, 168)
})

test('strict refStage parsing warns and defaults for malformed, noninteger, or out-of-range values', () => {
  for (const invalid of ['-7', '7', '1.0', '+1', ' 1', '1 ', '1e0', 'Infinity', 'NaN', '', '01', '-0', '9999999999999999999999999999999']) {
    const parsed = parseSpeedLineState(new URLSearchParams({ slv: '2', ref: 'unknown', refStage: invalid }))
    assert.equal(parsed.state.referenceStage, 0, invalid)
    assert.deepEqual(parsed.warnings, ['refStage'], invalid)
    assert.equal(parsed.state.referenceKey, 'unknown', invalid)
  }
  for (let stage = -6; stage <= 6; stage++) {
    const parsed = parseSpeedLineState(new URLSearchParams({ slv: '2', refStage: String(stage) }))
    assert.equal(parsed.state.referenceStage, stage)
    assert.deepEqual(parsed.warnings, [])
  }
})

test('slv1/slv2 old links use stage zero and stage round-trips without changing unrelated params or hidden references', () => {
  for (const version of ['1', '2']) assert.equal(parseSpeedLineState(new URLSearchParams({ slv: version, ref: 'hidden' })).state.referenceStage, 0)
  const params = new URLSearchParams('slv=1&my=0&opp=1&other=keep')
  writeSpeedLineState(params, { ...defaultSpeedLineState, referenceKey: 'hidden', referenceStage: -6 })
  assert.equal(params.get('slv'), '3')
  assert.equal(params.get('refStage'), '-6')
  assert.deepEqual([params.get('my'), params.get('opp'), params.get('other')], ['0', '1', 'keep'])
  assert.deepEqual(parseSpeedLineState(params), { state: { ...defaultSpeedLineState, referenceKey: 'hidden', referenceStage: -6 }, warnings: [] })
  writeSpeedLineState(params, { ...defaultSpeedLineState })
  assert.equal(params.get('refStage'), '0')
  assert.equal(parseSpeedLineState(params).state.referenceStage, 0)
})
