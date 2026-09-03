import type { EffortValues } from '../myPartyChampionsSamples'

export type Row = {
  id: number
  key: string
  name_ko: string
  name_en: string
  name_ja?: string
  weightKg?: number
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
  fast: number
  neutral: number
  uninvested?: number
  scarf_fast: number
  scarf_neutral: number
  types: string[]
  types_ko: string[]
  abilities: string[]
  abilities_ko: string[]
  sprite?: string
}

export type StatKey = 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed'
export type EffortStatKey = keyof EffortValues
export type NatureId =
  | 'hardy' | 'lonely' | 'brave' | 'adamant' | 'naughty'
  | 'bold' | 'docile' | 'relaxed' | 'impish' | 'lax'
  | 'timid' | 'hasty' | 'serious' | 'jolly' | 'naive'
  | 'modest' | 'mild' | 'quiet' | 'bashful' | 'rash'
  | 'calm' | 'gentle' | 'sassy' | 'careful' | 'quirky'

export type MemberConfig = {
  nature: NatureId
  scarf: boolean
  speedStage: number
}

export type PartyTuning = {
  magicNumber: number
  maxValue: number
}

export type PartyMember = {
  key: string
  config: MemberConfig
  picked: boolean
  evs: EffortValues
  tuning: PartyTuning
  item: string
  ability: string
}

export type OpponentState = {
  key: string
  item: string
  ability: string
  notes: string
  revealedMoves: string[]
  natureBoost: boolean
  scarf: boolean
  speedStage: number
  picked: boolean
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  speedEv: number
  defenseNature: number
  spDefenseNature: number
}

export type SampleSpeedTarget = OpponentState
export type SampleDamageTarget = OpponentState & {
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  defenseNature: number
  spDefenseNature: number
  moveName: string
}

export type SavedSample = {
  id: string
  label: string
  member: PartyMember
  lockedMoves: string[]
}

export type SavedPartyPreset = {
  id: string
  label: string
  party: PartyMember[]
  lockedMovesBySlot: string[][]
}

export type CalcMode = 'physical' | 'special'
export type DamageWeather = 'none' | 'sun' | 'rain' | 'sand' | 'snow'
export type DamageTerrain = 'none' | 'electric' | 'grassy' | 'psychic' | 'misty'
export type OpponentBulkPreset = 'neutral-0' | 'hp-32' | 'phys-32' | 'spdef-32' | 'custom'
export type OpponentOffensePreset = 'neutral-0' | 'atk-32' | 'spa-32' | 'atk-32-plus' | 'spa-32-plus' | 'custom'
export type RivalryMode = 'neutral' | 'same' | 'opposite'
export type DoubleBoardSlot = 'myLeft' | 'myRight' | 'oppLeft' | 'oppRight'
export type MoveFilter = 'all' | 'core' | 'options' | 'utility'
export type MainSection = 'home' | 'single' | 'double' | 'sample' | 'dex'
export type SampleWorkbenchTab = 'builder' | 'speed' | 'damage'
export type MainTab = 'party' | 'pick' | 'speed' | 'power'
export type SiteLanguage = 'ko' | 'en' | 'ja'
export type MoveCategory = CalcMode | 'status'
export type MoveOption = { name: string; type: string | null }
export type ConditionalPowerValue = number | boolean
export type AutocompleteHighlight = { id: string; index: number } | null

export type MoveMeta = {
  type: string | null
  category: MoveCategory | null
  power: number | null
  accuracy?: number | null
  pp?: number | null
  hits?: number
  hitPowers?: number[]
  variablePower?: boolean
  usesDefenseAsAttack?: boolean
  targetsDefenseStat?: 'defense' | 'spDefense'
  alwaysCrit?: boolean
  priority?: number
}

export type HoverTooltipCard = {
  kind: 'move' | 'ability' | 'item' | 'index'
  title: string
  subtitle?: string
  accentType?: string | null
  rows: { label: string; value: string }[]
  description?: string
  chips?: string[]
}

export type DexDescriptionBundle = {
  moves: Record<string, { moveId: number; nameEn: string; nameJa: string; text: Record<SiteLanguage, { summary: string; detail: string }>; effectChance?: number | null }>
  abilities: Record<string, { abilityId: number; nameKo: string; nameEn: string; nameJa: string; text: Record<SiteLanguage, { summary: string; detail: string }> }>
  items: Record<string, { itemId: number; nameKo: string; nameEn: string; nameJa: string; text: Record<SiteLanguage, { summary: string; detail: string }> }>
}

export type PersistedState = {
  party?: PartyMember[]
  opponents?: OpponentState[]
  selectedMy?: number
  selectedOpp?: number
  calcSwapSides?: boolean
  calcAttackStage?: number
  calcDefenseStage?: number
  calcHitCount?: number
  calcWeather?: DamageWeather
  calcTerrain?: DamageTerrain
  calcBurned?: boolean
  calcCritical?: boolean
  calcAttackerLowHp?: boolean
  calcTargetPoisoned?: boolean
  calcDefenderFullHp?: boolean
  calcDefenderDisguise?: boolean
  calcMovedAfterTarget?: boolean
  calcFaintedAllies?: number
  calcRivalryMode?: RivalryMode
  calcParentalBond?: boolean
  calcDefenderStatused?: boolean
  calcElectromorphosisCharged?: boolean
  calcReflect?: boolean
  calcLightScreen?: boolean
  calcAuroraVeil?: boolean
  calcFriendGuard?: boolean
  calcTypeChangeStab?: boolean
  calcConditionalPowerValues?: Record<string, ConditionalPowerValue>
  calcOpponentBulkPreset?: OpponentBulkPreset
  calcOpponentHpEv?: number
  calcOpponentDefenseEv?: number
  calcOpponentSpDefenseEv?: number
  calcOpponentOffensePreset?: OpponentOffensePreset
  calcOpponentAttackEv?: number
  calcOpponentSpAttackEv?: number
  calcOpponentAttackNature?: number
  calcOpponentSpAttackNature?: number
  calcOpponentDefenseNature?: number
  calcOpponentSpDefenseNature?: number
  battleNote?: string
  confirmedMovesByKey?: Record<string, string[]>
  mainSection?: MainSection
  activeTab?: MainTab
  sampleForge?: PartyMember
  sampleLockedMoves?: string[]
  savedSamples?: SavedSample[]
  savedPartyPresets?: SavedPartyPreset[]
  sampleWorkbenchTab?: SampleWorkbenchTab
  sampleSpeedTargets?: SampleSpeedTarget[]
  sampleDamageTargets?: SampleDamageTarget[]
  doubleMyLeft?: number
  doubleMyRight?: number
  doubleOppLeft?: number
  doubleOppRight?: number
  doubleTrickRoom?: boolean
  doubleTailwindMy?: boolean
  doubleTailwindOpp?: boolean
  doubleFriendGuardMy?: boolean
  doubleFriendGuardOpp?: boolean
  doubleWideGuardMy?: boolean
  doubleWideGuardOpp?: boolean
  doubleAttackerSlot?: DoubleBoardSlot
  doubleDefenderSlot?: DoubleBoardSlot
  doubleSpreadMove?: boolean
  doubleMoveName?: string
  doubleProtectMyLeft?: boolean
  doubleProtectMyRight?: boolean
  doubleProtectOppLeft?: boolean
  doubleProtectOppRight?: boolean
  doubleActionMoveMyLeft?: string
  doubleActionMoveMyRight?: string
  doubleActionMoveOppLeft?: string
  doubleActionMoveOppRight?: string
  doubleActionTargetMyLeft?: DoubleBoardSlot
  doubleActionTargetMyRight?: DoubleBoardSlot
  doubleActionTargetOppLeft?: DoubleBoardSlot
  doubleActionTargetOppRight?: DoubleBoardSlot
  doubleActionFocusSlot?: DoubleBoardSlot
}

export type ImportExportPayload = PersistedState & {
  version: 1
}

export type OcrImportedPartyMember = {
  member: PartyMember
  lockedMoves: string[]
  rawLines: string[]
}

export type OcrStatKey = keyof EffortValues

export type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

export type SearchFieldTarget = { side: 'party' | 'opponent'; idx: number } | { side: 'sample' | 'opponentQuick'; idx: 0 } | null
export type MoveFieldTarget = { key: string; slotIdx: number; scope: 'party' | 'sample' | 'opponent' } | null
export type ItemFieldTarget = { scope: 'party'; idx: number } | { scope: 'sample'; idx: 0 } | { scope: 'opponent'; idx: number } | null
export type MetaListField = { scope: 'party'; idx: number; field: 'ability' | 'nature' } | { scope: 'sample'; field: 'ability' | 'nature' } | null
export type ViewState = {
  mainSection?: MainSection
  activeTab?: MainTab
  sampleWorkbenchTab?: SampleWorkbenchTab
  dexSearchMode?: DexSearchMode
  dexSearch?: string
  dexUnifiedSearch?: string
  dexSelectedValue?: string
  selectedMy?: number
  selectedOpp?: number
}

export type DexSearchMode = 'pokemon' | 'move' | 'ability' | 'item'
export type DexResultItem =
  | { id: string; kind: 'pokemon'; key: string; row: Row; score: number }
  | { id: string; kind: 'move'; key: string; name: string; meta: MoveMeta; score: number }
  | { id: string; kind: 'ability'; key: string; koLabel: string; pokemonKeys: string[]; score: number }
  | { id: string; kind: 'item'; key: string; item: string; previewText: string; score: number }
