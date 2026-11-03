import { getMoveMetadata } from '../../domain/champions/moveMetadata'
import { MoveOption, MoveMeta } from '../../app/types'
import { moveNameCandidates } from '../../domain/battle/moveAliases'
import { normalizeSearchText } from '../../shared/search/pokemonSearch'
import { MovePoolState } from '../../features/damage/quickPresentation.ts'
import { searchMoves } from '../../shared/search/moveSearch'
import { moveDescriptionFor } from './data'
export function lookupMoveMeta(name: string) {
  if (!name) return null
  return getMoveMetadata(name)?.meta ?? null
}

export function findMatchingMoveOption(name: string, options: MoveOption[]) {
  if (!name || !options.length) return null
  const candidates = moveNameCandidates(name)
  return options.find((option) => candidates.includes(option.name) || candidates.includes(normalizeSearchText(option.name))) ?? null
}

export function resolveMoveType(name: string, preferredOptions: MoveOption[], movePools: Record<string, MovePoolState>) {
  const source = getMoveMetadata(name)
  if (source?.id) return source.meta.type
  const direct = findMatchingMoveOption(name, preferredOptions)
  if (direct?.type) return direct.type
  for (const candidate of moveNameCandidates(name)) {
    const meta = lookupMoveMeta(candidate)
    if (meta?.type) return meta.type
  }
  for (const pool of Object.values(movePools)) {
    const matched = findMatchingMoveOption(name, pool.moves)
    if (matched?.type) return matched.type
  }
  return null
}

export function resolveMoveMeta(name: string, preferredOptions: MoveOption[], movePools: Record<string, MovePoolState>): MoveMeta | null {
  if (!name) return null
  const source = getMoveMetadata(name)
  if (source?.id) return source.meta
  const candidates = moveNameCandidates(name)
  for (const candidate of candidates) {
    const meta = lookupMoveMeta(candidate)
    if (meta) return meta
  }
  const direct = findMatchingMoveOption(name, preferredOptions)
  if (direct) {
    const directMeta = lookupMoveMeta(direct.name)
    if (directMeta) return directMeta
  }
  for (const pool of Object.values(movePools)) {
    const matched = findMatchingMoveOption(name, pool.moves)
    if (!matched) continue
    const matchedMeta = lookupMoveMeta(matched.name)
    if (matchedMeta) return matchedMeta
  }
  const resolvedType = resolveMoveType(name, preferredOptions, movePools)
  return resolvedType ? { type: resolvedType, category: null, power: null } : null
}

export function filterMoveOptions(query: string, options: MoveOption[]) {
  return searchMoves(options, query, { names: option => moveDescriptionFor(option.name) ?? undefined })
}
