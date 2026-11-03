import type { SiteLanguage } from '../../app/types'

export function searchSlotPlaceholder(index: number, language: SiteLanguage) {
  return language === 'en' ? `Search slot ${index + 1} and press Enter` : language === 'ja' ? `${index + 1}番スロットを検索してEnter` : `${index + 1}번 슬롯 검색 후 엔터`
}
