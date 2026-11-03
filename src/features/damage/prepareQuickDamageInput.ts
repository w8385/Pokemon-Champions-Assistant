import type { QuickSide, QuickConditions } from './quickModel'
import type { SharedPoolState, MovePoolState } from './quickPresentation'
import type { SiteLanguage, Row } from '../../app/types'
import type { BattleStatBlock } from '../../domain/battle/damageCore'
import { indexByKey, rows } from '../../adapters/catalog/roster'
import { heldAbilityError } from '../../shared/display/abilityPresentation'
import { resolveFormAbility } from '../../domain/champions/abilityIdentity'
import { abilityDescriptionFor } from '../../adapters/catalog/data'
import { quickStat } from './quickModel'
import { choicesForPool, moveInPool } from '../../domain/champions/sharedLearnsets'
import { resolveMoveMeta } from '../../adapters/catalog/movePresentation'

const statKeys = ['hp', 'attack', 'defense', 'spAttack', 'spDefense'] as const
export const toStats = (side: QuickSide, row: Row): BattleStatBlock | null => {
  const stats = Object.fromEntries(statKeys.map(key => [key, quickStat(side, row, key)])) as Record<typeof statKeys[number], number | null>
  return statKeys.every(key => stats[key] !== null) ? stats as BattleStatBlock : null
}

export type QuickDamageRequest = { source: QuickSide; target: QuickSide; name: string; conditions: QuickConditions; pools: Record<string, SharedPoolState>; language: SiteLanguage }

/** Capture mutable catalog/cache inputs once; no damage modifiers or roll calculation here. */
export function prepareQuickDamageInput({ source, target, name, conditions, pools, language }: QuickDamageRequest) {
  const sourceRow = indexByKey.get(source.key), targetRow = indexByKey.get(target.key)
  const sourceAbilityValid = !heldAbilityError(source.key, source.ability, language)
  const targetAbilityValid = !heldAbilityError(target.key, target.ability, language)
  const sourceAbility = resolveFormAbility(sourceRow, source.ability, abilityDescriptionFor, rows).slug ?? ''
  const targetAbility = resolveFormAbility(targetRow, target.ability, abilityDescriptionFor, rows).slug ?? ''
  const sourceStats = sourceRow ? toStats(source, sourceRow) : null
  const targetStats = targetRow ? toStats(target, targetRow) : null
  const pool = choicesForPool(pools[source.key])
  const poolMap: Record<string, MovePoolState> = { [source.key]: { status: 'ready', moves: pool } }
  const base = moveInPool(name, pool) ? resolveMoveMeta(name, pool, poolMap) : null
  return { source, target, name, conditions, sourceRow, targetRow, sourceStats, targetStats, sourceAbilityValid, targetAbilityValid, sourceAbility, targetAbility, base }
}
export type QuickDamageInput = ReturnType<typeof prepareQuickDamageInput>
