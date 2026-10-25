import type { ComparisonSeed } from './unifiedComparisonAdapter'
import { EFFORT_KEYS, knownNature, validEffort, validCompleteEfforts } from './buildRules.ts'

type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type Side = 'attacker' | 'defender'
const STATS = EFFORT_KEYS
const FIELDS = ['key', 'ability', 'item', 'nature', 'moves', ...STATS] as const
const allowed = new Set<string>(FIELDS)
const patchFields = new Set(['key', 'ability', 'item', 'nature', 'moves', 'evs'])
type BuildSide = Pick<ComparisonSeed, 'key' | 'ability' | 'item' | 'nature' | 'evs' | 'moves'>
type Patch = Partial<Omit<BuildSide, 'evs'>> & { evs?: Partial<BuildSide['evs']> }
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const isStat = (key: string): key is typeof STATS[number] => STATS.includes(key as typeof STATS[number])
const validValue = (key: string, value: unknown) => isStat(key) ? validEffort(value) : key === 'nature' ? knownNature(value) : key === 'moves' ? Array.isArray(value) && value.length === 4 && value.every(v => typeof v === 'string') : typeof value === 'string'
export const draftStorageKey = (side: Side, slot: number) => `pokemon-champions-comparison-build:v1:${side}:${slot}`

// One pure boundary for proposed and restored envelopes. No storage mutations on failure.
function validatedEnvelope(payload: unknown, seed: ComparisonSeed | BuildSide): { side: ComparisonSeed | BuildSide; dirty: Set<string> } | null {
  if (!record(payload) || payload.version !== 1 || payload.seed !== JSON.stringify(seed) || !Array.isArray(payload.dirty) || !record(payload.patch)) return null
  const dirty: unknown[] = payload.dirty
  if (!dirty.length || dirty.some(key => typeof key !== 'string' || !allowed.has(key)) || new Set(dirty).size !== dirty.length) return null
  const fields = dirty as string[]
  const patch = payload.patch
  if (Object.keys(patch).some(key => !patchFields.has(key))) return null
  if (patch.evs !== undefined && (!record(patch.evs) || Object.keys(patch.evs).some(key => !isStat(key)))) return null
  const evPatch = patch.evs as Record<string, unknown> | undefined
  if (evPatch && !fields.includes('key') && !fields.some(isStat)) return null
  for (const field of fields) if (!validValue(field, isStat(field) ? evPatch?.[field] : patch[field])) return null
  if (Object.keys(patch).some(key => key !== 'evs' && !fields.includes(key) && !fields.includes('key')) ||
      Object.keys(evPatch ?? {}).some(key => !fields.includes(key) && !fields.includes('key'))) return null
  if (fields.includes('key') && (['ability', 'item', 'nature', 'moves'] as const).some(key => !validValue(key, patch[key]))) return null
  if (fields.includes('key') && STATS.some(key => !validValue(key, evPatch?.[key]))) return null
  const evs = { ...seed.evs, ...evPatch }
  if (!validCompleteEfforts(evs)) return null
  const sideDraft = { ...seed, ...patch, evs }
  if (!knownNature(sideDraft.nature)) return null
  return { side: sideDraft as ComparisonSeed | BuildSide, dirty: new Set(fields) }
}

export function readDraft(storage: StoragePort, side: Side, slot: number, seed: ComparisonSeed | BuildSide) {
  try {
    const payload: unknown = JSON.parse(storage.getItem(draftStorageKey(side, slot)) ?? 'null')
    return validatedEnvelope(payload, seed)
  } catch { return null }
}
export function writeDraft(storage: StoragePort, side: Side, slot: number, seed: ComparisonSeed | BuildSide, draft: BuildSide, dirty: ReadonlySet<string>) {
  if (!dirty.size) return forgetDraft(storage, side, slot)
  try {
    const patch: Patch = {}
    if (dirty.has('key')) {
      patch.key = draft.key
      patch.ability = draft.ability
      patch.item = draft.item
      patch.nature = draft.nature
      patch.moves = draft.moves
      patch.evs = { ...draft.evs }
    }
    for (const field of dirty) {
      if (!allowed.has(field)) return false
      if (isStat(field)) { patch.evs ??= {}; patch.evs[field] = draft.evs[field] }
      else if (field === 'key') patch.key = draft.key
      else if (field === 'ability') patch.ability = draft.ability
      else if (field === 'item') patch.item = draft.item
      else if (field === 'nature') patch.nature = draft.nature
      else if (field === 'moves') patch.moves = draft.moves
    }
    const payload = { version: 1, seed: JSON.stringify(seed), dirty: [...dirty], patch }
    // Validate the serialized shape too: undefined fields and exotic values cannot claim success.
    const serialized = JSON.stringify(payload)
    if (!validatedEnvelope(JSON.parse(serialized), seed)) return false
    storage.setItem(draftStorageKey(side, slot), serialized)
    return true
  } catch { return false }
}
export function forgetDraft(storage: StoragePort, side: Side, slot: number) {
  try { storage.removeItem(draftStorageKey(side, slot)); return true }
  catch { return false }
}
