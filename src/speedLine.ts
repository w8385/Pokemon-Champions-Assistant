import { actualStat } from './statMechanics.ts'
import { applyChoiceScarf } from './speedModifiers.ts'
import { searchPokemon } from './pokemonSearch.ts'
import type { SpeedLineState } from './speedLineState.ts'

export type SpeedNature = 'boost' | 'neutral' | 'lower'
export type SpeedVariant = 'normal' | 'scarf'
export type SpeedLineOptions = { effort: number; nature: SpeedNature; query: string; forms: 'all' | 'nonMega' | 'mega' }
export type SpeedLineSpecies = { key: string; name_ko: string; name_en: string; name_ja?: string; speed: number }

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
}

export function buildSpeedScenario<T extends SpeedLineSpecies>(row: T, effort: number, nature: SpeedNature, variant: SpeedVariant, referenceSpeed: number | null = null): SpeedComparisonEntry<T> {
  const actualSpeed = calculateSpeed(row.speed, effort, nature)
  const effectiveSpeed = variant === 'scarf' ? applyChoiceScarf(actualSpeed) : actualSpeed
  const difference = referenceSpeed === null ? null : referenceSpeed - effectiveSpeed
  return {
    id: `${row.key}:${variant}`, row, variant, actualSpeed, effectiveSpeed, speed: effectiveSpeed,
    difference, relation: difference === null ? null : difference > 0 ? 'faster' : difference < 0 ? 'slower' : 'equal',
    hypothetical: variant === 'scarf' && row.key.startsWith('mega-'),
  }
}

export function buildSpeedComparison<T extends SpeedLineSpecies>(rows: readonly T[], state: SpeedLineState): {
  reference: { row: T; speed: number } | null
  entries: SpeedComparisonEntry<T>[]
  referenceMissing: boolean
} {
  const referenceRow = state.referenceKey === null ? undefined : rows.find(row => row.key === state.referenceKey)
  const reference = referenceRow ? {
    row: referenceRow,
    speed: calculateSpeed(referenceRow.speed, state.referenceEffort, state.referenceNature),
  } : null
  const referenceMissing = state.referenceKey !== null && reference === null
  // Old JS callers without an items property retain their normal-only results.
  const variants: SpeedVariant[] = state.items === 'both' ? ['normal', 'scarf'] : [state.items === 'scarf' ? 'scarf' : 'normal']
  const entries = matchingRows(rows, state.query, state.forms).flatMap(row => variants.map(variant =>
    buildSpeedScenario(row, state.listEffort, state.listNature, variant, reference?.speed ?? null)
  )).filter(entry =>
    (state.comparison === 'all' || entry.relation === state.comparison) &&
    (state.rangeMode === 'all' || entry.difference !== null && Math.abs(entry.difference) <= state.gap)
  ).sort((a, b) =>
    (state.sort === 'asc' ? a.effectiveSpeed - b.effectiveSpeed : b.effectiveSpeed - a.effectiveSpeed) ||
    a.row.key.localeCompare(b.row.key) || (a.variant === b.variant ? 0 : a.variant === 'normal' ? -1 : 1)
  )
  return { reference, entries, referenceMissing }
}
