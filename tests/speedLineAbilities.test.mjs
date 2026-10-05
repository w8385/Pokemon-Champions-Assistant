import test from 'node:test'
import assert from 'node:assert/strict'
import roster from '../src/pokemon_champions_verified_data.json' with { type: 'json' }
import { SPEED_ABILITIES, getSpeedAbility, speedAbilitiesFor } from '../src/speedAbilities.ts'
import { applySpeedModifiers } from '../src/speedModifiers.ts'
import { buildSpeedComparison, buildSpeedScenario } from '../src/speedLine.ts'
import { calculateSpeedInvestment } from '../src/speedLineInvestment.ts'
import { defaultSpeedLineState, parseSpeedLineState, writeSpeedLineState } from '../src/speedLineState.ts'

const row = (key, speed, abilities = []) => ({ key, speed, name_ko: key, name_en: key, abilities })
const swimmer = row('swimmer', 100, ['swift-swim'])
const feet = row('feet', 100, ['quick-feet'])
const unburden = row('unburden', 100, ['unburden'])
const mega = row('mega-swampert', 100, ['swift-swim'])
const zkeys = ['mega-absol-z', 'mega-garchomp-z', 'mega-lucario-z']
const state = { ...defaultSpeedLineState, items: 'both', referenceKey: 'swimmer' }

test('registry uses seven verified slugs and localized names from existing dex', () => {
  assert.deepEqual(SPEED_ABILITIES.map(a => [a.slug, a.multiplier, a.activation]), [['swift-swim', 2, 'rain'], ['chlorophyll', 2, 'sun'], ['sand-rush', 2, 'sand'], ['slush-rush', 2, 'snow'], ['surge-surfer', 2, 'electric'], ['unburden', 2, 'item-lost'], ['quick-feet', 1.5, 'status']])
  for (const descriptor of SPEED_ABILITIES) {
    const canonical = roster.rows.flatMap(r => r.abilities ?? []).find(a => a === descriptor.slug)
    assert.ok(canonical, descriptor.slug)
    assert.ok(descriptor.labelKo && descriptor.labelEn && descriptor.labelJa && descriptor.conditionKo && descriptor.conditionEn && descriptor.conditionJa)
  }
  assert.equal(getSpeedAbility('unknown'), null)
  assert.deepEqual(speedAbilitiesFor({ abilities: ['unknown', 'swift-swim'] }).map(a => a.slug), ['swift-swim'])
  assert.deepEqual(speedAbilitiesFor({}), [])
})

test('one combined fixed-point modifier rounds after stage, not sequential floors', () => {
  assert.equal(applySpeedModifiers(167, { scarf: true, abilityMultiplier: 2 }), 501)
  assert.equal(applySpeedModifiers(167, { scarf: true, abilityMultiplier: 1.5 }), 376)
  assert.equal(applySpeedModifiers(167, { scarf: false, abilityMultiplier: 1 }), 167)
})

test('base rows remain inactive while explicit ability scenarios carry separate conditions and identities', () => {
  const inactive = buildSpeedComparison([swimmer, feet], { ...state, abilityMode: 'off' }).entries
  assert.deepEqual(inactive.map(e => e.id).sort(), ['feet:normal', 'feet:scarf', 'swimmer:normal', 'swimmer:scarf'])
  const active = buildSpeedComparison([swimmer, feet], state).entries
  assert.equal(active.find(e => e.id === 'swimmer:scarf:swift-swim').effectiveSpeed, 501)
  assert.equal(active.find(e => e.id === 'feet:scarf:quick-feet').effectiveSpeed, 376)
  assert.equal(active.find(e => e.id === 'swimmer:normal').effectiveSpeed, 167)
  assert.equal(active.find(e => e.id === 'swimmer:normal:swift-swim').activation, 'rain')
  assert.equal(buildSpeedScenario(row('unknown', 100), 32, 'boost', 'normal', null, 'swift-swim').unavailableReason, 'ability-not-available')
})

test('unburden cannot combine with held scarf; Z-mega scarf is excluded; ordinary Mega ability scarf is unavailable', () => {
  const z = zkeys.map(k => row(k, 100))
  const entries = buildSpeedComparison([unburden, mega, ...z], state).entries
  assert.equal(entries.some(e => e.id === 'unburden:scarf:unburden'), false)
  assert.equal(entries.some(e => e.id === 'mega-swampert:scarf:swift-swim'), false)
  assert.equal(entries.some(e => zkeys.some(k => e.id === `${k}:scarf`)), false)
  assert.equal(entries.find(e => e.id === 'mega-swampert:scarf').hypothetical, true)
  assert.equal(buildSpeedScenario(unburden, 32, 'boost', 'scarf', null, 'unburden').unavailableReason, 'unburden-has-item')
  assert.equal(buildSpeedScenario(mega, 32, 'boost', 'scarf', null, 'swift-swim').unavailableReason, 'item-required-for-mega')
  for (const r of z) assert.equal(buildSpeedScenario(r, 32, 'boost', 'scarf').unavailableReason, 'z-mega-scarf')
})

test('selected reference ability modifies staged reference only when available', () => {
  const result = buildSpeedComparison([swimmer, feet], { ...state, referenceStage: 1, referenceAbility: 'swift-swim', items: 'normal' })
  assert.deepEqual([result.reference.actualSpeed, result.reference.effectiveSpeed, result.reference.abilitySlug, result.referenceUnavailableReason], [167, 500, 'swift-swim', null])
  assert.equal(result.entries.find(e => e.id === 'feet:normal').difference, 333)
  const invalid = buildSpeedComparison([swimmer, feet], { ...state, referenceAbility: 'unburden' })
  assert.equal(invalid.referenceUnavailableReason, 'ability-not-available')
  assert.equal(invalid.reference, null)
  assert.equal(invalid.referenceMissing, false)
  assert.ok(invalid.entries.every(e => e.difference === null))
})

test('investment enumerates same staged conditional reference and rejects invalid target or ability', () => {
  const target = buildSpeedScenario(feet, 32, 'boost', 'normal', null, 'quick-feet')
  const result = calculateSpeedInvestment(swimmer, 'boost', 31, target, 1, 'swift-swim')
  assert.equal(result.targetSpeed, 250)
  assert.equal(result.currentSpeed, 498)
  assert.equal(result.maxSpeed, 500)
  assert.equal(result.passEffort, 0)
  assert.throws(() => calculateSpeedInvestment(swimmer, 'boost', 31, target, 1, 'unburden'), RangeError)
  assert.throws(() => calculateSpeedInvestment(swimmer, 'boost', 31, buildSpeedScenario(unburden, 32, 'boost', 'scarf', null, 'unburden'), 1), RangeError)
})

test('staged conditional inverse finds strict minimum and predecessor at the cap', () => {
  const target = { effectiveSpeed: 498 }
  const result = calculateSpeedInvestment(swimmer, 'boost', 31, target, 1, 'swift-swim')
  assert.deepEqual([result.tieEffort, result.passEffort, result.previousPassSpeed, result.passSpeed, result.maxSpeed], [31, 32, 498, 500, 500])
  const unreachable = calculateSpeedInvestment(swimmer, 'boost', 31, { effectiveSpeed: 500 }, 1, 'swift-swim')
  assert.deepEqual([unreachable.tieEffort, unreachable.passEffort, unreachable.maxSpeed], [32, null, 500])
})

test('v3 roundtrip retains both abilities and null key clearing, while old links remain off', () => {
  const params = new URLSearchParams('my=0&opp=1')
  const chosen = { ...state, referenceStage: -1, referenceAbility: 'swift-swim', targetKey: 'feet', targetItem: 'scarf', targetAbility: 'quick-feet' }
  writeSpeedLineState(params, chosen)
  assert.equal(params.get('slv'), '3')
  assert.deepEqual([params.get('abilities'), params.get('refAbility'), params.get('targetAbility'), params.get('my'), params.get('opp')], ['conditions', 'swift-swim', 'quick-feet', '0', '1'])
  assert.deepEqual(parseSpeedLineState(params), { state: chosen, warnings: [] })
  writeSpeedLineState(params, { ...chosen, referenceKey: null, targetKey: null })
  assert.equal(params.has('refAbility'), false)
  assert.equal(params.has('targetAbility'), false)
  for (const slv of ['1', '2']) assert.equal(parseSpeedLineState(new URLSearchParams(`slv=${slv}`)).state.abilityMode, 'off')
  assert.equal(parseSpeedLineState(new URLSearchParams('slv=2&abilities=conditions')).state.abilityMode, 'conditions')
  assert.equal(parseSpeedLineState(new URLSearchParams('slv=3&ref=x&refAbility=nope&target=x&targetAbility=nope')).warnings.join(','), 'refAbility,targetAbility')
  assert.deepEqual(parseSpeedLineState(new URLSearchParams('slv=4&ref=x')).warnings, ['slv'])
})
