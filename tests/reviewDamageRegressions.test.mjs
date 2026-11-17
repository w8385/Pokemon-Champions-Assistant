import test from 'node:test'
import assert from 'node:assert/strict'
import { calcDamage } from '../src/domain/battle/damageCore.ts'
import { resolveDamageModifiers } from '../src/domain/battle/modifierRules.ts'
import { multiHitOptions, multiHitSummary, resolveMultiHitCount, resolveMultiHitMeta } from '../src/domain/battle/movePower.ts'
import { quickMoveSupported } from '../src/domain/battle/quickDamageState.ts'

const stats = { hp: 160, attack: 150, defense: 120, spAttack: 150, spDefense: 120 }
const physical = { power: 25, category: 'physical', type: 'grass' }

test('registered ordinary multi-hit moves accumulate every hit', () => {
  const single = calcDamage(stats, stats, 25, 'physical', 1, 1, physical)
  for (const [name, requested, expected] of [
    ['씨기관총', 4, 4],
    ['고드름침', 4, 4],
    ['록블라스트', 4, 4],
    ['더블윙', 5, 2],
  ]) {
    const resolved = resolveMultiHitMeta(name, physical, requested)
    assert.equal(resolved.hits, expected, name)
    assert.equal(resolved.hitPowers.length, expected, name)
    assert.deepEqual(resolved.hitPowers, Array(expected).fill(25), name)
    assert.deepEqual(
      calcDamage(stats, stats, 25, 'physical', 1, 1, resolved).rolls,
      single.rolls.map(value => value * expected),
      name,
    )
    assert.equal(quickMoveSupported(name, physical), true, name)
  }
})

test('Skill Link chooses the registered maximum and summaries keep that result', () => {
  for (const name of ['씨기관총', '고드름침', '록블라스트', '스케일샷']) {
    assert.deepEqual(multiHitOptions(name), [2, 3, 4, 5])
    assert.equal(resolveMultiHitMeta(name, physical, 2, 'skill-link').hits, 5)
  }
  const linked = resolveMultiHitMeta('씨기관총', physical, 2, 'skill-link')
  assert.deepEqual(multiHitSummary('씨기관총', linked, 2), { hits: 5, totalPower: 125 })
  assert.equal(resolveMultiHitMeta('찍찍베기', physical, 1, 'skill-link').hits, 10)
  assert.deepEqual(resolveMultiHitMeta('트리플악셀', { ...physical, power: 20 }, 3).hitPowers, [20, 40, 60])
})

test('one hit-count authority supplies defaults, stored choices, and Skill Link', () => {
  assert.equal(resolveMultiHitCount('트리플악셀', null), 1)
  assert.equal(resolveMultiHitCount('찍찍베기', undefined), 1)
  assert.equal(resolveMultiHitCount('스케일샷', null), 2)
  assert.equal(resolveMultiHitCount('트리플악셀', 3), 3)
  assert.equal(resolveMultiHitCount('스케일샷', 3, 'skill-link'), 5)
  assert.equal(resolveMultiHitCount('더블윙', null), 2)
  assert.equal(resolveMultiHitCount('파도타기', null), null)
})

const baseParams = {
  attackerAbility: '', attackerAllyAbility: '', defenderAllyAbility: '',
  attackerItem: '', defenderAbility: '', defenderItem: '', defenderKey: 'target',
  moveName: '검증용', moveMeta: { power: 80, category: 'physical' },
  baseMoveType: 'normal', moveType: 'normal', movePower: 80, mode: 'physical',
  effectiveness: 1, attackStage: 0, defenseStage: 0,
  attackerTypes: ['normal'], defenderTypes: ['normal'], format: 'Doubles',
  burned: false, attackerLowHp: false, targetPoisoned: false, defenderFullHp: false,
  movedAfterTarget: false, faintedAllies: 0, rivalryMode: 'neutral',
  parentalBond: false, defenderStatused: false, electromorphosisCharged: false,
  weather: 'none', terrain: 'none', reflect: false, lightScreen: false,
  auroraVeil: false, friendGuard: false, critical: false,
}
const modifiers = patch => resolveDamageModifiers({ ...baseParams, ...patch })

test('Water Bubble and Mold Breaker use the correct offensive and defensive paths', () => {
  assert.equal(modifiers({ attackerAbility: 'water-bubble', moveType: 'water' }).attackMultiplier, 2)
  assert.equal(modifiers({ defenderAbility: 'water-bubble', moveType: 'fire' }).finalMultiplier, 0.5)
  assert.equal(modifiers({ attackerAbility: 'mold-breaker', defenderAbility: 'water-bubble', moveType: 'fire' }).finalMultiplier, 1)
  assert.equal(modifiers({ mode: 'special', defenderAbility: 'ice-scales' }).finalMultiplier, 0.5)
  assert.equal(modifiers({ mode: 'special', attackerAbility: 'mold-breaker', defenderAbility: 'ice-scales' }).finalMultiplier, 1)
})

test('ally and field abilities apply from every double-battle slot', () => {
  assert.equal(modifiers({ moveType: 'steel', attackerAllyAbility: 'steely-spirit' }).powerMultiplier, 1.5)
  assert.equal(modifiers({ moveType: 'steel', attackerAbility: 'steely-spirit', attackerAllyAbility: 'steely-spirit' }).powerMultiplier, 2.25)
  for (const slot of ['attackerAbility', 'attackerAllyAbility', 'defenderAbility', 'defenderAllyAbility']) {
    assert.equal(modifiers({ moveType: 'fairy', [slot]: 'fairy-aura' }).powerMultiplier, 4 / 3, slot)
    assert.equal(modifiers({ moveType: 'dark', [slot]: 'dark-aura' }).powerMultiplier, 4 / 3, slot)
  }
  assert.equal(modifiers({ moveType: 'fairy', attackerAbility: 'fairy-aura', defenderAllyAbility: 'fairy-aura' }).powerMultiplier, 4 / 3)
  assert.equal(modifiers({ friendGuard: true, defenderAllyAbility: 'friend-guard' }).finalMultiplier, 0.75)
  assert.equal(modifiers({ attackerAbility: 'mold-breaker', friendGuard: true, defenderAllyAbility: 'friend-guard' }).finalMultiplier, 1)
})
