import type { LibraryBuild, PartialLibraryBuild } from './creatorSampleLibrary'
import type { EffortValues } from './myPartyChampionsSamples'
import { EFFORT_KEYS, validCompleteEfforts } from './buildRules.ts'

// Calculation requires all six explicit values, not an importable build or ability.
export function confirmedCreatorEfforts(build: LibraryBuild | null, partial?: PartialLibraryBuild): EffortValues | null {
  const values = build?.evs ?? partial?.evsKnown
  if (!validCompleteEfforts(values)) return null
  return Object.fromEntries(EFFORT_KEYS.map(key => [key, values![key]!])) as EffortValues
}
