import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

import {
  CONDITIONAL_MOVE_POWER_RULES,
  abilityAdjustedWeight,
  applyConditionalMovePower,
  applyTargetWeightMovePower,
  applyTerrainPulseType,
  currentHpMovePower,
  electroBallPower,
  gyroBallPower,
  lowHpMovePower,
  normalizeConditionalPowerValue,
  userWeightMovePower,
  weightBasedMovePower,
} from '../src/domain/battle/movePower.ts'
import { resolveAbilityAdjustedMoveMeta, resolveCalculableMoveMeta } from '../src/domain/battle/moveEffects.ts'
import { knockOffPowerMultiplier, resolveDamageModifiers } from '../src/domain/battle/modifierRules.ts'
import { quickMoveSupported } from '../src/domain/battle/quickDamageState.ts'
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const {
  quickBlank,
  quickDefaultConditions,
  quickHpFacts,
  quickMoveConditionKey,
  quickMoveHits,
  quickMoveValues,
  quickPositiveStageTotal,
  quickSide,
  quickStatused,
} = await server.ssrLoadModule('/src/features/damage/quickModel.ts')
const { calculateQuickDamage } = await server.ssrLoadModule('/src/features/damage/calculateQuickDamage.ts')
test.after(async () => server.close())

const physical = (power, type = 'normal') => ({ type, category: 'physical', power, accuracy: 100, pp: 10 })
const special = (power, type = 'normal') => ({ type, category: 'special', power, accuracy: 100, pp: 10 })

const calculate = ({
  name,
  base,
  sourceBattle = {},
  targetBattle = {},
  conditions = {},
  sourceWeight = 100,
  targetWeight = 100,
  sourceSpeed = 100,
  targetSpeed = 100,
  sourceItem = '',
  targetItem = '',
  sourceAbility = '',
  targetAbility = '',
  sourceKey = 'garchomp',
  targetKey = 'blissey',
  sourceTypes = ['normal'],
  targetTypes = ['normal'],
  sourceStatPatch = {},
  targetStatPatch = {},
}) => {
  const source = { ...quickBlank(), key: sourceKey, item: sourceItem, battle: { ...quickBlank().battle, ...sourceBattle } }
  const target = { ...quickBlank(), key: targetKey, item: targetItem, battle: { ...quickBlank().battle, ...targetBattle } }
  return calculateQuickDamage({
    source,
    target,
    name,
    conditions: { ...quickDefaultConditions(), ...conditions },
    sourceRow: { key: sourceKey, types: sourceTypes, weightKg: sourceWeight },
    targetRow: { key: targetKey, types: targetTypes, weightKg: targetWeight },
    sourceStats: { hp: 200, attack: 140, defense: 100, spAttack: 140, spDefense: 100, ...sourceStatPatch },
    targetStats: { hp: 200, attack: 100, defense: 100, spAttack: 100, spDefense: 100, ...targetStatPatch },
    sourceForm: 'shield',
    targetForm: 'shield',
    sourceAbilityValid: true,
    targetAbilityValid: true,
    sourceAbility,
    targetAbility,
    base,
    hitCount: null,
    conditionalValue: undefined,
    sourceSpeed,
    targetSpeed,
  })
}

const minimumDamage = input => {
  const result = calculate(input)
  assert.ok(result, `${input.name} must calculate`)
  return result.damage.min
}

const expectedRules = [
  'G의힘', '객기', '기사회생', '기어오르기', '눈사태', '대지의파동', '독침천발', '돌림노래',
  '라이징볼트', '리벤지', '미스트버스트', '바둥바둥', '백귀야행', '베놈쇼크', '변덕레이저',
  '병상첨병', '보복', '분노의주먹', '분풀이', '분함의발구르기', '분화', '성묘', '솔라블레이드',
  '솔라빔', '승부굳히기', '애크러뱃', '어시스트파워', '열불내기', '와이드포스', '일렉트릭볼',
  '자이로볼', '토해내기', '하드프레스', '해수스파우팅', '헤비봄버', '히트스탬프',
].sort()

test('the contextual power registry keeps the reviewed 36 rules and original five', () => {
  assert.deepEqual(Object.keys(CONDITIONAL_MOVE_POWER_RULES).sort(), expectedRules)
  for (const name of ['성묘', '어시스트파워', '객기', '병상첨병', '리벤지']) {
    assert.ok(CONDITIONAL_MOVE_POWER_RULES[name], name)
  }
  assert.equal(CONDITIONAL_MOVE_POWER_RULES['성묘'].max, 5)
  assert.equal(CONDITIONAL_MOVE_POWER_RULES['어시스트파워'].max, 42)
  assert.equal(CONDITIONAL_MOVE_POWER_RULES['기어오르기'].max, 42)
})

test('toggle rules preserve base power when off and apply their exact multiplier when on', () => {
  const doubled = [
    ['객기', 70, 140], ['병상첨병', 65, 130], ['리벤지', 60, 120], ['백귀야행', 65, 130],
    ['독침천발', 60, 120], ['베놈쇼크', 65, 130], ['눈사태', 60, 120], ['보복', 50, 100],
    ['승부굳히기', 60, 120], ['분풀이', 75, 150], ['분함의발구르기', 75, 150],
    ['열불내기', 75, 150], ['돌림노래', 60, 120], ['애크러뱃', 55, 110],
    ['대지의파동', 50, 100], ['라이징볼트', 70, 140], ['변덕레이저', 80, 160],
  ]
  const scaled = [
    ['솔라빔', 120, 60], ['솔라블레이드', 125, 62], ['와이드포스', 80, 120],
    ['미스트버스트', 100, 150], ['G의힘', 90, 135],
  ]
  for (const [name, basePower, activePower] of [...doubled, ...scaled]) {
    assert.equal(applyConditionalMovePower(name, physical(basePower), false).power, basePower, `${name} off`)
    const applied = applyConditionalMovePower(name, physical(basePower), true)
    assert.equal(applied.power, activePower, `${name} on`)
    assert.equal(applied.variablePower, true, `${name} variable marker`)
  }
})

test('counted rules clamp and truncate Last Respects, positive boosts, Rage Fist, and Stockpile', () => {
  const cases = [
    ['성묘', 50, -1, 50], ['성묘', 50, 5, 300], ['성묘', 50, 99, 300],
    ['어시스트파워', 20, 0, 20], ['어시스트파워', 20, 42, 860], ['어시스트파워', 20, 99, 860],
    ['기어오르기', 20, 6.9, 140], ['기어오르기', 20, 42, 860],
    ['분노의주먹', 50, 0, 50], ['분노의주먹', 50, 6, 350], ['분노의주먹', 50, 99, 350],
    ['토해내기', null, 0, 100], ['토해내기', null, 2, 200], ['토해내기', null, 9, 300],
  ]
  for (const [name, basePower, raw, expected] of cases) {
    assert.equal(applyConditionalMovePower(name, physical(basePower), raw).power, expected, `${name} ${raw}`)
  }
})

test('low-HP moves use every integer percentage boundary', () => {
  for (const [percent, power] of [
    [1, 200], [4, 200], [5, 150], [10, 150], [11, 100], [20, 100],
    [21, 80], [35, 80], [36, 40], [68, 40], [69, 20], [100, 20],
  ]) assert.equal(lowHpMovePower(percent), power, `${percent}%`)

  for (const name of ['기사회생', '바둥바둥']) {
    for (const [percent, power] of [[1, 200], [5, 150], [11, 100], [21, 80], [36, 40], [69, 20]]) {
      assert.equal(applyConditionalMovePower(name, physical(null), percent).power, power, `${name} ${percent}%`)
    }
  }
})

test('current-HP moves scale from one percent through full HP', () => {
  assert.equal(currentHpMovePower(150, 100), 150)
  assert.equal(currentHpMovePower(150, 50), 75)
  assert.equal(currentHpMovePower(150, 33), 49)
  assert.equal(currentHpMovePower(100, 1), 1)

  for (const name of ['분화', '해수스파우팅']) {
    assert.equal(applyConditionalMovePower(name, special(150), 100).power, 150)
    assert.equal(applyConditionalMovePower(name, special(150), 50).power, 75)
    assert.equal(applyConditionalMovePower(name, special(150), 1).power, 1)
  }
  assert.equal(applyConditionalMovePower('하드프레스', physical(0, 'steel'), 100).power, 100)
  assert.equal(applyConditionalMovePower('하드프레스', physical(0, 'steel'), 50).power, 50)
  assert.equal(applyConditionalMovePower('하드프레스', physical(0, 'steel'), 1).power, 1)
})

test('target-weight power changes at every documented boundary', () => {
  for (const [weight, power] of [
    [0, 20], [9.999, 20], [10, 40], [24.999, 40], [25, 60], [49.999, 60],
    [50, 80], [99.999, 80], [100, 100], [199.999, 100], [200, 120],
  ]) assert.equal(weightBasedMovePower(weight), power, `${weight}kg`)

  for (const name of ['안다리걸기', '풀묶기']) {
    const meta = name === '풀묶기' ? special(null, 'grass') : physical(null, 'fighting')
    assert.equal(applyTargetWeightMovePower(name, meta, 9.9).power, 20)
    assert.equal(applyTargetWeightMovePower(name, meta, 200).power, 120)
    assert.equal(applyTargetWeightMovePower(name, meta, 200).variablePower, true)
  }
})

test('user-to-target weight ratio selects Heavy Slam and Heat Crash power', () => {
  for (const [source, target, power] of [
    [19.99, 10, 40], [20, 10, 60], [29.99, 10, 60], [30, 10, 80],
    [40, 10, 100], [50, 10, 120], [0, 10, 40], [50, 0, 40],
  ]) assert.equal(userWeightMovePower(source, target), power, `${source}/${target}`)

  for (const name of ['헤비봄버', '히트스탬프']) {
    assert.equal(applyConditionalMovePower(name, physical(null), 40).power, 40)
    assert.equal(applyConditionalMovePower(name, physical(null), 120).power, 120)
  }
})

test('Heavy Metal and Light Metal feed every automatic weight-based move', () => {
  assert.equal(abilityAdjustedWeight(100, 'heavy-metal'), 200)
  assert.equal(abilityAdjustedWeight(100, 'light-metal'), 50)
  assert.equal(abilityAdjustedWeight(100, ''), 100)
  const base = physical(null, 'steel')
  const normal = minimumDamage({ name: '헤비봄버', base, sourceWeight: 100, targetWeight: 30 })
  const heavy = minimumDamage({ name: '헤비봄버', base, sourceWeight: 100, targetWeight: 30, sourceAbility: 'heavy-metal' })
  const lightTarget = minimumDamage({ name: '헤비봄버', base, sourceWeight: 100, targetWeight: 30, targetAbility: 'light-metal' })
  assert.ok(heavy > normal)
  assert.equal(lightTarget, heavy)
})

test('Electro Ball and Gyro Ball cover exact speed-ratio boundaries', () => {
  for (const [source, target, power] of [
    [99, 100, 40], [100, 100, 60], [199, 100, 60], [200, 100, 80],
    [299, 100, 80], [300, 100, 120], [399, 100, 120], [400, 100, 150],
    [0, 100, 40], [100, 0, 40],
  ]) assert.equal(electroBallPower(source, target), power, `${source}/${target}`)

  assert.equal(gyroBallPower(100, 100), 26)
  assert.equal(gyroBallPower(200, 100), 13)
  assert.equal(gyroBallPower(100, 596), 150)
  assert.equal(gyroBallPower(100, 1000), 150)
  assert.equal(gyroBallPower(0, 100), 1)
  assert.equal(gyroBallPower(100, 0), 1)
  assert.equal(applyConditionalMovePower('일렉트릭볼', special(null), 150).power, 150)
  assert.equal(applyConditionalMovePower('자이로볼', physical(null), 1).power, 1)
})

test('Terrain Pulse changes type only for a grounded user on active terrain', () => {
  const base = special(50, 'normal')
  const expected = { electric: 'electric', grassy: 'grass', psychic: 'psychic', misty: 'fairy' }
  for (const [terrain, type] of Object.entries(expected)) {
    const typed = applyTerrainPulseType('대지의파동', base, terrain, true)
    assert.equal(typed.type, type, terrain)
    assert.equal(applyConditionalMovePower('대지의파동', typed, true).power, 100, terrain)
  }
  assert.equal(applyTerrainPulseType('대지의파동', base, 'electric', false).type, 'normal')
  assert.equal(applyTerrainPulseType('대지의파동', base, 'none', true).type, 'normal')
  assert.equal(applyTerrainPulseType('객기', base, 'electric', true).type, 'normal')
})

test('Weather Ball is the fortieth reviewed contextual mechanic and stays automatic', () => {
  const base = special(50, 'normal')
  assert.deepEqual(resolveAbilityAdjustedMoveMeta('웨더볼', base, '', 'none'), base)
  for (const [weather, type] of [['sun', 'fire'], ['rain', 'water'], ['sand', 'rock'], ['snow', 'ice']]) {
    const resolved = resolveAbilityAdjustedMoveMeta('웨더볼', base, '', weather)
    assert.equal(resolved.type, type, weather)
    assert.equal(resolved.power, 100, weather)
  }
})

test('Knock Off boosts only a removable target item', () => {
  assert.equal(knockOffPowerMultiplier('탁쳐서떨구기', 'garchomp', 'いのちのたま'), 1.5)
  assert.equal(knockOffPowerMultiplier('탁쳐서떨구기', 'garchomp', ''), 1)
  assert.equal(knockOffPowerMultiplier('탁쳐서떨구기', 'garchomp', 'unknown-item'), 1)
  assert.equal(knockOffPowerMultiplier('탁쳐서떨구기', 'mega-garchomp', '한카리아스나이트'), 1)
  assert.equal(knockOffPowerMultiplier('지진', 'garchomp', 'いのちのたま'), 1)

  const withoutItem = calculate({ name: '탁쳐서떨구기', base: physical(65, 'dark') })
  const removableItem = calculate({ name: '탁쳐서떨구기', base: physical(65, 'dark'), targetItem: 'いのちのたま' })
  assert.ok(withoutItem && removableItem)
  assert.equal(removableItem.decisionPower, Math.round(withoutItem.decisionPower * 1.5))
  assert.ok(removableItem.damage.min > withoutItem.damage.min)
})

test('reviewed active move exceptions use their real effectiveness, stage, and category rules', () => {
  const freezeDry = calculate({ name: '프리즈드라이', base: special(70, 'ice'), sourceTypes: ['ice'], targetTypes: ['water'] })
  const flyingPress = calculate({ name: '플라잉프레스', base: physical(100, 'fighting'), sourceTypes: ['fighting'], targetTypes: ['grass'] })
  assert.equal(freezeDry?.effectiveness, 2, 'Freeze-Dry is super effective against Water')
  assert.equal(flyingPress?.effectiveness, 2, 'Flying Press multiplies Fighting and Flying effectiveness')

  for (const [name, base] of [['DD래리어트', physical(85, 'dark')], ['성스러운칼', physical(90, 'fighting')]]) {
    const neutral = calculate({ name, base })
    const boostedDefense = calculate({ name, base, targetBattle: { defenseStage: 6 } })
    assert.deepEqual(boostedDefense?.damage, neutral?.damage, `${name} ignores target defensive stages`)
  }
  assert.ok(
    minimumDamage({ name: '지진', base: physical(100, 'ground') }) >
    minimumDamage({ name: '지진', base: physical(100, 'ground'), targetBattle: { defenseStage: 6 } }),
    'ordinary physical moves still consume the target Defense stage',
  )

  const physicalStats = { attack: 220, spAttack: 40 }
  const splitBulk = { defense: 60, spDefense: 220 }
  const shellPhysical = calculate({ name: '셸암즈', base: special(90, 'poison'), sourceTypes: ['poison'], sourceStatPatch: physicalStats, targetStatPatch: splitBulk })
  const ordinaryPhysical = calculate({ name: '독찌르기', base: physical(90, 'poison'), sourceTypes: ['poison'], sourceStatPatch: physicalStats, targetStatPatch: splitBulk })
  assert.deepEqual(shellPhysical?.damage, ordinaryPhysical?.damage, 'Shell Side Arm selects Physical from the raw comparison')

  const specialStats = { attack: 40, spAttack: 220 }
  const reverseBulk = { defense: 220, spDefense: 60 }
  const shellSpecial = calculate({ name: '셸암즈', base: special(90, 'poison'), sourceTypes: ['poison'], sourceStatPatch: specialStats, targetStatPatch: reverseBulk })
  const ordinarySpecial = calculate({ name: '오물폭탄', base: special(90, 'poison'), sourceTypes: ['poison'], sourceStatPatch: specialStats, targetStatPatch: reverseBulk })
  assert.deepEqual(shellSpecial?.damage, ordinarySpecial?.damage, 'Shell Side Arm selects Special from the raw comparison')
})

test('reviewed physical exceptions preserve contact, including Shell Side Arm only on its physical branch', () => {
  const base = {
    attackerAbility: '', attackerItem: '', defenderAbility: 'fluffy', defenderKey: 'houndstone', defenderItem: '',
    moveMeta: physical(90, 'fighting'), baseMoveType: 'fighting', moveType: 'fighting', movePower: 90,
    mode: 'physical', effectiveness: 1, attackStage: 0, defenseStage: 0, attackerTypes: ['fighting'], defenderTypes: ['ghost'],
    burned: false, attackerLowHp: false, targetPoisoned: false, defenderFullHp: false, movedAfterTarget: false,
    faintedAllies: 0, rivalryMode: 'neutral', parentalBond: false, defenderStatused: false,
    electromorphosisCharged: false, weather: 'none', terrain: 'none', reflect: false, lightScreen: false,
    auroraVeil: false, friendGuard: false,
  }
  for (const moveName of ['DD래리어트', '성스러운칼', '플라잉프레스']) {
    const fluffy = resolveDamageModifiers({ ...base, moveName })
    const claws = resolveDamageModifiers({ ...base, moveName, attackerAbility: 'tough-claws', defenderAbility: '' })
    assert.equal(fluffy.finalMultiplier, 0.5, `${moveName} is contact against Fluffy`)
    assert.equal(claws.powerMultiplier, 1.3, `${moveName} receives Tough Claws`)
  }
  assert.equal(resolveDamageModifiers({ ...base, moveName: '셸암즈', mode: 'physical' }).finalMultiplier, 0.5)
  assert.equal(resolveDamageModifiers({ ...base, moveName: '셸암즈', mode: 'special', moveMeta: special(90, 'poison') }).finalMultiplier, 1)
})

test('Gravity makes every active gravity-flag damaging move unavailable instead of returning fake damage', () => {
  for (const [name, base] of [
    ['공중날기', physical(90, 'flying')],
    ['무릎차기', physical(130, 'fighting')],
    ['뛰어오르기', physical(85, 'flying')],
    ['플라잉프레스', physical(100, 'fighting')],
  ]) {
    assert.ok(calculate({ name, base, conditions: { gravity: false } }), name)
    assert.equal(calculate({ name, base, conditions: { gravity: true } }), null, name)
  }
})

test('Raging Bull resolves the attacker breed type and removes screens before its own damage', () => {
  const combat = { name: '레이징불', base: physical(90), sourceKey: 'tauros-paldean', sourceTypes: ['fighting'], targetTypes: ['rock'] }
  const plain = calculate(combat)
  const screened = calculate({ ...combat, targetBattle: { reflect: true, lightScreen: true, auroraVeil: true } })
  const kantonian = calculate({ ...combat, sourceKey: 'tauros', sourceTypes: ['normal'] })
  assert.equal(plain?.effectiveness, 2)
  assert.deepEqual(screened?.damage, plain?.damage)
  assert.equal(kantonian?.effectiveness, 0.5)
  assert.equal(calculate({ ...combat, sourceKey: 'garchomp' }), null, 'unknown species context must not guess Normal')
})

test('Shell Side Arm tie exposes the exact union while Aura Wheel refuses an unrecorded form guess', () => {
  const stats = { attack: 140, spAttack: 140 }
  const bulk = { defense: 100, spDefense: 100 }
  const targetBattle = { reflect: true }
  const shell = calculate({ name: '셸암즈', base: special(90, 'poison'), sourceStatPatch: stats, targetStatPatch: bulk, targetBattle })
  const physicalBranch = calculate({ name: '독찌르기', base: physical(90, 'poison'), sourceStatPatch: stats, targetStatPatch: bulk, targetBattle })
  const specialBranch = calculate({ name: '오물폭탄', base: special(90, 'poison'), sourceStatPatch: stats, targetStatPatch: bulk, targetBattle })
  assert.ok(shell && physicalBranch && specialBranch)
  assert.equal(shell.damage.min, Math.min(physicalBranch.damage.min, specialBranch.damage.min))
  assert.equal(shell.damage.max, Math.max(physicalBranch.damage.max, specialBranch.damage.max))
  assert.equal(shell.decisionPower, null, 'a random category has no single honest decision-power value')
  assert.equal(calculate({ name: '오라휠', base: physical(110, 'electric') }), null)
  assert.equal(resolveAbilityAdjustedMoveMeta('오라휠', physical(110, 'electric'), '')?.type, 'electric', 'display metadata remains available')
  assert.equal(resolveAbilityAdjustedMoveMeta('셸암즈', special(90, 'poison'), '')?.type, 'poison', 'display metadata remains available')
  assert.equal(resolveCalculableMoveMeta('오라휠', physical(110, 'electric'), ''), null)
  assert.equal(resolveCalculableMoveMeta('셸암즈', special(90, 'poison'), ''), null, 'calculation cannot guess a dynamic category')
  assert.equal(resolveCalculableMoveMeta('셸암즈', special(90, 'poison'), '', 'none', 'physical')?.category, 'physical')
})

test('normalization clamps count rules while toggle rules remain booleans', () => {
  const lastRespects = CONDITIONAL_MOVE_POWER_RULES['성묘']
  assert.equal(normalizeConditionalPowerValue(lastRespects, -5), 0)
  assert.equal(normalizeConditionalPowerValue(lastRespects, 3.9), 3)
  assert.equal(normalizeConditionalPowerValue(lastRespects, 99), 5)
  assert.equal(normalizeConditionalPowerValue(lastRespects, Number.NaN), 0)
  assert.equal(normalizeConditionalPowerValue(CONDITIONAL_MOVE_POWER_RULES['객기'], false), false)
  assert.equal(normalizeConditionalPowerValue(CONDITIONAL_MOVE_POWER_RULES['객기'], true), true)
})

test('status facts drive the correct conditional moves in the real Quick calculation', () => {
  const scenarios = [
    ['객기', physical(70), { statused: true }, {}],
    ['병상첨병', special(65), {}, { statused: true }],
    ['백귀야행', special(65), {}, { burned: true }],
    ['독침천발', physical(60), {}, { poisoned: true }],
    ['베놈쇼크', special(65), {}, { poisoned: true }],
  ]
  for (const [name, base, sourceBattle, targetBattle] of scenarios) {
    const normal = minimumDamage({ name, base })
    const active = minimumDamage({ name, base, sourceBattle, targetBattle })
    assert.ok(active > normal, `${name} status condition`)
  }
})

test('turn-history facts drive each corresponding move in the real Quick calculation', () => {
  const scenarios = [
    ['눈사태', physical(60), { damagedByTarget: true }, {}],
    ['리벤지', physical(60), { damagedByTarget: true }, {}],
    ['보복', physical(50), { movedAfterTarget: true }, {}],
    ['승부굳히기', physical(60), {}, { damagedThisTurn: true }],
    ['분풀이', physical(75), { statDroppedThisTurn: true }, {}],
    ['분함의발구르기', physical(75), { previousMoveFailed: true }, {}],
    ['열불내기', physical(75), { previousMoveFailed: true }, {}],
    ['돌림노래', special(60), { allyUsedRound: true }, {}],
    ['변덕레이저', special(80), { randomDoublePower: true }, {}],
  ]
  for (const [name, base, sourceBattle, targetBattle] of scenarios) {
    const normal = minimumDamage({ name, base })
    const active = minimumDamage({ name, base, sourceBattle, targetBattle })
    assert.ok(active > normal, `${name} turn condition`)
  }
})

test('shared HP and count facts feed every dependent move calculation', () => {
  for (const [name, base, field, high, low] of [
    ['성묘', physical(50), 'faintedAllies', 5, 0],
    ['분노의주먹', physical(50), 'timesHit', 6, 0],
    ['토해내기', special(null), 'stockpile', 3, 1],
  ]) {
    assert.ok(
      minimumDamage({ name, base, sourceBattle: { [field]: high } }) >
      minimumDamage({ name, base, sourceBattle: { [field]: low } }),
      name,
    )
  }

  for (const [name, base] of [['기사회생', physical(null)], ['바둥바둥', physical(null)]]) {
    assert.ok(
      minimumDamage({ name, base, sourceBattle: { hpPercent: 1 } }) >
      minimumDamage({ name, base, sourceBattle: { hpPercent: 100 } }),
      name,
    )
  }
  for (const [name, base] of [['분화', special(150)], ['해수스파우팅', special(150)]]) {
    assert.ok(
      minimumDamage({ name, base, sourceBattle: { hpPercent: 100 } }) >
      minimumDamage({ name, base, sourceBattle: { hpPercent: 1 } }),
      name,
    )
  }
  assert.ok(
    minimumDamage({ name: '하드프레스', base: physical(0), targetBattle: { hpPercent: 100 } }) >
    minimumDamage({ name: '하드프레스', base: physical(0), targetBattle: { hpPercent: 1 } }),
  )
})

test('automatic item, weight, speed, weather, and terrain facts reach the real calculation', () => {
  const acrobaticsWithItem = minimumDamage({ name: '애크러뱃', base: physical(55), sourceItem: 'いのちのたま' })
  const acrobaticsNoItem = minimumDamage({ name: '애크러뱃', base: physical(55) })
  assert.ok(acrobaticsNoItem > acrobaticsWithItem, 'Acrobatics doubles without an item')

  assert.ok(
    minimumDamage({ name: '헤비봄버', base: physical(null), sourceWeight: 500, targetWeight: 100 }) >
    minimumDamage({ name: '헤비봄버', base: physical(null), sourceWeight: 100, targetWeight: 100 }),
  )
  assert.ok(
    minimumDamage({ name: '히트스탬프', base: physical(null), sourceWeight: 500, targetWeight: 100 }) >
    minimumDamage({ name: '히트스탬프', base: physical(null), sourceWeight: 100, targetWeight: 100 }),
  )
  assert.ok(
    minimumDamage({ name: '일렉트릭볼', base: special(null), sourceSpeed: 400, targetSpeed: 100 }) >
    minimumDamage({ name: '일렉트릭볼', base: special(null), sourceSpeed: 50, targetSpeed: 100 }),
  )
  assert.ok(
    minimumDamage({ name: '자이로볼', base: physical(null), sourceSpeed: 25, targetSpeed: 150 }) >
    minimumDamage({ name: '자이로볼', base: physical(null), sourceSpeed: 150, targetSpeed: 150 }),
  )
  assert.ok(
    minimumDamage({ name: '솔라빔', base: special(120), conditions: { weather: 'none' } }) >
    minimumDamage({ name: '솔라빔', base: special(120), conditions: { weather: 'rain' } }),
  )
  assert.ok(
    minimumDamage({ name: '대지의파동', base: special(50), conditions: { terrain: 'electric' } }) >
    minimumDamage({ name: '대지의파동', base: special(50), conditions: { terrain: 'none' } }),
  )
})

test('contextual null and zero-power attacks pass the Quick support gate', () => {
  for (const name of ['기사회생', '바둥바둥', '토해내기', '일렉트릭볼', '자이로볼', '헤비봄버', '히트스탬프']) {
    assert.equal(quickMoveSupported(name, physical(null)), true, name)
    assert.equal(quickMoveSupported(name, { ...physical(null), variablePower: true }), true, `${name} variable`)
  }
  assert.equal(quickMoveSupported('하드프레스', physical(0)), true)
  for (const name of ['안다리걸기', '풀묶기']) assert.equal(quickMoveSupported(name, physical(null)), true, name)
  assert.equal(quickMoveSupported('집단구타', physical(null)), false, 'Beat Up remains explicitly unsupported')
  assert.equal(quickMoveSupported('미등록가변기', { ...physical(50), variablePower: true }), false)
  assert.equal(quickMoveSupported('칼춤', { type: 'normal', category: 'status', power: 0 }), false)
})

test('positive-stage and status facts are shared per side without losing seven-stage coverage', () => {
  const side = quickBlank()
  side.battle = {
    ...side.battle,
    attackStage: 6,
    spAttackStage: 6,
    defenseStage: 6,
    spDefenseStage: 6,
    accuracyStage: 6,
    evasionStage: 6,
  }
  side.speedStage = 6
  assert.equal(quickPositiveStageTotal(side), 42)
  side.battle.attackStage = -6
  assert.equal(quickPositiveStageTotal(side), 36, 'negative stages never subtract from Stored Power')

  assert.equal(quickStatused(side), false)
  assert.equal(quickStatused({ ...side, battle: { ...side.battle, statused: true } }), true)
  assert.equal(quickStatused({ ...side, battle: { ...side.battle, burned: true } }), true)
  assert.equal(quickStatused({ ...side, battle: { ...side.battle, poisoned: true } }), true)
})

test('HP facts stay canonical and obsolete hidden actual overrides are discarded on hydration', () => {
  assert.deepEqual(quickHpFacts(100), { hpPercent: 100, fullHp: true, lowHp: false })
  assert.deepEqual(quickHpFacts(33), { hpPercent: 33, fullHp: false, lowHp: true })
  assert.deepEqual(quickHpFacts(34), { hpPercent: 34, fullHp: false, lowHp: false })
  assert.deepEqual(quickHpFacts(0), { hpPercent: 1, fullHp: false, lowHp: true })
  assert.deepEqual(quickBlank().battle, { ...quickBlank().battle, hpPercent: 100, fullHp: true, lowHp: false })

  const restored = quickSide({ key: 'garchomp', actual: { attack: '999' }, battle: { hpPercent: 20, fullHp: true, lowHp: false } })
  assert.deepEqual(restored.actual, {})
  assert.deepEqual({ hpPercent: restored.battle.hpPercent, fullHp: restored.battle.fullHp, lowHp: restored.battle.lowHp }, { hpPercent: 20, fullHp: false, lowHp: true })
  const legacy = quickSide({ key: 'garchomp', battle: { fullHp: false, lowHp: false } })
  assert.deepEqual({ hpPercent: legacy.battle.hpPercent, fullHp: legacy.battle.fullHp, lowHp: legacy.battle.lowHp }, { hpPercent: 99, fullHp: false, lowHp: false })
})

test('slot-local condition keys keep both directions, slots, and duplicate moves independent', () => {
  const keys = []
  for (const side of ['attacker', 'defender']) {
    for (let slot = 0; slot < 4; slot++) {
      keys.push(quickMoveConditionKey(side, slot, '스케일샷'))
      keys.push(quickMoveConditionKey(side, slot, '찍찍베기'))
    }
  }
  assert.equal(new Set(keys).size, 16)
  assert.notEqual(quickMoveConditionKey('attacker', 0, '스케일샷'), quickMoveConditionKey('defender', 0, '스케일샷'))
  assert.notEqual(quickMoveConditionKey('attacker', 0, '스케일샷'), quickMoveConditionKey('attacker', 1, '스케일샷'))
  assert.notEqual(quickMoveConditionKey('attacker', 0, '스케일샷'), quickMoveConditionKey('attacker', 0, '찍찍베기'))
  assert.equal(quickMoveConditionKey('attacker', -1, '객기'), 'attacker:0:객기')
  assert.equal(quickMoveConditionKey('defender', 9, '객기'), 'defender:3:객기')

  const attackKey = quickMoveConditionKey('attacker', 0, '스케일샷')
  const defenseKey = quickMoveConditionKey('defender', 0, '스케일샷')
  const hits = quickMoveHits({ [attackKey]: 5, [defenseKey]: 2 })
  assert.deepEqual(hits, { [attackKey]: 5, [defenseKey]: 2 })

  const values = quickMoveValues({
    [quickMoveConditionKey('attacker', 0, '변덕레이저')]: true,
    [quickMoveConditionKey('defender', 0, '변덕레이저')]: false,
  })
  assert.deepEqual(values, {
    [quickMoveConditionKey('attacker', 0, '변덕레이저')]: true,
    [quickMoveConditionKey('defender', 0, '변덕레이저')]: false,
  })
})

test('persisted slot-local values are bounded and malformed entries are discarded', () => {
  const valid = quickMoveConditionKey('attacker', 2, '성묘')
  assert.deepEqual(quickMoveHits(null), {})
  assert.deepEqual(quickMoveHits([]), {})
  assert.deepEqual(quickMoveHits({ [valid]: 0 }), {})
  assert.deepEqual(quickMoveHits({ [valid]: 11 }), {})
  assert.deepEqual(quickMoveHits({ broken: 5, [valid]: '5' }), { [valid]: 5 })

  assert.deepEqual(quickMoveValues(null), {})
  assert.deepEqual(quickMoveValues([]), {})
  assert.deepEqual(quickMoveValues({ broken: true, [valid]: -2 }), { [valid]: 0 })
  assert.deepEqual(quickMoveValues({ [valid]: 1001 }), { [valid]: 999 })
  assert.deepEqual(quickMoveValues({ [valid]: 3.9 }), { [valid]: 3 })

  const first = quickDefaultConditions()
  const second = quickDefaultConditions()
  first.moveHits[valid] = 5
  first.moveValues[valid] = true
  assert.deepEqual(second.moveHits, {})
  assert.deepEqual(second.moveValues, {})
})

test('unknown moves and null metadata remain untouched by the resolver', () => {
  const meta = physical(80)
  assert.equal(applyConditionalMovePower('미등록기술', meta, true), meta)
  assert.equal(applyConditionalMovePower('객기', null, true), null)
  assert.equal(applyTargetWeightMovePower('지진', meta, 200), meta)
})
