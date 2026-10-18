// Pure search ranking: identity > explicit alias > prefix > substring > initials > subsequence.
// Keep this separate from normalizeSearchText, which also resolves mechanics identities.
export function normalizeMatchText(value: string): string {
  return Array.from(value.normalize('NFKC').toLocaleLowerCase()).map(char => {
    const code = char.codePointAt(0) ?? 0
    return code >= 0x30a1 && code <= 0x30f6 ? String.fromCodePoint(code - 0x60) : char
  }).join('').replace(/[^\p{L}\p{N}]/gu, '')
}

const hangulInitials = 'ᄀᄁᄂᄃᄄᄅᄆᄇᄈᄉᄊᄋᄌᄍᄎᄏᄐᄑᄒ'
export function koreanInitials(value: string): string {
  return Array.from(normalizeMatchText(value)).map(char => {
    const code = char.codePointAt(0) ?? 0
    return code >= 0xac00 && code <= 0xd7a3 ? hangulInitials[Math.floor((code - 0xac00) / 588)] : char
  }).join('')
}

function isSubsequence(source: string, query: string): boolean {
  let position = 0
  for (const char of source) if (char === query[position]) position++
  return position === query.length
}

export type MatchNames = { official: readonly (string | undefined)[]; aliases?: readonly string[] }
export function searchMatchScore(query: string, names: MatchNames, options?: { allowLoose?: boolean }): number {
  const needle = normalizeMatchText(query)
  if (!needle) return Infinity
  const official = names.official.map(name => normalizeMatchText(name ?? '')).filter(Boolean)
  const aliases = (names.aliases ?? []).map(name => normalizeMatchText(name)).filter(Boolean)
  if (official.includes(needle)) return 0
  if (aliases.includes(needle)) return 1
  if (official.some(name => name.startsWith(needle))) return 2
  if (aliases.some(name => name.startsWith(needle))) return 3
  if (official.some(name => name.includes(needle))) return 4
  if (aliases.some(name => name.includes(needle))) return 5
  const officialInitials = official.filter(name => /[가-힣]/u.test(name)).map(koreanInitials)
  const aliasInitials = aliases.filter(name => /[가-힣]/u.test(name)).map(koreanInitials)
  if (officialInitials.includes(needle)) return 6
  if (aliasInitials.includes(needle)) return 7
  if (officialInitials.some(name => name.startsWith(needle))) return 8
  if (aliasInitials.some(name => name.startsWith(needle))) return 9
  if (officialInitials.some(name => name.includes(needle))) return 10
  if (aliasInitials.some(name => name.includes(needle))) return 11
  // Two or more Korean syllables can express a meaningful ordered abbreviation.
  // Generic Latin fuzzy matching remains opt-in to preserve existing caller contracts.
  if ((options?.allowLoose !== false && needle.length >= 2) || (needle.length >= 2 && /[가-힣]/u.test(needle))) {
    if (official.some(name => isSubsequence(name, needle))) return 12
    if (aliases.some(name => isSubsequence(name, needle))) return 13
  }
  return Infinity
}

export function rankedSearch<T>(pool: readonly T[], query: string, names: (item: T) => MatchNames, options?: { limit?: number; allowLoose?: boolean }): T[] {
  const limit = options?.limit === undefined ? Infinity : Math.max(0, options.limit)
  if (!query.trim()) return pool.slice(0, limit)
  if (!normalizeMatchText(query)) return []
  return pool.map((item, index) => ({ item, index, score: searchMatchScore(query, names(item), options) }))
    .filter(entry => Number.isFinite(entry.score))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit).map(entry => entry.item)
}
