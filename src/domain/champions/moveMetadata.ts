import type { MoveMeta } from '../../app/types'
import { getDexGameMove, getDexGameMoveIdentity, getDexGameMoveNames } from './dexGameMoveIndex'

// The catalog adapter supplies its existing mutable lazy cache without making
// metadata identity depend on loading, React or the adapter implementation.
let legacyForName: (name: string) => MoveMeta | null = () => null
export function connectLegacyMoveMetadata(lookup: (name: string) => MoveMeta | null): void {
  legacyForName = lookup
}

export type MoveMetadata = {
  id: number | null
  canonicalName: string | null
  meta: MoveMeta
  provenance: Record<'type' | 'category' | 'power' | 'accuracy' | 'pp' | 'priority', 'game-snapshot' | 'legacy' | 'unknown'>
}

/** Lazy legacy fields; the small pinned index alone owns source identity and basic type. */
const canonicalById = new Map(getDexGameMoveNames().map(name => [getDexGameMove(name)!.id, name]))

export function getMoveMetadata(name: string): MoveMetadata | null {
  if (!name) return null
  const identity = getDexGameMoveIdentity(name)
  const canonicalName = identity ? canonicalById.get(identity.id) ?? null : null
  // Preserve an alias's own historical mechanics; fall back to canonical legacy fields only if absent.
  const legacy = legacyForName(name) ?? (canonicalName ? legacyForName(canonicalName) : null) ?? null
  if (!identity && !legacy) return null
  const meta: MoveMeta = identity
    ? { ...(legacy ?? {}), type: identity.type, category: legacy?.category ?? null,
        power: legacy?.power ?? null, accuracy: legacy?.accuracy ?? null, pp: legacy?.pp ?? null,
        priority: legacy?.priority ?? null }
    : { ...legacy! }
  const provenance = Object.fromEntries((['type', 'category', 'power', 'accuracy', 'pp', 'priority'] as const).map(field => [field,
    field === 'type' && identity ? 'game-snapshot' : legacy?.[field] != null ? 'legacy' : 'unknown',
  ])) as MoveMetadata['provenance']
  return { id: identity?.id ?? null, canonicalName, meta, provenance }
}
