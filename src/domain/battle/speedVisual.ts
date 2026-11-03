// Presentation only: the effective speeds come from the existing comparison engine.
export function compareSpeedVisual(own: number | null | undefined, opponent: number | null | undefined) {
  if (own == null || opponent == null || !Number.isFinite(own) || !Number.isFinite(opponent) || own <= 0 || opponent <= 0) {
    return { valid: false as const, maximum: null, delta: null, ownFraction: null, opponentFraction: null }
  }
  const maximum = Math.max(own, opponent)
  return { valid: true as const, maximum, delta: own - opponent, ownFraction: own / maximum, opponentFraction: opponent / maximum }
}
