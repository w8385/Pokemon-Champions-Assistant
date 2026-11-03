import type { MoveMeta, CalcMode, RivalryMode, DamageWeather, DamageTerrain } from '../../app/types'
import { DAMAGE_MOD_SCALE } from './damageCore.ts'
import { canonicalHeldItem as canonicalChampionsItemName, classifyHeldItem } from '../champions/itemIdentity.ts'
import { effectiveDefenderAbility } from './typeEffectiveness.ts'
import { abilityNoteLabel } from './abilityNoteLabel.ts'
import { alwaysOnAbilityImmunity } from './abilityImmunities.ts'
import { moveMatchesTaggedSet, SOUND_MOVE_NAMES, PUNCH_MOVE_NAMES, RECKLESS_MOVE_NAMES, SHEER_FORCE_MOVE_NAMES, BITE_MOVE_NAMES, PULSE_MOVE_NAMES, SLICING_MOVE_NAMES, CONTACT_MOVE_NAMES } from './moveTags.ts'

export function battleStageMultiplier(stage: number) {
  if (stage > 0) return (2 + stage) / 2
  if (stage < 0) return 2 / (2 + Math.abs(stage))
  return 1
}

export function knockOffPowerMultiplier(moveName: string, defenderKey: string, defenderItem: string): number {
  return moveName === '탁쳐서떨구기' && classifyHeldItem(defenderKey, defenderItem).status === 'allowed' ? 1.5 : 1
}

export function isDamageGrounded(types: string[] | undefined, ability: string, item: string): boolean {
  return Boolean(types?.length && !types.includes('flying') && !['levitate', '부유', 'eelevate'].includes(ability) && item !== 'ふうせん')
}

export function resolveDamageModifiers(params: {
  attackerAbility: string
  attackerAllyAbility?: string
  attackerItem: string
  defenderAbility: string
  defenderItem: string
  defenderKey: string
  moveName: string
  baseMoveType: string | null
  moveType: string | null
  movePower: number | null
  moveMeta?: MoveMeta | null
  mode: CalcMode
  effectiveness: number
  attackStage: number
  defenseStage: number
  attackerTypes?: string[]
  defenderTypes: string[]
  format?: 'Singles' | 'Doubles'
  burned: boolean
  attackerLowHp: boolean
  targetPoisoned: boolean
  defenderFullHp: boolean
  movedAfterTarget: boolean
  faintedAllies: number
  rivalryMode: RivalryMode
  parentalBond: boolean
  defenderStatused: boolean
  electromorphosisCharged: boolean
  weather: DamageWeather
  terrain: DamageTerrain
  reflect: boolean
  lightScreen: boolean
  auroraVeil: boolean
  friendGuard: boolean
  disguiseActive?: boolean
  critical?: boolean
}) {
  const { attackerAbility, attackerAllyAbility = '', attackerItem, defenderAbility: recordedDefenderAbility, defenderKey, defenderItem, moveName, moveMeta, baseMoveType, moveType, movePower, mode, effectiveness, attackStage, defenseStage, attackerTypes, defenderTypes, format = 'Singles', burned, attackerLowHp, targetPoisoned, defenderFullHp, movedAfterTarget, faintedAllies, rivalryMode, parentalBond, defenderStatused, electromorphosisCharged, weather, terrain, reflect, lightScreen, auroraVeil, friendGuard, disguiseActive, critical } = params
  const defenderAbility = effectiveDefenderAbility(attackerAbility, recordedDefenderAbility)
  const canonicalAttackerItem = canonicalChampionsItemName(attackerItem)
  const canonicalDefenderItem = canonicalChampionsItemName(defenderItem)
  const attackerIgnoresDefenseStage = attackerAbility === 'unaware'
  const defenderIgnoresAttackStage = defenderAbility === 'unaware'
  const wantsCritical = Boolean(critical || moveMeta?.alwaysCrit || (attackerAbility === 'merciless' && targetPoisoned))
  const criticalBlocked = wantsCritical && ['battle-armor', 'shell-armor'].includes(defenderAbility)
  const effectiveCritical = wantsCritical && !criticalBlocked
  const effectiveAttackStage = defenderIgnoresAttackStage ? 0 : effectiveCritical && attackStage < 0 ? 0 : attackStage
  const effectiveDefenseStage = attackerIgnoresDefenseStage ? 0 : effectiveCritical && defenseStage > 0 ? 0 : defenseStage
  let attackMultiplier = battleStageMultiplier(effectiveAttackStage)
  let defenseMultiplier = battleStageMultiplier(effectiveDefenseStage)
  let powerMultiplier = 1
  const fixedBpMods: number[] = []
  const knockOffMultiplier = knockOffPowerMultiplier(moveName, defenderKey, defenderItem)
  powerMultiplier *= knockOffMultiplier
  let finalMultiplier = 1
  const fixedFinalMods: number[] = []
  let weatherMod: number | undefined
  let adjustedEffectiveness = effectiveness
  const notes: string[] = []
  if (knockOffMultiplier > 1) notes.push('탁쳐서떨구기(상대 도구)')
  let incomingScreenName: string | null = null
  const offensiveWeather: DamageWeather = attackerAbility === 'mega-sol' ? 'sun' : weather

  const typeBoostItems: Partial<Record<string, string>> = {
    'きせきのタネ': 'grass',
    'くろいメガネ': 'dark',
    'くろおび': 'fighting',
    'じしゃく': 'electric',
    'シルクのスカーフ': 'normal',
    'しんぴのしずく': 'water',
    'するどいくちばし': 'flying',
    'どくバリ': 'poison',
    'とけないこおり': 'ice',
    'のろいのおふだ': 'ghost',
    'まがったスプーン': 'psychic',
    'メタルコート': 'steel',
    'もくたん': 'fire',
    'やわらかいすな': 'ground',
    'ようせいのハネ': 'fairy',
    'りゅうのキバ': 'dragon',
  }

  if (effectiveAttackStage) notes.push(`공격 ${effectiveAttackStage > 0 ? '+' : ''}${effectiveAttackStage}`)
  if (effectiveDefenseStage) notes.push(`방어 ${effectiveDefenseStage > 0 ? '+' : ''}${effectiveDefenseStage}`)
  if (defenderIgnoresAttackStage && attackStage) notes.push(`${abilityNoteLabel(defenderAbility)}(공랭 무시)`)
  if (attackerIgnoresDefenseStage && defenseStage) notes.push(`${abilityNoteLabel(attackerAbility)}(방랭 무시)`)
  if (effectiveCritical && attackStage < 0) notes.push('급소(공깎 무시)')
  if (effectiveCritical && defenseStage > 0) notes.push('급소(방증 무시)')

  const burnApplies = burned && mode === 'physical' && moveName !== '객기' && attackerAbility !== 'guts' && attackerAbility !== '근성' && attackerAbility !== 'water-bubble'
  if (burnApplies) notes.push('화상')

  if (effectiveCritical) notes.push(attackerAbility === 'merciless' && targetPoisoned && !critical && !moveMeta?.alwaysCrit ? `${abilityNoteLabel(attackerAbility)}(급소)` : '급소')
  if (criticalBlocked) notes.push(`${abilityNoteLabel(defenderAbility)}(급소 방지)`)

  if (mode === 'physical' && (attackerAbility === 'huge-power' || attackerAbility === 'pure-power')) {
    attackMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (mode === 'physical' && attackerAbility === 'hustle') {
    attackMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (offensiveWeather === 'sun' && mode === 'special' && attackerAbility === 'solar-power') {
    attackMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'electromorphosis' && electromorphosisCharged && moveType === 'electric') {
    powerMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerLowHp) {
    if (moveType === 'fire' && attackerAbility === 'blaze') {
      powerMultiplier *= 1.5
      notes.push(abilityNoteLabel(attackerAbility))
    }
    if (moveType === 'water' && attackerAbility === 'torrent') {
      powerMultiplier *= 1.5
      notes.push(abilityNoteLabel(attackerAbility))
    }
    if (moveType === 'grass' && attackerAbility === 'overgrow') {
      powerMultiplier *= 1.5
      notes.push(abilityNoteLabel(attackerAbility))
    }
    if (moveType === 'bug' && attackerAbility === 'swarm') {
      powerMultiplier *= 1.5
      notes.push(abilityNoteLabel(attackerAbility))
    }
  }

  if (offensiveWeather === 'sand' && moveType && ['rock', 'ground', 'steel'].includes(moveType) && attackerAbility === 'sand-force') {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'water' && attackerAbility === 'water-bubble') {
    powerMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (baseMoveType === 'normal' && moveType && moveType !== 'normal' && ['aerilate', 'pixilate', 'refrigerate', 'dragonize'].includes(attackerAbility)) {
    powerMultiplier *= 1.2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'liquid-voice' && moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES) && moveType === 'water') {
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'punk-rock' && moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES)) {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'iron-fist' && moveMatchesTaggedSet(moveName, PUNCH_MOVE_NAMES)) {
    powerMultiplier *= 1.2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'reckless' && moveMatchesTaggedSet(moveName, RECKLESS_MOVE_NAMES)) {
    powerMultiplier *= 1.2
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'sheer-force' && moveMatchesTaggedSet(moveName, SHEER_FORCE_MOVE_NAMES)) {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'analytic' && movedAfterTarget) {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'supreme-overlord' && faintedAllies > 0) {
    finalMultiplier *= 1 + Math.min(5, Math.max(0, faintedAllies)) * 0.1
    notes.push(`${abilityNoteLabel(attackerAbility)} x${Math.min(5, Math.max(0, faintedAllies))}`)
  }

  if (attackerAbility === 'skill-link' && ['드래곤애로', '스케일샷', '트리플악셀'].includes(moveName)) {
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'rivalry') {
    if (rivalryMode === 'same') {
      finalMultiplier *= 1.25
      notes.push(abilityNoteLabel(attackerAbility))
    } else if (rivalryMode === 'opposite') {
      finalMultiplier *= 0.75
      notes.push(`${abilityNoteLabel(attackerAbility)}↓`)
    }
  }

  if (attackerAbility === 'parental-bond' && parentalBond) {
    finalMultiplier *= 1.25
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (mode === 'special' && ['plus', 'minus', '플러스', '마이너스'].includes(attackerAbility) && ['plus', 'minus', '플러스', '마이너스'].includes(attackerAllyAbility)) {
    attackMultiplier *= 1.5
    notes.push(`${abilityNoteLabel(attackerAbility)}+${abilityNoteLabel(attackerAllyAbility)}`)
  }

  if (attackerAbility === 'strong-jaw' && moveMatchesTaggedSet(moveName, BITE_MOVE_NAMES)) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'mega-launcher' && moveMatchesTaggedSet(moveName, PULSE_MOVE_NAMES)) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'sharpness' && moveMatchesTaggedSet(moveName, SLICING_MOVE_NAMES)) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (attackerAbility === 'tough-claws' && moveMatchesTaggedSet(moveName, CONTACT_MOVE_NAMES)) {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'dragon' && attackerAbility === 'dragons-maw') {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'fire' && attackerAbility === 'fire-mane') {
    attackMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'electric' && attackerAbility === 'transistor') {
    powerMultiplier *= 1.3
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'steel' && (attackerAbility === 'steelworker' || attackerAbility === 'steely-spirit')) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (moveType === 'fairy' && (attackerAbility === 'fairy-aura' || defenderAbility === 'fairy-aura')) {
    powerMultiplier *= 4 / 3
    notes.push(abilityNoteLabel('fairy-aura'))
  }

  if (moveType === 'dark' && (attackerAbility === 'dark-aura' || defenderAbility === 'dark-aura')) {
    powerMultiplier *= 4 / 3
    notes.push(abilityNoteLabel('dark-aura'))
  }

  if (canonicalAttackerItem && moveType && typeBoostItems[canonicalAttackerItem] === moveType) {
    finalMultiplier *= 1.2
    notes.push(canonicalAttackerItem)
  }

  if (canonicalAttackerItem === 'いのちのたま') {
    finalMultiplier *= 1.3
    notes.push('생명의구슬')
  }
  if (canonicalAttackerItem === 'たつじんのおび' && adjustedEffectiveness > 1) {
    fixedFinalMods.push(4915)
    notes.push('달인의띠')
  }

  if (canonicalAttackerItem === 'ノーマルジュエル' && moveType === 'normal') {
    finalMultiplier *= 1.3
    notes.push('노말주얼')
  }

  if (offensiveWeather === 'sun') {
    if (moveType === 'fire') {
      weatherMod = 6144
      notes.push(attackerAbility === 'mega-sol' ? `${abilityNoteLabel(attackerAbility)}(쾌청)` : '쾌청')
    } else if (moveType === 'water') {
      weatherMod = 2048
      notes.push(attackerAbility === 'mega-sol' ? `${abilityNoteLabel(attackerAbility)}(쾌청)` : '쾌청')
    }
  }

  if (offensiveWeather === 'rain') {
    if (moveType === 'water') {
      weatherMod = 6144
      notes.push('비')
    } else if (moveType === 'fire') {
      weatherMod = 2048
      notes.push('비')
    }
  }

  if (weather === 'sand' && mode === 'special' && defenderTypes.includes('rock')) {
    defenseMultiplier *= 1.5
    notes.push('모래바람')
  }

  if (terrain === 'electric' && moveType === 'electric' && isDamageGrounded(attackerTypes, attackerAbility, canonicalAttackerItem)) {
    fixedBpMods.push(5325)
    notes.push('일렉트릭필드')
  }
  if (terrain === 'grassy' && moveType === 'grass' && isDamageGrounded(attackerTypes, attackerAbility, canonicalAttackerItem)) {
    fixedBpMods.push(5325)
    notes.push('그래스필드')
  }
  if (terrain === 'psychic' && moveType === 'psychic' && isDamageGrounded(attackerTypes, attackerAbility, canonicalAttackerItem)) {
    fixedBpMods.push(5325)
    notes.push('사이코필드')
  }
  if (terrain === 'misty' && moveType === 'dragon' && isDamageGrounded(defenderTypes, defenderAbility, canonicalDefenderItem)) {
    fixedBpMods.push(2048)
    notes.push('미스트필드')
  }
  if (terrain === 'grassy' && ['지진', '땅고르기'].includes(moveName) && isDamageGrounded(defenderTypes, defenderAbility, canonicalDefenderItem)) {
    fixedBpMods.push(2048)
    notes.push('그래스필드(지면)')
  }
  if (adjustedEffectiveness > 0 && moveType === 'fire' && defenderAbility === 'dry-skin') {
    fixedBpMods.push(5120)
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'ground' && (alwaysOnAbilityImmunity('ground', defenderAbility) && defenderAbility !== 'earth-eater')) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility === 'eelevate' ? defenderAbility : 'levitate'))
  }

  if (moveType === 'ground' && canonicalDefenderItem === 'ふうせん') {
    adjustedEffectiveness = 0
    notes.push('풍선')
  }

  if (moveType === 'water' && alwaysOnAbilityImmunity('water', defenderAbility)) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'fire' && alwaysOnAbilityImmunity('fire', defenderAbility)) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'electric' && alwaysOnAbilityImmunity('electric', defenderAbility)) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'grass' && alwaysOnAbilityImmunity('grass', defenderAbility)) {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES) && defenderAbility === 'soundproof') {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 0 && defenderAbility === 'punk-rock' && moveMatchesTaggedSet(moveName, SOUND_MOVE_NAMES)) {
    finalMultiplier *= 0.5
    notes.push(`${abilityNoteLabel(defenderAbility)}(소리 반감)`)
  }

  if (moveType === 'ground' && alwaysOnAbilityImmunity('ground', defenderAbility) && defenderAbility === 'earth-eater') {
    adjustedEffectiveness = 0
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (moveType === 'ground' && alwaysOnAbilityImmunity('ground', defenderAbility) && defenderAbility === '부유') {
    adjustedEffectiveness = 0
    notes.push('부유')
  }

  if (adjustedEffectiveness > 0 && (moveType === 'fire' || moveType === 'ice') && defenderAbility === 'thick-fat') {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 0 && moveType === 'fire' && defenderAbility === 'heatproof') {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 0 && defenderAbility === 'fluffy') {
    if (moveMatchesTaggedSet(moveName, CONTACT_MOVE_NAMES)) {
      finalMultiplier *= 0.5
      notes.push(`${abilityNoteLabel(defenderAbility)}(접촉 반감)`)
    }
    if (moveType === 'fire') {
      finalMultiplier *= 2
      notes.push(`${abilityNoteLabel(defenderAbility)}(불꽃 약점)`)
    }
  }

  if (adjustedEffectiveness > 0 && defenderAbility === 'aura-guard' && moveMatchesTaggedSet(moveName, CONTACT_MOVE_NAMES)) {
    finalMultiplier *= 0.5
    notes.push(`${abilityNoteLabel(defenderAbility)}(접촉 반감)`)
  }

  if (adjustedEffectiveness > 0 && moveType === 'ghost' && defenderAbility === 'purifying-salt') {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 1) {
    if (['filter', 'solid-rock', 'prism-armor'].includes(defenderAbility)) {
      finalMultiplier *= 0.75
      notes.push(abilityNoteLabel(defenderAbility))
    }
    if (canonicalDefenderItem === 'オッカのみ' && moveType === 'fire') {
      finalMultiplier *= 0.5
      notes.push('オッカのみ')
    }
    if (canonicalDefenderItem === 'ヤチェのみ' && moveType === 'ice') {
      finalMultiplier *= 0.5
      notes.push('ヤチェのみ')
    }
    if (canonicalDefenderItem === 'ロゼルのみ' && moveType === 'fairy') {
      finalMultiplier *= 0.5
      notes.push('ロゼルのみ')
    }
  }

  if (weather === 'snow' && mode === 'physical' && defenderTypes.includes('ice')) {
    defenseMultiplier *= 1.5
    notes.push('싸라기눈')
  }

  if (mode === 'physical' && ((terrain === 'electric' && canonicalDefenderItem === 'エレキシード') || (terrain === 'grassy' && canonicalDefenderItem === 'グラスシード'))) {
    defenseMultiplier *= 1.5
    notes.push(canonicalDefenderItem === 'エレキシード' ? '일렉트릭시드' : '그래스시드')
  }

  if (mode === 'special' && ((terrain === 'psychic' && canonicalDefenderItem === 'サイコシード') || (terrain === 'misty' && canonicalDefenderItem === 'ミストシード'))) {
    defenseMultiplier *= 1.5
    notes.push(canonicalDefenderItem === 'サイコシード' ? '사이코시드' : '미스트시드')
  }

  if (mode === 'physical' && defenderAbility === 'fur-coat') {
    defenseMultiplier *= 2
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'physical' && terrain === 'grassy' && defenderAbility === 'grass-pelt') {
    defenseMultiplier *= 1.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'physical' && defenderAbility === 'marvel-scale' && defenderStatused) {
    defenseMultiplier *= 1.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (adjustedEffectiveness > 0 && friendGuard) {
    finalMultiplier *= 0.75
    notes.push('프렌드가드')
  }

  const defenderHasActiveDisguise = Boolean(disguiseActive && (defenderAbility === 'disguise' || defenderAbility === '탈'))
  if (adjustedEffectiveness > 0 && defenderHasActiveDisguise) {
    notes.push(`${abilityNoteLabel(defenderAbility)}(첫타 무효)`)
  }

  if (adjustedEffectiveness > 0 && defenderFullHp && (defenderAbility === 'multiscale' || defenderAbility === 'shadow-shield')) {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'special' && defenderAbility === 'ice-scales') {
    finalMultiplier *= 0.5
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'physical' && defenderAbility === 'tablets-of-ruin') {
    attackMultiplier *= 0.75
    notes.push('패도의목간')
  }

  if (mode === 'special' && defenderAbility === 'vessel-of-ruin') {
    attackMultiplier *= 0.75
    notes.push(abilityNoteLabel(defenderAbility))
  }

  if (mode === 'physical' && attackerAbility === 'sword-of-ruin') {
    defenseMultiplier *= 0.75
    notes.push(abilityNoteLabel(attackerAbility))
  }

  if (mode === 'special' && attackerAbility === 'beads-of-ruin') {
    defenseMultiplier *= 0.75
    notes.push(abilityNoteLabel(attackerAbility))
  }

  // Brick Break/Psychic Fangs remove screens before their own hit; Infiltrator
  // passes through without removing them. Neither mutates saved battle state.
  const ignoresScreens = moveName === '깨트리다' || moveName === '사이코팽' || attackerAbility === 'infiltrator'
  const screenApplies = !effectiveCritical && !ignoresScreens && (auroraVeil || (mode === 'physical' ? reflect : lightScreen))
  if (screenApplies) {
    fixedFinalMods.push(format === 'Doubles' ? 2732 : 2048)
    incomingScreenName = auroraVeil ? '오로라베일' : mode === 'physical' ? '리플렉터' : '빛의장막'
    notes.push(incomingScreenName)
  }

  if (attackerAbility === '테크니션' && typeof movePower === 'number' && movePower <= 60) {
    powerMultiplier *= 1.5
    notes.push('테크니션')
  }
  if (attackerAbility === 'technician' && typeof movePower === 'number' && movePower <= 60) {
    powerMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }
  if (attackerAbility === 'tinted-lens' && adjustedEffectiveness > 0 && adjustedEffectiveness < 1) {
    finalMultiplier *= 2
    notes.push(abilityNoteLabel(attackerAbility))
  }
  if (attackerAbility === 'neuroforce' && adjustedEffectiveness > 1) {
    finalMultiplier *= 1.25
    notes.push(abilityNoteLabel(attackerAbility))
  }
  if (attackerAbility === 'sniper' && effectiveCritical) {
    finalMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }
  if (attackerAbility === 'guts' && burned && mode === 'physical') {
    attackMultiplier *= 1.5
    notes.push(abilityNoteLabel(attackerAbility))
  }
  return {
    attackMultiplier,
    defenseMultiplier,
    powerMultiplier,
    fixedBpMods,
    finalMultiplier,
    fixedFinalMods,
    spreadMod: undefined as number | undefined,
    weatherMod,
    incomingScreenName,
    effectiveness: adjustedEffectiveness,
    critical: effectiveCritical,
    burned: burnApplies,
    ignoreFirstHitDamage: defenderHasActiveDisguise,
    notes,
  }
}
