import { getJaName } from './jaLabels.ts'
import type { SpeedLineSpecies } from './speedLine.ts'
import { normalizeMatchText, rankedSearch } from './searchMatching.ts'
import { byDisplayName } from './displayOrder.ts'

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

export function searchPokemon<T extends SpeedLineSpecies>(rows: readonly T[], query: string, options?: { includeMega?: boolean; allowLoose?: boolean; limit?: number }): T[] {
  const candidates = options?.includeMega === false ? rows.filter(row => !row.key.startsWith('mega-')) : rows
  const sorted = byDisplayName(candidates, row => row.name_ko, row => row.key)
  return rankedSearch(sorted, query, row => {
    const official = [row.name_ko, row.name_en, row.name_ja, row.key]
    const aliases = speciesSearchCandidates(row).filter(name => !official.some(entry => entry && normalizeMatchText(entry) === normalizeMatchText(name)))
    return { official, aliases }
  }, options)
}

// Compatibility helper for the builder; searchPokemon already ranks official exact names first.
export function prioritizeExactSpecies<T extends SpeedLineSpecies>(matched: readonly T[], query: string): T[] {
  const normalized = normalizeSearchText(query.trim())
  if (!normalized) return [...matched]
  return [...matched].sort((a, b) => {
    const exact = (row: T) => [row.name_ko, row.name_en, row.name_ja, row.key].some(name => name && normalizeSearchText(name) === normalized)
    return Number(exact(b)) - Number(exact(a))
  })
}
