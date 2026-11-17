import type { MoveMeta } from '../../app/types'
import { getDexGameMove, getDexGameMoveIdentity, getDexGameMoveNames } from './dexGameMoveIndex'
import moveMetaOverrides from '../../canonical-data/champions/championsMoveMetaOverrides.json'

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
  const reviewedOverride = canonicalName
    ? (moveMetaOverrides[canonicalName as keyof typeof moveMetaOverrides] as Partial<MoveMeta> | undefined) ?? null
    : null
  const evidence = legacy ?? reviewedOverride
  if (!identity && !evidence) return null
  const meta: MoveMeta = identity
    ? { ...(evidence ?? {}), type: identity.type, category: evidence?.category ?? null,
        power: evidence?.power ?? null, accuracy: evidence?.accuracy ?? null, pp: evidence?.pp ?? null,
        priority: evidence?.priority ?? null }
    : { ...evidence! } as MoveMeta
  const provenance = Object.fromEntries((['type', 'category', 'power', 'accuracy', 'pp', 'priority'] as const).map(field => [field,
    field === 'type' && identity ? 'game-snapshot' : evidence?.[field] != null ? 'legacy' : 'unknown',
  ])) as MoveMetadata['provenance']
  return { id: identity?.id ?? null, canonicalName, meta, provenance }
}
