import { actualStat } from './statMechanics.ts'
import { applySpeedModifiers, applySpeedStage } from './speedModifiers.ts'
import { getSpeedAbility, speedAbilitiesFor } from './speedAbilities.ts'
import type { SpeedActivation } from './speedAbilities.ts'
import { searchPokemon } from './pokemonSearch.ts'
import type { SpeedAbilitySelection, SpeedLineState } from './speedLineState.ts'

export type SpeedNature = 'boost' | 'neutral' | 'lower'
export type SpeedVariant = 'normal' | 'scarf'
export type SpeedLineOptions = { effort: number; nature: SpeedNature; query: string; forms: 'all' | 'nonMega' | 'mega' }
export type SpeedLineSpecies = { key: string; name_ko: string; name_en: string; name_ja?: string; speed: number; abilities?: readonly string[] }

export function calculateSpeed(base: number, effort: number, nature: SpeedNature): number {
  return actualStat(base, effort, nature === 'boost' ? 1.1 : nature === 'lower' ? 0.9 : 1)
}

function matchingRows<T extends SpeedLineSpecies>(rows: readonly T[], queryText: string, forms: SpeedLineOptions['forms']): T[] {
  const matches = searchPokemon(rows, queryText)
  return matches.filter(row => forms === 'all' || (forms === 'mega') === row.key.startsWith('mega-'))
}

// Legacy normal-only API remains for existing callers.
export function buildSpeedLine<T extends SpeedLineSpecies>(rows: readonly T[], options: SpeedLineOptions) {
  return matchingRows(rows, options.query, options.forms)
    .map(row => ({ row, speed: calculateSpeed(row.speed, options.effort, options.nature) }))
    .sort((a, b) => b.speed - a.speed || a.row.key.localeCompare(b.row.key))
}

export type SpeedRelation = 'faster' | 'equal' | 'slower'
export type SpeedUnavailableReason = 'ability-not-available' | 'item-required-for-mega' | 'unburden-has-item' | 'z-mega-scarf'
export function speedScenarioUnavailable(row: SpeedLineSpecies, variant: SpeedVariant, abilitySlug: SpeedAbilitySelection): SpeedUnavailableReason | null {
  if (variant === 'scarf' && ['mega-absol-z', 'mega-garchomp-z', 'mega-lucario-z'].includes(row.key)) return 'z-mega-scarf'
  if (abilitySlug !== null && !speedAbilitiesFor(row).some(ability => ability.slug === abilitySlug)) return 'ability-not-available'
  if (variant === 'scarf' && abilitySlug === 'unburden') return 'unburden-has-item'
  if (variant === 'scarf' && abilitySlug && row.key.startsWith('mega-')) return 'item-required-for-mega'
  return null
}
export type SpeedComparisonEntry<T extends SpeedLineSpecies> = {
  id: string
  row: T
  variant: SpeedVariant
  actualSpeed: number
  effectiveSpeed: number
  speed: number
  difference: number | null
  relation: SpeedRelation | null
  hypothetical: boolean
  abilitySlug: SpeedAbilitySelection
  activation: SpeedActivation | null
  unavailableReason: SpeedUnavailableReason | null
}

export function buildSpeedScenario<T extends SpeedLineSpecies>(row: T, effort: number, nature: SpeedNature, variant: SpeedVariant, referenceSpeed: number | null = null, abilitySlug: SpeedAbilitySelection = null): SpeedComparisonEntry<T> {
  const actualSpeed = calculateSpeed(row.speed, effort, nature)
  const unavailableReason = speedScenarioUnavailable(row, variant, abilitySlug)
  const ability = getSpeedAbility(abilitySlug)
  const effectiveSpeed = applySpeedModifiers(actualSpeed, { scarf: variant === 'scarf', abilityMultiplier: ability?.multiplier ?? 1 })
  const difference = referenceSpeed === null || unavailableReason !== null ? null : referenceSpeed - effectiveSpeed
  return {
    id: `${row.key}:${variant}${abilitySlug ? `:${abilitySlug}` : ''}`, row, variant, actualSpeed, effectiveSpeed, speed: effectiveSpeed,
    difference, relation: difference === null ? null : difference > 0 ? 'faster' : difference < 0 ? 'slower' : 'equal',
    hypothetical: variant === 'scarf' && row.key.startsWith('mega-'),
    abilitySlug, activation: ability?.activation ?? null, unavailableReason,
  }
}

export function buildSpeedComparison<T extends SpeedLineSpecies>(rows: readonly T[], state: SpeedLineState): {
  reference: { row: T; actualSpeed: number; effectiveSpeed: number; speed: number; abilitySlug: SpeedAbilitySelection } | null
  entries: SpeedComparisonEntry<T>[]
  referenceMissing: boolean
  referenceUnavailableReason: SpeedUnavailableReason | null
} {
  const referenceRow = state.referenceKey === null ? undefined : rows.find(row => row.key === state.referenceKey)
  const referenceAbility = state.referenceAbility ?? null
  const referenceUnavailableReason = referenceRow && referenceAbility !== null && !speedAbilitiesFor(referenceRow).some(a => a.slug === referenceAbility) ? 'ability-not-available' : null
  const reference = referenceRow && !referenceUnavailableReason ? (() => {
    const actualSpeed = calculateSpeed(referenceRow.speed, state.referenceEffort, state.referenceNature)
    const effectiveSpeed = applySpeedModifiers(applySpeedStage(actualSpeed, state.referenceStage ?? 0), { scarf: false, abilityMultiplier: getSpeedAbility(referenceAbility)?.multiplier ?? 1 })
    return { row: referenceRow, actualSpeed, effectiveSpeed, speed: effectiveSpeed, abilitySlug: referenceAbility }
  })() : null
  const referenceMissing = state.referenceKey !== null && !referenceRow
  // Old JS callers without an items property retain their normal-only results.
  const variants: SpeedVariant[] = state.items === 'both' ? ['normal', 'scarf'] : [state.items === 'scarf' ? 'scarf' : 'normal']
  const entries = matchingRows(rows, state.query, state.forms).flatMap(row => variants.flatMap(variant => {
    // The three Z-Mega forms cannot hold a Choice Scarf, even in legacy item mode.
    if (variant === 'scarf' && ['mega-absol-z', 'mega-garchomp-z', 'mega-lucario-z'].includes(row.key)) return []
    const scenarios = [buildSpeedScenario(row, state.listEffort, state.listNature, variant, reference?.speed ?? null)]
    if (state.abilityMode === 'conditions') for (const ability of speedAbilitiesFor(row)) {
      const scenario = buildSpeedScenario(row, state.listEffort, state.listNature, variant, reference?.speed ?? null, ability.slug)
      if (!scenario.unavailableReason) scenarios.push(scenario)
    }
    return scenarios
  })).filter(entry =>
    (state.comparison === 'all' || entry.relation === state.comparison) &&
    (state.rangeMode === 'all' || entry.difference !== null && Math.abs(entry.difference) <= state.gap)
  ).sort((a, b) =>
    (state.sort === 'asc' ? a.effectiveSpeed - b.effectiveSpeed : b.effectiveSpeed - a.effectiveSpeed) ||
    a.row.key.localeCompare(b.row.key) || (a.variant === b.variant ? 0 : a.variant === 'normal' ? -1 : 1) ||
    (a.abilitySlug ?? '').localeCompare(b.abilitySlug ?? '')
  )
  return { reference, entries, referenceMissing, referenceUnavailableReason }
}
