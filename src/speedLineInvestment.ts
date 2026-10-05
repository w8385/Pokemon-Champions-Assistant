import { calculateSpeed } from './speedLine.ts'
import { applySpeedModifiers, applySpeedStage } from './speedModifiers.ts'
import { getSpeedAbility, speedAbilitiesFor } from './speedAbilities.ts'
import type { SpeedAbilitySelection } from './speedLineState.ts'
import type { SpeedComparisonEntry, SpeedLineSpecies, SpeedNature } from './speedLine.ts'

export type SpeedInvestmentResult = {
  targetSpeed: number
  tieEffort: number | null
  passEffort: number | null
  currentSpeed: number
  maxSpeed: number
  currentActualSpeed: number
  maxActualSpeed: number
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
  referenceStage = 0,
  referenceAbility: SpeedAbilitySelection = null,
): SpeedInvestmentResult {
  if (referenceAbility !== null && !speedAbilitiesFor(referenceRow).some(a => a.slug === referenceAbility)) throw new RangeError('Reference ability is not available for this form')
  if ('unavailableReason' in target && target.unavailableReason) throw new RangeError('Target speed condition is unavailable')
  if (!Number.isFinite(target.effectiveSpeed)) throw new RangeError('Target speed must be finite')
  const targetSpeed = target.effectiveSpeed
  const actualSpeeds = Array.from({ length: 33 }, (_, effort) => calculateSpeed(referenceRow.speed, effort, referenceNature))
  const modify = (speed: number) => applySpeedModifiers(applySpeedStage(speed, referenceStage), { scarf: false, abilityMultiplier: getSpeedAbility(referenceAbility)?.multiplier ?? 1 })
  const speeds = actualSpeeds.map(modify)
  const tie = speeds.findIndex(speed => speed === targetSpeed)
  const pass = speeds.findIndex(speed => speed > targetSpeed)
  const tieEffort = tie < 0 ? null : tie
  const passEffort = pass < 0 ? null : pass
  const currentActualSpeed = calculateSpeed(referenceRow.speed, referenceEffort, referenceNature)
  const currentSpeed = modify(currentActualSpeed)
  return {
    targetSpeed, tieEffort, passEffort, currentSpeed, maxSpeed: speeds[32], currentActualSpeed, maxActualSpeed: actualSpeeds[32],
    alreadyAhead: currentSpeed > targetSpeed,
    additionalEffort: passEffort === null ? null : Math.max(0, passEffort - referenceEffort),
    tieSpeed: tieEffort === null ? null : speeds[tieEffort],
    passSpeed: passEffort === null ? null : speeds[passEffort],
    previousPassSpeed: passEffort === null || passEffort === 0 ? null : speeds[passEffort - 1],
  }
}
