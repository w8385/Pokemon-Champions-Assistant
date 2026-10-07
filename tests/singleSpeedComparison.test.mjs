import test from 'node:test'
import assert from 'node:assert/strict'
import { compareSingleSpeed } from '../src/singleSpeedComparison.ts'
import { actualStat } from '../src/statMechanics.ts'
import { applySpeedModifiers } from '../src/speedModifiers.ts'

const row = (key, speed) => ({ key, speed })
const own = (speed, effort = 0, nature = 1, stage = 0, scarf = false) => ({ row: row('mine', speed), effort, nature, stage, scarf })

test('normal to scarf changes the verdict; neutral to fast changes target without editing entries', () => {
  const mine = own(100, 32)
  const opponent = row('enemy', 100)
  const neutral = compareSingleSpeed(mine, opponent, 'neutral', 'normal', 0)
  const fast = compareSingleSpeed(mine, opponent, 'fast', 'normal', 0)
  const scarf = compareSingleSpeed(mine, opponent, 'neutral', 'scarf', 0)
  assert.equal(neutral.verdict, 'equal')
  assert.equal(fast.verdict, 'slower')
  assert.equal(scarf.verdict, 'slower')
  assert.equal(neutral.targetSpeed, 152)
  assert.equal(fast.targetSpeed, 167)
  assert.equal(scarf.targetSpeed, 228)
  assert.equal(mine.effort, 32)
  assert.equal(opponent.speed, 100)
})

test('strict pass minimum has a non-passing predecessor and reports increment from current investment', () => {
  const result = compareSingleSpeed(own(100, 0), row('enemy', 100), 'neutral', 'normal', 0)
  assert.equal(result.verdict, 'slower')
  assert.equal(result.tieEffort, 32)
  assert.equal(result.passEffort, null)
  assert.equal(result.additionalEffort, null)
  const pass = compareSingleSpeed(own(100, 0, 1.1), row('enemy', 100), 'neutral', 'normal', 0)
  assert.ok(pass.passEffort > 0)
  assert.ok(pass.passSpeed > pass.targetSpeed)
  assert.ok(pass.previousPassSpeed <= pass.targetSpeed)
  assert.equal(pass.additionalEffort, pass.passEffort)
})

test('unreachable high target reports cap, and mega scarf is unavailable', () => {
  const high = compareSingleSpeed(own(50), row('enemy', 200), 'fast', 'scarf', 0)
  assert.equal(high.passEffort, null)
  assert.ok(high.maxSpeed < high.targetSpeed)
  const mega = compareSingleSpeed(own(100), row('mega-lucario-z', 100), 'fast', 'scarf', 0)
  assert.equal(mega.unavailableReason, 'mega-scarf')
  assert.equal(mega.targetSpeed, null)
  assert.equal(mega.passEffort, null)
})

test('own Mega Z with a base Scarf is blocked before any computed values', () => {
  const result = compareSingleSpeed({ ...own(100, 32, 1, 0, true), row: row('mega-lucario-z', 100) }, row('enemy', 100), 'fast', 'normal', 0)
  assert.equal(result.unavailableReason, 'own-mega-scarf')
  for (const field of ['currentSpeed', 'maxSpeed', 'targetSpeed', 'verdict', 'tieEffort', 'passEffort', 'additionalEffort']) assert.equal(result[field], null)
})

test('conditional ability activation changes selected target and verdict, but not inactive comparison', () => {
  const enemy = { ...row('enemy', 100), abilities: ['swift-swim'] }
  const inactive = compareSingleSpeed(own(120, 32), enemy, 'neutral', 'normal', 0, { slug: 'swift-swim', active: false })
  const active = compareSingleSpeed(own(120, 32), enemy, 'neutral', 'normal', 0, { slug: 'swift-swim', active: true })
  assert.equal(inactive.targetSpeed, actualStat(100, 32))
  assert.equal(inactive.verdict, 'faster')
  assert.equal(active.targetSpeed, applySpeedModifiers(actualStat(100, 32), { scarf: false, abilityMultiplier: 2 }))
  assert.equal(active.verdict, 'slower')
})

test('ability plus scarf uses combined fixed point rounding and excludes unburden with scarf', () => {
  const enemy = { ...row('enemy', 75), abilities: ['chlorophyll', 'unburden'] }
  const combined = compareSingleSpeed(own(100), enemy, 'neutral', 'scarf', 0, { slug: 'chlorophyll', active: true })
  assert.equal(combined.targetSpeed, applySpeedModifiers(actualStat(75, 32), { scarf: true, abilityMultiplier: 2 }))
  const impossible = compareSingleSpeed(own(100), enemy, 'neutral', 'scarf', 0, { slug: 'unburden', active: true })
  assert.equal(impossible.unavailableReason, 'unburden-scarf')
  assert.equal(impossible.verdict, null)
  const bogus = compareSingleSpeed(own(100), enemy, 'neutral', 'normal', 0, { slug: 'swift-swim', active: true })
  assert.equal(bogus.unavailableReason, 'ability-unavailable')
  assert.equal(bogus.targetSpeed, null)
})
