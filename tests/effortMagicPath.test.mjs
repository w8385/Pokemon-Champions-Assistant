import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { actualStat } from '../src/domain/champions/statMechanics.ts'
import { magicEffortCandidate, magicEffortMarkers, magicEffortScale, namedNatureMagicAvailable } from '../src/domain/champions/effortMagic.ts'

const evs = (attack = 0, defense = 0) => ({ hp: 0, attack, defense, spAttack: 0, spDefense: 0, speed: 0 })
const actual = effort => actualStat(100, effort, 1.1)
test('named boosted stat uses actual eleven-multiples, not fixed checkpoints', () => {
  assert.deepEqual(magicEffortMarkers('attack', 'attack', actual), [10, 20, 30])
  assert.deepEqual(magicEffortMarkers('attack', 'defense', actual), [])
  assert.deepEqual(magicEffortCandidate('attack', evs(9), actual), { stat: 'attack', reached: false, currentActual: actual(9), currentEffort: 9, nextEffort: 10, nextActual: 143 })
  assert.equal(magicEffortCandidate(null, evs(), actual), null)
})
test('zero achievement, exhausted budget and first reachable target', () => {
  const atZero = effort => actualStat(100, effort, 1.1)
  assert.deepEqual(magicEffortCandidate('attack', evs(), atZero).nextEffort, 0)
  assert.equal(magicEffortCandidate('attack', evs(9, 32), atZero).nextEffort, 10)
  const locked = { ...evs(9, 32), hp: 25 }
  assert.equal(magicEffortCandidate('attack', locked, atZero).nextEffort, null)
  const full = { ...evs(0, 32), hp: 32, speed: 2 }
  assert.equal(magicEffortCandidate('attack', full, atZero).nextEffort, 0)
  assert.equal(magicEffortCandidate('attack', evs(32), atZero).nextEffort, null)
})
test('canonical magic scale keeps every 0–32 position and reachability together', () => {
  const scale = magicEffortScale('attack', evs(9), actual)
  assert.deepEqual(scale?.points.map(point => [point.effort, point.actual, point.reachable]), [
    [0, 132, true], [10, 143, true], [20, 154, true], [30, 165, true],
  ])
  assert.deepEqual(scale?.current, { effort: 9, actual: 141, isMagic: false })
  assert.equal(scale?.reachableMax, 32)
  assert.deepEqual(scale?.recommendation, { kind: 'apply', direction: 'up', point: { effort: 10, actual: 143, reachable: true } })

  const budgetLocked = magicEffortScale('attack', { ...evs(9, 32), hp: 25 }, actual)
  assert.equal(budgetLocked?.reachableMax, 9)
  assert.deepEqual(budgetLocked?.points.map(point => point.reachable), [true, false, false, false])
  assert.deepEqual(budgetLocked?.recommendation, { kind: 'apply', direction: 'down', point: { effort: 0, actual: 132, reachable: true } })

  const fromMax = magicEffortScale('attack', evs(32), actual)
  assert.deepEqual(fromMax?.recommendation, { kind: 'apply', direction: 'down', point: { effort: 30, actual: 165, reachable: true } })

  const reached = magicEffortScale('attack', evs(10), actual)
  assert.deepEqual(reached?.recommendation, { kind: 'reached', point: { effort: 10, actual: 143, reachable: true } })
  assert.equal(magicEffortScale(null, evs(), actual), null)

  const fullOtherStats = { ...evs(), hp: 32, defense: 32, speed: 2 }
  const noReachableMagic = magicEffortScale('attack', fullOtherStats, effort => effort + 1)
  assert.deepEqual(noReachableMagic?.points.map(point => [point.effort, point.reachable]), [[10, false], [21, false], [32, false]])
  assert.deepEqual(noReachableMagic?.recommendation, { kind: 'blocked' })

  const invalidTotal = { ...evs(10, 32), hp: 32, speed: 32 }
  const invalidScale = magicEffortScale('attack', invalidTotal, actual)
  assert.equal(invalidScale?.reachableMax, null)
  assert.equal(invalidScale?.points.every(point => !point.reachable), true)
  assert.deepEqual(invalidScale?.recommendation, { kind: 'blocked' })
  assert.equal(magicEffortCandidate('attack', invalidTotal, actual)?.reached, true, 'legacy candidate remains backward compatible')
})
test('Quick may identify a named-nature magic target only with complete nature and no actual override', () => {
  assert.equal(namedNatureMagicAvailable('attack', { actual: {}, speedNatureKnown: true, statNatureMultipliers: {} }), true)
  assert.equal(namedNatureMagicAvailable('attack', { actual: { attack: '143' }, speedNatureKnown: true, statNatureMultipliers: {} }), false)
  assert.equal(namedNatureMagicAvailable('attack', { actual: {}, speedNatureKnown: true, statNatureMultipliers: { defense: 1.1 } }), false)
  assert.equal(namedNatureMagicAvailable('speed', { actual: {}, speedNatureKnown: false, statNatureMultipliers: {} }), false)
})
test('Quick compact editor supplies magic projection, while double bulk uses only active boosted rows', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const quick = readFileSync(new URL('../src/features/damage/QuickStatEditor.tsx', import.meta.url), 'utf8')
  assert.match(quick, /quickMagicProjection\(entry, projectedRow\)/)
  assert.match(quick, /magicScale=\{magic\.scale\}/)
  assert.match(app, /double-opponent-effort-cell-[^]*?magicPoints\.includes\(point\)/)
})
