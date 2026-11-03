import type { Row, PartyMember, OpponentState } from '../../app/types'
import type { BattleStatBlock } from './damageCore.ts'
import { actualStat } from '../champions/statMechanics.ts'
import { natureMultiplier } from '../champions/buildRules.ts'
import { applySpeedStage, applyChoiceScarf } from './speed/speedModifiers.ts'
import { canonicalHeldItem as canonicalChampionsItemName } from '../champions/itemIdentity.ts'

export function opponentSpeedValue(row: Row, entry: Pick<OpponentState, 'speedEv' | 'natureBoost' | 'scarf' | 'speedStage' | 'item'>) {
  let value = actualStat(row.speed, entry.speedEv, entry.natureBoost ? natureMultiplier('jolly', 'speed') : 1)
  value = applySpeedStage(value, entry.speedStage)
  if (entry.scarf || isChoiceScarfItem(entry.item)) value = applyChoiceScarf(value)
  return value
}

export function partySpeedValue(row: Row, member: PartyMember) {
  let value = actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  value = applySpeedStage(value, member.config.speedStage)
  if (isChoiceScarfItem(member.item)) value = applyChoiceScarf(value)
  return value
}

export function buildPartyBattleStats(row: Row, member: PartyMember): BattleStatBlock {
  return {
    hp: actualStat(row.hp, member.evs.hp, 1, true),
    attack: actualStat(row.attack, member.evs.attack, natureMultiplier(member.config.nature, 'attack')),
    defense: actualStat(row.defense, member.evs.defense, natureMultiplier(member.config.nature, 'defense')),
    spAttack: actualStat(row.spAttack, member.evs.spAttack, natureMultiplier(member.config.nature, 'spAttack')),
    spDefense: actualStat(row.spDefense, member.evs.spDefense, natureMultiplier(member.config.nature, 'spDefense')),
  }
}

export function buildOpponentBattleStats(row: Row, bulkConfig: OpponentBulkState, offenseConfig?: OpponentOffenseState): BattleStatBlock {
  return {
    hp: actualStat(row.hp, bulkConfig.hpEv, 1, true),
    attack: actualStat(row.attack, offenseConfig?.attackEv ?? 0, offenseConfig?.attackNature ?? 1),
    defense: actualStat(row.defense, bulkConfig.defenseEv, bulkConfig.defenseNature),
    spAttack: actualStat(row.spAttack, offenseConfig?.spAttackEv ?? 0, offenseConfig?.spAttackNature ?? 1),
    spDefense: actualStat(row.spDefense, bulkConfig.spDefenseEv, bulkConfig.spDefenseNature),
  }
}

export function attackingFormRow(row: Row, ability: string): Row {
  if (ability !== 'stance-change' || row.key !== 'aegislash') return row
  return { ...row, attack: 140, spAttack: 140 }
}

export type OpponentBulkState = {
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  defenseNature: number
  spDefenseNature: number
}

export type OpponentOffenseState = {
  attackEv: number
  spAttackEv: number
  attackNature: number
  spAttackNature: number
}

export function isChoiceScarfItem(item: string) {
  return canonicalChampionsItemName(item).trim() === 'こだわりスカーフ'
}
