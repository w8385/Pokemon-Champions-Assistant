import { draftStorageKey } from './comparisonDraftState.ts'

type DraftStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>
type DefenderSnapshot = { ok: true; hasDraft: boolean; values: (string | null)[] } | { ok: false }

// Read every slot before prompting or changing any record. Invalid JSON is still a draft to remove.
export function snapshotDefenderDrafts(storage: Pick<DraftStorage, 'getItem'>, count: number): DefenderSnapshot {
  try {
    const values = Array.from({ length: count }, (_, slot) => storage.getItem(draftStorageKey('defender', slot)))
    return { ok: true, hasDraft: values.some(value => value !== null), values }
  } catch { return { ok: false } }
}

export function removeDefenderDrafts(storage: Pick<DraftStorage, 'removeItem' | 'setItem'>, snapshot: DefenderSnapshot): { ok: true } | { ok: false; restored: boolean } {
  if (!snapshot.ok) return { ok: false, restored: true }
  const removed: number[] = []
  try {
    for (const [slot, value] of snapshot.values.entries()) {
      if (value === null) continue
      storage.removeItem(draftStorageKey('defender', slot))
      removed.push(slot)
    }
    return { ok: true }
  } catch {
    let restored = true
    for (const slot of removed) {
      try { storage.setItem(draftStorageKey('defender', slot), snapshot.values[slot]!) }
      catch { restored = false }
    }
    return { ok: false, restored }
  }
}
