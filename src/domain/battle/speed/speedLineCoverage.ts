import { buildSpeedScenario, calculateSpeed } from './speedLine.ts'
import { calculateSpeedInvestment } from './speedLineInvestment.ts'
import type { SpeedLineSpecies, SpeedNature, SpeedVariant } from './speedLine.ts'

export type CoverageCategory = 'normal-neutral' | 'normal-boost' | 'scarf-neutral' | 'scarf-boost'
export const coverageCategories: readonly CoverageCategory[] = ['normal-neutral', 'normal-boost', 'scarf-neutral', 'scarf-boost']
export type CoverageTarget<T extends SpeedLineSpecies> = {
  row: T; variant: SpeedVariant; nature: 'neutral' | 'boost'; category: CoverageCategory
  speed: number; tieEffort: number | null; passEffort: number | null
  previousPassSpeed: number | null; passSpeed: number | null
}
export type CoverageGroup<T extends SpeedLineSpecies> = {
  start: number; end: number; firstSpeed: number; lastSpeed: number
  counts: Record<CoverageCategory, number>; newTargets: CoverageTarget<T>[]
}
export type SpeedCoverage<T extends SpeedLineSpecies> = {
  reference: T | null; speeds: number[]; targets: CoverageTarget<T>[]; groups: CoverageGroup<T>[]
  totals: Record<CoverageCategory, number>
}
const compareTargets = <T extends SpeedLineSpecies>(a: CoverageTarget<T>, b: CoverageTarget<T>) =>
  a.speed - b.speed || a.row.key.localeCompare(b.row.key) ||
  (a.variant === b.variant ? 0 : a.variant === 'normal' ? -1 : 1) ||
  (a.nature === b.nature ? 0 : a.nature === 'neutral' ? -1 : 1)
const emptyCounts = (): Record<CoverageCategory, number> => ({ 'normal-neutral': 0, 'normal-boost': 0, 'scarf-neutral': 0, 'scarf-boost': 0 })

/** Project every valid roster/form condition once; effort selection only reads this projection. */
export function buildSpeedCoverage<T extends SpeedLineSpecies>(rows: readonly T[], key: string | null, nature: SpeedNature): SpeedCoverage<T> {
  const reference = rows.find(row => row.key === key) ?? null
  if (!reference) return { reference: null, speeds: [], targets: [], groups: [], totals: emptyCounts() }
  const speeds = Array.from({ length: 33 }, (_, effort) => calculateSpeed(reference.speed, effort, nature))
  const seen = new Set<string>()
  const targets: CoverageTarget<T>[] = []
  for (const row of rows) for (const variant of ['normal', 'scarf'] as const) {
    if (variant === 'scarf' && row.key.startsWith('mega-')) continue
    for (const targetNature of ['neutral', 'boost'] as const) {
      const identity = `${row.key}:${variant}:${targetNature}`
      if (seen.has(identity)) continue
      const scenario = buildSpeedScenario(row, 32, targetNature, variant, null, null)
      if (scenario.unavailableReason || scenario.hypothetical) continue
      seen.add(identity)
      const investment = calculateSpeedInvestment(reference, nature as SpeedNature, 0, scenario, 0, null)
      targets.push({ row, variant, nature: targetNature, category: `${variant}-${targetNature}`, speed: scenario.effectiveSpeed,
        tieEffort: investment.tieEffort, passEffort: investment.passEffort,
        previousPassSpeed: investment.previousPassSpeed, passSpeed: investment.passSpeed })
    }
  }
  targets.sort(compareTargets)
  const totals = emptyCounts()
  for (const target of targets) totals[target.category]++
  const groups: CoverageGroup<T>[] = []
  for (let effort = 0; effort <= 32; effort++) {
    const counts = emptyCounts()
    for (const target of targets) if (target.passEffort !== null && target.passEffort <= effort) counts[target.category]++
    const newTargets = targets.filter(target => target.passEffort === effort)
    const previous = groups[groups.length - 1]
    if (previous && !newTargets.length && coverageCategories.every(category => previous.counts[category] === counts[category])) {
      previous.end = effort
      previous.lastSpeed = speeds[effort]
    } else groups.push({ start: effort, end: effort, firstSpeed: speeds[effort], lastSpeed: speeds[effort], counts, newTargets })
  }
  return { reference, speeds, targets, groups, totals }
}

export function speedCoverageAt<T extends SpeedLineSpecies>(projection: SpeedCoverage<T>, effort: number) {
  if (!projection.reference || !Number.isInteger(effort) || effort < 0 || effort > 32) return null
  const currentSpeed = projection.speeds[effort]
  const categories = Object.fromEntries(coverageCategories.map(category => [category, {
    passed: projection.targets.filter(t => t.category === category && currentSpeed > t.speed).length,
    total: projection.totals[category],
  }])) as Record<CoverageCategory, { passed: number; total: number }>
  const nextTarget = projection.targets.find(t => t.passEffort !== null && t.passEffort > effort)
  return {
    currentSpeed, maxSpeed: projection.speeds[32], categories,
    passed: coverageCategories.reduce((sum, category) => sum + categories[category].passed, 0),
    total: projection.targets.length,
    ties: projection.targets.filter(t => t.speed === currentSpeed).length,
    next: nextTarget ? { ...nextTarget, additionalEffort: nextTarget.passEffort! - effort } : null,
    unreachable: projection.targets.filter(t => t.passEffort === null).length,
  }
}
