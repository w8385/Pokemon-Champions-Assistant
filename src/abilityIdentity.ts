import type { Row, SiteLanguage } from './app/types'
import { normalizeSearchText } from './pokemonSearch'
import verifiedAbilityLabels from './verifiedAbilityLabels.json'

export type AbilityRow = Pick<Row, 'key' | 'abilities' | 'abilities_ko'>
export type AbilityNames = { nameKo?: string; nameEn?: string; nameJa?: string }
export type AbilityNamesFor = (slug: string) => AbilityNames | null | undefined
export type AbilityResolution = { status: 'empty' | 'allowed' | 'unavailable' | 'unknown'; raw: string; slug: string | null; display: string }

const titleCase = (slug: string) => slug.split('-').map(word => word ? word[0].toUpperCase() + word.slice(1) : '').join(' ')
const verified = (slug: string) => verifiedAbilityLabels.abilities[slug as keyof typeof verifiedAbilityLabels.abilities]

export function localizedAbilityLabel(row: AbilityRow, slug: string, language: SiteLanguage, namesFor?: AbilityNamesFor): string {
  const index = row.abilities.indexOf(slug)
  const ko = row.abilities_ko[index] || namesFor?.(slug)?.nameKo || titleCase(slug)
  if (language === 'ko') return verified(slug)?.ko || ko
  if (language === 'ja') return verified(slug)?.ja || namesFor?.(slug)?.nameJa || titleCase(slug)
  return verified(slug)?.en || namesFor?.(slug)?.nameEn || titleCase(slug)
}

export function abilityAliases(row: AbilityRow, slug: string, namesFor?: AbilityNamesFor): string[] {
  const names = namesFor?.(slug)
  return [...new Set([slug, titleCase(slug), row.abilities_ko[row.abilities.indexOf(slug)], verified(slug)?.ko, verified(slug)?.en, verified(slug)?.ja, names?.nameKo, names?.nameEn, names?.nameJa].filter((value): value is string => Boolean(value)))]
}

export function resolveFormAbility(row: AbilityRow | null | undefined, raw: string, namesFor?: AbilityNamesFor, knownRows?: readonly AbilityRow[]): AbilityResolution {
  if (raw === '') return { status: 'empty', raw, slug: null, display: '' }
  const normalized = normalizeSearchText(raw)
  if (normalized && row) {
    // An explicit canonical slug is unambiguous even if another slug owns its label.
    if (row.abilities.includes(raw)) return { status: 'allowed', raw, slug: raw, display: raw }
    const matches = row.abilities.filter(slug => abilityAliases(row, slug, namesFor).some(alias => normalizeSearchText(alias) === normalized))
    if (matches.length === 1) return { status: 'allowed', raw, slug: matches[0], display: raw }
    if (matches.length > 1) return { status: 'unknown', raw, slug: null, display: raw }
  }
  // A known ability belonging to another form is not a default for this one.
  if (normalized && knownRows?.some(candidate => candidate.abilities.some(slug => abilityAliases(candidate, slug, namesFor).some(alias => normalizeSearchText(alias) === normalized)))) {
    return { status: 'unavailable', raw, slug: null, display: raw }
  }
  return { status: 'unknown', raw, slug: null, display: raw }
}

export const isCalculableAbility = (row: AbilityRow | null | undefined, raw: string, namesFor?: AbilityNamesFor, knownRows?: readonly AbilityRow[]) => {
  const status = resolveFormAbility(row, raw, namesFor, knownRows).status
  return status === 'empty' || status === 'allowed'
}

export function abilityForSpeciesSelection(row: AbilityRow | null | undefined, previousKey: string, nextKey: string, recorded: string): string {
  if (previousKey === nextKey) return recorded
  return row?.abilities.length === 1 ? row.abilities[0] : ''
}

export function abilityIndex(rows: readonly AbilityRow[], namesFor?: AbilityNamesFor) {
  const byKey = new Map<string, { key: string; koLabel: string; pokemonKeys: string[] }>()
  const byNormalized = new Map<string, { key: string; koLabel: string; pokemonKeys: string[] }>()
  const ambiguous = new Set<string>()
  for (const row of rows) for (const slug of row.abilities) {
    const existing = byKey.get(slug)
    if (existing) existing.pokemonKeys.push(row.key)
    else byKey.set(slug, { key: slug, koLabel: localizedAbilityLabel(row, slug, 'ko', namesFor), pokemonKeys: [row.key] })
  }
  for (const row of rows) for (const slug of row.abilities) {
    const entry = byKey.get(slug)!
    for (const alias of abilityAliases(row, slug, namesFor)) {
      const key = normalizeSearchText(alias)
      if (!key || ambiguous.has(key)) continue
      const previous = byNormalized.get(key)
      if (previous && previous.key !== slug) {
        byNormalized.delete(key)
        ambiguous.add(key)
      } else byNormalized.set(key, entry)
    }
  }
  return { byKey, byNormalized }
}
