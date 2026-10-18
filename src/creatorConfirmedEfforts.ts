import type { LibraryBuild, PartialLibraryBuild } from './creatorSampleLibrary'
import type { EffortValues } from './myPartyChampionsSamples'

const keys = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const

// Calculation requires all six explicit values, not an importable build or ability.
export function confirmedCreatorEfforts(build: LibraryBuild | null, partial?: PartialLibraryBuild): EffortValues | null {
  const values = build?.evs ?? partial?.evsKnown
  if (!values || !keys.every(key => Number.isInteger(values[key]) && values[key]! >= 0 && values[key]! <= 32)) return null
  if (keys.reduce((total, key) => total + values[key]!, 0) > 66) return null
  return Object.fromEntries(keys.map(key => [key, values[key]!])) as EffortValues
}
