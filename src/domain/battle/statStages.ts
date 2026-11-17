/**
 * Full in-battle stat-rank range in visual order.
 * Boosts sit above neutral and drops sit below it in every selector.
 */
export const BATTLE_STAT_STAGE_OPTIONS = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6] as const

export function battleStatStageLabel(stage: number): string {
  return stage > 0 ? `+${stage}` : String(stage)
}
