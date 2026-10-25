import { searchMoves } from './moveSearch.ts'

export function quickStatNature(side: { speedNatureKnown: boolean; speedNatureMultiplier: number; statNatureMultipliers: Partial<Record<string, number>> }, key: string, nature: number): number {
  if (key === 'hp') return 1
  if (key === 'speed') return side.speedNatureKnown ? nature : side.speedNatureMultiplier
  return side.statNatureMultipliers[key] ?? nature
}

export function quickSpeedState(input: unknown): { speedStage: number; speedNatureKnown: boolean; speedNatureMultiplier: number; statNatureMultipliers: Partial<Record<'hp' | 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed', number>> } {
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {}
  const allowed = [0.9, 1, 1.1]
  const source = value.statNatureMultipliers && typeof value.statNatureMultipliers === 'object' ? value.statNatureMultipliers as Record<string, unknown> : {}
  const statNatureMultipliers = Object.fromEntries(['hp','attack','defense','spAttack','spDefense','speed'].filter(key => typeof source[key] === 'number' && allowed.includes(source[key] as number)).map(key => [key, source[key]]))
  return { speedStage: typeof value.speedStage === 'number' && Number.isFinite(value.speedStage) ? Math.max(-6, Math.min(6, Math.trunc(value.speedStage))) : 0, speedNatureKnown: typeof value.speedNatureKnown === 'boolean' ? value.speedNatureKnown : true, speedNatureMultiplier: typeof value.speedNatureMultiplier === 'number' && allowed.includes(value.speedNatureMultiplier) ? value.speedNatureMultiplier : 1, statNatureMultipliers }
}

export function readQuickSaved(raw: string | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw || '{}')
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
  } catch { return {} }
}

export type QuickStages = { attackStage: number; spAttackStage: number; defenseStage: number; spDefenseStage: number }
export function quickBattleStages(own: Partial<QuickStages>, legacy: Record<string, unknown> = {}, originalAttacker = false): QuickStages {
  const stage = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? Math.max(-6, Math.min(6, Math.trunc(value))) : 0
  return {
    attackStage: stage(own.attackStage ?? (originalAttacker ? legacy.attackStage : 0)),
    spAttackStage: stage(own.spAttackStage),
    defenseStage: stage(own.defenseStage ?? (!originalAttacker ? legacy.defenseStage : 0)),
    spDefenseStage: stage(own.spDefenseStage),
  }
}

export function quickStagePair(source: Partial<QuickStages>, target: Partial<QuickStages>, meta: { category?: string | null; usesDefenseAsAttack?: boolean; targetsDefenseStat?: string; usesTargetAttack?: boolean }): [number, number] {
  const attack = meta.usesTargetAttack ? target.attackStage : meta.usesDefenseAsAttack ? source.defenseStage : meta.category === 'special' ? source.spAttackStage : source.attackStage
  const defense = meta.targetsDefenseStat === 'defense' ? target.defenseStage : meta.targetsDefenseStat === 'spDefense' ? target.spDefenseStage : meta.category === 'special' ? target.spDefenseStage : target.defenseStage
  return [attack ?? 0, defense ?? 0]
}

export function quickMoveSupported(name: string, meta: { category?: string | null; power?: number | null; variablePower?: boolean } | null, unresolvedConditionalPower = false): boolean {
  if (unresolvedConditionalPower) return false
  if (!meta || (meta.category !== 'physical' && meta.category !== 'special')) return false
  const targetWeight = ['로우킥', '풀묶기', '안다리걸기', '안다리 걸기'].includes(name)
  const supportedHits = ['스케일샷', '트리플악셀'].includes(name)
  return (targetWeight || (typeof meta.power === 'number' && meta.power > 0)) && (!meta.variablePower || targetWeight || supportedHits)
}

export function quickItem(item: unknown, requiredStone: string | null, options: readonly string[]): string {
  // A read boundary preserves the original spelling and even an invalid pairing.
  // Classification happens against the form before any battle calculation.
  void requiredStone; void options
  return typeof item === 'string' ? item : ''
}

export function restoreQuickMoves<T extends { name: string }>(saved: unknown, legacy: unknown, pool: readonly T[]): string[] {
  const source = Array.isArray(saved) ? saved : [legacy]
  // Historical records can predate (or fall outside) the pinned learnset. Never erase them on load.
  void pool
  return Array.from({ length: 4 }, (_, i) => typeof source[i] === 'string' ? source[i] : '')
}

export function replaceQuickMove(moves: readonly string[], index: number, name: string): string[] {
  return Array.from({ length: 4 }, (_, i) => i === index ? name : moves[i] ?? '')
}

export function quickMoveSuggestions<T extends { name: string }>(query: string, pool: readonly T[]): T[] {
  return searchMoves(pool, query, { limit: 8 })
}
