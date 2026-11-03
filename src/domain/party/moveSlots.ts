export function normalizeMoveSlots(moves: string[]) {
  const normalized = moves.slice(0, 4).map((entry) => entry.trim())
  while (normalized.length && !normalized[normalized.length - 1]) normalized.pop()
  return normalized
}
