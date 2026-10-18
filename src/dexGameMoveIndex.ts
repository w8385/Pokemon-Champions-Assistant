import type { MoveMeta } from './app/types'
import index from './dexGameMoveIndex.json'

type DexGameMove = { id: number; sourceKo: string; type: string }

/** Canonical Dex identities; historical-only metadata is merged by the browse caller. */
export function getDexGameMoveNames(): string[] {
  return Object.keys(index)
}

/** Small synchronous identity index for fresh Dex URLs; never a battle eligibility source. */
export function getDexGameMove(name: string): DexGameMove | null {
  return Object.prototype.hasOwnProperty.call(index, name)
    ? index[name as keyof typeof index] : null
}

/** Dex display only: the source owns type; other known stats remain legacy metadata. */
export function dexDisplayMoveMeta(name: string, legacy: MoveMeta | null | undefined): MoveMeta | null {
  const source = getDexGameMove(name)
  if (source) return legacy ? { ...legacy, type: source.type }
    : { type: source.type, category: null, power: null, accuracy: null, pp: null }
  return legacy ?? null
}
