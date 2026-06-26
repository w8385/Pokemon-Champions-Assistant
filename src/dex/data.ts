import type { DexDescriptionBundle, MoveMeta } from '../app/types'

let usageTopMovesByKeyCache: Record<string, { moves?: string[], sourceFormat?: string, sourcePokemon?: string, fallback?: boolean }> | null = null

export async function loadUsageTopMovesByKey() {
  if (usageTopMovesByKeyCache) return usageTopMovesByKeyCache
  const mod = await import('../championsUsageTopMoves.json')
  usageTopMovesByKeyCache = mod.default as Record<string, { moves?: string[], sourceFormat?: string, sourcePokemon?: string, fallback?: boolean }>
  return usageTopMovesByKeyCache
}

export function usageTopMovesForKey(key: string, limit = 10) {
  return (usageTopMovesByKeyCache?.[key]?.moves ?? []).slice(0, limit)
}

export const MOVE_META_BY_NAME: Record<string, MoveMeta> = {}

export async function loadMoveMetaByName() {
  if (Object.keys(MOVE_META_BY_NAME).length) return MOVE_META_BY_NAME
  const mod = await import('../championsLearnedMoveMeta.json')
  Object.assign(MOVE_META_BY_NAME, mod.default as Record<string, MoveMeta>)
  return MOVE_META_BY_NAME
}

let dexDescriptionsCache: DexDescriptionBundle | null = null

export async function loadDexDescriptions() {
  if (dexDescriptionsCache) return dexDescriptionsCache
  const mod = await import('../dexDescriptions.json')
  dexDescriptionsCache = mod.default as DexDescriptionBundle
  return dexDescriptionsCache
}

export function getDexDescriptionsSync() {
  return dexDescriptionsCache
}

let spriteHashIndexCache: { key: string; hash: string }[] | null = null

export async function loadSpriteHashIndex() {
  if (spriteHashIndexCache) return spriteHashIndexCache
  const mod = await import('../championSpriteHashes.json')
  spriteHashIndexCache = (mod.default as { key: string; hash: string }[])
    .filter((entry) => typeof entry?.key === 'string' && typeof entry?.hash === 'string')
  return spriteHashIndexCache
}
