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
import { battleFormRow, type AegislashForm } from '../../domain/battle/statProjection'

const statKeys = ['hp', 'attack', 'defense', 'spAttack', 'spDefense'] as const
export const toStats = (side: QuickSide, row: Row): BattleStatBlock | null => {
  const stats = Object.fromEntries(statKeys.map(key => [key, quickStat(side, row, key)])) as Record<typeof statKeys[number], number | null>
  return statKeys.every(key => stats[key] !== null) ? stats as BattleStatBlock : null
}

export function formStats(side: QuickSide, row: Row, ability: string, form: AegislashForm, neededStat: 'attack' | 'spAttack' | 'defense' | null = 'attack'): BattleStatBlock | null {
  if (row.key !== 'aegislash' || ability !== 'stance-change') return toStats(side, row)
  const projected = battleFormRow(row, ability, form)
  const basis = side.actualForm ?? 'shield'
  // A consumed stat must be known even when the selected form matches its recorded basis.
  // A directly supplied actual is usable only for that same form.
  if (neededStat && (basis !== form || side.actual[neededStat] === undefined)) {
    const unknownInvestment = (neededStat === 'attack' || neededStat === 'spAttack') && side.knownOffense?.[neededStat] === false
    const unknownNature = !side.speedNatureKnown && side.statNatureMultipliers[neededStat] === undefined
    if (unknownInvestment || unknownNature) return null
  }
  const stats = Object.fromEntries(statKeys.map(key => {
    if (key === 'hp' || basis === form) return [key, quickStat(side, projected, key)]
    // Cross-form actual values are not transferable; unused fields do not establish known investment.
    return [key, quickStat({ ...side, actual: {} }, projected, key)]
  })) as Record<typeof statKeys[number], number | null>
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
  const pool = choicesForPool(pools[source.key])
  const poolMap: Record<string, MovePoolState> = { [source.key]: { status: 'ready', moves: pool } }
  const base = moveInPool(name, pool) ? resolveMoveMeta(name, pool, poolMap) : null
  const sourceForm: AegislashForm = sourceRow?.key === 'aegislash' && sourceAbilityValid && sourceAbility === 'stance-change' && (base?.category === 'physical' || base?.category === 'special') ? 'blade' : 'shield'
  const targetForm: AegislashForm = target.hitForm === 'blade' ? 'blade' : 'shield'
  // The damage core consumes one offensive stat; other projected fields are not evidence of known investment.
  const sourceStat = name === '속임수' ? null : base?.usesDefenseAsAttack ? 'defense' : base?.category === 'special' ? 'spAttack' : 'attack'
  const sourceStats = sourceRow ? formStats(source, sourceRow, sourceAbilityValid ? sourceAbility : '', sourceForm, sourceStat) : null
  const targetStats = targetRow ? formStats(target, targetRow, targetAbilityValid ? targetAbility : '', targetForm, name === '속임수' ? 'attack' : null) : null
  return { source, target, name, conditions, sourceRow, targetRow, sourceStats, targetStats, sourceForm, targetForm, sourceAbilityValid, targetAbilityValid, sourceAbility, targetAbility, base }
}
export type QuickDamageInput = ReturnType<typeof prepareQuickDamageInput>
