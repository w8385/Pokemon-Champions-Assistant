import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSpeedComparison, buildSpeedLine } from '../src/speedLine.ts'
import { actualStat } from '../src/statMechanics.ts'
import { championsData, additionalFormSpecs } from '../src/effectiveRoster.ts'

const rows = [
  { key: 'a', name_ko: '가', name_en: 'Alpha', speed: 100 },
  { key: 'mega-a', name_ko: '메가가', name_en: 'Mega Alpha', speed: 120 },
  { key: 'b', name_ko: '나', name_en: 'Beta', speed: 90 },
  { key: 'c', name_ko: '다', name_en: 'Gamma', speed: 100 },
]
const state = { referenceKey: 'a', referenceEffort: 32, referenceNature: 'boost', listEffort: 32, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10 }

test('comparison is from reference perspective, including faster filters and same-form different effort', () => {
  const fixture = [
    { key: 'garchomp', name_ko: '한카리아스', name_en: 'Garchomp', speed: 102 },
    { key: 'charizard', name_ko: '리자몽', name_en: 'Charizard', speed: 100 },
  ]
  const result = buildSpeedComparison(fixture, { ...state, referenceKey: 'garchomp', referenceEffort: 31 })
  assert.equal(result.reference.speed, 168)
  assert.equal(result.entries.find(e => e.row.key === 'charizard').difference, 1)
  assert.equal(result.entries.find(e => e.row.key === 'charizard').relation, 'faster')
  assert.equal(result.entries.find(e => e.row.key === 'garchomp').difference, -1)
  assert.equal(result.entries.find(e => e.row.key === 'garchomp').relation, 'slower')
  assert.deepEqual(buildSpeedComparison(fixture, { ...state, referenceKey: 'garchomp', referenceEffort: 31, comparison: 'faster' }).entries.map(e => e.row.key), ['charizard'])
  assert.equal(buildSpeedComparison(fixture, { ...state, referenceKey: 'garchomp', referenceEffort: 0 }).entries.find(e => e.row.key === 'garchomp').difference, -35)
})

test('same settings calculate both sides through actualStat and preserve form key identity', () => {
  const result = buildSpeedComparison(rows, state)
  assert.equal(result.referenceMissing, false)
  assert.equal(result.reference.row.key, 'a')
  assert.equal(result.reference.speed, actualStat(100, 32, 1.1))
  assert.deepEqual(result.entries.map(e => [e.row.key, e.speed, e.difference, e.relation]), [
    ['mega-a', actualStat(120, 32, 1.1), result.reference.speed - actualStat(120, 32, 1.1), 'slower'],
    ['a', result.reference.speed, 0, 'equal'], ['c', result.reference.speed, 0, 'equal'],
    ['b', actualStat(90, 32, 1.1), result.reference.speed - actualStat(90, 32, 1.1), 'faster'],
  ])
  assert.deepEqual(result.entries.map(e => [e.row.key, e.speed]), buildSpeedLine(rows, { effort: 32, nature: 'boost', query: '', forms: 'all' }).map(e => [e.row.key, e.speed]))
})

test('reference independently uses its effort and nature even when hidden by search and form filter', () => {
  const result = buildSpeedComparison(rows, { ...state, referenceKey: 'mega-a', referenceEffort: 0, referenceNature: 'lower', listEffort: 0, listNature: 'neutral', forms: 'nonMega', query: 'Alpha' })
  assert.equal(result.reference.row.key, 'mega-a')
  assert.equal(result.reference.speed, actualStat(120, 0, 0.9))
  assert.deepEqual(result.entries.map(e => e.row.key), ['a'])
  assert.equal(result.entries[0].difference, result.reference.speed - actualStat(100, 0, 1))
})

test('comparison, range, query, forms and ascending order compose with stable key ties', () => {
  const equal = buildSpeedComparison(rows, { ...state, comparison: 'equal', sort: 'asc' })
  assert.deepEqual(equal.entries.map(e => e.row.key), ['a', 'c'])
  const around = buildSpeedComparison(rows, { ...state, comparison: 'faster', rangeMode: 'around', gap: 12 })
  assert.deepEqual(around.entries.map(e => e.row.key), ['b'])
  assert.deepEqual(buildSpeedComparison(rows, { ...state, comparison: 'slower', forms: 'nonMega' }).entries, [])
  assert.deepEqual(buildSpeedComparison(rows, { ...state, referenceKey: 'b', sort: 'asc' }).entries.map(e => e.row.key), ['b', 'a', 'c', 'mega-a'])
})

test('unknown reference does not silently fall back and unselected reference has no comparison', () => {
  const missing = buildSpeedComparison(rows, { ...state, referenceKey: 'not-a-key', comparison: 'faster' })
  assert.equal(missing.reference, null)
  assert.equal(missing.referenceMissing, true)
  assert.deepEqual(missing.entries, [])
  const unset = buildSpeedComparison(rows, { ...state, referenceKey: null })
  assert.equal(unset.referenceMissing, false)
  assert.equal(unset.reference, null)
  assert.ok(unset.entries.every(e => e.difference === null && e.relation === null))
})

test('full effective roster including additional forms is compared without key fallback', () => {
  const effective = [...championsData.rows, ...additionalFormSpecs]
  const result = buildSpeedComparison(effective, { ...state, referenceKey: 'gourgeist-small', listEffort: 0, listNature: 'lower' })
  assert.equal(result.entries.length, effective.length)
  assert.equal(result.reference.row.speed, 99)
  assert.equal(result.reference.speed, actualStat(99, 32, 1.1))
  assert.equal(result.entries.find(e => e.row.key === 'gourgeist-super').speed, actualStat(54, 0, 0.9))
})
