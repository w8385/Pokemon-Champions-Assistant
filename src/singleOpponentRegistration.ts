import { draftStorageKey } from './comparisonDraftState.ts'

// Entry registration is a master-record change, unlike temporary comparison builds.
export function registerOpponentSpecies<T extends { key: string }>(slots: readonly T[], current: number, key: string, blank: () => T): { slots: T[]; nextIndex: number } {
  if (!slots[current] || !key) return { slots: [...slots], nextIndex: current }
  const next = [...slots]
  next[current] = slots[current].key === key ? slots[current] : { ...blank(), key }
  const nextIndex = Array.from({ length: slots.length - 1 }, (_, step) => (current + step + 1) % slots.length).find(index => !next[index].key) ?? current
  return { slots: next, nextIndex }
}

export function hasOpponentEntryData<T>(slots: readonly T[], hasDraft: boolean, search: string, blank: () => T): boolean {
  const empty = JSON.stringify(blank())
  return hasDraft || Boolean(search.trim()) || slots.some(slot => JSON.stringify(slot) !== empty)
}

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
