import { CHAMPIONS_EFFORT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP } from './buildRules.ts'
import type { EffortStatKey, NatureId, Row } from '../../app/types.ts'
import type { EffortValues } from '../samples/myPartyChampionsSamples.ts'
import { natureAxes } from './natureProjection.ts'
import { actualStat } from './statMechanics.ts'
import { natureMultiplier } from './buildRules.ts'
import { maxEffortForStat, totalEffortPoints } from './effortProjection.ts'

export type MagicEffortCandidate = Readonly<{
  stat: EffortStatKey
  reached: boolean
  currentActual: number
  currentEffort: number
  nextEffort: number | null
  nextActual: number | null
}>

export type MagicEffortPoint = Readonly<{
  effort: number
  actual: number
  reachable: boolean
}>

export type MagicEffortRecommendation =
  | Readonly<{ kind: 'reached'; point: MagicEffortPoint }>
  | Readonly<{ kind: 'apply'; point: MagicEffortPoint; direction: 'up' | 'down' }>
  | Readonly<{ kind: 'blocked' }>

export type MagicEffortScale = Readonly<{
  stat: EffortStatKey
  current: Readonly<{ effort: number; actual: number; isMagic: boolean }>
  minEffort: 0
  maxEffort: number
  reachableMax: number | null
  points: readonly MagicEffortPoint[]
  recommendation: MagicEffortRecommendation
}>

function magicEffortValues(actualAtEffort: (effort: number) => number) {
  const points: Array<{ effort: number; actual: number }> = []
  for (let effort = 0; effort <= CHAMPIONS_EFFORT_PER_STAT_CAP; effort += 1) {
    const actual = actualAtEffort(effort)
    if (actual % 11 === 0) points.push({ effort, actual })
  }
  return points
}

/** Canonical 0–32 scale: calculation, reachability and recommendation live together. */
export function magicEffortScale(boostedStat: EffortStatKey | null, evs: EffortValues, actualAtEffort: (effort: number) => number): MagicEffortScale | null {
  if (!boostedStat) return null
  const currentEffort = evs[boostedStat]
  const currentActual = actualAtEffort(currentEffort)
  const otherEffort = totalEffortPoints(evs) - currentEffort
  const reachableMax = otherEffort > CHAMPIONS_EFFORT_CAP ? null : maxEffortForStat(evs, boostedStat)
  const points = magicEffortValues(actualAtEffort).map(point => ({ ...point, reachable: reachableMax !== null && point.effort <= reachableMax }))
  const rawCurrentPoint = points.find(point => point.effort === currentEffort)
  const currentPoint = rawCurrentPoint?.reachable ? rawCurrentPoint : null
  const nextPoint = points.find(point => point.reachable && point.effort > currentEffort)
  const previousPoint = [...points].reverse().find(point => point.reachable && point.effort < currentEffort)
  const recommendation: MagicEffortRecommendation = currentPoint
    ? { kind: 'reached', point: currentPoint }
    : nextPoint
      ? { kind: 'apply', point: nextPoint, direction: 'up' }
      : previousPoint
        ? { kind: 'apply', point: previousPoint, direction: 'down' }
        : { kind: 'blocked' }
  return {
    stat: boostedStat,
    current: { effort: currentEffort, actual: currentActual, isMagic: Boolean(rawCurrentPoint) },
    minEffort: 0,
    maxEffort: CHAMPIONS_EFFORT_PER_STAT_CAP,
    reachableMax,
    points,
    recommendation,
  }
}

function candidateFromScale(scale: MagicEffortScale): MagicEffortCandidate {
  const reached = scale.current.isMagic
  const currentPoint = reached ? scale.points.find(point => point.effort === scale.current.effort) : null
  const next = reached
    ? currentPoint
    : scale.recommendation.kind === 'apply' && scale.recommendation.direction === 'up'
      ? scale.recommendation.point
      : null
  return {
    stat: scale.stat,
    reached,
    currentActual: scale.current.actual,
    currentEffort: scale.current.effort,
    nextEffort: next?.effort ?? null,
    nextActual: next?.actual ?? null,
  }
}

// A magic point belongs only to the stat raised by a complete named nature.
// Checkpoints and recorded actual-stat overrides are separate from predictions.
export function magicEffortCandidate(boostedStat: EffortStatKey | null, evs: EffortValues, actualAtEffort: (effort: number) => number): MagicEffortCandidate | null {
  const scale = magicEffortScale(boostedStat, evs, actualAtEffort)
  return scale ? candidateFromScale(scale) : null
}

export function magicEffortMarkers(boostedStat: EffortStatKey | null, stat: EffortStatKey, actualAtEffort: (effort: number) => number): number[] {
  if (boostedStat !== stat || !boostedStat) return []
  return magicEffortValues(actualAtEffort).filter(point => point.effort > 0).map(point => point.effort)
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
  const scale = boosted ? magicEffortScale(boosted, evs, effort => actualAt(boosted, effort)) : null
  return {
    scale,
    candidate: scale ? candidateFromScale(scale) : null,
    points: (stat: EffortStatKey) => scale?.stat === stat ? scale.points.filter(point => point.effort > 0).map(point => point.effort) : [],
  }
}
