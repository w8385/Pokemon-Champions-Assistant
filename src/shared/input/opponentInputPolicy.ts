export const SPEED_STAGE_OPTIONS = [-2, -1, 0, 1, 2] as const

export const MAX_OPPONENTS = 6

export function clampNonNegativeInt(value: unknown, max = 999) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(max, Math.trunc(num)))
}

export function clampSpeedStage(value: unknown) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(-2, Math.min(2, Math.trunc(num)))
}
