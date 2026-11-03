/** Presentation-only ordering: never sort an authoritative pool or a saved slot list in place. */
export function compareDisplayName<T>(a: T, b: T, label: (row: T) => string, key: (row: T) => string, locale = 'ko'): number {
  return label(a).localeCompare(label(b), locale) || key(a).localeCompare(key(b))
}

export function byDisplayName<T>(rows: readonly T[], label: (row: T) => string, key: (row: T) => string, locale = 'ko'): T[] {
  return [...rows].sort((a, b) => compareDisplayName(a, b, label, key, locale))
}
