import { quickMoveSupported, replaceQuickMove } from './quickDamageState.ts'

const CONNECTED_CONDITIONAL_POWER = new Set(['성묘', '어시스트파워', '객기', '병상첨병', '리벤지'])

// Unlike compact confirmed-move lists, sample opponent moves are positional records.
export function fixedSampleOpponentMoves(input: unknown): string[] {
  const source = Array.isArray(input) ? input : []
  return Array.from({ length: 4 }, (_, index) => typeof source[index] === 'string' ? source[index] : '')
}

export function replaceSampleOpponentMove(moves: readonly string[], slot: number, move: string): string[] {
  if (!Number.isInteger(slot) || slot < 0 || slot >= 4) return fixedSampleOpponentMoves(moves)
  return replaceQuickMove(fixedSampleOpponentMoves(moves), slot, move)
}

export function sampleDamageMoveGate(
  move: string,
  poolStatus: string | undefined,
  eligible: boolean,
  meta: { category?: string | null; power?: number | null; variablePower?: boolean; type?: string | null } | null,
  conditionalConnected = false,
): 'loading' | 'source' | 'unsupported' | null {
  if (!poolStatus || poolStatus === 'loading') return 'loading'
  if (poolStatus !== 'ready-verified' || !eligible) return 'source'
  if (!meta?.type) return 'unsupported'
  // Only the actual connected condition editor may resolve conditional power;
  // an unrelated variable-power move still fails the mechanics registry.
  const resolved = conditionalConnected && CONNECTED_CONDITIONAL_POWER.has(move) && meta.variablePower
    ? { ...meta, variablePower: false }
    : meta
  if (!quickMoveSupported(move, resolved)) return 'unsupported'
  return null
}