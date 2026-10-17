import type { ComparisonSeed } from './unifiedComparisonAdapter'

type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type Side = 'attacker' | 'defender'
const STATS = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const
const FIELDS = ['key', 'ability', 'item', 'nature', 'moves', ...STATS] as const
const allowed = new Set<string>(FIELDS)
type BuildSide = Pick<ComparisonSeed, 'key' | 'ability' | 'item' | 'nature' | 'evs' | 'moves'>
type Patch = Partial<Omit<BuildSide, 'evs'>> & { evs?: Partial<BuildSide['evs']> }
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const validValue = (key: string, value: unknown) => STATS.includes(key as typeof STATS[number]) ? Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 32 : key === 'moves' ? Array.isArray(value) && value.length === 4 && value.every(v => typeof v === 'string') : typeof value === 'string'
export const draftStorageKey = (side: Side, slot: number) => `pokemon-champions-comparison-build:v1:${side}:${slot}`
export function readDraft(storage: StoragePort, side: Side, slot: number, seed: ComparisonSeed | BuildSide) {
  try {
    const payload: unknown = JSON.parse(storage.getItem(draftStorageKey(side, slot)) ?? 'null')
    if (!record(payload) || payload.version !== 1 || payload.seed !== JSON.stringify(seed) || !Array.isArray(payload.dirty) || !record(payload.patch)) return null
    const dirty = payload.dirty
    if (!dirty.length || dirty.some(key => typeof key !== 'string' || !allowed.has(key)) || new Set(dirty).size !== dirty.length) return null
    const patch = payload.patch
    if (Object.keys(patch).some(k => !['key','ability','item','nature','moves','evs'].includes(k))) return null
    if (patch.evs !== undefined && (!record(patch.evs) || Object.keys(patch.evs).some(k => !STATS.includes(k as typeof STATS[number])))) return null
    for (const key of dirty) if (!validValue(key, STATS.includes(key as typeof STATS[number]) ? (patch.evs as Record<string, unknown> | undefined)?.[key] : patch[key])) return null
    if (Object.keys(patch).some(key => key !== 'evs' && !dirty.includes(key) && !dirty.includes('key')) || Object.keys(patch.evs ?? {}).some(key => !dirty.includes(key) && !dirty.includes('key'))) return null
    if (dirty.includes('key') && (['ability', 'item', 'nature', 'moves'] as const).some(key => !validValue(key, patch[key])) ) return null
    if (dirty.includes('key') && STATS.some(key => !validValue(key, (patch.evs as Record<string, unknown> | undefined)?.[key]))) return null
    const evs = { ...seed.evs, ...(patch.evs as Patch['evs']) }
    if (Object.values(evs).reduce((sum, value) => sum + value, 0) > 66) return null
    const sideDraft = { ...seed, ...patch, evs }
    return { side: sideDraft, dirty: new Set<string>(dirty) }
  } catch { return null }
}
export function writeDraft(storage: StoragePort, side: Side, slot: number, seed: ComparisonSeed | BuildSide, draft: BuildSide, dirty: ReadonlySet<string>) {
  const key = draftStorageKey(side, slot)
  if (!dirty.size) return forgetDraft(storage, side, slot)
  const patch: Patch = {}
  if (dirty.has('key')) {
    patch.key = draft.key
    patch.ability = draft.ability
    patch.item = draft.item
    patch.nature = draft.nature
    patch.moves = draft.moves.slice(0, 4)
    patch.evs = { ...draft.evs }
  }
  for (const field of dirty) {
    if (!allowed.has(field)) continue
    if (STATS.includes(field as typeof STATS[number])) { patch.evs ??= {}; patch.evs[field as typeof STATS[number]] = draft.evs[field as typeof STATS[number]] }
    else if (field === 'key') patch.key = draft.key
    else if (field === 'ability') patch.ability = draft.ability
    else if (field === 'item') patch.item = draft.item
    else if (field === 'nature') patch.nature = draft.nature
    else if (field === 'moves') patch.moves = draft.moves.slice(0, 4)
  }
  try {
    storage.setItem(key, JSON.stringify({ version: 1, seed: JSON.stringify(seed), dirty: [...dirty].filter(field => allowed.has(field)), patch }))
    return true
  } catch { return false }
}
export function forgetDraft(storage: StoragePort, side: Side, slot: number) {
  try { storage.removeItem(draftStorageKey(side, slot)); return true }
  catch { return false }
}
