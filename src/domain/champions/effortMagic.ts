import { CHAMPIONS_EFFORT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP } from './buildRules.ts'
import type { EffortStatKey, NatureId, Row } from '../../app/types.ts'
import type { EffortValues } from '../samples/myPartyChampionsSamples.ts'
import { natureAxes } from './natureProjection.ts'
import { actualStat } from './statMechanics.ts'
import { natureMultiplier } from './buildRules.ts'

export type MagicEffortCandidate = Readonly<{
  stat: EffortStatKey
  reached: boolean
  currentActual: number
  currentEffort: number
  nextEffort: number | null
  nextActual: number | null
}>

// A magic point belongs only to the stat raised by a complete named nature.
// Checkpoints and recorded actual-stat overrides are separate from predictions.
export function magicEffortCandidate(boostedStat: EffortStatKey | null, evs: EffortValues, actualAtEffort: (effort: number) => number): MagicEffortCandidate | null {
  if (!boostedStat) return null
  const currentEffort = evs[boostedStat]
  const currentActual = actualAtEffort(currentEffort)
  const reached = currentActual % 11 === 0
  const cap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_CAP - (Object.values(evs).reduce((sum, effort) => sum + effort, 0) - currentEffort))
  let nextEffort: number | null = reached ? currentEffort : null
  for (let effort = currentEffort; !reached && effort <= cap; effort += 1) {
    if (actualAtEffort(effort) % 11 === 0) { nextEffort = effort; break }
  }
  return { stat: boostedStat, reached, currentActual, currentEffort, nextEffort, nextActual: nextEffort === null ? null : actualAtEffort(nextEffort) }
}

export function magicEffortMarkers(boostedStat: EffortStatKey | null, stat: EffortStatKey, actualAtEffort: (effort: number) => number): number[] {
  if (boostedStat !== stat || !boostedStat) return []
  const points: number[] = []
  for (let effort = 1; effort <= CHAMPIONS_EFFORT_PER_STAT_CAP; effort += 1) {
    if (actualAtEffort(effort) % 11 === 0) points.push(effort)
  }
  return points
}

export function namedNatureMagicAvailable(stat: EffortStatKey, side: {
  actual: Partial<Record<EffortStatKey, string>>
  speedNatureKnown: boolean
  statNatureMultipliers: Partial<Record<EffortStatKey, number>>
}): boolean {
  return side.actual[stat] === undefined && side.speedNatureKnown && Object.keys(side.statNatureMultipliers).length === 0
}

/** Canonical projection shared by the party editor and matchup editor. */
export function effortMagicProjection(row: Row, evs: EffortValues, nature: NatureId, available = true) {
  const boosted = available ? natureAxes(nature).up : null
  const actualAt = (stat: EffortStatKey, effort: number) => actualStat(row[stat], effort, stat === 'hp' ? 1 : natureMultiplier(nature, stat), stat === 'hp')
  return {
    candidate: boosted ? magicEffortCandidate(boosted, evs, effort => actualAt(boosted, effort)) : null,
    points: (stat: EffortStatKey) => boosted ? magicEffortMarkers(boosted, stat, effort => actualAt(stat, effort)) : [],
  }
}
