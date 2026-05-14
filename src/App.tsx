import React from 'react'
import championsData from './pokemon_champions_verified_data.json'
import { sampleMoves } from './sampleMoves'
import { dataSourcePolicy } from './dataSources'
import { defaultEvs, type EffortValues } from './myPartyChampionsSamples'
import { getTypeBadgeLabel, getTypeBadgeSrc } from './typeBadges'
import { getJaName, getJaTypes } from './jaLabels'
import pokemonMovePools from './pokemonMovePools.json'

type Row = {
  id: number
  key: string
  name_ko: string
  name_en: string
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
  fast: number
  neutral: number
  scarf_fast: number
  scarf_neutral: number
  types: string[]
  types_ko: string[]
  abilities: string[]
  abilities_ko: string[]
}

type StatKey = 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed'
type EffortStatKey = keyof EffortValues
type NatureId =
  | 'hardy' | 'lonely' | 'brave' | 'adamant' | 'naughty'
  | 'bold' | 'docile' | 'relaxed' | 'impish' | 'lax'
  | 'timid' | 'hasty' | 'serious' | 'jolly' | 'naive'
  | 'modest' | 'mild' | 'quiet' | 'bashful' | 'rash'
  | 'calm' | 'gentle' | 'sassy' | 'careful' | 'quirky'

type MemberConfig = {
  nature: NatureId
  scarf: boolean
  speedStage: number
}

type PartyTuning = {
  magicNumber: number
  maxValue: number
}

type PartyMember = {
  key: string
  config: MemberConfig
  picked: boolean
  evs: EffortValues
  tuning: PartyTuning
  item: string
  ability: string
}

type OpponentState = {
  key: string
  item: string
  ability: string
  notes: string
  revealedMoves: string[]
  natureBoost: boolean
  scarf: boolean
  speedStage: number
  picked: boolean
}

type SavedSample = {
  id: string
  label: string
  member: PartyMember
}

type CalcMode = 'physical' | 'special'

type PersistedState = {
  party?: PartyMember[]
  opponents?: OpponentState[]
  selectedMy?: number
  selectedOpp?: number
  battleNote?: string
  confirmedMovesByKey?: Record<string, string[]>
  mainSection?: MainSection
  sampleForge?: PartyMember
  savedSamples?: SavedSample[]
}

type ImportExportPayload = PersistedState & {
  version: 1
}

type MoveFilter = 'all' | 'core' | 'options' | 'utility'
type MainSection = 'single' | 'sample'
type MainTab = 'party' | 'pick' | 'speed' | 'power'
type SearchFieldTarget = { side: 'party' | 'opponent'; idx: number } | { side: 'sample' | 'opponentQuick'; idx: 0 } | null
type SiteLanguage = 'ko' | 'en' | 'ja'
type MoveOption = { name: string; type: string | null }
type MovePoolState = { status: 'idle' | 'loading' | 'ready' | 'error'; moves: MoveOption[] }

const STORAGE_KEY = 'pokemon-champions-assistant-demo:v1'
const SPEED_STAGE_OPTIONS = [-2, -1, 0, 1, 2] as const
const MAX_OPPONENTS = 6
const CHAMPIONS_EFFORT_CAP = 66
const CHAMPIONS_EFFORT_PER_STAT_CAP = 32
const EFFORT_CHECKPOINTS = [11, 22, 32] as const
const STAT_GAUGE_MAX = 255
const ITEM_OPTIONS = ['기합의띠', '구애스카프', '구애안경', '구애머리띠', '생명의구슬', '먹다남은음식', '돌격조끼', '약점보험', '자뭉열매', '오카열매', '유루열매', '리샘열매', '반짝가루', '고스트메모리', '금속코트', '검은진흙', '부스트에너지', '클리어참', '풍선', '빛의점토'] as const
const ITEM_ALIASES: Partial<Record<typeof ITEM_OPTIONS[number], string[]>> = {
  '기합의띠': ['기띠', '띠'],
  '구애스카프': ['스카프'],
  '구애안경': ['안경'],
  '구애머리띠': ['머리띠'],
  '생명의구슬': ['생구'],
  '먹다남은음식': ['먹밥', '남은음식'],
  '돌격조끼': ['조끼'],
  '약점보험': ['약보'],
  '부스트에너지': ['부에'],
  '클리어참': ['클참'],
  '빛의점토': ['빛점토'],
}
const ITEM_SPRITE_MAP: Record<string, string> = {
  '기합의띠': 'focus-sash',
  '구애스카프': 'choice-scarf',
  '구애안경': 'choice-specs',
  '구애머리띠': 'choice-band',
  '생명의구슬': 'life-orb',
  '먹다남은음식': 'leftovers',
  '돌격조끼': 'assault-vest',
  '약점보험': 'weakness-policy',
  '자뭉열매': 'figy-berry',
  '오카열매': 'occa-berry',
  '유루열매': 'yache-berry',
  '리샘열매': 'roseli-berry',
  '반짝가루': 'bright-powder',
  '고스트메모리': 'ghost-memory',
  '금속코트': 'metal-coat',
  '검은진흙': 'black-sludge',
  '부스트에너지': 'booster-energy',
  '클리어참': 'clear-amulet',
  '풍선': 'air-balloon',
  '빛의점토': 'light-clay',
}
const MEGA_STONE_SPRITE_BY_KEY: Partial<Record<string, string>> = {
  'mega-abomasnow': 'abomasite',
  'mega-absol': 'absolite',
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
  'mega-gardevoir': 'gardevoirite',
  'mega-gengar': 'gengarite',
  'mega-glalie': 'glalitite',
  'mega-gyarados': 'gyaradosite',
  'mega-heracross': 'heracronite',
  'mega-houndoom': 'houndoominite',
  'mega-kangaskhan': 'kangaskhanite',
  'mega-lopunny': 'lopunnite',
  'mega-lucario': 'lucarionite',
  'mega-manectric': 'manectite',
  'mega-medicham': 'medichamite',
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

const rows = ((championsData.rows as Row[]) ?? []).filter((row): row is Row => typeof row?.key === 'string' && !!row.key)
const indexByKey = new Map(rows.map((row) => [row.key, row]))
const speciesOptions = rows.map((row) => ({
  key: row.key,
  label: `${row.name_ko} (${row.name_en})`,
}))
const starterKeys = ['mega-lopunny', 'mega-delphox', 'garchomp', 'toxapex', 'corviknight', 'kingambit']

function megaStoneForKey(key: string) {
  if (!key.startsWith('mega-')) return null
  const row = indexByKey.get(key)
  if (!row) return null
  const koName = row.name_ko.replace(/^메가/, '').trim()
  const suffixMatch = koName.match(/\s*([XY])$/i)
  if (suffixMatch) {
    const suffix = suffixMatch[1].toUpperCase()
    const baseName = koName.replace(/\s*[XY]$/i, '').trim()
    return `${baseName}나이트${suffix}`
  }
  return `${koName}나이트`
}

function normalizeItemForKey(key: string, item: string) {
  return megaStoneForKey(key) ?? item
}

function isAllowedChampionsItem(key: string, item: string) {
  const normalized = normalizeItemForKey(key, item).trim()
  if (!normalized) return true
  return normalized === megaStoneForKey(key) || ITEM_OPTIONS.includes(normalized as typeof ITEM_OPTIONS[number])
}

function visibleChampionsItem(key: string, item: string) {
  const normalized = normalizeItemForKey(key, item).trim()
  return isAllowedChampionsItem(key, normalized) ? normalized : ''
}

function itemSpriteSrc(key: string, item: string) {
  const normalized = normalizeItemForKey(key, item).trim()
  const megaSlug = MEGA_STONE_SPRITE_BY_KEY[key]
  if (megaSlug) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${megaSlug}.png`
  const spriteSlug = ITEM_SPRITE_MAP[normalized]
  if (spriteSlug) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${spriteSlug}.png`
  if (megaStoneForKey(key)) return `${import.meta.env.BASE_URL}item-generic.svg`
  return `${import.meta.env.BASE_URL}item-generic.svg`
}

const defaultPartyTuning = (): PartyTuning => ({ magicNumber: 0, maxValue: 0 })
const defaultParty: PartyMember[] = starterKeys.map((key) => ({ key, config: { nature: 'jolly', scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: normalizeItemForKey(key, ''), ability: defaultAbilityForKey(key) }))
const defaultSampleForge = (): PartyMember => ({ key: starterKeys[0], config: { nature: 'jolly', scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: normalizeItemForKey(starterKeys[0], ''), ability: defaultAbilityForKey(starterKeys[0]) })
const blankOpponent = (): OpponentState => ({
  key: '',
  item: '',
  ability: '',
  notes: '',
  revealedMoves: [],
  natureBoost: true,
  scarf: false,
  speedStage: 0,
  picked: false,
})
const defaultOpponentKeys = ['rotom', 'garchomp', 'primarina', 'dragapult', 'mimikyu', 'meowscarada'].filter((key) => indexByKey.has(key))
const defaultOpponents: OpponentState[] = defaultOpponentKeys.map((key) => ({
  key,
  item: '',
  ability: '',
  notes: '',
  revealedMoves: [],
  natureBoost: true,
  scarf: false,
  speedStage: 0,
  picked: false,
}))
const emptyOpponents = Array.from({ length: MAX_OPPONENTS }, () => blankOpponent())

const movePowerPresets = [
  { label: '40 선공기', value: 40 },
  { label: '55 약한 견제기', value: 55 },
  { label: '75 기본기', value: 75 },
  { label: '90 주력기', value: 90 },
  { label: '100 고위력', value: 100 },
  { label: '120 대기술', value: 120 },
  { label: '130 초고위력', value: 130 },
]

const EFFORT_STAT_OPTIONS: { key: EffortStatKey; short: string; label: string }[] = [
  { key: 'hp', short: 'HP', label: 'HP' },
  { key: 'attack', short: 'Atk', label: '공격' },
  { key: 'defense', short: 'Def', label: '방어' },
  { key: 'spAttack', short: 'SpA', label: '특수공격' },
  { key: 'spDefense', short: 'SpD', label: '특수방어' },
  { key: 'speed', short: 'Spe', label: '스피드' },
]

const typeChart: Record<string, Partial<Record<string, number>>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5, Ice: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
}

function clampSpeedStage(value: unknown) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(-2, Math.min(2, Math.trunc(num)))
}

const NATURES: { id: NatureId; label: string; up?: StatKey; down?: StatKey }[] = [
  { id: 'hardy', label: '노력', },
  { id: 'lonely', label: '외로움', up: 'attack', down: 'defense' },
  { id: 'brave', label: '용감', up: 'attack', down: 'speed' },
  { id: 'adamant', label: '고집', up: 'attack', down: 'spAttack' },
  { id: 'naughty', label: '개구쟁이', up: 'attack', down: 'spDefense' },
  { id: 'bold', label: '대담', up: 'defense', down: 'attack' },
  { id: 'docile', label: '온순', },
  { id: 'relaxed', label: '무사태평', up: 'defense', down: 'speed' },
  { id: 'impish', label: '장난꾸러기', up: 'defense', down: 'spAttack' },
  { id: 'lax', label: '촐랑', up: 'defense', down: 'spDefense' },
  { id: 'timid', label: '겁쟁이', up: 'speed', down: 'attack' },
  { id: 'hasty', label: '성급', up: 'speed', down: 'defense' },
  { id: 'serious', label: '성실', },
  { id: 'jolly', label: '명랑', up: 'speed', down: 'spAttack' },
  { id: 'naive', label: '천진난만', up: 'speed', down: 'spDefense' },
  { id: 'modest', label: '조심', up: 'spAttack', down: 'attack' },
  { id: 'mild', label: '의젓', up: 'spAttack', down: 'defense' },
  { id: 'quiet', label: '냉정', up: 'spAttack', down: 'speed' },
  { id: 'bashful', label: '수줍음', },
  { id: 'rash', label: '덜렁', up: 'spAttack', down: 'spDefense' },
  { id: 'calm', label: '차분', up: 'spDefense', down: 'attack' },
  { id: 'gentle', label: '얌전', up: 'spDefense', down: 'defense' },
  { id: 'sassy', label: '건방', up: 'spDefense', down: 'speed' },
  { id: 'careful', label: '신중', up: 'spDefense', down: 'spAttack' },
  { id: 'quirky', label: '변덕', },
]

const natureById = new Map(NATURES.map((nature) => [nature.id, nature]))

function legacyNatureFromBoostStat(stat?: unknown): NatureId {
  switch (stat) {
    case 'attack': return 'adamant'
    case 'defense': return 'impish'
    case 'spAttack': return 'modest'
    case 'spDefense': return 'careful'
    case 'speed': return 'jolly'
    default: return 'hardy'
  }
}

function natureMultiplier(natureId: NatureId, stat: StatKey) {
  const nature = natureById.get(natureId)
  if (!nature) return 1
  if (nature.up === stat) return 1.1
  if (nature.down === stat) return 0.9
  return 1
}

function statLabel(stat: StatKey) {
  switch (stat) {
    case 'attack': return '공격'
    case 'defense': return '방어'
    case 'spAttack': return '특공'
    case 'spDefense': return '특방'
    case 'speed': return '스피드'
  }
}

function statThemeClass(stat: EffortStatKey) {
  switch (stat) {
    case 'hp': return 'stat-theme-hp'
    case 'attack': return 'stat-theme-attack'
    case 'defense': return 'stat-theme-defense'
    case 'spAttack': return 'stat-theme-sp-attack'
    case 'spDefense': return 'stat-theme-sp-defense'
    case 'speed': return 'stat-theme-speed'
  }
}

function statGaugePercent(value: number) {
  return `${Math.max(0, Math.min(100, (value / STAT_GAUGE_MAX) * 100))}%`
}

function moveTypeThemeClass(type: string | null | undefined) {
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

function moveOptionsForEntry(entry?: typeof sampleMoves[number] | null) {
  if (!entry) return [] as MoveOption[]
  return Array.from(new Set([...(entry.core ?? []), ...(entry.options ?? []), ...(entry.utility ?? [])])).map((name) => ({ name, type: null }))
}

const moveMetaCache = new Map<string, Promise<MoveOption>>()
const embeddedMovePools = pokemonMovePools as Record<string, MoveOption[]>

function pokemonApiCandidates(key: string) {
  const candidates = [key]
  if (key.startsWith('mega-')) {
    const base = key.slice(5)
    candidates.push(`${base}-mega`, base)
  }
  const regionalPrefixes: Record<string, string> = {
    alolan: 'alola',
    galarian: 'galar',
    hisuian: 'hisui',
    paldean: 'paldea',
  }
  const [first, ...rest] = key.split('-')
  if (regionalPrefixes[first] && rest.length) {
    const base = rest.join('-')
    candidates.push(`${base}-${regionalPrefixes[first]}`, base)
  }
  return Array.from(new Set(candidates))
}

function relatedMovePoolKeys(key: string) {
  const keys = [key]
  if (key.startsWith('mega-')) keys.push(key.slice(5))
  const [first, ...rest] = key.split('-')
  if (['alolan', 'galarian', 'hisuian', 'paldean'].includes(first) && rest.length) keys.push(rest.join('-'))
  return Array.from(new Set(keys))
}

function embeddedMovePoolForKey(key: string) {
  const merged = new Map<string, MoveOption>()
  for (const poolKey of relatedMovePoolKeys(key)) {
    for (const move of embeddedMovePools[poolKey] ?? []) {
      if (!merged.has(move.name)) merged.set(move.name, move)
    }
  }
  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

async function fetchMoveMeta(url: string) {
  if (!moveMetaCache.has(url)) {
    moveMetaCache.set(url, fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`move ${res.status}`)
        return res.json()
      })
      .then((json) => {
        const ko = json.names?.find((entry: any) => entry.language?.name === 'ko')?.name
        return {
          name: ko || json.names?.find((entry: any) => entry.language?.name === 'en')?.name || json.name,
          type: typeof json.type?.name === 'string' ? json.type.name : null,
        }
      })
      .catch(() => {
        const slug = url.split('/').filter(Boolean).pop() || ''
        return {
          name: slug.split('-').map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1)).join(' '),
          type: null,
        }
      }))
  }
  return moveMetaCache.get(url)!
}

async function fetchPokemonMovePool(key: string) {
  let pokemonJson: any = null
  for (const candidate of pokemonApiCandidates(key)) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${candidate}`)
    if (res.ok) {
      pokemonJson = await res.json()
      break
    }
  }
  if (!pokemonJson) throw new Error(`move pool not found for ${key}`)

  const moveUrls = Array.from(new Set((pokemonJson.moves ?? []).map((entry: any) => entry.move?.url).filter(Boolean))) as string[]
  const moves = await Promise.all(moveUrls.map((url) => fetchMoveMeta(url)))
  const byName = new Map<string, MoveOption>()
  for (const move of moves) {
    if (!byName.has(move.name)) byName.set(move.name, move)
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}

function natureLabel(natureId: NatureId) {
  const nature = natureById.get(natureId)
  if (!nature) return natureId
  if (!nature.up || !nature.down) return `${nature.label} (무보정)`
  return `${nature.label} (${statLabel(nature.up)}↑ ${statLabel(nature.down)}↓)`
}

function natureChipLabel(natureId: NatureId) {
  return natureById.get(natureId)?.label ?? natureId
}

function focusAndOpenPicker(el: HTMLInputElement | HTMLSelectElement | null) {
  if (!el) return
  el.focus()
  if ('showPicker' in el && typeof el.showPicker === 'function') {
    try {
      el.showPicker()
    } catch {
      // browser may reject programmatic picker open
    }
  }
}

function boostedStatForNature(natureId: NatureId): StatKey | null {
  return natureById.get(natureId)?.up ?? null
}

function sanitizeMemberConfig(input: unknown): MemberConfig {
  const config = input && typeof input === 'object' ? (input as Partial<MemberConfig>) : {}
  const rawNature = typeof (config as { nature?: unknown }).nature === 'string' ? (config as { nature: NatureId }).nature : null
  return {
    nature: rawNature && natureById.has(rawNature) ? rawNature : legacyNatureFromBoostStat((config as { natureBoostStat?: unknown }).natureBoostStat),
    scarf: Boolean(config.scarf),
    speedStage: clampSpeedStage(config.speedStage),
  }
}

function sanitizePartyTuning(input: unknown): PartyTuning {
  const tuning = input && typeof input === 'object' ? (input as Partial<PartyTuning>) : {}
  return {
    magicNumber: clampNonNegativeInt(tuning.magicNumber, 255),
    maxValue: clampNonNegativeInt(tuning.maxValue, 255),
  }
}

function clampEv(value: unknown, max = CHAMPIONS_EFFORT_PER_STAT_CAP) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(max, Math.trunc(num)))
}

function clampNonNegativeInt(value: unknown, max = 999) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(max, Math.trunc(num)))
}

function totalEffortPoints(evs: EffortValues) {
  return evs.hp + evs.attack + evs.defense + evs.spAttack + evs.spDefense + evs.speed
}

function remainingEffortPoints(evs: EffortValues, field?: EffortStatKey) {
  if (!field) return CHAMPIONS_EFFORT_CAP - totalEffortPoints(evs)
  return CHAMPIONS_EFFORT_CAP - (totalEffortPoints(evs) - evs[field])
}

function applyChampionsEffort(evs: EffortValues, field: keyof EffortValues, nextValue: unknown) {
  const clamped = clampEv(nextValue, CHAMPIONS_EFFORT_PER_STAT_CAP)
  const remainder = remainingEffortPoints(evs, field)
  return {
    ...evs,
    [field]: Math.max(0, Math.min(clamped, remainder)),
  }
}

function sanitizeEvs(input: unknown): EffortValues {
  const evs = input && typeof input === 'object' ? (input as Partial<EffortValues>) : {}
  return {
    hp: clampEv(evs.hp, CHAMPIONS_EFFORT_PER_STAT_CAP),
    attack: clampEv(evs.attack, CHAMPIONS_EFFORT_PER_STAT_CAP),
    defense: clampEv(evs.defense, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spAttack: clampEv(evs.spAttack, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spDefense: clampEv(evs.spDefense, CHAMPIONS_EFFORT_PER_STAT_CAP),
    speed: clampEv(evs.speed, CHAMPIONS_EFFORT_PER_STAT_CAP),
  }
}

function sanitizeParty(input: unknown): PartyMember[] {
  if (!Array.isArray(input)) return defaultParty
  const cleaned = input
    .map((member) => {
      if (!member || typeof member !== 'object') return null
      const raw = member as Partial<PartyMember>
      if (typeof raw.key !== 'string' || !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        config: sanitizeMemberConfig(raw.config),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        evs: sanitizeEvs(raw.evs),
        tuning: sanitizePartyTuning(raw.tuning),
        item: normalizeItemForKey(raw.key, typeof raw.item === 'string' ? raw.item : ''),
        ability: typeof raw.ability === 'string' ? raw.ability : defaultAbilityForKey(raw.key),
      }
    })
    .filter((member): member is PartyMember => Boolean(member))

  return cleaned.length ? cleaned : defaultParty
}

function sanitizeOpponents(input: unknown): OpponentState[] {
  if (!Array.isArray(input)) return defaultOpponents
  const cleaned = input
    .map((opponent) => {
      if (!opponent || typeof opponent !== 'object') return null
      const raw = opponent as Partial<OpponentState>
      if (typeof raw.key !== 'string') return null
      if (raw.key && !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        item: typeof raw.item === 'string' ? raw.item : '',
        ability: typeof raw.ability === 'string' ? raw.ability : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        revealedMoves: Array.isArray(raw.revealedMoves)
          ? raw.revealedMoves.filter((move): move is string => typeof move === 'string')
          : [],
        natureBoost: typeof raw.natureBoost === 'boolean' ? raw.natureBoost : true,
        scarf: typeof raw.scarf === 'boolean' ? raw.scarf : false,
        speedStage: clampSpeedStage(raw.speedStage),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
      }
    })
    .filter((opponent): opponent is OpponentState => Boolean(opponent))
    .slice(0, MAX_OPPONENTS)

  return cleaned.length ? cleaned : defaultOpponents
}

function sanitizeSavedSamples(input: unknown): SavedSample[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry, idx) => {
      if (!entry || typeof entry !== 'object') return null
      const raw = entry as Partial<SavedSample>
      const member = sanitizeParty([raw.member])[0]
      if (!member) return null
      return {
        id: typeof raw.id === 'string' ? raw.id : `sample-${idx}`,
        label: typeof raw.label === 'string' && raw.label.trim() ? raw.label : `${member.key}-${idx + 1}`,
        member,
      }
    })
    .filter((entry): entry is SavedSample => Boolean(entry))
}

function sanitizeSelectedIndex(value: unknown, listLength: number) {
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0 || num >= listLength) return 0
  return num
}

function loadPersistedState(): PersistedState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

function actualStat(base: number, ev: number, natureMultiplierValue = 1, hp = false) {
  if (hp) return Math.floor((((2 * base + 31) * 50) / 100) + 60) + ev
  const raw = Math.floor((((2 * base + 31) * 50) / 100) + 5) + ev
  return Math.floor(raw * natureMultiplierValue)
}

function speedValue(row: Row, config: MemberConfig) {
  let value = natureMultiplier(config.nature, 'speed') > 1 ? row.fast : row.neutral
  if (config.speedStage > 0) {
    value = Math.floor(value * ((2 + config.speedStage) / 2))
  } else if (config.speedStage < 0) {
    value = Math.floor(value * (2 / (2 + Math.abs(config.speedStage))))
  }
  if (config.scarf) value = Math.floor(value * 1.5)
  return value
}

function partySpeedValue(row: Row, member: PartyMember) {
  let value = actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  if (member.config.speedStage > 0) value = Math.floor(value * ((2 + member.config.speedStage) / 2))
  else if (member.config.speedStage < 0) value = Math.floor(value * (2 / (2 + Math.abs(member.config.speedStage))))
  if (member.config.scarf) value = Math.floor(value * 1.5)
  return value
}

function applySpeedStage(value: number, speedStage: number) {
  if (speedStage > 0) return Math.floor(value * ((2 + speedStage) / 2))
  if (speedStage < 0) return Math.floor(value * (2 / (2 + Math.abs(speedStage))))
  return value
}

function opponentScenarioSpeed(row: Row, speedPoints: number, boosted: boolean, scarf: boolean, speedStage: number) {
  let value = actualStat(row.speed, speedPoints, boosted ? 1.1 : 1)
  value = applySpeedStage(value, speedStage)
  if (scarf) value = Math.floor(value * 1.5)
  return value
}

function opponentScenarioNeeds(row: Row, mySpeed: number, boosted: boolean, scarf: boolean, speedStage: number) {
  let tieEffort: number | null = null
  let passEffort: number | null = null

  for (let points = 0; points <= CHAMPIONS_EFFORT_PER_STAT_CAP; points += 1) {
    const speed = opponentScenarioSpeed(row, points, boosted, scarf, speedStage)
    if (tieEffort === null && speed === mySpeed) tieEffort = points
    if (passEffort === null && speed >= mySpeed) passEffort = points
    if (tieEffort !== null && passEffort !== null) break
  }

  return { tieEffort, passEffort }
}

function partyStatValue(row: Row, member: PartyMember, field: keyof EffortValues) {
  switch (field) {
    case 'hp':
      return actualStat(row.hp, member.evs.hp, 1, true)
    case 'attack':
      return actualStat(row.attack, member.evs.attack, natureMultiplier(member.config.nature, 'attack'))
    case 'defense':
      return actualStat(row.defense, member.evs.defense, natureMultiplier(member.config.nature, 'defense'))
    case 'spAttack':
      return actualStat(row.spAttack, member.evs.spAttack, natureMultiplier(member.config.nature, 'spAttack'))
    case 'spDefense':
      return actualStat(row.spDefense, member.evs.spDefense, natureMultiplier(member.config.nature, 'spDefense'))
    case 'speed':
      return actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  }
}

function findMagicNumberCandidate(row: Row, member: PartyMember) {
  const boostedStat = boostedStatForNature(member.config.nature)
  if (!boostedStat) return null

  const currentActual = partyStatValue(row, member, boostedStat)
  const currentEffort = member.evs[boostedStat]
  const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(member.evs, boostedStat))
  const currentHit = currentActual % 11 === 0

  let nextEffort = currentEffort
  let nextActual = currentActual
  if (!currentHit) {
    let found = false
    for (let effort = currentEffort; effort <= availableCap; effort += 1) {
      const candidateMember = { ...member, evs: { ...member.evs, [boostedStat]: effort } }
      const actual = partyStatValue(row, candidateMember, boostedStat)
      if (actual % 11 === 0) {
        nextEffort = effort
        nextActual = actual
        found = true
        break
      }
    }
    if (!found) return {
      stat: boostedStat,
      reached: false,
      currentActual,
      currentEffort,
      nextEffort: null,
      nextActual: null,
    }
  }

  return {
    stat: boostedStat,
    reached: currentHit,
    currentActual,
    currentEffort,
    nextEffort,
    nextActual,
  }
}

function magicEffortPoints(row: Row, member: PartyMember, stat: EffortStatKey) {
  const boostedStat = boostedStatForNature(member.config.nature)
  if (boostedStat !== stat) return [] as number[]

  const points: number[] = []
  for (let effort = 1; effort <= CHAMPIONS_EFFORT_PER_STAT_CAP; effort += 1) {
    const candidateMember = { ...member, evs: { ...member.evs, [stat]: effort } }
    const actual = partyStatValue(row, candidateMember, stat)
    if (actual % 11 === 0) points.push(effort)
  }
  return points
}

function typeEffectiveness(attackType: string, defendTypes: string[]) {
  return defendTypes.reduce((acc, defendType) => acc * (typeChart[attackType]?.[defendType] ?? 1), 1)
}

function matchupHints(attacker: Row, defender: Row) {
  const attackOptions = attacker.types.map((type, idx) => ({
    type,
    typeKo: attacker.types_ko[idx] ?? type,
    multiplier: typeEffectiveness(type, defender.types),
  }))
  const defenseOptions = defender.types.map((type, idx) => ({
    type,
    typeKo: defender.types_ko[idx] ?? type,
    multiplier: typeEffectiveness(type, attacker.types),
  }))

  const bestAttack = [...attackOptions].sort((a, b) => b.multiplier - a.multiplier)[0]
  const worstDefense = [...defenseOptions].sort((a, b) => b.multiplier - a.multiplier)[0]
  const resistAttack = [...attackOptions].sort((a, b) => a.multiplier - b.multiplier)[0]

  return { bestAttack, worstDefense, resistAttack }
}

function togglePicked<T extends { picked: boolean }>(list: T[], idx: number, maxPicks = 3) {
  const next = [...list]
  const current = next[idx]
  if (!current) return list
  const pickedCount = next.filter((item) => item.picked).length
  if (!current.picked && pickedCount >= maxPicks) return list
  next[idx] = { ...current, picked: !current.picked }
  return next
}

function calcDamage(attacker: Row, defender: Row, movePower: number, mode: CalcMode, stab = 1.5, effectiveness = 1) {
  const attackStat = mode === 'physical' ? attacker.attack : attacker.spAttack
  const defenseStat = mode === 'physical' ? defender.defense : defender.spDefense
  const base = (((22 * movePower * attackStat) / Math.max(1, defenseStat)) / 50) + 2
  const min = Math.floor(base * stab * effectiveness * 0.85)
  const max = Math.floor(base * stab * effectiveness)
  return {
    min,
    max,
    minPct: ((min / defender.hp) * 100).toFixed(1),
    maxPct: ((max / defender.hp) * 100).toFixed(1),
  }
}

function matchesLooseQuery(source: string, query: string) {
  if (!query) return true
  if (source.includes(query)) return true
  let cursor = 0
  for (const char of source) {
    if (char === query[cursor]) cursor += 1
    if (cursor >= query.length) return true
  }
  return false
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[\s'’._-]+/g, '')
}

function speciesSearchCandidates(row: Row) {
  const base = [row.name_ko, row.name_en, row.key]
  const extra: string[] = []
  if (row.name_ko.startsWith('메가')) extra.push(row.name_ko.replace(/^메가/, ''))
  if (row.name_en.toLowerCase().startsWith('mega ')) extra.push(row.name_en.replace(/^Mega\s+/i, ''))
  if (row.key.startsWith('mega-')) extra.push(row.key.slice(5))
  return Array.from(new Set([...base, ...extra].flatMap((entry) => [entry, normalizeSearchText(entry)])))
}

function filterSpeciesOptions(query: string) {
  const normalized = normalizeSearchText(query.trim())
  if (!normalized) return speciesOptions
  return rows
    .map((row) => {
      const candidates = speciesSearchCandidates(row)
      const score = candidates.reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { row, score } : null
    })
    .filter((entry): entry is { row: Row; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.row.name_ko.localeCompare(b.row.name_ko, 'ko'))
    .map((entry) => ({ key: entry.row.key, label: `${entry.row.name_ko} (${entry.row.name_en})` }))
}

function filterItemOptions(query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...ITEM_OPTIONS]
  return [...ITEM_OPTIONS]
    .map((item) => {
      const aliases = ITEM_ALIASES[item] ?? []
      const candidates = [item, ...aliases].map((entry) => entry.toLowerCase())
      const score = candidates.reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { item, score } : null
    })
    .filter((entry): entry is { item: typeof ITEM_OPTIONS[number]; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.item.localeCompare(b.item, 'ko'))
    .map((entry) => entry.item)
}

function resolveItemInput(key: string, raw: string) {
  const fixed = megaStoneForKey(key)
  if (fixed) return fixed
  const top = filterItemOptions(raw)[0]
  return top && isAllowedChampionsItem(key, top) ? top : ''
}

function filterMoveOptions(query: string, options: MoveOption[]) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return options
  const scored = options
    .map((option) => {
      const name = option.name.toLowerCase()
      if (name === normalized) return { option, score: 0 }
      if (name.startsWith(normalized)) return { option, score: 1 }
      if (name.includes(normalized)) return { option, score: 2 }
      if (matchesLooseQuery(name, normalized)) return { option, score: 3 }
      return null
    })
    .filter((entry): entry is { option: MoveOption; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.option.name.localeCompare(b.option.name, 'ko'))
  return scored.map((entry) => entry.option)
}

function resolveSpeciesKey(raw: string) {
  const normalized = normalizeSearchText(raw.trim())
  if (!normalized) return null
  return filterSpeciesOptions(normalized)[0]?.key ?? null
}

function displayName(row: Row, language: SiteLanguage) {
  if (language === 'en') return row.name_en
  if (language === 'ja') return getJaName(row.key, row.name_ko, row.name_en)
  return row.name_ko
}

function displayTypes(row: Row, language: SiteLanguage) {
  if (language === 'en') return row.types
  if (language === 'ja') return getJaTypes(row.types)
  return row.types_ko
}

function displayAbilities(row: Row, language: SiteLanguage) {
  if (language === 'en') return row.abilities
  if (language === 'ja') return row.abilities
  return row.abilities_ko
}

function defaultAbilityForKey(key: string) {
  const row = indexByKey.get(key)
  if (!row) return ''
  return row.abilities_ko[0] || row.abilities[0] || ''
}

function searchDisplayLabel(key: string, language: SiteLanguage) {
  const row = indexByKey.get(key)
  if (!row) return key
  return displayName(row, language)
}

function sameSearchTarget(a: SearchFieldTarget, side: 'party' | 'opponent' | 'sample' | 'opponentQuick', idx: number) {
  return a?.side === side && a?.idx === idx
}

function menuLabelForTab(tab: MainTab) {
  switch (tab) {
    case 'party': return '내 파티 관리'
    case 'pick': return '상대 엔트리'
    case 'speed': return '스피드 계산'
    case 'power': return '결정력 계산'
  }
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="language-icon-svg">
      <path fill="currentColor" d="M4 7h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
    </svg>
  )
}

function TypeBadgeImage({ type }: { type: string }) {
  const label = getTypeBadgeLabel(type)
  return <img src={getTypeBadgeSrc(type)} alt={label} className="type-badge-image" title={label} />
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="language-icon-svg">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.93 9h-3.14a15.4 15.4 0 0 0-1.38-5.03A8.03 8.03 0 0 1 18.93 11ZM12 4.07c.78.95 1.86 3.15 2.31 6.93H9.69C10.14 7.22 11.22 5.02 12 4.07ZM4.07 13h3.14a15.4 15.4 0 0 0 1.38 5.03A8.03 8.03 0 0 1 4.07 13Zm3.14-2H4.07a8.03 8.03 0 0 1 4.52-5.03A15.4 15.4 0 0 0 7.21 11Zm4.79 8.93c-.78-.95-1.86-3.15-2.31-6.93h4.62c-.45 3.78-1.53 5.98-2.31 6.93ZM14.41 18.03A15.4 15.4 0 0 0 15.79 13h3.14a8.03 8.03 0 0 1-4.52 5.03Z"/>
    </svg>
  )
}

export default function App() {
  const persisted = React.useMemo(() => loadPersistedState(), [])
  const [party, setParty] = React.useState<PartyMember[]>(() => sanitizeParty(persisted?.party))
  const [opponents, setOpponents] = React.useState<OpponentState[]>(() => sanitizeOpponents(persisted?.opponents))
  const [selectedMy, setSelectedMy] = React.useState(() => sanitizeSelectedIndex(persisted?.selectedMy, sanitizeParty(persisted?.party).length))
  const [selectedOpp, setSelectedOpp] = React.useState(() => sanitizeSelectedIndex(persisted?.selectedOpp, sanitizeOpponents(persisted?.opponents).length))
  const [movePower, setMovePower] = React.useState(90)
  const [calcMode, setCalcMode] = React.useState<CalcMode>('special')
  const [stab, setStab] = React.useState(1.5)
  const [effectiveness, setEffectiveness] = React.useState(1)
  const [battleNote, setBattleNote] = React.useState(() => typeof persisted?.battleNote === 'string' ? persisted.battleNote : '')
  const [mainSection, setMainSection] = React.useState<MainSection>(() => persisted?.mainSection === 'sample' ? 'sample' : 'single')
  const [activeTab, setActiveTab] = React.useState<MainTab>('party')
  const [siteLanguage, setSiteLanguage] = React.useState<SiteLanguage>('ko')
  const [moveFilter, setMoveFilter] = React.useState<MoveFilter>('all')
  const [moveSearch, setMoveSearch] = React.useState('')
  const [confirmedMovesByKey, setConfirmedMovesByKey] = React.useState<Record<string, string[]>>(() => persisted?.confirmedMovesByKey ?? {})
  const [partySearch, setPartySearch] = React.useState<string[]>(() => sanitizeParty(persisted?.party).map((member) => searchDisplayLabel(member.key, 'ko')))
  const [opponentSearch, setOpponentSearch] = React.useState<string[]>(() => sanitizeOpponents(persisted?.opponents).map((member) => searchDisplayLabel(member.key, 'ko')))
  const [activeSearchField, setActiveSearchField] = React.useState<SearchFieldTarget>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false)
  const [navMenuOpen, setNavMenuOpen] = React.useState(false)
  const [tuningModalIndex, setTuningModalIndex] = React.useState<number | null>(null)
  const [sampleForge, setSampleForge] = React.useState<PartyMember>(() => persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge())
  const [sampleSearch, setSampleSearch] = React.useState(() => searchDisplayLabel((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, 'ko'))
  const [savedSamples, setSavedSamples] = React.useState<SavedSample[]>(() => sanitizeSavedSamples(persisted?.savedSamples))
  const [sampleLabelDraft, setSampleLabelDraft] = React.useState('')
  const [opponentQuickSearch, setOpponentQuickSearch] = React.useState('')
  const [partyItemDrafts, setPartyItemDrafts] = React.useState<string[]>(() => sanitizeParty(persisted?.party).map((member) => visibleChampionsItem(member.key, member.item)))
  const [sampleItemDraft, setSampleItemDraft] = React.useState(() => visibleChampionsItem((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, (persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).item))
  const [movePoolByKey, setMovePoolByKey] = React.useState<Record<string, MovePoolState>>({})
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const opponentQuickInputRef = React.useRef<HTMLInputElement | null>(null)
  const [activePartyMetaEditor, setActivePartyMetaEditor] = React.useState<{ idx: number; field: 'ability' | 'nature' | 'item' } | null>(null)
  const [activeSampleMetaEditor, setActiveSampleMetaEditor] = React.useState<'ability' | 'nature' | 'item' | null>(null)
  const partyAbilityEditorRefs = React.useRef<(HTMLSelectElement | null)[]>([])
  const partyNatureEditorRefs = React.useRef<(HTMLSelectElement | null)[]>([])
  const partyItemEditorRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const sampleAbilityEditorRef = React.useRef<HTMLSelectElement | null>(null)
  const sampleNatureEditorRef = React.useRef<HTMLSelectElement | null>(null)
  const sampleItemEditorRef = React.useRef<HTMLInputElement | null>(null)
  const tuningMember = tuningModalIndex !== null ? party[tuningModalIndex] : null
  const tuningRow = tuningMember?.key ? (indexByKey.get(tuningMember.key) ?? rows[0]) : null
  const magicCandidate = tuningMember && tuningRow ? findMagicNumberCandidate(tuningRow, tuningMember) : null

  React.useEffect(() => {
    const safeSelectedMy = sanitizeSelectedIndex(selectedMy, party.length)
    const safeSelectedOpp = sanitizeSelectedIndex(selectedOpp, opponents.length)
    if (safeSelectedMy !== selectedMy) setSelectedMy(safeSelectedMy)
    if (safeSelectedOpp !== selectedOpp) setSelectedOpp(safeSelectedOpp)
    setPartySearch((prev) => party.map((member, idx) => prev[idx] ?? searchDisplayLabel(member.key, siteLanguage)))
    setOpponentSearch((prev) => opponents.map((member, idx) => prev[idx] ?? searchDisplayLabel(member.key, siteLanguage)))
    setPartyItemDrafts((prev) => party.map((member, idx) => prev[idx] ?? visibleChampionsItem(member.key, member.item)))
  }, [party, opponents, selectedMy, selectedOpp, siteLanguage])

  React.useEffect(() => {
    setSampleItemDraft(visibleChampionsItem(sampleForge.key, sampleForge.item))
  }, [sampleForge.key, sampleForge.item])

  React.useEffect(() => {
    if (!activePartyMetaEditor) return
    const { idx, field } = activePartyMetaEditor
    const el = field === 'ability'
      ? partyAbilityEditorRefs.current[idx]
      : field === 'nature'
        ? partyNatureEditorRefs.current[idx]
        : partyItemEditorRefs.current[idx]
    const timer = window.setTimeout(() => focusAndOpenPicker(el ?? null), 0)
    return () => window.clearTimeout(timer)
  }, [activePartyMetaEditor])

  React.useEffect(() => {
    if (!activeSampleMetaEditor) return
    const el = activeSampleMetaEditor === 'ability'
      ? sampleAbilityEditorRef.current
      : activeSampleMetaEditor === 'nature'
        ? sampleNatureEditorRef.current
        : sampleItemEditorRef.current
    const timer = window.setTimeout(() => focusAndOpenPicker(el ?? null), 0)
    return () => window.clearTimeout(timer)
  }, [activeSampleMetaEditor])

  React.useEffect(() => {
    const targetKeys = Array.from(new Set([...party.map((member) => member.key), sampleForge.key].filter(Boolean)))
    targetKeys.forEach((key) => {
      const embedded = embeddedMovePoolForKey(key)
      if (embedded.length && movePoolByKey[key]?.status !== 'ready') {
        setMovePoolByKey((prev) => ({ ...prev, [key]: { status: 'ready', moves: embedded } }))
        return
      }
      if (movePoolByKey[key]?.status === 'loading' || movePoolByKey[key]?.status === 'ready') return
      setMovePoolByKey((prev) => ({ ...prev, [key]: { status: 'loading', moves: prev[key]?.moves ?? [] } }))
      fetchPokemonMovePool(key)
        .then((moves) => setMovePoolByKey((prev) => ({ ...prev, [key]: { status: 'ready', moves } })))
        .catch(() => {
          const fallback = moveOptionsForEntry(sampleMoves.find((entry) => entry.key === key))
          setMovePoolByKey((prev) => ({ ...prev, [key]: { status: fallback.length ? 'ready' : 'error', moves: fallback } }))
        })
    })
  }, [party, sampleForge.key, movePoolByKey])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const payload: PersistedState = {
      party,
      opponents,
      selectedMy,
      selectedOpp,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      sampleForge,
      savedSamples,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [party, opponents, selectedMy, selectedOpp, battleNote, confirmedMovesByKey, mainSection, sampleForge, savedSamples])

  const myMember = party[selectedMy] ?? party[0]
  const oppMember = opponents[selectedOpp] ?? opponents[0]
  const sampleRow = indexByKey.get(sampleForge.key) ?? rows[0]
  const myRow = indexByKey.get(myMember.key) ?? rows[0]
  const oppRow = oppMember.key ? (indexByKey.get(oppMember.key) ?? rows[0]) : null

  const mySpeed = partySpeedValue(myRow, myMember)
  const oppSpeed = oppRow ? speedValue(oppRow, {
    nature: oppMember.natureBoost ? 'jolly' : 'hardy',
    scarf: oppMember.scarf || oppMember.item.includes('스카프'),
    speedStage: oppMember.speedStage,
  }) : null
  const pickedParty = party.filter((member) => member.picked)
  const pickedOpponents = opponents.filter((member) => member.picked)
  const opponentSpeedScenarios = oppRow ? [
    { id: 'neutral', label: '준속', boosted: false, scarf: false },
    { id: 'fast', label: '최속', boosted: true, scarf: false },
    { id: 'neutral-scarf', label: '준속 스카프', boosted: false, scarf: true },
    { id: 'fast-scarf', label: '최속 스카프', boosted: true, scarf: true },
  ].map((scenario) => {
    const speedAtMax = opponentScenarioSpeed(oppRow, CHAMPIONS_EFFORT_PER_STAT_CAP, scenario.boosted, scenario.scarf, oppMember.speedStage)
    const needs = opponentScenarioNeeds(oppRow, mySpeed, scenario.boosted, scenario.scarf, oppMember.speedStage)
    return {
      ...scenario,
      speedAtMax,
      result: mySpeed > speedAtMax ? '내가 앞섬' : mySpeed < speedAtMax ? '상대가 앞섬' : '동속',
      ...needs,
    }
  }) : []
  const toggleConfirmedMove = (key: string, move: string) => {
    setConfirmedMovesByKey((prev) => {
      const current = prev[key] ?? []
      const next = current.includes(move) ? current.filter((item) => item !== move) : [...current, move]
      return { ...prev, [key]: next }
    })
  }
  const setConfirmedMoveSlot = (key: string, slotIdx: number, move: string) => {
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      while (current.length < 4) current.push('')
      current[slotIdx] = move
      const cleaned = current.map((entry) => entry.trim()).filter(Boolean).slice(0, 4)
      return { ...prev, [key]: cleaned }
    })
  }
  const commitTopMoveOption = (key: string, slotIdx: number, rawQuery: string, options: MoveOption[]) => {
    const top = filterMoveOptions(rawQuery, options)[0]
    if (!top) return false
    setConfirmedMoveSlot(key, slotIdx, top.name)
    return true
  }
  const applyMoveToSlot = (key: string, move: string) => {
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      const existingIdx = current.indexOf(move)
      if (existingIdx >= 0) {
        current.splice(existingIdx, 1)
        return { ...prev, [key]: current }
      }
      if (current.length < 4) return { ...prev, [key]: [...current, move] }
      current[3] = move
      return { ...prev, [key]: current }
    })
  }
  const commitTopSpeciesOption = (side: 'party' | 'opponent' | 'sample', idx: number, rawQuery: string) => {
    const top = filterSpeciesOptions(rawQuery)[0]
    if (!top) return false
    selectSpecies(side, idx, top.key)
    return true
  }
  const selectSpecies = (side: 'party' | 'opponent' | 'sample', idx: number, key: string) => {
    if (side === 'party') {
      const member = party[idx]
      if (!member) return
      const next = [...party]
      next[idx] = { ...member, key, ability: defaultAbilityForKey(key), item: normalizeItemForKey(key, member.item) }
      setParty(next)
      setPartyItemDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = visibleChampionsItem(key, next[idx].item)
        return nextDrafts
      })
      const nextSearch = [...partySearch]
      nextSearch[idx] = searchDisplayLabel(key, siteLanguage)
      setPartySearch(nextSearch)
    } else if (side === 'opponent') {
      const member = opponents[idx]
      if (!member) return
      const next = [...opponents]
      next[idx] = { ...member, key }
      setOpponents(next)
      const nextSearch = [...opponentSearch]
      nextSearch[idx] = searchDisplayLabel(key, siteLanguage)
      setOpponentSearch(nextSearch)
    } else {
      setSampleForge((prev) => ({ ...prev, key, ability: defaultAbilityForKey(key), item: normalizeItemForKey(key, prev.item) }))
      setSampleItemDraft(visibleChampionsItem(key, normalizeItemForKey(key, sampleForge.item)))
      setSampleSearch(searchDisplayLabel(key, siteLanguage))
      setActiveSampleMetaEditor(null)
    }
    setActiveSearchField(null)
  }
  const trackedKeys = Array.from(new Set([...party.map((member) => member.key), ...opponents.map((member) => member.key)]))
  const moveCards = trackedKeys
    .map((key) => {
      const moveSet = sampleMoves.find((entry) => entry.key === key)
      const row = indexByKey.get(key)
      if (!moveSet || !row) return null
      const buckets = [
        moveFilter === 'all' || moveFilter === 'core' ? moveSet.core.map((move) => ({ move, kind: 'core' as const })) : [],
        moveFilter === 'all' || moveFilter === 'options' ? (moveSet.options ?? []).map((move) => ({ move, kind: 'options' as const })) : [],
        moveFilter === 'all' || moveFilter === 'utility' ? (moveSet.utility ?? []).map((move) => ({ move, kind: 'utility' as const })) : [],
      ].flat().filter((entry) => !moveSearch || entry.move.includes(moveSearch))
      if (!buckets.length && moveSearch) return null
      return { key, row, moveSet, buckets, confirmed: confirmedMovesByKey[key] ?? [] }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const damage = oppRow ? calcDamage(myRow, oppRow, movePower, calcMode, stab, effectiveness) : null
  const sampleMoveSet = sampleMoves.find((entry) => entry.key === sampleForge.key)
  const sampleMovePool = movePoolByKey[sampleForge.key]
  const sampleMoveOptions = sampleMovePool?.moves?.length ? sampleMovePool.moves : (embeddedMovePoolForKey(sampleForge.key).length ? embeddedMovePoolForKey(sampleForge.key) : moveOptionsForEntry(sampleMoveSet))
  const sampleMoveType = (moveName: string) => sampleMoveOptions.find((option) => option.name === moveName)?.type ?? null
  const sampleRegisteredMoves = [...(confirmedMovesByKey[sampleForge.key] ?? [])]
  while (sampleRegisteredMoves.length < 4) sampleRegisteredMoves.push('')
  const sampleAbilityOptions = displayAbilities(sampleRow, siteLanguage)
  const sampleAbility = sampleForge.ability || sampleAbilityOptions[0] || defaultAbilityForKey(sampleForge.key)
  const sampleFixedMegaStone = megaStoneForKey(sampleForge.key)
  const sampleCurrentItem = visibleChampionsItem(sampleForge.key, sampleForge.item)

  const saveCurrentSample = () => {
    const label = sampleLabelDraft.trim() || `${displayName(sampleRow, 'ko')} · ${natureLabel(sampleForge.config.nature)}`
    const saved: SavedSample = {
      id: `sample-${Date.now()}`,
      label,
      member: { ...sampleForge, evs: { ...sampleForge.evs }, config: { ...sampleForge.config }, tuning: { ...sampleForge.tuning } },
    }
    setSavedSamples((prev) => [saved, ...prev])
    setSampleLabelDraft('')
  }

  const applySampleToPartySlot = (slotIdx: number) => {
    const target = party[slotIdx]
    if (!target) return
    const next = [...party]
    next[slotIdx] = {
      ...sampleForge,
      picked: target.picked,
      key: sampleForge.key,
      evs: { ...sampleForge.evs },
      config: { ...sampleForge.config },
      tuning: { ...sampleForge.tuning },
      item: sampleForge.item,
    }
    setParty(next)
    setPartyItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[slotIdx] = visibleChampionsItem(sampleForge.key, sampleForge.item)
      return nextDrafts
    })
    const nextSearch = [...partySearch]
    nextSearch[slotIdx] = searchDisplayLabel(sampleForge.key, siteLanguage)
    setPartySearch(nextSearch)
    setSelectedMy(slotIdx)
    setMainSection('single')
    setActiveTab('party')
  }

  const updateTuningEffortFromPointer = (slotIdx: number, stat: EffortStatKey, availableCap: number, clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const nextValue = Math.round(ratio * availableCap)
    const next = [...party]
    next[slotIdx] = { ...next[slotIdx], evs: applyChampionsEffort(next[slotIdx].evs, stat, nextValue) }
    setParty(next)
  }

  const nextOpponentSlotIndex = (fromIdx: number) => {
    const emptyAfter = opponents.findIndex((member, idx) => idx > fromIdx && !member.key)
    if (emptyAfter >= 0) return emptyAfter
    if (fromIdx + 1 < MAX_OPPONENTS) return fromIdx + 1
    return fromIdx
  }

  const commitOpponentQuickSearch = (forcedKey?: string) => {
    const resolvedKey = forcedKey ?? resolveSpeciesKey(opponentQuickSearch) ?? filterSpeciesOptions(opponentQuickSearch)[0]?.key
    if (!resolvedKey) return
    const slotIdx = selectedOpp
    const next = [...opponents]
    next[slotIdx] = { ...next[slotIdx], key: resolvedKey }
    setOpponents(next)
    const nextSearch = [...opponentSearch]
    nextSearch[slotIdx] = searchDisplayLabel(resolvedKey, siteLanguage)
    setOpponentSearch(nextSearch)
    const nextIdx = nextOpponentSlotIndex(slotIdx)
    setSelectedOpp(nextIdx)
    setOpponentQuickSearch('')
    setActiveSearchField({ side: 'opponentQuick', idx: 0 })
    setTimeout(() => opponentQuickInputRef.current?.focus(), 0)
  }

  const resetOpponentsForFreshEntry = () => {
    const next = emptyOpponents.map((entry) => ({ ...entry, revealedMoves: [...entry.revealedMoves] }))
    setOpponents(next)
    setOpponentSearch(next.map(() => ''))
    setSelectedOpp(0)
    setOpponentQuickSearch('')
    setTimeout(() => opponentQuickInputRef.current?.focus(), 0)
  }

  const resetPartyForFreshEntry = () => {
    setParty(defaultParty)
    setPartySearch(defaultParty.map((member) => searchDisplayLabel(member.key, siteLanguage)))
    setPartyItemDrafts(defaultParty.map((member) => visibleChampionsItem(member.key, member.item)))
    setSelectedMy(0)
    setActivePartyMetaEditor(null)
    setTuningModalIndex(null)
  }

  const resetAll = () => {
    setParty(defaultParty)
    setPartyItemDrafts(defaultParty.map((member) => visibleChampionsItem(member.key, member.item)))
    setOpponents(defaultOpponents)
    setPartySearch(defaultParty.map((member) => searchDisplayLabel(member.key, siteLanguage)))
    setOpponentSearch(defaultOpponents.map((member) => searchDisplayLabel(member.key, siteLanguage)))
    setSelectedMy(0)
    setSelectedOpp(0)
    setMovePower(90)
    setCalcMode('special')
    setStab(1.5)
    setEffectiveness(1)
    setBattleNote('')
    setConfirmedMovesByKey({})
    setMainSection('single')
    setSampleForge(defaultSampleForge())
    setSampleItemDraft(visibleChampionsItem(defaultSampleForge().key, defaultSampleForge().item))
    setSampleSearch(searchDisplayLabel(defaultSampleForge().key, siteLanguage))
    setSavedSamples([])
    setSampleLabelDraft('')
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY)
  }

  const exportState = () => {
    if (typeof window === 'undefined') return
    const payload: ImportExportPayload = {
      version: 1,
      party,
      opponents,
      selectedMy,
      selectedOpp,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      sampleForge,
      savedSamples,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pokemon-champions-state.json'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const importState = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as ImportExportPayload
      const nextParty = sanitizeParty(parsed.party)
      setParty(nextParty)
      setPartyItemDrafts(nextParty.map((member) => visibleChampionsItem(member.key, member.item)))
      const nextOpponents = sanitizeOpponents(parsed.opponents)
      setOpponents(nextOpponents)
      setPartySearch(nextParty.map((member) => searchDisplayLabel(member.key, siteLanguage)))
      setOpponentSearch(nextOpponents.map((member) => searchDisplayLabel(member.key, siteLanguage)))
      setSelectedMy(sanitizeSelectedIndex(parsed.selectedMy, nextParty.length))
      setSelectedOpp(sanitizeSelectedIndex(parsed.selectedOpp, nextOpponents.length))
      setBattleNote(typeof parsed.battleNote === 'string' ? parsed.battleNote : '')
      setConfirmedMovesByKey(parsed.confirmedMovesByKey ?? {})
      setMainSection(parsed.mainSection === 'sample' ? 'sample' : 'single')
      const nextSampleForge = parsed.sampleForge ? sanitizeParty([parsed.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge()
      setSampleForge(nextSampleForge)
      setSampleItemDraft(visibleChampionsItem(nextSampleForge.key, nextSampleForge.item))
      setSampleSearch(searchDisplayLabel(nextSampleForge.key, siteLanguage))
      setSavedSamples(sanitizeSavedSamples(parsed.savedSamples))
      setSampleLabelDraft('')
    } catch {
      if (typeof window !== 'undefined') window.alert('불러오기 실패: JSON 형식을 확인하세요.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="app-shell">
      <header>
        <div className="header-top-row">
          <button type="button" className="icon-button" aria-label="메뉴" title="Menu" onClick={() => setNavMenuOpen((prev) => !prev)}>
            <HamburgerIcon />
          </button>
          <div>
            <h1>Pokemon Champions Battle Assistant Demo</h1>
            <p>파티 저장, 스피드 비교, 상대 도구 기록, 간단 데미지 계산, 단일 샘플 깎기까지.</p>
          </div>
        </div>
        <div className="top-actions">
          <div className="language-menu-wrap">
            <button type="button" className="icon-button" aria-label="언어 선택" title="Language" onClick={() => setLanguageMenuOpen((prev) => !prev)}>
              <LanguageIcon />
            </button>
            {languageMenuOpen ? (
              <div className="language-menu">
                <button type="button" className={`language-menu-item ${siteLanguage === 'ko' ? 'active' : ''}`} onClick={() => { setSiteLanguage('ko'); setLanguageMenuOpen(false) }}>한국어</button>
                <button type="button" className={`language-menu-item ${siteLanguage === 'ja' ? 'active' : ''}`} onClick={() => { setSiteLanguage('ja'); setLanguageMenuOpen(false) }}>日本語</button>
                <button type="button" className={`language-menu-item ${siteLanguage === 'en' ? 'active' : ''}`} onClick={() => { setSiteLanguage('en'); setLanguageMenuOpen(false) }}>English</button>
              </div>
            ) : null}
          </div>
          <button type="button" className="action-button" onClick={exportState}>상태 내보내기</button>
          <button type="button" className="action-button" onClick={() => fileInputRef.current?.click()}>상태 불러오기</button>
          <button type="button" className="action-button danger" onClick={resetAll}>전체 초기화</button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden-file" onChange={importState} />
        </div>
        {navMenuOpen ? (
          <div className="nav-drawer">
            <button type="button" className={`nav-item ${mainSection === 'single' ? 'active' : ''}`} onClick={() => { setMainSection('single'); setNavMenuOpen(false) }}>
              싱글배틀 메뉴
              <span>{menuLabelForTab(activeTab)}</span>
            </button>
            <button type="button" className={`nav-item ${mainSection === 'sample' ? 'active' : ''}`} onClick={() => { setMainSection('sample'); setNavMenuOpen(false) }}>
              포켓몬 샘플 깎기
              <span>포켓몬 하나 집중 조정</span>
            </button>
          </div>
        ) : null}
      </header>

      {tuningModalIndex !== null && tuningMember && tuningRow ? (
        <div className="modal-backdrop" onClick={() => setTuningModalIndex(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <h2>노력치 보정</h2>
              <button type="button" className="action-button" onClick={() => setTuningModalIndex(null)}>닫기</button>
            </div>
            <div className="modal-grid">
              <label>
                성격
                <select
                  value={tuningMember.config.nature}
                  onChange={(e) => {
                    const next = [...party]
                    next[tuningModalIndex] = {
                      ...next[tuningModalIndex],
                      config: { ...next[tuningModalIndex].config, nature: e.target.value as NatureId },
                    }
                    setParty(next)
                  }}
                >
                  {NATURES.map((nature) => <option key={nature.id} value={nature.id}>{natureLabel(nature.id)}</option>)}
                </select>
              </label>
            </div>
            <div className="drag-stat-list">
              {EFFORT_STAT_OPTIONS.map((stat) => {
                const currentEffort = tuningMember.evs[stat.key]
                const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(tuningMember.evs, stat.key))
                const additionalAvailable = Math.max(0, availableCap - currentEffort)
                const actualValue = partyStatValue(tuningRow, tuningMember, stat.key)
                const isMagicStat = magicCandidate?.stat === stat.key && actualValue % 11 === 0
                const targetEffort = magicCandidate?.stat === stat.key ? magicCandidate.nextEffort : null
                const magicPoints = magicEffortPoints(tuningRow, tuningMember, stat.key)
                return (
                  <div key={`drag-stat-${stat.key}`} className={`drag-stat-card ${statThemeClass(stat.key)} ${isMagicStat ? 'magic' : ''}`}>
                    <div className="row-between">
                      <strong>{stat.label}</strong>
                      <span>{actualValue}</span>
                    </div>
                    <div className="effort-gauge-wrap" role="group" aria-label={`${stat.label} effort points`}>
                      <div
                        className={`effort-gauge-track ${statThemeClass(stat.key)}`}
                        onPointerDown={(e) => {
                          e.preventDefault()
                          e.currentTarget.setPointerCapture(e.pointerId)
                          updateTuningEffortFromPointer(tuningModalIndex, stat.key, availableCap, e.clientX, e.currentTarget)
                        }}
                        onPointerMove={(e) => {
                          if ((e.buttons & 1) !== 1) return
                          updateTuningEffortFromPointer(tuningModalIndex, stat.key, availableCap, e.clientX, e.currentTarget)
                        }}
                        onPointerUp={(e) => {
                          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
                        }}
                      >
                        <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">
                          {Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => {
                            const point = cellIdx + 1
                            const reachable = point <= availableCap
                            const filled = point <= currentEffort
                            const magicPoint = magicPoints.includes(point)
                            const currentPoint = point === currentEffort && currentEffort > 0
                            const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32)
                            const targetPoint = point === targetEffort
                            return (
                              <span
                                key={`effort-cell-${stat.key}-${point}`}
                                className={[
                                  'effort-gauge-cell',
                                  reachable ? 'reachable' : 'locked',
                                  filled ? 'filled' : '',
                                  magicPoint ? 'magic' : '',
                                  currentPoint ? 'current' : '',
                                  checkpointPoint ? 'checkpoint' : '',
                                  targetPoint ? 'target' : '',
                                ].filter(Boolean).join(' ')}
                                title={`${stat.label} ${point}포인트`}
                              />
                            )
                          })}
                        </div>
                        <input
                          type="range"
                          className="effort-gauge-range"
                          min={0}
                          max={CHAMPIONS_EFFORT_PER_STAT_CAP}
                          step={1}
                          value={currentEffort}
                          onChange={(e) => {
                            const next = [...party]
                            next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, e.target.value) }
                            setParty(next)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                              e.preventDefault()
                              const next = [...party]
                              next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.max(0, currentEffort - 1)) }
                              setParty(next)
                            }
                            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                              e.preventDefault()
                              const next = [...party]
                              next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.min(availableCap, currentEffort + 1)) }
                              setParty(next)
                            }
                          }}
                        />
                        <div className="effort-gauge-hitboxes">
                          {Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => {
                            const point = cellIdx + 1
                            const reachable = point <= availableCap
                            return (
                              <button
                                key={`effort-hitbox-${stat.key}-${point}`}
                                type="button"
                                className="effort-gauge-hitbox"
                                tabIndex={-1}
                                aria-hidden="true"
                                disabled={!reachable}
                                onClick={() => {
                                  const next = [...party]
                                  next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, point) }
                                  setParty(next)
                                }}
                                title={`${stat.label} ${point}포인트`}
                              />
                            )
                          })}
                        </div>
                      </div>
                        <div className={`effort-gauge-scale ${statThemeClass(stat.key)}`}>
                        {EFFORT_CHECKPOINTS.map((checkpoint) => {
                          const checkpointValue = partyStatValue(tuningRow, { ...tuningMember, evs: { ...tuningMember.evs, [stat.key]: checkpoint } }, stat.key)
                          return (
                            <div key={`effort-scale-${stat.key}-${checkpoint}`} className="effort-gauge-scale-item">
                              <span>{checkpoint}pt</span>
                              <small>{stat.key === magicCandidate?.stat ? checkpointValue : ''}</small>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="effort-cell-toolbar">
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => {
                          const next = [...party]
                          next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.max(0, currentEffort - 1)) }
                          setParty(next)
                        }}
                        disabled={currentEffort <= 0}
                      >-1</button>
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => {
                          const next = [...party]
                          next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, 0) }
                          setParty(next)
                        }}
                        disabled={currentEffort <= 0}
                      >최소</button>
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => {
                          const next = [...party]
                          next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, availableCap) }
                          setParty(next)
                        }}
                        disabled={currentEffort >= availableCap}
                      >최대</button>
                      <button
                        type="button"
                        className="mini-action"
                        onClick={() => {
                          const next = [...party]
                          next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, stat.key, Math.min(availableCap, currentEffort + 1)) }
                          setParty(next)
                        }}
                        disabled={currentEffort >= availableCap}
                      >+1</button>
                    </div>
                    <div className="row-between effort-cell-meta">
                      <span className="muted-inline">현재 {currentEffort}pt · 추가 가능 {additionalAvailable}pt</span>
                      {magicCandidate?.stat === stat.key && targetEffort ? <span className="magic-inline">목표 {targetEffort}칸</span> : isMagicStat ? <span className="magic-inline">11배수 달성</span> : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      <main className="grid">
        <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{mainSection === 'single' ? '싱글배틀 메뉴' : '포켓몬 샘플 깎기'}</h2>
              <p className="muted">{mainSection === 'single' ? '기존 파티 관리/상대 엔트리/계산기를 한 메뉴로 묶었습니다.' : '포켓몬 하나만 잡고 성격/능력 포인트/샘플 기술을 빠르게 깎는 전용 화면입니다.'}</p>
            </div>
            {mainSection === 'single' ? (
              <div className="tab-bar">
                <button type="button" className={`tab-chip ${activeTab === 'party' ? 'active' : ''}`} onClick={() => setActiveTab('party')}>내 파티 관리</button>
                <button type="button" className={`tab-chip ${activeTab === 'pick' ? 'active' : ''}`} onClick={() => setActiveTab('pick')}>상대 엔트리</button>
                <button type="button" className={`tab-chip ${activeTab === 'speed' ? 'active' : ''}`} onClick={() => setActiveTab('speed')}>스피드 계산</button>
                <button type="button" className={`tab-chip ${activeTab === 'power' ? 'active' : ''}`} onClick={() => setActiveTab('power')}>결정력 계산</button>
              </div>
            ) : null}
          </div>
        </section>

        {mainSection === 'single' && (activeTab === 'speed' || activeTab === 'power') ? (
          <section className="panel wide">
            <h2>파티 한눈 요약</h2>
            <div className="team-strip-grid">
              <div>
                <p className="muted">내 파티</p>
                <div className="team-strip">
                  {party.map((member, idx) => {
                    const row = indexByKey.get(member.key) ?? rows[0]
                    return <button key={`team-my-${idx}`} type="button" className={`team-pill ${selectedMy === idx ? 'active' : ''}`} onClick={() => setSelectedMy(idx)}>{displayName(row, siteLanguage)}</button>
                  })}
                </div>
              </div>
              <div>
                <p className="muted">상대 파티</p>
                <div className="team-strip">
                  {opponents.map((member, idx) => {
                    const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                    const label = opponentSearch[idx] || (row ? displayName(row, siteLanguage) : `빈 슬롯 ${idx + 1}`)
                    return <button key={`team-opp-${idx}`} type="button" className={`team-pill enemy ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>{label}</button>
                  })}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {mainSection === 'single' && activeTab === 'party' ? <section className="panel wide">
          <div className="party-columns party-manage-columns">
            <div className="party-lane">
              <div className="section-head row-between">
                <h2>내 파티 관리</h2>
                <div className="inline-controls compact-actions">
                  <span className="muted-inline">포켓몬별 기술배치 / 노력치보정</span>
                  <button type="button" className="action-button danger" onClick={resetPartyForFreshEntry}>내 파티 초기화</button>
                </div>
              </div>
              <div className="entry-grid manage-entry-grid">
              {party.map((member, idx) => {
                const row = indexByKey.get(member.key) ?? rows[0]
                const fixedMegaStone = megaStoneForKey(member.key)
                const currentItem = visibleChampionsItem(member.key, member.item)
                const abilityOptions = displayAbilities(row, siteLanguage)
                const activeAbility = member.ability || abilityOptions[0] || defaultAbilityForKey(member.key)
                const memberMoveSet = sampleMoves.find((entry) => entry.key === member.key)
                const memberMovePool = movePoolByKey[member.key]
                const memberMoveOptions = memberMovePool?.moves?.length ? memberMovePool.moves : (embeddedMovePoolForKey(member.key).length ? embeddedMovePoolForKey(member.key) : moveOptionsForEntry(memberMoveSet))
                const findMoveType = (moveName: string) => memberMoveOptions.find((option) => option.name === moveName)?.type ?? null
                const registeredMoves = [...(confirmedMovesByKey[member.key] ?? [])]
                while (registeredMoves.length < 4) registeredMoves.push('')
                return (
                  <div key={`${member.key}-${idx}`} className="card entry-card">
                    <div className="entry-card-top">
                      {row.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="entry-sprite" /> : null}
                      <div className="entry-card-head">
                        <div className="party-card-header">
                          <div className="party-card-title-block">
                            <div className="row-between compact-gap">
                              <strong>{displayName(row, siteLanguage)}</strong>
                              <span className="speed-badge">S {partySpeedValue(row, member)}</span>
                            </div>
                            <div className="type-line">
                              <span className="type-badge-wrap">{row.types.map((type) => <TypeBadgeImage key={type} type={type} />)}</span>
                              <span className="muted">{displayTypes(row, siteLanguage).join(' / ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="party-meta-grid" onClick={(e) => e.stopPropagation()}>
                      <div className="party-meta-chip party-meta-chip-editor">
                        <button type="button" className="party-meta-chip-button" onClick={() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'ability' ? null : { idx, field: 'ability' })}>
                          <span>특성</span>
                          <strong>{activeAbility || '미선택'}</strong>
                        </button>
                        {activePartyMetaEditor?.idx === idx && activePartyMetaEditor.field === 'ability' ? <div className="party-meta-popover">
                          <select ref={(el) => { partyAbilityEditorRefs.current[idx] = el }} autoFocus value={activeAbility} onChange={(e) => {
                            const next = [...party]
                            next[idx] = { ...member, ability: e.target.value }
                            setParty(next)
                            setActivePartyMetaEditor(null)
                          }} onBlur={() => setTimeout(() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'ability' ? null : prev), 120)}>
                            {abilityOptions.map((ability) => <option key={`party-ability-${member.key}-${ability}`} value={ability}>{ability}</option>)}
                          </select>
                        </div> : null}
                      </div>
                      <div className="party-meta-chip party-meta-chip-editor wide">
                        <button type="button" className="party-meta-chip-button" onClick={() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'nature' ? null : { idx, field: 'nature' })}>
                          <span>성격</span>
                          <strong>{natureChipLabel(member.config.nature)}</strong>
                        </button>
                        {activePartyMetaEditor?.idx === idx && activePartyMetaEditor.field === 'nature' ? <div className="party-meta-popover">
                          <select ref={(el) => { partyNatureEditorRefs.current[idx] = el }} autoFocus value={member.config.nature} onChange={(e) => {
                            const next = [...party]
                            next[idx] = { ...member, config: { ...member.config, nature: e.target.value as NatureId } }
                            setParty(next)
                            setActivePartyMetaEditor(null)
                          }} onBlur={() => setTimeout(() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'nature' ? null : prev), 120)}>
                            {NATURES.map((nature) => <option key={nature.id} value={nature.id}>{natureLabel(nature.id)}</option>)}
                          </select>
                        </div> : null}
                      </div>
                      <div className="party-meta-chip party-meta-chip-editor item-meta-chip">
                        <button type="button" className="party-meta-chip-button" onClick={() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'item' ? null : { idx, field: 'item' })}>
                          <span>도구</span>
                          <div className="item-meta-row">
                            <img src={itemSpriteSrc(member.key, currentItem)} alt={currentItem || '도구'} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                            <strong>{currentItem || '미선택'}</strong>
                          </div>
                        </button>
                        {activePartyMetaEditor?.idx === idx && activePartyMetaEditor.field === 'item' ? <div className="party-meta-popover">
                          <input ref={(el) => { partyItemEditorRefs.current[idx] = el }} autoFocus list={fixedMegaStone ? undefined : `item-options-party-${idx}`} value={fixedMegaStone || partyItemDrafts[idx] || ''} placeholder={fixedMegaStone ? '메가스톤 고정' : '사용 가능 도구 선택'} disabled={Boolean(fixedMegaStone)} onChange={(e) => {
                            const nextDrafts = [...partyItemDrafts]
                            nextDrafts[idx] = e.target.value
                            setPartyItemDrafts(nextDrafts)
                          }} onBlur={() => {
                            const resolved = resolveItemInput(member.key, partyItemDrafts[idx] || '')
                            const next = [...party]
                            next[idx] = { ...member, item: resolved }
                            setParty(next)
                            setPartyItemDrafts((prev) => {
                              const nextDrafts = [...prev]
                              nextDrafts[idx] = resolved
                              return nextDrafts
                            })
                            setTimeout(() => setActivePartyMetaEditor((prev) => prev?.idx === idx && prev.field === 'item' ? null : prev), 120)
                          }} onKeyDown={(e) => {
                            if (e.key !== 'Enter') return
                            e.preventDefault()
                            const resolved = resolveItemInput(member.key, partyItemDrafts[idx] || '')
                            const next = [...party]
                            next[idx] = { ...member, item: resolved }
                            setParty(next)
                            setPartyItemDrafts((prev) => {
                              const nextDrafts = [...prev]
                              nextDrafts[idx] = resolved
                              return nextDrafts
                            })
                            setActivePartyMetaEditor(null)
                          }} />
                          {!fixedMegaStone ? <datalist id={`item-options-party-${idx}`}>
                            {ITEM_OPTIONS.map((item) => <option key={`party-item-${idx}-${item}`} value={item} />)}
                          </datalist> : null}
                        </div> : null}
                      </div>
                    </div>
                    <label className="species-picker">
                      종 선택
                      <div className="autocomplete" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={partySearch[idx] ?? ''}
                          placeholder="포켓몬 검색"
                          onFocus={() => setActiveSearchField({ side: 'party', idx })}
                          onBlur={() => setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'party', idx) ? null : prev), 120)}
                          onChange={(e) => {
                            const next = [...partySearch]
                            next[idx] = e.target.value
                            setPartySearch(next)
                            setActiveSearchField({ side: 'party', idx })
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter') return
                            const committed = commitTopSpeciesOption('party', idx, partySearch[idx] ?? '')
                            if (committed) e.preventDefault()
                          }}
                        />
                        {sameSearchTarget(activeSearchField, 'party', idx) ? (
                          <div className="autocomplete-menu">
                            {filterSpeciesOptions(partySearch[idx] ?? '').slice(0, 8).map((option) => (
                              <button key={option.key} type="button" className="autocomplete-item" onMouseDown={() => selectSpecies('party', idx, option.key)}>
                                {searchDisplayLabel(option.key, siteLanguage)}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </label>
                    <div className="stat-preview-list">
                      {([
                        ['hp', 'HP'],
                        ['attack', '공격'],
                        ['defense', '방어'],
                        ['spAttack', '특수공격'],
                        ['spDefense', '특수방어'],
                        ['speed', '스피드'],
                      ] as const).map(([field, label]) => (
                        <button key={field} type="button" className={`stat-preview-row stat-preview-button ${statThemeClass(field)}`} onClick={(e) => {
                          e.stopPropagation()
                          setTuningModalIndex(idx)
                        }}>
                          <div className="stat-preview-bar"><span style={{ width: statGaugePercent(partyStatValue(row, member, field)) }} /></div>
                          <span>{label}</span>
                          <strong>{partyStatValue(row, member, field)}</strong>
                          <span>+{member.evs[field]}</span>
                        </button>
                      ))}
                    </div>
                    <div className="move-card inline-move-card" onClick={(e) => e.stopPropagation()}>
                      <div className="row-between">
                        <strong>기술 배치</strong>
                        <span className="muted-inline">{memberMovePool?.status === 'loading' ? '기술풀 불러오는 중…' : '사용 가능 기술 검색'}</span>
                      </div>
                      {memberMoveOptions.length ? <datalist id={`move-options-${member.key}`}>
                        {memberMoveOptions.map((move) => <option key={`move-option-${member.key}-${move.name}`} value={move.name} />)}
                      </datalist> : null}
                      <div className="registered-move-grid">
                        {registeredMoves.map((move, moveIdx) => (
                          <label key={`registered-move-${member.key}-${moveIdx}`} className={`registered-move-slot ${moveTypeThemeClass(findMoveType(move))}`}>
                            <span>{moveIdx + 1}번</span>
                            <input
                              value={move}
                              list={memberMoveOptions.length ? `move-options-${member.key}` : undefined}
                              placeholder={memberMoveOptions.length ? '사용 가능 기술 검색' : '기술 입력'}
                              onChange={(e) => setConfirmedMoveSlot(member.key, moveIdx, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key !== 'Enter') return
                                const committed = commitTopMoveOption(member.key, moveIdx, move, memberMoveOptions)
                                if (committed) e.preventDefault()
                              }}
                            />
                          </label>
                        ))}
                      </div>
                      {memberMoveSet ? <>
                        <div className="move-chip-wrap">
                          {memberMoveSet.core.map((move) => (
                            <button key={`party-core-${member.key}-${move}`} type="button" className={`move-chip core ${moveTypeThemeClass(findMoveType(move))} ${(confirmedMovesByKey[member.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(member.key, move)}>{move}</button>
                          ))}
                          {(memberMoveSet.options ?? []).map((move) => (
                            <button key={`party-opt-${member.key}-${move}`} type="button" className={`move-chip options ${moveTypeThemeClass(findMoveType(move))} ${(confirmedMovesByKey[member.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(member.key, move)}>{move}</button>
                          ))}
                          {(memberMoveSet.utility ?? []).map((move) => (
                            <button key={`party-util-${member.key}-${move}`} type="button" className={`move-chip utility ${moveTypeThemeClass(findMoveType(move))} ${(confirmedMovesByKey[member.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(member.key, move)}>{move}</button>
                          ))}
                        </div>
                      </> : <p className="muted">기술 데이터가 없는 포켓몬만 직접 입력합니다.</p>}
                    </div>
                  </div>
                )
              })}
              </div>
            </div>
          </div>
        </section> : null}

        {mainSection === 'single' && activeTab === 'pick' ? <>
        <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>상대 엔트리</h2>
              <p className="muted">초기화 후 슬롯별 검색창에 한 마리씩 빠르게 채우는 흐름으로 정리했습니다.</p>
            </div>
            <div className="pick-summary-badges">
              <span className="pick-badge">엔트리 {opponents.length}/6</span>
              <span className="pick-badge enemy">선출 추정 {pickedOpponents.length}/3</span>
            </div>
          </div>

          <div className="inline-controls">
            <button type="button" className="action-button danger" onClick={resetOpponentsForFreshEntry}>상대 엔트리 초기화</button>
            <span className="muted-inline">검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.</span>
          </div>

          <div className="quick-opponent-search-bar">
            <label className="species-picker">
              상대 엔트리 빠른 입력
              <div className="autocomplete">
                <input
                  ref={opponentQuickInputRef}
                  value={opponentQuickSearch}
                  placeholder={`${selectedOpp + 1}번 슬롯 검색 후 엔터`}
                  onFocus={() => setActiveSearchField({ side: 'opponentQuick', idx: 0 })}
                  onBlur={() => setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'opponentQuick', 0) ? null : prev), 120)}
                  onChange={(e) => {
                    setOpponentQuickSearch(e.target.value)
                    setActiveSearchField({ side: 'opponentQuick', idx: 0 })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      commitOpponentQuickSearch()
                    }
                  }}
                />
                {sameSearchTarget(activeSearchField, 'opponentQuick', 0) ? (
                  <div className="autocomplete-menu">
                    {filterSpeciesOptions(opponentQuickSearch).slice(0, 8).map((option) => (
                      <button key={option.key} type="button" className="autocomplete-item" onMouseDown={() => commitOpponentQuickSearch(option.key)}>
                        {searchDisplayLabel(option.key, siteLanguage)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </label>
            <div className="quick-opponent-hint">
              <strong>현재 입력 슬롯</strong>
              <span>{selectedOpp + 1} / {MAX_OPPONENTS}</span>
            </div>
          </div>

          <div className="pick-slot-row opponent-overview-row">
            {opponents.map((member, idx) => {
              const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
              return (
                <button key={`opp-overview-${member.key}-${idx}`} type="button" className={`pick-slot-card enemy compact ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>
                  {row?.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                  <span>{opponentSearch[idx] || (row ? displayName(row, siteLanguage) : `빈 슬롯 ${idx + 1}`)}</span>
                  <small>{member.picked ? '추정 체크됨' : '미체크'}</small>
                  <small>{member.item || '도구 없음'}</small>
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel wide">
          <div className="opponent-detail-layout">
            <div className="opponent-board-grid">
              {opponents.map((member, idx) => {
                const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                return (
                  <div key={`opp-board-${idx}`} className={`opponent-board-card ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>
                    {row?.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <strong>{row ? displayName(row, siteLanguage) : `빈 슬롯 ${idx + 1}`}</strong>
                    <span>{opponentSearch[idx] || '포켓몬 미입력'}</span>
                    <span>{member.ability || '특성 미기입'}</span>
                    <span>{member.item || '도구 미기입'}</span>
                  </div>
                )
              })}
            </div>
            <div className="opponent-detail-panel">
              <div className="entry-card-top">
                {oppMember.key && oppRow.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="entry-sprite large" /> : null}
                <div className="entry-card-head">
                  <div className="row-between compact-gap">
                    <strong>{oppMember.key ? displayName(oppRow, siteLanguage) : `빈 슬롯 ${selectedOpp + 1}`}</strong>
                    <span className={`pick-chip ${oppMember.picked ? 'active' : ''}`}>{oppMember.picked ? '선출 추정' : '미체크'}</span>
                  </div>
                  {oppMember.key ? <div className="type-badge-wrap">{oppRow.types.map((type) => <TypeBadgeImage key={`${oppRow.key}-${type}`} type={type} />)}</div> : null}
                  <p className="muted">상세 패널에서 공개 정보를 바로 갱신합니다.</p>
                </div>
              </div>
              <div className="opponent-detail-fields">
                <label className="species-picker">
                  종 선택
                  <div className="autocomplete">
                    <input
                      value={opponentSearch[selectedOpp] ?? ''}
                      placeholder="포켓몬 검색"
                      onFocus={() => setActiveSearchField({ side: 'opponent', idx: selectedOpp })}
                      onBlur={() => setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'opponent', selectedOpp) ? null : prev), 120)}
                      onChange={(e) => {
                        const next = [...opponentSearch]
                        next[selectedOpp] = e.target.value
                        setOpponentSearch(next)
                        setActiveSearchField({ side: 'opponent', idx: selectedOpp })
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        const committed = commitTopSpeciesOption('opponent', selectedOpp, opponentSearch[selectedOpp] ?? '')
                        if (committed) e.preventDefault()
                      }}
                    />
                    {sameSearchTarget(activeSearchField, 'opponent', selectedOpp) ? (
                      <div className="autocomplete-menu">
                        {filterSpeciesOptions(opponentSearch[selectedOpp] ?? '').slice(0, 8).map((option) => (
                          <button key={option.key} type="button" className="autocomplete-item" onMouseDown={() => selectSpecies('opponent', selectedOpp, option.key)}>
                            {searchDisplayLabel(option.key, siteLanguage)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </label>
                <label>
                  도구
                  <input value={oppMember.item} placeholder="예: 구애스카프" onChange={(e) => {
                    const next = [...opponents]
                    next[selectedOpp] = { ...oppMember, item: e.target.value }
                    setOpponents(next)
                  }} />
                </label>
                <label>
                  특성
                  <input value={oppMember.ability} placeholder="예: 클리어바디" onChange={(e) => {
                    const next = [...opponents]
                    next[selectedOpp] = { ...oppMember, ability: e.target.value }
                    setOpponents(next)
                  }} />
                </label>
                <label>
                  공개 기술
                  <input value={oppMember.revealedMoves.join(', ')} placeholder="예: 유턴, 도깨비불" onChange={(e) => {
                    const next = [...opponents]
                    next[selectedOpp] = { ...oppMember, revealedMoves: e.target.value.split(',').map((entry) => entry.trim()).filter(Boolean) }
                    setOpponents(next)
                  }} />
                </label>
                <label>
                  메모
                  <textarea value={oppMember.notes} placeholder="예: 물리형 가능성 높음" onChange={(e) => {
                    const next = [...opponents]
                    next[selectedOpp] = { ...oppMember, notes: e.target.value }
                    setOpponents(next)
                  }} />
                </label>
                <div className="inline-controls">
                  <label>
                    최속 가정
                    <input type="checkbox" checked={oppMember.natureBoost} onChange={(e) => {
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, natureBoost: e.target.checked }
                      setOpponents(next)
                    }} />
                  </label>
                  <label>
                    스카프
                    <input type="checkbox" checked={oppMember.scarf} onChange={(e) => {
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, scarf: e.target.checked }
                      setOpponents(next)
                    }} />
                  </label>
                  <label>
                    랭크
                    <select value={oppMember.speedStage} onChange={(e) => {
                      const next = [...opponents]
                      next[selectedOpp] = { ...oppMember, speedStage: clampSpeedStage(e.target.value) }
                      setOpponents(next)
                    }}>
                      {SPEED_STAGE_OPTIONS.map((n) => <option key={n} value={n}>{n >= 0 ? `+${n}` : n}</option>)}
                    </select>
                  </label>
                  <button type="button" className={`pick-chip ${oppMember.picked ? 'active' : ''}`} onClick={() => setOpponents(togglePicked(opponents, selectedOpp))}>
                    {oppMember.picked ? '선출 추정 해제' : '선출 추정 체크'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel wide">
          <h2>상대 엔트리 메모</h2>
          <textarea
            value={battleNote}
            placeholder="예: 드래펄트 스카프 가능성 높음 / 로토무 볼체 공개 / 미믹큐는 막판 스윕용으로 보임"
            onChange={(e) => setBattleNote(e.target.value)}
          />
        </section>
        </> : mainSection === 'sample' ? <>
        <section className="panel wide">
          <div className="row-between section-head">
            <h2>단일 샘플 빌더</h2>
            <span className="muted-inline">{displayName(sampleRow, siteLanguage)}</span>
          </div>
          <div className="sample-builder-grid">
            <div className="sample-main-card">
              <label className="species-picker">
                포켓몬 선택
                <div className="autocomplete">
                  <input
                    value={sampleSearch}
                    placeholder="포켓몬 검색"
                    onFocus={() => setActiveSearchField({ side: 'sample', idx: 0 })}
                    onBlur={() => setTimeout(() => setActiveSearchField((prev) => sameSearchTarget(prev, 'sample', 0) ? null : prev), 120)}
                    onChange={(e) => {
                      setSampleSearch(e.target.value)
                      setActiveSearchField({ side: 'sample', idx: 0 })
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      const committed = commitTopSpeciesOption('sample', 0, sampleSearch)
                      if (committed) e.preventDefault()
                    }}
                  />
                  {sameSearchTarget(activeSearchField, 'sample', 0) ? (
                    <div className="autocomplete-menu">
                      {filterSpeciesOptions(sampleSearch).slice(0, 8).map((option) => (
                        <button key={option.key} type="button" className="autocomplete-item" onMouseDown={() => selectSpecies('sample', 0, option.key)}>
                          {searchDisplayLabel(option.key, siteLanguage)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </label>
              <div className="sample-hero">
                {sampleRow.sprite ? <img src={sampleRow.sprite} alt={displayName(sampleRow, siteLanguage)} className="entry-sprite large" /> : null}
                <div>
                  <strong>{displayName(sampleRow, siteLanguage)}</strong>
                  <div className="summary-line">
                    <span className="muted">{displayTypes(sampleRow, siteLanguage).join(' / ')}</span>
                    <span className="type-badge-wrap">{sampleRow.types.map((type) => <TypeBadgeImage key={type} type={type} />)}</span>
                  </div>
                  <div className="item-hero-row">
                    <img src={itemSpriteSrc(sampleForge.key, sampleCurrentItem)} alt={sampleCurrentItem || '도구'} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                    <span>{sampleCurrentItem || '도구 미선택'}</span>
                  </div>
                  <p className="muted">실수치 스피드 {partySpeedValue(sampleRow, sampleForge)}</p>
                </div>
              </div>
              <div className="party-meta-grid sample-meta-grid">
                <div className="party-meta-chip party-meta-chip-editor">
                  <button type="button" className="party-meta-chip-button" onClick={() => setActiveSampleMetaEditor((prev) => prev === 'ability' ? null : 'ability')}>
                    <span>특성</span>
                    <strong>{sampleAbility || '미선택'}</strong>
                  </button>
                  {activeSampleMetaEditor === 'ability' ? <div className="party-meta-popover">
                    <select ref={sampleAbilityEditorRef} autoFocus value={sampleAbility} onChange={(e) => {
                      setSampleForge((prev) => ({ ...prev, ability: e.target.value }))
                      setActiveSampleMetaEditor(null)
                    }} onBlur={() => setTimeout(() => setActiveSampleMetaEditor((prev) => prev === 'ability' ? null : prev), 120)}>
                      {sampleAbilityOptions.map((ability) => <option key={`sample-ability-${sampleForge.key}-${ability}`} value={ability}>{ability}</option>)}
                    </select>
                  </div> : null}
                </div>
                <div className="party-meta-chip party-meta-chip-editor wide">
                  <button type="button" className="party-meta-chip-button" onClick={() => setActiveSampleMetaEditor((prev) => prev === 'nature' ? null : 'nature')}>
                    <span>성격</span>
                    <strong>{natureChipLabel(sampleForge.config.nature)}</strong>
                  </button>
                  {activeSampleMetaEditor === 'nature' ? <div className="party-meta-popover">
                    <select ref={sampleNatureEditorRef} autoFocus value={sampleForge.config.nature} onChange={(e) => {
                      setSampleForge((prev) => ({ ...prev, config: { ...prev.config, nature: e.target.value as NatureId } }))
                      setActiveSampleMetaEditor(null)
                    }} onBlur={() => setTimeout(() => setActiveSampleMetaEditor((prev) => prev === 'nature' ? null : prev), 120)}>
                      {NATURES.map((nature) => <option key={nature.id} value={nature.id}>{natureLabel(nature.id)}</option>)}
                    </select>
                  </div> : null}
                </div>
                <div className="party-meta-chip party-meta-chip-editor item-meta-chip">
                  <button type="button" className="party-meta-chip-button" onClick={() => setActiveSampleMetaEditor((prev) => prev === 'item' ? null : 'item')}>
                    <span>도구</span>
                    <div className="item-meta-row">
                      <img src={itemSpriteSrc(sampleForge.key, sampleCurrentItem)} alt={sampleCurrentItem || '도구'} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                      <strong>{sampleCurrentItem || '미선택'}</strong>
                    </div>
                  </button>
                  {activeSampleMetaEditor === 'item' ? <div className="party-meta-popover">
                    <input ref={sampleItemEditorRef} autoFocus list={sampleFixedMegaStone ? undefined : 'item-options-sample'} value={sampleFixedMegaStone || sampleItemDraft} placeholder={sampleFixedMegaStone ? '메가스톤 고정' : '사용 가능 도구 선택'} disabled={Boolean(sampleFixedMegaStone)} onChange={(e) => setSampleItemDraft(e.target.value)} onBlur={() => {
                      const resolved = resolveItemInput(sampleForge.key, sampleItemDraft)
                      setSampleForge((prev) => ({ ...prev, item: resolved }))
                      setSampleItemDraft(resolved)
                      setTimeout(() => setActiveSampleMetaEditor((prev) => prev === 'item' ? null : prev), 120)
                    }} onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      e.preventDefault()
                      const resolved = resolveItemInput(sampleForge.key, sampleItemDraft)
                      setSampleForge((prev) => ({ ...prev, item: resolved }))
                      setSampleItemDraft(resolved)
                      setActiveSampleMetaEditor(null)
                    }} />
                    {!sampleFixedMegaStone ? <datalist id="item-options-sample">
                      {ITEM_OPTIONS.map((item) => <option key={`sample-item-${item}`} value={item} />)}
                    </datalist> : null}
                  </div> : null}
                </div>
              </div>
              <div className="stat-preview-list">
                {([
                  ['hp', 'HP'], ['attack', '공격'], ['defense', '방어'], ['spAttack', '특수공격'], ['spDefense', '특수방어'], ['speed', '스피드'],
                ] as const).map(([field, label]) => (
                  <div key={field} className={`stat-preview-row ${statThemeClass(field)}`}>
                    <div className="stat-preview-bar"><span style={{ width: statGaugePercent(partyStatValue(sampleRow, sampleForge, field)) }} /></div>
                    <span>{label}</span>
                    <strong>{partyStatValue(sampleRow, sampleForge, field)}</strong>
                    <span>+{sampleForge.evs[field]}</span>
                  </div>
                ))}
              </div>
              <div className="inline-controls">
                <label>
                  매직넘버
                  <input type="number" min={0} max={255} value={sampleForge.tuning.magicNumber} onChange={(e) => setSampleForge((prev) => ({ ...prev, tuning: { ...prev.tuning, magicNumber: clampNonNegativeInt(e.target.value, 255) } }))} />
                </label>
                <label>
                  최대치
                  <input type="number" min={0} max={255} value={sampleForge.tuning.maxValue} onChange={(e) => setSampleForge((prev) => ({ ...prev, tuning: { ...prev.tuning, maxValue: clampNonNegativeInt(e.target.value, 255) } }))} />
                </label>
              </div>
            </div>
            <div className="move-card">
              <div className="row-between">
                <strong>샘플 기술</strong>
                <button type="button" className="action-button" onClick={() => sampleMoveSet?.core?.[0] && toggleConfirmedMove(sampleForge.key, sampleMoveSet.core[0])}>코어 1번 체크</button>
              </div>
              <div className="sample-save-box">
                <label>
                  샘플 이름
                  <input value={sampleLabelDraft} placeholder="예: 명랑 스카프 정리안" onChange={(e) => setSampleLabelDraft(e.target.value)} />
                </label>
                <div className="inline-controls">
                  <button type="button" className="action-button" onClick={saveCurrentSample}>현재 샘플 저장</button>
                  <label>
                    파티 슬롯에 적용
                    <select value={selectedMy} onChange={(e) => applySampleToPartySlot(Number(e.target.value))}>
                      {party.map((member, idx) => <option key={`apply-slot-${idx}`} value={idx}>{idx + 1}번 슬롯 · {displayName(indexByKey.get(member.key) ?? rows[0], siteLanguage)}</option>)}
                    </select>
                  </label>
                </div>
              </div>
              {sampleMoveSet ? (
                <>
                  {sampleMoveOptions.length ? <datalist id={`move-options-${sampleForge.key}`}>
                    {sampleMoveOptions.map((move) => <option key={`sample-move-option-${sampleForge.key}-${move.name}`} value={move.name} />)}
                  </datalist> : null}
                  <div className="registered-move-grid">
                    {sampleRegisteredMoves.map((move, moveIdx) => (
                      <label key={`sample-registered-move-${sampleForge.key}-${moveIdx}`} className={`registered-move-slot ${moveTypeThemeClass(sampleMoveType(move))}`}>
                        <span>{moveIdx + 1}번</span>
                        <input
                          value={move}
                          list={sampleMoveOptions.length ? `move-options-${sampleForge.key}` : undefined}
                          placeholder={sampleMoveOptions.length ? '사용 가능 기술 검색' : '기술 입력'}
                          onChange={(e) => setConfirmedMoveSlot(sampleForge.key, moveIdx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter') return
                            const committed = commitTopMoveOption(sampleForge.key, moveIdx, move, sampleMoveOptions)
                            if (committed) e.preventDefault()
                          }}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="move-chip-wrap">
                    {sampleMoveSet.core.map((move) => (
                      <button key={`sample-core-${move}`} type="button" className={`move-chip core ${moveTypeThemeClass(sampleMoveType(move))} ${(confirmedMovesByKey[sampleForge.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(sampleForge.key, move)}>{move}</button>
                    ))}
                    {(sampleMoveSet.options ?? []).map((move) => (
                      <button key={`sample-opt-${move}`} type="button" className={`move-chip options ${moveTypeThemeClass(sampleMoveType(move))} ${(confirmedMovesByKey[sampleForge.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(sampleForge.key, move)}>{move}</button>
                    ))}
                    {(sampleMoveSet.utility ?? []).map((move) => (
                      <button key={`sample-util-${move}`} type="button" className={`move-chip utility ${moveTypeThemeClass(sampleMoveType(move))} ${(confirmedMovesByKey[sampleForge.key] ?? []).includes(move) ? 'confirmed' : ''}`} onClick={() => applyMoveToSlot(sampleForge.key, move)}>{move}</button>
                    ))}
                  </div>
                  <p className="muted">확정: {(confirmedMovesByKey[sampleForge.key] ?? []).join(', ') || '아직 없음'}</p>
                  <p className="muted">성격 {natureLabel(sampleForge.config.nature)}{sampleForge.item ? ` · 도구 ${sampleForge.item}` : ''}</p>
                  <p className="muted">매직넘버 {sampleForge.tuning.magicNumber || '미지정'} · 최대치 {sampleForge.tuning.maxValue || '미지정'}</p>
                  {sampleMoveSet.notes?.length ? <p className="muted">{sampleMoveSet.notes.join(' · ')}</p> : null}
                </>
              ) : <p className="muted">이 포켓몬에 등록된 샘플 기술이 아직 없습니다.</p>}
              <div className="saved-sample-list">
                <div className="row-between">
                  <strong>저장한 샘플</strong>
                  <span className="muted-inline">{savedSamples.length}개</span>
                </div>
                {savedSamples.length ? savedSamples.map((entry) => {
                  const savedRow = indexByKey.get(entry.member.key) ?? rows[0]
                  return (
                    <div key={entry.id} className="saved-sample-item">
                      <div>
                        <strong>{entry.label}</strong>
                        <p className="muted">{displayName(savedRow, siteLanguage)} · {natureLabel(entry.member.config.nature)}{entry.member.item ? ` · ${entry.member.item}` : ''}</p>
                      </div>
                      <div className="inline-controls">
                        <button type="button" className="pick-chip" onClick={() => {
                          setSampleForge({ ...entry.member, evs: { ...entry.member.evs }, config: { ...entry.member.config }, tuning: { ...entry.member.tuning } })
                          setSampleItemDraft(visibleChampionsItem(entry.member.key, entry.member.item))
                          setSampleSearch(searchDisplayLabel(entry.member.key, siteLanguage))
                          setActiveSampleMetaEditor(null)
                        }}>불러오기</button>
                        <button type="button" className="pick-chip" onClick={() => setSavedSamples((prev) => prev.filter((saved) => saved.id !== entry.id))}>삭제</button>
                      </div>
                    </div>
                  )
                }) : <p className="muted">아직 저장한 샘플이 없습니다.</p>}
              </div>
            </div>
          </div>
        </section>
        </> : <>
        {activeTab === 'speed' ? <section className="panel wide">
          <h2>선출 메모</h2>
          <div className="pick-summary-grid">
            <div className="pick-summary-box">
              <strong>내 선출 ({pickedParty.length}/3)</strong>
              <div className="pick-slot-row">
                {pickedParty.length ? pickedParty.map((member, idx) => {
                  const row = indexByKey.get(member.key) ?? rows[0]
                  return (
                    <div key={`picked-my-${idx}`} className="pick-slot-card">
                      {row.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                      <span>{displayName(row, siteLanguage)}</span>
                    </div>
                  )
                }) : <p className="muted">아직 체크 없음</p>}
              </div>
            </div>
            <div className="pick-summary-box">
              <strong>상대 선출 추정 ({pickedOpponents.length}/3)</strong>
              <div className="pick-slot-row">
                {pickedOpponents.length ? pickedOpponents.map((member, idx) => {
                  const row = indexByKey.get(member.key) ?? rows[0]
                  return (
                    <div key={`picked-opp-${idx}`} className="pick-slot-card enemy">
                      {row.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                      <span>{displayName(row, siteLanguage)}</span>
                    </div>
                  )
                }) : <p className="muted">아직 체크 없음</p>}
              </div>
            </div>
          </div>
        </section> : null}

        {activeTab === 'power' ? <section className="panel wide">
          <h2>간단 데미지 계산</h2>
          <p className="muted">상대 엔트리에서 고른 포켓몬의 도구/특성/공개 기술 메모와 같은 슬롯을 계산기가 그대로 따라갑니다.</p>
          <div className="preset-row">
            {movePowerPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className={`preset-chip ${movePower === preset.value ? 'active' : ''}`}
                onClick={() => setMovePower(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="calc-grid">
            <label>
              위력
              <input type="number" value={movePower} onChange={(e) => setMovePower(Number(e.target.value))} />
            </label>
            <label>
              공격분류
              <select value={calcMode} onChange={(e) => setCalcMode(e.target.value as CalcMode)}>
                <option value="physical">물리</option>
                <option value="special">특수</option>
              </select>
            </label>
            <label>
              STAB
              <select value={stab} onChange={(e) => setStab(Number(e.target.value))}>
                <option value={1}>없음</option>
                <option value={1.5}>1.5</option>
                <option value={2}>2.0</option>
              </select>
            </label>
            <label>
              상성
              <select value={effectiveness} onChange={(e) => setEffectiveness(Number(e.target.value))}>
                <option value={0.25}>0.25x</option>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </label>
          </div>
          {oppRow && damage ? <div className="damage-box">
            <strong>{displayName(myRow, siteLanguage)}</strong> → <strong>{displayName(oppRow, siteLanguage)}</strong>
            <p>{damage.min} ~ {damage.max} 데미지</p>
            <p>{damage.minPct}% ~ {damage.maxPct}%</p>
            <p>{Number(damage.maxPct) >= 100 ? '확정 1타 가능성 있음' : Number(damage.minPct) >= 50 ? '유리한 2타권' : '즉시 마무리 어려움'}</p>
          </div> : <div className="damage-box"><p>상대 엔트리에서 계산 대상 포켓몬을 먼저 채워 주세요.</p></div>}
        </section> : null}
        </>}
      </main>
    </div>
  )
}
