import { SiteLanguage, Row } from '../../app/types'
import { isCalculableAbility, resolveFormAbility, localizedAbilityLabel } from '../../domain/champions/abilityIdentity'
import { indexByKey, rows } from '../../adapters/catalog/roster.ts'
import { abilityDescriptionFor } from '../../adapters/catalog/data'
export function heldAbilityError(key: string, ability: string, language: SiteLanguage): string | null {
  if (!key || isCalculableAbility(indexByKey.get(key), ability, abilityDescriptionFor, rows)) return null
  return language === 'en' ? 'Unrecognized or unavailable ability. Open Ability to select one or explicitly clear it.' : language === 'ja' ? '未確認またはこのフォルムで使えない特性です。特性から選び直すか明示的に空にしてください。' : '미확인 또는 폼에 없는 특성 · 특성을 선택하거나 명시적으로 비우세요.'
}

export function resolveSelectedAbility(row: Row, selectedAbility: string, language: SiteLanguage) {
  void language
  const resolved = resolveFormAbility(row, selectedAbility, abilityDescriptionFor, rows)
  return resolved.status === 'allowed' ? { slug: resolved.slug!, label: localizedAbilityLabel(row, resolved.slug!, 'ko', abilityDescriptionFor) } : null
}

export function abilityDisplayName(abilityKey: string, abilityKo: string, language: SiteLanguage) {
  const row = rows.find(entry => entry.abilities.includes(abilityKey))
  return row ? localizedAbilityLabel(row, abilityKey, language, abilityDescriptionFor) : abilityKo
}

export function selectedAbilityDisplayName(row: Row, storedAbility: string, language: SiteLanguage) {
  if (!storedAbility) return undefined
  const selected = resolveSelectedAbility(row, storedAbility, language)
  return selected ? abilityDisplayName(selected.slug, selected.label, language) : undefined
}
