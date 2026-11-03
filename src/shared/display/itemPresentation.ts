import { canonicalHeldItem, requiredMegaStone, isCalculableHeldItem, classifyHeldItem } from '../../domain/champions/itemIdentity'
import { SiteLanguage } from '../../app/types'
import { CHAMPIONS_ITEM_SPRITE_MAP, ChampionsItem, localizedChampionsItemLabel, CHAMPIONS_ITEM_OPTIONS, CHAMPIONS_ITEM_ALIASES } from '../../domain/champions/championsItems'
import { resolveItemInfo } from '../../adapters/catalog/data'
import { translateText } from './translation.ts'
import { byDisplayName, compareDisplayName } from '../search/displayOrder'
export const MEGA_STONE_SPRITE_BY_KEY: Partial<Record<string, string>> = {
  'mega-abomasnow': 'abomasite',
  'mega-absol': 'absolite',
  'mega-absol-z': 'absolitez',
  'mega-aerodactyl': 'aerodactylite',
  'mega-aggron': 'aggronite',
  'mega-alakazam': 'alakazite',
  'mega-altaria': 'altarianite',
  'mega-ampharos': 'ampharosite',
  'mega-audino': 'audinite',
  'mega-banette': 'banettite',
  'mega-beedrill': 'beedrillite',
  'mega-blastoise': 'blastoisinite',
  'mega-camerupt': 'cameruptite',
  'mega-charizard-x': 'charizardite-x',
  'mega-charizard-y': 'charizardite-y',
  'mega-gallade': 'galladite',
  'mega-garchomp': 'garchompite',
  'mega-garchomp-z': 'garchompitez',
  'mega-gardevoir': 'gardevoirite',
  'mega-gengar': 'gengarite',
  'mega-glalie': 'glalitite',
  'mega-gyarados': 'gyaradosite',
  'mega-heracross': 'heracronite',
  'mega-houndoom': 'houndoominite',
  'mega-kangaskhan': 'kangaskhanite',
  'mega-lopunny': 'lopunnite',
  'mega-lucario': 'lucarionite',
  'mega-lucario-z': 'lucarionitez',
  'mega-golisopod': 'golisopite',
  'mega-baxcalibur': 'baxcalibrite',
  'mega-manectric': 'manectite',
  'mega-medicham': 'medichamite',
  'mega-floette': 'item-sprites/floettite.png',
  // PokéAPI has metadata but no sprite payload for the new Z-A Mega Stones yet.
  'mega-greninja': 'https://www.serebii.net/itemdex/sprites/za/greninjite.png',
  'mega-delphox': 'https://www.serebii.net/itemdex/sprites/za/delphoxite.png',
  'mega-meowstic': 'https://www.serebii.net/itemdex/sprites/za/meowsticite.png',
  'mega-starmie': 'https://www.serebii.net/itemdex/sprites/za/starminite.png',
  'mega-froslass': 'https://www.serebii.net/itemdex/sprites/za/froslassite.png',
  'mega-hawlucha': 'https://www.serebii.net/itemdex/sprites/za/hawluchanite.png',
  'mega-skarmory': 'https://www.serebii.net/itemdex/sprites/za/skarmorite.png',
  'mega-excadrill': 'https://www.serebii.net/itemdex/sprites/za/excadrite.png',
  'mega-glimmora': 'https://www.serebii.net/itemdex/sprites/za/glimmoranite.png',
  'mega-dragonite': 'https://www.serebii.net/itemdex/sprites/za/dragoninite.png',
  'mega-chandelure': 'https://www.serebii.net/itemdex/sprites/za/chandelurite.png',
  'mega-meganium': 'https://www.serebii.net/itemdex/sprites/za/meganiumite.png',
  'mega-feraligatr': 'https://www.serebii.net/itemdex/sprites/za/feraligite.png',
  'mega-emboar': 'https://www.serebii.net/itemdex/sprites/za/emboarite.png',
  'mega-scovillain': 'https://www.serebii.net/itemdex/sprites/za/scovillainite.png',
  'mega-clefable': 'https://www.serebii.net/itemdex/sprites/za/clefablite.png',
  'mega-victreebel': 'https://www.serebii.net/itemdex/sprites/za/victreebelite.png',
  'mega-chimecho': 'https://www.serebii.net/itemdex/sprites/za/chimechite.png',
  'mega-golurk': 'https://www.serebii.net/itemdex/sprites/za/golurkite.png',
  'mega-chesnaught': 'https://www.serebii.net/itemdex/sprites/za/chesnaughtite.png',
  'mega-drampa': 'https://www.serebii.net/itemdex/sprites/za/drampanite.png',
  'mega-crabominable': 'https://www.serebii.net/itemdex/sprites/za/crabominite.png',
  'mega-staraptor': 'https://www.serebii.net/itemdex/sprites/za/staraptite.png',
  'mega-metagross': 'metagrossite',
  'mega-scolipede': 'https://www.serebii.net/itemdex/sprites/za/scolipite.png',
  'mega-scrafty': 'https://www.serebii.net/itemdex/sprites/za/scraftinite.png',
  'mega-eelektross': 'https://www.serebii.net/itemdex/sprites/za/eelektrossite.png',
  'mega-pyroar': 'https://www.serebii.net/itemdex/sprites/za/pyroarite.png',
  'mega-malamar': 'https://www.serebii.net/itemdex/sprites/za/malamarite.png',
  'mega-barbaracle': 'https://www.serebii.net/itemdex/sprites/za/barbaracite.png',
  'mega-dragalge': 'https://www.serebii.net/itemdex/sprites/za/dragalgite.png',
  'mega-falinks': 'https://www.serebii.net/itemdex/sprites/za/falinksite.png',
  'mega-raichu-x': 'https://www.serebii.net/itemdex/sprites/za/raichunitex.png',
  'mega-raichu-y': 'https://www.serebii.net/itemdex/sprites/za/raichunitey.png',
  'mega-sceptile': 'sceptilite',
  'mega-blaziken': 'blazikenite',
  'mega-swampert': 'swampertite',
  'mega-mawile': 'mawilite',
  'mega-salamence': 'salamencite',
  'mega-pidgeot': 'pidgeotite',
  'mega-pinsir': 'pinsirite',
  'mega-sableye': 'sablenite',
  'mega-scizor': 'scizorite',
  'mega-sharpedo': 'sharpedonite',
  'mega-slowbro': 'slowbronite',
  'mega-steelix': 'steelixite',
  'mega-tyranitar': 'tyranitarite',
  'mega-venusaur': 'venusaurite',
}

export const canonicalChampionsItemName = canonicalHeldItem

export const megaStoneForKey = requiredMegaStone

export function isAllowedChampionsItem(key: string, item: string) {
  return isCalculableHeldItem(key, item)
}

export function heldItemError(key: string, item: string, language: SiteLanguage): string | null {
  const { status, requiredStone } = classifyHeldItem(key, item)
  if (status === 'none' || status === 'allowed' || status === 'required-stone') return null
  if (requiredStone) return language === 'en' ? `Item mismatch: requires ${requiredStone}. Open Item to repair.` : language === 'ja' ? `道具不一致: ${requiredStone} が必要です。道具から修正してください。` : `도구 불일치: ${requiredStone} 필요 · 도구에서 수정하세요.`
  return language === 'en' ? 'Unrecognized or incompatible held item. Open Item to repair.' : language === 'ja' ? '未確認または不適合な道具です。道具から修正してください。' : '확인되지 않았거나 부적합한 도구 · 도구에서 수정하세요.'
}

export function itemSpriteSrc(key: string, item: string) {
  const localSpriteSrc = (ref: string) => {
    const cleaned = ref.split('?')[0]?.split('#')[0] ?? ref
    const filename = cleaned.split('/').pop() || cleaned
    return `${import.meta.env.BASE_URL}item-sprites/${filename.endsWith('.png') ? filename : `${filename}.png`}`
  }
  const normalized = canonicalChampionsItemName(item).trim()
  const megaSlug = classifyHeldItem(key, item).status === 'required-stone' ? MEGA_STONE_SPRITE_BY_KEY[key] : null
  if (megaSlug) return localSpriteSrc(megaSlug)
  const spriteSlug = CHAMPIONS_ITEM_SPRITE_MAP[normalized as ChampionsItem]
  if (spriteSlug) return localSpriteSrc(spriteSlug)
  if (megaStoneForKey(key)) return `${import.meta.env.BASE_URL}item-generic.svg`
  return `${import.meta.env.BASE_URL}item-generic.svg`
}

export function matchesLooseQuery(source: string, query: string) {
  if (!query) return true
  if (source.includes(query)) return true
  let cursor = 0
  for (const char of source) {
    if (char === query[cursor]) cursor += 1
    if (cursor >= query.length) return true
  }
  return false
}

export function displayItemLabel(item: string, language: SiteLanguage) {
  const localized = localizedChampionsItemLabel(item, language)
  if (localized !== item) return localized
  const source = resolveItemInfo(canonicalChampionsItemName(item))?.entry ?? resolveItemInfo(item)?.entry
  const sourceName = language === 'ko' ? source?.nameKo : language === 'en' ? source?.nameEn : source?.nameJa
  return sourceName || translateText(language, item)
}

export function filterItemOptions(query: string, language: SiteLanguage = 'ko', options?: { fallbackToAll?: boolean; allowLoose?: boolean }) {
  const normalized = query.trim().toLowerCase()
  const fallbackToAll = options?.fallbackToAll ?? true
  const allowLoose = options?.allowLoose ?? true
  if (!normalized) return byDisplayName(CHAMPIONS_ITEM_OPTIONS, item => displayItemLabel(item, language), item => item, language)
  const matched = [...CHAMPIONS_ITEM_OPTIONS]
    .map((item) => {
      const aliases = CHAMPIONS_ITEM_ALIASES[item] ?? []
      const candidates = [item, displayItemLabel(item, 'en'), displayItemLabel(item, 'ja'), ...aliases].map((entry) => entry.toLowerCase())
      const score = candidates.reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (allowLoose && matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { item, score } : null
    })
    .filter((entry): entry is { item: ChampionsItem; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || compareDisplayName(a.item, b.item, item => displayItemLabel(item, language), item => item, language))
    .map((entry) => entry.item)
  return matched.length ? matched : (fallbackToAll ? byDisplayName(CHAMPIONS_ITEM_OPTIONS, item => displayItemLabel(item, language), item => item, language) : [])
}

export function itemAutocompleteSecondaryLabel(item: string, language: SiteLanguage) {
  if (language === 'ko') return ''
  return item
}

export function itemAutocompletePrimaryLabel(item: string, language: SiteLanguage) {
  const localized = displayItemLabel(item, language)
  return localized && localized.trim() ? localized : item
}
