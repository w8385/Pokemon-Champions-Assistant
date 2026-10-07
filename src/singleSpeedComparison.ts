import { actualStat } from './statMechanics.ts'
import { applyChoiceScarf, applySpeedModifiers, applySpeedStage } from './speedModifiers.ts'

export type SingleSpeedNature = 'neutral' | 'fast'
export type SingleSpeedItem = 'normal' | 'scarf'
type SpeedRow = { key: string; speed: number; abilities?: string[] }
type OwnSpeed = { row: SpeedRow; effort: number; nature: number; stage: number; scarf: boolean }
type Activation = { slug: string; active: boolean }
const DOUBLE_SPEED_ABILITIES = ['swift-swim', 'sand-rush', 'chlorophyll', 'slush-rush', 'surge-surfer', 'unburden']

// Screen-only assumptions: no member or opponent entry is changed by this calculation.
export function compareSingleSpeed(own: OwnSpeed, opponent: SpeedRow, nature: SingleSpeedNature, item: SingleSpeedItem, opponentStage: number, activation?: Activation) {
  const ownAt = (effort: number) => {
    const staged = applySpeedStage(actualStat(own.row.speed, effort, own.nature), own.stage)
    return own.scarf ? applyChoiceScarf(staged) : staged
  }
  // A Mega form requires its stone; never compute a fallback against an illegal Scarf.
  const unavailableReason = own.scarf && own.row.key.startsWith('mega-') ? 'own-mega-scarf'
    : item === 'scarf' && opponent.key.startsWith('mega-') ? 'mega-scarf'
    : activation?.active && (!DOUBLE_SPEED_ABILITIES.includes(activation.slug) || !opponent.abilities?.includes(activation.slug)) ? 'ability-unavailable'
    : activation?.active && activation.slug === 'unburden' && item === 'scarf' ? 'unburden-scarf' : null
  if (unavailableReason) return { unavailableReason, currentSpeed: null, maxSpeed: null, targetSpeed: null, verdict: null, tieEffort: null, passEffort: null, additionalEffort: null, passSpeed: null, previousPassSpeed: null }
  const currentSpeed = ownAt(own.effort)
  const maxSpeed = ownAt(32)
  const actual = actualStat(opponent.speed, 32, nature === 'fast' ? 1.1 : 1)
  const staged = applySpeedStage(actual, opponentStage)
  const targetSpeed = applySpeedModifiers(staged, { scarf: item === 'scarf', abilityMultiplier: activation?.active ? 2 : 1 })
  const speeds = Array.from({ length: 33 }, (_, effort) => ownAt(effort))
  const tieIndex = speeds.findIndex(speed => speed === targetSpeed)
  const passIndex = speeds.findIndex(speed => speed > targetSpeed)
  const tieEffort = tieIndex < 0 ? null : tieIndex
  const passEffort = passIndex < 0 ? null : passIndex
  return {
    unavailableReason, currentSpeed, maxSpeed, targetSpeed,
    verdict: currentSpeed > targetSpeed ? 'faster' : currentSpeed < targetSpeed ? 'slower' : 'equal',
    tieEffort, passEffort,
    additionalEffort: passEffort === null ? null : Math.max(0, passEffort - own.effort),
    passSpeed: passEffort === null ? null : speeds[passEffort],
    previousPassSpeed: passEffort === null || passEffort === 0 ? null : speeds[passEffort - 1],
  }
}
