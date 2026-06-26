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


function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g, '')
}

let itemIndexCache: { byKey: Map<string, DexDescriptionBundle['items'][string]>; byNormalized: Map<string, { key: string; entry: DexDescriptionBundle['items'][string] }> } | null = null

export function getItemIndexSync() {
  if (itemIndexCache) return itemIndexCache
  const bundle = getDexDescriptionsSync()
  if (!bundle) return null
  const byKey = new Map<string, DexDescriptionBundle['items'][string]>()
  const byNormalized = new Map<string, { key: string; entry: DexDescriptionBundle['items'][string] }>()
  for (const [key, entry] of Object.entries(bundle.items)) {
    byKey.set(key, entry)
    for (const candidate of [key, entry.nameKo, entry.nameEn, entry.nameJa]) {
      byNormalized.set(normalizeSearchText(candidate), { key, entry })
    }
  }
  itemIndexCache = { byKey, byNormalized }
  return itemIndexCache
}

export function moveDescriptionFor(name: string) {
  const bundle = getDexDescriptionsSync()
  return bundle?.moves[name] ?? null
}

export function abilityDescriptionFor(abilityKey: string) {
  const bundle = getDexDescriptionsSync()
  return bundle?.abilities[abilityKey] ?? null
}

export function resolveItemInfo(rawItem: string) {
  if (!rawItem) return null
  const itemIndex = getItemIndexSync()
  if (!itemIndex) return null
  return itemIndex.byKey.has(rawItem)
    ? { key: rawItem, entry: itemIndex.byKey.get(rawItem)! }
    : itemIndex.byNormalized.get(normalizeSearchText(rawItem)) ?? null
}

export function itemDescriptionFor(rawItem: string) {
  return resolveItemInfo(rawItem)?.entry ?? null
}
