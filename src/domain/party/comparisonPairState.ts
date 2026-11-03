import type { ComparisonSeed } from './unifiedComparisonAdapter'

type PairSide = ComparisonSeed & { actual: Partial<Record<'hp' | 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed', string>> }

export const pairTarget = (slot: number, side: Pick<ComparisonSeed, 'key'>) => JSON.stringify([slot, side.key])

// Restore matchup-only values from the registered seed; retain the editable build.
export function resetPairAssumptions<T extends PairSide>(side: T, seed: ComparisonSeed, dirty: ReadonlySet<string>): T {
  const changedSpecies = side.key !== seed.key
  return {
    ...side,
    actual: {},
    battle: { ...seed.battle },
    speedStage: changedSpecies ? 0 : seed.speedStage,
    speedNatureKnown: dirty.has('nature') || changedSpecies ? true : seed.speedNatureKnown,
    speedNatureMultiplier: changedSpecies ? 1 : seed.speedNatureMultiplier,
    statNatureMultipliers: dirty.has('nature') || changedSpecies ? {} : { ...seed.statNatureMultipliers },
    speedScarfOverride: changedSpecies ? null : seed.speedScarfOverride,
    speedAbilityActive: false,
    knownOffense: changedSpecies ? { attack: false, spAttack: false } : seed.knownOffense,
  } as T
}
