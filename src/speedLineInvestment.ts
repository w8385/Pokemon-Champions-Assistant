import { calculateSpeed } from './speedLine.ts'
import type { SpeedComparisonEntry, SpeedLineSpecies, SpeedNature } from './speedLine.ts'

export type SpeedInvestmentResult = {
  targetSpeed: number
  tieEffort: number | null
  passEffort: number | null
  currentSpeed: number
  maxSpeed: number
  alreadyAhead: boolean
  additionalEffort: number | null
  tieSpeed: number | null
  passSpeed: number | null
  previousPassSpeed: number | null
}

export function calculateSpeedInvestment(
  referenceRow: SpeedLineSpecies,
  referenceNature: SpeedNature,
  referenceEffort: number,
  target: Pick<SpeedComparisonEntry<SpeedLineSpecies>, 'effectiveSpeed'>,
): SpeedInvestmentResult {
  const targetSpeed = target.effectiveSpeed
  const speeds = Array.from({ length: 33 }, (_, effort) => calculateSpeed(referenceRow.speed, effort, referenceNature))
  const tie = speeds.findIndex(speed => speed === targetSpeed)
  const pass = speeds.findIndex(speed => speed > targetSpeed)
  const tieEffort = tie < 0 ? null : tie
  const passEffort = pass < 0 ? null : pass
  const currentSpeed = calculateSpeed(referenceRow.speed, referenceEffort, referenceNature)
  return {
    targetSpeed, tieEffort, passEffort, currentSpeed, maxSpeed: speeds[32],
    alreadyAhead: currentSpeed > targetSpeed,
    additionalEffort: passEffort === null ? null : Math.max(0, passEffort - referenceEffort),
    tieSpeed: tieEffort === null ? null : speeds[tieEffort],
    passSpeed: passEffort === null ? null : speeds[passEffort],
    previousPassSpeed: passEffort === null || passEffort === 0 ? null : speeds[passEffort - 1],
  }
}
