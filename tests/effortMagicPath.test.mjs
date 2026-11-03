import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { actualStat } from '../src/domain/champions/statMechanics.ts'
import { magicEffortCandidate, magicEffortMarkers, namedNatureMagicAvailable } from '../src/domain/champions/effortMagic.ts'

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
test('Quick may identify a named-nature magic target only with complete nature and no actual override', () => {
  assert.equal(namedNatureMagicAvailable('attack', { actual: {}, speedNatureKnown: true, statNatureMultipliers: {} }), true)
  assert.equal(namedNatureMagicAvailable('attack', { actual: { attack: '143' }, speedNatureKnown: true, statNatureMultipliers: {} }), false)
  assert.equal(namedNatureMagicAvailable('attack', { actual: {}, speedNatureKnown: true, statNatureMultipliers: { defense: 1.1 } }), false)
  assert.equal(namedNatureMagicAvailable('speed', { actual: {}, speedNatureKnown: false, statNatureMultipliers: {} }), false)
})
test('Quick shared modal supplies magic projection, while double bulk uses only active boosted rows', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const quick = app.slice(app.indexOf('export function QuickDamagePanel'), app.indexOf('function PartyContextBar'))
  assert.match(quick, /magicCandidate=\{[^}]*\}/)
  assert.match(quick, /magicPoints=\{[^}]*\}/)
  assert.match(app, /double-opponent-effort-cell-[^]*?magicPoints\.includes\(point\)/)
})
