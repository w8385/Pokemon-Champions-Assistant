import type { MoveOption } from './app/types'
import { loadFormLearnset, loadMoveLearners, LEARNSET_SOURCE, type LearnsetProvenance } from './sharedLearnsets'

/** Compatibility facade: both Dex directions use the same provider as battle pickers. */
export type DexLearnsetProvenance = LearnsetProvenance
export type DexGameLearnsetResult = { status: 'ready' | 'missing'; moves: MoveOption[]; provenance: DexLearnsetProvenance }
export type DexGameMoveLearnersResult = { status: 'ready' | 'missing'; keys: string[]; provenance: DexLearnsetProvenance }
export const DEX_GAME_LEARNSET_SOURCE = LEARNSET_SOURCE

export async function loadDexGameLearnset(key: string): Promise<DexGameLearnsetResult> {
  const result = await loadFormLearnset(key)
  return { status: result.status === 'ready-verified' ? 'ready' : 'missing', moves: result.moves, provenance: result.provenance }
}
export async function loadDexGameMoveLearners(name: string): Promise<DexGameMoveLearnersResult> {
  const result = await loadMoveLearners(name)
  return { status: result.status === 'ready-verified' ? 'ready' : 'missing', keys: result.keys, provenance: result.provenance }
}
