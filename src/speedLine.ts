import { actualStat } from './statMechanics.ts'
import type { SpeedLineState } from './speedLineState.ts'

export type SpeedNature = 'boost' | 'neutral' | 'lower'
export type SpeedLineOptions = { effort: number; nature: SpeedNature; query: string; forms: 'all' | 'nonMega' | 'mega' }
export type SpeedLineSpecies = { key: string; name_ko: string; name_en: string; name_ja?: string; speed: number }

export function calculateSpeed(base: number, effort: number, nature: SpeedNature): number {
  return actualStat(base, effort, nature === 'boost' ? 1.1 : nature === 'lower' ? 0.9 : 1)
}

function matchingRows<T extends SpeedLineSpecies>(rows: readonly T[], queryText: string, forms: SpeedLineOptions['forms']): T[] {
  const query = queryText.trim().toLocaleLowerCase()
  return rows.filter((row) => {
    const mega = row.key.startsWith('mega-')
    return (forms === 'all' || (forms === 'mega') === mega) &&
      (!query || [row.key, row.name_ko, row.name_en, row.name_ja].some((name) => name?.toLocaleLowerCase().includes(query)))
  })
}

export function buildSpeedLine<T extends SpeedLineSpecies>(rows: readonly T[], options: SpeedLineOptions) {
  return matchingRows(rows, options.query, options.forms)
    .map((row) => ({ row, speed: calculateSpeed(row.speed, options.effort, options.nature) }))
    .sort((a, b) => b.speed - a.speed || a.row.key.localeCompare(b.row.key))
}

export type SpeedRelation = 'faster' | 'equal' | 'slower'
export type SpeedComparisonEntry<T extends SpeedLineSpecies> = {
  row: T; speed: number; difference: number | null; relation: SpeedRelation | null
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
  const entries = matchingRows(rows, state.query, state.forms).map((row): SpeedComparisonEntry<T> => {
    const speed = calculateSpeed(row.speed, state.listEffort, state.listNature)
    const difference = reference === null ? null : reference.speed - speed
    const relation = difference === null ? null : difference > 0 ? 'faster' : difference < 0 ? 'slower' : 'equal'
    return { row, speed, difference, relation }
  }).filter(entry =>
    (state.comparison === 'all' || entry.relation === state.comparison) &&
    (state.rangeMode === 'all' || entry.difference !== null && Math.abs(entry.difference) <= state.gap)
  ).sort((a, b) =>
    (state.sort === 'asc' ? a.speed - b.speed : b.speed - a.speed) || a.row.key.localeCompare(b.row.key)
  )
  return { reference, entries, referenceMissing }
}
