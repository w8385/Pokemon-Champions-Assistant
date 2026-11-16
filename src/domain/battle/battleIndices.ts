import type { MoveMeta, SiteLanguage } from '../../app/types'
import { DAMAGE_MOD_SCALE, chainMods, type BattleStatBlock, type DamageCalcModifiers } from './damageCore'

export function formatBattleIndex(value: number, language: SiteLanguage) {
  const locale = language === 'ja' ? 'ja-JP' : language === 'en' ? 'en-US' : 'ko-KR'
  return Math.round(value).toLocaleString(locale)
}

export function durabilityIndices(stats: BattleStatBlock) {
  return {
    physical: stats.hp * stats.defense,
    special: stats.hp * stats.spDefense,
  }
}

export function decisionPowerIndex(stats: BattleStatBlock, moveMeta: MoveMeta, stab: number, modifiers: DamageCalcModifiers) {
  if (moveMeta.category !== 'physical' && moveMeta.category !== 'special') return null
  const attackStat = moveMeta.usesDefenseAsAttack
    ? stats.defense
    : moveMeta.category === 'physical'
      ? stats.attack
      : stats.spAttack
  const totalPower = moveMeta.hitPowers?.length
    ? moveMeta.hitPowers.reduce((sum, power) => sum + power, 0)
    : (moveMeta.power ?? 0) * Math.max(1, moveMeta.hits ?? 1)
  if (!totalPower) return null
  return Math.round(
    attackStat
    * totalPower
    * stab
    * (modifiers.attackMultiplier ?? 1)
    * (modifiers.powerMultiplier ?? 1)
    * chainMods(modifiers.fixedBpMods ?? []) / DAMAGE_MOD_SCALE
    * (modifiers.finalMultiplier ?? 1)
    * chainMods(modifiers.fixedFinalMods ?? [], 41, 131072) / DAMAGE_MOD_SCALE
    / Math.max(0.01, modifiers.defenseMultiplier ?? 1)
  )
}
