// Scarf-only modifier after the nature-adjusted actual stat has been rounded.
// Consistent with App's existing calculation and Showdown's 1.5 Speed modifier;
// this is not a claim about additional battle modifiers or game verification.
export function applyChoiceScarf(actualSpeed: number): number {
  return Math.floor(actualSpeed * 1.5)
}
