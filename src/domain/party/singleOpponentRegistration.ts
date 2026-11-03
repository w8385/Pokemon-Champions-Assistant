// Only an explicit species/form commit may use this default. Restored and
// source-unverified records keep their recorded ability (including '').
export function soleAbilityForSelectedSpecies(row?: { abilities: readonly string[] } | null): string {
  return row?.abilities.length === 1 ? row.abilities[0] : ''
}

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
