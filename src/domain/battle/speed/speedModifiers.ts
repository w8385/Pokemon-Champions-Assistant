// Scarf-only modifier after the nature-adjusted actual stat has been rounded.
// Consistent with App's existing calculation and Showdown's 1.5 Speed modifier;
// this is not a claim about additional battle modifiers or game verification.
export function applyChoiceScarf(actualSpeed: number): number {
  return applySpeedModifiers(actualSpeed, { scarf: true, abilityMultiplier: 1 })
}

// Showdown fixed-point chainModify: combine factors in 4096ths, then final speed
// uses trunc((trunc(value * modifier) + 2047) / 4096).
export function applySpeedModifiers(stageSpeed: number, options: { scarf: boolean; abilityMultiplier: 1 | 1.5 | 2 }): number {
  const modifier = Math.trunc((options.scarf ? 1.5 : 1) * options.abilityMultiplier * 4096)
  return Math.trunc((Math.trunc(stageSpeed * modifier) + 2047) / 4096)
}

// Matches the application's existing stage rounding after actualStat.
export function applySpeedStage(actualSpeed: number, stage: number): number {
  if (stage > 0) return Math.floor(actualSpeed * ((2 + stage) / 2))
  if (stage < 0) return Math.floor(actualSpeed * (2 / (2 + Math.abs(stage))))
  return actualSpeed
}
