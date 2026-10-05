import { getJaName } from './jaLabels.ts'
import type { SpeedLineSpecies } from './speedLine.ts'

export function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g, '')
}

export function speciesSearchCandidates(row: SpeedLineSpecies): string[] {
  const base = [row.name_ko, row.name_en, row.name_ja, getJaName(row.key, row.name_ko, row.name_en), row.key].filter(Boolean) as string[]
  const extra: string[] = []
  if (row.name_ko.startsWith('메가')) extra.push(row.name_ko.replace(/^메가/, ''))
  if (row.name_en.toLowerCase().startsWith('mega ')) extra.push(row.name_en.replace(/^Mega\s+/i, ''))
  if (row.key.startsWith('mega-')) extra.push(row.key.slice(5))
  if (row.key.startsWith('rotom-')) extra.push(`로토무${row.name_ko.replace(/로토무$/, '')}`)
  if (row.key.startsWith('gourgeist-')) extra.push(row.name_ko.replace(/^보통\s*/, ''), row.name_en.replace(/^Gourgeist\s*/, 'Gourgeist '))
  if (row.key === 'basculegion') extra.push('대쓰여너', '대쓰여너수컷', 'Basculegion', 'Basculegion Male')
  if (row.key === 'basculegion-female') extra.push('대쓰여너', '대쓰여너암컷', 'Basculegion', 'Basculegion Female')
  if (row.key === 'floette-eternal-flower') extra.push('영원의 꽃 플라엣테', '영원의꽃 플라엣테', '영원의꽃플라엣테', 'Eternal Flower Floette')
  return Array.from(new Set([...base, ...extra].flatMap(entry => [entry, normalizeSearchText(entry)])))
}

function matchesLooseQuery(source: string, query: string): boolean {
  let cursor = 0
  for (const char of source) {
    if (char === query[cursor]) cursor += 1
    if (cursor >= query.length) return true
  }
  return false
}

export function searchPokemon<T extends SpeedLineSpecies>(rows: readonly T[], query: string, options?: { includeMega?: boolean; allowLoose?: boolean; limit?: number }): T[] {
  const candidates = options?.includeMega === false ? rows.filter(row => !row.key.startsWith('mega-')) : rows
  const normalized = normalizeSearchText(query.trim())
  const limit = options?.limit === undefined ? Infinity : Math.max(0, options.limit)
  if (!normalized) return candidates.slice(0, limit)
  return candidates.map(row => {
    const score = speciesSearchCandidates(row).reduce((best, candidate) => {
      const text = normalizeSearchText(candidate)
      if (text === normalized) return Math.min(best, 0)
      if (text.startsWith(normalized)) return Math.min(best, 1)
      if (text.includes(normalized)) return Math.min(best, 2)
      if (options?.allowLoose !== false && matchesLooseQuery(text, normalized)) return Math.min(best, 3)
      return best
    }, Infinity)
    return { row, score }
  }).filter(entry => Number.isFinite(entry.score))
    .sort((a, b) => a.score - b.score || a.row.name_ko.localeCompare(b.row.name_ko, 'ko'))
    .slice(0, limit).map(entry => entry.row)
}
