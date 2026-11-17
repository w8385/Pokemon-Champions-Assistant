export function normalizeMoveSlots(moves: string[]) {
  const normalized = moves.slice(0, 4).map((entry) => entry.trim())
  while (normalized.length && !normalized[normalized.length - 1]) normalized.pop()
  return normalized
}

/** Find the next empty move slot without ever leaving the current four-slot editor. */
export function nextOpenMoveSlot(moves: readonly string[], fromIndex: number): number | null {
  const slotCount = 4
  if (!Number.isInteger(fromIndex) || fromIndex < 0 || fromIndex >= slotCount) return null
  for (let offset = 1; offset < slotCount; offset += 1) {
    const index = (fromIndex + offset) % slotCount
    if (!(moves[index] ?? '').trim()) return index
  }
  return null
}
