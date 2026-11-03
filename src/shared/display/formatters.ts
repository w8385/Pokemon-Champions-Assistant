import typeKoLabels from '../../assets/typeKoLabels.json'
import { natureById } from './naturePresentation'
import { StatKey, SiteLanguage, EffortStatKey, NatureId, MoveCategory, Row } from '../../app/types'
import { translateText } from './translation.ts'
import { getJaName } from './jaLabels'
import { indexByKey } from '../../adapters/catalog/roster.ts'
export const TYPE_KO_BY_KEY: Record<string, string> = typeKoLabels

export function statLabel(stat: StatKey, language: SiteLanguage = 'ko') {
  switch (stat) {
    case 'attack': return translateText(language, '공격')
    case 'defense': return translateText(language, '방어')
    case 'spAttack': return translateText(language, '특수공격')
    case 'spDefense': return translateText(language, '특수방어')
    case 'speed': return translateText(language, '스피드')
  }
}

export function statThemeClass(stat: EffortStatKey) {
  switch (stat) {
    case 'hp': return 'stat-theme-hp'
    case 'attack': return 'stat-theme-attack'
    case 'defense': return 'stat-theme-defense'
    case 'spAttack': return 'stat-theme-sp-attack'
    case 'spDefense': return 'stat-theme-sp-defense'
    case 'speed': return 'stat-theme-speed'
  }
}

export function moveTypeThemeClass(type: string | null | undefined) {
  switch (type) {
    case 'normal': return 'move-type-normal'
    case 'fire': return 'move-type-fire'
    case 'water': return 'move-type-water'
    case 'electric': return 'move-type-electric'
    case 'grass': return 'move-type-grass'
    case 'ice': return 'move-type-ice'
    case 'fighting': return 'move-type-fighting'
    case 'poison': return 'move-type-poison'
    case 'ground': return 'move-type-ground'
    case 'flying': return 'move-type-flying'
    case 'psychic': return 'move-type-psychic'
    case 'bug': return 'move-type-bug'
    case 'rock': return 'move-type-rock'
    case 'ghost': return 'move-type-ghost'
    case 'dragon': return 'move-type-dragon'
    case 'dark': return 'move-type-dark'
    case 'steel': return 'move-type-steel'
    case 'fairy': return 'move-type-fairy'
    default: return 'move-type-unknown'
  }
}

export function natureLabel(natureId: NatureId, language: SiteLanguage = 'ko') {
  const nature = natureById.get(natureId)
  if (!nature) return natureId
  const localized = translateText(language, nature.label)
  if (!nature.up || !nature.down) return `${localized} (${translateText(language, '무보정')})`
  return `${localized} (${statLabel(nature.up, language)}↑ ${statLabel(nature.down, language)}↓)`
}

export function displayMoveCategoryName(category: MoveCategory | null | undefined, language: SiteLanguage) {
  if (category === 'physical') return translateText(language, '물리')
  if (category === 'special') return translateText(language, '특수')
  if (category === 'status') return translateText(language, '변화')
  return translateText(language, '없음')
}

export function displayName(row: Row, language: SiteLanguage) {
  if (language === 'en') return row.name_en
  if (language === 'ja') return row.name_ja || getJaName(row.key, row.name_ko, row.name_en)
  return row.name_ko
}

export function searchDisplayLabel(key: string, language: SiteLanguage) {
  const row = indexByKey.get(key)
  if (!row) return key
  return displayName(row, language)
}
