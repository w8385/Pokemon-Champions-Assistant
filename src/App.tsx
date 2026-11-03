import { filterSpeciesOptions } from './shared/search/speciesOptions'
import { QuickDamagePanel } from './features/damage/QuickDamagePanel'
import { useOpponentEntries } from './features/single/useOpponentEntries'
import { MovePoolState, SharedPoolState, learnsetStatusText, recordedLearnsetText, quickKoVerdict, quickKoLabels, conciseSpeedLabels } from './features/damage/quickPresentation.ts'
import { QuickBattle, QuickSide, QuickConditions, quickBlankBattle, quickBlank, quickDefaultConditions, quickSide, restoredComparisonSide, quickMagicProjection, quickStat } from './features/damage/quickModel.ts'
import { sanitizeEvs, applyChampionsEffort, clampEv, totalEffortPoints, remainingEffortPoints } from './domain/champions/effortProjection'
import { natureById, boostedStatForNature } from './shared/display/naturePresentation'
import { heldAbilityError, resolveSelectedAbility, abilityDisplayName, selectedAbilityDisplayName } from './shared/display/abilityPresentation.ts'
import { lookupMoveMeta, findMatchingMoveOption, resolveMoveType, resolveMoveMeta, filterMoveOptions } from './adapters/catalog/movePresentation.ts'
import { MEGA_STONE_SPRITE_BY_KEY, canonicalChampionsItemName, megaStoneForKey, isAllowedChampionsItem, heldItemError, itemSpriteSrc, matchesLooseQuery, displayItemLabel, filterItemOptions, itemAutocompleteSecondaryLabel, itemAutocompletePrimaryLabel } from './shared/display/itemPresentation.ts'
import { TYPE_KO_BY_KEY, statLabel, statThemeClass, moveTypeThemeClass, natureLabel, displayMoveCategoryName, displayName, searchDisplayLabel } from './shared/display/formatters.ts'
import { speedTemplate, makeFormRow, baseRows, baseIndexByKey, extraFormRows, rows, indexByKey, speciesOptions } from './adapters/catalog/roster.ts'
import { UI_TRANSLATIONS, translateText } from './shared/display/translation.ts'
import { typeChart, normalizedTypeChart, typeEffectiveness, effectiveDefenderAbility, abilityAdjustedTypeEffectiveness } from './domain/battle/typeEffectiveness.ts'
import { battleStageMultiplier, knockOffPowerMultiplier, isDamageGrounded, resolveDamageModifiers } from './domain/battle/modifierRules.ts'
import { opponentSpeedValue, partySpeedValue, buildPartyBattleStats, buildOpponentBattleStats, attackingFormRow, isChoiceScarfItem } from './domain/battle/statProjection.ts'
import { ConditionalMovePowerRule, CONDITIONAL_MOVE_POWER_RULES, normalizeConditionalPowerValue, applyConditionalMovePower, weightBasedMovePower, applyTargetWeightMovePower, multiHitOptions, resolveMultiHitMeta, multiHitSummary } from './domain/battle/movePower.ts'
import { resolveAbilityAdjustedMoveMeta, resolveAbilityAdjustedTypes, resolveStabMultiplier, weatherFromAbility, deriveAutoWeatherFromAbilities, terrainFromAbility, deriveAutoTerrainFromAbilities } from './domain/battle/moveEffects.ts'
import { PUNCH_MOVE_NAMES, BITE_MOVE_NAMES, PULSE_MOVE_NAMES, SOUND_MOVE_NAMES, SLICING_MOVE_NAMES, CONTACT_MOVE_NAMES, RECKLESS_MOVE_NAMES, SHEER_FORCE_MOVE_NAMES, DOUBLE_SPREAD_MOVE_NAMES, moveMatchesTaggedSet, protectionDamageMultiplier } from './domain/battle/moveTags.ts'
import { MOVE_NAME_ALIASES, MOVE_NAME_ALIASES_BY_NORMALIZED, moveNameCandidates } from './domain/battle/moveAliases.ts'
import { abilityNoteLabel, titleCaseSlug } from './domain/battle/abilityNoteLabel.ts'
import React from 'react'
import { CHAMPIONS_ITEM_ALIASES, CHAMPIONS_ITEM_OPTIONS, CHAMPIONS_ITEM_SPRITE_MAP, localizedChampionsItemLabel, type ChampionsItem } from './domain/champions/championsItems'
import { canonicalHeldItem, classifyHeldItem, requiredMegaStone, itemForSpeciesSelection, isCalculableHeldItem } from './domain/champions/itemIdentity'
import { sampleMoves } from './domain/samples/sampleMoves'
import { dataSourcePolicy } from './domain/champions/dataSources'
import { defaultEvs, type EffortValues } from './domain/samples/myPartyChampionsSamples'
import { catalog, canImportCreatorSample, createLinkDraft, filterCreatorSamples, filterCreatorSources, groupCreatorSources, individualCreatorSources, relatedCreatorParties, sanitizeLinkDrafts, type CreatorSample, type LibraryFormat, type LibraryLanguage, type LinkDraft } from './domain/samples/creatorSampleLibrary'
import { SourcePlacementBadge } from './features/samples/SourcePlacementBadge'
import { CreatorPartySpriteStrip } from './features/party/CreatorPartySpriteStrip'
import { usePartyWorkspace } from './features/party/usePartyWorkspace'
import { usePartyEditor } from './features/party/usePartyEditor'
import { PartyView } from './features/party/PartyView'
import { prepareCreatorParty } from './domain/party/creatorPartyImport'
import { homeRoute, routeGroups, routeIconFor } from './app/navigation'
import { parseViewStateFromUrl, syncViewStateToUrl } from './app/routeState'
import { PageHeading } from './shared/display/PageHeading'
import { emptySlotLabel, savedSampleCountLabel, natureChipLabel, resolveItemInput, partyStatValue, displayAbilities, sameMoveField, SmallTypeBadgeImage } from './shared/display/entryHelpers'
import { UiIcon } from './shared/display/UiIcon'
import { DamageRangeMeter } from './shared/display/DamageRangeMeter'
import { libraryDetailHref, libraryListHref, type LibraryViewContext } from './app/libraryViewRoute'
import { quickItem, quickSpeedState, quickStatNature, quickMoveSupported, readQuickSaved, restoreQuickMoves, replaceQuickMove, quickBattleStages, quickStagePair } from './domain/battle/quickDamageState'
import { sampleBattle, sampleConditions, sampleMoveKey, sampleMoveStats, type SampleBattle } from './domain/battle/sampleDamageProjection'
import { fixedSampleOpponentMoves, replaceSampleOpponentMove, sampleDamageMoveGate } from './domain/battle/sampleDamageMoves'
import { comparisonSides, type ComparisonSeed } from './domain/party/unifiedComparisonAdapter'
import { commitComparisonEntry } from './domain/party/singleInlineEntry'
import { readDraft, writeDraft, forgetDraft } from './adapters/persistence/comparisonDraftState'
import { natureMultiplier, knownNature, CHAMPIONS_EFFORT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP, validEffort, validCompleteEfforts } from './domain/champions/buildRules'
import { NATURES } from './domain/champions/natures'
import { registerOpponentSpecies, soleAbilityForSelectedSpecies, hasOpponentEntryData } from './domain/party/singleOpponentRegistration'
import { snapshotDefenderDrafts, removeDefenderDrafts } from './adapters/persistence/defenderDrafts'
import { pairTarget, resetPairAssumptions } from './domain/party/comparisonPairState'
import { effectiveComparisonSpeed } from './domain/battle/unifiedComparisonSpeed'
import { presentDoubleActionOrder } from './domain/battle/doubleOrderPresentation'
import { compareSpeedVisual } from './domain/battle/speedVisual'
import { EffortTuningModal } from './shared/display/EffortTuningModal'
import { magicEffortCandidate, magicEffortMarkers, namedNatureMagicAvailable } from './domain/champions/effortMagic'
import { getTypeBadgeLabel, getTypeBadgeSrc } from './shared/display/typeBadges'
import { analyzePartyMatchups } from './domain/party/partyAnalysis'
import { PartyAnalysisPanel } from './features/party/PartyAnalysisPanel'
import { getJaName, getJaTypes } from './shared/display/jaLabels'
import { actualStat } from './domain/champions/statMechanics'
import { STAT_PRESENTATION as EFFORT_STAT_OPTIONS } from './shared/display/statPresentation'
import { getSpeedAbility, speedActivationAllowed } from './domain/battle/speed/speedAbilities'
import { compareSingleSpeed, type SingleSpeedNature, type SingleSpeedItem } from './domain/battle/singleSpeedComparison'
import { PokemonCardHeading, PokemonStatGrid, ReadonlyPokemonCard, MoveSlotsEditor, MoveCandidateRow, createReadonlyCardStats, type CardStat } from './shared/display/PokemonCardOverview'
import SpeedLinePanel from './features/speedline/SpeedLinePanel'
import PokemonSearchField from './shared/search/PokemonSearchField'
import SearchCombobox from './shared/search/SearchCombobox'
import { searchMoves } from './shared/search/moveSearch'
import { byDisplayName, compareDisplayName } from './shared/search/displayOrder'
import { loadFormLearnset, loadMoveLearners, choicesForPool, moveInPool, resolveEligibleMoveInput, commitRecordedMoveInput, recordedMoveSnapshotState, LEARNSET_SOURCE, type FormLearnset } from './domain/champions/sharedLearnsets'

import { DexBrowseGrid, type DexBrowseCard } from './features/dex/DexBrowseGrid'
import { DEX_PAGE_SIZE, dexNextPage, dexPageScope, dexScrollRestoreReady, dexVisibleCount, type DexPage, type DexScrollRestore } from './features/dex/dexPagination'
import { DexMovePoolSection } from './features/dex/DexMovePoolSection'
import { loadDexGameLearnset, loadDexGameMoveLearners, DEX_GAME_LEARNSET_SOURCE, type DexLearnsetProvenance } from './domain/champions/dexGameLearnsets'
import { getDexGameMove, getDexGameMoveNames } from './domain/champions/dexGameMoveIndex'
import { getMoveMetadata } from './domain/champions/moveMetadata'
import { sourceBackedCardAbility } from './domain/samples/creatorCardAbility'
import { confirmedCreatorEfforts } from './domain/samples/creatorConfirmedEfforts'
import { PokemonBuildFields } from './shared/display/PokemonBuildFields'
import { normalizeSearchText, speciesSearchCandidates, searchPokemon, prioritizeExactSpecies } from './shared/search/pokemonSearch'
import { applyChoiceScarf, applySpeedModifiers, applySpeedStage } from './domain/battle/speed/speedModifiers'
import { defaultSpeedLineState } from './features/speedline/speedLineState'
import { mergeSpeedLineRoute, speedLineRouteAfterEdit } from './features/speedline/speedLineRouteRestore'
import { validateBackup } from './adapters/persistence/backupValidation'
import { STORAGE_KEY, loadPersistedState, persistWorkspace } from './adapters/persistence/appV1'
import { initializeWorkspace, uniquePartyId, fourMoves, runGuardedOcrImport } from './domain/party/partyWorkspace'
import { additionalFormSpecs, championsData } from './domain/champions/effectiveRoster'
import verifiedAbilityLabels from './canonical-data/champions/verifiedAbilityLabels.json'
import typeKoLabels from './assets/typeKoLabels.json'
import { abilityAliases, abilityForSpeciesSelection, abilityIndex, isCalculableAbility, localizedAbilityLabel, resolveFormAbility } from './domain/champions/abilityIdentity'

import { DAMAGE_MOD_SCALE, calcDamage, chainMods, engineMovePower, type BattleStatBlock, type DamageCalcModifiers } from './domain/battle/damageCore'
import type { AutocompleteHighlight, CalcMode, ConditionalPowerValue, CropRect, DamageTerrain, DamageWeather, DexDescriptionBundle, DexResultItem, DexSearchMode, DoubleBoardSlot, EffortStatKey, HoverTooltipCard, ImportExportPayload, ItemFieldTarget, MainSection, MainTab, MemberConfig, MoveCategory, MoveFieldTarget, MoveFilter, MoveMeta, MoveOption, NatureId, OcrImportedPartyMember, OcrStatKey, OpponentBulkPreset, OpponentOffensePreset, OpponentState, PartyMember, PartyTuning, PersistedState, RivalryMode, Row, SampleDamageTarget, SampleSpeedTarget, SampleWorkbenchTab, SavedPartyPreset, SavedSample, SiteLanguage, StatKey, ViewState } from './app/types'
import { dexSelectionId, localizedDexText, parseDexSelectionId } from './features/dex/helpers'
import { abilityDescriptionFor, getDexDescriptionsSync, itemDescriptionFor, loadDexDescriptions, loadMoveMetaByName, loadSpriteHashIndex, loadUsageTopMovesByKey, MOVE_META_BY_NAME, moveDescriptionFor, resolveItemInfo, usageTopMovesForKey } from './adapters/catalog/data'
type OpponentBulkConfig = {
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  defenseNature: number
  spDefenseNature: number
  label: string
}

type OpponentOffenseConfig = {
  attackEv: number
  spAttackEv: number
  attackNature: number
  spAttackNature: number
  label: string
}

type OpponentBulkState = {
  hpEv: number
  defenseEv: number
  spDefenseEv: number
  defenseNature: number
  spDefenseNature: number
}

type OpponentOffenseState = {
  attackEv: number
  spAttackEv: number
  attackNature: number
  spAttackNature: number
}
type DamageMoveSelection = { key: string; move: string }


function slotNumberLabel(index: number, language: SiteLanguage) {
  return language === 'en' ? `Slot ${index + 1}` : language === 'ja' ? `${index + 1}番` : `${index + 1}번`
}

function applyToSlotLabel(index: number, language: SiteLanguage) {
  return language === 'en' ? `Apply to Slot ${index + 1}` : language === 'ja' ? `${index + 1}番に適用` : `${index + 1}번 슬롯에 적용`
}

function putInPartySlotLabel(index: number, language: SiteLanguage) {
  return language === 'en' ? `Put in party slot ${index + 1}` : language === 'ja' ? `パーティ${index + 1}番スロットに入れる` : `파티 ${index + 1}번 슬롯에 넣기`
}

function searchSlotPlaceholder(index: number, language: SiteLanguage) {
  return language === 'en' ? `Search slot ${index + 1} and press Enter` : language === 'ja' ? `${index + 1}番スロットを検索してEnter` : `${index + 1}번 슬롯 검색 후 엔터`
}


function clonePartyMember(member: PartyMember): PartyMember {
  return {
    ...member,
    evs: { ...member.evs },
    config: { ...member.config },
    tuning: { ...member.tuning },
  }
}

function clonePartyList(party: PartyMember[]): PartyMember[] {
  return party.map(clonePartyMember)
}

function sanitizeLockedMoveSlots(input: unknown, slotCount: number): string[][] {
  if (!Array.isArray(input)) return Array.from({ length: slotCount }, () => [])
  return Array.from({ length: slotCount }, (_, idx) => {
    const value = input[idx]
    return Array.isArray(value)
      ? value.slice(0, 4).map((move) => typeof move === 'string' ? move : '')
      : []
  })
}

const SPEED_STAGE_OPTIONS = [-2, -1, 0, 1, 2] as const
const MAX_OPPONENTS = 6
const EFFORT_CHECKPOINTS = [11, 22, 32] as const

const OPPONENT_BULK_PRESETS: Record<Exclude<OpponentBulkPreset, 'custom'>, OpponentBulkConfig> = {
  'neutral-0': { hpEv: 0, defenseEv: 0, spDefenseEv: 0, defenseNature: 1, spDefenseNature: 1, label: '무보정 0EV' },
  'hp-32': { hpEv: 32, defenseEv: 0, spDefenseEv: 0, defenseNature: 1, spDefenseNature: 1, label: '체력 32' },
  'phys-32': { hpEv: 32, defenseEv: 32, spDefenseEv: 0, defenseNature: 1.1, spDefenseNature: 1, label: '체력/방어 32/32 +' },
  'spdef-32': { hpEv: 32, defenseEv: 0, spDefenseEv: 32, defenseNature: 1, spDefenseNature: 1.1, label: '체력/특수방어 32/32 +' },
}

const OPPONENT_OFFENSE_PRESETS: Record<Exclude<OpponentOffensePreset, 'custom'>, OpponentOffenseConfig> = {
  'neutral-0': { attackEv: 0, spAttackEv: 0, attackNature: 1, spAttackNature: 1, label: '무보정 0EV' },
  'atk-32': { attackEv: 32, spAttackEv: 0, attackNature: 1, spAttackNature: 1, label: '공격 32' },
  'spa-32': { attackEv: 0, spAttackEv: 32, attackNature: 1, spAttackNature: 1, label: '특수공격 32' },
  'atk-32-plus': { attackEv: 32, spAttackEv: 0, attackNature: 1.1, spAttackNature: 1, label: '공격 32 +' },
  'spa-32-plus': { attackEv: 0, spAttackEv: 32, attackNature: 1, spAttackNature: 1.1, label: '특수공격 32 +' },
}

function sanitizeOpponentBulkPreset(value: unknown): OpponentBulkPreset {
  return value === 'neutral-0' || value === 'hp-32' || value === 'phys-32' || value === 'spdef-32' || value === 'custom'
    ? value
    : 'neutral-0'
}

function sanitizeOpponentOffensePreset(value: unknown): OpponentOffensePreset {
  return value === 'neutral-0' || value === 'atk-32' || value === 'spa-32' || value === 'atk-32-plus' || value === 'spa-32-plus' || value === 'custom'
    ? value
    : 'neutral-0'
}

function sanitizeOpponentNatureMultiplier(value: unknown) {
  return Number(value) === 1.1 ? 1.1 : 1
}

function opponentBulkStateFromPreset(preset: OpponentBulkPreset): OpponentBulkState {
  const resolved = sanitizeOpponentBulkPreset(preset)
  const config = resolved === 'custom' ? OPPONENT_BULK_PRESETS['neutral-0'] : OPPONENT_BULK_PRESETS[resolved]
  return {
    hpEv: config.hpEv,
    defenseEv: config.defenseEv,
    spDefenseEv: config.spDefenseEv,
    defenseNature: config.defenseNature,
    spDefenseNature: config.spDefenseNature,
  }
}

function sanitizeOpponentBulkState(raw?: Partial<OpponentBulkState> | null, preset: OpponentBulkPreset = 'neutral-0'): OpponentBulkState {
  const base = opponentBulkStateFromPreset(preset)
  return {
    hpEv: clampEv(raw?.hpEv ?? base.hpEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    defenseEv: clampEv(raw?.defenseEv ?? base.defenseEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spDefenseEv: clampEv(raw?.spDefenseEv ?? base.spDefenseEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    defenseNature: sanitizeOpponentNatureMultiplier(raw?.defenseNature ?? base.defenseNature),
    spDefenseNature: sanitizeOpponentNatureMultiplier(raw?.spDefenseNature ?? base.spDefenseNature),
  }
}

function opponentOffenseStateFromPreset(preset: OpponentOffensePreset): OpponentOffenseState {
  const resolved = sanitizeOpponentOffensePreset(preset)
  const config = resolved === 'custom' ? OPPONENT_OFFENSE_PRESETS['neutral-0'] : OPPONENT_OFFENSE_PRESETS[resolved]
  return {
    attackEv: config.attackEv,
    spAttackEv: config.spAttackEv,
    attackNature: config.attackNature,
    spAttackNature: config.spAttackNature,
  }
}

function sanitizeOpponentOffenseState(raw?: Partial<OpponentOffenseState> | null, preset: OpponentOffensePreset = 'neutral-0'): OpponentOffenseState {
  const base = opponentOffenseStateFromPreset(preset)
  return {
    attackEv: clampEv(raw?.attackEv ?? base.attackEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spAttackEv: clampEv(raw?.spAttackEv ?? base.spAttackEv, CHAMPIONS_EFFORT_PER_STAT_CAP),
    attackNature: sanitizeOpponentNatureMultiplier(raw?.attackNature ?? base.attackNature),
    spAttackNature: sanitizeOpponentNatureMultiplier(raw?.spAttackNature ?? base.spAttackNature),
  }
}

function detectOpponentBulkPreset(state: OpponentBulkState): OpponentBulkPreset {
  for (const [preset, config] of Object.entries(OPPONENT_BULK_PRESETS) as [Exclude<OpponentBulkPreset, 'custom'>, OpponentBulkConfig][]) {
    if (
      state.hpEv === config.hpEv &&
      state.defenseEv === config.defenseEv &&
      state.spDefenseEv === config.spDefenseEv &&
      state.defenseNature === config.defenseNature &&
      state.spDefenseNature === config.spDefenseNature
    ) return preset
  }
  return 'custom'
}

function detectOpponentOffensePreset(state: OpponentOffenseState): OpponentOffensePreset {
  for (const [preset, config] of Object.entries(OPPONENT_OFFENSE_PRESETS) as [Exclude<OpponentOffensePreset, 'custom'>, OpponentOffenseConfig][]) {
    if (
      state.attackEv === config.attackEv &&
      state.spAttackEv === config.spAttackEv &&
      state.attackNature === config.attackNature &&
      state.spAttackNature === config.spAttackNature
    ) return preset
  }
  return 'custom'
}

function opponentBulkLabel(state: OpponentBulkState, preset: OpponentBulkPreset) {
  if (preset !== 'custom') return OPPONENT_BULK_PRESETS[preset].label
  const natureBits = [
    state.defenseNature > 1 ? '+방어' : null,
    state.spDefenseNature > 1 ? '+특수방어' : null,
  ].filter(Boolean)
  return `체력 ${state.hpEv} · 방어 ${state.defenseEv} · 특수방어 ${state.spDefenseEv}${natureBits.length ? ` · ${natureBits.join(' / ')}` : ''}`
}

function opponentOffenseLabel(state: OpponentOffenseState, preset: OpponentOffensePreset) {
  if (preset !== 'custom') return OPPONENT_OFFENSE_PRESETS[preset].label
  const natureBits = [
    state.attackNature > 1 ? '+공격' : null,
    state.spAttackNature > 1 ? '+특수공격' : null,
  ].filter(Boolean)
  return `공격 ${state.attackEv} · 특수공격 ${state.spAttackEv}${natureBits.length ? ` · ${natureBits.join(' / ')}` : ''}`
}
const starterKeys = ['mega-lopunny', 'mega-delphox', 'garchomp', 'toxapex', 'corviknight', 'kingambit']
function normalizeItemForKey(key: string, item: string) {
  return itemForSpeciesSelection(key, item)
}
function visibleChampionsItem(_key: string, item: string) {
  return item
}

const DEFAULT_NATURE_BY_KEY: Partial<Record<string, NatureId>> = {
  'mega-lopunny': 'jolly',
  'mega-delphox': 'timid',
  'garchomp': 'jolly',
  'toxapex': 'bold',
  'corviknight': 'impish',
  'kingambit': 'adamant',
}

function defaultNatureForKey(key: string): NatureId {
  if (!key) return 'jolly'
  const override = DEFAULT_NATURE_BY_KEY[key]
  if (override) return override

  const row = indexByKey.get(key) ?? null
  const curatedEntry = sampleMoves.find((entry) => entry.key === key)
  const moveOptions = moveOptionsForEntry(curatedEntry)
  const suggested = suggestedMoveGroupsForRow(row, moveOptions, {}, curatedEntry)
  const topMoves = topSuggestedMoves(suggested, 6)

  let physicalCount = 0
  let specialCount = 0
  let statusCount = 0
  for (const move of topMoves) {
    const meta = resolveMoveMeta(move, moveOptions, {})
    if (meta?.category === 'physical') physicalCount += 1
    else if (meta?.category === 'special') specialCount += 1
    else if (meta?.category === 'status') statusCount += 1
  }

  if (row) {
    const attackLead = row.attack - row.spAttack
    const specialLead = row.spAttack - row.attack
    const bulky = row.hp + Math.max(row.defense, row.spDefense) >= 180

    if (bulky && row.speed <= 80 && statusCount >= Math.max(2, physicalCount + specialCount)) {
      if (row.defense >= row.spDefense + 10) return attackLead >= 0 ? 'impish' : 'bold'
      if (row.spDefense >= row.defense + 10) return attackLead >= 0 ? 'careful' : 'calm'
    }
    if (physicalCount >= specialCount + 1 || attackLead >= 20) {
      return row.speed >= 90 ? 'jolly' : 'adamant'
    }
    if (specialCount >= physicalCount + 1 || specialLead >= 20) {
      return row.speed >= 90 ? 'timid' : 'modest'
    }
    if (bulky && row.speed <= 80) {
      if (row.defense >= row.spDefense + 10) return 'impish'
      if (row.spDefense >= row.defense + 10) return 'careful'
    }
    return row.speed >= 90
      ? (row.attack >= row.spAttack ? 'jolly' : 'timid')
      : (row.attack >= row.spAttack ? 'adamant' : 'modest')
  }

  return 'jolly'
}

const defaultPartyTuning = (): PartyTuning => ({ magicNumber: 0, maxValue: 0 })
const blankPartyMember = (): PartyMember => ({ key: '', config: { nature: 'jolly', scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: '', ability: '' })
const defaultParty: PartyMember[] = starterKeys.map((key) => ({ key, config: { nature: defaultNatureForKey(key), scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: normalizeItemForKey(key, ''), ability: defaultAbilityForKey(key) }))
const emptyParty: PartyMember[] = Array.from({ length: defaultParty.length }, () => blankPartyMember())
const cloneEmptyParty = () => clonePartyList(emptyParty)
const defaultSampleForge = (): PartyMember => ({ key: starterKeys[0], config: { nature: defaultNatureForKey(starterKeys[0]), scarf: false, speedStage: 0 }, picked: false, evs: { ...defaultEvs }, tuning: defaultPartyTuning(), item: normalizeItemForKey(starterKeys[0], ''), ability: defaultAbilityForKey(starterKeys[0]) })
const blankOpponent = (): OpponentState => ({
  key: '',
  item: '',
  ability: '',
  notes: '',
  revealedMoves: [],
  natureBoost: false,
  scarf: false,
  speedStage: 0,
  picked: false,
  hpEv: 0,
  defenseEv: 0,
  spDefenseEv: 0,
  speedEv: CHAMPIONS_EFFORT_PER_STAT_CAP,
  defenseNature: 1,
  spDefenseNature: 1,
})
const defaultOpponentKeys = ['rotom', 'garchomp', 'primarina', 'dragapult', 'mimikyu', 'meowscarada'].filter((key) => indexByKey.has(key))
const defaultOpponents: OpponentState[] = defaultOpponentKeys.map((key) => ({
  ...blankOpponent(),
  key,
  natureBoost: true,
}))
const blankSampleSpeedTarget = (): SampleSpeedTarget => ({
  ...blankOpponent(),
  natureBoost: true,
})
const defaultSampleSpeedTargets: SampleSpeedTarget[] = ['garchomp'].filter((key) => indexByKey.has(key)).map((key) => ({
  ...blankSampleSpeedTarget(),
  key,
}))
const blankSampleDamageTarget = (): SampleDamageTarget => ({
  ...blankOpponent(),
  speedEv: 0,
  hpEv: 0,
  defenseEv: 0,
  spDefenseEv: 0,
  defenseNature: 1,
  spDefenseNature: 1,
  moveName: '',
  opponentMoves: ['', '', '', ''],
  opponentMoveName: '',
  attackEv: 0,
  spAttackEv: 0,
  attackNature: 1,
  spAttackNature: 1,
  reverseAttackStage: 0,
  reverseDefenseStage: 0,
  reverseBurned: false,
  reverseReflect: false,
  reverseLightScreen: false,
  reverseAuroraVeil: false,
  reverseDefenderFullHp: true,
  sampleConditions: undefined,
})
const defaultSampleDamageTargets: SampleDamageTarget[] = ['garchomp'].filter((key) => indexByKey.has(key)).map((key) => ({
  ...blankSampleDamageTarget(),
  key,
}))
const emptyOpponents = Array.from({ length: MAX_OPPONENTS }, () => blankOpponent())

function firstFilledIndex<T extends { key: string }>(entries: T[], fallback = 0) {
  const idx = entries.findIndex((entry) => Boolean(entry.key))
  return idx >= 0 ? idx : fallback
}

function sanitizeBoardSlotIndex(value: unknown, entries: { key: string }[], fallback = 0) {
  const index = typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : fallback
  if (index < 0 || index >= entries.length) return fallback
  return index
}

function clampSpeedStage(value: unknown) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(-2, Math.min(2, Math.trunc(num)))
}

function clampBattleStage(value: unknown) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(-6, Math.min(6, Math.trunc(num)))
}

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

function moveOptionsForEntry(entry?: typeof sampleMoves[number] | null) {
  if (!entry) return [] as MoveOption[]
  return Array.from(new Set([...(entry.core ?? []), ...(entry.options ?? []), ...(entry.utility ?? [])])).map((name) => ({ name, type: null }))
}

function resolvedMovePower(meta: MoveMeta | null) {
  if (!meta) return 0
  if (meta.hitPowers?.length) return meta.hitPowers.reduce((sum, value) => sum + value, 0)
  if (meta.power != null && meta.hits) return meta.power * meta.hits
  if (meta.power != null) return meta.power
  if (meta.variablePower) return 70
  return 0
}

function autoMoveGroupsForRow(row: Row | null | undefined, moveOptions: MoveOption[], movePools: Record<string, MovePoolState>) {
  const uniqueOptions = Array.from(new Map(moveOptions.map((option) => [option.name, option])).values())
  if (!uniqueOptions.length) return null

  const preferredCategory = !row ? 'mixed'
    : row.attack >= row.spAttack + 15 ? 'physical'
      : row.spAttack >= row.attack + 15 ? 'special'
        : 'mixed'

  const evaluated = uniqueOptions.map((option) => {
    const meta = resolveMoveMeta(option.name, uniqueOptions, movePools)
    const category = meta?.category ?? null
    const type = meta?.type ?? option.type ?? null
    const power = resolvedMovePower(meta)
    const accuracy = meta?.accuracy ?? 100
    const priority = meta?.priority ?? 0
    const stab = !!(row && type && row.types.includes(type))
    return {
      name: option.name,
      category,
      type,
      power,
      accuracy,
      priority,
      stab,
      score: power
        + (stab ? 34 : 0)
        + (priority > 0 ? 18 + priority * 6 : 0)
        + ((accuracy ?? 100) / 10)
        + (preferredCategory === category ? 12 : preferredCategory !== 'mixed' && category && preferredCategory !== category ? -8 : 0),
      utilityScore: (priority > 0 ? 18 + priority * 5 : 0)
        + (stab ? 8 : 0)
        + ((accuracy ?? 100) / 10),
    }
  })

  const offense = evaluated
    .filter((move) => (move.category === 'physical' || move.category === 'special') && move.power > 0)
    .sort((a, b) => b.score - a.score || b.power - a.power || a.name.localeCompare(b.name, 'ko'))
  const utility = evaluated
    .filter((move) => move.category === 'status')
    .sort((a, b) => b.utilityScore - a.utilityScore || a.name.localeCompare(b.name, 'ko'))

  const core = offense
    .filter((move) => move.stab || move.priority > 0 || move.category === preferredCategory || preferredCategory === 'mixed')
    .slice(0, 8)
    .map((move) => move.name)
  const coreSet = new Set(core)
  const options = offense
    .filter((move) => !coreSet.has(move.name))
    .slice(0, 14)
    .map((move) => move.name)
  const utilityMoves = utility.slice(0, 10).map((move) => move.name)

  if (!core.length && !options.length && !utilityMoves.length) return null
  return {
    core,
    options,
    utility: utilityMoves,
  }
}

function mergeMoveGroupLists(...groups: (string[] | undefined)[]) {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const group of groups) {
    for (const move of group ?? []) {
      if (!move || seen.has(move)) continue
      seen.add(move)
      merged.push(move)
    }
  }
  return merged
}

function suggestedMoveGroupsForRow(
  row: Row | null | undefined,
  moveOptions: MoveOption[],
  movePools: Record<string, MovePoolState>,
  curatedEntry?: typeof sampleMoves[number] | null,
) {
  const auto = autoMoveGroupsForRow(row, moveOptions, movePools)
  if (!curatedEntry && !auto) return null
  return {
    core: mergeMoveGroupLists(curatedEntry?.core, auto?.core).slice(0, 10),
    options: mergeMoveGroupLists(curatedEntry?.options, auto?.options, auto?.core).filter((move) => !mergeMoveGroupLists(curatedEntry?.core, auto?.core).includes(move)).slice(0, 16),
    utility: mergeMoveGroupLists(curatedEntry?.utility, auto?.utility).filter((move) => !mergeMoveGroupLists(curatedEntry?.core, auto?.core, curatedEntry?.options, auto?.options).includes(move)).slice(0, 12),
  }
}

function topSuggestedMoves(groups: ReturnType<typeof suggestedMoveGroupsForRow>, limit = 10) {
  if (!groups) return []
  return mergeMoveGroupLists(groups.core, groups.options, groups.utility).slice(0, limit)
}

let ocrMoveIndexCache: { nameKo: string; candidates: string[] }[] | null = null
let ocrItemIndexCache: { itemKey: string; candidates: string[] }[] | null = null
let ocrAbilityIndexCache: { abilityKey: string; koLabel: string; candidates: string[] }[] | null = null

function getOcrMoveIndexSync() {
  if (ocrMoveIndexCache) return ocrMoveIndexCache
  const bundle = getDexDescriptionsSync()
  if (!bundle) return []
  ocrMoveIndexCache = Object.entries(bundle.moves).map(([nameKo, description]) => ({
    nameKo,
    candidates: Array.from(new Set([
      nameKo,
      description.nameEn,
      description.nameJa,
      ...moveNameCandidates(nameKo),
    ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
  }))
  return ocrMoveIndexCache
}

function getOcrItemIndexSync() {
  if (ocrItemIndexCache) return ocrItemIndexCache
  const bundle = getDexDescriptionsSync()
  if (!bundle) return []
  ocrItemIndexCache = Object.entries(bundle.items).map(([itemKey, description]) => ({
    itemKey,
    candidates: Array.from(new Set([
      itemKey,
      description.nameKo,
      description.nameEn,
      description.nameJa,
    ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
  }))
  return ocrItemIndexCache
}

const OCR_NATURE_INDEX = NATURES.map((nature) => ({
  id: nature.id,
  candidates: Array.from(new Set([
    nature.id,
    nature.label,
    titleCaseSlug(nature.id),
  ].flatMap((entry) => [entry, normalizeSearchText(entry)]))),
}))

const OCR_EFFORT_LABELS: Record<OcrStatKey, string[]> = {
  hp: ['hp', 'h', '체력', 'hp체력'],
  attack: ['atk', 'attack', 'a', '공격'],
  defense: ['def', 'defense', 'b', '방어'],
  spAttack: ['spa', 'spatk', 'satk', 'specialattack', 'c', '특공', '특수공격'],
  spDefense: ['spd', 'spdef', 'sdef', 'specialdefense', 'd', '특방', '특수방어'],
  speed: ['spe', 'speed', 's', '스피드', '속도'],
}

const OCR_EFFORT_PATTERNS = Object.fromEntries(
  Object.entries(OCR_EFFORT_LABELS).map(([stat, labels]) => [
    stat,
    labels.map((label) => new RegExp(`(?:^|[^a-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:/=-]?\\s*(\\d{1,3})`, 'i')),
  ]),
) as Record<OcrStatKey, RegExp[]>

const MAX_SPRITE_HASH_DISTANCE = 72
const ITEM_EFFECT_SUMMARIES: Record<string, Record<SiteLanguage, string>> = {
  'いのちのたま': { ko: '공격 기술의 대미지 30% 증가. 공격 후 최대 HP의 10%를 잃음.', en: 'Boosts damaging moves by 30%, then costs 10% of max HP after attacking.', ja: '攻撃技のダメージが30%上がり 攻撃後に最大HPの10%を失う。' },
  'おうじゃのしるし': { ko: '공격 기술 명중 시 10% 확률로 상대를 풀죽게 함.', en: 'Damaging moves have a 10% chance to make the target flinch.', ja: '攻撃技が当たると10%の確率で相手をひるませる。' },
  'きあいのタスキ': { ko: 'HP가 가득 찬 상태에서 기절할 공격을 받으면 HP 1로 버팀.', en: 'If at full HP, survives a would-be KO hit with 1 HP.', ja: 'HP満タンのとき ひんしになる攻撃を受けても HP1で耐える。' },
  'きせきのタネ': { ko: '풀 타입 기술 위력 20% 증가.', en: 'Boosts Grass-type move power by 20%.', ja: 'くさタイプの技の威力が20%上がる。' },
  'くろいメガネ': { ko: '악 타입 기술 위력 20% 증가.', en: 'Boosts Dark-type move power by 20%.', ja: 'あくタイプの技の威力が20%上がる。' },
  'くろおび': { ko: '격투 타입 기술 위력 20% 증가.', en: 'Boosts Fighting-type move power by 20%.', ja: 'かくとうタイプの技の威力が20%上がる。' },
  'こだわりスカーフ': { ko: '스피드 1.5배. 대신 처음 고른 기술만 계속 사용.', en: 'Raises Speed by 1.5x, but locks the user into the first move used.', ja: '素早さが1.5倍になるが 最初に選んだ技しか出せなくなる。' },
  'しろいハーブ': { ko: '한 번만 능력 하락을 원래대로 되돌리고 소모됨.', en: 'Restores lowered stats once, then is consumed.', ja: '下がった能力を一度だけ元に戻して消費される。' },
  'しんぴのしずく': { ko: '물 타입 기술 위력 20% 증가.', en: 'Boosts Water-type move power by 20%.', ja: 'みずタイプの技の威力が20%上がる。' },
  'じしゃく': { ko: '전기 타입 기술 위력 20% 증가.', en: 'Boosts Electric-type move power by 20%.', ja: 'でんきタイプの技の威力が20%上がる。' },
  'するどいくちばし': { ko: '비행 타입 기술 위력 20% 증가.', en: 'Boosts Flying-type move power by 20%.', ja: 'ひこうタイプの技の威力が20%上がる。' },
  'せんせいのツメ': { ko: '20% 확률로 같은 우선도 내에서 먼저 행동.', en: 'Gives a 20% chance to move first within the same priority bracket.', ja: '20%の確率で 同じ優先度内なら先に行動できる。' },
  'たべのこし': { ko: '턴 종료마다 최대 HP의 1/16 회복.', en: 'Restores 1/16 of max HP at the end of each turn.', ja: '毎ターン終了時に 最大HPの1/16を回復する。' },
  'でんきだま': { ko: '피카츄가 들면 공격·특수공격 2배.', en: 'When held by Pikachu, doubles Attack and Special Attack.', ja: 'ピカチュウが持つと 攻撃と特攻が2倍になる。' },
  'とけないこおり': { ko: '얼음 타입 기술 위력 20% 증가.', en: 'Boosts Ice-type move power by 20%.', ja: 'こおりタイプの技の威力が20%上がる。' },
  'どくバリ': { ko: '독 타입 기술 위력 20% 증가.', en: 'Boosts Poison-type move power by 20%.', ja: 'どくタイプの技の威力が20%上がる。' },
  'のろいのおふだ': { ko: '고스트 타입 기술 위력 20% 증가.', en: 'Boosts Ghost-type move power by 20%.', ja: 'ゴーストタイプの技の威力が20%上がる。' },
  'ひかりのこな': { ko: '상대 기술의 명중률을 10% 낮춤.', en: 'Lowers the accuracy of moves used against the holder by 10%.', ja: '相手の技の命中率を10%下げる。' },
  'まがったスプーン': { ko: '에스퍼 타입 기술 위력 20% 증가.', en: 'Boosts Psychic-type move power by 20%.', ja: 'エスパータイプの技の威力が20%上がる。' },
  'もくたん': { ko: '불꽃 타입 기술 위력 20% 증가.', en: 'Boosts Fire-type move power by 20%.', ja: 'ほのおタイプの技の威力が20%上がる。' },
  'やわらかいすな': { ko: '땅 타입 기술 위력 20% 증가.', en: 'Boosts Ground-type move power by 20%.', ja: 'じめんタイプの技の威力が20%上がる。' },
  'りゅうのキバ': { ko: '드래곤 타입 기술 위력 20% 증가.', en: 'Boosts Dragon-type move power by 20%.', ja: 'ドラゴンタイプの技の威力が20%上がる。' },
  'イトケのみ': { ko: '효과가 굉장한 물 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Water-type hit, then is consumed.', ja: '効果抜群の みず技を一度だけ半減して消費される。' },
  'オッカのみ': { ko: '효과가 굉장한 불꽃 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Fire-type hit, then is consumed.', ja: '効果抜群の ほのお技を一度だけ半減して消費される。' },
  'オボンのみ': { ko: 'HP가 절반 이하일 때 최대 HP의 25% 회복.', en: 'Restores 25% of max HP when HP drops to half or below.', ja: 'HPが半分以下になると 最大HPの25%を回復する。' },
  'カゴのみ': { ko: '잠듦 상태가 되면 즉시 잠에서 깨어나며 소모됨.', en: 'Wakes the holder immediately if it falls asleep, then is consumed.', ja: 'ねむり状態になると すぐ目を覚まして消費される。' },
  'カシブのみ': { ko: '효과가 굉장한 고스트 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Ghost-type hit, then is consumed.', ja: '効果抜群の ゴースト技を一度だけ半減して消費される。' },
  'シュカのみ': { ko: '효과가 굉장한 땅 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Ground-type hit, then is consumed.', ja: '効果抜群の じめん技を一度だけ半減して消費される。' },
  'シルクのスカーフ': { ko: '노말 타입 기술 위력 20% 증가.', en: 'Boosts Normal-type move power by 20%.', ja: 'ノーマルタイプの技の威力が20%上がる。' },
  'ソクノのみ': { ko: '효과가 굉장한 전기 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Electric-type hit, then is consumed.', ja: '効果抜群の でんき技を一度だけ半減して消費される。' },
  'ナモのみ': { ko: '효과가 굉장한 악 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Dark-type hit, then is consumed.', ja: '効果抜群の あく技を一度だけ半減して消費される。' },
  'ハバンのみ': { ko: '효과가 굉장한 드래곤 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Dragon-type hit, then is consumed.', ja: '効果抜群の ドラゴン技を一度だけ半減して消費される。' },
  'バコウのみ': { ko: '효과가 굉장한 비행 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Flying-type hit, then is consumed.', ja: '効果抜群の ひこう技を一度だけ半減して消費される。' },
  'ビアーのみ': { ko: '효과가 굉장한 독 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Poison-type hit, then is consumed.', ja: '効果抜群の どく技を一度だけ半減して消費される。' },
  'ピントレンズ': { ko: '급소 랭크 1단계 상승.', en: 'Raises the holder’s critical-hit ratio by 1 stage.', ja: '急所ランクが1段階上がる。' },
  'メタルコート': { ko: '강철 타입 기술 위력 20% 증가.', en: 'Boosts Steel-type move power by 20%.', ja: 'はがねタイプの技の威力が20%上がる。' },
  'メンタルハーブ': { ko: '도발·앵콜·트집·금지류를 한 번 해제하고 소모됨.', en: 'Clears Taunt, Encore, Torment, Disable, and similar effects once, then is consumed.', ja: 'ちょうはつ・アンコール・いちゃもん・かなしばり系を一度だけ解除して消費される。' },
  'ヤチェのみ': { ko: '효과가 굉장한 얼음 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Ice-type hit, then is consumed.', ja: '効果抜群の こおり技を一度だけ半減して消費される。' },
  'ヨプのみ': { ko: '효과가 굉장한 격투 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Fighting-type hit, then is consumed.', ja: '効果抜群の かくとう技を一度だけ半減して消費される。' },
  'ヨロギのみ': { ko: '효과가 굉장한 바위 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Rock-type hit, then is consumed.', ja: '効果抜群の いわ技を一度だけ半減して消費される。' },
  'ラムのみ': { ko: '상태이상에 걸리면 한 번 즉시 회복하고 소모됨.', en: 'Cures a status condition once, then is consumed.', ja: '状態異常になると 一度だけすぐ回復して消費される。' },
  'リリバのみ': { ko: '효과가 굉장한 강철 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Steel-type hit, then is consumed.', ja: '効果抜群の はがね技を一度だけ半減して消費される。' },
  'リンドのみ': { ko: '효과가 굉장한 풀 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Grass-type hit, then is consumed.', ja: '効果抜群の くさ技を一度だけ半減して消費される。' },
  'ロゼルのみ': { ko: '효과가 굉장한 페어리 타입 공격을 한 번 반감하고 소모됨.', en: 'Weakens one super-effective Fairy-type hit, then is consumed.', ja: '効果抜群の フェアリー技を一度だけ半減して消費される。' },
  'ながねぎ': { ko: '파오리와 창파나이트가 지니면 급소율이 2단계 상승.', en: 'Raises Farfetch’d and Sirfetch’d’s critical-hit ratio by 2 stages.', ja: 'カモネギとネギガナイトが持つと 急所ランクが2段階上がる。' },
  'ゴツゴツメット': { ko: '접촉기를 맞으면 공격자에게 최대 HP의 1/6 대미지.', en: 'Damages contact attackers for 1/6 of their max HP.', ja: '接触技を受けると 攻撃した相手に最大HPの1/6のダメージ。' },
  'ふうせん': { ko: '땅에 있지 않은 상태가 되어 땅 기술을 무효화. 공격을 받으면 사라짐.', en: 'Grants Ground immunity until the holder is hit.', ja: '地面にいない状態になり じめん技を無効化。攻撃を受けると割れる。' },
  'レッドカード': { ko: '공격을 받으면 상대를 강제 교체시키고 소모됨.', en: 'Forces the attacker to switch out when hit, then is consumed.', ja: '攻撃を受けると 相手を強制交代させて消費される。' },
  'しめつけバンド': { ko: '구속 기술의 턴 대미지를 최대 HP의 1/6로 증가.', en: 'Raises binding-move residual damage to 1/6 of max HP.', ja: 'しめつける技の毎ターンダメージが 最大HPの1/6になる。' },
  'だっしゅつボタン': { ko: '공격을 받으면 자신이 교체되고 소모됨.', en: 'Switches the holder out when hit, then is consumed.', ja: '攻撃を受けると 自分が交代して消費される。' },
  'ノーマルジュエル': { ko: '노말 타입 기술 위력 30% 증가. 한 번 발동 후 소모됨.', en: 'Boosts one Normal-type move by 30%, then is consumed.', ja: 'ノーマルタイプの技の威力が一度だけ30%上がり 消費される。' },
  'グランドコート': { ko: '자신이 전개한 필드 지속 시간을 5턴에서 8턴으로 연장.', en: 'Extends terrain set by the holder from 5 to 8 turns.', ja: '自分が張ったフィールドの効果を 5ターンから8ターンに延ばす。' },
  'エレキシード': { ko: '일렉트릭필드에서 방어가 1단계 상승하고 소모됨.', en: 'Raises Defense by 1 stage in Electric Terrain, then is consumed.', ja: 'エレキフィールドで 防御が1段階上がり消費される。' },
  'サイコシード': { ko: '사이코필드에서 특수방어가 1단계 상승하고 소모됨.', en: 'Raises Special Defense by 1 stage in Psychic Terrain, then is consumed.', ja: 'サイコフィールドで 特防が1段階上がり消費される。' },
  'ミストシード': { ko: '미스트필드에서 특수방어가 1단계 상승하고 소모됨.', en: 'Raises Special Defense by 1 stage in Misty Terrain, then is consumed.', ja: 'ミストフィールドで 特防が1段階上がり消費される。' },
  'グラスシード': { ko: '그래스필드에서 방어가 1단계 상승하고 소모됨.', en: 'Raises Defense by 1 stage in Grassy Terrain, then is consumed.', ja: 'グラスフィールドで 防御が1段階上がり消費される。' },
}

const moveMetaCache = new Map<string, Promise<MoveOption>>()


function normalizeMoveSlots(moves: string[]) {
  const normalized = moves.slice(0, 4).map((entry) => entry.trim())
  while (normalized.length && !normalized[normalized.length - 1]) normalized.pop()
  return normalized
}

function sanitizeMoveSlotList(input: unknown) {
  if (!Array.isArray(input)) return []
  return normalizeMoveSlots(input.filter((move): move is string => typeof move === 'string'))
}

function megaRawBaseKey(key: string) {
  if (!key.startsWith('mega-')) return key
  const raw = key.slice(5)
  if (raw.endsWith('-x') || raw.endsWith('-y') || raw.endsWith('-z')) return raw.slice(0, -2)
  return raw
}

function megaBaseKey(key: string) {
  if (!key.startsWith('mega-')) return key
  const rawBaseKey = megaRawBaseKey(key)
  if (indexByKey.has(rawBaseKey)) return rawBaseKey
  const row = indexByKey.get(key)
  if (!row) return rawBaseKey
  const koBaseName = row.name_ko.replace(/^메가/, '').replace(/\s*[XYZ]$/i, '').trim()
  const enBaseName = row.name_en.replace(/^Mega\s+/i, '').replace(/\s+[XYZ]$/i, '').trim().toLowerCase()
  const matched = rows.find((candidate) => !candidate.key.startsWith('mega-') && (
    candidate.name_ko.trim() === koBaseName
    || candidate.name_en.trim().toLowerCase() === enBaseName
  ))
  return matched?.key ?? rawBaseKey
}

function pokemonApiCandidates(key: string) {
  const candidates = [key]
  if (key.startsWith('mega-')) {
    const rawBase = megaRawBaseKey(key)
    const base = megaBaseKey(key)
    candidates.push(`${rawBase}-mega`, rawBase)
    if (base !== rawBase) candidates.push(base)
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
  if (key.startsWith('mega-')) {
    keys.push(megaBaseKey(key))
    const rawBase = megaRawBaseKey(key)
    if (rawBase !== megaBaseKey(key)) keys.push(rawBase)
  }
  const [first, ...rest] = key.split('-')
  if (['alolan', 'galarian', 'hisuian', 'paldean'].includes(first) && rest.length) keys.push(rest.join('-'))
  return Array.from(new Set(keys))
}

function megaCandidateKeysForBase(baseKey: string) {
  return rows
    .filter((row) => row.key.startsWith('mega-') && megaBaseKey(row.key) === baseKey)
    .map((row) => row.key)
    .sort((a, b) => a.localeCompare(b, 'en'))
}

function resolveCalcKeyWithMega(key: string, megaSelection: string | null) {
  const baseKey = megaBaseKey(key)
  const megaCandidates = megaCandidateKeysForBase(baseKey)
  if (!megaCandidates.length) return key
  if (megaSelection && megaCandidates.includes(megaSelection)) return megaSelection
  return baseKey
}

function megaToggleLabel(key: string, language: SiteLanguage) {
  if (key.endsWith('-x')) return language === 'en' ? 'Mega X' : language === 'ja' ? 'メガX' : '메가X'
  if (key.endsWith('-y')) return language === 'en' ? 'Mega Y' : language === 'ja' ? 'メガY' : '메가Y'
  return language === 'en' ? 'Mega' : language === 'ja' ? 'メガ' : '메가'
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


function sanitizeMemberConfig(input: unknown, key = ''): MemberConfig {
  const config = input && typeof input === 'object' ? (input as Partial<MemberConfig>) : {}
  const rawNature = typeof (config as { nature?: unknown }).nature === 'string' ? (config as { nature: NatureId }).nature : null
  const legacyNature = legacyNatureFromBoostStat((config as { natureBoostStat?: unknown }).natureBoostStat)
  return {
    nature: rawNature && natureById.has(rawNature) ? rawNature : (legacyNature || defaultNatureForKey(key)),
    // Legacy builds stored a hidden scarf flag separately from the held item.
    // Discard it so player/sample speed always follows the visible item value.
    scarf: false,
    speedStage: clampSpeedStage(config.speedStage),
  }
}

export function classifyAbilityForKey(key: string, raw: string) {
  return resolveFormAbility(indexByKey.get(key), raw, abilityDescriptionFor, rows)
}
function abilityMatchesKey(key: string, ability: string) {
  return classifyAbilityForKey(key, ability).status === 'allowed'
}
function sanitizeAbilityForKey(_key: string, ability: unknown, _fallbackToDefault = false) {
  // A read boundary never substitutes a form's ability for original evidence.
  return typeof ability === 'string' ? ability : ''
}

function sanitizePartyTuning(input: unknown): PartyTuning {
  const tuning = input && typeof input === 'object' ? (input as Partial<PartyTuning>) : {}
  return {
    magicNumber: clampNonNegativeInt(tuning.magicNumber, 255),
    maxValue: clampNonNegativeInt(tuning.maxValue, 255),
  }
}

function clampNonNegativeInt(value: unknown, max = 999) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(max, Math.trunc(num)))
}

export function sanitizeParty(input: unknown): PartyMember[] {
  if (!Array.isArray(input)) return defaultParty
  const cleaned = input
    .map((member) => {
      if (!member || typeof member !== 'object') return null
      const raw = member as Partial<PartyMember>
      if (typeof raw.key !== 'string') return null
      if (raw.key && !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        config: sanitizeMemberConfig(raw.config, raw.key),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        evs: sanitizeEvs(raw.evs),
        tuning: sanitizePartyTuning(raw.tuning),
        item: typeof raw.item === 'string' ? raw.item : '',
        ability: sanitizeAbilityForKey(raw.key, raw.ability, raw.ability === undefined),
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
        ability: sanitizeAbilityForKey(raw.key, raw.ability, false),
        ...(NATURES.some(nature => nature.id === raw.nature) ? { nature: raw.nature } : {}),
        ...(validEffort(raw.attackEv) ? { attackEv: raw.attackEv } : {}),
        ...(validEffort(raw.spAttackEv) ? { spAttackEv: raw.spAttackEv } : {}),
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        revealedMoves: Array.isArray(raw.revealedMoves)
          ? raw.revealedMoves.filter((move): move is string => typeof move === 'string')
          : [],
        natureBoost: typeof raw.natureBoost === 'boolean' ? raw.natureBoost : false,
        scarf: typeof raw.scarf === 'boolean' ? raw.scarf : false,
        speedStage: clampSpeedStage(raw.speedStage),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        hpEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget>).hpEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget>).defenseEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        spDefenseEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget>).spDefenseEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        speedEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget> & { speedEv?: number }).speedEv ?? CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseNature: (raw as Partial<SampleDamageTarget>).defenseNature === 1.1 ? 1.1 : 1,
        spDefenseNature: (raw as Partial<SampleDamageTarget>).spDefenseNature === 1.1 ? 1.1 : 1,
      }
    })
    .filter((opponent): opponent is OpponentState => Boolean(opponent))
    .slice(0, MAX_OPPONENTS)

  return cleaned.length ? cleaned : defaultOpponents
}

function sanitizeConfirmedMovesByKey(input: unknown): Record<string, string[]> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => typeof key === 'string')
      .map(([key, value]) => [key, Array.isArray(value) ? fourMoves(value) : []])
  )
}

function sanitizeSampleSpeedTargets(input: unknown): SampleSpeedTarget[] {
  if (!Array.isArray(input)) return defaultSampleSpeedTargets.slice(0, 1)
  const cleaned = input
    .map((target) => {
      if (!target || typeof target !== 'object') return null
      const raw = target as Partial<SampleSpeedTarget>
      if (typeof raw.key !== 'string') return null
      if (raw.key && !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        item: typeof raw.item === 'string' ? raw.item : '',
        ability: typeof raw.ability === 'string' ? raw.ability : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        revealedMoves: Array.isArray(raw.revealedMoves) ? raw.revealedMoves.filter((move): move is string => typeof move === 'string') : [],
        natureBoost: typeof raw.natureBoost === 'boolean' ? raw.natureBoost : true,
        scarf: typeof raw.scarf === 'boolean' ? raw.scarf : false,
        speedStage: clampSpeedStage(raw.speedStage),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        speedEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget> & { speedEv?: number }).speedEv ?? CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP),
      }
    })
    .filter((target): target is SampleSpeedTarget => Boolean(target))
    .slice(0, 1)

  return cleaned.length ? cleaned : defaultSampleSpeedTargets.slice(0, 1)
}

function sanitizeSampleDamageTargets(input: unknown): SampleDamageTarget[] {
  if (!Array.isArray(input)) return defaultSampleDamageTargets.slice(0, 1)
  const cleaned = input
    .map((target) => {
      if (!target || typeof target !== 'object') return null
      const raw = target as Partial<SampleDamageTarget>
      if (typeof raw.key !== 'string') return null
      if (raw.key && !indexByKey.has(raw.key)) return null
      return {
        key: raw.key,
        item: typeof raw.item === 'string' ? raw.item : '',
        ability: typeof raw.ability === 'string' ? raw.ability : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        revealedMoves: Array.isArray(raw.revealedMoves) ? raw.revealedMoves.filter((move): move is string => typeof move === 'string') : [],
        natureBoost: typeof raw.natureBoost === 'boolean' ? raw.natureBoost : true,
        scarf: typeof raw.scarf === 'boolean' ? raw.scarf : false,
        speedStage: clampSpeedStage(raw.speedStage),
        picked: typeof raw.picked === 'boolean' ? raw.picked : false,
        hpEv: clampNonNegativeInt(raw.hpEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseEv: clampNonNegativeInt(raw.defenseEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        spDefenseEv: clampNonNegativeInt(raw.spDefenseEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        speedEv: clampNonNegativeInt((raw as Partial<SampleDamageTarget> & { speedEv?: number }).speedEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        defenseNature: raw.defenseNature === 1.1 ? 1.1 : 1,
        spDefenseNature: raw.spDefenseNature === 1.1 ? 1.1 : 1,
        moveName: typeof raw.moveName === 'string' ? raw.moveName : '',
        opponentMoves: fixedSampleOpponentMoves(raw.opponentMoves),
        opponentMoveName: typeof raw.opponentMoveName === 'string' ? raw.opponentMoveName : '',
        attackEv: clampNonNegativeInt(raw.attackEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        spAttackEv: clampNonNegativeInt(raw.spAttackEv ?? 0, CHAMPIONS_EFFORT_PER_STAT_CAP),
        attackNature: raw.attackNature === 1.1 ? 1.1 : raw.attackNature === 0.9 ? 0.9 : 1,
        spAttackNature: raw.spAttackNature === 1.1 ? 1.1 : raw.spAttackNature === 0.9 ? 0.9 : 1,
        reverseAttackStage: clampSpeedStage(raw.reverseAttackStage),
        reverseDefenseStage: clampSpeedStage(raw.reverseDefenseStage),
        reverseBurned: typeof raw.reverseBurned === 'boolean' ? raw.reverseBurned : false,
        reverseReflect: typeof raw.reverseReflect === 'boolean' ? raw.reverseReflect : false,
        reverseLightScreen: typeof raw.reverseLightScreen === 'boolean' ? raw.reverseLightScreen : false,
        reverseAuroraVeil: typeof raw.reverseAuroraVeil === 'boolean' ? raw.reverseAuroraVeil : false,
        reverseDefenderFullHp: typeof raw.reverseDefenderFullHp === 'boolean' ? raw.reverseDefenderFullHp : true,
        sampleConditions: raw.sampleConditions?.ownerKey && typeof raw.sampleConditions.ownerKey === 'string'
          ? sampleConditions(raw.sampleConditions.ownerKey, raw.sampleConditions) : undefined,
      } as SampleDamageTarget
    })
    .filter((target): target is SampleDamageTarget => Boolean(target))
    .slice(0, 1)

  return cleaned.length ? cleaned : defaultSampleDamageTargets.slice(0, 1)
}

function sanitizeSavedSamples(input: unknown): SavedSample[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry, idx) => {
      if (!entry || typeof entry !== 'object') return null
      const raw = entry as Partial<SavedSample>
      const member = sanitizeParty([raw.member])[0]
      if (!member) return null
      const lockedMoves = Array.isArray(raw.lockedMoves)
        ? raw.lockedMoves.filter((move): move is string => typeof move === 'string' && Boolean(move.trim())).slice(0, 4)
        : []
      return {
        id: typeof raw.id === 'string' ? raw.id : `sample-${idx}`,
        label: typeof raw.label === 'string' && raw.label.trim() ? raw.label : `${member.key}-${idx + 1}`,
        member,
        lockedMoves,
      }
    })
    .filter((entry): entry is SavedSample => Boolean(entry))
}

function sanitizeSavedPartyPresets(input: unknown): SavedPartyPreset[] {
  if (!Array.isArray(input)) return []
  const used = new Set<string>()
  return input
    .map((entry, idx) => {
      if (!entry || typeof entry !== 'object') return null
      const raw = entry as Partial<SavedPartyPreset>
      const party = sanitizeParty(raw.party)
      const id = uniquePartyId(Array.from(used, id => ({ id } as SavedPartyPreset)), typeof raw.id === 'string' && raw.id.trim() ? raw.id : `party-${idx}`)
      used.add(id)
      return {
        id,
        label: typeof raw.label === 'string' && raw.label.trim() ? raw.label : `Party ${idx + 1}`,
        party,
        lockedMovesBySlot: sanitizeLockedMoveSlots(raw.lockedMovesBySlot, party.length),
      }
    })
    .filter((entry): entry is SavedPartyPreset => Boolean(entry))
}

function sanitizeSelectedIndex(value: unknown, listLength: number) {
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0 || num >= listLength) return 0
  return num
}

function pushDexDetailHistory(mode: DexSearchMode, query: string, selection: string) {
  const url = new URL(window.location.href)
  const route = new URL(url.hash.replace(/^#/, '') || '/dex', url)
  route.searchParams.set('dexTab', mode)
  route.searchParams.set('q', query)
  route.searchParams.set('uq', query)
  route.searchParams.set('sel', selection)
  url.hash = `${route.pathname}${route.search}`
  if (url.href !== window.location.href) window.history.pushState(null, '', url)
}

function koChanceForHits(rolls: number[], hp: number, hitCount: number) {
  let states = new Map<number, number>([[0, 1]])
  for (let turn = 0; turn < hitCount; turn += 1) {
    const next = new Map<number, number>()
    for (const [sum, ways] of states) {
      for (const roll of rolls) {
        const total = Math.min(hp, sum + roll)
        next.set(total, (next.get(total) ?? 0) + ways)
      }
    }
    states = next
  }
  const success = states.get(hp) ?? 0
  return success / Math.pow(rolls.length, hitCount)
}

function isNoEffectDamage(damage: { min: number, max: number, rolls: number[] } | null | undefined) {
  if (!damage) return false
  return damage.max <= 0 || damage.rolls.every((roll) => roll <= 0)
}

function resolveDamageVerdict(damage: { min: number, max: number, rolls: number[] }, hp: number, language: SiteLanguage, multiHit = false) {
  if (isNoEffectDamage(damage)) {
    return language === 'en' ? 'No effect' : language === 'ja' ? '無効' : '무효'
  }
  // The engine repeats a single roll across hits; those rolls are not a true
  // per-hit distribution. Bounds are safe, a KO probability would be invented.
  if (multiHit) {
    for (let turns = 1; turns <= 8; turns += 1) {
      if (damage.min * turns >= hp) return language === 'en' ? `Guaranteed ${turns}HKO` : language === 'ja' ? `確定 ${turns}発` : `확정 ${turns}타`
      if (damage.max * turns >= hp) return language === 'en' ? `Possible ${turns}HKO (range only)` : language === 'ja' ? `最大 ${turns}発の可能性（範囲のみ）` : `최대 ${turns}타 가능 (범위만)`
    }
    return language === 'en' ? 'Needs long game' : language === 'ja' ? '長期戦' : '장기전'
  }
  for (let hitCount = 1; hitCount <= 8; hitCount += 1) {
    const chance = koChanceForHits(damage.rolls, hp, hitCount)
    if (chance >= 1) {
      return language === 'en'
        ? `Guaranteed ${hitCount}HKO`
        : language === 'ja'
          ? `確定 ${hitCount}発`
          : `확정 ${hitCount}타`
    }
    if (chance > 0) {
      const chancePct = (chance * 100).toFixed(chance >= 0.1 ? 1 : 2).replace(/\.0$/, '')
      return language === 'en'
        ? `Roll ${hitCount}HKO · ${chancePct}%`
        : language === 'ja'
          ? `乱数 ${hitCount}発 · ${chancePct}%`
          : `난수 ${hitCount}타 · ${chancePct}%`
    }
  }
  return language === 'en' ? 'Needs long game' : language === 'ja' ? '長期戦' : '장기전'
}

function resolveDamageVerdictTone(damage: { min: number, max: number, rolls: number[] } | null | undefined, hp: number | null | undefined) {
  if (!damage || !hp || isNoEffectDamage(damage)) return 'neutral'
  const verdict = resolveDamageVerdict(damage, hp, 'en')
  if (verdict.startsWith('Guaranteed')) return 'guaranteed'
  if (verdict.startsWith('Roll')) return 'possible'
  return 'neutral'
}

function opponentScenarioSpeed(row: Row, speedPoints: number, boosted: boolean, scarf: boolean, speedStage: number) {
  let value = actualStat(row.speed, speedPoints, boosted ? 1.1 : 1)
  value = applySpeedStage(value, speedStage)
  if (scarf) value = applyChoiceScarf(value)
  return value
}

function opponentScenarioNeeds(row: Row, mySpeed: number, boosted: boolean, scarf: boolean, speedStage: number) {
  let tieEffort: number | null = null
  let passEffort: number | null = null

  for (let points = 0; points <= CHAMPIONS_EFFORT_PER_STAT_CAP; points += 1) {
    const speed = opponentScenarioSpeed(row, points, boosted, scarf, speedStage)
    if (tieEffort === null && speed === mySpeed) tieEffort = points
    if (passEffort === null && speed > mySpeed) passEffort = points
    if (tieEffort !== null && passEffort !== null) break
  }

  return { tieEffort, passEffort }
}

const DOUBLE_SPEED_ABILITY_SLUGS = ['swift-swim', 'sand-rush', 'chlorophyll', 'slush-rush', 'surge-surfer', 'unburden'] as const

const MY_SPEED_ABILITY_MARKERS: Record<string, { type: 'stage' | 'multiplier', value: number }> = {
  'weak-armor': { type: 'stage', value: 2 },
  'speed-boost': { type: 'stage', value: 1 },
  'motor-drive': { type: 'stage', value: 1 },
  'quick-feet': { type: 'multiplier', value: 1.5 },
  'swift-swim': { type: 'multiplier', value: 2 },
  'sand-rush': { type: 'multiplier', value: 2 },
  'chlorophyll': { type: 'multiplier', value: 2 },
  'slush-rush': { type: 'multiplier', value: 2 },
  'surge-surfer': { type: 'multiplier', value: 2 },
  'unburden': { type: 'multiplier', value: 2 },
}

function isSpeedAbilityConditionActive(slug: string, weather: DamageWeather, terrain: DamageTerrain) {
  if (slug === 'swift-swim') return weather === 'rain'
  if (slug === 'sand-rush') return weather === 'sand'
  if (slug === 'chlorophyll') return weather === 'sun'
  if (slug === 'slush-rush') return weather === 'snow'
  if (slug === 'surge-surfer') return terrain === 'electric'
  return true
}

function mySpeedAbilityMarker(row: Row, member: PartyMember, language: SiteLanguage, weather: DamageWeather, terrain: DamageTerrain) {
  const sanitizedAbility = sanitizeAbilityForKey(row.key, member.ability, true)
  const ability = resolveSelectedAbility(row, sanitizedAbility, language)
  if (!ability) return null
  const effect = MY_SPEED_ABILITY_MARKERS[ability.slug]
  if (!effect) return null
  if (ability.slug === 'unburden' && isChoiceScarfItem(member.item)) return null
  if (effect.type === 'multiplier' && !isSpeedAbilityConditionActive(ability.slug, weather, terrain)) return null
  const baseSpeed = actualStat(row.speed, member.evs.speed, natureMultiplier(member.config.nature, 'speed'))
  const totalStage = effect.type === 'stage' ? member.config.speedStage + effect.value : member.config.speedStage
  const speed = applySpeedModifiers(applySpeedStage(baseSpeed, totalStage), { scarf: isChoiceScarfItem(member.item), abilityMultiplier: effect.type === 'multiplier' ? effect.value as 1.5 | 2 : 1 })
  return {
    label: ability.label,
    speed,
  }
}

function speedAbilityCandidate(row: Row, language: SiteLanguage) {
  const idx = row.abilities.findIndex((ability) => DOUBLE_SPEED_ABILITY_SLUGS.includes(ability as typeof DOUBLE_SPEED_ABILITY_SLUGS[number]))
  if (idx < 0) return null
  const slug = row.abilities[idx]
  const koLabel = row.abilities_ko[idx] ?? titleCaseSlug(slug)
  const canonical = getSpeedAbility(slug)
  const label = language === 'en' ? canonical?.labelEn ?? titleCaseSlug(slug) : language === 'ja' ? canonical?.labelJa ?? titleCaseSlug(slug) : koLabel
  return { slug, label }
}

function mySpeedNeeds(row: Row, config: MemberConfig, item: string, targetSpeed: number) {
  let tieEffort: number | null = null
  let passEffort: number | null = null

  for (let points = 0; points <= CHAMPIONS_EFFORT_PER_STAT_CAP; points += 1) {
    let speed = actualStat(row.speed, points, natureMultiplier(config.nature, 'speed'))
    speed = applySpeedStage(speed, config.speedStage)
    if (isChoiceScarfItem(item)) speed = Math.floor(speed * 1.5)
    if (tieEffort === null && speed === targetSpeed) tieEffort = points
    if (passEffort === null && speed > targetSpeed) passEffort = points
    if (tieEffort !== null && passEffort !== null) break
  }

  return { tieEffort, passEffort }
}


function opponentEffortValues(entry: Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv'>): EffortValues {
  return {
    hp: entry.hpEv,
    attack: 0,
    defense: entry.defenseEv,
    spAttack: 0,
    spDefense: entry.spDefenseEv,
    speed: entry.speedEv,
  }
}

function opponentPatchFromEffortValues(evs: EffortValues): Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv'> {
  return {
    hpEv: evs.hp,
    defenseEv: evs.defense,
    spDefenseEv: evs.spDefense,
    speedEv: evs.speed,
  }
}

function opponentStatValue(row: Row, entry: Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv' | 'natureBoost' | 'defenseNature' | 'spDefenseNature'>, field: keyof EffortValues) {
  switch (field) {
    case 'hp':
      return actualStat(row.hp, entry.hpEv, 1, true)
    case 'attack':
      return actualStat(row.attack, 0, 1)
    case 'defense':
      return actualStat(row.defense, entry.defenseEv, entry.defenseNature)
    case 'spAttack':
      return actualStat(row.spAttack, 0, 1)
    case 'spDefense':
      return actualStat(row.spDefense, entry.spDefenseEv, entry.spDefenseNature)
    case 'speed':
      return actualStat(row.speed, entry.speedEv, entry.natureBoost ? natureMultiplier('jolly', 'speed') : 1)
  }
}

function findMagicNumberCandidate(row: Row, member: PartyMember) {
  const boosted = boostedStatForNature(member.config.nature)
  return magicEffortCandidate(boosted, member.evs, effort => partyStatValue(row, { ...member, evs: { ...member.evs, [boosted!]: effort } }, boosted!))
}

function magicEffortPoints(row: Row, member: PartyMember, stat: EffortStatKey) {
  return magicEffortMarkers(boostedStatForNature(member.config.nature), stat, effort => partyStatValue(row, { ...member, evs: { ...member.evs, [stat]: effort } }, stat))
}

async function fetchPokemonWeightKg(id: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  if (!res.ok) throw new Error(`Failed to load weight for pokemon id ${id}`)
  const data = await res.json() as { weight?: number }
  if (!Number.isFinite(data.weight)) throw new Error(`Missing weight for pokemon id ${id}`)
  return Number(data.weight) / 10
}

function variablePowerHint(moveName: string, lt: (key: string) => string, options?: { targetWeightKnown?: boolean, resolvedPower?: number | null, totalPower?: number | null }) {
  if (CONDITIONAL_MOVE_POWER_RULES[moveName]) return lt('특정 조건에 따라 위력이 자동 반영됨')
  switch (moveName) {
    case '로우킥':
    case '안다리걸기':
    case '안다리 걸기':
    case '풀묶기':
      return typeof options?.resolvedPower === 'number'
        ? `${lt('위력')} ${options.resolvedPower}`
        : lt('상대 무게에 따라 위력이 자동 반영됨')
    case '스케일샷':
    case '트리플악셀':
      return typeof options?.totalPower === 'number'
        ? `${lt('위력')} ${options.totalPower}`
        : lt('대미지 계산 불가')
    default:
      return lt('대미지 계산 불가')
  }
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

function togglePicked<T extends { key: string; picked: boolean }>(list: T[], idx: number, maxPicks = 3) {
  const next = [...list]
  const current = next[idx]
  if (!current || !current.key) return list
  const pickedCount = next.filter((item) => item.picked).length
  if (!current.picked && pickedCount >= maxPicks) return list
  next[idx] = { ...current, picked: !current.picked }
  return next
}

function formatBattleIndex(value: number, language: SiteLanguage) {
  const locale = language === 'ja' ? 'ja-JP' : language === 'en' ? 'en-US' : 'ko-KR'
  return Math.round(value).toLocaleString(locale)
}

function durabilityIndices(stats: BattleStatBlock) {
  return {
    physical: stats.hp * stats.defense,
    special: stats.hp * stats.spDefense,
  }
}

function decisionPowerIndex(stats: BattleStatBlock, moveMeta: MoveMeta, stab: number, modifiers: DamageCalcModifiers) {
  if (moveMeta.category !== 'physical' && moveMeta.category !== 'special') return null
  const attackStat = moveMeta.usesDefenseAsAttack
    ? stats.defense
    : moveMeta.category === 'physical'
      ? stats.attack
      : stats.spAttack
  const totalPower = moveMeta.hitPowers?.length
    ? moveMeta.hitPowers.reduce((sum, power) => sum + power, 0)
    : (moveMeta.power ?? 0) * Math.max(1, moveMeta.hits ?? 1)
  if (!totalPower) return null
  return Math.round(
    attackStat
    * totalPower
    * stab
    * (modifiers.attackMultiplier ?? 1)
    * (modifiers.powerMultiplier ?? 1)
    * chainMods(modifiers.fixedBpMods ?? []) / DAMAGE_MOD_SCALE
    * (modifiers.finalMultiplier ?? 1)
    * chainMods(modifiers.fixedFinalMods ?? [], 41, 131072) / DAMAGE_MOD_SCALE
    / Math.max(0.01, modifiers.defenseMultiplier ?? 1)
  )
}

function battleIndexTooltipData(kind: 'power' | 'physical-bulk' | 'special-bulk', language: SiteLanguage, rows: HoverTooltipCard['rows']): HoverTooltipCard {
  const labels = language === 'ja'
    ? {
        powerTitle: '火力指数',
        physicalTitle: '物理耐久指数',
        specialTitle: '特殊耐久指数',
        powerDescription: '相手のタイプ相性と耐久を除き、実数値・技威力・一致補正・常時発動する特性と持ち物を反映した比較指数です。',
        bulkDescription: '現在のサンプル実数値による HP × 防御（特防）の比較指数です。',
      }
    : language === 'en'
      ? {
          powerTitle: 'Power index',
          physicalTitle: 'Physical bulk index',
          specialTitle: 'Special bulk index',
          powerDescription: 'A comparison index using the actual stat, move power, STAB, and always-on ability/item modifiers; target typing and bulk are excluded.',
          bulkDescription: 'A comparison index using the current sample stats: HP × Defense (or Sp. Def).',
        }
      : {
          powerTitle: '결정력',
          physicalTitle: '물리 내구력',
          specialTitle: '특수 내구력',
          powerDescription: '상대 상성과 내구를 제외하고 실수치·기술 위력·자속·상시 특성/도구 보정을 반영한 비교 지수입니다.',
          bulkDescription: '현재 샘플 실수치의 HP × 방어(특수방어) 비교 지수입니다.',
        }
  return {
    kind: 'index',
    title: kind === 'power' ? labels.powerTitle : kind === 'physical-bulk' ? labels.physicalTitle : labels.specialTitle,
    rows,
    description: kind === 'power' ? labels.powerDescription : labels.bulkDescription,
  }
}

const SPECIES_SEARCH_INDEX = rows.map((row) => ({ row, candidates: speciesSearchCandidates(row) }))

function filterDexItemOptions(query: string, language: SiteLanguage) {
  const stones = [...new Set(rows.map(row => requiredMegaStone(row.key)).filter((item): item is string => Boolean(item)))]
  const items = [...CHAMPIONS_ITEM_OPTIONS, ...stones]
  const normalizeItemSearch = (value: string) => normalizeSearchText(value.normalize('NFKC'))
  const needle = normalizeItemSearch(query)
  const matches = !needle ? items : items.filter(item => {
    const entry = itemDescriptionFor(item)
    return [item, displayItemLabel(item, language), entry?.nameKo, entry?.nameEn, entry?.nameJa]
      .some(name => name && normalizeItemSearch(name).includes(needle))
  })
  return byDisplayName(matches, item => {
    const entry = itemDescriptionFor(item)
    return (language === 'ko' ? entry?.nameKo : language === 'en' ? entry?.nameEn : entry?.nameJa) || displayItemLabel(item, language)
  }, item => item, language)
}


function filterAbilityOptions(options: string[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return byDisplayName(options, ability => ability, ability => ability)
  return options
    .map((ability) => {
      const lower = ability.toLowerCase()
      if (lower === normalized) return { ability, score: 0 }
      if (lower.startsWith(normalized)) return { ability, score: 1 }
      if (lower.includes(normalized)) return { ability, score: 2 }
      if (matchesLooseQuery(lower, normalized)) return { ability, score: 3 }
      return null
    })
    .filter((entry): entry is { ability: string; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.ability.localeCompare(b.ability, 'ko'))
    .map((entry) => entry.ability)
}

function resolveAbilityInput(options: string[], raw: string) {
  return filterAbilityOptions(options, raw)[0] ?? options[0] ?? ''
}

function filterNatureOptions(query: string, language: SiteLanguage = 'ko') {
  const normalized = query.trim().toLowerCase()
  const options = NATURES.map((nature) => ({
    id: nature.id,
    shortLabel: natureChipLabel(nature.id, language),
    fullLabel: natureLabel(nature.id, language),
  }))
  if (!normalized) return options
  return options
    .map((option) => {
      const candidates = [option.id, option.shortLabel, option.fullLabel].map((entry) => entry.toLowerCase())
      const score = candidates.reduce<number>((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { ...option, score } : null
    })
    .filter((entry): entry is { id: NatureId; shortLabel: string; fullLabel: string; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.shortLabel.localeCompare(b.shortLabel, 'ko'))
}

function resolveNatureInput(raw: string, language: SiteLanguage = 'ko') {
  return filterNatureOptions(raw, language)[0]?.id ?? 'hardy'
}

function displayTypeName(type: string | null | undefined, language: SiteLanguage) {
  if (!type) return translateText(language, '없음')
  if (language === 'en') return titleCaseSlug(type)
  if (language === 'ja') return getJaTypes([type])[0] ?? titleCaseSlug(type)
  return TYPE_KO_BY_KEY[type] ?? type
}

function itemEffectSummaryFor(rawItem: string, language: SiteLanguage) {
  const canonicalItem = canonicalChampionsItemName(rawItem)
  const summary = ITEM_EFFECT_SUMMARIES[canonicalItem]
  if (!summary) return ''
  return summary[language] ?? summary.ko ?? summary.en ?? ''
}

function itemTooltipData(itemName: string, language: SiteLanguage): HoverTooltipCard | null {
  const canonicalItem = canonicalChampionsItemName(itemName)
  const info = resolveItemInfo(canonicalItem)
  const knownItem = CHAMPIONS_ITEM_OPTIONS.includes(canonicalItem as ChampionsItem)
  if (!info && !knownItem) return null
  const title = info
    ? language === 'ko' ? info.entry.nameKo : language === 'ja' ? info.entry.nameJa : info.entry.nameEn
    : localizedChampionsItemLabel(canonicalItem, language)
  const subtitle = info
    ? language === 'ko' ? info.entry.nameEn : info.entry.nameKo
    : language === 'ko' ? localizedChampionsItemLabel(canonicalItem, 'en') : localizedChampionsItemLabel(canonicalItem, 'ko')
  const description = info ? localizedDexText(info.entry, language) : null
  const effectSummary = itemEffectSummaryFor(canonicalItem, language)
  return {
    kind: 'item',
    title,
    subtitle,
    rows: effectSummary ? [{ label: translateText(language, '효과'), value: effectSummary }] : [],
    description: description?.detail || description?.summary || '',
  }
}

function moveSearchCandidates(name: string) {
  const candidates = moveNameCandidates(name)
  return Array.from(new Set(candidates.flatMap((entry) => [entry, normalizeSearchText(entry)])))
}

function dexMoveIndex() {
  const grouped = new Map<string, string[]>()
  for (const raw of new Set([...getDexGameMoveNames(), ...Object.keys(MOVE_META_BY_NAME)])) {
    const canonical = getMoveMetadata(raw)?.canonicalName ?? raw
    grouped.set(canonical, [...(grouped.get(canonical) ?? []), raw])
  }
  return [...grouped].map(([name, aliases]) => ({
    key: name, name, meta: getMoveMetadata(name)!.meta,
    candidates: Array.from(new Set(aliases.flatMap(moveSearchCandidates))),
  }))
}

function filterDexMoveOptions(query: string, options?: { allowLoose?: boolean }) {
  const allowLoose = options?.allowLoose ?? true
  const index = dexMoveIndex()
  if (!query.trim()) return byDisplayName(index.map(({ candidates: _candidates, ...entry }) => entry), entry => entry.name, entry => entry.key)
  const ranked = searchMoves(index, query, { allowLoose, names: entry => ({ ...moveDescriptionFor(entry.name), aliases: entry.candidates }) })
  return ranked.map(({ candidates: _candidates, ...entry }) => entry)
}

function abilitySearchCandidates(abilityKey: string, abilityKo: string) {
  const row = rows.find(entry => entry.abilities.includes(abilityKey))
  return row ? abilityAliases(row, abilityKey, abilityDescriptionFor).flatMap(alias => [alias, normalizeSearchText(alias)]) : [abilityKey, abilityKo]
}

function filterDexAbilityOptions(query: string, options?: { allowLoose?: boolean }) {
  const allowLoose = options?.allowLoose ?? true
  const normalized = normalizeSearchText(query.trim())
  const entries = [...abilityIndex(rows, abilityDescriptionFor).byKey.values()].map((entry) => ({ ...entry, pokemonKeys: [...entry.pokemonKeys].sort((a, b) => a.localeCompare(b, 'ko')) }))
  if (!normalized) return byDisplayName(entries, entry => entry.koLabel, entry => entry.key)
  return entries
    .map((entry) => {
      const score = abilitySearchCandidates(entry.key, entry.koLabel).reduce((best, candidate) => {
        if (candidate === normalized) return Math.min(best, 0)
        if (candidate.startsWith(normalized)) return Math.min(best, 1)
        if (candidate.includes(normalized)) return Math.min(best, 2)
        if (allowLoose && matchesLooseQuery(candidate, normalized)) return Math.min(best, 3)
        return best
      }, Number.POSITIVE_INFINITY)
      return Number.isFinite(score) ? { ...entry, score } : null
    })
    .filter((entry): entry is { key: string; koLabel: string; pokemonKeys: string[]; score: number } => Boolean(entry))
    .sort((a, b) => a.score - b.score || a.koLabel.localeCompare(b.koLabel, 'ko'))
}

const ABILITY_INDEX = abilityIndex(rows)

function getOcrAbilityIndexSync() {
  if (ocrAbilityIndexCache) return ocrAbilityIndexCache
  const bundle = getDexDescriptionsSync()
  if (!bundle) return []
  ocrAbilityIndexCache = Object.entries(bundle.abilities).map(([abilityKey, description]) => {
    const fallback = ABILITY_INDEX.byKey.get(abilityKey)
    return {
      abilityKey,
      koLabel: fallback?.koLabel ?? description.nameKo,
      candidates: Array.from(new Set([
        abilityKey,
        fallback?.koLabel,
        description.nameKo,
        description.nameEn,
        description.nameJa,
      ].filter(Boolean).flatMap((entry) => [String(entry), normalizeSearchText(String(entry))]))),
    }
  })
  return ocrAbilityIndexCache
}

function resolveAbilityInfo(rawAbility: string, row?: Row | null) {
  const normalized = normalizeSearchText(rawAbility)
  const index = abilityIndex(rows, abilityDescriptionFor)
  if (row) {
    const resolved = resolveFormAbility(row, rawAbility, abilityDescriptionFor, rows)
    return resolved.status === 'allowed' ? index.byKey.get(resolved.slug!) ?? null : null
  }
  return index.byNormalized.get(normalized) ?? null
}

function comparisonAbility(key: string, raw: string): string {
  return classifyAbilityForKey(key, raw).slug ?? raw // Preserve unknown source evidence.
}

function moveTooltipData(name: string, language: SiteLanguage): HoverTooltipCard | null {
  const meta = lookupMoveMeta(name)
  if (!meta) return null
  const identity = getMoveMetadata(name)
  const described = moveDescriptionFor(name)
  const description = localizedDexText(!identity?.id || described?.moveId === identity.id ? described : null, language)
  return {
    kind: 'move',
    title: name,
    accentType: meta.type,
    rows: [
      { label: translateText(language, '타입'), value: displayTypeName(meta.type, language) },
      { label: translateText(language, '분류'), value: displayMoveCategoryName(meta.category, language) },
      { label: translateText(language, '위력'), value: meta.power != null ? String(resolvedMovePower(meta)) : '-' },
      { label: translateText(language, '명중'), value: meta.accuracy != null ? `${meta.accuracy}%` : '-' },
      ...(typeof meta.priority === 'number' && meta.priority !== 0 ? [{ label: translateText(language, '우선도'), value: String(meta.priority) }] : []),
    ],
    description: description?.detail || description?.summary || '',
  }
}

function abilityTooltipData(name: string, language: SiteLanguage, row?: Row | null): HoverTooltipCard | null {
  const info = resolveAbilityInfo(name, row)
  if (!info) return null
  const localized = abilityDisplayName(info.key, info.koLabel, language)
  const description = localizedDexText(abilityDescriptionFor(info.key), language)
  const previewNames = info.pokemonKeys.slice(0, 5).map((key) => {
    const pokemonRow = indexByKey.get(key)
    return pokemonRow ? displayName(pokemonRow, language) : key
  })
  return {
    kind: 'ability',
    title: localized,
    subtitle: language === 'ko' ? info.key : info.koLabel,
    rows: [],
    description: description?.detail || description?.summary || '',
    chips: previewNames,
  }
}

function resolveSpeciesKey(raw: string, options?: { includeMega?: boolean }) {
  const normalized = normalizeSearchText(raw.trim())
  if (!normalized) return null
  return filterSpeciesOptions(normalized, options)[0]?.key ?? null
}

function defaultAbilityLabelForKey(key: string, abilityKey: string) {
  const row = indexByKey.get(key)
  if (!row) return defaultAbilityForKey(key)
  const idx = row.abilities.indexOf(abilityKey)
  return row.abilities_ko[idx] ?? defaultAbilityForKey(key)
}

function cropRect(imageWidth: number, imageHeight: number, rect: CropRect) {
  const x = Math.max(0, Math.min(imageWidth, rect.x))
  const y = Math.max(0, Math.min(imageHeight, rect.y))
  const width = Math.max(1, Math.min(imageWidth - x, rect.width))
  const height = Math.max(1, Math.min(imageHeight - y, rect.height))
  return { x, y, width, height }
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

async function loadImageElement(file: File) {
  const url = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        resolve()
      }
      image.onerror = () => reject(new Error(`image load failed: ${file.name}`))
      image.src = url
      Object.assign(file, { __openclawImageEl: image })
    })
    return (file as File & { __openclawImageEl?: HTMLImageElement }).__openclawImageEl!
  } finally {
    URL.revokeObjectURL(url)
  }
}

function renderImageRegion(image: HTMLImageElement, rect: CropRect, targetWidth = rect.width, targetHeight = rect.height) {
  const safeRect = cropRect(image.naturalWidth || image.width, image.naturalHeight || image.height, rect)
  const canvas = createCanvas(targetWidth, targetHeight)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, safeRect.x, safeRect.y, safeRect.width, safeRect.height, 0, 0, canvas.width, canvas.height)
  return canvas
}

function computeCanvasDHash(canvas: HTMLCanvasElement) {
  const scaled = createCanvas(16, 16)
  const ctx = scaled.getContext('2d', { willReadFrequently: true })
  if (!ctx) return ''
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 16, 16)
  ctx.drawImage(canvas, 0, 0, 16, 16)
  const { data } = ctx.getImageData(0, 0, 16, 16)
  const grayscale: number[] = []
  for (let idx = 0; idx < data.length; idx += 4) {
    grayscale.push(Math.round((data[idx] * 0.299) + (data[idx + 1] * 0.587) + (data[idx + 2] * 0.114)))
  }
  const bits: string[] = []
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 15; x += 1) {
      const left = grayscale[(y * 16) + x]
      const right = grayscale[(y * 16) + x + 1]
      bits.push(left > right ? '1' : '0')
    }
  }
  let hash = ''
  for (let idx = 0; idx < bits.length; idx += 4) {
    hash += Number.parseInt(bits.slice(idx, idx + 4).join(''), 2).toString(16)
  }
  return hash
}

function hammingDistanceHex(left: string, right: string) {
  if (!left || !right || left.length !== right.length) return Number.POSITIVE_INFINITY
  let distance = 0
  for (let idx = 0; idx < left.length; idx += 1) {
    const xor = Number.parseInt(left[idx], 16) ^ Number.parseInt(right[idx], 16)
    distance += xor.toString(2).replace(/0/g, '').length
  }
  return distance
}

async function matchSpeciesBySpriteCanvas(canvas: HTMLCanvasElement) {
  const hash = computeCanvasDHash(canvas)
  const spriteHashIndex = await loadSpriteHashIndex()
  const best = spriteHashIndex.reduce<{ key: string; distance: number } | null>((currentBest, entry) => {
    const distance = hammingDistanceHex(hash, entry.hash)
    if (!Number.isFinite(distance)) return currentBest
    if (!currentBest || distance < currentBest.distance) return { key: entry.key, distance }
    return currentBest
  }, null)
  return best
}

function estimatePartyRowRects(imageWidth: number, imageHeight: number) {
  const top = imageHeight * 0.06
  const usableHeight = imageHeight * 0.88
  const rowHeight = usableHeight / 6
  return Array.from({ length: 6 }, (_, idx) => ({
    x: imageWidth * 0.02,
    y: top + (rowHeight * idx),
    width: imageWidth * 0.96,
    height: rowHeight,
  }))
}

function estimateSpriteRects(rowRect: CropRect) {
  return [
    { x: rowRect.x + (rowRect.width * 0.02), y: rowRect.y + (rowRect.height * 0.08), width: rowRect.width * 0.24, height: rowRect.height * 0.82 },
    { x: rowRect.x + (rowRect.width * 0.05), y: rowRect.y + (rowRect.height * 0.06), width: rowRect.width * 0.26, height: rowRect.height * 0.84 },
    { x: rowRect.x, y: rowRect.y + (rowRect.height * 0.04), width: rowRect.width * 0.3, height: rowRect.height * 0.88 },
  ]
}

function parseOcrNature(lines: string[]) {
  for (const line of lines) {
    const normalized = normalizeSearchText(line)
    const matched = OCR_NATURE_INDEX.find((entry) => entry.candidates.some((candidate) => scoreOcrCandidate(normalized, candidate) <= 1))
    if (matched) return matched.id
  }
  return null
}

function parseOcrEffortValues(lines: string[]) {
  const next = { ...defaultEvs }
  for (const line of lines) {
    const normalized = normalizeSearchText(line)
    for (const stat of Object.keys(OCR_EFFORT_PATTERNS) as OcrStatKey[]) {
      const patterns = OCR_EFFORT_PATTERNS[stat]
      for (const pattern of patterns) {
        const match = normalized.match(pattern)
        if (!match) continue
        next[stat] = Math.max(0, Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, Math.trunc(Number(match[1]) || 0)))
        break
      }
    }
  }
  return next
}

function cleanOcrLine(line: string) {
  return line
    .replace(/[•·●▪■□◆◇○◎]/g, ' ')
    .replace(/[|｜]/g, 'I')
    .replace(/[“”"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreOcrCandidate(source: string, candidate: string) {
  if (!source || !candidate) return Number.POSITIVE_INFINITY
  if (source === candidate) return 0
  if (source.includes(candidate)) return source.length - candidate.length <= 6 ? 1 : 2
  if (candidate.includes(source)) return 2
  if (matchesLooseQuery(source, candidate) || matchesLooseQuery(candidate, source)) return 3
  return Number.POSITIVE_INFINITY
}

function findBestOcrSpeciesMatch(line: string) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  const best = SPECIES_SEARCH_INDEX.reduce<{ key: string; score: number } | null>((currentBest, entry) => {
    const score = entry.candidates.reduce((bestScore, candidate) => Math.min(bestScore, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return currentBest
    if (!currentBest || score < currentBest.score) return { key: entry.row.key, score }
    return currentBest
  }, null)
  return best
}

function findBestOcrMoveMatch(line: string) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  const best = getOcrMoveIndexSync().reduce<{ nameKo: string; score: number } | null>((currentBest, entry) => {
    const score = entry.candidates.reduce((bestScore, candidate) => Math.min(bestScore, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return currentBest
    if (!currentBest || score < currentBest.score) return { nameKo: entry.nameKo, score }
    return currentBest
  }, null)
  return best
}

function findBestOcrAbilityMatch(line: string, key: string) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  const row = indexByKey.get(key)
  if (!normalized || !row) return null
  const best = getOcrAbilityIndexSync().reduce<{ abilityKey: string; koLabel: string; score: number } | null>((currentBest, entry) => {
    if (!row.abilities.includes(entry.abilityKey)) return currentBest
    const score = entry.candidates.reduce((bestScore, candidate) => Math.min(bestScore, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return currentBest
    if (!currentBest || score < currentBest.score) return { abilityKey: entry.abilityKey, koLabel: entry.koLabel, score }
    return currentBest
  }, null)
  return best
}

function findBestOcrItemMatch(line: string) {
  const normalized = normalizeSearchText(cleanOcrLine(line))
  if (!normalized) return null
  const best = getOcrItemIndexSync().reduce<{ itemKey: string; score: number } | null>((currentBest, entry) => {
    const score = entry.candidates.reduce((bestScore, candidate) => Math.min(bestScore, scoreOcrCandidate(normalized, candidate)), Number.POSITIVE_INFINITY)
    if (!Number.isFinite(score)) return currentBest
    if (!currentBest || score < currentBest.score) return { itemKey: entry.itemKey, score }
    return currentBest
  }, null)
  return best
}

function parseOcrImportedMember(lines: string[], speciesOverride?: string | null) {
  const normalizedLines = lines.map(cleanOcrLine).filter(Boolean)
  const speciesKey = speciesOverride ?? normalizedLines.map((line) => findBestOcrSpeciesMatch(line)).find((entry) => entry && entry.score <= 2)?.key ?? null
  if (!speciesKey) return null
  const row = indexByKey.get(speciesKey)
  if (!row) return null
  const lockedMoves: string[] = []
  let item = ''
  let ability = defaultAbilityForKey(speciesKey)
  for (const line of normalizedLines) {
    const itemMatch = findBestOcrItemMatch(line)
    if (!item && itemMatch && itemMatch.score <= 2) item = itemMatch.itemKey
    const abilityMatch = findBestOcrAbilityMatch(line, speciesKey)
    if (abilityMatch && abilityMatch.score <= 2) ability = defaultAbilityLabelForKey(speciesKey, abilityMatch.abilityKey)
    const moveMatch = findBestOcrMoveMatch(line)
    if (moveMatch && moveMatch.score <= 2 && !lockedMoves.includes(moveMatch.nameKo)) lockedMoves.push(moveMatch.nameKo)
  }
  const parsedNature = parseOcrNature(normalizedLines)
  const parsedEvs = parseOcrEffortValues(normalizedLines)
  const member: PartyMember = {
    key: speciesKey,
    config: { nature: parsedNature ?? defaultNatureForKey(speciesKey), scarf: false, speedStage: 0 },
    picked: false,
    evs: parsedEvs,
    tuning: defaultPartyTuning(),
    item,
    ability,
  }
  return { member, lockedMoves: lockedMoves.slice(0, 4), rawLines: normalizedLines }
}

function parseOcrImportedParty(text: string): OcrImportedPartyMember[] {
  const lines = text.split(/\r?\n/).map(cleanOcrLine).filter(Boolean)
  if (!lines.length) return []
  const anchors = lines
    .map((line, idx) => {
      const species = findBestOcrSpeciesMatch(line)
      return species && species.score <= 2 ? { idx, key: species.key } : null
    })
    .filter((entry): entry is { idx: number; key: string } => entry !== null)
    .filter((entry, idx, list) => idx === 0 || entry.idx !== list[idx - 1].idx)
  if (!anchors.length) return []
  const members = anchors.slice(0, 6).map((anchor, anchorIdx) => {
    const nextIdx = anchors[anchorIdx + 1]?.idx ?? lines.length
    return parseOcrImportedMember(lines.slice(anchor.idx, nextIdx), anchor.key)
  })
  return members.filter((entry): entry is OcrImportedPartyMember => entry !== null)
}

function parseOcrImportedPartyDocuments(texts: string[]) {
  const orderedKeys: string[] = []
  const linesByKey = new Map<string, string[]>()
  for (const text of texts) {
    const lines = text.split(/\r?\n/).map(cleanOcrLine).filter(Boolean)
    if (!lines.length) continue
    const anchors = lines
      .map((line, idx) => {
        const species = findBestOcrSpeciesMatch(line)
        return species && species.score <= 2 ? { idx, key: species.key } : null
      })
      .filter((entry): entry is { idx: number; key: string } => entry !== null)
      .filter((entry, idx, list) => idx === 0 || entry.idx !== list[idx - 1].idx)
    if (!anchors.length) continue
    anchors.forEach((anchor, anchorIdx) => {
      const nextIdx = anchors[anchorIdx + 1]?.idx ?? lines.length
      const segment = lines.slice(Math.max(0, anchor.idx - 1), nextIdx)
      if (!orderedKeys.includes(anchor.key)) orderedKeys.push(anchor.key)
      linesByKey.set(anchor.key, [...(linesByKey.get(anchor.key) ?? []), ...segment])
    })
  }
  const imported = orderedKeys.slice(0, 6).map((key) => parseOcrImportedMember(linesByKey.get(key) ?? [], key))
  return imported.filter((entry): entry is OcrImportedPartyMember => entry !== null)
}

async function inferImportedPartyFromSpriteGuidedImage(file: File, recognize: (image: HTMLCanvasElement, logger?: (message: { status: string; progress?: number }) => void) => Promise<string>, status?: (message: string) => void) {
  const image = await loadImageElement(file)
  const rowRects = estimatePartyRowRects(image.naturalWidth || image.width, image.naturalHeight || image.height)
  const imported: OcrImportedPartyMember[] = []
  for (const [idx, rowRect] of rowRects.entries()) {
    const rowCanvas = renderImageRegion(image, rowRect, 1280, 200)
    const spriteMatches = (await Promise.all(
      estimateSpriteRects(rowRect)
        .map((rect) => matchSpeciesBySpriteCanvas(renderImageRegion(image, rect, 96, 96)))
    ))
      .filter((entry): entry is { key: string; distance: number } => entry !== null)
      .sort((left, right) => left.distance - right.distance)
    const bestSpriteMatch = spriteMatches[0] ?? null
    status?.(`${file.name} · ${idx + 1}/6 ${translateText('ko', 'OCR 추출 중...')}`)
    const text = await recognize(rowCanvas)
    const fallbackMember = parseOcrImportedMember(text.split(/\r?\n/), bestSpriteMatch && bestSpriteMatch.distance <= MAX_SPRITE_HASH_DISTANCE ? bestSpriteMatch.key : null)
    if (fallbackMember?.member.key) imported.push(fallbackMember)
  }
  return imported
}

function displayTypes(row: Row, language: SiteLanguage) {
  if (language === 'en') return row.types
  if (language === 'ja') return getJaTypes(row.types)
  return row.types_ko
}


function abilitiesForKey(key: string, language: SiteLanguage) {
  const row = indexByKey.get(key)
  if (!row) return [] as string[]
  return displayAbilities(row, language)
}

function itemOptionsForKey(key: string) {
  const fixed = megaStoneForKey(key)
  if (fixed) return [fixed]
  return CHAMPIONS_ITEM_OPTIONS.filter((item) => isAllowedChampionsItem(key, item))
}

function defaultAbilityForKey(key: string) {
  return abilityForSpeciesSelection(indexByKey.get(key), '', key, '')
}


function sameItemField(a: ItemFieldTarget, scope: 'party' | 'sample' | 'opponent', idx: number) {
  return a?.scope === scope && a?.idx === idx
}

function highlightedAutocompleteIndex(state: AutocompleteHighlight, id: string) {
  return state?.id === id ? state.index : -1
}

function nextAutocompleteIndex(current: number, length: number, direction: -1 | 1) {
  if (length <= 0) return -1
  if (current < 0) return direction > 0 ? 0 : length - 1
  return (current + direction + length) % length
}

function menuLabelForTab(tab: MainTab, language: SiteLanguage = 'ko') {
  switch (tab) {
    case 'party': return translateText(language, '내 파티 관리')
    case 'pick': return translateText(language, '상대 엔트리')
    case 'speed': return translateText(language, '스피드 계산')
    case 'power': return translateText(language, '대미지 계산')
  }
}

function menuLabelForSection(section: MainSection, activeTab: MainTab, language: SiteLanguage = 'ko') {
  if (section === 'home') return translateText(language, '홈')
  if (section === 'party') return translateText(language, '내 파티 관리')
  if (section === 'sample') return translateText(language, '포켓몬 샘플 깎기')
  if (section === 'speedLine') return translateText(language, '실능 스피드라인')
  if (section === 'quickDamage') return translateText(language, '간단 대미지')
  if (section === 'dex') return translateText(language, '도감')
  if (section === 'double') return translateText(language, '더블배틀 메뉴')
  return menuLabelForTab(activeTab, language)
}

function TypeBadgeImage({ type }: { type: string }) {
  const label = getTypeBadgeLabel(type)
  return <img src={getTypeBadgeSrc(type)} alt={label} className="type-badge-image" title={label} />
}



function PartyContextBar({ language, label, activeId, records, selectedMy, selectedOpp, mode, onSelect }: {
  language: SiteLanguage; label: string; activeId: string; records: SavedPartyPreset[];
  selectedMy: number; selectedOpp: number; mode: 'party' | 'single'; onSelect: (id: string) => void
}) {
  const lt = (text: string) => translateText(language, text)
  const query = new URLSearchParams({ my: String(selectedMy), opp: String(selectedOpp) })
  const href = mode === 'party' ? `#/single?tab=party&${query}` : `#/party?${query}&edit=${selectedMy}`
  return <section className="party-context-bar" aria-label={lt('사용 중인 파티')}>
    <label className="party-context-selector"><span>{lt('사용 중인 파티')} · <strong>{label}</strong></span>
      <select aria-label={lt('사용 중인 파티')} value={activeId} onChange={event => onSelect(event.target.value)}>
        {records.map(record => <option key={record.id} value={record.id}>{record.label}</option>)}
      </select>
    </label>
    <a className="action-button party-context-link" href={href}>{lt(mode === 'party' ? '이 파티로 대면 보기' : '선택 내 슬롯 파티 편집')}</a>
  </section>
}

export default function App() {
  const persistedRead = React.useMemo(() => loadPersistedState(), [])
  const persisted = persistedRead.value
  const initialWorkspace = React.useMemo(() => initializeWorkspace({
    ...(Array.isArray(persisted?.party) ? { party: sanitizeParty(persisted.party) } : {}),
    ...(persisted?.confirmedMovesByKey !== undefined ? { confirmedMovesByKey: sanitizeConfirmedMovesByKey(persisted.confirmedMovesByKey) } : {}),
    savedPartyPresets: sanitizeSavedPartyPresets(persisted?.savedPartyPresets),
    activePartyPresetId: persisted?.activePartyPresetId,
  }, sanitizeParty(undefined)), [persisted])
  const { workspace, setParty, setConfirmedMovesByKey,
    selectPreset, createPreset, renamePreset, addPreset, deletePreset, resetWorkspace, importWorkspace,
    captureSelection, applyImportedBuild } =
    usePartyWorkspace(initialWorkspace, () => {
      if (persistenceStatus !== 'failed' && persistenceStatus !== 'read-failed') setPersistenceStatus('saving')
    })
  const { party, confirmedMovesByKey, savedPartyPresets, activePartyPresetId } = workspace

  const [persistenceStatus, setPersistenceStatus] = React.useState<'saving' | 'saved' | 'failed' | 'read-failed'>(() => persistedRead.error ? 'read-failed' : 'saving')
  const [allowRecoveryWrite, setAllowRecoveryWrite] = React.useState(!persistedRead.error)
  const [retryPersistence, setRetryPersistence] = React.useState(0)
  const viewState = React.useMemo(() => parseViewStateFromUrl(), [])
  const [selectedMy, setSelectedMy] = React.useState(() => sanitizeSelectedIndex(viewState?.selectedMy ?? persisted?.selectedMy, initialWorkspace.party.length))
  const [siteLanguage, setSiteLanguage] = React.useState<SiteLanguage>('ko')
  const [movePoolByKey, setMovePoolByKey] = React.useState<Record<string, SharedPoolState>>({})
  const initialOpponents = React.useMemo(() => sanitizeOpponents(persisted?.opponents), [persisted])
  const initialSelectedOpp = sanitizeSelectedIndex(viewState?.selectedOpp ?? persisted?.selectedOpp, initialOpponents.length)
  const opponentEntries = useOpponentEntries({ initialOpponents, initialSelectedOpp, emptyOpponents, siteLanguage, resolveSpeciesKey, resolveAbilityInput, movePoolByKey,
    onCloseOpponentItem: idx => setActiveItemField(prev => sameItemField(prev, 'opponent', idx) ? null : prev),
    onDismissOpponentItem: () => setActiveItemField(null),
    onFocusOpponentItem: idx => setActiveItemField({ scope: 'opponent', idx }),
    onCloseOpponentMove: key => setActiveMoveField(prev => prev?.scope === 'opponent' && prev.key === key ? null : prev) })
  const { opponents, selectedOpp, singleDraftIdentity, opponentResetRevision, opponentSearch, opponentItemDrafts, opponentAbilityDrafts, opponentMoveDraft, calcOpponentMoveDraft, opponentMoveNotice, activeOpponentAbilityField, opponentQuickSearch, opponentQuickInputRef, setSelectedOpp, setOpponentSearch, setOpponentItemDrafts, setOpponentAbilityDrafts, setOpponentMoveDraft, setCalcOpponentMoveDraft, setActiveOpponentAbilityField, setOpponentQuickSearch, setSingleDraftIdentity, selectOpponentItemOption, commitOpponentItemInput, commitOpponentAbilityInput, selectOpponentAbilityOption, clearOpponentAbilityInput, clearOpponentItemInput, selectOpponentSpecies, nextOpponentSlotIndex, commitOpponentQuickSearch, resetOpponentsForFreshEntry, registerSingleOpponentSpecies, resetSingleOpponentEntry, clearOpponentSlot, addOpponentRevealedMove, commitOpponentMoveDraft, commitCalcOpponentMoveDraft, removeOpponentRevealedMove, setOpponentField, toggleOpponentPicked, updateDoubleOpponentBulkAt, updateDoubleOpponentEffortAt, nudgeDoubleOpponentEffortAt, importOpponentEntries, saveComparisonOpponent, resetRegisteredOpponents, setOpponentDraftIdentity } = opponentEntries
  const initialDoubleParty = React.useMemo(() => initialWorkspace.party, [initialWorkspace])
  const initialDoubleOpponents = React.useMemo(() => sanitizeOpponents(persisted?.opponents), [persisted])
  const defaultDoubleMyLeft = React.useMemo(() => firstFilledIndex(initialDoubleParty, 0), [initialDoubleParty])
  const defaultDoubleMyRight = React.useMemo(() => initialDoubleParty.findIndex((entry, idx) => idx !== defaultDoubleMyLeft && Boolean(entry.key)) >= 0 ? initialDoubleParty.findIndex((entry, idx) => idx !== defaultDoubleMyLeft && Boolean(entry.key)) : Math.min(defaultDoubleMyLeft + 1, initialDoubleParty.length - 1), [defaultDoubleMyLeft, initialDoubleParty])
  const defaultDoubleOppLeft = React.useMemo(() => firstFilledIndex(initialDoubleOpponents, 0), [initialDoubleOpponents])
  const defaultDoubleOppRight = React.useMemo(() => initialDoubleOpponents.findIndex((entry, idx) => idx !== defaultDoubleOppLeft && Boolean(entry.key)) >= 0 ? initialDoubleOpponents.findIndex((entry, idx) => idx !== defaultDoubleOppLeft && Boolean(entry.key)) : Math.min(defaultDoubleOppLeft + 1, initialDoubleOpponents.length - 1), [defaultDoubleOppLeft, initialDoubleOpponents])
  const [doubleMyLeft, setDoubleMyLeft] = React.useState(() => sanitizeBoardSlotIndex(persisted?.doubleMyLeft, initialDoubleParty, defaultDoubleMyLeft))
  const [doubleMyRight, setDoubleMyRight] = React.useState(() => sanitizeBoardSlotIndex(persisted?.doubleMyRight, initialDoubleParty, defaultDoubleMyRight))
  const [doubleOppLeft, setDoubleOppLeft] = React.useState(() => sanitizeBoardSlotIndex(persisted?.doubleOppLeft, initialDoubleOpponents, defaultDoubleOppLeft))
  const [doubleOppRight, setDoubleOppRight] = React.useState(() => sanitizeBoardSlotIndex(persisted?.doubleOppRight, initialDoubleOpponents, defaultDoubleOppRight))
  const [doubleTrickRoom, setDoubleTrickRoom] = React.useState(() => Boolean(persisted?.doubleTrickRoom))
  const [doubleTailwindMy, setDoubleTailwindMy] = React.useState(() => Boolean(persisted?.doubleTailwindMy))
  const [doubleTailwindOpp, setDoubleTailwindOpp] = React.useState(() => Boolean(persisted?.doubleTailwindOpp))
  const [doubleFriendGuardMy, setDoubleFriendGuardMy] = React.useState(() => Boolean(persisted?.doubleFriendGuardMy))
  const [doubleFriendGuardOpp, setDoubleFriendGuardOpp] = React.useState(() => Boolean(persisted?.doubleFriendGuardOpp))
  const [doubleWideGuardMy, setDoubleWideGuardMy] = React.useState(() => Boolean(persisted?.doubleWideGuardMy))
  const [doubleWideGuardOpp, setDoubleWideGuardOpp] = React.useState(() => Boolean(persisted?.doubleWideGuardOpp))
  const [doubleAttackerSlot, setDoubleAttackerSlot] = React.useState<DoubleBoardSlot>(() => persisted?.doubleAttackerSlot === 'myLeft' || persisted?.doubleAttackerSlot === 'myRight' || persisted?.doubleAttackerSlot === 'oppLeft' || persisted?.doubleAttackerSlot === 'oppRight' ? persisted.doubleAttackerSlot : 'myLeft')
  const [doubleDefenderSlot, setDoubleDefenderSlot] = React.useState<DoubleBoardSlot>(() => persisted?.doubleDefenderSlot === 'myLeft' || persisted?.doubleDefenderSlot === 'myRight' || persisted?.doubleDefenderSlot === 'oppLeft' || persisted?.doubleDefenderSlot === 'oppRight' ? persisted.doubleDefenderSlot : 'oppLeft')
  const [doubleSpreadMove, setDoubleSpreadMove] = React.useState(() => Boolean(persisted?.doubleSpreadMove))
  const [doubleMoveName, setDoubleMoveName] = React.useState(() => typeof persisted?.doubleMoveName === 'string' ? persisted.doubleMoveName : '')
  const [doubleProtectMyLeft, setDoubleProtectMyLeft] = React.useState(() => Boolean(persisted?.doubleProtectMyLeft))
  const [doubleProtectMyRight, setDoubleProtectMyRight] = React.useState(() => Boolean(persisted?.doubleProtectMyRight))
  const [doubleProtectOppLeft, setDoubleProtectOppLeft] = React.useState(() => Boolean(persisted?.doubleProtectOppLeft))
  const [doubleProtectOppRight, setDoubleProtectOppRight] = React.useState(() => Boolean(persisted?.doubleProtectOppRight))
  const [doubleActionMoveMyLeft, setDoubleActionMoveMyLeft] = React.useState(() => typeof persisted?.doubleActionMoveMyLeft === 'string' ? persisted.doubleActionMoveMyLeft : '')
  const [doubleActionMoveMyRight, setDoubleActionMoveMyRight] = React.useState(() => typeof persisted?.doubleActionMoveMyRight === 'string' ? persisted.doubleActionMoveMyRight : '')
  const [doubleActionMoveOppLeft, setDoubleActionMoveOppLeft] = React.useState(() => typeof persisted?.doubleActionMoveOppLeft === 'string' ? persisted.doubleActionMoveOppLeft : '')
  const [doubleActionMoveOppRight, setDoubleActionMoveOppRight] = React.useState(() => typeof persisted?.doubleActionMoveOppRight === 'string' ? persisted.doubleActionMoveOppRight : '')
  const [doubleActionTargetMyLeft, setDoubleActionTargetMyLeft] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionTargetMyLeft === 'myLeft' || persisted?.doubleActionTargetMyLeft === 'myRight' || persisted?.doubleActionTargetMyLeft === 'oppLeft' || persisted?.doubleActionTargetMyLeft === 'oppRight' ? persisted.doubleActionTargetMyLeft : 'oppLeft')
  const [doubleActionTargetMyRight, setDoubleActionTargetMyRight] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionTargetMyRight === 'myLeft' || persisted?.doubleActionTargetMyRight === 'myRight' || persisted?.doubleActionTargetMyRight === 'oppLeft' || persisted?.doubleActionTargetMyRight === 'oppRight' ? persisted.doubleActionTargetMyRight : 'oppRight')
  const [doubleActionTargetOppLeft, setDoubleActionTargetOppLeft] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionTargetOppLeft === 'myLeft' || persisted?.doubleActionTargetOppLeft === 'myRight' || persisted?.doubleActionTargetOppLeft === 'oppLeft' || persisted?.doubleActionTargetOppLeft === 'oppRight' ? persisted.doubleActionTargetOppLeft : 'myLeft')
  const [doubleActionTargetOppRight, setDoubleActionTargetOppRight] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionTargetOppRight === 'myLeft' || persisted?.doubleActionTargetOppRight === 'myRight' || persisted?.doubleActionTargetOppRight === 'oppLeft' || persisted?.doubleActionTargetOppRight === 'oppRight' ? persisted.doubleActionTargetOppRight : 'myRight')
  const [doubleActionFocusSlot, setDoubleActionFocusSlot] = React.useState<DoubleBoardSlot>(() => persisted?.doubleActionFocusSlot === 'myLeft' || persisted?.doubleActionFocusSlot === 'myRight' || persisted?.doubleActionFocusSlot === 'oppLeft' || persisted?.doubleActionFocusSlot === 'oppRight' ? persisted.doubleActionFocusSlot : 'myLeft')
  const [doubleBulkEditorSlot, setDoubleBulkEditorSlot] = React.useState<DoubleBoardSlot | null>(null)
  const [calcSwapSides, setCalcSwapSides] = React.useState(() => Boolean(persisted?.calcSwapSides))
  const [calcAttackStage, setCalcAttackStage] = React.useState(() => clampBattleStage(persisted?.calcAttackStage))
  const [calcDefenseStage, setCalcDefenseStage] = React.useState(() => clampBattleStage(persisted?.calcDefenseStage))
  const [calcHitCount, setCalcHitCount] = React.useState(() => {
    const value = Number(persisted?.calcHitCount)
    return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 3
  })
  const initialOpponentBulkPreset = React.useMemo(() => sanitizeOpponentBulkPreset(persisted?.calcOpponentBulkPreset), [persisted])
  const initialOpponentBulkState = React.useMemo(() => sanitizeOpponentBulkState({
    hpEv: persisted?.calcOpponentHpEv,
    defenseEv: persisted?.calcOpponentDefenseEv,
    spDefenseEv: persisted?.calcOpponentSpDefenseEv,
    defenseNature: persisted?.calcOpponentDefenseNature,
    spDefenseNature: persisted?.calcOpponentSpDefenseNature,
  }, initialOpponentBulkPreset), [initialOpponentBulkPreset, persisted])
  const [calcWeather, setCalcWeather] = React.useState<DamageWeather>(() => persisted?.calcWeather ?? 'none')
  const [calcTerrain, setCalcTerrain] = React.useState<DamageTerrain>(() => persisted?.calcTerrain ?? 'none')
  const [calcFieldConditionsCollapsed, setCalcFieldConditionsCollapsed] = React.useState(() => !(
    (persisted?.calcWeather && persisted.calcWeather !== 'none')
    || (persisted?.calcTerrain && persisted.calcTerrain !== 'none')
    || persisted?.calcReflect
    || persisted?.calcLightScreen
    || persisted?.calcAuroraVeil
  ))
  const [calcBurned, setCalcBurned] = React.useState(() => Boolean(persisted?.calcBurned))
  const [calcCritical, setCalcCritical] = React.useState(() => Boolean(persisted?.calcCritical))
  const [calcAttackerLowHp, setCalcAttackerLowHp] = React.useState(() => Boolean(persisted?.calcAttackerLowHp))
  const [calcTargetPoisoned, setCalcTargetPoisoned] = React.useState(() => Boolean(persisted?.calcTargetPoisoned))
  const [calcDefenderFullHp, setCalcDefenderFullHp] = React.useState(() => Boolean(persisted?.calcDefenderFullHp))
  const [calcDefenderDisguise, setCalcDefenderDisguise] = React.useState(() => Boolean(persisted?.calcDefenderDisguise))
  const [calcMovedAfterTarget, setCalcMovedAfterTarget] = React.useState(() => Boolean(persisted?.calcMovedAfterTarget))
  const [calcFaintedAllies, setCalcFaintedAllies] = React.useState(() => Number.isFinite(Number(persisted?.calcFaintedAllies)) ? Math.max(0, Math.min(5, Math.trunc(Number(persisted?.calcFaintedAllies)))) : 0)
  const [calcRivalryMode, setCalcRivalryMode] = React.useState<RivalryMode>(() => persisted?.calcRivalryMode === 'same' || persisted?.calcRivalryMode === 'opposite' ? persisted.calcRivalryMode : 'neutral')
  const [calcParentalBond, setCalcParentalBond] = React.useState(() => Boolean(persisted?.calcParentalBond))
  const [calcDefenderStatused, setCalcDefenderStatused] = React.useState(() => Boolean(persisted?.calcDefenderStatused))
  const [calcElectromorphosisCharged, setCalcElectromorphosisCharged] = React.useState(() => Boolean(persisted?.calcElectromorphosisCharged))
  const [calcReflect, setCalcReflect] = React.useState(() => Boolean(persisted?.calcReflect))
  const [calcLightScreen, setCalcLightScreen] = React.useState(() => Boolean(persisted?.calcLightScreen))
  const [calcAuroraVeil, setCalcAuroraVeil] = React.useState(() => Boolean(persisted?.calcAuroraVeil))
  const [calcFriendGuard, setCalcFriendGuard] = React.useState(() => Boolean(persisted?.calcFriendGuard))
  const [calcTypeChangeStab, setCalcTypeChangeStab] = React.useState(() => persisted?.calcTypeChangeStab !== false)
  const [calcConditionalPowerValues, setCalcConditionalPowerValues] = React.useState<Record<string, ConditionalPowerValue>>(() => (persisted?.calcConditionalPowerValues && typeof persisted.calcConditionalPowerValues === 'object') ? persisted.calcConditionalPowerValues : {})
  const [weightByKey, setWeightByKey] = React.useState<Record<string, number>>({})
  const initialOpponentOffensePreset = React.useMemo(() => sanitizeOpponentOffensePreset(persisted?.calcOpponentOffensePreset), [persisted])
  const initialOpponentOffenseState = React.useMemo(() => sanitizeOpponentOffenseState({
    attackEv: persisted?.calcOpponentAttackEv,
    spAttackEv: persisted?.calcOpponentSpAttackEv,
    attackNature: persisted?.calcOpponentAttackNature,
    spAttackNature: persisted?.calcOpponentSpAttackNature,
  }, initialOpponentOffensePreset), [initialOpponentOffensePreset, persisted])
  const [calcOpponentBulkPreset, setCalcOpponentBulkPreset] = React.useState<OpponentBulkPreset>(initialOpponentBulkPreset)
  const [calcOpponentHpEv, setCalcOpponentHpEv] = React.useState(initialOpponentBulkState.hpEv)
  const [calcOpponentDefenseEv, setCalcOpponentDefenseEv] = React.useState(initialOpponentBulkState.defenseEv)
  const [calcOpponentSpDefenseEv, setCalcOpponentSpDefenseEv] = React.useState(initialOpponentBulkState.spDefenseEv)
  const [calcOpponentDefenseNature, setCalcOpponentDefenseNature] = React.useState(initialOpponentBulkState.defenseNature)
  const [calcOpponentSpDefenseNature, setCalcOpponentSpDefenseNature] = React.useState(initialOpponentBulkState.spDefenseNature)
  const [calcOpponentOffensePreset, setCalcOpponentOffensePreset] = React.useState<OpponentOffensePreset>(initialOpponentOffensePreset)
  const [calcOpponentAttackEv, setCalcOpponentAttackEv] = React.useState(initialOpponentOffenseState.attackEv)
  const [calcOpponentSpAttackEv, setCalcOpponentSpAttackEv] = React.useState(initialOpponentOffenseState.spAttackEv)
  const [calcOpponentAttackNature, setCalcOpponentAttackNature] = React.useState(initialOpponentOffenseState.attackNature)
  const [calcOpponentSpAttackNature, setCalcOpponentSpAttackNature] = React.useState(initialOpponentOffenseState.spAttackNature)
  const [stab, setStab] = React.useState(1.5)
  const [effectiveness, setEffectiveness] = React.useState(1)
  const [battleNote, setBattleNote] = React.useState(() => typeof persisted?.battleNote === 'string' ? persisted.battleNote : '')
  const [mainSection, setMainSection] = React.useState<MainSection>(() => viewState?.mainSection ?? persisted?.mainSection ?? 'home')
  const [speedLineState, setSpeedLineState] = React.useState(() => viewState?.speedLineState ?? { ...defaultSpeedLineState })
  const [speedLineWarnings, setSpeedLineWarnings] = React.useState(() => viewState?.speedLineWarnings ?? [])
  const lastSpeedLineRoute = React.useRef(viewState?.speedLineState
    ? { state: viewState.speedLineState, warnings: viewState.speedLineWarnings ?? [] }
    : null)
  const [activeTab, setActiveTab] = React.useState<MainTab>(() => {
    const resolvedTab = viewState?.activeTab ?? persisted?.activeTab ?? 'party'
    return (viewState?.mainSection ?? persisted?.mainSection) === 'double' && resolvedTab === 'speed' ? 'power' : resolvedTab
  })
  const [selectedDamageMove, setSelectedDamageMove] = React.useState<DamageMoveSelection | null>(null)
  const [calcMyMegaKey, setCalcMyMegaKey] = React.useState<string | null>(null)
  const [calcOppMegaKey, setCalcOppMegaKey] = React.useState<string | null>(null)
  const [singleSpeedAssumption, setSingleSpeedAssumption] = React.useState<{ identity: string; nature: SingleSpeedNature; item: SingleSpeedItem; abilityActive: boolean } | null>(null)
  const [singleSpeedOwnScarfChoice, setSingleSpeedOwnScarf] = React.useState<{ identity: string; scarf: boolean } | null>(null)
  const [moveFilter, setMoveFilter] = React.useState<MoveFilter>('all')
  const [sampleMoveFilter, setSampleMoveFilter] = React.useState<MoveFilter>('core')
  const [moveSearch, setMoveSearch] = React.useState('')
  const [activeMoveField, setActiveMoveField] = React.useState<MoveFieldTarget>(null)
  const [moveInputDraft, setMoveInputDraft] = React.useState<string | null>(null)
  const [moveCommitNotice, setMoveCommitNotice] = React.useState<MoveFieldTarget>(null)
  const [activeItemField, setActiveItemField] = React.useState<ItemFieldTarget>(null)
  const [autocompleteHighlight, setAutocompleteHighlight] = React.useState<AutocompleteHighlight>(null)
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = React.useState(false)
  const [tuningModalIndex, setTuningModalIndex] = React.useState<number | null>(null)
  const partyTuningOpener = React.useRef<HTMLElement | null>(null)
  const partyEditor = usePartyEditor({
    initialParty: initialWorkspace.party, emptyParty, workspace, setParty, selectPreset, createPreset, renamePreset, deletePreset,
    language: siteLanguage, defaultNatureForKey, onSelectMy: setSelectedMy, onCloseTuning: () => setTuningModalIndex(null),
    onPresetSelectControls: () => {
      setActiveItemField(prev => prev?.scope === 'party' ? null : prev)
      setActiveMoveField(prev => prev?.scope === 'party' ? null : prev)
    },
    onClearSlotControls: (idx, key) => {
      setActiveItemField(prev => sameItemField(prev, 'party', idx) ? null : prev)
      setActiveMoveField(prev => prev?.scope === 'party' && prev.key === key ? null : prev)
      if (tuningModalIndex === idx) setTuningModalIndex(null)
      if (selectedMy === idx) setSelectedMy(0)
    },
  })
  const { partySearch, setPartySearch, partyItemDrafts, setPartyItemDrafts, partyPresetLabelDraft, setPartyPresetLabelDraft, partyNameDraft, setPartyNameDraft, activePartyLabel, applyPartyPreset, createNewParty, renamePartyPreset, resetPartyForFreshEntry, clearPartySlot, selectPartySpecies } = partyEditor
  const [sampleForge, setSampleForge] = React.useState<PartyMember>(() => persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge())
  const [sampleLockedMoves, setSampleLockedMoves] = React.useState<string[]>(() => persisted?.sampleLockedMoves ? sanitizeMoveSlotList(persisted.sampleLockedMoves) : sanitizeConfirmedMovesByKey(persisted?.confirmedMovesByKey)[(persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge()).key] ?? [])
  const [sampleSearch, setSampleSearch] = React.useState(() => searchDisplayLabel((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, 'ko'))
  const [dexSearchMode, setDexSearchMode] = React.useState<DexSearchMode>(() => viewState?.dexSearchMode ?? 'pokemon')
  const [dexSearch, setDexSearch] = React.useState(() => viewState?.dexSearch ?? '')
  const [dexUnifiedSearch, setDexUnifiedSearch] = React.useState(() => viewState?.dexUnifiedSearch ?? viewState?.dexSearch ?? '')
  const [dexUnifiedSearchDraft, setDexUnifiedSearchDraft] = React.useState(() => viewState?.dexUnifiedSearch ?? viewState?.dexSearch ?? '')
  const [dexUnifiedSearchComposing, setDexUnifiedSearchComposing] = React.useState(false)
  const [dexPagination, setDexPagination] = React.useState<DexPage>({ scope: '', count: DEX_PAGE_SIZE })
  const [dexSelectedValue, setDexSelectedValue] = React.useState<string | null>(() => viewState?.dexSelectedValue ?? null)
  // Route restoration is asynchronous (including deferred search values). Do not
  // serialize a half-restored render back over the history entry we just read.
  const restoringDexRoute = React.useRef<{ mode: DexSearchMode; query: string; selection: string | null } | null>(null)
  const pendingDexScrollRestore = React.useRef<DexScrollRestore | null>(null)
  const [selectedDexPartySlot, setSelectedDexPartySlot] = React.useState<number | null>(null)
  const [hoverTooltip, setHoverTooltip] = React.useState<({ anchorX: number; anchorTop: number; anchorBottom: number } & HoverTooltipCard) | null>(null)
  const longPressTimerRef = React.useRef<number | null>(null)
  const longPressTriggeredRef = React.useRef(false)
  const suppressFocusTooltipRef = React.useRef(false)
  const [savedSamples, setSavedSamples] = React.useState<SavedSample[]>(() => sanitizeSavedSamples(persisted?.savedSamples))
  const [partyImageImportBusy, setPartyImageImportBusy] = React.useState(false)
  const [partyImageImportStatus, setPartyImageImportStatus] = React.useState('')
  const [creatorPartyImportError, setCreatorPartyImportError] = React.useState('')
  const [sampleWorkbenchTab, setSampleWorkbenchTab] = React.useState<SampleWorkbenchTab>(() => viewState?.sampleWorkbenchTab ?? ((persisted?.sampleWorkbenchTab as string) === 'rankers' ? 'library' : ['builder','speed','damage','library'].includes(persisted?.sampleWorkbenchTab ?? '') ? persisted!.sampleWorkbenchTab! : 'builder'))
  const [librarySourceId, setLibrarySourceId] = React.useState<string | null>(() => viewState?.librarySourceId ?? null)
  const libraryScrollRef = React.useRef<number | null>(null)
  const restoringLibraryRoute = React.useRef<LibraryViewContext & { sourceId: string | null } | null>(null)
  const [libraryLanguage, setLibraryLanguage] = React.useState<LibraryLanguage | 'all'>(() => viewState?.libraryLanguage ?? 'all')
  const [libraryFormat, setLibraryFormat] = React.useState<LibraryFormat | 'all'>(() => viewState?.libraryFormat ?? 'all')
  const [libraryContentKind, setLibraryContentKind] = React.useState<'party' | 'pokemon'>(() => viewState?.libraryContentKind ?? 'party')
  const [draftFormat, setDraftFormat] = React.useState<LibraryFormat>('singles')
  const [draftLanguage, setDraftLanguage] = React.useState<LibraryLanguage>('ko')
  const [libraryQuery, setLibraryQuery] = React.useState(() => viewState?.libraryQuery ?? '')
  const [creatorMegaSelection, setCreatorMegaSelection] = React.useState<Record<string, boolean>>({})
  const [linkDraftInput, setLinkDraftInput] = React.useState('')
  const [linkDraftError, setLinkDraftError] = React.useState(false)
  const [creatorLinkDrafts, setCreatorLinkDrafts] = React.useState<LinkDraft[]>(() => sanitizeLinkDrafts(persisted?.creatorLinkDrafts))
  const [sampleSpeedTargets, setSampleSpeedTargets] = React.useState<SampleSpeedTarget[]>(() => sanitizeSampleSpeedTargets(persisted?.sampleSpeedTargets))
  const [sampleDamageTargets, setSampleDamageTargets] = React.useState<SampleDamageTarget[]>(() => sanitizeSampleDamageTargets(persisted?.sampleDamageTargets))
  React.useEffect(() => {
    setSampleDamageTargets(prev => prev.map(member => member.sampleConditions?.ownerKey === sampleForge.key
      ? member : { ...member, sampleConditions: member.sampleConditions
        ? sampleConditions(sampleForge.key)
        : { ...sampleConditions(sampleForge.key),
            own: sampleBattle({ defenseStage: member.reverseDefenseStage, reflect: member.reverseReflect, lightScreen: member.reverseLightScreen, auroraVeil: member.reverseAuroraVeil, fullHp: member.reverseDefenderFullHp }),
            opponent: sampleBattle({ attackStage: member.reverseAttackStage, burned: member.reverseBurned }) } }))
  }, [sampleForge.key])
  const [sampleOpponentMoveDraft, setSampleOpponentMoveDraft] = React.useState<{ key: string; index: number; text: string } | null>(null)
  const [sampleMoveHitCounts, setSampleMoveHitCounts] = React.useState<Record<string, number>>({})
  const [sampleSpeedSearch, setSampleSpeedSearch] = React.useState('')

  const [sampleDamageSearch, setSampleDamageSearch] = React.useState('')

  const [sampleTuningModalOpen, setSampleTuningModalOpen] = React.useState(false)
  const [sampleTuningIdentity, setSampleTuningIdentity] = React.useState<string | null>(null)
  const sampleTuningOpener = React.useRef<HTMLElement | null>(null)
  React.useEffect(() => {
    setSampleTuningModalOpen(false)
  }, [mainSection, sampleWorkbenchTab === 'library', sampleForge.key])
  const [sampleLabelDraft, setSampleLabelDraft] = React.useState('')
  const [sampleItemDraft, setSampleItemDraft] = React.useState(() => displayItemLabel(visibleChampionsItem((persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).key, (persisted?.sampleForge ? sanitizeParty([persisted.sampleForge])[0] : defaultSampleForge()).item), 'ko'))
  const [dexMoveLearnerResult, setDexMoveLearnerResult] = React.useState<{ name: string; status: 'loading' | 'ready' | 'missing' | 'error'; keys: string[] } | null>(null)
  const [asyncDataVersion, setAsyncDataVersion] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const partyImageInputRef = React.useRef<HTMLInputElement | null>(null)
  const tuningMember = tuningModalIndex !== null ? party[tuningModalIndex] : null
  const tuningRow = tuningMember?.key ? (indexByKey.get(tuningMember.key) ?? rows[0]) : null
  const magicCandidate = tuningMember && tuningRow ? findMagicNumberCandidate(tuningRow, tuningMember) : null
  const lt = React.useCallback((text: string) => translateText(siteLanguage, text), [siteLanguage])
  React.useEffect(() => {
    if (mainSection === 'home') return
    let cancelled = false
    void Promise.all([
      loadMoveMetaByName(),
      loadUsageTopMovesByKey(),
      loadDexDescriptions(),
    ]).then(() => {
      if (!cancelled) setAsyncDataVersion((prev) => prev + 1)
    })
    return () => {
      cancelled = true
    }
  }, [mainSection])
  // The draft owns the editable input. Route restoration and detail actions
  // update it explicitly; echoing the delayed committed query back into the
  // draft can erase a newer keystroke while switching categories.
  React.useEffect(() => {
    if (dexUnifiedSearchComposing) return
    const timeout = window.setTimeout(() => {
      setDexUnifiedSearch((prev) => prev === dexUnifiedSearchDraft ? prev : dexUnifiedSearchDraft)
    }, 120)
    return () => window.clearTimeout(timeout)
  }, [dexUnifiedSearchComposing, dexUnifiedSearchDraft])
  const deferredDexSearch = React.useDeferredValue(dexSearch)
  React.useEffect(() => { if (!dexUnifiedSearchComposing) setDexSearch(dexUnifiedSearch) }, [dexUnifiedSearch, dexUnifiedSearchComposing])
  const deferredDexUnifiedSearch = React.useDeferredValue(dexUnifiedSearch)
  const dexQueryPending = dexUnifiedSearchComposing || dexUnifiedSearchDraft !== deferredDexUnifiedSearch || dexUnifiedSearchDraft !== deferredDexSearch
  const hasDexUnifiedSearch = deferredDexUnifiedSearch.trim().length > 0
  const dexSpeciesOptions = React.useMemo(() => filterSpeciesOptions(deferredDexSearch, { includeMega: true, allowLoose: false }), [deferredDexSearch])
  const dexMoveOptions = React.useMemo(() => filterDexMoveOptions(deferredDexSearch, { allowLoose: false }), [asyncDataVersion, deferredDexSearch])
  const dexAbilityOptions = React.useMemo(() => filterDexAbilityOptions(deferredDexSearch, { allowLoose: false }), [asyncDataVersion, deferredDexSearch])
  const dexItemOptions = React.useMemo(() => filterDexItemOptions(deferredDexSearch, siteLanguage), [asyncDataVersion, deferredDexSearch, siteLanguage])
  const dexAllResults = React.useMemo<DexResultItem[]>(() => {
    const unifiedQuery = deferredDexUnifiedSearch.trim()
    if (!unifiedQuery) return []
    const speciesOptions = filterSpeciesOptions(unifiedQuery, { includeMega: true, allowLoose: false })
    const moveOptions = filterDexMoveOptions(unifiedQuery, { allowLoose: false })
    const abilityOptions = filterDexAbilityOptions(unifiedQuery, { allowLoose: false })
    const itemOptions = filterDexItemOptions(unifiedQuery, siteLanguage)
    const pokemonResults: Extract<DexResultItem, { kind: 'pokemon' }>[] = speciesOptions
      .map((option, idx) => {
        const row = indexByKey.get(option.key)
        return row ? { id: dexSelectionId('pokemon', option.key), kind: 'pokemon' as const, key: option.key, row, score: idx + 0 } : null
      })
      .filter((entry): entry is Extract<DexResultItem, { kind: 'pokemon' }> => entry !== null)
    const moveResults: Extract<DexResultItem, { kind: 'move' }>[] = moveOptions.map((option, idx) => ({ id: dexSelectionId('move', option.key), kind: 'move' as const, key: option.key, name: option.name, meta: option.meta, score: idx + 0.15 }))
    const abilityResults: Extract<DexResultItem, { kind: 'ability' }>[] = abilityOptions.map((option, idx) => ({ id: dexSelectionId('ability', option.key), kind: 'ability' as const, key: option.key, koLabel: option.koLabel, pokemonKeys: option.pokemonKeys, score: idx + 0.3 }))
    const itemResults: Extract<DexResultItem, { kind: 'item' }>[] = itemOptions.map((item, idx) => {
      const itemText = localizedDexText(itemDescriptionFor(item), siteLanguage)
      return { id: dexSelectionId('item', item), kind: 'item' as const, key: item, item, previewText: itemText?.summary || itemText?.detail || '', score: idx + 0.45 }
    })
    return ([...pokemonResults, ...moveResults, ...abilityResults, ...itemResults] as DexResultItem[])
      .sort((a, b) => a.score - b.score || a.kind.localeCompare(b.kind) || a.key.localeCompare(b.key, 'ko'))
  }, [asyncDataVersion, deferredDexUnifiedSearch, siteLanguage])
  const dexCategoryResults = React.useMemo(() => dexAllResults.filter(result => result.kind === dexSearchMode), [dexAllResults, dexSearchMode])
  const dexResultKeys = React.useMemo(() => {
    if (hasDexUnifiedSearch) return dexCategoryResults.map((result) => result.id)
    if (dexSearchMode === 'pokemon') return dexSpeciesOptions.map((option) => option.key)
    if (dexSearchMode === 'move') return dexMoveOptions.map((option) => option.key)
    if (dexSearchMode === 'ability') return dexAbilityOptions.map((option) => option.key)
    return dexItemOptions
  }, [dexAbilityOptions, dexCategoryResults, dexItemOptions, dexMoveOptions, dexSearchMode, dexSpeciesOptions, hasDexUnifiedSearch])
  // An explicit URL selection is canonical; search results are only a browsing projection.
  const dexSelectedAllResult = React.useMemo<DexResultItem | null>(() => {
    if (!dexSelectedValue) return null
    const parsed = parseDexSelectionId(dexSelectedValue)
    const kind = parsed?.kind ?? dexSearchMode
    const key = parsed?.key ?? dexSelectedValue
    if (kind !== dexSearchMode) return null
    if (kind === 'pokemon') {
      const row = indexByKey.get(key)
      return row ? { id: dexSelectionId(kind, key), kind, key, row, score: 0 } : null
    }
    if (kind === 'move') {
      const meta = getMoveMetadata(key)?.meta ?? null
      return meta ? { id: dexSelectionId(kind, key), kind, key, name: key, meta, score: 0 } : null
    }
    if (kind === 'ability') {
      const ability = ABILITY_INDEX.byKey.get(key)
      return ability ? { id: dexSelectionId(kind, key), kind, key, koLabel: ability.koLabel, pokemonKeys: ability.pokemonKeys, score: 0 } : null
    }
    const canonicalItem = canonicalChampionsItemName(key)
    return CHAMPIONS_ITEM_OPTIONS.includes(canonicalItem as ChampionsItem) || resolveItemInfo(key)
      ? { id: dexSelectionId(kind, key), kind, key, item: key, previewText: '', score: 0 }
      : null
  }, [dexSearchMode, dexSelectedValue, asyncDataVersion])
  const dexSelectedRow = dexSelectedAllResult?.kind === 'pokemon' ? dexSelectedAllResult.row : null
  const dexSelectedMove = dexSelectedAllResult?.kind === 'move'
    ? { key: dexSelectedAllResult.key, name: dexSelectedAllResult.name, meta: dexSelectedAllResult.meta } : null
  const dexSelectedMoveName = dexSelectedMove?.name ?? ''
  const dexMoveLearnersStatus = !dexSelectedMoveName ? 'idle' : dexMoveLearnerResult?.name === dexSelectedMoveName ? dexMoveLearnerResult.status : 'loading'
  const dexMoveLearners = dexMoveLearnerResult?.name === dexSelectedMoveName && dexMoveLearnerResult.status === 'ready'
    ? dexMoveLearnerResult.keys.map(key => indexByKey.get(key)).filter((row): row is Row => Boolean(row))
      .sort((a, b) => displayName(a, 'ko').localeCompare(displayName(b, 'ko'), 'ko')) : []
  const dexSelectedAbility = dexSelectedAllResult?.kind === 'ability'
    ? { key: dexSelectedAllResult.key, koLabel: dexSelectedAllResult.koLabel, pokemonKeys: dexSelectedAllResult.pokemonKeys } : null
  const dexSelectedItem = dexSelectedAllResult?.kind === 'item' ? dexSelectedAllResult.item : null
  const dexListHref = React.useMemo(() => {
    const params = new URLSearchParams()
    params.set('dexTab', dexSearchMode)
    if (dexUnifiedSearchDraft.trim()) { params.set('q', dexUnifiedSearchDraft.trim()); params.set('uq', dexUnifiedSearchDraft.trim()) }
    return `#/dex?${params}`
  }, [dexSearchMode, dexUnifiedSearchDraft])
  const dexDetailHref = (kind: DexSearchMode, key: string, label = kind === 'pokemon' ? searchDisplayLabel(key, siteLanguage) : kind === 'item' ? displayItemLabel(key, siteLanguage) : key) => {
    const params = new URLSearchParams(dexListHref.split('?')[1])
    params.set('dexTab', kind)
    if (kind !== dexSearchMode) {
      params.set('q', label)
      params.set('uq', label)
    }
    params.set('sel', dexSelectionId(kind, key))
    return `#/dex?${params}`
  }
  const dexBrowseResults = React.useMemo<DexResultItem[]>(() => {
    if (hasDexUnifiedSearch) return dexCategoryResults
    if (dexSearchMode === 'pokemon') return dexSpeciesOptions.flatMap((option, score) => {
      const row = indexByKey.get(option.key)
      return row ? [{ id: dexSelectionId('pokemon', option.key), kind: 'pokemon' as const, key: option.key, row, score }] : []
    })
    if (dexSearchMode === 'move') return dexMoveOptions.map((option, score) => ({ id: dexSelectionId('move', option.key), kind: 'move' as const, key: option.key, name: option.name, meta: option.meta, score }))
    if (dexSearchMode === 'ability') return dexAbilityOptions.map((option, score) => ({ id: dexSelectionId('ability', option.key), kind: 'ability' as const, key: option.key, koLabel: option.koLabel, pokemonKeys: option.pokemonKeys, score }))
    return dexItemOptions.map((item, score) => ({ id: dexSelectionId('item', item), kind: 'item' as const, key: item, item, previewText: localizedDexText(itemDescriptionFor(item), siteLanguage)?.summary ?? '', score }))
  }, [hasDexUnifiedSearch, dexCategoryResults, dexSearchMode, dexSpeciesOptions, dexMoveOptions, dexAbilityOptions, dexItemOptions, siteLanguage])
  const dexBrowseCards = React.useMemo<DexBrowseCard[]>(() => dexBrowseResults.map(result => {
    const href = dexDetailHref(result.kind, result.key)
    if (result.kind === 'pokemon') return { id: result.id, href, kind: result.kind, label: searchDisplayLabel(result.key, siteLanguage), secondaryLabel: result.row.name_en, sprite: result.row.sprite, types: result.row.types }
    if (result.kind === 'move') return { id: result.id, href, kind: result.kind, label: result.name, types: result.meta.type ? [result.meta.type] : [], metaText: `${displayTypeName(result.meta.type, siteLanguage)} · ${result.meta.category == null ? lt('미확인') : displayMoveCategoryName(result.meta.category, siteLanguage)}${result.meta.power != null ? ` · ${lt('위력')} ${resolvedMovePower(result.meta)}` : ''}${result.meta.pp != null ? ` · PP ${result.meta.pp}` : ''}` }
    if (result.kind === 'ability') return { id: result.id, href, kind: result.kind, label: abilityDisplayName(result.key, result.koLabel, siteLanguage), metaText: `${result.pokemonKeys.length}${siteLanguage === 'en' ? ' Pokémon' : siteLanguage === 'ja' ? '匹' : '마리'}`, pokemonSprites: result.pokemonKeys.flatMap(key => { const row = indexByKey.get(key); return row?.sprite ? [{key, src: row.sprite}] : [] }) }
    return { id: result.id, href, kind: result.kind, label: displayItemLabel(result.item, siteLanguage), secondaryLabel: result.previewText, sprite: itemSpriteSrc('', result.item) }
  }), [dexBrowseResults, siteLanguage, dexListHref, lt])
  const dexScope = dexPageScope(dexSearchMode, normalizeSearchText(deferredDexUnifiedSearch))
  const dexCount = dexVisibleCount(dexPagination, dexScope, dexBrowseCards.length)
  React.useEffect(() => {
    if (dexQueryPending) return
    const saved = pendingDexScrollRestore.current
    setDexPagination(previous => {
      if (saved?.scope === dexScope && (previous.scope !== dexScope || previous.count !== saved.count)) return { scope: dexScope, count: saved.count }
      return previous.scope === dexScope ? previous : { scope: dexScope, count: DEX_PAGE_SIZE }
    })
  }, [dexScope, dexQueryPending])
  const loadMoreDex = React.useCallback(() => {
    if (dexQueryPending || dexCount >= dexBrowseCards.length) return
    setDexPagination(previous => dexNextPage(previous, dexScope, dexBrowseCards.length, dexCount))
  }, [dexQueryPending, dexCount, dexBrowseCards.length, dexScope])
  const [dexPoolByKey, setDexPoolByKey] = React.useState<Record<string, {status: 'loading' | 'ready' | 'error' | 'missing'; moves: MoveOption[]; provenance: DexLearnsetProvenance}>>({})

  React.useEffect(() => {
    const key = mainSection === 'dex' ? dexSelectedRow?.key : undefined
    if (!key || (dexPoolByKey[key] && dexPoolByKey[key].status !== 'loading')) return
    let cancelled = false
    setDexPoolByKey(prev => ({ ...prev, [key]: {status: 'loading', moves: [], provenance: DEX_GAME_LEARNSET_SOURCE} }))
    void loadFormLearnset(key).then(result => {
      if (cancelled) return
      setDexPoolByKey(prev => ({ ...prev, [key]: {status: result.status === 'ready-verified' ? 'ready' : 'missing', moves: result.moves, provenance: result.provenance} }))
    }).catch(() => { if (!cancelled) setDexPoolByKey(prev => ({ ...prev, [key]: {status: 'error', moves: [], provenance: DEX_GAME_LEARNSET_SOURCE} })) })
    return () => { cancelled = true }
    // Route/key alone control requests. Failed module imports need an explicit page reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainSection, dexSelectedRow?.key])
  const dexSelectedPool = dexSelectedRow ? dexPoolByKey[dexSelectedRow.key] : undefined
  const dexTopMoves = React.useMemo(() => dexSelectedRow ? usageTopMovesForKey(dexSelectedRow.key, 10) : [], [asyncDataVersion, dexSelectedRow])
  const dexSelectedMoveDescription = React.useMemo(() => dexSelectedMove ? moveDescriptionFor(dexSelectedMove.name) : null, [dexSelectedMove, asyncDataVersion])
  const dexSelectedAbilityDescription = React.useMemo(() => dexSelectedAbility ? abilityDescriptionFor(dexSelectedAbility.key) : null, [dexSelectedAbility, asyncDataVersion])
  const dexSelectedItemDescription = React.useMemo(() => dexSelectedItem ? itemDescriptionFor(dexSelectedItem) : null, [dexSelectedItem, asyncDataVersion])
  const dexSelectedMoveText = React.useMemo(() => localizedDexText(dexSelectedMoveDescription, siteLanguage), [dexSelectedMoveDescription, siteLanguage])
  const dexSelectedAbilityText = React.useMemo(() => localizedDexText(dexSelectedAbilityDescription, siteLanguage), [dexSelectedAbilityDescription, siteLanguage])
  const dexSelectedItemText = React.useMemo(() => localizedDexText(dexSelectedItemDescription, siteLanguage), [dexSelectedItemDescription, siteLanguage])
  const dexSelectedItemEffectSummary = React.useMemo(() => dexSelectedItem ? itemEffectSummaryFor(dexSelectedItem, siteLanguage) : '', [dexSelectedItem, siteLanguage])


  React.useEffect(() => {
    let cancelled = false
    if (mainSection !== 'dex' || !dexSelectedMoveName) return
    setDexMoveLearnerResult({ name: dexSelectedMoveName, status: 'loading', keys: [] })
    loadMoveLearners(dexSelectedMoveName)
      .then((result) => {
        if (cancelled) return
        setDexMoveLearnerResult({ name: dexSelectedMoveName, status: result.status === 'ready-verified' ? 'ready' : 'missing', keys: result.keys })
      })
      .catch(() => {
        if (cancelled) return
        setDexMoveLearnerResult({ name: dexSelectedMoveName, status: 'error', keys: [] })
      })
    return () => { cancelled = true }
  }, [mainSection, dexSelectedMoveName])

  const hideHoverTooltip = React.useCallback(() => setHoverTooltip(null), [])
  const showHoverTooltipAtElement = React.useCallback((element: HTMLElement, card: HoverTooltipCard | null | undefined) => {
    if (!card) return
    const rect = element.getBoundingClientRect()
    setHoverTooltip({
      ...card,
      anchorX: rect.left + (rect.width / 2),
      anchorTop: rect.top,
      anchorBottom: rect.bottom,
    })
  }, [])
  const showHoverTooltip = React.useCallback((event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, card: HoverTooltipCard | null | undefined) => {
    showHoverTooltipAtElement(event.currentTarget, card)
  }, [showHoverTooltipAtElement])
  const bindTooltip = React.useCallback((card: HoverTooltipCard | null | undefined) => card ? {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => showHoverTooltip(event, card),
    onMouseLeave: hideHoverTooltip,
    onFocus: (event: React.FocusEvent<HTMLElement>) => showHoverTooltip(event, card),
    onBlur: hideHoverTooltip,
  } : {}, [hideHoverTooltip, showHoverTooltip])
  const clearLongPressTimer = React.useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const navigateDexCard = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented || dexQueryPending) return
    event.preventDefault()
    const parsed = parseDexSelectionId(id)
    if (!parsed) return
    const url = new URL(event.currentTarget.href)
    window.history.replaceState({ ...window.history.state, dexListScroll: window.scrollY, dexListCount: dexCount, dexListScope: dexScope }, '', window.location.href)
    window.history.pushState({ ...window.history.state, dexFromList: true }, '', url)
    restoringDexRoute.current = { mode: parsed.kind, query: dexUnifiedSearchDraft.trim(), selection: id }
    setDexSelectedValue(id)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
  const navigateDexBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return
    event.preventDefault()
    if (window.history.state?.dexFromList) { window.history.back(); return }
    restoringDexRoute.current = { mode: dexSearchMode, query: dexUnifiedSearchDraft.trim(), selection: null }
    window.history.pushState(null, '', event.currentTarget.href)
    setDexSelectedValue(null)
  }
  const openDexPokemonDetail = React.useCallback((key: string) => {
    hideHoverTooltip()
    const nextLabel = searchDisplayLabel(key, siteLanguage)
    restoringDexRoute.current = { mode: 'pokemon', query: nextLabel, selection: dexSelectionId('pokemon', key) }
    pushDexDetailHistory('pokemon', nextLabel, dexSelectionId('pokemon', key))
    setDexSearchMode('pokemon')
    setDexUnifiedSearchDraft(nextLabel)
    setDexUnifiedSearch(nextLabel)
    setDexSearch(nextLabel)
    setDexSelectedValue(dexSelectionId('pokemon', key))
  }, [hideHoverTooltip, siteLanguage])

  const openDexMoveDetail = React.useCallback((name: string) => {
    hideHoverTooltip()
    restoringDexRoute.current = { mode: 'move', query: name, selection: dexSelectionId('move', name) }
    pushDexDetailHistory('move', name, dexSelectionId('move', name))
    setDexSearchMode('move')
    setDexUnifiedSearchDraft(name)
    setDexUnifiedSearch(name)
    setDexSearch(name)
    setDexSelectedValue(dexSelectionId('move', name))
  }, [hideHoverTooltip])

  const openDexAbilityDetail = React.useCallback((ability: string, row?: Row | null) => {
    const resolved = resolveAbilityInfo(ability, row)
    if (!resolved) return
    hideHoverTooltip()
    restoringDexRoute.current = { mode: 'ability', query: resolved.koLabel, selection: dexSelectionId('ability', resolved.key) }
    pushDexDetailHistory('ability', resolved.koLabel, dexSelectionId('ability', resolved.key))
    setDexSearchMode('ability')
    setDexUnifiedSearchDraft(resolved.koLabel)
    setDexUnifiedSearch(resolved.koLabel)
    setDexSearch(resolved.koLabel)
    setDexSelectedValue(dexSelectionId('ability', resolved.key))
  }, [hideHoverTooltip])

  const bindNavigableTooltip = React.useCallback((card: HoverTooltipCard | null | undefined, onNavigate: () => void) => ({
    ...bindTooltip(card),
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (!card || event.pointerType !== 'touch') return
      suppressFocusTooltipRef.current = true
      longPressTriggeredRef.current = false
      clearLongPressTimer()
      const element = event.currentTarget
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true
        showHoverTooltipAtElement(element, card)
      }, 420)
    },
    onPointerUp: () => {
      clearLongPressTimer()
      window.setTimeout(() => {
        suppressFocusTooltipRef.current = false
      }, 0)
    },
    onPointerCancel: () => {
      clearLongPressTimer()
      suppressFocusTooltipRef.current = false
    },
    onPointerLeave: () => {
      clearLongPressTimer()
      suppressFocusTooltipRef.current = false
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      if (suppressFocusTooltipRef.current) return
      if (!card) return
      showHoverTooltip(event, card)
    },
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (longPressTriggeredRef.current) {
        event.preventDefault()
        event.stopPropagation()
        longPressTriggeredRef.current = false
        return
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return
      event.preventDefault()
      onNavigate()
    },
  }), [bindTooltip, clearLongPressTimer, showHoverTooltip, showHoverTooltipAtElement])

  React.useEffect(() => () => clearLongPressTimer(), [clearLongPressTimer])

  React.useEffect(() => {
    if (!hoverTooltip || typeof window === 'undefined') return
    const close = () => setHoverTooltip(null)
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', handleKey)
    }
  }, [hoverTooltip])

  const tooltipWidth = 280
  const tooltipHeight = hoverTooltip?.kind === 'ability' ? 190 : hoverTooltip?.kind === 'item' ? 210 : 170
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 720
  const tooltipPlacement = hoverTooltip && hoverTooltip.anchorBottom + tooltipHeight + 18 <= viewportHeight ? 'bottom' : 'top'
  const tooltipLeft = hoverTooltip ? Math.max(12, Math.min(viewportWidth - tooltipWidth - 12, hoverTooltip.anchorX - (tooltipWidth / 2))) : 0
  const tooltipTop = hoverTooltip ? (tooltipPlacement === 'bottom'
    ? Math.min(viewportHeight - tooltipHeight - 12, hoverTooltip.anchorBottom + 12)
    : Math.max(12, hoverTooltip.anchorTop - tooltipHeight - 12)) : 0
  const doublePartyOptions = React.useMemo(() => party.map((member, idx) => ({ idx, member, row: member.key ? (indexByKey.get(member.key) ?? rows[0]) : null })), [party])
  const doubleOpponentOptions = React.useMemo(() => opponents.map((entry, idx) => ({ idx, entry, row: entry.key ? (indexByKey.get(entry.key) ?? rows[0]) : null })), [opponents])
  const doubleBoardSlots = React.useMemo(() => ({
    myLeft: doublePartyOptions[doubleMyLeft] ?? null,
    myRight: doublePartyOptions[doubleMyRight] ?? null,
    oppLeft: doubleOpponentOptions[doubleOppLeft] ?? null,
    oppRight: doubleOpponentOptions[doubleOppRight] ?? null,
  }), [doubleMyLeft, doubleMyRight, doubleOppLeft, doubleOppRight, doubleOpponentOptions, doublePartyOptions])
  const doubleSlotMeta = React.useMemo(() => ({
    myLeft: { label: lt('내 좌측'), option: doubleBoardSlots.myLeft, side: 'my' as const },
    myRight: { label: lt('내 우측'), option: doubleBoardSlots.myRight, side: 'my' as const },
    oppLeft: { label: lt('상대 좌측'), option: doubleBoardSlots.oppLeft, side: 'opp' as const },
    oppRight: { label: lt('상대 우측'), option: doubleBoardSlots.oppRight, side: 'opp' as const },
  }), [doubleBoardSlots, lt])
  const doubleSlotDisplayName = React.useCallback((slot: DoubleBoardSlot) => {
    const meta = doubleSlotMeta[slot]
    return meta.option?.row ? displayName(meta.option.row, siteLanguage) : meta.label
  }, [doubleSlotMeta, siteLanguage])
  const doubleDamageAttackerMeta = doubleSlotMeta[doubleAttackerSlot]
  const doubleDamageDefenderMeta = doubleSlotMeta[doubleDefenderSlot]
  const doubleOpponentIndexBySlot: Partial<Record<DoubleBoardSlot, number>> = { oppLeft: doubleOppLeft, oppRight: doubleOppRight }
  const updateDoubleOpponentBulk = React.useCallback((slot: DoubleBoardSlot, patch: Partial<Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv' | 'natureBoost' | 'scarf' | 'speedStage' | 'defenseNature' | 'spDefenseNature'>>) => {
    const idx = doubleOpponentIndexBySlot[slot]
    if (idx === undefined) return
    updateDoubleOpponentBulkAt(idx, patch)
  }, [doubleOpponentIndexBySlot, updateDoubleOpponentBulkAt])
  const updateDoubleOpponentEffortFromPointer = React.useCallback((slot: DoubleBoardSlot, stat: Extract<EffortStatKey, 'hp' | 'defense' | 'spDefense' | 'speed'>, availableCap: number, clientX: number, element: HTMLDivElement) => {
    const idx = doubleOpponentIndexBySlot[slot]
    if (idx === undefined) return
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const nextValue = Math.round(ratio * availableCap)
    updateDoubleOpponentEffortAt(idx, stat, nextValue)
  }, [doubleOpponentIndexBySlot, updateDoubleOpponentEffortAt])
  const nudgeDoubleOpponentEffort = React.useCallback((slot: DoubleBoardSlot, stat: Extract<EffortStatKey, 'hp' | 'defense' | 'spDefense' | 'speed'>, delta: number, availableCap: number) => {
    const idx = doubleOpponentIndexBySlot[slot]
    if (idx === undefined) return
    nudgeDoubleOpponentEffortAt(idx, stat, delta, availableCap)
  }, [doubleOpponentIndexBySlot, nudgeDoubleOpponentEffortAt])
  const doubleProtectBySlot: Record<DoubleBoardSlot, boolean> = { myLeft: doubleProtectMyLeft, myRight: doubleProtectMyRight, oppLeft: doubleProtectOppLeft, oppRight: doubleProtectOppRight }
  const doubleActionMoveBySlot: Record<DoubleBoardSlot, string> = { myLeft: doubleActionMoveMyLeft, myRight: doubleActionMoveMyRight, oppLeft: doubleActionMoveOppLeft, oppRight: doubleActionMoveOppRight }
  const setDoubleActionMoveBySlot: Record<DoubleBoardSlot, (value: string) => void> = { myLeft: setDoubleActionMoveMyLeft, myRight: setDoubleActionMoveMyRight, oppLeft: setDoubleActionMoveOppLeft, oppRight: setDoubleActionMoveOppRight }
  const doubleActionTargetBySlot: Record<DoubleBoardSlot, DoubleBoardSlot> = { myLeft: doubleActionTargetMyLeft, myRight: doubleActionTargetMyRight, oppLeft: doubleActionTargetOppLeft, oppRight: doubleActionTargetOppRight }
  const setDoubleActionTargetBySlot: Record<DoubleBoardSlot, (value: DoubleBoardSlot) => void> = { myLeft: setDoubleActionTargetMyLeft, myRight: setDoubleActionTargetMyRight, oppLeft: setDoubleActionTargetOppLeft, oppRight: setDoubleActionTargetOppRight }
  const doubleAttackerMoves = React.useMemo(() => {
    if (!doubleDamageAttackerMeta.option) return [] as string[]
    return (doubleDamageAttackerMeta.side === 'my'
      ? (confirmedMovesByKey[doubleDamageAttackerMeta.option.member.key] ?? [])
      : doubleDamageAttackerMeta.option.entry.revealedMoves
    ).filter(Boolean)
  }, [confirmedMovesByKey, doubleDamageAttackerMeta])
  const buildDoubleDamageContext = React.useCallback((attackerSlot: DoubleBoardSlot, defenderSlot: DoubleBoardSlot, moveName: string, spreadMove: boolean) => {
    const attackerMeta = doubleSlotMeta[attackerSlot]
    const defenderMeta = doubleSlotMeta[defenderSlot]
    if (!attackerMeta.option?.row || !defenderMeta.option?.row || !moveName) return null
    const attackerRow = attackerMeta.option.row
    const defenderRow = defenderMeta.option.row
    const attackerKey = attackerMeta.side === 'my' ? attackerMeta.option.member.key : attackerMeta.option.entry.key
    const defenderKey = defenderMeta.side === 'my' ? defenderMeta.option.member.key : defenderMeta.option.entry.key
    const attackerItem = attackerMeta.side === 'my' ? attackerMeta.option.member.item : attackerMeta.option.entry.item
    const defenderItem = defenderMeta.side === 'my' ? defenderMeta.option.member.item : defenderMeta.option.entry.item
    if (!isCalculableHeldItem(attackerKey, attackerItem) || !isCalculableHeldItem(defenderKey, defenderItem)) return null
    const attackerAbilityRaw = attackerMeta.side === 'my' ? attackerMeta.option.member.ability : attackerMeta.option.entry.ability
    const defenderAbilityRaw = defenderMeta.side === 'my' ? defenderMeta.option.member.ability : defenderMeta.option.entry.ability
    if (heldAbilityError(attackerKey, attackerAbilityRaw, siteLanguage) || heldAbilityError(defenderKey, defenderAbilityRaw, siteLanguage)) return null
    const attackerAbility = classifyAbilityForKey(attackerKey, attackerAbilityRaw).slug ?? ''
    const defenderAbility = classifyAbilityForKey(defenderKey, defenderAbilityRaw).slug ?? ''
    const attackerAllySlot: DoubleBoardSlot | null = attackerSlot === 'myLeft' ? 'myRight' : attackerSlot === 'myRight' ? 'myLeft' : attackerSlot === 'oppLeft' ? 'oppRight' : 'oppLeft'
    const attackerAllyMeta = attackerAllySlot ? doubleSlotMeta[attackerAllySlot] : null
    const attackerAllyAbility = attackerAllyMeta?.option?.row
      ? (attackerAllyMeta.side === 'my'
        ? attackerAllyMeta.option.member.ability
        : attackerAllyMeta.option.entry.ability)
      : ''
    if (attackerAllyMeta?.option?.row && heldAbilityError(attackerAllyMeta.option.row.key, attackerAllyAbility, siteLanguage)) return null
    const defenderAllySlot: DoubleBoardSlot = defenderSlot === 'myLeft' ? 'myRight' : defenderSlot === 'myRight' ? 'myLeft' : defenderSlot === 'oppLeft' ? 'oppRight' : 'oppLeft'
    const defenderAllyMeta = doubleSlotMeta[defenderAllySlot]
    const defenderAllyAbility = defenderAllyMeta.option?.row
      ? (defenderAllyMeta.side === 'my' ? defenderAllyMeta.option.member.ability : defenderAllyMeta.option.entry.ability)
      : ''
    if (defenderAllyMeta.option?.row && heldAbilityError(defenderAllyMeta.option.row.key, defenderAllyAbility, siteLanguage)) return null
    const resolvedAttackerRow = attackingFormRow(attackerRow, attackerAbility)
    const attackerStats = attackerMeta.side === 'my'
      ? buildPartyBattleStats(resolvedAttackerRow, attackerMeta.option.member)
      : buildOpponentBattleStats(resolvedAttackerRow, { hpEv: 0, defenseEv: 0, spDefenseEv: 0, defenseNature: 1, spDefenseNature: 1 }, { attackEv: 0, spAttackEv: 0, attackNature: 1, spAttackNature: 1 })
    const defenderStats = defenderMeta.side === 'my'
      ? buildPartyBattleStats(defenderRow, defenderMeta.option.member)
      : buildOpponentBattleStats(defenderRow, {
        hpEv: defenderMeta.option.entry.hpEv,
        defenseEv: defenderMeta.option.entry.defenseEv,
        spDefenseEv: defenderMeta.option.entry.spDefenseEv,
        defenseNature: defenderMeta.option.entry.defenseNature,
        spDefenseNature: defenderMeta.option.entry.spDefenseNature,
      }, { attackEv: 0, spAttackEv: 0, attackNature: 1, spAttackNature: 1 })
    const moveOptions = choicesForPool(movePoolByKey[attackerKey])
    const baseMoveMeta = resolveMoveMeta(moveName, moveOptions, movePoolByKey)
    const moveMeta = resolveAbilityAdjustedMoveMeta(moveName, baseMoveMeta, attackerAbility)
    const moveType = moveMeta?.type ?? resolveMoveType(moveName, moveOptions, movePoolByKey) ?? null
    const mode = moveMeta?.category === 'physical' || moveMeta?.category === 'special' ? moveMeta.category : 'physical'
    const effectiveTypes = resolveAbilityAdjustedTypes(defenderRow.types, defenderAbility, 'none', 'none')
    const effectiveness = moveType ? abilityAdjustedTypeEffectiveness(moveType, effectiveTypes, defenderAbility, attackerAbility) : 1
    const guardedByWide = spreadMove && attackerMeta.side !== defenderMeta.side && (defenderMeta.side === 'my' ? doubleWideGuardMy : doubleWideGuardOpp)
    const protectedTarget = doubleProtectBySlot[defenderSlot]
    const protectionMultiplier = protectionDamageMultiplier(attackerAbility, moveName, guardedByWide || protectedTarget)
    const piercesProtection = protectionMultiplier > 0 && protectionMultiplier < 1
    const blockedByProtection = protectionMultiplier === 0
    const friendGuardAvailable = Boolean(defenderAllyMeta.option?.row && classifyAbilityForKey(defenderAllyMeta.option.row.key, defenderAllyAbility).slug === 'friend-guard')
    const friendGuard = attackerMeta.side !== defenderMeta.side && friendGuardAvailable && (defenderMeta.side === 'my' ? doubleFriendGuardMy : doubleFriendGuardOpp)
    const modifiers = blockedByProtection ? null : resolveDamageModifiers({
      attackerAbility,
      attackerTypes: resolveAbilityAdjustedTypes(attackerRow.types, attackerAbility, 'none', 'none'),
      format: 'Doubles',
      attackerAllyAbility: attackerAllyMeta?.option?.row ? classifyAbilityForKey(attackerAllyMeta.option.row.key, attackerAllyAbility).slug ?? '' : '',
      attackerItem,
      defenderAbility,
      defenderKey,
      defenderItem,
      moveName,
      moveMeta,
      baseMoveType: moveMeta?.type ?? moveType,
      moveType,
      movePower: moveMeta?.power ?? 0,
      mode,
      effectiveness,
      attackStage: 0,
      defenseStage: 0,
      defenderTypes: effectiveTypes,
      burned: false,
      attackerLowHp: false,
      targetPoisoned: false,
      defenderFullHp: true,
      movedAfterTarget: false,
      faintedAllies: 0,
      rivalryMode: 'neutral',
      parentalBond: false,
      defenderStatused: false,
      electromorphosisCharged: false,
      weather: 'none',
      terrain: 'none',
      reflect: false,
      lightScreen: false,
      auroraVeil: false,
      friendGuard,
      critical: false,
    })
    if (modifiers && spreadMove) modifiers.spreadMod = 3072
    if (modifiers && piercesProtection) {
      modifiers.finalMultiplier = (modifiers.finalMultiplier ?? 1) * protectionMultiplier
      modifiers.notes.push(`${abilityNoteLabel(attackerAbility)}(방어 관통 1/4)`)
    }
    const damage = blockedByProtection ? null : calcDamage(attackerStats, defenderStats, moveMeta?.power ?? 0, mode, moveType && attackerRow.types.includes(moveType) ? 1.5 : 1, modifiers!.effectiveness, moveMeta, modifiers ?? undefined)
    const reason = blockedByProtection && guardedByWide ? lt('와이드가드로 차단됨') : blockedByProtection && protectedTarget ? lt('방어로 막힘') : moveMeta?.category === 'status' ? lt('변화기는 대미지 계산 대상이 아님') : null
    return { attackerRow, defenderRow, defenderHp: defenderStats.hp, moveType, moveMeta, damage, reason, guardedByWide, protectedTarget, friendGuard, effectiveness: modifiers?.effectiveness ?? effectiveness }
  }, [doubleFriendGuardMy, doubleFriendGuardOpp, doubleProtectBySlot, doubleSlotMeta, doubleWideGuardMy, doubleWideGuardOpp, lt, movePoolByKey, asyncDataVersion])
  const doubleDamageContext = React.useMemo(() => buildDoubleDamageContext(doubleAttackerSlot, doubleDefenderSlot, doubleMoveName, doubleSpreadMove), [buildDoubleDamageContext, doubleAttackerSlot, doubleDefenderSlot, doubleMoveName, doubleSpreadMove])
  const doubleSpeedOrder = React.useMemo(() => {
    const entries = ([
      { slot: 'myLeft' as const, side: 'my' as const, label: lt('내 좌측'), option: doubleBoardSlots.myLeft, tailwind: doubleTailwindMy },
      { slot: 'myRight' as const, side: 'my' as const, label: lt('내 우측'), option: doubleBoardSlots.myRight, tailwind: doubleTailwindMy },
      { slot: 'oppLeft' as const, side: 'opp' as const, label: lt('상대 좌측'), option: doubleBoardSlots.oppLeft, tailwind: doubleTailwindOpp },
      { slot: 'oppRight' as const, side: 'opp' as const, label: lt('상대 우측'), option: doubleBoardSlots.oppRight, tailwind: doubleTailwindOpp },
    ]).map((entry, idx) => {
      if (!entry.option?.row) return { ...entry, idx, name: lt('미선택'), speed: null as number | null, effectiveSpeed: null as number | null, sprite: null as string | null }
      if (!isCalculableHeldItem(entry.option.row.key, entry.side === 'my' ? entry.option.member.item : entry.option.entry.item) || heldAbilityError(entry.option.row.key, entry.side === 'my' ? entry.option.member.ability : entry.option.entry.ability, siteLanguage)) return { ...entry, idx, name: displayName(entry.option.row, siteLanguage), speed: null as number | null, effectiveSpeed: null as number | null, sprite: entry.option.row.sprite ?? null }
      const speed = entry.side === 'my'
        ? partySpeedValue(entry.option.row, entry.option.member)
        : opponentSpeedValue(entry.option.row, entry.option.entry)
      const effectiveSpeed = entry.tailwind ? speed * 2 : speed
      return { ...entry, idx, name: displayName(entry.option.row, siteLanguage), speed, effectiveSpeed, sprite: entry.option.row.sprite ?? null }
    })
    return entries.slice().sort((a, b) => {
      const aSpeed = a.effectiveSpeed ?? (doubleTrickRoom ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
      const bSpeed = b.effectiveSpeed ?? (doubleTrickRoom ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)
      if (aSpeed === bSpeed) return a.idx - b.idx
      return doubleTrickRoom ? aSpeed - bSpeed : bSpeed - aSpeed
    })
  }, [doubleBoardSlots, doubleTailwindMy, doubleTailwindOpp, doubleTrickRoom, lt, siteLanguage, asyncDataVersion])
  const doubleSpeedBySlot = React.useMemo(() => Object.fromEntries(doubleSpeedOrder.map((entry) => [entry.slot, entry.effectiveSpeed])) as Partial<Record<DoubleBoardSlot, number | null>>, [doubleSpeedOrder])
  const doubleBoardStateCards = React.useMemo(() => {
    const slotOrder: DoubleBoardSlot[] = ['myLeft', 'myRight', 'oppLeft', 'oppRight']
    return slotOrder.map((slot) => {
      const meta = doubleSlotMeta[slot]
      const option = meta.option
      const row = option?.row ?? null
      if (meta.side === 'my' && option && 'member' in option) {
        const key = option.member.key ?? ''
        return {
          slot,
          side: meta.side,
          label: meta.label,
          row,
          name: row ? displayName(row, siteLanguage) : lt('미선택'),
          item: displayItemLabel(visibleChampionsItem(key, option.member.item ?? ''), siteLanguage),
          ability: classifyAbilityForKey(key, option.member.ability).slug ?? option.member.ability,
          moves: (confirmedMovesByKey[key] ?? []).filter(Boolean),
          speed: doubleSpeedBySlot[slot],
          protected: doubleProtectBySlot[slot],
          tailwind: doubleTailwindMy,
        }
      }
      const key = option && 'entry' in option ? option.entry.key ?? '' : ''
      return {
        slot,
        side: meta.side,
        label: meta.label,
        row,
        name: row ? displayName(row, siteLanguage) : lt('미선택'),
        item: displayItemLabel(visibleChampionsItem(key, option && 'entry' in option ? option.entry.item ?? '' : ''), siteLanguage),
        ability: option && 'entry' in option ? classifyAbilityForKey(key, option.entry.ability).slug ?? option.entry.ability : '',
        moves: (option && 'entry' in option ? option.entry.revealedMoves : []).filter(Boolean),
        speed: doubleSpeedBySlot[slot],
        protected: doubleProtectBySlot[slot],
        tailwind: doubleTailwindOpp,
      }
    })
  }, [confirmedMovesByKey, doubleProtectBySlot, doubleSlotMeta, doubleSpeedBySlot, doubleTailwindMy, doubleTailwindOpp, lt, siteLanguage, asyncDataVersion])
  const doubleFriendGuardAvailableOpp = React.useMemo(() => doubleBoardStateCards.some((card) => card.side === 'opp' && card.row && classifyAbilityForKey(card.row.key, card.ability).slug === 'friend-guard'), [doubleBoardStateCards, asyncDataVersion])
  const doubleActionOptionsBySlot = React.useMemo(() => {
    return Object.fromEntries(doubleBoardStateCards.map((card) => [card.slot, card.moves])) as Record<DoubleBoardSlot, string[]>
  }, [doubleBoardStateCards])
  const doubleTargetOptionsBySlot = React.useMemo(() => ({
    myLeft: ['oppLeft', 'oppRight'] as DoubleBoardSlot[],
    myRight: ['oppLeft', 'oppRight'] as DoubleBoardSlot[],
    oppLeft: ['myLeft', 'myRight'] as DoubleBoardSlot[],
    oppRight: ['myLeft', 'myRight'] as DoubleBoardSlot[],
  }), [])
  const doubleActionOrder = React.useMemo(() => {
    const entries = (['myLeft', 'myRight', 'oppLeft', 'oppRight'] as DoubleBoardSlot[]).map((slot, idx) => {
      const meta = doubleSlotMeta[slot]
      const option = meta.option
      const row = option?.row ?? null
      const moves = doubleActionOptionsBySlot[slot] ?? []
      const selectedMove = doubleActionMoveBySlot[slot] && moves.includes(doubleActionMoveBySlot[slot]) ? doubleActionMoveBySlot[slot] : ''
      let key = ''
      let moveOptions: { name: string, type: string | null }[] = []
      if (meta.side === 'my' && option && 'member' in option) {
        key = option.member.key ?? ''
        moveOptions = choicesForPool(movePoolByKey[key])
      } else {
        key = option && 'entry' in option ? option.entry.key ?? '' : ''
        moveOptions = moves.map((name) => ({ name, type: lookupMoveMeta(name)?.type ?? null }))
      }
      const moveMeta = selectedMove ? resolveMoveMeta(selectedMove, moveOptions, movePoolByKey) : null
      return {
        slot,
        idx,
        label: meta.label,
        side: meta.side,
        name: row ? displayName(row, siteLanguage) : lt('미선택'),
        sprite: row?.sprite ?? null,
        selectedMove,
        occupied: Boolean(row),
        priority: selectedMove ? moveMeta?.priority ?? null : 0,
        speed: doubleSpeedBySlot[slot] ?? null,
      }
    })
    return presentDoubleActionOrder(entries, doubleTrickRoom)
  }, [doubleActionMoveBySlot, doubleActionOptionsBySlot, doubleSlotMeta, doubleSpeedBySlot, doubleTrickRoom, lt, movePoolByKey, siteLanguage])
  const doubleFocusedActionTarget = doubleActionTargetBySlot[doubleActionFocusSlot]
  const doubleFocusedActionMeta = doubleSlotMeta[doubleActionFocusSlot]
  const doubleFocusedTargetMeta = doubleSlotMeta[doubleFocusedActionTarget]
  const doubleFocusedActionMove = doubleActionMoveBySlot[doubleActionFocusSlot] || ''
  const doubleActionCards = React.useMemo(() => {
    return (['myLeft', 'myRight', 'oppLeft', 'oppRight'] as DoubleBoardSlot[]).map((slot) => {
      const meta = doubleSlotMeta[slot]
      const card = doubleBoardStateCards.find((entry) => entry.slot === slot)
      const targetOptions = doubleTargetOptionsBySlot[slot] ?? []
      const selectedMove = doubleActionMoveBySlot[slot] || ''
      const selectedSpreadMove = DOUBLE_SPREAD_MOVE_NAMES.has(normalizeSearchText(selectedMove))
      const enemyTargets = targetOptions.filter((targetSlot) => doubleSlotMeta[targetSlot].side !== meta.side)
      const moveRows = (doubleActionOptionsBySlot[slot] ?? []).map((move) => {
        const lookup = lookupMoveMeta(move)
        const priority = lookup?.priority ?? null
        const spreadMove = DOUBLE_SPREAD_MOVE_NAMES.has(normalizeSearchText(move))
        const targetPreview = (targetSlot: DoubleBoardSlot) => {
          const preview = buildDoubleDamageContext(slot, targetSlot, move, spreadMove)
          const previewText = preview?.reason
            ? preview.reason
            : preview?.damage
              ? `${preview.damage.minPct}% ~ ${preview.damage.maxPct}%`
              : lt('계산 대기')
          return {
            targetSlot,
            label: doubleSlotDisplayName(targetSlot),
            selected: selectedMove === move && doubleActionTargetBySlot[slot] === targetSlot,
            previewText,
          }
        }
        return {
          move,
          type: lookup?.type ?? null,
          priority,
          selected: selectedMove === move,
          spreadMove,
          enemyTargets: enemyTargets.map(targetPreview),
        }
      })
      const selectedRow = moveRows.find((entry) => entry.selected) ?? moveRows[0] ?? null
      return {
        slot,
        meta,
        card,
        moveRows,
        enemyTargets: selectedRow?.enemyTargets ?? [],
        spreadMove: selectedRow?.spreadMove ?? selectedSpreadMove,
      }
    })
  }, [buildDoubleDamageContext, doubleActionMoveBySlot, doubleActionOptionsBySlot, doubleActionTargetBySlot, doubleBoardStateCards, doubleSlotDisplayName, doubleSlotMeta, doubleTargetOptionsBySlot, lt])
  const doubleCombinedDamageSummary = React.useMemo(() => {
    const attackers: DoubleBoardSlot[] = ['myLeft', 'myRight']
    const defenders: DoubleBoardSlot[] = ['oppLeft', 'oppRight']
    return defenders.map((defenderSlot) => {
      const contributions = attackers.map((attackerSlot) => {
        const moveName = doubleActionMoveBySlot[attackerSlot] || ''
        const spreadMove = DOUBLE_SPREAD_MOVE_NAMES.has(normalizeSearchText(moveName))
        const selectedTarget = doubleActionTargetBySlot[attackerSlot]
        const hitsDefender = spreadMove ? true : selectedTarget === defenderSlot
        const preview = moveName && hitsDefender ? buildDoubleDamageContext(attackerSlot, defenderSlot, moveName, spreadMove) : null
        return {
          attackerSlot,
          attackerLabel: doubleSlotDisplayName(attackerSlot),
          moveName,
          spreadMove,
          selectedTarget,
          hitsDefender,
          preview,
        }
      })
      const damageEntries = contributions.filter((entry) => entry.preview?.damage)
      const min = damageEntries.reduce((sum, entry) => sum + (entry.preview?.damage?.min ?? 0), 0)
      const max = damageEntries.reduce((sum, entry) => sum + (entry.preview?.damage?.max ?? 0), 0)
      const defenderHp = contributions.find((entry) => entry.preview?.defenderHp)?.preview?.defenderHp ?? null
      const minPct = defenderHp ? Math.round((min / defenderHp) * 1000) / 10 : null
      const maxPct = defenderHp ? Math.round((max / defenderHp) * 1000) / 10 : null
      const blocked = contributions
        .filter((entry) => entry.moveName && entry.hitsDefender && !entry.preview?.damage)
        .map((entry) => ({
          attackerLabel: entry.attackerLabel,
          reason: entry.preview?.reason ?? lt('계산 대기'),
        }))
        .filter((entry) => entry.reason !== lt('변화기는 대미지 계산 대상이 아님'))
      const combinedDamage = damageEntries.length ? { min, max, rolls: [min, max] } : null
      const verdictTone = resolveDamageVerdictTone(combinedDamage, defenderHp)
      return {
        defenderSlot,
        defenderLabel: doubleSlotDisplayName(defenderSlot),
        defenderSprite: doubleSlotMeta[defenderSlot].option?.row?.sprite ?? null,
        contributions,
        hasDamage: damageEntries.length > 0,
        totalText: damageEntries.length ? `${min} ~ ${max}` : '—',
        totalPctText: damageEntries.length && minPct !== null && maxPct !== null ? `${minPct}% ~ ${maxPct}%` : '—',
        verdictTone,
        blocked,
      }
    })
  }, [buildDoubleDamageContext, doubleActionMoveBySlot, doubleSlotDisplayName, doubleSlotMeta, lt])
  React.useEffect(() => {
    if (!doubleFriendGuardAvailableOpp && doubleFriendGuardOpp) setDoubleFriendGuardOpp(false)
  }, [doubleFriendGuardAvailableOpp, doubleFriendGuardOpp])
  React.useEffect(() => {
    ;(['myLeft', 'myRight', 'oppLeft', 'oppRight'] as DoubleBoardSlot[]).forEach((slot) => {
      const options = doubleActionOptionsBySlot[slot] ?? []
      const current = doubleActionMoveBySlot[slot]
      if (!options.length) {
        if (current) setDoubleActionMoveBySlot[slot]('')
        return
      }
      if (!current || !options.includes(current)) setDoubleActionMoveBySlot[slot](options[0])
    })
  }, [doubleActionMoveBySlot, doubleActionOptionsBySlot, setDoubleActionMoveBySlot])
  React.useEffect(() => {
    ;(['myLeft', 'myRight', 'oppLeft', 'oppRight'] as DoubleBoardSlot[]).forEach((slot) => {
      const options = doubleTargetOptionsBySlot[slot] ?? []
      const current = doubleActionTargetBySlot[slot]
      if (!options.includes(current)) setDoubleActionTargetBySlot[slot](options[0])
    })
  }, [doubleActionTargetBySlot, doubleTargetOptionsBySlot, setDoubleActionTargetBySlot])
  React.useEffect(() => {
    if (doubleAttackerSlot !== doubleActionFocusSlot) setDoubleAttackerSlot(doubleActionFocusSlot)
    if (doubleDefenderSlot !== doubleFocusedActionTarget) setDoubleDefenderSlot(doubleFocusedActionTarget)
    if (doubleMoveName !== doubleFocusedActionMove) setDoubleMoveName(doubleFocusedActionMove)
  }, [doubleActionFocusSlot, doubleAttackerSlot, doubleDefenderSlot, doubleFocusedActionMove, doubleFocusedActionTarget, doubleMoveName])
  const setAutocompleteMenuOpen = React.useCallback((id: string) => {
    setAutocompleteHighlight((prev) => (prev?.id === id ? prev : { id, index: 0 }))
  }, [])
  const moveAutocompleteMenuHighlight = React.useCallback((id: string, length: number, direction: -1 | 1) => {
    setAutocompleteHighlight((prev) => ({ id, index: nextAutocompleteIndex(prev?.id === id ? prev.index : -1, length, direction) }))
  }, [])
  const closeAutocompleteMenu = React.useCallback((id?: string) => {
    setAutocompleteHighlight((prev) => (!id || prev?.id === id ? null : prev))
  }, [])

  React.useEffect(() => {
    if (!doubleAttackerMoves.length) {
      if (doubleMoveName) setDoubleMoveName('')
      return
    }
    if (!doubleAttackerMoves.includes(doubleMoveName)) setDoubleMoveName(doubleAttackerMoves[0])
  }, [doubleAttackerMoves, doubleMoveName])

  React.useEffect(() => {
    if (!doubleMoveName) return
    setDoubleSpreadMove(DOUBLE_SPREAD_MOVE_NAMES.has(normalizeSearchText(doubleMoveName)))
  }, [doubleMoveName])

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const siteTitle = lt('포켓몬 챔피언스 배틀 도우미')
    const siteDescription = lt('파티 관리, 상대 엔트리, 스피드 계산, 대미지 계산을 한곳에서 정리하는 포켓몬 챔피언스 배틀 도구')
    const siteImageAlt = lt('포켓몬 챔피언스 배틀 도우미 대표 이미지')
    document.title = siteTitle
    const setNamedMeta = (name: string, content: string) => {
      const target = document.querySelector(`meta[name="${name}"]`)
      if (target) target.setAttribute('content', content)
    }
    const setPropertyMeta = (property: string, content: string) => {
      const target = document.querySelector(`meta[property="${property}"]`)
      if (target) target.setAttribute('content', content)
    }
    setNamedMeta('description', siteDescription)
    setNamedMeta('twitter:title', siteTitle)
    setNamedMeta('twitter:description', siteDescription)
    setPropertyMeta('og:title', siteTitle)
    setPropertyMeta('og:description', siteDescription)
    setPropertyMeta('og:image:alt', siteImageAlt)
  }, [lt])

  React.useEffect(() => {
    const safeSelectedMy = sanitizeSelectedIndex(selectedMy, party.length)
    if (safeSelectedMy !== selectedMy) setSelectedMy(safeSelectedMy)
  }, [party, selectedMy])

  React.useEffect(() => {
    setSampleItemDraft(displayItemLabel(visibleChampionsItem(sampleForge.key, sampleForge.item), siteLanguage))
  }, [sampleForge.key, sampleForge.item, siteLanguage])

  React.useEffect(() => {
    const targetKeys = Array.from(new Set([...party.map((member) => member.key), ...opponents.map((member) => member.key), sampleForge.key, ...sampleDamageTargets.map((member) => member.key)].filter(Boolean)))
    targetKeys.forEach((key) => {
      if (movePoolByKey[key]) return
      setMovePoolByKey((prev) => ({ ...prev, [key]: { status: 'loading', moves: [], moveIds: [], provenance: LEARNSET_SOURCE } }))
      loadFormLearnset(key).then((result) => {
        setMovePoolByKey((prev) => ({ ...prev, [key]: result }))
      }).catch(() => {
        setMovePoolByKey((prev) => ({ ...prev, [key]: { status: 'load-error', moves: [], moveIds: [], provenance: LEARNSET_SOURCE } }))
      })
    })
  }, [party, opponents, sampleForge.key, sampleDamageTargets, movePoolByKey])

  React.useEffect(() => {
    if (typeof window === 'undefined' || !allowRecoveryWrite) return
    const payload: PersistedState = {
      party,
      opponents,
      selectedMy,
      selectedOpp,
      calcSwapSides,
      calcAttackStage,
      calcDefenseStage,
      calcHitCount,
      calcWeather,
      calcTerrain,
      calcBurned,
      calcCritical,
      calcAttackerLowHp,
      calcTargetPoisoned,
      calcDefenderFullHp,
      calcDefenderDisguise,
      calcMovedAfterTarget,
      calcFaintedAllies,
      calcRivalryMode,
      calcParentalBond,
      calcDefenderStatused,
      calcElectromorphosisCharged,
      calcReflect,
      calcLightScreen,
      calcAuroraVeil,
      calcFriendGuard,
      calcTypeChangeStab,
      calcConditionalPowerValues,
      calcOpponentBulkPreset,
      calcOpponentHpEv,
      calcOpponentDefenseEv,
      calcOpponentSpDefenseEv,
      calcOpponentDefenseNature,
      calcOpponentSpDefenseNature,
      calcOpponentOffensePreset,
      calcOpponentAttackEv,
      calcOpponentSpAttackEv,
      calcOpponentAttackNature,
      calcOpponentSpAttackNature,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      activeTab,
      sampleForge,
      sampleLockedMoves,
      savedSamples,
      savedPartyPresets,
      activePartyPresetId,
      sampleWorkbenchTab,
      creatorLinkDrafts,
      sampleSpeedTargets,
      sampleDamageTargets,
      doubleMyLeft,
      doubleMyRight,
      doubleOppLeft,
      doubleOppRight,
      doubleTrickRoom,
      doubleTailwindMy,
      doubleTailwindOpp,
      doubleFriendGuardMy,
      doubleFriendGuardOpp,
      doubleWideGuardMy,
      doubleWideGuardOpp,
      doubleAttackerSlot,
      doubleDefenderSlot,
      doubleSpreadMove,
      doubleMoveName,
      doubleProtectMyLeft,
      doubleProtectMyRight,
      doubleProtectOppLeft,
      doubleProtectOppRight,
      doubleActionMoveMyLeft,
      doubleActionMoveMyRight,
      doubleActionMoveOppLeft,
      doubleActionMoveOppRight,
      doubleActionTargetMyLeft,
      doubleActionTargetMyRight,
      doubleActionTargetOppLeft,
      doubleActionTargetOppRight,
      doubleActionFocusSlot,
    }
    setPersistenceStatus(persistWorkspace(() => window.localStorage, STORAGE_KEY, payload) ? 'saved' : 'failed')
  }, [allowRecoveryWrite, retryPersistence, activePartyPresetId, party, opponents, selectedMy, selectedOpp, calcSwapSides, calcAttackStage, calcDefenseStage, calcHitCount, calcWeather, calcTerrain, calcBurned, calcCritical, calcAttackerLowHp, calcTargetPoisoned, calcDefenderFullHp, calcDefenderDisguise, calcMovedAfterTarget, calcFaintedAllies, calcRivalryMode, calcParentalBond, calcDefenderStatused, calcElectromorphosisCharged, calcReflect, calcLightScreen, calcAuroraVeil, calcFriendGuard, calcTypeChangeStab, calcConditionalPowerValues, calcOpponentBulkPreset, calcOpponentHpEv, calcOpponentDefenseEv, calcOpponentSpDefenseEv, calcOpponentDefenseNature, calcOpponentSpDefenseNature, calcOpponentOffensePreset, calcOpponentAttackEv, calcOpponentSpAttackEv, calcOpponentAttackNature, calcOpponentSpAttackNature, battleNote, confirmedMovesByKey, mainSection, activeTab, sampleForge, sampleLockedMoves, savedSamples, savedPartyPresets, sampleWorkbenchTab, creatorLinkDrafts, sampleSpeedTargets, sampleDamageTargets, doubleMyLeft, doubleMyRight, doubleOppLeft, doubleOppRight, doubleTrickRoom, doubleTailwindMy, doubleTailwindOpp, doubleFriendGuardMy, doubleFriendGuardOpp, doubleWideGuardMy, doubleWideGuardOpp, doubleAttackerSlot, doubleDefenderSlot, doubleSpreadMove, doubleMoveName, doubleProtectMyLeft, doubleProtectMyRight, doubleProtectOppLeft, doubleProtectOppRight, doubleActionMoveMyLeft, doubleActionMoveMyRight, doubleActionMoveOppLeft, doubleActionMoveOppRight, doubleActionTargetMyLeft, doubleActionTargetMyRight, doubleActionTargetOppLeft, doubleActionTargetOppRight, doubleActionFocusSlot])

  React.useEffect(() => {
    const restoreRoute = () => {
      const route = parseViewStateFromUrl()
      if (!route) return
      if (route.mainSection) setMainSection(route.mainSection)
      if (route.speedLineState) {
        const next = mergeSpeedLineRoute(lastSpeedLineRoute.current, { state: route.speedLineState, warnings: route.speedLineWarnings ?? [] })
        lastSpeedLineRoute.current = next
        setSpeedLineState(route.speedLineState)
        setSpeedLineWarnings(next.warnings)
      } else lastSpeedLineRoute.current = null
      if (route.activeTab) setActiveTab(route.activeTab)
      if (route.sampleWorkbenchTab) setSampleWorkbenchTab(route.sampleWorkbenchTab)
      setLibrarySourceId(route.librarySourceId ?? null)
      restoringLibraryRoute.current = route.mainSection === 'sample' && route.sampleWorkbenchTab === 'library'
        ? { sourceId: route.librarySourceId ?? null, language: route.libraryLanguage ?? 'all',
          format: route.libraryFormat ?? 'all', query: route.libraryQuery ?? '', kind: route.libraryContentKind ?? 'party' }
        : null
      setLibraryLanguage(route.libraryLanguage ?? 'all')
      setLibraryFormat(route.libraryFormat ?? 'all')
      setLibraryQuery(route.libraryQuery ?? '')
      setLibraryContentKind(route.libraryContentKind ?? 'party')
      if (route.mainSection === 'sample' && route.sampleWorkbenchTab === 'library' && !route.librarySourceId) {
        const scroll = window.history.state?.libraryScroll
        if (typeof scroll === 'number' && Number.isFinite(scroll)) libraryScrollRef.current = scroll
      }
      restoringDexRoute.current = route.mainSection === 'dex'
        ? { mode: route.dexSearchMode ?? 'pokemon', query: route.dexUnifiedSearch ?? route.dexSearch ?? '', selection: route.dexSelectedValue ?? null }
        : null
      if (route.dexSearchMode) setDexSearchMode(route.dexSearchMode)
      setDexSearch(route.dexSearch ?? route.dexUnifiedSearch ?? '')
      setDexUnifiedSearch(route.dexUnifiedSearch ?? route.dexSearch ?? '')
      setDexUnifiedSearchDraft(route.dexUnifiedSearch ?? route.dexSearch ?? '')
      setDexSelectedValue(route.dexSelectedValue ?? null)
      pendingDexScrollRestore.current = null
      if (route.mainSection === 'dex' && !route.dexSelectedValue) {
        const scope = dexPageScope(route.dexSearchMode ?? 'pokemon', normalizeSearchText(route.dexUnifiedSearch ?? route.dexSearch ?? ''))
        const savedCount = window.history.state?.dexListCount
        const savedScroll = window.history.state?.dexListScroll
        if (window.history.state?.dexListScope === scope && typeof savedCount === 'number' && Number.isFinite(savedCount) && savedCount >= DEX_PAGE_SIZE) {
          setDexPagination({ scope, count: savedCount })
          if (typeof savedScroll === 'number' && Number.isFinite(savedScroll) && savedScroll >= 0) {
            pendingDexScrollRestore.current = { scope, count: savedCount, y: savedScroll }
          }
        }
      }
      if (route.selectedMy !== undefined) setSelectedMy(sanitizeSelectedIndex(route.selectedMy, party.length))
      if (route.selectedOpp !== undefined) setSelectedOpp(sanitizeSelectedIndex(route.selectedOpp, opponents.length))
    }
    window.addEventListener('hashchange', restoreRoute)
    window.addEventListener('popstate', restoreRoute)
    return () => { window.removeEventListener('hashchange', restoreRoute); window.removeEventListener('popstate', restoreRoute) }
  }, [party.length, opponents.length])

  React.useEffect(() => {
    const restoring = restoringDexRoute.current
    if (restoring && mainSection === 'dex') {
      if (dexSearchMode !== restoring.mode || dexUnifiedSearchDraft !== restoring.query
        || dexUnifiedSearch !== restoring.query || deferredDexSearch !== restoring.query
        || deferredDexUnifiedSearch !== restoring.query || dexSelectedValue !== restoring.selection) return
      restoringDexRoute.current = null
    }
    const restoringLibrary = restoringLibraryRoute.current
    if (restoringLibrary && mainSection === 'sample') {
      if (sampleWorkbenchTab !== 'library' || librarySourceId !== restoringLibrary.sourceId
        || libraryLanguage !== restoringLibrary.language || libraryFormat !== restoringLibrary.format
        || libraryQuery !== restoringLibrary.query || libraryContentKind !== restoringLibrary.kind) return
      restoringLibraryRoute.current = null
    }
    syncViewStateToUrl({
      mainSection,
      activeTab: mainSection === 'single' || mainSection === 'double' ? activeTab : undefined,
      sampleWorkbenchTab: mainSection === 'sample' ? sampleWorkbenchTab : undefined,
      librarySourceId: mainSection === 'sample' && sampleWorkbenchTab === 'library' ? librarySourceId : null,
      libraryLanguage, libraryFormat, libraryQuery, libraryContentKind,
      dexSearchMode: mainSection === 'dex' ? dexSearchMode : undefined,
      dexSearch: mainSection === 'dex' ? deferredDexSearch.trim() : undefined,
      dexUnifiedSearch: mainSection === 'dex' ? deferredDexUnifiedSearch.trim() : undefined,
      dexSelectedValue: mainSection === 'dex' ? dexSelectedValue ?? undefined : undefined,
      selectedMy,
      selectedOpp,
      speedLineState: mainSection === 'speedLine' ? speedLineState : undefined,
    })
  }, [mainSection, activeTab, sampleWorkbenchTab, librarySourceId, libraryLanguage, libraryFormat, libraryQuery, libraryContentKind, dexSearchMode, dexUnifiedSearchDraft, dexUnifiedSearch, deferredDexSearch, deferredDexUnifiedSearch, dexSelectedValue, selectedMy, selectedOpp, speedLineState])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [mainSection, activeTab, sampleWorkbenchTab, dexSearchMode])
  React.useEffect(() => {
    if (mainSection !== 'party') return
    const route = new URL(window.location.hash.replace(/^#/, '') || '/party', window.location.href)
    if (route.pathname !== '/party' || route.searchParams.get('edit') !== String(selectedMy)) return
    const target = document.getElementById(`party-slot-${selectedMy}`)
    const input = target?.querySelector<HTMLInputElement>(`#party-species-${selectedMy}`)
    if (input) input.scrollIntoView?.({ block: 'center' })
    else target?.scrollIntoView?.({ block: 'start' })
    input?.focus({ preventScroll: true })
  }, [mainSection, selectedMy])
  React.useEffect(() => {
    const pending = pendingDexScrollRestore.current
    if (!pending || !dexScrollRestoreReady(pending, { section: mainSection, selection: dexSelectedValue,
      queryPending: dexQueryPending, scope: dexScope, visibleCount: dexCount, totalCount: dexBrowseCards.length })) return
    let active = true
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (!active || pendingDexScrollRestore.current !== pending) return
        window.scrollTo({ top: pending.y, behavior: 'auto' })
        pendingDexScrollRestore.current = null
      })
    })
    return () => { active = false; cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [mainSection, dexSelectedValue, dexQueryPending, dexScope, dexCount, dexBrowseCards.length])

  React.useEffect(() => {
    if (librarySourceId) window.scrollTo({ top: 0, behavior: 'auto' })
    else if (mainSection === 'sample' && sampleWorkbenchTab === 'library' && libraryScrollRef.current !== null) {
      const previous = libraryScrollRef.current
      libraryScrollRef.current = null
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: previous, behavior: 'auto' })))
    }
  }, [librarySourceId, mainSection, sampleWorkbenchTab])

  const myMember = party[selectedMy] ?? party[0]
  const oppMember = opponents[selectedOpp] ?? opponents[0]
  const sampleRow = indexByKey.get(sampleForge.key) ?? rows[0]

  const sampleMagicCandidate = sampleRow ? findMagicNumberCandidate(sampleRow, sampleForge) : null
  const calcMyKey = resolveCalcKeyWithMega(myMember.key, calcMyMegaKey)
  const calcOppKey = oppMember.key ? resolveCalcKeyWithMega(oppMember.key, calcOppMegaKey) : ''
  const myRow = indexByKey.get(calcMyKey) ?? rows[0]
  const oppRow = calcOppKey ? (indexByKey.get(calcOppKey) ?? rows[0]) : null
  const oppWeightKg = oppRow ? (typeof oppRow.weightKg === 'number' ? oppRow.weightKg : weightByKey[oppRow.key] ?? null) : null
  const opponentBulkState = React.useMemo<OpponentBulkState>(() => ({
    hpEv: calcOpponentHpEv,
    defenseEv: calcOpponentDefenseEv,
    spDefenseEv: calcOpponentSpDefenseEv,
    defenseNature: calcOpponentDefenseNature,
    spDefenseNature: calcOpponentSpDefenseNature,
  }), [calcOpponentHpEv, calcOpponentDefenseEv, calcOpponentSpDefenseEv, calcOpponentDefenseNature, calcOpponentSpDefenseNature])
  const opponentOffenseState = React.useMemo<OpponentOffenseState>(() => ({
    attackEv: calcOpponentAttackEv,
    spAttackEv: calcOpponentSpAttackEv,
    attackNature: calcOpponentAttackNature,
    spAttackNature: calcOpponentSpAttackNature,
  }), [calcOpponentAttackEv, calcOpponentSpAttackEv, calcOpponentAttackNature, calcOpponentSpAttackNature])
  const myBattleStats = buildPartyBattleStats(myRow, myMember)
  const oppBattleStats = oppRow ? buildOpponentBattleStats(oppRow, opponentBulkState, opponentOffenseState) : null
  const myMegaCandidates = megaCandidateKeysForBase(megaBaseKey(myMember.key))
  const oppMegaCandidates = megaCandidateKeysForBase(megaBaseKey(oppMember.key))

  const calcTargetWeightRow = calcSwapSides ? myRow : oppRow
  const calcTargetWeightKg = calcSwapSides
    ? (typeof myRow.weightKg === 'number' ? myRow.weightKg : weightByKey[myRow.key] ?? null)
    : oppWeightKg

  React.useEffect(() => {
    if (!calcTargetWeightRow?.key || typeof calcTargetWeightRow.id !== 'number') return
    if (typeof calcTargetWeightKg === 'number') return
    let cancelled = false
    fetchPokemonWeightKg(calcTargetWeightRow.id)
      .then((weightKg) => {
        if (cancelled) return
        setWeightByKey((prev) => prev[calcTargetWeightRow.key] === weightKg ? prev : { ...prev, [calcTargetWeightRow.key]: weightKg })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [calcTargetWeightRow, calcTargetWeightKg])

  React.useEffect(() => {
    const megaCandidates = megaCandidateKeysForBase(megaBaseKey(myMember.key))
    setCalcMyMegaKey(myMember.key.startsWith('mega-') ? myMember.key : null)
    if (myMember.key.startsWith('mega-') && !megaCandidates.includes(myMember.key)) setCalcMyMegaKey(megaCandidates[0] ?? null)
    if (!megaCandidates.length) setCalcMyMegaKey(null)
  }, [myMember.key])

  React.useEffect(() => {
    const megaCandidates = megaCandidateKeysForBase(megaBaseKey(oppMember.key))
    setCalcOppMegaKey(oppMember.key.startsWith('mega-') ? oppMember.key : null)
    if (oppMember.key.startsWith('mega-') && !megaCandidates.includes(oppMember.key)) setCalcOppMegaKey(megaCandidates[0] ?? null)
    if (!megaCandidates.length) setCalcOppMegaKey(null)
  }, [oppMember.key])

  React.useEffect(() => {
    const moves = (calcSwapSides ? oppMember.revealedMoves : (confirmedMovesByKey[myMember.key] ?? [])).filter(Boolean)
    const activeKey = calcSwapSides ? oppMember.key : myMember.key
    if (!moves.length) {
      if (selectedDamageMove !== null) setSelectedDamageMove(null)
      return
    }
    if (!selectedDamageMove || selectedDamageMove.key !== activeKey || !moves.includes(selectedDamageMove.move)) {
      setSelectedDamageMove({ key: activeKey, move: moves[0] })
    }
  }, [calcSwapSides, confirmedMovesByKey, myMember.key, oppMember.key, oppMember.revealedMoves, selectedDamageMove])


  const mySpeed = partySpeedValue(myRow, myMember)
  const mySpeedAbilityLine = myRow ? mySpeedAbilityMarker(myRow, myMember, siteLanguage, calcWeather, calcTerrain) : null
  const oppSpeed = oppRow ? opponentSpeedValue(oppRow, oppMember) : null
  const pickedOpponents = opponents.filter((member) => member.picked)
  // Assumptions belong to this screen only; an opponent slot/form switch starts fresh.
  const singleSpeedIdentity = `${selectedOpp}:${oppMember.key}:${oppRow?.key ?? ''}`
  const singleSpeedOwnIdentity = `${selectedMy}:${myMember.key}:${myRow.key}`
  React.useEffect(() => {
    setSingleSpeedAssumption(null)
  }, [singleSpeedIdentity, mainSection, activeTab])
  React.useEffect(() => {
    setSingleSpeedOwnScarf(null)
  }, [singleSpeedOwnIdentity, mainSection, activeTab])
  const singleSpeedOwnScarf = singleSpeedOwnScarfChoice?.identity === singleSpeedOwnIdentity ? singleSpeedOwnScarfChoice.scarf : isChoiceScarfItem(myMember.item)
  const singleSpeedNature: SingleSpeedNature = singleSpeedAssumption?.identity === singleSpeedIdentity ? singleSpeedAssumption.nature : 'fast'
  const singleSpeedItem: SingleSpeedItem = singleSpeedAssumption?.identity === singleSpeedIdentity ? singleSpeedAssumption.item : 'normal'
  const singleSpeedAbilityActive = singleSpeedAssumption?.identity === singleSpeedIdentity ? singleSpeedAssumption.abilityActive : false
  const singleSpeedAbility = oppRow ? speedAbilityCandidate(oppRow, siteLanguage) : null
  const singleItemError = heldItemError(myMember.key, myMember.item, siteLanguage) || heldItemError(oppMember.key, oppMember.item, siteLanguage) || heldAbilityError(myMember.key, myMember.ability, siteLanguage) || heldAbilityError(oppMember.key, oppMember.ability, siteLanguage)
  const singleSpeedComparison = oppRow && !singleItemError ? compareSingleSpeed(
    { row: myRow, effort: myMember.evs.speed, nature: natureMultiplier(myMember.config.nature, 'speed'), stage: myMember.config.speedStage, scarf: singleSpeedOwnScarf },
    oppRow, singleSpeedNature, singleSpeedItem, oppMember.speedStage,
    singleSpeedAbility ? { slug: singleSpeedAbility.slug, active: singleSpeedAbilityActive } : undefined,
  ) : null
  const speedAxisMin = 40
  const speedAxisMax = Math.max(340, (singleSpeedComparison?.targetSpeed ?? 0) + 20, (singleSpeedComparison?.currentSpeed ?? 0) + 20)
  const speedAxisTicks = [40, 100, 160, 220, 280, 340].filter(tick => tick <= speedAxisMax)
  const speedAxisTop = (speed: number) => {
    const clamped = Math.max(speedAxisMin, Math.min(speedAxisMax, speed))
    const ratio = (clamped - speedAxisMin) / (speedAxisMax - speedAxisMin)
    return 100 - (ratio * 100)
  }
  const speedBandLabelSideClass = (idx: number, total: number, left: number) => {
    if (total <= 2) return left > 70 ? 'label-left' : 'label-right'
    if (idx === total - 1) return 'label-left'
    if (idx % 2 === 1) return 'label-left'
    return 'label-right'
  }
  const myMoveSet = sampleMoves.find((entry) => entry.key === myMember.key)
  const myMovePool = movePoolByKey[myMember.key]
  const myMoveOptions = choicesForPool(myMovePool)
  const oppMoveSet = sampleMoves.find((entry) => entry.key === oppMember.key)
  const oppMovePool = movePoolByKey[oppMember.key]
  const oppMoveOptions = choicesForPool(oppMovePool)
  const revealedMoveCandidates = (query: string) => oppMovePool?.status === 'ready-verified' && oppMember.revealedMoves.length < 4 && query.trim()
    ? filterMoveOptions(query, oppMoveOptions).filter(option => !oppMember.revealedMoves.includes(option.name)).slice(0, 8)
    : []
  const oppTopSuggestedMoves = usageTopMovesForKey(oppMember.key)
  const myCalcAbility = calcMyKey === myMember.key ? myMember.ability : defaultAbilityForKey(calcMyKey)
  const oppCalcAbility = calcOppKey === oppMember.key ? oppMember.ability : defaultAbilityForKey(calcOppKey)
  const selectedMyAbility = resolveSelectedAbility(myRow, myCalcAbility, siteLanguage)
  const selectedOppAbility = oppRow ? resolveSelectedAbility(oppRow, oppCalcAbility, siteLanguage) : null
  const attackFromOpponent = calcSwapSides && Boolean(oppRow)
  const attackerRow = attackFromOpponent ? oppRow : myRow
  const defenderRow = attackFromOpponent ? myRow : oppRow
  const attackerMemberKey = attackFromOpponent ? oppMember.key : myMember.key
  const attackerAbilityValue = attackFromOpponent
    ? (selectedOppAbility?.slug ?? '')
    : (selectedMyAbility?.slug ?? '')
  const defenderAbilityValue = attackFromOpponent
    ? (selectedMyAbility?.slug ?? '')
    : (selectedOppAbility?.slug ?? '')
  const selectedAttackAbility = attackFromOpponent ? selectedOppAbility : selectedMyAbility
  const selectedDefenseAbility = attackFromOpponent ? selectedMyAbility : selectedOppAbility
  const attackerBattleStats = attackFromOpponent
    ? (oppRow ? buildOpponentBattleStats(attackingFormRow(oppRow, attackerAbilityValue), opponentBulkState, opponentOffenseState) : null)
    : buildPartyBattleStats(attackingFormRow(myRow, attackerAbilityValue), myMember)
  const defenderBattleStats = attackFromOpponent ? myBattleStats : oppBattleStats
  const myRegisteredDamageMoves = (confirmedMovesByKey[myMember.key] ?? []).filter(Boolean)
  const opponentRegisteredDamageMoves = oppMember.revealedMoves.filter(Boolean)
  const registeredDamageMoves = (attackFromOpponent ? opponentRegisteredDamageMoves : myRegisteredDamageMoves).filter(Boolean)
  const attackerMoveOptions = attackFromOpponent ? oppMoveOptions : myMoveOptions
  const defenderWeightKg = attackFromOpponent
    ? (typeof myRow.weightKg === 'number' ? myRow.weightKg : weightByKey[myRow.key] ?? null)
    : oppWeightKg
  const activeDamageMove = registeredDamageMoves.find((move) => move === selectedDamageMove?.move && attackerMemberKey === selectedDamageMove?.key) ?? registeredDamageMoves[0] ?? ''
  const activeDamageMoveBaseMeta = resolveMoveMeta(activeDamageMove, attackerMoveOptions, movePoolByKey)
  const activeDamageMoveHitOptions = multiHitOptions(activeDamageMove)
  const activeDamageMoveHitCount = activeDamageMoveHitOptions?.includes(calcHitCount) ? calcHitCount : (activeDamageMoveHitOptions?.[0] ?? null)
  const activeDamageMoveRule = activeDamageMove ? CONDITIONAL_MOVE_POWER_RULES[activeDamageMove] ?? null : null
  const activeDamageMoveConditionValue = activeDamageMoveRule
    ? normalizeConditionalPowerValue(
        activeDamageMoveRule,
        activeDamageMove === '객기' && calcBurned
          ? true
          : (calcConditionalPowerValues[activeDamageMove] ?? activeDamageMoveRule.defaultValue),
      )
    : null
  const activeDamageMoveMeta = applyConditionalMovePower(
    activeDamageMove,
    applyTargetWeightMovePower(
      activeDamageMove,
      resolveAbilityAdjustedMoveMeta(
        activeDamageMove,
        resolveMultiHitMeta(activeDamageMove, activeDamageMoveBaseMeta, activeDamageMoveHitCount, attackerAbilityValue),
        attackerAbilityValue,
        calcWeather,
      ),
      defenderWeightKg,
    ),
    activeDamageMoveConditionValue,
  )
  const activeDamageMoveHitSummary = multiHitSummary(activeDamageMove, activeDamageMoveMeta, activeDamageMoveHitCount)
  const activeDamageMoveBaseType = activeDamageMoveBaseMeta?.type ?? null
  const activeDamageMoveType = activeDamageMoveMeta?.type ?? null
  const activeDamageMoveCategory = activeDamageMoveMeta?.category === 'physical' || activeDamageMoveMeta?.category === 'special' ? activeDamageMoveMeta.category : null
  const activeDamageMovePower = typeof activeDamageMoveMeta?.power === 'number' ? activeDamageMoveMeta.power : null
  const activeDamageMoveAlwaysCrit = Boolean(activeDamageMoveMeta?.alwaysCrit)

  React.useEffect(() => {
    if (!activeDamageMoveHitOptions?.length) return
    setCalcHitCount((prev) => (activeDamageMoveHitOptions.includes(prev) ? prev : activeDamageMoveHitOptions[0]))
  }, [activeDamageMove, activeDamageMoveHitOptions])
  const attackerAbilitySlug = attackerAbilityValue
  const defenderAbilitySlug = defenderAbilityValue
  const autoWeatherFromAbilities = React.useMemo(() => deriveAutoWeatherFromAbilities(attackerAbilitySlug, defenderAbilitySlug), [attackerAbilitySlug, defenderAbilitySlug])
  const autoTerrainFromAbilities = React.useMemo(() => deriveAutoTerrainFromAbilities(attackerAbilitySlug, defenderAbilitySlug), [attackerAbilitySlug, defenderAbilitySlug])
  const autoWeatherRef = React.useRef<DamageWeather>('none')
  React.useEffect(() => {
    const previousAutoWeather = autoWeatherRef.current
    if (autoWeatherFromAbilities === 'none') {
      if (calcWeather === previousAutoWeather && previousAutoWeather !== 'none') setCalcWeather('none')
      autoWeatherRef.current = 'none'
      return
    }
    if (calcWeather === 'none' || calcWeather === previousAutoWeather) {
      if (calcWeather !== autoWeatherFromAbilities) setCalcWeather(autoWeatherFromAbilities)
      autoWeatherRef.current = autoWeatherFromAbilities
      return
    }
    autoWeatherRef.current = autoWeatherFromAbilities
  }, [autoWeatherFromAbilities, calcWeather])
  const autoTerrainRef = React.useRef<DamageTerrain>('none')
  React.useEffect(() => {
    const previousAutoTerrain = autoTerrainRef.current
    if (autoTerrainFromAbilities === 'none') {
      if (calcTerrain === previousAutoTerrain && previousAutoTerrain !== 'none') setCalcTerrain('none')
      autoTerrainRef.current = 'none'
      return
    }
    if (calcTerrain === 'none' || calcTerrain === previousAutoTerrain) {
      if (calcTerrain !== autoTerrainFromAbilities) setCalcTerrain(autoTerrainFromAbilities)
      autoTerrainRef.current = autoTerrainFromAbilities
      return
    }
    autoTerrainRef.current = autoTerrainFromAbilities
  }, [autoTerrainFromAbilities, calcTerrain])
  const effectiveAttackerTypes = attackerRow ? resolveAbilityAdjustedTypes(attackerRow.types, attackerAbilitySlug, calcWeather, calcTerrain) : []
  const effectiveDefenderTypes = defenderRow ? resolveAbilityAdjustedTypes(defenderRow.types, defenderAbilitySlug, calcWeather, calcTerrain) : []
  const usesTypeChangeStabAbility = ['libero', 'protean', '변환자재'].includes(attackerAbilitySlug)
  const showAttackerLowHpToggle = ['blaze', 'torrent', 'overgrow', 'swarm'].includes(attackerAbilitySlug)
  const showTargetPoisonedToggle = attackerAbilitySlug === 'merciless'
  const showMovedAfterTargetToggle = attackerAbilitySlug === 'analytic'
  const showFaintedAlliesInput = attackerAbilitySlug === 'supreme-overlord'
  const showRivalryModeInput = attackerAbilitySlug === 'rivalry'
  const showParentalBondToggle = attackerAbilitySlug === 'parental-bond'
  const showElectromorphosisToggle = attackerAbilitySlug === 'electromorphosis'
  const showDefenderStatusedToggle = defenderAbilitySlug === 'marvel-scale'
  const showDefenderFullHpToggle = ['multiscale', 'shadow-shield'].includes(defenderAbilitySlug)
  const showDefenderDisguiseToggle = defenderAbilitySlug === 'disguise' || defenderAbilitySlug === '탈'
  const hasContextualOffenseControls = Boolean(
    activeDamageMoveHitOptions?.length
    || activeDamageMoveRule
    || usesTypeChangeStabAbility
    || attackFromOpponent
    || showAttackerLowHpToggle
    || showTargetPoisonedToggle
    || showMovedAfterTargetToggle
    || showDefenderStatusedToggle
    || showFaintedAlliesInput
    || showRivalryModeInput
    || showParentalBondToggle
    || showElectromorphosisToggle
  )
  React.useEffect(() => {
    if (showDefenderDisguiseToggle) {
      setCalcDefenderDisguise(true)
    }
  }, [showDefenderDisguiseToggle])
  const autoStab = resolveStabMultiplier(effectiveAttackerTypes, activeDamageMoveType, attackerAbilitySlug, calcTypeChangeStab)
  const autoEffectiveness = activeDamageMoveType && defenderRow ? abilityAdjustedTypeEffectiveness(activeDamageMoveType, effectiveDefenderTypes, defenderAbilitySlug, attackerAbilitySlug) : 1
  const setActiveDamageMoveConditionValue = (value: ConditionalPowerValue) => {
    if (!activeDamageMoveRule || !activeDamageMove) return
    const normalized = normalizeConditionalPowerValue(activeDamageMoveRule, value)
    setCalcConditionalPowerValues((prev) => ({ ...prev, [activeDamageMove]: normalized }))
  }
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
      return { ...prev, [key]: normalizeMoveSlots(current) }
    })
  }
  const clearConfirmedMoveSlot = (key: string, slotIdx: number) => {
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      while (current.length < 4) current.push('')
      current[slotIdx] = ''
      return { ...prev, [key]: normalizeMoveSlots(current) }
    })
  }
  const shiftConfirmedMoveSlot = (key: string, slotIdx: number, direction: -1 | 1) => {
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      while (current.length < 4) current.push('')
      const targetIdx = slotIdx + direction
      if (targetIdx < 0 || targetIdx >= 4) return prev
      ;[current[slotIdx], current[targetIdx]] = [current[targetIdx], current[slotIdx]]
      return { ...prev, [key]: normalizeMoveSlots(current) }
    })
    const targetIdx = slotIdx + direction
    if (targetIdx >= 0 && targetIdx < 4) setActiveMoveField({ key, slotIdx: targetIdx, scope: 'sample' })
  }
  const commitTopMoveOption = (key: string, slotIdx: number, rawQuery: string, options: MoveOption[]) => {
    const top = filterMoveOptions(rawQuery, options)[0]
    if (!top) return false
    setConfirmedMoveSlot(key, slotIdx, top.name)
    return true
  }
  const applyMoveToSlot = (key: string, move: string, preferredSlotIdx?: number) => {
    const current = confirmedMovesByKey[key] ?? []
    const slotIdx = preferredSlotIdx ?? (current.indexOf(move) >= 0 ? current.indexOf(move) : Math.min(current.length, 3))
    const accepted = resolveEligibleMoveInput(move, movePoolByKey[key])
    if (!accepted) {
      setMoveCommitNotice({ key, slotIdx, scope: 'party' })
      return
    }
    setMoveCommitNotice(null)
    move = accepted
    setConfirmedMovesByKey((prev) => {
      const current = [...(prev[key] ?? [])]
      const existingIdx = current.indexOf(move)
      if (existingIdx >= 0 && preferredSlotIdx === undefined) {
        current.splice(existingIdx, 1)
        return { ...prev, [key]: current }
      }
      if (preferredSlotIdx !== undefined) {
        while (current.length < 4) current.push('')
        if (existingIdx >= 0) current[existingIdx] = ''
        current[preferredSlotIdx] = move
        return { ...prev, [key]: normalizeMoveSlots(current) }
      }
      if (current.length < 4) return { ...prev, [key]: [...current, move] }
      current[3] = move
      return { ...prev, [key]: current }
    })
  }
  const selectMoveOption = (key: string, slotIdx: number, moveName: string) => {
    const accepted = resolveEligibleMoveInput(moveName, movePoolByKey[key])
    if (accepted) setConfirmedMoveSlot(key, slotIdx, accepted)
    setMoveInputDraft(null)
    setMoveCommitNotice(accepted ? null : { key, slotIdx, scope: 'party' })
    setActiveMoveField(null)
  }
  const commitEditorMove = (raw: string, previous: string, pool: SharedPoolState | undefined, key: string, slotIdx: number, scope: 'party' | 'sample') => {
    const accepted = commitRecordedMoveInput(raw, previous, pool)
    if (accepted !== previous) {
      if (scope === 'party') setConfirmedMoveSlot(key, slotIdx, accepted)
      else setSampleLockedMoves(prev => {
        const next = [...prev]
        while (next.length < 4) next.push('')
        next[slotIdx] = accepted
        return normalizeMoveSlots(next)
      })
    }
    setMoveCommitNotice(raw !== previous && accepted === previous ? { key, slotIdx, scope } : null)
    setMoveInputDraft(null)
  }
  const selectSpecies = (side: 'party' | 'opponent' | 'sample', idx: number, key: string) => {
    if (side === 'party') {
      selectPartySpecies(idx, key)
    } else if (side === 'opponent') {
      selectOpponentSpecies(idx, key)
    } else {
      if (key === sampleForge.key) {
        setSampleSearch(searchDisplayLabel(key, siteLanguage))
        return
      }
      setSampleTuningModalOpen(false)
      setSampleForge((prev) => ({ ...prev, key, ability: defaultAbilityForKey(key), item: itemForSpeciesSelection(key, prev.item), config: { ...prev.config, nature: defaultNatureForKey(key) } }))
      setSampleLockedMoves(confirmedMovesByKey[key] ?? [])
      setSampleItemDraft(displayItemLabel(itemForSpeciesSelection(key, sampleForge.item), siteLanguage))
      setSampleSearch(searchDisplayLabel(key, siteLanguage))
    }
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
  const effectiveCalcMode = activeDamageMoveCategory ?? 'special'
  const effectiveMovePower = activeDamageMovePower ?? 0
  const damageModifiers = singleItemError ? null : resolveDamageModifiers({
    attackerAbility: attackerAbilitySlug,
    attackerTypes: effectiveAttackerTypes,
    attackerItem: attackFromOpponent ? oppMember.item : myMember.item,
    defenderAbility: defenderAbilitySlug,
    defenderKey: attackFromOpponent ? myMember.key : oppMember.key,
    defenderItem: attackFromOpponent ? myMember.item : oppMember.item,
    moveName: activeDamageMove,
    moveMeta: activeDamageMoveMeta,
    baseMoveType: activeDamageMoveBaseType,
    moveType: activeDamageMoveType,
    movePower: effectiveMovePower,
    mode: effectiveCalcMode,
    effectiveness: activeDamageMoveType ? autoEffectiveness : effectiveness,
    attackStage: calcAttackStage,
    defenseStage: calcDefenseStage,
    defenderTypes: effectiveDefenderTypes,
    burned: calcBurned,
    attackerLowHp: calcAttackerLowHp,
    targetPoisoned: calcTargetPoisoned,
    defenderFullHp: calcDefenderFullHp,
    disguiseActive: calcDefenderDisguise,
    movedAfterTarget: calcMovedAfterTarget,
    faintedAllies: calcFaintedAllies,
    rivalryMode: calcRivalryMode,
    parentalBond: calcParentalBond,
    defenderStatused: calcDefenderStatused,
    electromorphosisCharged: calcElectromorphosisCharged,
    critical: calcCritical,
    weather: calcWeather,
    terrain: calcTerrain,
    reflect: calcReflect,
    lightScreen: calcLightScreen,
    auroraVeil: calcAuroraVeil,
    friendGuard: false,
  })
  const damageMovePreviews = registeredDamageMoves.map((moveName) => {
    if (singleItemError) return { moveName, moveType: null, damage: null, verdict: null }
    const baseMeta = resolveMoveMeta(moveName, attackerMoveOptions, movePoolByKey)
    const hitOptions = multiHitOptions(moveName)
    const hitCount = moveName === activeDamageMove && hitOptions?.includes(calcHitCount)
      ? calcHitCount
      : (hitOptions?.[0] ?? null)
    const rule = CONDITIONAL_MOVE_POWER_RULES[moveName] ?? null
    const conditionValue = rule
      ? normalizeConditionalPowerValue(
          rule,
          moveName === '객기' && calcBurned
            ? true
            : (calcConditionalPowerValues[moveName] ?? rule.defaultValue),
        )
      : null
    const moveMeta = applyConditionalMovePower(
      moveName,
      applyTargetWeightMovePower(
        moveName,
        resolveAbilityAdjustedMoveMeta(
          moveName,
          resolveMultiHitMeta(moveName, baseMeta, hitCount, attackerAbilityValue),
          attackerAbilityValue,
          calcWeather,
        ),
        defenderWeightKg,
      ),
      conditionValue,
    )
    const moveType = moveMeta?.type ?? null
    const moveCategory = moveMeta?.category === 'physical' || moveMeta?.category === 'special' ? moveMeta.category : null
    const movePower = typeof moveMeta?.power === 'number' ? moveMeta.power : null
    if (!attackerBattleStats || !defenderBattleStats || !defenderRow || !moveCategory || movePower === null || moveMeta?.category === 'status') {
      return { moveName, moveType, damage: null, verdict: null }
    }
    const moveEffectiveness = moveType ? abilityAdjustedTypeEffectiveness(moveType, effectiveDefenderTypes, defenderAbilitySlug, attackerAbilitySlug) : effectiveness
    const modifiers = resolveDamageModifiers({
      attackerAbility: attackerAbilitySlug,
      attackerTypes: effectiveAttackerTypes,
      attackerItem: attackFromOpponent ? oppMember.item : myMember.item,
      defenderAbility: defenderAbilitySlug,
      defenderKey: attackFromOpponent ? myMember.key : oppMember.key,
      defenderItem: attackFromOpponent ? myMember.item : oppMember.item,
      moveName,
      moveMeta,
      baseMoveType: baseMeta?.type ?? null,
      moveType,
      movePower,
      mode: moveCategory,
      effectiveness: moveEffectiveness,
      attackStage: calcAttackStage,
      defenseStage: calcDefenseStage,
      defenderTypes: effectiveDefenderTypes,
      burned: calcBurned,
      attackerLowHp: calcAttackerLowHp,
      targetPoisoned: calcTargetPoisoned,
      defenderFullHp: calcDefenderFullHp,
      disguiseActive: calcDefenderDisguise,
      movedAfterTarget: calcMovedAfterTarget,
      faintedAllies: calcFaintedAllies,
      rivalryMode: calcRivalryMode,
      parentalBond: calcParentalBond,
      defenderStatused: calcDefenderStatused,
      electromorphosisCharged: calcElectromorphosisCharged,
      critical: calcCritical,
      weather: calcWeather,
      terrain: calcTerrain,
      reflect: calcReflect,
      lightScreen: calcLightScreen,
      auroraVeil: calcAuroraVeil,
      friendGuard: false,
    })
    const previewDamage = calcDamage(
      attackerBattleStats,
      defenderBattleStats,
      movePower,
      moveCategory,
      moveType ? resolveStabMultiplier(effectiveAttackerTypes, moveType, attackerAbilitySlug, calcTypeChangeStab) : stab,
      modifiers.effectiveness,
      moveMeta,
      modifiers,
    )
    if (!previewDamage) return { moveName, moveType, damage: null, verdict: null }
    return {
      moveName,
      moveType,
      damage: previewDamage,
      verdict: resolveDamageVerdict(previewDamage, defenderBattleStats.hp, siteLanguage),
    }
  })
  const damageMovePreviewByName = new Map(damageMovePreviews.map((preview) => [preview.moveName, preview]))
  const activeFieldConditionLabels = [
    calcWeather !== 'none' ? lt(calcWeather === 'sun' ? '쾌청' : calcWeather === 'rain' ? '비' : calcWeather === 'sand' ? '모래바람' : '싸라기눈') : null,
    calcTerrain !== 'none' ? lt(calcTerrain === 'electric' ? '일렉트릭필드' : calcTerrain === 'grassy' ? '그래스필드' : calcTerrain === 'psychic' ? '사이코필드' : '미스트필드') : null,
    calcReflect ? lt('리플렉터') : null,
    calcLightScreen ? lt('빛의장막') : null,
    calcAuroraVeil ? lt('오로라베일') : null,
  ].filter((value): value is string => Boolean(value))
  const applyOpponentBulkPresetSelection = (preset: OpponentBulkPreset) => {
    setCalcOpponentBulkPreset(preset)
    if (preset === 'custom') return
    const next = opponentBulkStateFromPreset(preset)
    setCalcOpponentHpEv(next.hpEv)
    setCalcOpponentDefenseEv(next.defenseEv)
    setCalcOpponentSpDefenseEv(next.spDefenseEv)
    setCalcOpponentDefenseNature(next.defenseNature)
    setCalcOpponentSpDefenseNature(next.spDefenseNature)
  }
  const updateOpponentBulkState = (patch: Partial<OpponentBulkState>) => {
    const nextState = sanitizeOpponentBulkState({ ...opponentBulkState, ...patch }, 'custom')
    setCalcOpponentHpEv(nextState.hpEv)
    setCalcOpponentDefenseEv(nextState.defenseEv)
    setCalcOpponentSpDefenseEv(nextState.spDefenseEv)
    setCalcOpponentDefenseNature(nextState.defenseNature)
    setCalcOpponentSpDefenseNature(nextState.spDefenseNature)
    setCalcOpponentBulkPreset(detectOpponentBulkPreset(nextState))
  }
  const applyOpponentOffensePresetSelection = (preset: OpponentOffensePreset) => {
    setCalcOpponentOffensePreset(preset)
    if (preset === 'custom') return
    const next = opponentOffenseStateFromPreset(preset)
    setCalcOpponentAttackEv(next.attackEv)
    setCalcOpponentSpAttackEv(next.spAttackEv)
    setCalcOpponentAttackNature(next.attackNature)
    setCalcOpponentSpAttackNature(next.spAttackNature)
  }
  const updateOpponentOffenseState = (patch: Partial<OpponentOffenseState>) => {
    const nextState = sanitizeOpponentOffenseState({ ...opponentOffenseState, ...patch }, 'custom')
    setCalcOpponentAttackEv(nextState.attackEv)
    setCalcOpponentSpAttackEv(nextState.spAttackEv)
    setCalcOpponentAttackNature(nextState.attackNature)
    setCalcOpponentSpAttackNature(nextState.spAttackNature)
    setCalcOpponentOffensePreset(detectOpponentOffensePreset(nextState))
  }
  const sampleMoveSet = sampleMoves.find((entry) => entry.key === sampleForge.key)
  const sampleMovePool = movePoolByKey[sampleForge.key]
  const sampleMoveOptions = choicesForPool(sampleMovePool)
  const sampleSpeciesOptions = prioritizeExactSpecies(searchPokemon(rows, sampleSearch ?? '', { includeMega: true }), sampleSearch ?? '').slice(0, 8).map(row => ({ key: row.key, label: `${row.name_ko} (${row.name_en})` }))
  const sampleMoveType = (moveName: string) => resolveMoveType(moveName, sampleMoveOptions, movePoolByKey)
  const sampleRegisteredMoves = [...sampleLockedMoves]
  while (sampleRegisteredMoves.length < 4) sampleRegisteredMoves.push('')
  const sampleConfirmedMoves = sampleRegisteredMoves.filter(Boolean).slice(0, 4)
  const nextOpenSampleSlot = (moves: string[], fromIdx: number) => {
    for (let idx = fromIdx + 1; idx < 4; idx += 1) {
      if (!moves[idx]?.trim()) return idx
    }
    for (let idx = 0; idx < fromIdx; idx += 1) {
      if (!moves[idx]?.trim()) return idx
    }
    return null
  }
  const focusSampleSlot = (slotIdx: number | null) => {
    if (slotIdx === null) {
      setActiveMoveField(null)
      return
    }
    setActiveMoveField({ key: sampleForge.key, slotIdx, scope: 'sample' })
  }
  const commitSampleMoveOption = (slotIdx: number, rawQuery: string) => {
    const top = filterMoveOptions(rawQuery, sampleMoveOptions)[0]
    if (!top) return false
    const nextMoves = [...sampleRegisteredMoves]
    nextMoves[slotIdx] = top.name
    setSampleLockedMoves((prev) => {
      const current = [...prev]
      while (current.length < 4) current.push('')
      current[slotIdx] = top.name
      return normalizeMoveSlots(current)
    })
    focusSampleSlot(nextOpenSampleSlot(nextMoves, slotIdx))
    return true
  }
  const selectSampleMoveOption = (slotIdx: number, moveName: string) => {
    const accepted = resolveEligibleMoveInput(moveName, sampleMovePool)
    setMoveInputDraft(null)
    setMoveCommitNotice(accepted ? null : { key: sampleForge.key, slotIdx, scope: 'sample' })
    if (!accepted) return
    const nextMoves = [...sampleRegisteredMoves]
    nextMoves[slotIdx] = accepted
    setSampleLockedMoves((prev) => {
      const current = [...prev]
      while (current.length < 4) current.push('')
      current[slotIdx] = accepted
      return normalizeMoveSlots(current)
    })
    focusSampleSlot(nextOpenSampleSlot(nextMoves, slotIdx))
  }
  const applySampleCandidateMove = (move: string, preferredSlotIdx: number) => {
    const accepted = resolveEligibleMoveInput(move, sampleMovePool)
    if (!accepted) {
      setMoveCommitNotice({ key: sampleForge.key, slotIdx: preferredSlotIdx, scope: 'sample' })
      return
    }
    setMoveCommitNotice(null)
    move = accepted
    const nextMoves = [...sampleRegisteredMoves]
    const existingIdx = nextMoves.indexOf(move)
    if (existingIdx >= 0) nextMoves[existingIdx] = ''
    nextMoves[preferredSlotIdx] = move
    setSampleLockedMoves((prev) => {
      const current = [...prev]
      const existingIdx = current.indexOf(move)
      while (current.length < 4) current.push('')
      if (existingIdx >= 0) current[existingIdx] = ''
      current[preferredSlotIdx] = move
      return normalizeMoveSlots(current)
    })
    focusSampleSlot(nextOpenSampleSlot(nextMoves, preferredSlotIdx))
  }
  const renderSampleMoveEditor = () => (
    <MoveSlotsEditor label={lt('기술 배치')} labels={moveSlotLabels} ownerId={`sample-${sampleForge.key}`} role="editable" selectedIndex={activeSampleMoveSlotIdx}
      toolbar={<div className="pick-summary-badges sample-slot-target-badges">
        <span className="pick-badge sample-slot-target-badge active">{activeSampleMoveSlotIdx + 1}번 슬롯</span>
        {sampleForge.key && learnsetStatusText(sampleMovePool, siteLanguage) ? <small className="quick-source-badge" role="status">{learnsetStatusText(sampleMovePool, siteLanguage)}</small> : null}
        {sampleMovePool?.status === 'load-error' ? <button type="button" onClick={() => window.location.reload()}>{siteLanguage === 'ko' ? '다시 시도 (새로고침)' : siteLanguage === 'ja' ? '再読込' : 'Reload to retry'}</button> : null}
        <button type="button" className="pick-badge sample-slot-clear-badge sample-slot-clear-action" onClick={() => setSampleLockedMoves(prev => {
          const current = [...prev]; while (current.length < 4) current.push(''); current[activeSampleMoveSlotIdx] = ''; return normalizeMoveSlots(current)
        })}>{lt('슬롯 비우기')}</button>
      </div>}
      slots={sampleRegisteredMoves.slice(0, 4).map((move, moveIdx) => ({
                                id: `${moveIdx}`, name: sameMoveField(activeMoveField, sampleForge.key, moveIdx, 'sample') && moveInputDraft !== null ? moveInputDraft : move, type: sampleMoveType(move), meta: resolveMoveMeta(move, sampleMoveOptions, movePoolByKey), className: moveTypeThemeClass(sampleMoveType(move)),
                                tooltipProps: bindTooltip(move ? moveTooltipData(move, siteLanguage) : null),
                                search: { id: `sample-move-${sampleForge.key}-${moveIdx}`, options: filterMoveOptions(sameMoveField(activeMoveField, sampleForge.key, moveIdx, 'sample') && moveInputDraft !== null ? moveInputDraft : move, sampleMoveOptions).slice(0, 8).map(option => ({ key: option.name, label: option.name })), showAllOnEmpty: true,
                                  onSelect: option => selectSampleMoveOption(moveIdx, option.key),
                                  optionClassName: option => moveTypeThemeClass(sampleMoveOptions.find(moveOption => moveOption.name === option.key)?.type),
                                  renderOption: option => <MoveCandidateRow name={option.label} type={sampleMoveOptions.find(moveOption => moveOption.name === option.key)?.type} meta={resolveMoveMeta(option.key, sampleMoveOptions, movePoolByKey)} labels={moveSlotLabels} />,
                                  optionProps: option => bindTooltip(moveTooltipData(option.key, siteLanguage)) },
                                inputProps: {
                                  placeholder: sampleMovePool?.status === 'loading' ? lt('기술풀 불러오는 중…') : sampleMoveOptions.length ? lt('사용 가능 기술 검색') : lt('기술 입력'),
                                  onFocus: () => {
                                    setActiveMoveField({ key: sampleForge.key, slotIdx: moveIdx, scope: 'sample' })
                                    setMoveInputDraft(move)
                                    setMoveCommitNotice(null)
                                  },
                                  onBlur: (e) => {
                                    if (sameMoveField(activeMoveField, sampleForge.key, moveIdx, 'sample') && moveInputDraft !== null) commitEditorMove(e.target.value, move, sampleMovePool, sampleForge.key, moveIdx, 'sample')
                                    setActiveMoveField((prev) => sameMoveField(prev, sampleForge.key, moveIdx, 'sample') ? null : prev)
                                  },

                                  onChange: (e) => {
                                    setMoveInputDraft(e.target.value)
                                    setActiveMoveField({ key: sampleForge.key, slotIdx: moveIdx, scope: 'sample' })
                                  },
                                }, children: <>{recordedLearnsetText(move, sampleMovePool, siteLanguage) ? <small role="status">{recordedLearnsetText(move, sampleMovePool, siteLanguage)}</small> : null}{sameMoveField(moveCommitNotice, sampleForge.key, moveIdx, 'sample') ? <small role="status">{lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')}</small> : null}</>,
                                preview: mainSection === 'sample' && sampleWorkbenchTab === 'damage' && move ? sampleDamageCalcs.map(entry => {
                                  const result = entry.forwardMoves.find(item => item.moveName === move)
                                  return <div key={`${entry.idx}-${moveIdx}`} className="sample-damage-move-result">
                                    <strong>{entry.row ? displayName(entry.row, siteLanguage) : lt('비교 대상 없음')}</strong>
                                    <span>{result?.damage && result.defenderStats ? <><DamageRangeMeter damage={result.damage} targetHp={result.defenderStats.hp} language={siteLanguage} compact />{result.verdict ? <strong className="damage-verdict">{result.verdict}</strong> : null}</> : result?.unavailableReason}</span>
                                    {result?.damage ? <small>{lt('상대 적용 결정력')} {result.appliedDecisionPower == null ? '—' : formatBattleIndex(result.appliedDecisionPower, siteLanguage)} · {lt('적용 위력')} {result.effectivePower}</small> : null}
                                    {result?.moveHitOptions?.length ? <label>{lt('타수')}<select value={result.moveHitCount ?? result.moveHitOptions[0]} onChange={e => updateSampleMoveCondition(entry.idx, 'forward', move, 'moveHits', Number(e.target.value))}>{result.moveHitOptions.map(hit => <option key={hit} value={hit}>{hit}</option>)}</select></label> : null}
                                    {result?.moveRule ? <label>{lt(result.moveRule.label)}{result.moveRule.kind === 'count' ? <input type="number" min={result.moveRule.min ?? 0} max={result.moveRule.max ?? 999} value={Number(result.moveConditionValue ?? result.moveRule.defaultValue)} onChange={e => updateSampleMoveCondition(entry.idx, 'forward', move, 'conditionalValues', Number(e.target.value))} /> : <input type="checkbox" checked={Boolean(result.moveConditionValue)} onChange={e => updateSampleMoveCondition(entry.idx, 'forward', move, 'conditionalValues', e.target.checked)} />}</label> : null}
                                    {result && (result.moveRule || result.moveHitOptions?.length || move === '로우킥' || move === '풀묶기') ? <small>{variablePowerHint(move, lt, { targetWeightKnown: result.targetWeightKnown, resolvedPower: result.movePower, totalPower: result.moveHitSummary?.totalPower ?? null })}</small> : null}
                                  </div>
                                }) : null
                            }))} />
  )
  const sampleTopSuggestedMoves = usageTopMovesForKey(sampleForge.key)
  const sampleCuratedMoveBuckets = [
    { id: 'core' as const, label: lt('코어'), moves: sampleMoveSet?.core ?? [] },
    { id: 'options' as const, label: lt('선택'), moves: sampleMoveSet?.options ?? [] },
    { id: 'utility' as const, label: lt('유틸'), moves: sampleMoveSet?.utility ?? [] },
  ].filter((bucket) => bucket.moves.length)
  const sampleVisibleMoveBuckets = sampleCuratedMoveBuckets.filter((bucket) => sampleMoveFilter === 'all' || sampleMoveFilter === bucket.id)
  while (sampleRegisteredMoves.length < 4) sampleRegisteredMoves.push('')
  const activeSampleMoveSlotIdx = activeMoveField?.scope === 'sample' && activeMoveField.key === sampleForge.key
    ? activeMoveField.slotIdx
    : Math.min(sampleConfirmedMoves.length, 3)
  const sampleAbilityOptions = displayAbilities(sampleRow, siteLanguage)
  const sampleFixedMegaStone = megaStoneForKey(sampleForge.key)
  const sampleCalcConfig = sampleFixedMegaStone ? { ...sampleForge.config, scarf: false } : sampleForge.config
  const sampleCalcMember = sampleFixedMegaStone ? { ...sampleForge, config: sampleCalcConfig } : sampleForge
  const sampleCurrentItem = visibleChampionsItem(sampleForge.key, sampleForge.item)
  const sampleEvTotal = Object.values(sampleForge.evs).reduce((sum, value) => sum + value, 0)
  const sampleSpeedValueNow = partySpeedValue(sampleRow, sampleCalcMember)
  const sampleSpeedAbilityLine = sampleRow ? mySpeedAbilityMarker(sampleRow, sampleCalcMember, siteLanguage, calcWeather, calcTerrain) : null
  const sampleSpeedSearchResults = filterSpeciesOptions(sampleSpeedSearch, { includeMega: true })
    .filter((option) => !sampleSpeedTargets.some((target) => target.key === option.key))
    .slice(0, 8)
  const sampleSpeedCalcs = sampleSpeedTargets.map((member, idx) => {
    const row = member.key ? (indexByKey.get(member.key) ?? null) : null
    if (!row || !isCalculableHeldItem(sampleForge.key, sampleForge.item) || heldAbilityError(sampleForge.key, sampleForge.ability, siteLanguage)) return null
    const scenarios = [
      { id: 'base', label: lt('준속'), speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, false, false, member.speedStage) },
      { id: 'fast', label: lt('최속'), speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, true, false, member.speedStage) },
      { id: 'neutral-scarf', label: `${lt('준속')} ${lt('스카프')}`, speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, false, true, member.speedStage) },
      { id: 'scarf', label: `${lt('최속')} ${lt('스카프')}`, speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, true, true, member.speedStage) },
    ]
    const doubleSpeedAbility = speedAbilityCandidate(row, siteLanguage)
    if (doubleSpeedAbility) {
      scenarios.push({ id: 'ability', label: doubleSpeedAbility.label, speed: opponentScenarioSpeed(row, CHAMPIONS_EFFORT_PER_STAT_CAP, true, false, member.speedStage) * 2 })
    }
    const cutoffs = scenarios.map((scenario) => ({
      ...scenario,
      needs: mySpeedNeeds(sampleRow, sampleCalcConfig, sampleCalcMember.item, scenario.speed),
      result: sampleSpeedValueNow > scenario.speed ? lt('내가 앞섬') : sampleSpeedValueNow < scenario.speed ? lt('상대가 앞섬') : lt('동속'),
    }))
    return { idx, member, row, cutoffs }
  }).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  const sampleDamageMoveChoices = Array.from(new Set(sampleRegisteredMoves.filter((move): move is string => Boolean(move.trim()))))
  const sampleAttackerStats = buildPartyBattleStats(sampleRow, sampleCalcMember)
  const sampleDamageSearchResults = filterSpeciesOptions(sampleDamageSearch, { includeMega: true })
    .filter((option) => !sampleDamageTargets.some((target) => target.key === option.key))
    .slice(0, 8)


  React.useEffect(() => {
    const missingWeightTargets = sampleDamageTargets
      .map((member) => member.key ? (indexByKey.get(member.key) ?? null) : null)
      .filter((row): row is Row => Boolean(row && typeof row.id === 'number' && typeof row.key === 'string'))
      .filter((row) => typeof row.weightKg !== 'number' && typeof weightByKey[row.key] !== 'number')
    if (!missingWeightTargets.length) return
    let cancelled = false
    Array.from(new Map(missingWeightTargets.map((row) => [row.key, row])).values()).forEach((row) => {
      fetchPokemonWeightKg(row.id)
        .then((weightKg) => {
          if (cancelled) return
          setWeightByKey((prev) => prev[row.key] === weightKg ? prev : { ...prev, [row.key]: weightKg })
        })
        .catch(() => undefined)
    })
    return () => {
      cancelled = true
    }
  }, [sampleDamageTargets, weightByKey])
  const sampleAttackerAbilityValue = sampleRow ? (resolveSelectedAbility(sampleRow, sampleForge.ability, siteLanguage)?.slug ?? '') : ''
  const damageSampleAttackerStats = buildPartyBattleStats(attackingFormRow(sampleRow, sampleAttackerAbilityValue), sampleCalcMember)
  const sampleBulkIndices = durabilityIndices(buildPartyBattleStats(sampleRow, sampleCalcMember))
  const sampleBaselineWeather = deriveAutoWeatherFromAbilities(sampleAttackerAbilityValue)
  const sampleBaselineTerrain = deriveAutoTerrainFromAbilities(sampleAttackerAbilityValue)
  const sampleDecisionPowerIndices = sampleDamageMoveChoices.map((moveName) => {
    if (!isCalculableHeldItem(sampleForge.key, sampleForge.item) || heldAbilityError(sampleForge.key, sampleForge.ability, siteLanguage)) return { moveName, moveMeta: null, value: null, attackStat: null, stab: 1, notes: [] as string[] }
    const moveMetaBase = moveInPool(moveName, sampleMoveOptions) ? resolveMoveMeta(moveName, sampleMoveOptions, movePoolByKey) : null
    const defaultHitCount = multiHitOptions(moveName)?.[0] ?? null
    const moveRule = CONDITIONAL_MOVE_POWER_RULES[moveName] ?? null
    const moveMeta = applyConditionalMovePower(
      moveName,
      resolveAbilityAdjustedMoveMeta(
        moveName,
        resolveMultiHitMeta(moveName, moveMetaBase, defaultHitCount, sampleAttackerAbilityValue),
        sampleAttackerAbilityValue,
        sampleBaselineWeather,
      ),
      moveRule?.defaultValue,
    )
    if (!moveMeta || (moveMeta.category !== 'physical' && moveMeta.category !== 'special') || !moveMeta.type || sampleDamageMoveGate(moveName, sampleMovePool?.status, moveInPool(moveName, sampleMoveOptions), moveMeta, Boolean(moveRule && moveMetaBase && moveMeta.power))) {
      return { moveName, moveMeta: null, value: null, attackStat: null, stab: 1, notes: [] as string[] }
    }
    const attackerTypes = resolveAbilityAdjustedTypes(sampleRow.types, sampleAttackerAbilityValue, sampleBaselineWeather, sampleBaselineTerrain)
    const stab = resolveStabMultiplier(attackerTypes, moveMeta.type, sampleAttackerAbilityValue, true)
    const modifiers = resolveDamageModifiers({
      attackerAbility: sampleAttackerAbilityValue,
      attackerTypes,
      attackerItem: sampleCalcMember.item,
      defenderAbility: '',
      defenderKey: '', // Target-free baseline: never imply an equipped removable item.
      defenderItem: '',
      moveName,
      moveMeta,
      baseMoveType: moveMetaBase?.type ?? moveMeta.type,
      moveType: moveMeta.type,
      movePower: moveMeta.power ?? null,
      mode: moveMeta.category,
      effectiveness: 1,
      attackStage: 0,
      defenseStage: 0,
      defenderTypes: [],
      burned: false,
      attackerLowHp: false,
      targetPoisoned: false,
      defenderFullHp: false,
      movedAfterTarget: false,
      faintedAllies: 0,
      rivalryMode: 'neutral',
      parentalBond: sampleAttackerAbilityValue === 'parental-bond',
      defenderStatused: false,
      electromorphosisCharged: false,
      weather: sampleBaselineWeather,
      terrain: sampleBaselineTerrain,
      reflect: false,
      lightScreen: false,
      auroraVeil: false,
      friendGuard: false,
      critical: false,
    })
    const attackStat = moveMeta.usesDefenseAsAttack
      ? damageSampleAttackerStats.defense
      : moveMeta.category === 'physical'
        ? damageSampleAttackerStats.attack
        : damageSampleAttackerStats.spAttack
    return {
      moveName,
      moveMeta,
      value: decisionPowerIndex(damageSampleAttackerStats, moveMeta, stab, modifiers),
      attackStat,
      stab,
      notes: modifiers.notes,
    }
  })
  const sampleUsesTypeChangeStabAbility = sampleAttackerAbilityValue === 'protean' || sampleAttackerAbilityValue === 'libero' || sampleAttackerAbilityValue === '변환자재'
  const sampleDamageDefenderAbilitySlugs = sampleDamageTargets.map((member) => {
    const row = member.key ? (indexByKey.get(member.key) ?? null) : null
    return row ? (resolveSelectedAbility(row, member.ability, siteLanguage)?.slug ?? '') : ''
  })
  const sampleShowAttackerLowHpToggle = ['blaze', 'torrent', 'overgrow', 'swarm'].includes(sampleAttackerAbilityValue)
  const sampleShowTargetPoisonedToggle = sampleAttackerAbilityValue === 'merciless'
  const sampleShowMovedAfterTargetToggle = sampleAttackerAbilityValue === 'analytic'
  const sampleShowFaintedAlliesInput = sampleAttackerAbilityValue === 'supreme-overlord'
  const sampleShowRivalryModeInput = sampleAttackerAbilityValue === 'rivalry'
  const sampleShowParentalBondToggle = sampleAttackerAbilityValue === 'parental-bond'
  const sampleShowElectromorphosisToggle = sampleAttackerAbilityValue === 'electromorphosis'
  const sampleShowDefenderStatusedToggle = sampleDamageDefenderAbilitySlugs.includes('marvel-scale')
  const sampleShowDefenderFullHpToggle = sampleDamageDefenderAbilitySlugs.some((ability) => ability === 'multiscale' || ability === 'shadow-shield')
  const sampleShowDefenderDisguiseToggle = sampleDamageDefenderAbilitySlugs.some((ability) => ability === 'disguise' || ability === '탈')
  React.useEffect(() => {
    if (sampleShowDefenderDisguiseToggle) {
      setCalcDefenderDisguise(true)
    }
  }, [sampleShowDefenderDisguiseToggle])
  const sampleDamageCalcs = sampleDamageTargets.map((member, idx) => {
    const condition = sampleConditions(sampleForge.key, member.sampleConditions)
    // Legacy fields are retained verbatim, with their old reverse meaning only at projection.
    if (!member.sampleConditions) {
      condition.opponent.attackStage = member.reverseAttackStage
      condition.own.defenseStage = member.reverseDefenseStage
      condition.opponent.burned = member.reverseBurned
      condition.own.reflect = member.reverseReflect
      condition.own.lightScreen = member.reverseLightScreen
      condition.own.auroraVeil = member.reverseAuroraVeil
      condition.own.fullHp = member.reverseDefenderFullHp
    }
    const ownBattle = condition.own
    const opponentBattle = condition.opponent
    const row = member.key ? (indexByKey.get(member.key) ?? null) : null
    const opponentPool = movePoolByKey[member.key]
    const opponentOptions = choicesForPool(opponentPool)
    // Both recorded four-slot lists are the calculation owners; legacy selected names stay stored only.
    const opponentEffortsValid = validCompleteEfforts({ hp: member.hpEv, attack: member.attackEv, defense: member.defenseEv, spAttack: member.spAttackEv, spDefense: member.spDefenseEv, speed: member.speedEv })
    const reverseDefenderStats = buildPartyBattleStats(sampleRow, sampleCalcMember)
    const reverseAbility = row ? (resolveSelectedAbility(row, member.ability, siteLanguage)?.slug ?? '') : ''
    const reverseAttackerStats = row ? buildOpponentBattleStats(attackingFormRow(row, reverseAbility), {
      hpEv: member.hpEv, defenseEv: member.defenseEv, spDefenseEv: member.spDefenseEv,
      defenseNature: member.defenseNature, spDefenseNature: member.spDefenseNature,
    }, { attackEv: member.attackEv, spAttackEv: member.spAttackEv, attackNature: member.attackNature, spAttackNature: member.spAttackNature }) : null
    const reverseMoves = member.opponentMoves.filter(Boolean).map((opponentMoveName) => {
    const reverseMoveKey = sampleMoveKey(sampleForge.key, member.key, 'reverse', opponentMoveName)
    const reverseBase = opponentMoveName && moveInPool(opponentMoveName, opponentOptions) ? resolveMoveMeta(opponentMoveName, opponentOptions, movePoolByKey) : null
    const reverseHits = multiHitOptions(opponentMoveName)
    const reverseRule = CONDITIONAL_MOVE_POWER_RULES[opponentMoveName]
    const reverseMeta = reverseBase && applyConditionalMovePower(opponentMoveName,
      applyTargetWeightMovePower(opponentMoveName,
        resolveAbilityAdjustedMoveMeta(opponentMoveName,
          resolveMultiHitMeta(opponentMoveName, reverseBase, reverseHits?.includes(condition.moveHits[reverseMoveKey]) ? condition.moveHits[reverseMoveKey] : reverseHits?.[0] ?? null, reverseAbility),
          reverseAbility, calcWeather),
        typeof sampleRow.weightKg === 'number' ? sampleRow.weightKg : weightByKey[sampleRow.key] ?? null),
      reverseRule ? normalizeConditionalPowerValue(reverseRule, condition.conditionalValues[reverseMoveKey] ?? reverseRule.defaultValue) : null)
    const reverseGate = sampleDamageMoveGate(opponentMoveName, opponentPool?.status, moveInPool(opponentMoveName, opponentOptions), reverseMeta, Boolean(reverseRule && reverseBase && reverseMeta?.power))
    const reverseReason = !opponentEffortsValid ? lt('노력치 합계가 66을 초과하거나 유효하지 않습니다.')
      : !row ? lt('비교 대상 없음')
      : !opponentMoveName ? lt('상대 기술을 등록하세요.')
      : reverseGate === 'loading' ? lt('기술풀 불러오는 중…')
      : reverseGate === 'source' ? lt('현재 폼 기술풀 밖 기록 · 미확인')
      : reverseGate === 'unsupported' ? lt('이 기술은 현재 계산 조건에서 지원되지 않거나 변화기입니다.')
      : heldItemError(member.key, member.item, siteLanguage) || heldItemError(sampleForge.key, sampleForge.item, siteLanguage) || heldAbilityError(member.key, member.ability, siteLanguage) || heldAbilityError(sampleForge.key, sampleForge.ability, siteLanguage)
      || null
    let reverseDamage: ReturnType<typeof calcDamage> = null
    if (!reverseReason && row && reverseAttackerStats && reverseMeta?.power && reverseMeta.type && (reverseMeta.category === 'physical' || reverseMeta.category === 'special')) {
      const reverseProjection = sampleMoveStats(opponentMoveName, reverseMeta, reverseAttackerStats, reverseDefenderStats, opponentBattle, ownBattle)
      const reverseTargetTypes = resolveAbilityAdjustedTypes(sampleRow.types, sampleAttackerAbilityValue, calcWeather, calcTerrain)
      const reverseSourceTypes = resolveAbilityAdjustedTypes(row.types, reverseAbility, calcWeather, calcTerrain)
      const reverseModifiers = resolveDamageModifiers({
        attackerAbility: reverseAbility, attackerTypes: reverseSourceTypes, attackerItem: member.item,
        defenderAbility: sampleAttackerAbilityValue, defenderKey: sampleForge.key, defenderItem: sampleForge.item,
        moveName: opponentMoveName, baseMoveType: reverseBase?.type ?? reverseMeta.type,
        moveMeta: reverseMeta,
        moveType: reverseMeta.type, movePower: reverseMeta.power, mode: reverseMeta.category,
        effectiveness: abilityAdjustedTypeEffectiveness(reverseMeta.type, reverseTargetTypes, sampleAttackerAbilityValue, reverseAbility),
        attackStage: reverseProjection.attackStage, defenseStage: reverseProjection.defenseStage, defenderTypes: reverseTargetTypes,
        burned: opponentBattle.burned, attackerLowHp: opponentBattle.lowHp, targetPoisoned: ownBattle.poisoned, defenderFullHp: ownBattle.fullHp,
        movedAfterTarget: opponentBattle.movedAfterTarget, faintedAllies: opponentBattle.faintedAllies, rivalryMode: opponentBattle.rivalryMode, parentalBond: reverseAbility === 'parental-bond' && opponentBattle.parentalBond, defenderStatused: ownBattle.statused,
        electromorphosisCharged: opponentBattle.electromorphosisCharged, critical: opponentBattle.critical, weather: calcWeather, terrain: calcTerrain,
        reflect: ownBattle.reflect, lightScreen: ownBattle.lightScreen, auroraVeil: ownBattle.auroraVeil, friendGuard: false,
      })
      reverseDamage = calcDamage(reverseProjection.attacker, reverseProjection.defender,
        reverseMeta.power, reverseMeta.category, resolveStabMultiplier(reverseSourceTypes, reverseMeta.type, reverseAbility, calcTypeChangeStab), reverseModifiers.effectiveness, reverseMeta, reverseModifiers)
    }
    return { damage: reverseDamage, defenderStats: reverseDefenderStats, attackerStats: reverseAttackerStats,
      moveName: opponentMoveName, reason: reverseReason || (reverseDamage ? null : lt('대미지 계산 불가')),
      verdict: reverseDamage ? resolveDamageVerdict(reverseDamage, reverseDefenderStats.hp, siteLanguage, Boolean(reverseMeta?.hits && reverseMeta.hits > 1)) : null,
      opponentPool, opponentOptions, moveRule: reverseRule,
      moveConditionValue: reverseRule ? normalizeConditionalPowerValue(reverseRule, condition.conditionalValues[reverseMoveKey] ?? reverseRule.defaultValue) : null,
      moveHitOptions: reverseHits, moveHitCount: reverseHits?.includes(condition.moveHits[reverseMoveKey]) ? condition.moveHits[reverseMoveKey] : reverseHits?.[0] ?? null }
    })
    const reverse = reverseMoves[0] ?? { opponentPool, opponentOptions, moveName: '', damage: null, reason: lt('상대 기술을 등록하세요.'), defenderStats: reverseDefenderStats, verdict: null }
    const itemMismatch = !isCalculableHeldItem(sampleForge.key, sampleForge.item) || !isCalculableHeldItem(member.key, member.item) || Boolean(heldAbilityError(sampleForge.key, sampleForge.ability, siteLanguage) || heldAbilityError(member.key, member.ability, siteLanguage))
    const defenderAbilityValue = row ? (resolveSelectedAbility(row, member.ability, siteLanguage)?.slug ?? '') : ''
    const forwardMoves = sampleRegisteredMoves.slice(0, 4).filter(Boolean).map((moveName) => {
    const forwardMoveKey = sampleMoveKey(sampleForge.key, member.key, 'forward', moveName)
    const moveMetaBase = moveInPool(moveName, sampleMoveOptions) ? resolveMoveMeta(moveName, sampleMoveOptions, movePoolByKey) : null
    const moveHitOptions = multiHitOptions(moveName)
    const moveHitCount = moveHitOptions?.includes(condition.moveHits[forwardMoveKey]) ? condition.moveHits[forwardMoveKey] : (moveHitOptions?.[0] ?? null)
    const moveRule = moveName ? CONDITIONAL_MOVE_POWER_RULES[moveName] ?? null : null
    const moveConditionValue = moveRule ? normalizeConditionalPowerValue(moveRule, condition.conditionalValues[forwardMoveKey] ?? moveRule.defaultValue) : null
    const targetWeightKg = row ? (typeof row.weightKg === 'number' ? row.weightKg : weightByKey[row.key] ?? null) : null
    const moveMeta = applyConditionalMovePower(
      moveName,
      applyTargetWeightMovePower(
        moveName,
        resolveAbilityAdjustedMoveMeta(
          moveName,
          resolveMultiHitMeta(moveName, moveMetaBase, moveHitCount, sampleAttackerAbilityValue),
          sampleAttackerAbilityValue,
          calcWeather,
        ),
        targetWeightKg,
      ),
      moveConditionValue,
    )
    const moveType = moveMeta?.type ?? null
    const moveCategory = moveMeta?.category === 'physical' || moveMeta?.category === 'special' ? moveMeta.category : null
    const movePower = typeof moveMeta?.power === 'number' ? moveMeta.power : null
    const forwardGate = sampleDamageMoveGate(moveName, sampleMovePool?.status, moveInPool(moveName, sampleMoveOptions), moveMeta, Boolean(moveRule && moveMetaBase && moveMeta?.power))
    const unavailableReason = !opponentEffortsValid ? lt('노력치 합계가 66을 초과하거나 유효하지 않습니다.')
      : !row
      ? lt('비교 대상 없음')
      : itemMismatch
        ? heldItemError(sampleForge.key, sampleForge.item, siteLanguage) || heldItemError(member.key, member.item, siteLanguage) || heldAbilityError(sampleForge.key, sampleForge.ability, siteLanguage) || heldAbilityError(member.key, member.ability, siteLanguage)
      : forwardGate === 'loading' ? lt('기술풀 불러오는 중…')
      : forwardGate === 'source' ? lt('현재 폼 기술풀 밖 기록 · 미확인')
      : forwardGate === 'unsupported' ? lt('이 기술은 현재 계산 조건에서 지원되지 않거나 변화기입니다.')
      : !moveName
        ? lt('등록 기술 없음')
        : moveMeta?.category === 'status'
          ? lt('변화기는 대미지 계산 대상이 아님')
          : (!movePower || !moveCategory || !moveType)
            ? lt('대미지 계산 불가')
            : null
    const effectiveAttackerTypes = row ? resolveAbilityAdjustedTypes(sampleRow.types, sampleAttackerAbilityValue, calcWeather, calcTerrain) : sampleRow.types
    const effectiveDefenderTypes = row ? resolveAbilityAdjustedTypes(row.types, defenderAbilityValue, calcWeather, calcTerrain) : []
    const defenderStats = row ? buildOpponentBattleStats(row, {
      hpEv: member.hpEv,
      defenseEv: member.defenseEv,
      spDefenseEv: member.spDefenseEv,
      defenseNature: member.defenseNature,
      spDefenseNature: member.spDefenseNature,
    }) : null
    if (!row || !defenderStats || unavailableReason || !moveType || !moveCategory || !movePower) {
      return { idx, member, row, reverse, moveName, moveCategory, movePower, effectivePower: null, appliedDecisionPower: null, attackStatLabel: moveCategory === 'physical' ? '공격' : '특수공격', attackStatValue: moveCategory === 'physical' ? damageSampleAttackerStats.attack : damageSampleAttackerStats.spAttack, defenderStats, damage: null, verdict: unavailableReason, moveRule, moveConditionValue, moveHitOptions, moveHitCount, moveHitSummary: multiHitSummary(moveName, moveMeta, moveHitCount), targetWeightKnown: typeof targetWeightKg === 'number', unavailableReason }
    }
    const effectivenessValue = abilityAdjustedTypeEffectiveness(moveType, effectiveDefenderTypes, defenderAbilityValue, sampleAttackerAbilityValue)
    const forwardProjection = sampleMoveStats(moveName, moveMeta!, damageSampleAttackerStats, defenderStats, ownBattle, opponentBattle)
    const modifierPack = resolveDamageModifiers({
      attackerAbility: sampleAttackerAbilityValue,
      attackerTypes: effectiveAttackerTypes,
      attackerItem: sampleForge.item,
      defenderAbility: defenderAbilityValue,
      defenderKey: member.key,
      defenderItem: member.item,
      moveName,
      moveMeta,
      baseMoveType: moveMetaBase?.type ?? moveType,
      moveType,
      movePower,
      mode: moveCategory,
      effectiveness: effectivenessValue,
      attackStage: forwardProjection.attackStage,
      defenseStage: forwardProjection.defenseStage,
      defenderTypes: effectiveDefenderTypes,
      burned: ownBattle.burned,
      attackerLowHp: ownBattle.lowHp,
      targetPoisoned: opponentBattle.poisoned,
      defenderFullHp: opponentBattle.fullHp,
      disguiseActive: opponentBattle.disguiseActive,
      movedAfterTarget: ownBattle.movedAfterTarget,
      faintedAllies: ownBattle.faintedAllies,
      rivalryMode: ownBattle.rivalryMode,
      parentalBond: ownBattle.parentalBond,
      defenderStatused: opponentBattle.statused,
      electromorphosisCharged: ownBattle.electromorphosisCharged,
      critical: ownBattle.critical,
      weather: calcWeather,
      terrain: calcTerrain,
      reflect: opponentBattle.reflect,
      lightScreen: opponentBattle.lightScreen,
      auroraVeil: opponentBattle.auroraVeil,
      friendGuard: false,
    })
    const attackStatLabel = moveCategory === 'physical' ? '공격' : '특수공격'
    const attackStatValue = moveMeta?.usesDefenseAsAttack ? forwardProjection.attacker.defense : moveName === '속임수' ? forwardProjection.defender.attack : moveCategory === 'physical' ? forwardProjection.attacker.attack : forwardProjection.attacker.spAttack
    const damage = calcDamage(forwardProjection.attacker, forwardProjection.defender, movePower, moveCategory, resolveStabMultiplier(effectiveAttackerTypes, moveType, sampleAttackerAbilityValue, calcTypeChangeStab), modifierPack.effectiveness, moveMeta, modifierPack)
    // Use the exact fixed-point power path from calcDamage, not a second rounding rule.
    const effectivePower = engineMovePower(movePower, modifierPack.powerMultiplier ?? 1, modifierPack.fixedBpMods)
    const appliedDecisionPower = damage && moveMeta ? decisionPowerIndex(forwardProjection.attacker, moveMeta, resolveStabMultiplier(effectiveAttackerTypes, moveType, sampleAttackerAbilityValue, calcTypeChangeStab), modifierPack) : null
    return { idx, member, row, reverse, moveName, moveCategory, movePower, effectivePower, appliedDecisionPower, attackStatLabel, attackStatValue, defenderStats, damage, verdict: damage ? resolveDamageVerdict(damage, defenderStats.hp, siteLanguage, Boolean(moveMeta?.hits && moveMeta.hits > 1)) : lt('대미지 계산 불가'), moveRule, moveConditionValue, moveHitOptions, moveHitCount, moveHitSummary: multiHitSummary(moveName, moveMeta, moveHitCount), targetWeightKnown: typeof targetWeightKg === 'number', unavailableReason: damage ? null : lt('대미지 계산 불가') }
    })
    return { idx, member, row, conditions: condition, reverse, reverseMoves, forwardMoves, defenderStats: forwardMoves[0]?.defenderStats ?? (row ? buildOpponentBattleStats(row, { hpEv: member.hpEv, defenseEv: member.defenseEv, spDefenseEv: member.spDefenseEv, defenseNature: member.defenseNature, spDefenseNature: member.spDefenseNature }) : null), opponentEffortsValid }

  })

  const addSampleSpeedTarget = (key: string) => {
    setSampleSpeedTargets([{ ...blankSampleSpeedTarget(), key }])
    setSampleSpeedSearch('')

  }

  const updateSampleSpeedTarget = (idx: number, patch: Partial<SampleSpeedTarget>) => {
    setSampleSpeedTargets((prev) => prev.map((entry, entryIdx) => (entryIdx === idx ? { ...entry, ...patch } : entry)))
  }

  const removeSampleSpeedTarget = (idx: number) => {
    setSampleSpeedTargets((prev) => prev.filter((_, entryIdx) => entryIdx !== idx))
  }

  const addSampleDamageTarget = (key: string) => {
    setSampleOpponentMoveDraft(null)
    setSampleDamageTargets([{ ...blankSampleDamageTarget(), sampleConditions: sampleConditions(sampleForge.key), key, item: itemForSpeciesSelection(key, ''), ability: abilityForSpeciesSelection(indexByKey.get(key), '', key, ''), moveName: '' }])
    setSampleDamageSearch('')
  }

  const updateSampleDamageTarget = (idx: number, patch: Partial<SampleDamageTarget>) => {
    setSampleDamageTargets((prev) => prev.map((entry, entryIdx) => (entryIdx === idx ? { ...entry, ...patch } : entry)))
  }
  const updateSampleBattle = (idx: number, side: 'own' | 'opponent', patch: Partial<SampleBattle>) => {
    setSampleDamageTargets(prev => prev.map((member, i) => {
      if (idx !== i) return member
      const conditions = sampleConditions(sampleForge.key, member.sampleConditions)
      return { ...member, sampleConditions: { ...conditions, [side]: sampleBattle({ ...conditions[side], ...patch }) } }
    }))
  }
  const updateSampleMoveCondition = (idx: number, direction: 'forward' | 'reverse', move: string, field: 'moveHits' | 'conditionalValues', value: number | boolean) => {
    setSampleDamageTargets(prev => prev.map((member, i) => {
      if (i !== idx) return member
      const conditions = sampleConditions(sampleForge.key, member.sampleConditions)
      const key = sampleMoveKey(sampleForge.key, member.key, direction, move)
      return { ...member, sampleConditions: { ...conditions, [field]: { ...conditions[field], [key]: value } } }
    }))
  }
  const selectSampleOpponentMove = (idx: number, slot: number, move: string) => {
    setSampleDamageTargets(prev => prev.map((member, memberIdx) => {
      if (memberIdx !== idx) return member
      const accepted = move ? resolveEligibleMoveInput(move, movePoolByKey[member.key]) : ''
      if (move && !accepted) return member
      if (accepted === null) return member
      const selectedMove = accepted ?? ''
      const opponentMoves = replaceSampleOpponentMove(member.opponentMoves, slot, selectedMove)
      return { ...member, opponentMoves, opponentMoveName: selectedMove || (member.opponentMoveName === member.opponentMoves[slot] ? opponentMoves.find(Boolean) ?? '' : member.opponentMoveName) }
    }))
    setSampleOpponentMoveDraft(null)
  }

  const applySampleDamageBulkPresetSelection = (idx: number, preset: OpponentBulkPreset) => {
    if (preset === 'custom') return
    const next = opponentBulkStateFromPreset(preset)
    updateSampleDamageTarget(idx, {
      hpEv: next.hpEv,
      defenseEv: next.defenseEv,
      spDefenseEv: next.spDefenseEv,
      defenseNature: next.defenseNature,
      spDefenseNature: next.spDefenseNature,
    })
  }

  const removeSampleDamageTarget = (idx: number) => {
    setSampleDamageTargets((prev) => prev.filter((_, entryIdx) => entryIdx !== idx))
  }

  const scrollToSampleSection = (sectionId: string) => {
    if (typeof document === 'undefined') return
    if (sampleWorkbenchTab !== 'builder') {
      setSampleWorkbenchTab('builder')
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
      return
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const applyMemberToPartySlot = (member: PartyMember, slotIdx: number, lockedMoves?: string[]) => {
    const target = party[slotIdx]
    if (!target) return
    const next = [...party]
    next[slotIdx] = {
      ...member,
      picked: target.picked,
      key: member.key,
      evs: { ...member.evs },
      config: { ...member.config },
      tuning: { ...member.tuning },
      item: member.item,
    }
    setParty(next)
    if (member.key) {
      setConfirmedMovesByKey((prev) => ({
        ...prev,
        [member.key]: (lockedMoves ?? prev[member.key] ?? []).filter(Boolean).slice(0, 4),
      }))
    }
    setPartyItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[slotIdx] = visibleChampionsItem(member.key, member.item)
      return nextDrafts
    })
    const nextSearch = [...partySearch]
    nextSearch[slotIdx] = searchDisplayLabel(member.key, siteLanguage)
    setPartySearch(nextSearch)
    setSelectedMy(slotIdx)
    setMainSection('single')
    setActiveTab('party')
  }

  const importCreatorParty = (source: ReturnType<typeof groupCreatorSources>[number]) => {
    // Validate every slot and resolve form-specific abilities before touching state.
    const prepared = prepareCreatorParty(source, key => indexByKey.get(key)?.abilities_ko ?? null)
    if (!prepared) { setCreatorPartyImportError(lt('여섯 슬롯의 검증된 구성을 확인할 수 없습니다.')); return }
    const preset: SavedPartyPreset = {
      id: `creator-${source.sourceId}-${Date.now()}`,
      label: `${source.creator ?? lt('크리에이터')} · ${source.title}`,
      party: prepared.party,
      lockedMovesBySlot: prepared.lockedMovesBySlot,
    }
    addPreset(preset)
    setCreatorPartyImportError('')
    setMainSection('party')
    setActiveTab('party')
  }

  const saveCurrentSample = () => {
    const label = sampleLabelDraft.trim() || `${displayName(sampleRow, siteLanguage)} · ${natureLabel(sampleForge.config.nature, siteLanguage)}`
    const saved: SavedSample = {
      id: `sample-${Date.now()}`,
      label,
      member: { ...sampleForge, evs: { ...sampleForge.evs }, config: { ...sampleForge.config }, tuning: { ...sampleForge.tuning } },
      lockedMoves: sampleLockedMoves.filter(Boolean).slice(0, 4),
    }
    setSavedSamples((prev) => [saved, ...prev])
    setSampleLabelDraft('')
  }

  const confirmPartySlotReplacement = (member: PartyMember, slotIdx: number, lockedMoves?: string[]) => {
    const target = party[slotIdx]
    if (!target || !member.key) return
    const targetName = target.key ? displayName(indexByKey.get(target.key) ?? rows[0], siteLanguage) : lt('빈 슬롯')
    const incomingName = displayName(indexByKey.get(member.key) ?? rows[0], siteLanguage)
    if (!window.confirm(`${slotNumberLabel(slotIdx, siteLanguage)} · ${targetName} → ${incomingName}\n${lt('이 파티 슬롯을 교체할까요?')}`)) return
    applyMemberToPartySlot(member, slotIdx, lockedMoves)
  }

  const applySampleToPartySlot = (slotIdx: number) => {
    confirmPartySlotReplacement(sampleForge, slotIdx, sampleLockedMoves.filter(Boolean).slice(0, 4))
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

  const nudgeTuningEffort = (slotIdx: number, stat: EffortStatKey, delta: number, availableCap: number) => {
    const next = [...party]
    const current = next[slotIdx].evs[stat]
    next[slotIdx] = { ...next[slotIdx], evs: applyChampionsEffort(next[slotIdx].evs, stat, Math.max(0, Math.min(availableCap, current + delta))) }
    setParty(next)
  }

  const updateSampleEffortFromPointer = (stat: EffortStatKey, availableCap: number, clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const nextValue = Math.round(ratio * availableCap)
    setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat, nextValue) }))
  }

  const nudgeSampleEffort = (stat: EffortStatKey, delta: number, availableCap: number) => {
    setSampleForge((prev) => ({
      ...prev,
      evs: applyChampionsEffort(prev.evs, stat, Math.max(0, Math.min(availableCap, prev.evs[stat] + delta))),
    }))
  }

  const focusEffortRange = (element: HTMLDivElement) => {
    const range = element.querySelector<HTMLInputElement>('.effort-gauge-range')
    range?.focus()
  }

  const renderSampleForgeNatureField = () => <PokemonBuildFields key={`sample-nature-${sampleForge.key}`} identity={`sample-${sampleForge.key}`} natureOnly className="sample-own-nature-field"
    ability={sampleForge.ability} nature={sampleForge.config.nature} item={sampleForge.item}
    abilities={sampleAbilityOptions.map(value => ({ value, label: value }))}
    natures={NATURES.map(n => ({ value: n.id, label: natureChipLabel(n.id, siteLanguage) }))}
    itemOptions={query => filterItemOptions(query, siteLanguage, { fallbackToAll: false }).filter(value => isAllowedChampionsItem(sampleForge.key, value)).slice(0, 8).map(value => ({ value, label: itemAutocompletePrimaryLabel(value, siteLanguage), secondary: itemAutocompleteSecondaryLabel(value, siteLanguage), sprite: itemSpriteSrc(sampleForge.key, value) }))}
    onAbility={ability => setSampleForge(prev => ({ ...prev, ability }))}
    onNature={nature => setSampleForge(prev => ({ ...prev, config: { ...prev.config, nature: nature as NatureId } }))}
    onItem={item => setSampleForge(prev => ({ ...prev, item: item ? resolveItemInput(prev.key, item, siteLanguage) : '' }))}
    labels={{ ability: lt('특성'), nature: lt('성격'), item: lt('도구'), none: lt('미선택'), itemPlaceholder: lt('사용 가능 도구 선택') }}
    itemLabel={value => displayItemLabel(value, siteLanguage)} itemSprite={value => itemSpriteSrc(sampleForge.key, value)}
  />

  const renderSampleForgeEffortGrid = (scope: 'speed' | 'damage') => {
    if (!sampleRow) return null
    const visibleStats = scope === 'speed'
      ? EFFORT_STAT_OPTIONS.filter((stat) => stat.key === 'speed')
      : EFFORT_STAT_OPTIONS.filter((stat) => stat.key === 'attack' || stat.key === 'spAttack')
    return <div className={`drag-stat-list sample-embedded-drag-stat-list sample-embedded-drag-stat-list-${scope}`}>
      {visibleStats.map((stat) => {
        const currentEffort = sampleForge.evs[stat.key]
        const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(sampleForge.evs, stat.key))
        const additionalAvailable = Math.max(0, availableCap - currentEffort)
        const actualValue = partyStatValue(sampleRow, sampleForge, stat.key)
        const isMagicStat = sampleMagicCandidate?.stat === stat.key && actualValue % 11 === 0
        const targetEffort = sampleMagicCandidate?.stat === stat.key ? sampleMagicCandidate.nextEffort : null
        const magicPoints = magicEffortPoints(sampleRow, sampleForge, stat.key)
        return <div key={`${scope}-sample-drag-stat-${stat.key}`} className={`drag-stat-card ${statThemeClass(stat.key)} ${isMagicStat ? 'magic' : ''}`}>
          <div className="row-between"><strong>{lt(stat.label)}</strong><span>{actualValue}</span></div>
          <div className="effort-gauge-wrap" role="group" aria-label={`${lt(stat.label)} effort points`}>
            <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateSampleEffortFromPointer(stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
              <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const magicPoint = magicPoints.includes(point); const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); const targetPoint = point === targetEffort; return <span key={`${scope}-sample-effort-cell-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', magicPoint ? 'magic' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : '', targetPoint ? 'target' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
              <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeSampleEffort(stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSampleEffort(stat.key, 1, availableCap) } }} onChange={(e) => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, e.target.value) }))} />
            </div>
            <div className={`effort-gauge-scale ${statThemeClass(stat.key)}`}>{EFFORT_CHECKPOINTS.map((checkpoint) => { const checkpointValue = partyStatValue(sampleRow, { ...sampleForge, evs: { ...sampleForge.evs, [stat.key]: checkpoint } }, stat.key); return <div key={`${scope}-sample-effort-scale-${stat.key}-${checkpoint}`} className="effort-gauge-scale-item"><span>{checkpoint}pt</span><small>{stat.key === sampleMagicCandidate?.stat ? checkpointValue : ''}</small></div> })}</div>
          </div>
          <div className="effort-cell-toolbar"><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, Math.max(0, currentEffort - 1)) }))} disabled={currentEffort <= 0}>-1</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, 0) }))} disabled={currentEffort <= 0}>{lt('최소')}</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, availableCap) }))} disabled={currentEffort >= availableCap}>{lt('최대')}</button><button type="button" className="mini-action" onClick={() => setSampleForge((prev) => ({ ...prev, evs: applyChampionsEffort(prev.evs, stat.key, Math.min(availableCap, currentEffort + 1)) }))} disabled={currentEffort >= availableCap}>+1</button></div>
          <div className="row-between effort-cell-meta"><span className="muted-inline">{lt('현재')} {currentEffort}pt · {lt('추가 가능')} {additionalAvailable}pt</span>{sampleMagicCandidate?.stat === stat.key && targetEffort ? <span className="magic-inline">{lt('목표')} {targetEffort}칸</span> : isMagicStat ? <span className="magic-inline">{lt('11배수 달성')}</span> : null}</div>
        </div>
      })}
    </div>
  }

  const resetAll = () => {
    const warning = siteLanguage === 'ko' ? '저장 파티·상대·샘플·저장 링크를 초기화합니다. 독립 계산기 데이터는 유지됩니다. 계속할까요?'
      : siteLanguage === 'ja' ? '保存パーティ・相手・サンプル・保存リンクを初期化します。独立した計算機のデータは保持されます。続行しますか？'
        : 'Reset saved parties, opponents, samples and saved links? Standalone calculator data will be kept.'
    if (!window.confirm(warning)) return false
    resetWorkspace(`party-${crypto.randomUUID()}`, cloneEmptyParty())
    setPartyItemDrafts(emptyParty.map(() => ''))
    resetRegisteredOpponents()
    setPartySearch(emptyParty.map(() => ''))
    setSelectedMy(0)
    setTuningModalIndex(null)
    setCalcSwapSides(false)
    setCalcAttackStage(0)
    setCalcDefenseStage(0)
    setCalcHitCount(3)
    setCalcWeather('none')
    setCalcTerrain('none')
    setCalcBurned(false)
    setCalcCritical(false)
    setCalcAttackerLowHp(false)
    setCalcTargetPoisoned(false)
    setCalcDefenderFullHp(false)
    setCalcDefenderDisguise(false)
    setCalcMovedAfterTarget(false)
    setCalcFaintedAllies(0)
    setCalcRivalryMode('neutral')
    setCalcParentalBond(false)
    setCalcDefenderStatused(false)
    setCalcElectromorphosisCharged(false)
    setCalcReflect(false)
    setCalcLightScreen(false)
    setCalcAuroraVeil(false)
    setCalcFriendGuard(false)
    setCalcTypeChangeStab(true)
    setCalcConditionalPowerValues({})
    setCalcOpponentBulkPreset('neutral-0')
    setCalcOpponentHpEv(0)
    setCalcOpponentDefenseEv(0)
    setCalcOpponentSpDefenseEv(0)
    setCalcOpponentDefenseNature(1)
    setCalcOpponentSpDefenseNature(1)
    setStab(1.5)
    setEffectiveness(1)
    setBattleNote('')
    setActiveTab('party')
    setMainSection('home')
    setSampleForge(defaultSampleForge())
    setSampleLockedMoves([])
    setSampleItemDraft(displayItemLabel(visibleChampionsItem(defaultSampleForge().key, defaultSampleForge().item), siteLanguage))
    setSampleSearch(searchDisplayLabel(defaultSampleForge().key, siteLanguage))
    setSavedSamples([])
    setCreatorLinkDrafts([])
    setPartyPresetLabelDraft('')
    setSampleSpeedTargets(defaultSampleSpeedTargets)
    setSampleDamageTargets(defaultSampleDamageTargets)
    setSampleSpeedSearch('')
    setSampleDamageSearch('')
    setSampleLabelDraft('')
    // Persist the completed reset rather than removing storage before the effect runs.
    return true
  }

  const exportState = () => {
    if (typeof window === 'undefined') return
    const payload: ImportExportPayload = {
      version: 1,
      party,
      opponents,
      selectedMy,
      selectedOpp,
      calcSwapSides,
      calcAttackStage,
      calcDefenseStage,
      calcHitCount,
      calcWeather,
      calcTerrain,
      calcBurned,
      calcCritical,
      calcAttackerLowHp,
      calcTargetPoisoned,
      calcDefenderFullHp,
      calcDefenderDisguise,
      calcMovedAfterTarget,
      calcFaintedAllies,
      calcRivalryMode,
      calcParentalBond,
      calcDefenderStatused,
      calcElectromorphosisCharged,
      calcReflect,
      calcLightScreen,
      calcAuroraVeil,
      calcFriendGuard,
      calcTypeChangeStab,
      calcConditionalPowerValues,
      calcOpponentBulkPreset,
      calcOpponentHpEv,
      calcOpponentDefenseEv,
      calcOpponentSpDefenseEv,
      calcOpponentDefenseNature,
      calcOpponentSpDefenseNature,
      calcOpponentOffensePreset,
      calcOpponentAttackEv,
      calcOpponentSpAttackEv,
      calcOpponentAttackNature,
      calcOpponentSpAttackNature,
      battleNote,
      confirmedMovesByKey,
      mainSection,
      sampleForge,
      sampleLockedMoves,
      savedSamples,
      savedPartyPresets,
      activePartyPresetId,
      sampleWorkbenchTab,
      creatorLinkDrafts,
      sampleSpeedTargets,
      sampleDamageTargets,
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
      const parsed = validateBackup(JSON.parse(text))
      // Prepare the complete import before any setter: a failed conversion must not partially apply it.
      const nextParty = sanitizeParty(parsed.party)
      const nextOpponents = sanitizeOpponents(parsed.opponents)
      const nextSavedSamples = sanitizeSavedSamples(parsed.savedSamples)
      const nextSavedPartyPresets = sanitizeSavedPartyPresets(parsed.savedPartyPresets)
      const nextCreatorLinkDrafts = sanitizeLinkDrafts(parsed.creatorLinkDrafts)
      const nextSampleSpeedTargets = sanitizeSampleSpeedTargets(parsed.sampleSpeedTargets)
      const nextSampleDamageTargets = sanitizeSampleDamageTargets(parsed.sampleDamageTargets)
      const nextConfirmedMovesByKey = sanitizeConfirmedMovesByKey(parsed.confirmedMovesByKey)
      const nextSampleForge = parsed.sampleForge ? sanitizeParty([parsed.sampleForge])[0] ?? defaultSampleForge() : defaultSampleForge()
      const nextSampleLockedMoves = parsed.sampleLockedMoves ? sanitizeMoveSlotList(parsed.sampleLockedMoves) : nextConfirmedMovesByKey[nextSampleForge.key] ?? []
      const nextBulkPreset = sanitizeOpponentBulkPreset(parsed.calcOpponentBulkPreset)
      const nextBulkState = sanitizeOpponentBulkState({
        hpEv: parsed.calcOpponentHpEv,
        defenseEv: parsed.calcOpponentDefenseEv,
        spDefenseEv: parsed.calcOpponentSpDefenseEv,
        defenseNature: parsed.calcOpponentDefenseNature,
        spDefenseNature: parsed.calcOpponentSpDefenseNature,
      }, nextBulkPreset)
      const nextOffensePreset = sanitizeOpponentOffensePreset(parsed.calcOpponentOffensePreset)
      const nextOffenseState = sanitizeOpponentOffenseState({
        attackEv: parsed.calcOpponentAttackEv,
        spAttackEv: parsed.calcOpponentSpAttackEv,
        attackNature: parsed.calcOpponentAttackNature,
        spAttackNature: parsed.calcOpponentSpAttackNature,
      }, nextOffensePreset)
      const nextPartyItemDrafts = nextParty.map((member) => displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage))
      const nextPartySearch = nextParty.map((member) => searchDisplayLabel(member.key, siteLanguage))
      const nextSampleItemDraft = displayItemLabel(visibleChampionsItem(nextSampleForge.key, nextSampleForge.item), siteLanguage)
      const nextSampleSearch = searchDisplayLabel(nextSampleForge.key, siteLanguage)
      const nextHitCount = Number.isFinite(Number(parsed.calcHitCount)) ? Math.max(1, Math.trunc(Number(parsed.calcHitCount))) : 3
      const nextFaintedAllies = Number.isFinite(Number(parsed.calcFaintedAllies)) ? Math.max(0, Math.min(5, Math.trunc(Number(parsed.calcFaintedAllies)))) : 0
      const nextAttackStage = clampBattleStage(parsed.calcAttackStage)
      const nextDefenseStage = clampBattleStage(parsed.calcDefenseStage)
      const nextSelectedMy = sanitizeSelectedIndex(parsed.selectedMy, nextParty.length)
      const nextSelectedOpp = sanitizeSelectedIndex(parsed.selectedOpp, nextOpponents.length)

      importWorkspace(initializeWorkspace({
        ...(Array.isArray(parsed.party) ? { party: nextParty } : {}),
        ...(parsed.confirmedMovesByKey !== undefined ? { confirmedMovesByKey: nextConfirmedMovesByKey } : {}), savedPartyPresets: nextSavedPartyPresets, activePartyPresetId: parsed.activePartyPresetId,
      }, sanitizeParty(undefined)))
      setPartyItemDrafts(nextPartyItemDrafts)
      importOpponentEntries(nextOpponents, nextSelectedOpp, siteLanguage)
      setPartySearch(nextPartySearch)
      setSelectedMy(nextSelectedMy)
      setCalcSwapSides(Boolean(parsed.calcSwapSides))
      setCalcAttackStage(nextAttackStage)
      setCalcDefenseStage(nextDefenseStage)
      setCalcHitCount(nextHitCount)
      setCalcWeather(parsed.calcWeather ?? 'none')
      setCalcTerrain(parsed.calcTerrain ?? 'none')
      setCalcBurned(Boolean(parsed.calcBurned))
      setCalcCritical(Boolean(parsed.calcCritical))
      setCalcAttackerLowHp(Boolean(parsed.calcAttackerLowHp))
      setCalcTargetPoisoned(Boolean(parsed.calcTargetPoisoned))
      setCalcDefenderFullHp(Boolean(parsed.calcDefenderFullHp))
      setCalcDefenderDisguise(Boolean(parsed.calcDefenderDisguise))
      setCalcMovedAfterTarget(Boolean(parsed.calcMovedAfterTarget))
      setCalcFaintedAllies(nextFaintedAllies)
      setCalcRivalryMode(parsed.calcRivalryMode === 'same' || parsed.calcRivalryMode === 'opposite' ? parsed.calcRivalryMode : 'neutral')
      setCalcParentalBond(Boolean(parsed.calcParentalBond))
      setCalcDefenderStatused(Boolean(parsed.calcDefenderStatused))
      setCalcElectromorphosisCharged(Boolean(parsed.calcElectromorphosisCharged))
      setCalcReflect(Boolean(parsed.calcReflect))
      setCalcLightScreen(Boolean(parsed.calcLightScreen))
      setCalcAuroraVeil(Boolean(parsed.calcAuroraVeil))
      setCalcFriendGuard(Boolean(parsed.calcFriendGuard))
      setCalcTypeChangeStab(parsed.calcTypeChangeStab !== false)
      setSampleWorkbenchTab(parsed.sampleWorkbenchTab ?? 'builder')
      setCreatorLinkDrafts(nextCreatorLinkDrafts)
      setSampleSpeedTargets(nextSampleSpeedTargets)
      setSampleDamageTargets(nextSampleDamageTargets)
      setCalcConditionalPowerValues((parsed.calcConditionalPowerValues && typeof parsed.calcConditionalPowerValues === 'object') ? parsed.calcConditionalPowerValues as Record<string, ConditionalPowerValue> : {})
      setCalcOpponentBulkPreset(nextBulkPreset)
      setCalcOpponentHpEv(nextBulkState.hpEv)
      setCalcOpponentDefenseEv(nextBulkState.defenseEv)
      setCalcOpponentSpDefenseEv(nextBulkState.spDefenseEv)
      setCalcOpponentDefenseNature(nextBulkState.defenseNature)
      setCalcOpponentSpDefenseNature(nextBulkState.spDefenseNature)
      setCalcOpponentOffensePreset(nextOffensePreset)
      setCalcOpponentAttackEv(nextOffenseState.attackEv)
      setCalcOpponentSpAttackEv(nextOffenseState.spAttackEv)
      setCalcOpponentAttackNature(nextOffenseState.attackNature)
      setCalcOpponentSpAttackNature(nextOffenseState.spAttackNature)
      setBattleNote(typeof parsed.battleNote === 'string' ? parsed.battleNote : '')
      setMainSection(parsed.mainSection ?? 'home')
      setSampleForge(nextSampleForge)
      setSampleLockedMoves(nextSampleLockedMoves)
      setSampleItemDraft(nextSampleItemDraft)
      setSampleSearch(nextSampleSearch)
      setSavedSamples(nextSavedSamples)
        setSampleLabelDraft('')
    } catch {
      if (typeof window !== 'undefined') window.alert(lt('불러오기 실패: JSON 형식을 확인하세요.'))
    } finally {
      event.target.value = ''
    }
  }

  const applyOcrImportedParty = (imported: OcrImportedPartyMember[], targetId: string) => {
    const nextParty = cloneEmptyParty()
    const importedMovesByKey: Record<string, string[]> = {}
    imported.slice(0, nextParty.length).forEach((entry, idx) => {
      nextParty[idx] = clonePartyMember(entry.member)
      importedMovesByKey[entry.member.key] = entry.lockedMoves
    })
    applyImportedBuild(targetId, nextParty, importedMovesByKey)
    setPartySearch(nextParty.map((member) => searchDisplayLabel(member.key, siteLanguage)))
    setPartyItemDrafts(nextParty.map((member) => displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage)))
    setSelectedMy(firstFilledIndex(nextParty, 0))
  }

  const importPartyFromImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length || partyImageImportBusy) return
    const { targetId, isCurrent } = captureSelection()
    try {
      setPartyImageImportBusy(true)
      setPartyImageImportStatus(lt('OCR 준비 중...'))
      const Tesseract = await import('tesseract.js')
      const recognize = async (image: File | HTMLCanvasElement, fileLabel: string) => {
        const result = await Tesseract.recognize(image, 'jpn+eng+kor', {
          logger: (message) => {
            if (message.status === 'recognizing text' && typeof message.progress === 'number') {
              setPartyImageImportStatus(`${fileLabel} · ${lt('OCR 추출 중...')} ${Math.round(message.progress * 100)}%`)
            }
          },
        })
        return result.data.text
      }
      let importedCount = 0
      const result = await runGuardedOcrImport({
        files,
        recognize: (file) => {
          setPartyImageImportStatus(`${file.name} · ${lt('레이아웃 OCR 분석 중...')}`)
          return recognize(file, file.name)
        },
        parse: parseOcrImportedPartyDocuments,
        isCurrent,
        confirm: (imported) => {
          const summary = imported.slice(0, 6).map((entry) => {
            const nature = natureChipLabel(entry.member.config.nature, siteLanguage)
            const moves = entry.lockedMoves.slice(0, 2).join(', ')
            return `${searchDisplayLabel(entry.member.key, siteLanguage)}${nature ? ` · ${nature}` : ''}${moves ? ` · ${moves}` : ''}`
          }).join('\n')
          return typeof window === 'undefined' || window.confirm(`${lt('다음 파티를 가져올까요?')}\n${summary}`)
        },
        apply: (imported) => { importedCount = imported.length; applyOcrImportedParty(imported, targetId) },
      })
      if (result === 'empty') {
        setPartyImageImportStatus(lt('사진에서 파티를 찾지 못했습니다.'))
        if (typeof window !== 'undefined') window.alert(lt('사진에서 포켓몬 이름을 찾지 못했습니다. 조금 더 선명한 스크린샷으로 다시 시도해 주세요.'))
        return
      }
      if (result === 'stale') {
        setPartyImageImportStatus(lt('파티 선택이 변경되어 사진을 반영하지 않았습니다. 다시 시도해 주세요.'))
        return
      }
      if (result === 'cancelled') {
        setPartyImageImportStatus(lt('사진 IMPORT가 취소되었습니다.'))
        return
      }
      setPartyImageImportStatus(`${lt('사진 IMPORT 완료')} · ${importedCount}${lt('마리 반영')}`)
    } catch (error) {
      console.error(error)
      setPartyImageImportStatus(lt('사진 IMPORT 실패'))
      if (typeof window !== 'undefined') window.alert(lt('사진 IMPORT에 실패했습니다. 잠시 후 다시 시도해 주세요.'))
    } finally {
      setPartyImageImportBusy(false)
      event.target.value = ''
    }
  }

  const librarySource = librarySourceId ? [...groupCreatorSources(catalog), ...individualCreatorSources(catalog)].find(source => source.id === librarySourceId) : null
  const libraryContext: LibraryViewContext = { language: libraryLanguage, format: libraryFormat, query: libraryQuery, kind: libraryContentKind }
  const matchingLibraryPokemonKeys = new Set(libraryQuery.trim() ? searchPokemon(rows, libraryQuery, { includeMega: true }).map(row => row.key) : [])
  const visibleSources = filterCreatorSources(libraryContentKind === 'pokemon' ? individualCreatorSources(catalog) : groupCreatorSources(catalog), {
    language: libraryLanguage, format: libraryFormat, query: '',
    contentKind: libraryContentKind,
  }).filter(source => source.confirmedMemberCount > 0 && (!libraryQuery.trim() ||
    filterCreatorSources([source], { language: libraryLanguage, format: libraryFormat, query: libraryQuery, contentKind: libraryContentKind }).length > 0 ||
    source.members.some(member => matchingLibraryPokemonKeys.has(member.pokemonKey))))

  const pendingCreatorLeads = filterCreatorSamples(catalog.filter(entry => !entry.partialBuild && entry.contentKind === 'unknown'), { language: libraryLanguage, format: libraryFormat, query: libraryQuery })
  const moveSlotLabels = { slot: siteLanguage === 'ja' ? '番' : siteLanguage === 'en' ? ' · Move' : lt('번'), category: (category: MoveCategory | null) => displayMoveCategoryName(category, siteLanguage),
    power: lt('위력'), accuracy: lt('명중'), pp: 'PP', unknown: lt('미확인') }
  const creatorCard = (entry: CreatorSample) => {
    const megaKey = entry.pokemonKey.startsWith('mega-') ? entry.pokemonKey : null
    const baseKey = megaKey ? megaBaseKey(megaKey) : null
    const canToggle = Boolean(baseKey && indexByKey.has(baseKey) && indexByKey.has(megaKey!))
    const formKey = canToggle && creatorMegaSelection[entry.id] === false ? baseKey! : entry.pokemonKey
    const row = indexByKey.get(formKey) // No substitute species for unsupported forms.
    const build = entry.build ? { ...entry.partialBuild, ...entry.build } : entry.partialBuild
    const confirmedEvs = confirmedCreatorEfforts(entry.build, entry.partialBuild)
    const member: PartyMember | null = row && build?.nature && confirmedEvs ? {
      key: formKey, evs: confirmedEvs, config: { nature: build.nature, scarf: false, speedStage: 0 },
      picked: false, tuning: { magicNumber: 0, maxValue: 0 }, item: build.item ?? '', ability: '',
    } : null
    const actualStats: CardStat[] = createReadonlyCardStats(EFFORT_STAT_OPTIONS.map(stat => ({
      key: stat.key, label: lt(stat.label), theme: statThemeClass(stat.key),
    })), build, statKey => row && member ? partyStatValue(row, member, statKey) : null, formKey)
    const name = row ? displayName(row, siteLanguage) : entry.title.split(' — ').pop() || entry.pokemonKey
    const recordedForm = entry.partialBuild?.actualStatsForm
    const sourceStatsShown = Boolean(entry.partialBuild?.actualStats && recordedForm === formKey)
    const showActualStats = sourceStatsShown || Boolean(member)
    const stats: CardStat[] = showActualStats ? actualStats : actualStats.map(stat => ({ ...stat, value: row?.[stat.key] ?? null }))
    const statsLabel = sourceStatsShown ? lt('원본 이미지에 기록된 실수치') : member ? lt('계산 실수치 · 원본 실수치 미기록') : row ? lt('종족값') : lt('실수치 미기록')
    // The Mega ability is not evidence of a pre-Mega ability. Use only source-backed choices.
    const preMegaAbilities = entry.partialBuild?.preMegaAbilities
    const ability = sourceBackedCardAbility({ megaKey, formKey, rowAbilities: row?.abilities_ko,
      ability: build?.ability, preMegaAbilities, actualStatsForm: recordedForm })
    const localizedAbility = ability?.split(' / ').map(value => {
      const info = resolveAbilityInfo(value, row)
      return info ? (siteLanguage === 'ja' ? abilityDescriptionFor(info.key)?.nameJa || abilityDisplayName(info.key, info.koLabel, siteLanguage) : abilityDisplayName(info.key, info.koLabel, siteLanguage)) : siteLanguage === 'ko' ? value : `${lt('원본 특성 표기')}: ${value}`
    }).join(' / ')
    const localizedItem = build?.item ? displayItemLabel(build.item, siteLanguage) : undefined
    const itemFromSourceOnly = Boolean(build?.item && siteLanguage !== 'ko' && localizedItem === build.item)
    return <ReadonlyPokemonCard name={name} sprite={row?.sprite} types={row?.types}
      ability={localizedAbility} nature={build?.nature ? natureChipLabel(build.nature, siteLanguage) : undefined}
      item={itemFromSourceOnly ? `${lt('원본 도구 표기')}: ${localizedItem}` : localizedItem}
      itemSprite={build?.item ? itemSpriteSrc(entry.pokemonKey, build.item) : undefined}
      stats={stats} statsLabel={statsLabel} statsUnknown={lt('미확인')} showEffort={Boolean(build?.evs || entry.partialBuild?.evsKnown)}
      labels={{ ability: lt('특성'), nature: lt('성격'), item: lt('도구'), unknown: lt('미확인') }}
      calculationNote={!sourceStatsShown && !member ? row ? lt('노력 포인트 일부 또는 성격이 미확인되어 실수치를 계산하지 않습니다.') : lt('지원되지 않는 폼으로 실수치를 계산하지 않습니다.') : undefined}>
      {canToggle ? <div className="creator-form-toggle" role="group" aria-label={lt('메가진화 전후')}>
        <button type="button" aria-pressed={formKey === baseKey} onClick={() => setCreatorMegaSelection(prev => ({ ...prev, [entry.id]: false }))}>{lt('일반')} · {displayName(indexByKey.get(baseKey!)!, siteLanguage)}</button>
        <button type="button" aria-pressed={formKey === megaKey} onClick={() => setCreatorMegaSelection(prev => ({ ...prev, [entry.id]: true }))}>{lt('메가')} · {displayName(indexByKey.get(megaKey!)!, siteLanguage)}</button>
      </div> : null}
      {build?.moves ? <MoveSlotsEditor className="creator-library-moves" label={lt('기술 구성')} labels={moveSlotLabels} ownerId={`library-${entry.id}`} role="readonly" slots={Array.from({ length: 4 }, (_, moveIdx) => {
        const move = build.moves?.[moveIdx] ?? ''
        const meta = resolveMoveMeta(move, [], movePoolByKey)
        return { id: `${moveIdx}`, name: move, type: meta?.type, meta, className: moveTypeThemeClass(meta?.type),
          tooltipProps: bindTooltip(move ? moveTooltipData(move, siteLanguage) : null),
          inputProps: { readOnly: true, 'aria-label': `${lt('기술')} ${moveIdx + 1}` } }
      })} /> : null}
    </ReadonlyPokemonCard>
  }

  return (
    <div className="app-shell">
      <header>
        <div className="header-top-row">
          <div className="header-title-row">
            <div className="header-title-stack">
              <div className="header-main-row">
                <h1 className="visually-hidden">{lt('포켓몬 챔피언스 배틀 도우미')}</h1>
                <div className="header-utility-row">
                  <div className="header-icon-actions">
                  <div className="language-menu-wrap header-language-wrap">
                    <button type="button" className="icon-button" aria-label={lt('언어 선택')} title={lt('언어')} onClick={() => { setLanguageMenuOpen((prev) => !prev); setSettingsMenuOpen(false) }}>
                      <UiIcon name="globe" />
                    </button>
                    {languageMenuOpen ? (
                      <div className="language-menu">
                        <button type="button" className={`language-menu-item ${siteLanguage === 'ko' ? 'active' : ''}`} onClick={() => { setSiteLanguage('ko'); setLanguageMenuOpen(false) }}>{lt('한국어')}</button>
                        <button type="button" className={`language-menu-item ${siteLanguage === 'ja' ? 'active' : ''}`} onClick={() => { setSiteLanguage('ja'); setLanguageMenuOpen(false) }}>{lt('일본어')}</button>
                        <button type="button" className={`language-menu-item ${siteLanguage === 'en' ? 'active' : ''}`} onClick={() => { setSiteLanguage('en'); setLanguageMenuOpen(false) }}>{lt('영어')}</button>
                      </div>
                    ) : null}
                  </div>
                  <div className="settings-menu-wrap">
                    <button type="button" className="icon-button" aria-label={lt('설정')} title={lt('설정')} onClick={() => { setSettingsMenuOpen((prev) => !prev); setLanguageMenuOpen(false) }}>
                      <UiIcon name="settings" />
                    </button>
                    {settingsMenuOpen ? (
                      <div className="settings-menu">
                        <div className="settings-menu-section">
                          <span className="settings-menu-title">{lt('데이터 관리')}</span>
                          <button type="button" className="settings-action-item" onClick={() => { exportState(); setSettingsMenuOpen(false) }}>
                            <strong><UiIcon name="download" size={17} />{lt('전체 데이터 내보내기')}</strong>
                            <span>{lt('현재 작업 상태를 JSON으로 저장')}</span>
                          </button>
                          <button type="button" className="settings-action-item" onClick={() => { fileInputRef.current?.click(); setSettingsMenuOpen(false) }}>
                            <strong><UiIcon name="upload" size={17} />{lt('전체 데이터 불러오기')}</strong>
                            <span>{lt('저장한 JSON 상태 파일을 불러오기')}</span>
                          </button>
                          <button type="button" className="settings-action-item danger" onClick={() => { if (resetAll()) setSettingsMenuOpen(false) }}>
                            <strong><UiIcon name="trash" size={17} />{lt('전체 데이터 초기화')}</strong>
                            <span>{lt('파티·상대·샘플을 전부 초기화')}</span>
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  </div>
                </div>
              </div>
              <div className="header-route-menu">
                <nav id="primary-navigation" className="header-primary-tabs" aria-label={lt('모드 선택')}>
                  <a className={`header-primary-tab ${mainSection === 'home' ? 'active' : ''}`} href="#/" aria-current={mainSection === 'home' ? 'page' : undefined}><UiIcon name={homeRoute.icon} /><span>{lt(homeRoute.label)}</span></a>
                  {routeGroups.map(group => <div key={group.section} className="header-route-group" aria-label={lt(group.label)}>
                    {group.links.length > 1 ? <span className="header-route-group-label">{lt(group.label)}</span> : <span className="visually-hidden">{lt(group.label)}</span>}
                    <div className="header-route-group-links">{group.links.map(link => <a key={link.href} href={link.href}
                      className={`header-primary-tab ${mainSection === link.section && (link.section !== 'sample' || (link.tab === 'library' ? sampleWorkbenchTab === 'library' : sampleWorkbenchTab !== 'library')) ? 'active' : ''}`}
                      aria-current={mainSection === link.section && (link.section !== 'sample' || (link.tab === 'library' ? sampleWorkbenchTab === 'library' : sampleWorkbenchTab !== 'library')) ? 'page' : undefined}><UiIcon name={link.icon} /><span>{lt(link.label)}</span></a>)}</div>
                  </div>)}
                </nav>
              </div>
            </div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden-file" onChange={importState} />
        <input ref={partyImageInputRef} type="file" accept="image/*" multiple className="hidden-file" onChange={importPartyFromImage} />
      </header>

      {doubleBulkEditorSlot !== null ? (() => {
        const modalSlot = doubleBulkEditorSlot
        const modalMeta = doubleSlotMeta[modalSlot]
        if (modalMeta.side !== 'opp' || !modalMeta.option?.entry || !modalMeta.option?.row) return null
        const modalEntry = modalMeta.option.entry
        const modalRow = modalMeta.option.row
        const modalName = displayName(modalRow, siteLanguage)
        const modalEvs = opponentEffortValues(modalEntry)
        const visibleStats = EFFORT_STAT_OPTIONS.filter((stat): stat is { key: Extract<EffortStatKey, 'hp' | 'defense' | 'spDefense' | 'speed'>, short: string, label: string } => stat.key === 'hp' || stat.key === 'defense' || stat.key === 'spDefense' || stat.key === 'speed')
        return <div className="modal-backdrop" onClick={() => setDoubleBulkEditorSlot(null)}>
          <div className="modal-card double-opponent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="row-between modal-header double-opponent-modal-header">
              <div className="double-opponent-modal-title-wrap">
                {modalRow.sprite ? <img src={modalRow.sprite} alt={modalName} className="double-opponent-modal-sprite" /> : null}
                <div className="double-opponent-modal-title-copy">
                  <h2>{modalName} · {lt('노력치 보정')}</h2>
                </div>
              </div>
              <button type="button" className="action-button double-opponent-modal-close" onClick={() => setDoubleBulkEditorSlot(null)}>{lt('닫기')}</button>
            </div>
            <div className="modal-grid double-opponent-modal-grid">
              <label className="double-opponent-modal-control double-opponent-modal-control-check">
                <span>{lt('최속 가정')}</span>
                <input type="checkbox" checked={modalEntry.natureBoost} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { natureBoost: e.target.checked })} />
              </label>
              <label className="double-opponent-modal-control double-opponent-modal-control-check">
                <span>{lt('스카프')}</span>
                <input type="checkbox" checked={modalEntry.scarf} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { scarf: e.target.checked })} />
              </label>
              <label className="double-opponent-modal-control">
                <span>{lt('랭크')}</span>
                <select value={modalEntry.speedStage} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { speedStage: clampSpeedStage(e.target.value) })}>
                  {SPEED_STAGE_OPTIONS.map((n) => <option key={`double-bulk-modal-stage-${modalSlot}-${n}`} value={n}>{n >= 0 ? `+${n}` : n}</option>)}
                </select>
              </label>
            </div>
            <div className="pick-summary-badges double-opponent-modal-chips">
              <label className={`double-opponent-modal-toggle-chip ${modalEntry.defenseNature === 1.1 ? 'active' : ''}`}>
                <input type="checkbox" checked={modalEntry.defenseNature === 1.1} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { defenseNature: e.target.checked ? 1.1 : 1 })} />
                <span>{lt('+방어 성격')}</span>
              </label>
              <label className={`double-opponent-modal-toggle-chip ${modalEntry.spDefenseNature === 1.1 ? 'active' : ''}`}>
                <input type="checkbox" checked={modalEntry.spDefenseNature === 1.1} onChange={(e) => updateDoubleOpponentBulk(modalSlot, { spDefenseNature: e.target.checked ? 1.1 : 1 })} />
                <span>{lt('+특방 성격')}</span>
              </label>
              <span className="double-opponent-modal-total-meta">{lt('노력치 합')} {totalEffortPoints(modalEvs)}</span>
            </div>
            <div className="drag-stat-list double-opponent-drag-stat-list">
              {visibleStats.map((stat) => {
                const currentEffort = modalEvs[stat.key]
                const availableCap = Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(modalEvs, stat.key))
                const additionalAvailable = Math.max(0, availableCap - currentEffort)
                const actualValue = opponentStatValue(modalRow, modalEntry, stat.key)
                const boosted = stat.key === 'defense' ? modalEntry.defenseNature === 1.1 : stat.key === 'spDefense' ? modalEntry.spDefenseNature === 1.1 : stat.key === 'speed' && modalEntry.natureBoost
                const magicPoints = boosted ? magicEffortMarkers(stat.key, stat.key, effort => opponentStatValue(modalRow, { ...modalEntry, ...opponentPatchFromEffortValues({ ...modalEvs, [stat.key]: effort }) }, stat.key)) : []
                return <div key={`double-opponent-effort-${modalSlot}-${stat.key}`} className={`drag-stat-card ${statThemeClass(stat.key)}`}>
                  <div className="row-between"><strong>{lt(stat.label)}</strong><span>{actualValue}</span></div>
                  <div className="effort-gauge-wrap" role="group" aria-label={`${lt(stat.label)} effort points`}>
                    <div className={`effort-gauge-track ${statThemeClass(stat.key)}`} tabIndex={0} role="slider" aria-label={`${lt(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={availableCap} aria-valuenow={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeDoubleOpponentEffort(modalSlot, stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeDoubleOpponentEffort(modalSlot, stat.key, 1, availableCap) } }} onPointerDown={(e) => { e.preventDefault(); focusEffortRange(e.currentTarget); e.currentTarget.setPointerCapture(e.pointerId); updateDoubleOpponentEffortFromPointer(modalSlot, stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerMove={(e) => { if ((e.buttons & 1) !== 1) return; updateDoubleOpponentEffortFromPointer(modalSlot, stat.key, availableCap, e.clientX, e.currentTarget) }} onPointerUp={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}>
                      <div className={`effort-gauge-cells ${statThemeClass(stat.key)}`} aria-hidden="true">{Array.from({ length: CHAMPIONS_EFFORT_PER_STAT_CAP }, (_, cellIdx) => { const point = cellIdx + 1; const reachable = point <= availableCap; const filled = point <= currentEffort; const currentPoint = point === currentEffort && currentEffort > 0; const checkpointPoint = EFFORT_CHECKPOINTS.includes(point as 11 | 22 | 32); return <span key={`double-opponent-effort-cell-${modalSlot}-${stat.key}-${point}`} className={['effort-gauge-cell', reachable ? 'reachable' : 'locked', filled ? 'filled' : '', currentPoint ? 'current' : '', checkpointPoint ? 'checkpoint' : '', magicPoints.includes(point) ? 'magic' : ''].filter(Boolean).join(' ')} title={`${lt(stat.label)} ${point}pt`} /> })}</div>
                      <input type="range" className="effort-gauge-range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={currentEffort} onKeyDown={(e) => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeDoubleOpponentEffort(modalSlot, stat.key, -1, availableCap) } if (e.key === 'ArrowRight') { e.preventDefault(); nudgeDoubleOpponentEffort(modalSlot, stat.key, 1, availableCap) } }} onChange={(e) => { const evs = applyChampionsEffort(modalEvs, stat.key, e.target.value); updateDoubleOpponentBulk(modalSlot, opponentPatchFromEffortValues(evs)) }} />
                    </div>
                    <div className={`effort-gauge-scale ${statThemeClass(stat.key)}`}>{EFFORT_CHECKPOINTS.map((checkpoint) => <div key={`double-opponent-effort-scale-${modalSlot}-${stat.key}-${checkpoint}`} className="effort-gauge-scale-item"><span>{checkpoint}pt</span><small>{opponentStatValue(modalRow, { ...modalEntry, ...opponentPatchFromEffortValues({ ...modalEvs, [stat.key]: checkpoint }) }, stat.key)}</small></div>)}</div>
                  </div>
                  <div className="effort-cell-toolbar"><button type="button" className="mini-action" onClick={() => nudgeDoubleOpponentEffort(modalSlot, stat.key, -1, availableCap)} disabled={currentEffort <= 0}>-1</button><button type="button" className="mini-action" onClick={() => { const evs = applyChampionsEffort(modalEvs, stat.key, 0); updateDoubleOpponentBulk(modalSlot, opponentPatchFromEffortValues(evs)) }} disabled={currentEffort <= 0}>{lt('최소')}</button><button type="button" className="mini-action" onClick={() => { const evs = applyChampionsEffort(modalEvs, stat.key, availableCap); updateDoubleOpponentBulk(modalSlot, opponentPatchFromEffortValues(evs)) }} disabled={currentEffort >= availableCap}>{lt('최대')}</button><button type="button" className="mini-action" onClick={() => nudgeDoubleOpponentEffort(modalSlot, stat.key, 1, availableCap)} disabled={currentEffort >= availableCap}>+1</button></div>
                  <div className="row-between effort-cell-meta"><span className="muted-inline">{lt('현재')} {currentEffort}pt · {lt('추가 가능')} {additionalAvailable}pt</span></div>
                </div>
              })}
            </div>
          </div>
        </div>
      })() : null}

      {tuningModalIndex !== null && tuningMember && tuningRow ? <EffortTuningModal
        evs={tuningMember.evs} nature={tuningMember.config.nature} natureOptions={NATURES.map(nature => ({ id: nature.id, label: natureLabel(nature.id, siteLanguage) }))}
        actualValue={(key, effort) => partyStatValue(tuningRow, effort === undefined ? tuningMember : { ...tuningMember, evs: { ...tuningMember.evs, [key]: effort } }, key)}
        onEffort={(key, value) => { const next = [...party]; next[tuningModalIndex] = { ...next[tuningModalIndex], evs: applyChampionsEffort(next[tuningModalIndex].evs, key, value) }; setParty(next) }}
        onNature={nature => { const next = [...party]; next[tuningModalIndex] = { ...next[tuningModalIndex], config: { ...next[tuningModalIndex].config, nature } }; setParty(next) }}
        onClose={() => setTuningModalIndex(null)} translate={lt} statTheme={statThemeClass} opener={partyTuningOpener.current} magicCandidate={magicCandidate} magicPoints={key => magicEffortPoints(tuningRow, tuningMember, key)} /> : null}

      {sampleTuningModalOpen && mainSection === 'sample' && sampleWorkbenchTab !== 'library' && sampleTuningIdentity === sampleForge.key ? <EffortTuningModal
        evs={sampleForge.evs} nature={sampleForge.config.nature}
        natureOptions={NATURES.map(nature => ({ id: nature.id, label: natureLabel(nature.id, siteLanguage) }))}
        actualValue={(key, effort) => partyStatValue(sampleRow, effort === undefined ? sampleForge : { ...sampleForge, evs: { ...sampleForge.evs, [key]: effort } }, key)}
        onEffort={(key, value) => setSampleForge(prev => ({ ...prev, evs: applyChampionsEffort(prev.evs, key, value) }))}
        onNature={nature => setSampleForge(prev => ({ ...prev, config: { ...prev.config, nature } }))}
        onClose={() => setSampleTuningModalOpen(false)} translate={lt} statTheme={statThemeClass}
        title={`${displayName(sampleRow, siteLanguage)} · ${lt('노력치 보정')}`}
        opener={sampleTuningOpener.current} magicCandidate={sampleMagicCandidate}
        magicPoints={key => magicEffortPoints(sampleRow, sampleForge, key)} /> : null}

      <main className="grid page-frame">
        <PageHeading title={lt(mainSection === 'home' ? '홈' : mainSection === 'party' ? '내 파티' : mainSection === 'single' ? '대면' : mainSection === 'quickDamage' ? '계산기' : mainSection === 'speedLine' ? '스피드라인' : mainSection === 'sample' ? sampleWorkbenchTab === 'library' ? '샘플 라이브러리' : '샘플 연구소' : mainSection === 'dex' ? '도감' : '더블배틀')}
          icon={routeIconFor(mainSection, sampleWorkbenchTab)} />
        {(mainSection === 'party' || mainSection === 'single') ? <PartyContextBar
          language={siteLanguage} label={activePartyLabel} activeId={activePartyPresetId}
          records={savedPartyPresets} selectedMy={selectedMy} selectedOpp={selectedOpp}
          mode={mainSection} onSelect={applyPartyPreset} /> : null}
        {mainSection === 'quickDamage' ? <QuickDamagePanel language={siteLanguage} tooltipForMove={name => bindTooltip(name ? moveTooltipData(name, siteLanguage) : null)} /> : null}
        {mainSection === 'home' ? (
        <>
          <section className="panel wide home-route-panel home-surface-panel">
            <div className="home-route-groups">
              {routeGroups.map(group => <section key={group.section} className="home-route-group">
                <div className="home-route-group-head"><h3>{lt(group.label)}</h3></div>
                <div className="home-route-grid home-route-grid-compact">
                  {group.links.map(link => <a key={link.href} className="home-route-card calm" href={link.href}>
                    <UiIcon name={link.icon} /><strong>{lt(link.label)}</strong><UiIcon name="chevron" size={16} className="ui-icon home-route-chevron" />
                  </a>)}
                </div>
              </section>)}
            </div>
          </section>

          <section className="home-footer-text-block home-footer-text-block-quiet" aria-labelledby="project-information-heading">
            <h3 id="project-information-heading">{lt('프로젝트 정보')}</h3>
            <div className="home-footer-text-row home-footer-links-quiet">
              <span className="home-footer-label">{lt('프로젝트 링크')}</span>
              <div className="home-link-list text-only">
                <a href="https://github.com/w8385/Pokemon-Champions-Assistant" target="_blank" rel="noreferrer">GitHub — Pokemon-Champions-Assistant</a>
                <a href="https://forms.gle/Yrav9HB7Fzdffh3Q8" target="_blank" rel="noreferrer">{lt('기능제안/버그제보')}</a>
                <a href="mailto:me@w8385.dev">me@w8385.dev</a>
              </div>
            </div>
            <div className="home-footer-text-row">
              <span className="home-footer-label">{lt('저작권 및 안내')}</span>
              <p className="muted home-footer-copy">{lt('포켓몬 관련 명칭과 이미지에 대한 권리는 각 권리자에게 있으며, 이 프로젝트는 비공식 팬메이드 도구입니다.')}</p>
              <div className="home-reference-list-wrap">
                <span className="home-reference-label">{lt('참고 데이터베이스')}</span>
                <div className="home-reference-list">
                  <span className="pick-badge">PokéAPI</span>
                  <span className="pick-badge">veekun</span>
                  <span className="pick-badge">PokemonDB</span>
                  <span className="pick-badge">Serebii</span>
                  <span className="pick-badge">Smogon Dex</span>
                  <span className="pick-badge">Pikalytics</span>
                  <span className="pick-badge">champs.pokedb.tokyo</span>
                </div>
              </div>
            </div>
          </section>
        </>
        ) : null}
        {mainSection === 'double' ? <section className="panel wide workflow-shell-panel">
          <div className="row-between section-head workflow-shell-head">
            <div>
              <span className="home-section-label">{lt('현재 흐름')}</span>
              <h2>{lt('더블배틀')}</h2>
              <p className="muted">{lt('더블은 파티와 상대 정리 후 플래너에서 턴 흐름을 봅니다.')}</p>
            </div>
          </div>
            <div className="workflow-step-shell double">
              <button type="button" className={`workflow-step-card ${activeTab === 'party' ? 'active' : ''}`} onClick={() => setActiveTab('party')}>
                <span className="workflow-step-number">01</span>
                <div className="workflow-step-copy">
                  <strong>{lt('내 파티 관리')}</strong>
                  <p>{lt('내 포켓몬과 기술 기준을 정리합니다.')}</p>
                </div>
              </button>
              <button type="button" className={`workflow-step-card ${activeTab === 'pick' ? 'active' : ''}`} onClick={() => setActiveTab('pick')}>
                <span className="workflow-step-number">02</span>
                <div className="workflow-step-copy">
                  <strong>{lt('상대 엔트리')}</strong>
                  <p>{lt('상대 공개 정보와 가정을 정리합니다.')}</p>
                </div>
              </button>
              <button type="button" className={`workflow-step-card ${activeTab === 'power' ? 'active' : ''}`} onClick={() => setActiveTab('power')}>
                <span className="workflow-step-number">03</span>
                <div className="workflow-step-copy">
                  <strong>{lt('더블 배틀 플래너')}</strong>
                  <p>{lt('더블 기준 화력과 행동순을 정리합니다.')}</p>
                </div>
              </button>
            </div>
        </section> : null}

        {mainSection === 'speedLine' ? <SpeedLinePanel rows={rows} state={speedLineState} warnings={speedLineWarnings} onChange={next => { lastSpeedLineRoute.current = speedLineRouteAfterEdit(next); setSpeedLineState(next); setSpeedLineWarnings([]) }} language={siteLanguage} translate={lt} displayName={row => displayName(row, siteLanguage)} /> : null}

        {mainSection === 'dex' ? <>
          {!dexSelectedValue ? <>
          <section className="panel wide">
            <div className="dex-tab-panel">
              <div className="dex-unified-search-card">
                <div className="section-head compact">
                  <div>
                    <strong>{lt('통합검색')}</strong>
                    <p className="muted">{lt('포켓몬/기술/특성/도구를 검색해서 핵심 정보를 빠르게 확인합니다.')}</p>
                  </div>
                </div>
                <div className="dex-search-autocomplete">
                  <SearchCombobox id="dex-unified-search" mode="filter" options={[]} onSelect={() => {}}
                    value={dexUnifiedSearchDraft}
                    placeholder={lt('포켓몬 / 기술 / 특성 / 도구 검색')}
                    onChange={(value) => {
                      restoringDexRoute.current = null
                      pendingDexScrollRestore.current = null
                      setDexUnifiedSearchDraft(value)
                    }}
                    inputProps={{ onCompositionStart: () => setDexUnifiedSearchComposing(true),
                    onCompositionEnd: (e) => {
                      const nextValue = e.currentTarget.value
                      restoringDexRoute.current = null
                      pendingDexScrollRestore.current = null
                      setDexUnifiedSearchComposing(false)
                      setDexUnifiedSearchDraft(nextValue)
                      setDexUnifiedSearch(nextValue)
                    },
                    onKeyDown: (e) => {
                      if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229 || dexUnifiedSearchComposing || dexQueryPending || !dexResultKeys.length) return
                      document.querySelector<HTMLAnchorElement>('.dex-browse-card')?.click()
                    } }}
                  />
                </div>
              </div>
              <div className="tab-bar section-menu-tabs dex-mode-tabs ui-segmented">
                {([
                  ['pokemon', lt('포켓몬')],
                  ['move', lt('기술')],
                  ['ability', lt('특성')],
                  ['item', lt('도구')],
                ] as [DexSearchMode, string][]).map(([mode, label]) => (
                  <button key={`dex-mode-${mode}`} type="button" className={`tab-chip ${dexSearchMode === mode ? 'active' : ''}`} onClick={() => { if (mode === dexSearchMode) return; restoringDexRoute.current = null; pendingDexScrollRestore.current = null; setDexSelectedValue(null); setDexSearchMode(mode) }}>{label}</button>
                ))}
              </div>
            </div>
          </section>
          <section className="panel wide dex-content-panel"><h3>{lt('검색 결과')}</h3>
            <DexBrowseGrid items={dexQueryPending ? [] : dexBrowseCards.slice(0, dexCount)} totalCount={dexBrowseCards.length}
              scope={dexScope} language={siteLanguage} busy={dexQueryPending} onLoadMore={loadMoreDex}
              onNavigate={navigateDexCard} renderTypeBadge={type => <TypeBadgeImage type={type} />}
              tooltipPropsForItem={id => { const item = dexBrowseResults.find(result => result.id === id); return item?.kind === 'item' ? bindTooltip(itemTooltipData(item.item, siteLanguage)) : {} }} />
          </section></> : null}
          {dexSelectedValue ? <section className="panel wide dex-content-panel dex-detail-page">
            <a href={dexListHref} className="chip-button dex-back-link" onClick={navigateDexBack}><UiIcon name="chevron" size={16} className="ui-icon ui-icon-back" />{siteLanguage === 'en' ? '← Back to results' : siteLanguage === 'ja' ? '← 一覧へ戻る' : '← 목록으로 돌아가기'}</a>
            <div className="dex-browser-detail">
              {dexSelectedRow ? <div className="dex-detail-card">
                <div className="dex-detail-head">
                  <div className="dex-detail-identity">
                    {dexSelectedRow.sprite ? <img src={dexSelectedRow.sprite} alt={displayName(dexSelectedRow, siteLanguage)} className="dex-detail-sprite" /> : null}
                    <div>
                      <h3>{displayName(dexSelectedRow, siteLanguage)}</h3>
                      <p className="muted">{dexSelectedRow.name_en}</p>
                    </div>
                  </div>
                  <div className="pick-summary-badges">
                    {displayTypes(dexSelectedRow, siteLanguage).map((type, idx) => <span key={`dex-type-${dexSelectedRow.key}-${idx}`} className="pick-badge">{type}</span>)}
                  </div>
                </div>
                <div className="dex-detail-grid">
                  <div className="dex-detail-panel">
                    <strong>{lt('종족값')}</strong>
                    <div className="dex-stat-table" role="table" aria-label={lt('종족값')}>
                      {[
                        ['HP', dexSelectedRow.hp],
                        ['A', dexSelectedRow.attack],
                        ['B', dexSelectedRow.defense],
                        ['C', dexSelectedRow.spAttack],
                        ['D', dexSelectedRow.spDefense],
                        ['S', dexSelectedRow.speed],
                      ].map(([label, value]) => <div key={`dex-stat-${dexSelectedRow.key}-${label}`} className="dex-stat-row" role="row">
                        <span className="dex-stat-label" role="cell">{label}</span>
                        <div className="dex-stat-bar-track" role="cell" aria-hidden="true">
                          <span className="dex-stat-bar-fill" style={{ width: `${Math.max(10, Math.min(100, Number(value) / 255 * 100))}%` }} />
                        </div>
                        <strong className="dex-stat-value" role="cell">{value}</strong>
                      </div>)}
                      <div className="dex-stat-row total" role="row">
                        <span className="dex-stat-label" role="cell">{lt('합계')}</span>
                        <div className="dex-stat-bar-track" role="cell" aria-hidden="true">
                          <span className="dex-stat-bar-fill total" style={{ width: `${Math.max(14, Math.min(100, (dexSelectedRow.hp + dexSelectedRow.attack + dexSelectedRow.defense + dexSelectedRow.spAttack + dexSelectedRow.spDefense + dexSelectedRow.speed) / 780 * 100))}%` }} />
                        </div>
                        <strong className="dex-stat-value" role="cell">{dexSelectedRow.hp + dexSelectedRow.attack + dexSelectedRow.defense + dexSelectedRow.spAttack + dexSelectedRow.spDefense + dexSelectedRow.speed}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('특성')}</strong>
                    <div className="pick-summary-badges">
                      {displayAbilities(dexSelectedRow, siteLanguage).map((ability, idx) => { const resolved = resolveAbilityInfo(ability, dexSelectedRow); return <a key={`dex-ability-${dexSelectedRow.key}-${idx}`} href={dexDetailHref('ability', resolved?.key ?? ability, resolved?.koLabel ?? ability)} className="pick-badge subtle dex-chip-button" {...bindNavigableTooltip(abilityTooltipData(ability, siteLanguage, dexSelectedRow), () => openDexAbilityDetail(ability, dexSelectedRow))}>{ability}</a> })}
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('상위 채용 기술')}</strong>
                    <div className="pick-summary-badges">
                      {dexTopMoves.length ? dexTopMoves.map((move, idx) => <a key={`dex-move-chip-${dexSelectedRow.key}-${idx}`} href={dexDetailHref('move', move)} className="pick-badge dex-chip-button" {...bindNavigableTooltip(moveTooltipData(move, siteLanguage), () => openDexMoveDetail(move))}>{move}</a>) : <span className="pick-badge">-</span>}
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('빠른 이동')}</strong>
                    <div className="pick-summary-badges">
                      <button type="button" className="chip-button" onClick={() => {
                        setSampleForge({ ...blankPartyMember(), key: dexSelectedRow.key, config: { nature: defaultNatureForKey(dexSelectedRow.key), scarf: false, speedStage: 0 }, item: normalizeItemForKey(dexSelectedRow.key, ''), ability: defaultAbilityForKey(dexSelectedRow.key) })
                        setSampleLockedMoves([])
                        setSampleSearch(searchDisplayLabel(dexSelectedRow.key, siteLanguage))
                        setSampleItemDraft(displayItemLabel(visibleChampionsItem(dexSelectedRow.key, ''), siteLanguage))
                        setSampleWorkbenchTab('builder')
                        setMainSection('sample')
                      }}><UiIcon name="lab" size={17} />{lt('샘플 편집기로 보내기')}</button>
                      <button type="button" className="chip-button" aria-expanded={selectedDexPartySlot !== null} onClick={() => setSelectedDexPartySlot(selectedDexPartySlot === null ? selectedMy : null)}><UiIcon name="party" size={17} />{lt('파티 슬롯 선택')}</button>
                    </div>
                    {selectedDexPartySlot !== null ? <div className="dex-party-target">
                      <label>{lt('교체할 내 파티 슬롯')}
                        <select value={selectedDexPartySlot} onChange={event => setSelectedDexPartySlot(Number(event.target.value))}>
                          {party.map((member, idx) => <option key={idx} value={idx}>{slotNumberLabel(idx, siteLanguage)} · {member.key ? displayName(indexByKey.get(member.key) ?? rows[0], siteLanguage) : lt('빈 슬롯')}</option>)}
                        </select>
                      </label>
                      <button type="button" className="action-button" onClick={() => {
                        if (selectedDexPartySlot === null) return
                        confirmPartySlotReplacement({ ...blankPartyMember(), key: dexSelectedRow.key, config: { nature: defaultNatureForKey(dexSelectedRow.key), scarf: false, speedStage: 0 }, item: normalizeItemForKey(dexSelectedRow.key, ''), ability: defaultAbilityForKey(dexSelectedRow.key) }, selectedDexPartySlot, [])
                        setSelectedDexPartySlot(null)
                      }}>{lt('선택 슬롯에 넣기')}</button>
                      <button type="button" onClick={() => setSelectedDexPartySlot(null)}>{lt('취소')}</button>
                    </div> : null}
                  </div>
                </div>
              </div> : null}

              {dexSelectedRow ? <DexMovePoolSection key={dexSelectedRow.key} recordKey={dexSelectedRow.key} language={siteLanguage}
                status={dexSelectedPool?.status ?? 'idle'} moves={dexSelectedPool?.moves ?? []} provenance={dexSelectedPool?.provenance}
                metaForMove={name => getMoveMetadata(name)?.meta ?? null} displayMoveName={name => name}
                renderTypeBadge={type => <TypeBadgeImage type={type} />}
                detailHref={name => dexDetailHref('move', name)}
                onNavigate={(event, name) => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return; event.preventDefault(); openDexMoveDetail(name) }}
                tooltipPropsForMove={name => bindTooltip(moveTooltipData(name, siteLanguage))}
                onRetry={() => window.location.reload()} /> : null}

              {dexSelectedMove ? <div className="dex-detail-card">
                {getDexGameMove(dexSelectedMove.name) ? <p className="dex-move-pool-warning">{siteLanguage === 'ko' ? '타입은 게임 스냅샷, 그외 메타는 기존 도감 · 미수록 메타 미확인' : siteLanguage === 'ja' ? 'タイプはゲームスナップショット、他のメタデータは既存図鑑 · 未収録は未確認' : 'Type from game snapshot; other available metadata from legacy Dex · missing metadata unknown'}</p> : null}
                <div className="dex-detail-head">
                  <div className="dex-detail-identity compact">
                    <div>
                      <h3>{dexSelectedMove.name}</h3>
                      <p className="muted">{displayTypeName(dexSelectedMove.meta.type, siteLanguage)} · {dexSelectedMove.meta.category ? displayMoveCategoryName(dexSelectedMove.meta.category, siteLanguage) : '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="dex-detail-grid single-column">
                  <div className="dex-detail-panel">
                    <strong>{lt('기본 정보')}</strong>
                    <div className="pick-summary-badges">
                      <span className="pick-badge">{lt('타입')} {displayTypeName(dexSelectedMove.meta.type, siteLanguage)}</span>
                      <span className="pick-badge">{lt('분류')} {dexSelectedMove.meta.category ? displayMoveCategoryName(dexSelectedMove.meta.category, siteLanguage) : '—'}</span>
                      <span className="pick-badge">{lt('위력')} {dexSelectedMove.meta.power != null ? resolvedMovePower(dexSelectedMove.meta) : '-'}</span>
                      <span className="pick-badge">PP {dexSelectedMove.meta.pp != null ? dexSelectedMove.meta.pp : '-'}</span>
                      <span className="pick-badge">{lt('명중')} {dexSelectedMove.meta.accuracy != null ? `${dexSelectedMove.meta.accuracy}%` : '-'}</span>
                      <span className="pick-badge">{lt('우선도')} {dexSelectedMove.meta.priority ?? '—'}</span>
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('이름')}</strong>
                    <div className="pick-summary-badges">
                      {dexSelectedMoveDescription?.nameEn ? <span className="pick-badge">EN {dexSelectedMoveDescription.nameEn}</span> : null}
                      {dexSelectedMoveDescription?.nameJa ? <span className="pick-badge">JP {dexSelectedMoveDescription.nameJa}</span> : null}
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('설명')}</strong>
                    <p className="dex-description-copy">{dexSelectedMoveText?.detail || dexSelectedMoveText?.summary || lt('설명 데이터 없음')}</p>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('배우는 포켓몬')}</strong>
                    <div className="pick-summary-badges">
                      {dexMoveLearnersStatus === 'loading' ? <span className="pick-badge">Loading…</span> : null}
                      {dexMoveLearnersStatus === 'missing' ? <span role="status">{siteLanguage === 'ko' ? '이 기술은 게임 스냅샷에 수록되지 않아 습득 포켓몬을 확인할 수 없습니다.' : siteLanguage === 'ja' ? 'この技はゲームスナップショットに未収録のため、習得ポケモンは未確認です。' : 'This move is not in the game snapshot; learners are unknown.'}</span> : null}
                      {dexMoveLearnersStatus === 'error' ? <span role="status">{siteLanguage === 'ko' ? '게임 스냅샷을 불러오지 못했습니다.' : siteLanguage === 'ja' ? 'ゲームスナップショットを読み込めませんでした。' : 'Could not load the game snapshot.'}</span> : null}
                      {dexMoveLearnersStatus === 'error' ? <button type="button" onClick={() => window.location.reload()}>{siteLanguage === 'ko' ? '다시 시도' : siteLanguage === 'ja' ? '再試行' : 'Retry'}</button> : null}
                      {dexMoveLearnersStatus === 'ready' ? dexMoveLearners.map((row) => <a key={`dex-move-learner-${dexSelectedMove.key}-${row.key}`} href={dexDetailHref('pokemon', row.key)} className="pick-badge subtle dex-ability-pokemon-chip dex-chip-button" onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return; event.preventDefault(); openDexPokemonDetail(row.key) }}>
                        {row.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="dex-ability-pokemon-sprite" /> : null}
                        <span>{displayName(row, siteLanguage)}</span>
                      </a>) : null}
                    </div>
                  </div>
                </div>
              </div> : null}

              {dexSelectedAbility ? <div className="dex-detail-card">
                <div className="dex-detail-head">
                  <div className="dex-detail-identity compact">
                    <div>
                      <h3>{abilityDisplayName(dexSelectedAbility.key, dexSelectedAbility.koLabel, siteLanguage)}</h3>
                      <p className="muted">{dexSelectedAbility.key}</p>
                    </div>
                  </div>
                  <div className="pick-summary-badges">
                    <span className="pick-badge">{dexSelectedAbility.pokemonKeys.length}{siteLanguage === 'en' ? ' Pokémon' : siteLanguage === 'ja' ? '匹' : '마리'}</span>
                  </div>
                </div>
                <div className="dex-detail-grid single-column">
                  <div className="dex-detail-panel">
                    <strong>{lt('이름')}</strong>
                    <div className="pick-summary-badges">
                      <span className="pick-badge">KO {dexSelectedAbilityDescription?.nameKo ?? dexSelectedAbility.koLabel}</span>
                      {(dexSelectedAbilityDescription?.nameEn ?? verifiedAbilityLabels.abilities[dexSelectedAbility.key as keyof typeof verifiedAbilityLabels.abilities]?.en) ? <span className="pick-badge">EN {dexSelectedAbilityDescription?.nameEn ?? verifiedAbilityLabels.abilities[dexSelectedAbility.key as keyof typeof verifiedAbilityLabels.abilities]?.en}</span> : null}
                      {(dexSelectedAbilityDescription?.nameJa ?? verifiedAbilityLabels.abilities[dexSelectedAbility.key as keyof typeof verifiedAbilityLabels.abilities]?.ja) ? <span className="pick-badge">JP {dexSelectedAbilityDescription?.nameJa ?? verifiedAbilityLabels.abilities[dexSelectedAbility.key as keyof typeof verifiedAbilityLabels.abilities]?.ja}</span> : null}
                    </div>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('설명')}</strong>
                    <p className="dex-description-copy">{dexSelectedAbilityText?.detail || dexSelectedAbilityText?.summary || lt('설명 데이터 없음')}</p>
                  </div>
                  <div className="dex-detail-panel">
                    <strong>{lt('해당 특성 포켓몬')}</strong>
                    <div className="pick-summary-badges">
                      {dexSelectedAbility.pokemonKeys.map((key) => {
                        const row = indexByKey.get(key)
                        if (!row) return null
                        return <a key={`dex-ability-pokemon-${key}`} href={dexDetailHref('pokemon', key)} className="pick-badge subtle dex-ability-pokemon-chip dex-chip-button" onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return; event.preventDefault(); openDexPokemonDetail(key) }}>
                          {row.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="dex-ability-pokemon-sprite" /> : null}
                          <span>{displayName(row, siteLanguage)}</span>
                        </a>
                      })}
                    </div>
                  </div>
                </div>
              </div> : null}

              {dexSelectedItem ? <div className="dex-detail-card">
                <div className="dex-detail-head">
                  <div className="dex-detail-identity compact">
                    <img src={itemSpriteSrc('', dexSelectedItem)} alt={displayItemLabel(dexSelectedItem, siteLanguage)} className="dex-detail-item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                    <div>
                      <h3>{displayItemLabel(dexSelectedItem, siteLanguage)}</h3>
                      <p className="muted">{dexSelectedItem}</p>
                    </div>
                  </div>
                </div>
                <div className="dex-detail-grid single-column">
                  <div className="dex-detail-panel">
                    <strong>{lt('이름')}</strong>
                    <div className="pick-summary-badges">
                      <span className="pick-badge">KO {displayItemLabel(dexSelectedItem, 'ko')}</span>
                      <span className="pick-badge">EN {displayItemLabel(dexSelectedItem, 'en')}</span>
                      <span className="pick-badge">JP {displayItemLabel(dexSelectedItem, 'ja')}</span>
                    </div>
                  </div>
                  {dexSelectedItemEffectSummary ? <div className="dex-detail-panel">
                    <strong>{lt('효과')}</strong>
                    <p className="dex-description-copy">{dexSelectedItemEffectSummary}</p>
                  </div> : null}
                  <div className="dex-detail-panel">
                    <strong>{lt('설명')}</strong>
                    <p className="dex-description-copy">{dexSelectedItemText?.detail || dexSelectedItemText?.summary || lt('설명 데이터 없음')}</p>
                  </div>
                </div>
              </div> : null}

              {!dexSelectedRow && !dexSelectedMove && !dexSelectedAbility && !dexSelectedItem ? <div className="dex-detail-card dex-placeholder-card">
                <p className="muted">{siteLanguage === 'en' ? 'Unknown Dex entry.' : siteLanguage === 'ja' ? '登録が見つかりません。' : '도감 항목을 찾을 수 없습니다.'}</p>
                <a href={dexListHref} onClick={navigateDexBack}><UiIcon name="chevron" size={16} className="ui-icon ui-icon-back" />{siteLanguage === 'en' ? 'Back to results' : siteLanguage === 'ja' ? '一覧へ戻る' : '목록으로 돌아가기'}</a>
              </div> : null}
            </div>
          </section> : null}
        </> : null}

        {(mainSection === 'single' && (activeTab === 'speed' || activeTab === 'power')) ? (
          <section className="panel wide party-overview-panel">
            <h2>{lt('파티 한눈 요약')}</h2>
            <div className="team-strip-grid">
              <div className="team-strip-group ally">
                <p className="muted">{lt('내 파티')}</p>
                <div className="team-strip">
                  {party.map((member, idx) => {
                    const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                    return <button key={`team-my-${idx}`} type="button" className={`team-pill ${selectedMy === idx ? 'active' : ''}`} onClick={() => setSelectedMy(idx)}>{row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage)}</button>
                  })}
                </div>
              </div>
              <div className="team-strip-group enemy">
                <p className="muted">{lt('상대 파티')}</p>
                <div className="team-strip">
                  {opponents.map((member, idx) => {
                    const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                    const label = opponentSearch[idx] || (row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage))
                    return <button key={`team-opp-${idx}`} type="button" className={`team-pill enemy ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>{label}</button>
                  })}
                </div>
                <div className="team-strip-actions enemy">
                  <button type="button" className="action-button subtle" onClick={() => clearOpponentSlot(selectedOpp)}><UiIcon name="trash" size={17} />{lt('선택 슬롯 비우기')}</button>
                  <button type="button" className="action-button danger" onClick={resetOpponentsForFreshEntry}><UiIcon name="trash" size={17} />{lt('상대 엔트리 초기화')}</button>
                </div>
                <div className="quick-opponent-search-bar compact embedded">
                  <PokemonSearchField id="opponent-strip-quick" className="species-picker" inputRef={opponentQuickInputRef}
                    label={lt('상대 엔트리 빠른 입력')} value={opponentQuickSearch}
                    placeholder={searchSlotPlaceholder(selectedOpp, siteLanguage)}
                    onChange={setOpponentQuickSearch} onSelect={key => commitOpponentQuickSearch(key)}
                    options={filterSpeciesOptions(opponentQuickSearch, { includeMega: false }).slice(0, 8).map(option => ({ key: option.key, label: searchDisplayLabel(option.key, siteLanguage) }))} />
                  <div className="quick-opponent-hint compact">
                    <strong>{lt('현재 입력 슬롯')}</strong>
                    <span>{selectedOpp + 1} / {MAX_OPPONENTS}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {(mainSection === 'double' && activeTab === 'power') ? <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{lt('더블 계산 작업 보드')}</h2>
            </div>
          </div>

          <div className="double-layout-grid">
            <div className="double-layout-main">
              <article className="double-layout-card double-planner-main-card">
                <div className="double-layout-card-head">
                  <strong>{lt('턴 플랜')}</strong>
                  <span className={`pick-badge ${doubleTrickRoom ? 'verdict-badge' : ''}`}>{doubleTrickRoom ? lt('트릭룸 순서') : lt('기본 순서')}</span>
                </div>
                <div className="double-planner-context">
                  <div className="double-state-sections compact single">
                    <div className="double-state-card">
                      <strong>{lt('속도/전장')}</strong>
                      <div className="double-toggle-grid double-toggle-grid-field">
                        <label className="calc-toggle-box"><input type="checkbox" checked={doubleTailwindMy} onChange={(e) => setDoubleTailwindMy(e.target.checked)} /><span>{lt('아군 순풍')}</span></label>
                        <label className="calc-toggle-box"><input type="checkbox" checked={doubleTrickRoom} onChange={(e) => setDoubleTrickRoom(e.target.checked)} /><span>{lt('트릭룸')}</span></label>
                        <label className="calc-toggle-box"><input type="checkbox" checked={doubleTailwindOpp} onChange={(e) => setDoubleTailwindOpp(e.target.checked)} /><span>{lt('상대 순풍')}</span></label>
                        {doubleFriendGuardAvailableOpp ? <label className="calc-toggle-box double-toggle-grid-field-extra"><input type="checkbox" checked={doubleFriendGuardOpp} onChange={(e) => setDoubleFriendGuardOpp(e.target.checked)} /><span>{lt('상대 프렌드가드')}</span></label> : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="double-inline-subcard double-damage-summary-card">
                  <div className="double-layout-card-head compact">
                    <strong>{lt('상대별 총 기대 대미지')}</strong>
                  </div>
                  <div className="double-combined-damage-grid">
                    {doubleCombinedDamageSummary.map((entry) => <div key={`double-combined-${entry.defenderSlot}`} className="double-combined-damage-item">
                      <div className="double-combined-damage-head">
                        <div className="double-combined-damage-defender">
                          {entry.defenderSprite ? <img src={entry.defenderSprite} alt={entry.defenderLabel} className="double-combined-damage-sprite" /> : null}
                          <div className="double-combined-damage-defender-copy">
                            <label className="double-side-select enemy compact">
                              <select className="double-side-select-input enemy" value={entry.defenderSlot === 'oppLeft' ? doubleOppLeft : doubleOppRight} onChange={(e) => entry.defenderSlot === 'oppLeft' ? setDoubleOppLeft(Number(e.target.value)) : setDoubleOppRight(Number(e.target.value))}>
                                {doubleOpponentOptions.map((option) => <option key={`double-damage-target-${entry.defenderSlot}-${option.idx}`} value={option.idx}>{option.row ? displayName(option.row, siteLanguage) : `${lt('엔트리')} ${option.idx + 1}`}</option>)}
                              </select>
                            </label>
                          </div>
                        </div>
                        <div className="double-combined-damage-head-meta">
                          <span className={`double-combined-damage-raw-inline verdict-${entry.verdictTone}`}>{entry.totalText}</span>
                          <label className="calc-toggle-box double-slot-protect-toggle compact">
                            <input
                              type="checkbox"
                              checked={entry.defenderSlot === 'oppLeft' ? doubleProtectOppLeft : doubleProtectOppRight}
                              onChange={(e) => entry.defenderSlot === 'oppLeft' ? setDoubleProtectOppLeft(e.target.checked) : setDoubleProtectOppRight(e.target.checked)}
                            />
                            <span>{lt('방어')}</span>
                          </label>
                        </div>
                      </div>
                      <div className={`double-combined-damage-total verdict-${entry.verdictTone}`}>{entry.totalPctText}</div>
                      <div className="double-combined-damage-actions">
                        <button
                          type="button"
                          className={`pick-chip ${doubleBulkEditorSlot === entry.defenderSlot ? 'active' : ''}`}
                          onClick={() => setDoubleBulkEditorSlot(entry.defenderSlot)}
                        >
                          {lt('노력치 보정')}
                        </button>
                      </div>
                      {entry.blocked.length ? <div className="double-combined-damage-notes">
                        {entry.blocked.map((note) => <span key={`double-combined-note-${entry.defenderSlot}-${note.attackerLabel}`}>{note.attackerLabel} · {note.reason}</span>)}
                      </div> : null}
                    </div>)}
                  </div>
                </div>
                <div className="double-attack-grid">
                  {doubleActionCards.filter((entry) => entry.meta.side === 'my').map(({ slot, meta, card, moveRows, enemyTargets, spreadMove }) => {
                    const isEnemy = meta.side === 'opp'
                    return <div key={`double-focus-editor-${slot}`} className={`double-attacker-card ${isEnemy ? 'enemy' : 'ally'}`}>
                    <div className="double-focus-editor-head">
                      <div className="double-focus-editor-identity">
                        {card?.row?.sprite ? <img src={card.row.sprite} alt={card.name || meta.label} className="double-focus-editor-sprite" /> : null}
                        <label className={`double-side-select compact ${isEnemy ? 'enemy' : ''}`}>
                          <select className={`double-side-select-input ${isEnemy ? 'enemy' : ''}`} value={slot === 'myLeft' ? doubleMyLeft : doubleMyRight} onChange={(e) => slot === 'myLeft' ? setDoubleMyLeft(Number(e.target.value)) : setDoubleMyRight(Number(e.target.value))}>
                            {doublePartyOptions.map((option) => <option key={`double-attacker-select-${slot}-${option.idx}`} value={option.idx}>{option.row ? displayName(option.row, siteLanguage) : `${lt('파티 슬롯')} ${option.idx + 1}`}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="double-speed-value-inline">{card?.speed ?? '—'}</div>
                    </div>
                    <div className="double-focus-editor-section">
                      <div className="double-move-grid-2x2">
                        {moveRows.length ? moveRows.map(({ move, type, priority, selected }) => <button
                          key={`double-move-cell-${slot}-${move}`}
                          type="button"
                          className={`double-move-cell ${selected ? 'active' : ''}`}
                          onClick={() => {
                            setDoubleActionFocusSlot(slot)
                            setDoubleActionMoveBySlot[slot](move)
                          }}
                        >
                          <span className="double-move-row-title">{move}</span>
                          <span className="double-move-row-meta">
                            {type ? <SmallTypeBadgeImage type={type} /> : null}
                            <span>{lt('우선도')} {priority == null ? '—' : priority >= 0 ? `+${priority}` : priority}</span>
                          </span>
                        </button>) : <span className="double-action-empty">{lt('등록 기술 없음')}</span>}
                      </div>
                    </div>
                    {!spreadMove && enemyTargets.length ? <div className="double-focus-editor-section">
                      <span className="double-action-card-label">{lt('상대 대상')}</span>
                      <div className="double-target-chip-row">
                        {enemyTargets.map((entry) => <button
                          key={`double-action-enemy-target-${slot}-${entry.targetSlot}`}
                          type="button"
                          className={`double-target-chip ${entry.selected ? 'active enemy' : ''}`}
                          onClick={() => {
                            setDoubleActionFocusSlot(slot)
                            setDoubleActionTargetBySlot[slot](entry.targetSlot)
                          }}
                        >{entry.label}</button>)}
                      </div>
                    </div> : null}
                    {spreadMove ? <div className="double-spread-note">{lt('광역기 감쇠가 자동 적용됩니다.')}</div> : null}
                  </div>})}
                </div>
                <div className="double-inline-subcard">
                  <div className="double-layout-card-head compact">
                    <strong>{lt('4마리 행동순')}</strong>
                  </div>
                  {doubleActionOrder.some(entry => entry.occupied && (entry.speed === null || entry.priority === null)) ? <p role="status">{lt('전체 행동순 미확인 · 속도 또는 선택 기술 우선도가 미확인되어 슬롯 순서로 표시합니다.')}</p> : null}
                  <div className="double-speed-preview-list">
                    {doubleActionOrder.map((entry) => <div key={`double-order-${entry.slot}`} className={`double-speed-preview-item ${entry.side === 'opp' ? 'opp' : 'my'}`}>
                      <span>{entry.rank === null ? lt(entry.occupied ? '전체 순위 미확인' : '미선택') : `${entry.rank}${lt('순위')}`} · {entry.label}</span>
                      <div className="double-order-main with-sprite">
                        {entry.sprite ? <img src={entry.sprite} alt={entry.name} className="double-order-sprite" /> : null}
                        <strong>{entry.name}</strong>
                      </div>
                      <div className="double-speed-value-inline">{entry.speed ?? '—'}</div>
                    </div>)}
                  </div>
                </div>
              </article>
            </div>

          </div>

        </section> : null}

        {mainSection === 'single' ? <div className="unified-single-pair">
          <QuickDamagePanel language={siteLanguage} tooltipForMove={name => bindTooltip(name ? moveTooltipData(name, siteLanguage) : null)} initialSides={comparisonSides(party, opponents, selectedMy, selectedOpp, confirmedMovesByKey, comparisonAbility)} comparisonSlots={[selectedMy, selectedOpp]} comparisonMode opponentResetRevision={opponentResetRevision} onOpponentSpecies={registerSingleOpponentSpecies} onResetOpponents={resetSingleOpponentEntry} movesForSpecies={key => confirmedMovesByKey[key] ?? []} sharedMoveSpecies={key => Boolean(key) && party.filter(member => member.key === key).length > 1} onDraftIdentity={(side, key) => setOpponentDraftIdentity(side, key)} onSaveEntry={(side, draft, fields) => {
             const dirty = new Set(fields)
            if (side === 'attacker') {
              if (draft.key !== party[selectedMy]?.key) return
              setParty(prev => prev.map((entry, slot) => slot === selectedMy ? commitComparisonEntry('own', entry, draft, dirty) : entry))
              if (dirty.has('moves')) setConfirmedMovesByKey(prev => ({ ...prev, [draft.key]: normalizeMoveSlots(draft.moves) }))
            } else {
              saveComparisonOpponent(selectedOpp, draft, dirty)
            }
            setOpponentDraftIdentity(side, '')
          }} entrySelectors={(opponentSearch, reset) => <div className="single-entry-selectors">
            <div className="single-entry-toolbar"><div className="selected-opponent-search">{opponentSearch}</div>{reset}</div>
            <div className="unified-pair-pickers"><div><div className="single-picker-head"><strong>{lt('내 파티')}</strong></div><div className="unified-pair-buttons">{party.map((member, idx) => { const row = indexByKey.get(member.key); return <button key={idx} type="button" aria-pressed={selectedMy === idx} onClick={() => { if (idx !== selectedMy) { setOpponentDraftIdentity('attacker', ''); setSelectedMy(idx) } }}>{row?.sprite ? <img src={row.sprite} alt="" /> : null}<span>{idx + 1}. {row ? displayName(row, siteLanguage) : lt('빈 슬롯')}</span></button> })}</div>{!party[selectedMy]?.key ? <small>{lt('빈 슬롯: 내 파티 관리에서 포켓몬을 등록하세요.')}</small> : null}</div><div><div className="single-picker-head"><strong>{lt('상대 엔트리')}</strong></div><div className="unified-pair-buttons">{opponents.map((member, idx) => { const row = indexByKey.get(member.key); return <button key={idx} type="button" aria-pressed={selectedOpp === idx} onClick={() => { if (idx !== selectedOpp) { setOpponentDraftIdentity('defender', ''); setSelectedOpp(idx) } }}>{row?.sprite ? <img src={row.sprite} alt="" /> : null}<span>{idx + 1}. {row ? displayName(row, siteLanguage) : lt('빈 슬롯')}</span></button> })}</div></div></div>
          </div>} />
        </div> : null}
        {(mainSection === 'party' || (mainSection === 'double' && activeTab === 'party')) ? <PartyView workspace={workspace} editor={partyEditor} siteLanguage={siteLanguage} mainSection={mainSection} asyncDataVersion={asyncDataVersion}
          movePoolByKey={movePoolByKey} moveSlotLabels={moveSlotLabels}
          moves={{ activeMoveField, moveInputDraft, moveCommitNotice, setActiveMoveField, setMoveInputDraft, setMoveCommitNotice, selectMoveOption, commitEditorMove, applyMoveToSlot }}
          tooltip={{ bindTooltip, abilityTooltipData, itemTooltipData, moveTooltipData }}
          persistenceStatus={persistenceStatus} partyImageImportBusy={partyImageImportBusy} partyImageImportStatus={partyImageImportStatus}
          onOpenImageImport={() => partyImageInputRef.current?.click()}
          onRetrySave={() => { setPersistenceStatus('saving'); setRetryPersistence(value => value + 1) }}
          onApproveOverwrite={() => { if (window.confirm(lt('원본 저장 데이터를 덮어쓰고 현재 화면으로 다시 저장할까요?'))) { setPersistenceStatus('saving'); setAllowRecoveryWrite(true) } }}
          onTune={idx => { partyTuningOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setTuningModalIndex(idx) }} setParty={setParty} /> : null}

        {mainSection === 'home' ? null : ((mainSection === 'single' && activeTab === 'pick') || (mainSection === 'double' && activeTab === 'pick')) ? <>
        <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{lt('상대 엔트리')}</h2>
            </div>
            <div className="pick-summary-badges">
              <span className="pick-badge">{lt('엔트리')} {opponents.length}/6</span>
              <span className="pick-badge enemy">{lt('선출 추정')} {pickedOpponents.length}/3</span>
            </div>
          </div>

          <div className="inline-controls">
            <button type="button" className="action-button danger" onClick={resetOpponentsForFreshEntry}><UiIcon name="trash" size={17} />{lt('상대 엔트리 초기화')}</button>
            <span className="muted-inline">{lt('검색창 하나에서 `검색 → 엔터` 반복으로 순서대로 채웁니다.')}</span>
          </div>

          <div className="quick-opponent-search-bar">
            <PokemonSearchField id="opponent-entry-quick" className="species-picker" inputRef={opponentQuickInputRef}
              label={lt('상대 엔트리 빠른 입력')} value={opponentQuickSearch}
              placeholder={searchSlotPlaceholder(selectedOpp, siteLanguage)}
              onChange={setOpponentQuickSearch} onSelect={key => commitOpponentQuickSearch(key)}
              options={filterSpeciesOptions(opponentQuickSearch, { includeMega: false }).slice(0, 8).map(option => ({ key: option.key, label: searchDisplayLabel(option.key, siteLanguage) }))} />
            <div className="quick-opponent-hint">
              <strong>{lt('현재 입력 슬롯')}</strong>
              <span>{selectedOpp + 1} / {MAX_OPPONENTS}</span>
            </div>
          </div>

          <div className="pick-slot-row opponent-overview-row">
            {opponents.map((member, idx) => {
              const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
              return (
                <button key={`opp-overview-${member.key}-${idx}`} type="button" className={`pick-slot-card enemy compact ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>
                  {row?.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                  <span>{opponentSearch[idx] || (row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage))}</span>
                  <small>{member.picked ? lt('추정 체크됨') : lt('미체크')}</small>
                  <small {...bindTooltip(member.item ? itemTooltipData(member.item, siteLanguage) : null)}>{member.item ? displayItemLabel(member.item, siteLanguage) : lt('도구 없음')}</small>
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
                  <button key={`opp-board-${idx}`} type="button" className={`opponent-board-card ${selectedOpp === idx ? 'active' : ''}`} onClick={() => setSelectedOpp(idx)}>
                    <span className={`opponent-board-slot-badge ${selectedOpp === idx ? 'active' : ''}`}>{selectedOpp === idx ? lt('현재') : `${idx + 1}`}</span>
                    {row?.sprite ? <img src={row.sprite} alt={displayName(row, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <strong>{row ? displayName(row, siteLanguage) : emptySlotLabel(idx, siteLanguage)}</strong>
                    <span>{opponentSearch[idx] || lt('포켓몬 미입력')}</span>
                    <span>{row ? selectedAbilityDisplayName(row, member.ability, siteLanguage) || member.ability || lt('특성 미기입') : member.ability || lt('특성 미기입')}</span>
                    <span {...bindTooltip(member.item ? itemTooltipData(member.item, siteLanguage) : null)}>{member.item ? displayItemLabel(member.item, siteLanguage) : lt('도구 미기입')}</span>
                  </button>
                )
              })}
            </div>
            <div className="opponent-detail-panel">
              <div className="entry-card-top">
                {oppMember.key && oppRow?.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="entry-sprite large" /> : null}
                <div className="entry-card-head">
                  <div className="row-between compact-gap">
                    <strong>{oppMember.key && oppRow ? displayName(oppRow, siteLanguage) : emptySlotLabel(selectedOpp, siteLanguage)}</strong>
                    <button type="button" className={`pick-chip ${oppMember.picked ? 'confirmed' : ''}`} disabled={!oppMember.key || (!oppMember.picked && pickedOpponents.length >= 3)} aria-pressed={oppMember.picked} onClick={() => toggleOpponentPicked(selectedOpp)}>{lt(oppMember.picked ? '선출 추정 해제' : '선출 추정 체크')}</button>
                  </div>
                  {oppMember.key && oppRow ? <div className="type-badge-wrap">{oppRow.types.map((type) => <TypeBadgeImage key={`${oppRow.key}-${type}`} type={type} />)}</div> : null}
                </div>
              </div>
              <div className="opponent-detail-fields">
                <PokemonSearchField id={`opponent-detail-species-${selectedOpp}`} className="species-picker"
                  label={lt('종 선택')} value={opponentSearch[selectedOpp] ?? ''} placeholder={lt('포켓몬 검색')}
                  onChange={value => setOpponentSearch(prev => prev.map((text, slot) => slot === selectedOpp ? value : text))}
                  onSelect={key => selectSpecies('opponent', selectedOpp, key)}
                  options={filterSpeciesOptions(opponentSearch[selectedOpp] ?? '', { includeMega: false }).slice(0, 8).map(option => ({ key: option.key, label: searchDisplayLabel(option.key, siteLanguage) }))} />
                <label>
                  {lt('도구')}
                  <div className="opponent-item-search">
                    <div className="meta-item-input-row">
                      <input
                        className="opponent-meta-input"
                        value={opponentItemDrafts[selectedOpp] ?? ''}
                        placeholder={oppMember.key ? lt('사용 가능 도구 선택') : lt('포켓몬 먼저 선택')}
                        disabled={!oppMember.key}
                        onFocus={() => {
                          if (!oppMember.key) return
                          setActiveItemField({ scope: 'opponent', idx: selectedOpp })
                          setAutocompleteMenuOpen(`opponent-item-${selectedOpp}`)
                        }}
                        onBlur={() => {
                          setTimeout(() => setActiveItemField((prev) => sameItemField(prev, 'opponent', selectedOpp) ? null : prev), 120)
                          setTimeout(() => closeAutocompleteMenu(`opponent-item-${selectedOpp}`), 120)
                          commitOpponentItemInput(selectedOpp)
                        }}
                        onChange={(e) => {
                          const nextDrafts = [...opponentItemDrafts]
                          nextDrafts[selectedOpp] = e.target.value
                          setOpponentItemDrafts(nextDrafts)
                          setActiveItemField({ scope: 'opponent', idx: selectedOpp })
                          setAutocompleteMenuOpen(`opponent-item-${selectedOpp}`)
                        }}
                        onKeyDown={(e) => {
                          const menuId = `opponent-item-${selectedOpp}`
                          if (e.key === 'Escape' || e.key === 'Tab') {
                            setActiveItemField(null)
                            closeAutocompleteMenu(menuId)
                            return
                          }
                          const options = filterItemOptions(opponentItemDrafts[selectedOpp] || '', siteLanguage, { fallbackToAll: false }).filter(item => isAllowedChampionsItem(oppMember.key, item)).slice(0, 8)
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            if (!sameItemField(activeItemField, 'opponent', selectedOpp) || autocompleteHighlight?.id !== menuId) return
                            e.preventDefault()
                            moveAutocompleteMenuHighlight(menuId, options.length, e.key === 'ArrowDown' ? 1 : -1)
                            return
                          }
                          if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
                          if (!sameItemField(activeItemField, 'opponent', selectedOpp) || autocompleteHighlight?.id !== menuId) return
                          e.preventDefault()
                          const highlightedItem = opponentItemDrafts[selectedOpp]?.trim()
                            ? options[highlightedAutocompleteIndex(autocompleteHighlight, menuId)] : null
                          if (highlightedItem) {
                            selectOpponentItemOption(selectedOpp, highlightedItem)
                            closeAutocompleteMenu(menuId)
                            return
                          }
                          commitOpponentItemInput(selectedOpp)
                          setActiveItemField(null)
                          closeAutocompleteMenu(menuId)
                        }}
                      />
                      {oppMember.key && (opponentItemDrafts[selectedOpp] || oppMember.item) ? <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={(e) => {
                        e.preventDefault()
                        clearOpponentItemInput(selectedOpp)
                      }}>×</button> : null}
                    </div>
                    {oppMember.key && sameItemField(activeItemField, 'opponent', selectedOpp) && autocompleteHighlight?.id === `opponent-item-${selectedOpp}` ? <div className="move-autocomplete-menu unified-dropdown-menu">
                      {filterItemOptions(opponentItemDrafts[selectedOpp] || '', siteLanguage, { fallbackToAll: false }).filter(item => isAllowedChampionsItem(oppMember.key, item)).slice(0, 8).map((item, optionIdx) => (
                        <button key={`opp-item-suggest-${selectedOpp}-${item}`} type="button" className={`move-autocomplete-item item-autocomplete-item ${highlightedAutocompleteIndex(autocompleteHighlight, `opponent-item-${selectedOpp}`) === optionIdx ? 'active' : ''}`} onMouseDown={() => selectOpponentItemOption(selectedOpp, item)}>
                          <span className="move-autocomplete-main">
                            <img src={itemSpriteSrc(oppMember.key, item)} alt={itemAutocompletePrimaryLabel(item, siteLanguage)} className="item-autocomplete-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                            <span className="item-autocomplete-copy">
                              <strong className="item-autocomplete-title">{itemAutocompletePrimaryLabel(item, siteLanguage)}</strong>
                              {itemAutocompleteSecondaryLabel(item, siteLanguage) ? <span className="item-autocomplete-sub">{itemAutocompleteSecondaryLabel(item, siteLanguage)}</span> : null}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div> : null}
                  </div>
                </label>
                <label>
                  {lt('특성')}
                  <select
                    className="opponent-meta-select"
                    value={resolveSelectedAbility(oppRow!, oppMember.ability, siteLanguage)?.slug ?? oppMember.ability}
                    {...bindTooltip(oppMember.ability ? abilityTooltipData(oppMember.ability, siteLanguage, oppRow) : null)}
                    disabled={!oppMember.key}
                    onChange={(e) => {
                      setOpponentField(selectedOpp, { ability: e.target.value })
                    }}
                  >
                    <option value="">{oppMember.key ? lt('사용 가능 특성 선택') : lt('포켓몬 먼저 선택')}</option>
                    {oppMember.ability && !resolveSelectedAbility(oppRow!, oppMember.ability, siteLanguage) ? <option value={oppMember.ability}>{`${lt('원본 특성 표기')}: ${oppMember.ability}`}</option> : null}
                    {(oppRow?.abilities ?? []).map((ability) => (
                      <option key={`opp-ability-option-${selectedOpp}-${ability}`} value={ability}>{localizedAbilityLabel(oppRow!, ability, siteLanguage, abilityDescriptionFor)}</option>
                    ))}
                  </select>
                  {heldAbilityError(oppMember.key, oppMember.ability, siteLanguage) && <small role="alert" className="item-validation-error">{heldAbilityError(oppMember.key, oppMember.ability, siteLanguage)}</small>}
                </label>
                <div className="opponent-revealed-moves-card">
                  <div className="opponent-revealed-moves-head">{lt('공개 기술')}</div>
                  <div className="damage-side-moves opponent-revealed-moves-grid">
                    {oppMember.revealedMoves.length ? oppMember.revealedMoves.map((move) => {
                      const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                      return (
                        <div key={`opp-entry-move-${selectedOpp}-${move}`} className="damage-move-chip-wrap">
                          <button type="button" className={`move-chip core damage-move-chip ${moveTypeThemeClass(moveType)}`} onClick={() => {
                            setCalcSwapSides(true)
                            setSelectedDamageMove({ key: oppMember.key, move })
                            setActiveTab('power')
                          }} {...bindTooltip(moveTooltipData(move, siteLanguage))}>
                            {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                            <span>{move}</span>
                          </button>
                          <button type="button" className="damage-move-remove-button" onClick={() => removeOpponentRevealedMove(move)} aria-label={`${move} remove`}>
                            ×
                          </button>
                        </div>
                      )
                    }) : <div className="damage-side-empty">{lt('등록 기술 없음')}</div>}
                    <div className="damage-opponent-move-adder opponent-entry-move-adder">
                      <div className="damage-opponent-move-meta">
                        <strong>{lt('공개 기술')}</strong>
                        <span>{oppMember.revealedMoves.length} / 4</span>
                      </div>
                      {oppMember.key && oppTopSuggestedMoves.length ? <details className="damage-top-move-strip">
                        <summary className="damage-top-move-strip-summary">
                          <span className="damage-top-move-strip-summary-copy">
                            <strong>{lt('사용률 상위 기술')}</strong>
                            <span className="muted-inline">Top {Math.min(10, oppTopSuggestedMoves.length)}</span>
                          </span>
                          <span className="damage-top-move-strip-summary-status muted-inline">{lt('현재')} {oppMember.revealedMoves.length} / 4</span>
                        </summary>
                        <div className="move-chip-wrap damage-top-move-strip-chips">
                          {oppTopSuggestedMoves.map((move) => {
                            const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                            const locked = oppMember.revealedMoves.includes(move)
                            const eligible = Boolean(resolveEligibleMoveInput(move, oppMovePool))
                            const reason = lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')
                            return (
                              <button
                                key={`opp-top-move-${oppMember.key}-${move}`}
                                type="button"
                                className={`move-chip core ${locked ? 'confirmed quiet-confirmed' : ''} ${moveTypeThemeClass(moveType)}`}
                                onClick={() => addOpponentRevealedMove(move)}
                                disabled={locked || oppMember.revealedMoves.length >= 4 || !eligible}
                                title={!eligible ? reason : undefined}
                                aria-label={!eligible ? `${move} — ${reason}` : move}
                                {...bindTooltip(moveTooltipData(move, siteLanguage))}
                              >
                                {move}
                              </button>
                            )
                          })}
                        </div>
                      </details> : null}
                      {opponentMoveNotice?.key === oppMember.key && opponentMoveNotice.index === selectedOpp ? <small role="status">{lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')}</small> : null}
                      <div className="damage-opponent-move-entry">
                        <span id="opp-entry-move-label">{lt('상대 기술 추가')}</span>
                        <div className="damage-opponent-move-input-row">
                          <SearchCombobox id={`opp-entry-move-${selectedOpp}`} value={opponentMoveDraft} onChange={setOpponentMoveDraft}
                            options={revealedMoveCandidates(opponentMoveDraft).map(option => ({ key: option.name, label: option.name }))}
                            onSelect={option => { if (addOpponentRevealedMove(option.key)) setOpponentMoveDraft('') }}
                            optionClassName={option => `move-autocomplete-item ${moveTypeThemeClass(oppMoveOptions.find(move => move.name === option.key)?.type)}`}
                            renderOption={option => <MoveCandidateRow name={option.label} type={oppMoveOptions.find(move => move.name === option.key)?.type} meta={resolveMoveMeta(option.key, oppMoveOptions, movePoolByKey)} labels={moveSlotLabels} />}
                            optionProps={option => bindTooltip(moveTooltipData(option.key, siteLanguage))}
                            menuClassName="move-autocomplete-menu damage-opponent-move-menu"
                            inputProps={{ 'aria-labelledby': 'opp-entry-move-label', placeholder: lt('사용 가능 기술 검색'), disabled: !oppMember.key || oppMember.revealedMoves.length >= 4 || oppMovePool?.status !== 'ready-verified' }} />
                          <button type="button" className="pick-chip" onMouseDown={e => e.preventDefault()}
                            onClick={() => commitOpponentMoveDraft()}
                            disabled={!revealedMoveCandidates(opponentMoveDraft).length}>{lt('추가')}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <label>
                  {lt('메모')}
                  <textarea value={oppMember.notes} placeholder={lt('상대 메모 예시')} onChange={(e) => {
                    setOpponentField(selectedOpp, { notes: e.target.value })
                  }} />
                </label>
                <div className="inline-controls">
                  <label>
                    {lt('스피드 EV')}
                    <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={oppMember.speedEv} onChange={(e) => {
                      setOpponentField(selectedOpp, { speedEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })
                    }} />
                  </label>
                  <label>
                    {lt('최속 가정')}
                    <input type="checkbox" checked={oppMember.natureBoost} onChange={(e) => {
                      setOpponentField(selectedOpp, { natureBoost: e.target.checked })
                    }} />
                  </label>
                  <label>
                    {lt('스카프')}
                    <input type="checkbox" checked={oppMember.scarf} onChange={(e) => {
                      setOpponentField(selectedOpp, { scarf: e.target.checked })
                    }} />
                  </label>
                  <label>
                    {lt('랭크')}
                    <select value={oppMember.speedStage} onChange={(e) => {
                      setOpponentField(selectedOpp, { speedStage: clampSpeedStage(e.target.value) })
                    }}>
                      {SPEED_STAGE_OPTIONS.map((n) => <option key={n} value={n}>{n >= 0 ? `+${n}` : n}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="panel wide">
          <h2>{lt('상대 엔트리 메모')}</h2>
          <textarea
            value={battleNote}
            placeholder={lt('엔트리 메모 예시')}
            onChange={(e) => setBattleNote(e.target.value)}
          />
        </section>
        </> : mainSection === 'sample' ? <>
        <section className="panel wide sample-workbench-panel">
          <div className="sample-content-panel">
          {sampleWorkbenchTab === 'library' ? <div className="creator-library">
            {librarySourceId ? <div className="creator-library-detail">
              <a className="creator-library-back" href={libraryListHref(libraryContext)}><UiIcon name="chevron" size={16} className="ui-icon ui-icon-back" />{lt('샘플 라이브러리')} · {lt('목록으로')}</a>
              {librarySource ? <>
                <div className="section-head"><div><h2>{librarySource.title}</h2>{librarySource.contentKind === 'party' ? <SourcePlacementBadge placement={librarySource.placement} language={siteLanguage} /> : null}<p className="muted">{librarySource.creator ?? lt('제작자 미확인')} · {librarySource.platform} · {librarySource.contentKind === 'party' ? lt('파티 소개') : lt('개별 포켓몬 샘플')} · {librarySource.format === 'singles' ? lt('싱글배틀') : librarySource.format === 'doubles' ? lt('더블배틀') : lt('형식 미확인: 원본에 싱글/더블 표기 없음')}</p></div></div>
                <p className="creator-library-trust-note">{lt('구성 확인은 빌드 정보 기준이며, 순위·성적의 공식 검증이 아닙니다.')}</p>
                <div className="creator-library-source-summary"><a href={librarySource.canonicalUrl} target="_blank" rel="noopener noreferrer"><UiIcon name="info" size={16} />{lt('원본 출처')}</a><span>{lt('원본 ID')}: {librarySource.sourceId}</span></div>
                {librarySource.contentKind === 'party' ? <div className="creator-library-completeness"><span>{lt('구성 확인')} {librarySource.confirmedMemberCount}/{librarySource.partySize ?? 6}</span><span>{librarySource.completeMemberCount === librarySource.partySize ? lt('전체 파티 구성 확인') : lt('전체 파티 구성 미확인')}</span></div> : null}
                {librarySource.contentKind === 'party' && librarySource.partySize === 6 && librarySource.completeMemberCount === 6 ? <button type="button" className="action-button creator-library-party-action" onClick={() => importCreatorParty(librarySource)}><UiIcon name="plus" size={17} />{lt('저장 파티에 추가')}</button> : librarySource.contentKind === 'party' ? <p className="muted">{lt('전체 파티 구성 미확인')} · {lt('저장 파티에 추가')} {lt('불가')}</p> : null}
                {creatorPartyImportError ? <p role="alert">{creatorPartyImportError}</p> : null}
                <div className="creator-library-lineup">{librarySource.members.map(entry => <div key={entry.id} className="creator-library-member-card">
                  {creatorCard(entry)}
                  <div className="creator-library-member-context">
                    {librarySource.contentKind === 'party' ? <a href={libraryDetailHref(`individual:${entry.id}`, { ...libraryContext, kind: 'pokemon' })}>{indexByKey.get(entry.pokemonKey) ? displayName(indexByKey.get(entry.pokemonKey)!, siteLanguage) : entry.title} · {lt('개별 포켓몬 샘플')}</a> : null}
                    {canImportCreatorSample(entry) && indexByKey.has(entry.pokemonKey) ? <button type="button" className="action-button" onClick={() => {
                    if (!canImportCreatorSample(entry)) return
                    const formAbilities = indexByKey.get(entry.pokemonKey)?.abilities_ko ?? []
                    const sourceAbility = entry.build.ability
                    const resolvedAbility = formAbilities.includes(sourceAbility) ? sourceAbility :
                      entry.pokemonKey.startsWith('mega-') && entry.partialBuild?.preMegaAbilities?.includes(sourceAbility) && formAbilities.length === 1 ? formAbilities[0] : null
                    if (!resolvedAbility) return
                    restoringLibraryRoute.current = null
                    setSampleForge({ ...defaultSampleForge(), key: entry.pokemonKey, item: entry.build.item, ability: resolvedAbility, evs: { ...entry.build.evs }, config: { nature: entry.build.nature, scarf: false, speedStage: 0 } })
                    setSampleLockedMoves([...entry.build.moves])
                    setSampleSearch(searchDisplayLabel(entry.pokemonKey, siteLanguage))
                    setSampleItemDraft(displayItemLabel(entry.build.item, siteLanguage))
                    setLibrarySourceId(null)
                    setSampleWorkbenchTab('builder')
                  }}><UiIcon name="download" size={17} />{lt('샘플 편집기에 가져오기')}</button> : <p className="muted">{indexByKey.has(entry.pokemonKey) ? lt('구성 미완성 · 불러올 수 없음') : lt('지원되지 않는 폼으로 실수치를 계산하지 않습니다.')}</p>}
                    {(entry.build ?? entry.partialBuild)?.item === '자몽열매' ? <p className="muted">{lt('원본 도구 표기')}: 자몽열매 · {lt('도구 매핑')}: {displayItemLabel('オボンのみ', siteLanguage)}</p> : null}
                    <small className="muted" title={entry.provenance.evidence}>{lt('게시')}: {entry.provenance.publishedAt ?? lt('미확인')} · {lt('수집')}: {entry.provenance.collectedAt} · {lt('확인')}: {entry.provenance.verifiedAt || lt('미확인')}</small>
                    <div className="creator-library-evidence-links" aria-label={lt('출처 및 확인 기록')}>
                      {Object.entries(entry.provenance.fields).map(([field, evidence]) => {
                        const names: Record<string, string> = { pokemonKey: '폼', item: '도구', moves: '기술', evsKnown: '노력치', evs: '노력치', actualStats: '실수치', actualStatsForm: '폼', nature: '성격', ability: '특성', preMegaAbilities: '특성', creator: '제작자', title: '제목', format: '배틀 형식', rank: '순위', build: '샘플 빌드' }
                        return evidence ? <a key={field} href={evidence.sourceUrl} target="_blank" rel="noopener noreferrer" title={`${evidence.location} · ${evidence.checkedAt}`}>{lt(names[field.split('.').pop() ?? field] ?? field)}</a> : null
                      })}
                    </div>
                  </div>
                </div>)}</div>
                {relatedCreatorParties[librarySource.sourceId] && librarySource.contentKind === 'pokemon' ? <section className="creator-library-companion-party">
                  <h3>{lt('영상에 나온 사용 파티')}</h3>
                  <div className="creator-library-companion-list">{relatedCreatorParties[librarySource.sourceId].members.map(member => <a key={member.id} href={libraryDetailHref(`individual:${member.id}`, { ...libraryContext, kind: 'pokemon' })}>
                    {indexByKey.get(member.pokemonKey)?.sprite ? <img src={indexByKey.get(member.pokemonKey)!.sprite} alt="" /> : null}
                    <span>{indexByKey.get(member.pokemonKey) ? displayName(indexByKey.get(member.pokemonKey)!, siteLanguage) : member.title}</span>
                    <small>{canImportCreatorSample(member) ? lt('구성 확인') : lt('부분 확인')}</small>
                  </a>)}</div>
                  {relatedCreatorParties[librarySource.sourceId].completeMemberCount === 6 ? <button type="button" className="action-button" onClick={() => importCreatorParty(relatedCreatorParties[librarySource.sourceId])}><UiIcon name="plus" size={17} />{lt('저장 파티에 추가')}</button> : <p className="muted">{lt('전체 파티 구성 미확인')} · {lt('저장 파티에 추가')} {lt('불가')}</p>}
                  {creatorPartyImportError ? <p role="alert">{creatorPartyImportError}</p> : null}
                </section> : null}
              </> : <p role="status">{lt('출처를 찾을 수 없습니다.')}</p>}
            </div> : <>
            <p className="muted">{lt('원본에서 확인된 구성만 빌더로 가져옵니다.')}</p>
            <p className="creator-library-trust-note">{lt('구성 확인은 빌드 정보 기준이며, 순위·성적의 공식 검증이 아닙니다.')}</p>
            <div className="creator-library-kind-tabs ui-segmented" role="group" aria-label={lt('샘플 라이브러리')}>
              <button type="button" aria-label={lt('파티 소개')} aria-pressed={libraryContentKind === 'party'} onClick={() => setLibraryContentKind('party')}><UiIcon name="party" size={17} />{lt('파티 소개')}</button>
              <button type="button" aria-label={lt('개별 포켓몬 샘플')} aria-pressed={libraryContentKind === 'pokemon'} onClick={() => setLibraryContentKind('pokemon')}><UiIcon name="dex" size={17} />{lt('개별 포켓몬 샘플')}</button>
            </div>
            <div className="creator-library-filters">
              <label>{lt('지역')} <select aria-label={lt('지역')} value={libraryLanguage} onChange={(e) => setLibraryLanguage(e.target.value as LibraryLanguage | 'all')}><option value="all">{lt('전체')}</option><option value="ko">KR</option><option value="ja">JP</option></select></label>
              <label>{lt('배틀 형식')} <select aria-label={lt('배틀 형식')} value={libraryFormat} onChange={(e) => setLibraryFormat(e.target.value as LibraryFormat | 'all')}><option value="all">{lt('전체')}</option><option value="singles">{lt('싱글배틀')}</option><option value="doubles">{lt('더블배틀')}</option></select></label>
              <label><UiIcon name="search" size={16} />{lt('포켓몬 / 텍스트 검색')} <input value={libraryQuery} onChange={(e) => setLibraryQuery(e.target.value)} placeholder={lt('포켓몬 / 텍스트 검색')} /></label>
            </div>
            <p className="creator-library-result-count" role="status">{lt('검색 결과')} {visibleSources.length} · {libraryContentKind === 'party' ? lt('파티 소개') : lt('개별 포켓몬 샘플')} · {lt('제목·제작자·포켓몬 이름 검색')}</p>
            <div className="creator-library-list">
              {visibleSources.map((source) => <article key={source.id} className={`creator-library-card creator-library-card--${source.contentKind}`}>
                <a className="creator-library-source-link" href={libraryDetailHref(source.id, libraryContext)} onClick={(event) => {
                  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
                  libraryScrollRef.current = window.scrollY
                  window.history.replaceState({ ...window.history.state, libraryScroll: window.scrollY }, '', window.location.href)
                }}>
                  {source.contentKind === 'party' ? <CreatorPartySpriteStrip members={source.members.map(member => ({ id: member.id, sprite: indexByKey.get(member.pokemonKey)?.sprite }))} /> : <span className="creator-library-sprites">{source.members.map(member => { const row = indexByKey.get(member.pokemonKey); return row?.sprite ? <img key={member.id} src={row.sprite} alt="" /> : null })}</span>}
                  <strong>{source.title}</strong>
                  </a>
                  {source.contentKind === 'party' ? <SourcePlacementBadge placement={source.placement} language={siteLanguage} /> : null}
                <span className="creator-library-row-meta">{source.creator ?? lt('제작자 미확인')} · {source.language === 'ko' ? 'KR' : 'JP'} · {source.format === 'singles' ? lt('싱글배틀') : source.format === 'doubles' ? lt('더블배틀') : lt('형식 미확인')} · {source.completeMemberCount === source.members.length ? lt('구성 확인') : lt('부분 확인')}</span>
              </article>)}
              {!visibleSources.length ? <p className="muted" role="status">{pendingCreatorLeads.length ? lt('이 조건에 확인된 샘플 구성이 없습니다. 아래 영상 자료는 구성 확인 대기 중입니다.') : lt('검색 결과 없음')}</p> : null}
            </div>
            {sampleWorkbenchTab === 'library' && pendingCreatorLeads.length > 0 ? <div className="creator-library-leads"><h3>{lt('분류·구성 확인 대기')}</h3><p className="muted">{lt('영상 제목만 확인한 자료입니다. 아직 샘플로 쓰거나 가져올 수 없습니다.')}</p>{pendingCreatorLeads.map((entry) => <p key={entry.id}>{entry.creator} · {entry.title} · <a href={entry.provenance.sourceUrl} target="_blank" rel="noopener noreferrer">{lt('원본 출처')}</a></p>)}</div> : null}
            <section className="creator-library-personal"><h3><UiIcon name="info" size={18} />{lt('내 출처 링크')}</h3>
            {sampleWorkbenchTab === 'library' ? <form className="creator-library-submit" onSubmit={(event) => {
              event.preventDefault()
              const draft = createLinkDraft(linkDraftInput, draftLanguage, draftFormat)
              if (!draft) { setLinkDraftError(true); return }
              setCreatorLinkDrafts((prev) => prev.some((entry) => entry.sourceUrl === draft.sourceUrl) ? prev : [draft, ...prev])
              setLinkDraftInput('')
              setLinkDraftError(false)
            }}>
              <h3><UiIcon name="plus" size={18} />{lt('출처 링크 보관')}</h3><p className="muted">{lt('이 브라우저에만 부분 확인으로 저장됩니다. 제작자·순위·구성은 자동 판정하지 않습니다.')}</p>
              <div className="creator-library-submit-row"><select aria-label={lt('링크 지역')} value={draftLanguage} onChange={(e) => setDraftLanguage(e.target.value as LibraryLanguage)}><option value="ko">KR</option><option value="ja">JP</option></select><select aria-label={lt('링크 형식')} value={draftFormat} onChange={(e) => setDraftFormat(e.target.value as LibraryFormat)}><option value="singles">{lt('싱글배틀')}</option><option value="doubles">{lt('더블배틀')}</option></select><input aria-label={lt('출처 URL')} type="url" value={linkDraftInput} onChange={(e) => { setLinkDraftInput(e.target.value); setLinkDraftError(false) }} placeholder="https://…" required /><button type="submit" className="action-button"><UiIcon name="plus" size={17} />{lt('출처 링크 저장')}</button></div>
              {linkDraftError ? <p role="alert">{lt('http 또는 https 주소를 입력하세요.')}</p> : null}
              <p className="muted">{lt('공개 목록에 반영하려면 원본 링크와 구성 근거를 프로젝트 제보 폼으로 보내 주세요.')}{' '}<a href="https://forms.gle/Yrav9HB7Fzdffh3Q8" target="_blank" rel="noopener noreferrer">{lt('제보 폼 열기')}</a></p>
            </form> : null}
            {sampleWorkbenchTab === 'library' ? creatorLinkDrafts.filter((entry) => (libraryLanguage === 'all' || entry.language === libraryLanguage) && (libraryFormat === 'all' || entry.format === libraryFormat) && (!libraryQuery.trim() || entry.sourceUrl.toLocaleLowerCase().includes(libraryQuery.trim().toLocaleLowerCase()))).map((draft) => <div key={draft.sourceUrl} className="creator-library-card"><span className="pick-badge">{lt('부분 확인 · 개인 링크')} · {draft.language === 'ko' ? 'KR' : 'JP'}</span> <a href={draft.sourceUrl} target="_blank" rel="noopener noreferrer">{draft.sourceUrl}</a> <button type="button" className="pick-chip" onClick={() => setCreatorLinkDrafts((prev) => prev.filter((entry) => entry.sourceUrl !== draft.sourceUrl))}><UiIcon name="trash" size={16} />{lt('저장 링크 삭제')}</button></div>) : null}
            </section>
            </>}
          </div> : <>
          <nav className="sample-lab-tabs ui-segmented" role="tablist" aria-label={lt('샘플 연구소')}>
            {([{ value: 'builder', label: '샘플 빌드' }, { value: 'speed', label: '샘플 스피드' }, { value: 'damage', label: '샘플 대미지 계산' }] as const).map(({ value, label }) =>
              <a key={value} id={`sample-workbench-tab-${value}`} href={`#/sample-builder?sampleTab=${value}`} role="tab" aria-selected={sampleWorkbenchTab === value} aria-controls={`sample-${value}-section`} className={`tab-chip ${sampleWorkbenchTab === value ? 'active' : ''}`}>{lt(label)}</a>
            )}
          </nav>
          {sampleWorkbenchTab !== 'builder' ? <p className="sample-lab-build-link">{lt('현재 빌드')}: {displayName(sampleRow, siteLanguage)} · <a className="pick-chip" href="#/sample-builder?sampleTab=builder"><UiIcon name="edit" size={16} />{lt('샘플 빌드 편집')}</a></p> : null}
          {sampleWorkbenchTab === 'builder' ? <section id="sample-builder-section" role="tabpanel" aria-labelledby="sample-workbench-tab-builder" className="sample-lab-section" aria-label={lt('샘플 빌드')}>

            <div className="sample-builder-grid compact-sample-builder-grid">
            <div id="sample-builder-card" className="sample-main-card flat-sample-main-card">
              <PokemonCardHeading sprite={sampleRow.sprite} spriteAlt={displayName(sampleRow, siteLanguage)} types={sampleRow.types} name={
                <PokemonSearchField id="sample-species-0" className="sample-species-search sample-hero-search"
                  inputClassName="sample-species-search-input sample-hero-search-input" label={lt('포켓몬 검색')}
                  value={sampleSearch} placeholder={lt('포켓몬 검색')} onChange={setSampleSearch}
                  onSelect={key => selectSpecies('sample', 0, key)}
                  options={sampleSpeciesOptions.map(option => ({ key: option.key, label: searchDisplayLabel(option.key, siteLanguage), sprite: indexByKey.get(option.key)?.sprite }))} />
              } />
              <PokemonBuildFields key={`sample-${sampleForge.key}`} identity={`sample-${sampleForge.key}`} className="sample-meta-grid"
                ability={sampleForge.ability} abilityLabel={selectedAbilityDisplayName(sampleRow, sampleForge.ability, siteLanguage)} abilityError={heldAbilityError(sampleForge.key, sampleForge.ability, siteLanguage)} nature={sampleForge.config.nature} item={sampleForge.item}
                abilities={sampleAbilityOptions.map(value => ({ value, label: value }))}
                natures={NATURES.map(n => ({ value: n.id, label: natureChipLabel(n.id, siteLanguage) }))}
                itemOptions={query => filterItemOptions(query, siteLanguage, { fallbackToAll: false }).filter(value => isAllowedChampionsItem(sampleForge.key, value)).slice(0, 8).map(value => ({ value, label: itemAutocompletePrimaryLabel(value, siteLanguage), secondary: itemAutocompleteSecondaryLabel(value, siteLanguage), sprite: itemSpriteSrc(sampleForge.key, value) }))}
                onAbility={ability => setSampleForge(prev => ({ ...prev, ability }))}
                onNature={nature => setSampleForge(prev => ({ ...prev, config: { ...prev.config, nature: nature as NatureId } }))}
                onItem={item => setSampleForge(prev => ({ ...prev, item: item ? resolveItemInput(prev.key, item, siteLanguage) : '' }))}
                labels={{ ability: lt('특성'), nature: lt('성격'), item: lt('도구'), none: lt('미선택'), itemPlaceholder: lt('사용 가능 도구 선택'), fixed: lt('메가스톤 고정'), clear: lt('지우기') }}
                itemLabel={value => displayItemLabel(value, siteLanguage)} itemSprite={value => itemSpriteSrc(sampleForge.key, value)} fixedItem={sampleFixedMegaStone}
                itemError={heldItemError(sampleForge.key, sampleForge.item, siteLanguage)} repairLabel={siteLanguage === 'ko' ? `${sampleFixedMegaStone} 장착` : siteLanguage === 'ja' ? `${sampleFixedMegaStone} を装備` : `Equip ${sampleFixedMegaStone}`}
                abilityTooltip={value => bindTooltip(value ? abilityTooltipData(value, siteLanguage, sampleRow) : null)}
                itemTooltip={value => bindTooltip(value ? itemTooltipData(value, siteLanguage) : null)}
              />
              <PokemonStatGrid stats={EFFORT_STAT_OPTIONS.map(stat => ({
                key: stat.key, label: lt(stat.label), theme: statThemeClass(stat.key),
                value: partyStatValue(sampleRow, sampleForge, stat.key), ev: sampleForge.evs[stat.key],
              }))} className="sample-stat-preview-list" sampleStyle onTune={() => { sampleTuningOpener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setSampleTuningIdentity(sampleForge.key); setSampleTuningModalOpen(true) }} />
            </div>
            <div id="sample-moves-card" className="move-card flat-sample-move-card">
              <>
                  <div className="sample-tracking-cluster">
                    <div className="sample-track-workspace">
                      <div className="sample-track-main-column">
                        {renderSampleMoveEditor()}
                        {sampleCuratedMoveBuckets.length ? <div className="sample-track-card top-move-chip-card sample-track-secondary-section">
                          <div className="row-between sample-track-head compact-gap sample-candidate-head">
                            <strong>{lt('실전 후보')}</strong>
                            <div className="tab-bar sample-filter-bar sample-candidate-filter-bar">
                              {([
                                { value: 'core', label: lt('코어'), count: sampleCuratedMoveBuckets.find((bucket) => bucket.id === 'core')?.moves.length ?? 0 },
                                { value: 'options', label: lt('선택'), count: sampleCuratedMoveBuckets.find((bucket) => bucket.id === 'options')?.moves.length ?? 0 },
                                { value: 'utility', label: lt('유틸'), count: sampleCuratedMoveBuckets.find((bucket) => bucket.id === 'utility')?.moves.length ?? 0 },
                                { value: 'all', label: lt('전체'), count: sampleCuratedMoveBuckets.reduce((sum, bucket) => sum + bucket.moves.length, 0) },
                              ] as { value: MoveFilter; label: string; count: number }[])
                                .filter((option) => option.value === 'all' || option.count > 0)
                                .map((option) => (
                                  <button key={`sample-candidate-filter-${option.value}`} type="button" className={`tab-chip sample-filter-chip ${sampleMoveFilter === option.value ? 'active' : ''}`} onClick={() => setSampleMoveFilter(option.value)}>
                                    {option.label}
                                    <strong>{option.count}</strong>
                                  </button>
                                ))}
                            </div>
                          </div>
                          <div className="sample-candidate-bucket-grid">
                            {sampleVisibleMoveBuckets.map((bucket) => (
                              <section key={`sample-candidate-bucket-${bucket.id}`} className={`sample-candidate-bucket ${bucket.id}`}>
                                <div className="row-between sample-candidate-bucket-head compact-gap">
                                  <span className={`pick-badge sample-candidate-kind-badge ${bucket.id}`}>{bucket.label}</span>
                                  <span className="muted-inline">{bucket.moves.length}</span>
                                </div>
                                <div className="move-chip-wrap">
                                  {bucket.moves.map((move) => {
                                    const locked = sampleConfirmedMoves.includes(move)
                                    const eligible = Boolean(resolveEligibleMoveInput(move, sampleMovePool))
                                    const reason = lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')
                                    return (
                                      <button
                                        key={`sample-top-move-${sampleForge.key}-${bucket.id}-${move}`}
                                        type="button"
                                        className={`move-chip core ${locked ? 'confirmed' : ''} ${moveTypeThemeClass(sampleMoveType(move))}`}
                                        onClick={() => applySampleCandidateMove(move, activeSampleMoveSlotIdx)}
                                        disabled={!eligible}
                                        title={!eligible ? reason : undefined}
                                        aria-label={!eligible ? `${move} — ${reason}` : move}
                                        {...bindTooltip(moveTooltipData(move, siteLanguage))}
                                      >
                                        {move}
                                      </button>
                                    )
                                  })}
                                </div>
                              </section>
                            ))}
                          </div>
                        </div> : sampleTopSuggestedMoves.length ? <div className="sample-track-card top-move-chip-card sample-track-secondary-section">
                          <div className="row-between sample-track-head compact-gap">
                            <strong>{lt('사용률 상위 기술')}</strong>
                            <span className="muted-inline">Top {Math.min(10, sampleTopSuggestedMoves.length)}</span>
                          </div>
                          <div className="move-chip-wrap">
                            {sampleTopSuggestedMoves.map((move) => {
                              const locked = sampleConfirmedMoves.includes(move)
                              const eligible = Boolean(resolveEligibleMoveInput(move, sampleMovePool))
                              const reason = lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')
                              return (
                                <button
                                  key={`sample-top-move-${sampleForge.key}-${move}`}
                                  type="button"
                                  className={`move-chip core ${locked ? 'confirmed' : ''} ${moveTypeThemeClass(sampleMoveType(move))}`}
                                  onClick={() => applySampleCandidateMove(move, activeSampleMoveSlotIdx)}
                                  disabled={!eligible}
                                  title={!eligible ? reason : undefined}
                                  aria-label={!eligible ? `${move} — ${reason}` : move}
                                  {...bindTooltip(moveTooltipData(move, siteLanguage))}
                                >
                                  {move}
                                </button>
                              )
                            })}
                          </div>
                        </div> : sampleMovePool?.status === 'loading' ? null : <div className="sample-empty-state">{lt('기술 데이터가 없는 포켓몬만 직접 입력합니다.')}</div>}
                      </div>
                    </div>
                  </div>
                </>
            </div>
          </div>
          <div className="sample-builder-action-card">
            <div className="sample-builder-action-head">
              <strong>{lt('저장/적용')}</strong>
            </div>
            <div className="sample-builder-save-row">
              <input className="sample-label-input sample-builder-label-input" value={sampleLabelDraft} placeholder={lt('샘플 이름 예시')} onChange={(e) => setSampleLabelDraft(e.target.value)} />
              <button type="button" className="action-button sample-save-button sample-builder-save-button" onClick={saveCurrentSample}><UiIcon name="plus" size={17} />{lt('샘플 저장')}</button>
            </div>
            <div className="sample-builder-slot-grid">
              {party.map((member, idx) => {
                const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                return (
                  <button
                    key={`sample-builder-slot-${idx}`}
                    type="button"
                    className={`sample-builder-slot-chip ${selectedMy === idx ? 'active' : ''}`}
                    onClick={() => setSelectedMy(idx)}
                  >
                    <span>{slotNumberLabel(idx, siteLanguage)}</span>
                    <strong>{row ? displayName(row, siteLanguage) : lt('빈 슬롯')}</strong>
                  </button>
                )
              })}
            </div>
            <p className="muted">{lt('편집 초안은 아직 파티에 반영되지 않았습니다. 저장은 개인 샘플에 복사하고 적용은 아래 선택 슬롯을 교체합니다.')}</p>
            <button type="button" className="action-button sample-builder-apply-button" onClick={() => applySampleToPartySlot(selectedMy)}><UiIcon name="check" size={17} />{putInPartySlotLabel(selectedMy, siteLanguage)}</button>
          </div>
          </section> : null}
          {sampleWorkbenchTab === 'speed' ? <section id="sample-speed-section" role="tabpanel" aria-labelledby="sample-workbench-tab-speed" className="sample-lab-section" aria-label={lt('샘플 스피드')}>
          <h2>{lt('샘플 스피드')}</h2>
          <div className="sample-builder-grid compact-sample-builder-grid sample-single-pane-grid">
            <div className="sample-main-card flat-sample-main-card">
              <div className="sample-calculator-split sample-speed-calculator-split">
                <div className="sample-calculator-side sample-calculator-source">
                  <div className="sample-calculator-side-heading">
                    <span>{lt('내 포켓몬')}</span>
                    <strong>{displayName(sampleRow, siteLanguage)}</strong>
                  </div>
              <div className="sample-damage-top-panel sample-speed-top-panel">
                <div className="sample-speed-toolbar sample-workbench-toolbar">
                  <div className="sample-speed-inline-controls sample-current-build-toolbar sample-current-build-toolbar-speed">
                    <div className="sample-speed-control-card sample-current-build-card sample-current-build-card-embedded sample-workbench-section-block">
                      {renderSampleForgeNatureField()}
                      {renderSampleForgeEffortGrid('speed')}
                      <div className="combat-index-strip" aria-label={`${lt('물리 내구력')} / ${lt('특수 내구력')}`}>
                        <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('physical-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${sampleAttackerStats.hp} × ${sampleAttackerStats.defense}` }]))}>
                          <small>{lt('물리 내구력')}</small><strong>{formatBattleIndex(sampleBulkIndices.physical, siteLanguage)}</strong>
                        </span>
                        <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('special-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${sampleAttackerStats.hp} × ${sampleAttackerStats.spDefense}` }]))}>
                          <small>{lt('특수 내구력')}</small><strong>{formatBattleIndex(sampleBulkIndices.special, siteLanguage)}</strong>
                        </span>
                      </div>
                    </div>
                    <label className="sample-speed-slider-field sample-speed-stage-inline-card sample-workbench-section-block">
                      <span className="sample-workbench-section-label">{lt('내 스피드 랭크')}</span>
                      <select value={sampleForge.config.speedStage} onChange={(e) => setSampleForge((prev) => ({ ...prev, config: { ...prev.config, speedStage: clampSpeedStage(e.target.value) } }))}>
                        {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-speed-self-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
              {renderSampleMoveEditor()}
                </div>
                <div className="sample-calculator-side sample-calculator-target">
                  <div className="sample-calculator-side-heading enemy">
                    <span>{lt('상대 포켓몬')}</span>
                    <strong>{sampleSpeedCalcs[0]?.row ? displayName(sampleSpeedCalcs[0].row, siteLanguage) : lt('비교 대상 없음')}</strong>
                  </div>
              <label className="sample-speed-slider-field sample-damage-search-field sample-speed-control-card sample-workbench-section-block sample-compare-adder-block sample-damage-compare-adder-standalone">
                <div className="sample-compare-adder-head">
                  <span className="sample-workbench-section-label">{lt(sampleSpeedCalcs.length ? '비교 상대 교체' : '비교 상대 선택')}</span>
                </div>
                <div className="sample-compare-adder-subhead">
                  <div className="sample-compare-adder-state">
                    <span className="sample-compare-adder-state-label">{lt('현재')}</span>
                    <div className="pick-summary-badges sample-damage-adder-badges sample-damage-adder-badges-quiet">
                      <span className="pick-badge quiet">{lt('1:1 비교')}</span>
                    </div>
                  </div>
                  <p className="sample-compare-adder-copy">{lt('가장 경계할 상대 한 마리를 선택합니다.')}</p>
                </div>
                <PokemonSearchField id="sample-speed-add" value={sampleSpeedSearch} placeholder={lt('포켓몬 검색')} onChange={setSampleSpeedSearch} onSelect={addSampleSpeedTarget} options={sampleSpeedSearchResults.map(option => ({ key: option.key, label: searchDisplayLabel(option.key, siteLanguage), sprite: indexByKey.get(option.key)?.sprite }))} menuClassName="sample-damage-search-menu" />
              </label>
              <div className="sample-overview-stack sample-workbench-section sample-compare-targets-section">
                <div className="row-between sample-workbench-section-head">
                  <span className="sample-workbench-section-label">{lt('비교 상대')}</span>
                </div>
                {heldItemError(sampleForge.key, sampleForge.item, siteLanguage) && <p role="status">{heldItemError(sampleForge.key, sampleForge.item, siteLanguage)}</p>}
                {sampleSpeedCalcs.length ? sampleSpeedCalcs.map((entry) => (
                  <div key={`sample-speed-target-${entry.idx}`} className="sample-overview-card sample-damage-target-card sample-workbench-wide-card sample-damage-compare-card">
                    <div className="row-between sample-compare-card-head">
                      <div className="sample-compare-hero sample-compare-hero-compact">
                        {entry.row.sprite ? <img src={entry.row.sprite} alt={displayName(entry.row, siteLanguage)} className="sample-compare-sprite" /> : null}
                        <strong>{displayName(entry.row, siteLanguage)}</strong>
                      </div>
                      <button type="button" className="pick-chip" onClick={() => removeSampleSpeedTarget(entry.idx)}><UiIcon name="trash" size={16} />{lt('삭제')}</button>
                    </div>
                    <div className="sample-speed-rank-row">
                      <label>
                        <span>{lt('랭크')}</span>
                        <select value={entry.member.speedStage} onChange={(e) => updateSampleSpeedTarget(entry.idx, { speedStage: clampSpeedStage(e.target.value) })}>
                          {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`sample-speed-stage-${entry.idx}-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="sample-workbench-card-body sample-speed-card-body sample-speed-card-body-full">
                      <div className="sample-workbench-mainpanel">
                        <div className="sample-speed-cut-grid sample-speed-cut-grid-wide">
                          {entry.cutoffs.map((cutoff) => (
                            <div key={`sample-speed-cutoff-${entry.idx}-${cutoff.id}`} className={`sample-speed-cut-card ${cutoff.result === lt('내가 앞섬') ? 'ahead' : cutoff.result === lt('동속') ? 'tie' : 'behind'}`}>
                              <div className="sample-speed-cut-head">
                                <span className="sample-speed-cut-label">{cutoff.label}</span>
                                <span className="sample-speed-cut-value">{lt('현재 속도')} <strong>{cutoff.speed}</strong></span>
                              </div>
                              <strong className={`sample-speed-verdict ${cutoff.result === lt('내가 앞섬') ? 'ahead' : cutoff.result === lt('동속') ? 'tie' : 'behind'}`}>{cutoff.result}</strong>
                              <div className="sample-speed-cut-meta">
                                <span>{lt('동속컷')} <strong>{cutoff.needs.tieEffort ?? '-'}</strong></span>
                                <span>{lt('추월컷')} <strong>{cutoff.needs.passEffort ?? '-'}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : <div className="sample-empty-state sample-damage-empty-state">
                  <div className="sample-damage-empty-state-copy">
                    <strong>{lt('비교 대상 없음')}</strong>
                    <p>{lt('가장 경계할 상대 한 마리를 선택합니다.')}</p>
                  </div>
                  <div className="pick-summary-badges sample-damage-empty-state-badges">
                    <span className="pick-badge quiet">{lt('1:1 비교')}</span>
                  </div>
                </div>}
              </div>
                </div>
              </div>
            </div>
          </div>
          </section> : null}
          {sampleWorkbenchTab === 'damage' ? <section id="sample-damage-section" role="tabpanel" aria-labelledby="sample-workbench-tab-damage" className="sample-lab-section" aria-label={lt('샘플 대미지 계산')}>
          <h2>{lt('샘플 대미지 계산')}</h2>
          <div className="sample-builder-grid compact-sample-builder-grid sample-single-pane-grid">
            <div className="sample-main-card flat-sample-main-card">
              <div className="sample-calculator-split sample-damage-calculator-split">
                <div className="sample-calculator-side sample-calculator-source">
                  <div className="sample-calculator-side-heading">
                    <span>{lt('내 포켓몬')}</span>
                    <strong>{displayName(sampleRow, siteLanguage)}</strong>
                  </div>
              <div className="sample-damage-top-panel">
                <div className="sample-damage-adder sample-workbench-toolbar">
                  <div className="sample-speed-inline-controls sample-current-build-toolbar">
                    <div className="sample-speed-control-card sample-current-build-card sample-current-build-card-embedded sample-workbench-section-block">
                    {renderSampleForgeNatureField()}
                    {renderSampleForgeEffortGrid('damage')}
                    <div className="combat-index-strip" aria-label={`${lt('물리 내구력')} / ${lt('특수 내구력')}`}>
                      <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('physical-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${sampleAttackerStats.hp} × ${sampleAttackerStats.defense}` }]))}>
                        <small>{lt('물리 내구력')}</small><strong>{formatBattleIndex(sampleBulkIndices.physical, siteLanguage)}</strong>
                      </span>
                      <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('special-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${sampleAttackerStats.hp} × ${sampleAttackerStats.spDefense}` }]))}>
                        <small>{lt('특수 내구력')}</small><strong>{formatBattleIndex(sampleBulkIndices.special, siteLanguage)}</strong>
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
                {renderSampleMoveEditor()}
                <div className="sample-power-index-panel sample-workbench-wide-card sample-workbench-section">
                  <div className="row-between sample-workbench-section-head">
                    <strong>{lt('기본 결정력')}</strong>
                    <span className="muted-inline">{lt('상대 영향 제외')} · {lt('기본 조건')}</span>
                  </div>
                  <div className="sample-power-index-grid">
                    {sampleDecisionPowerIndices.length ? sampleDecisionPowerIndices.map((entry) => {
                      const totalPower = entry.moveMeta?.hitPowers?.length
                        ? entry.moveMeta.hitPowers.reduce((sum, power) => sum + power, 0)
                        : (entry.moveMeta?.power ?? 0) * Math.max(1, entry.moveMeta?.hits ?? 1)
                      const formula = entry.attackStat && totalPower
                        ? `${entry.attackStat} × ${totalPower} × ${entry.stab}`
                        : '—'
                      return <div
                        key={`sample-power-index-${entry.moveName}`}
                        className="sample-power-index-card"
                        tabIndex={0}
                        {...bindTooltip(battleIndexTooltipData('power', siteLanguage, [
                          { label: lt('기술'), value: entry.moveName },
                          { label: lt('계산 기준'), value: formula },
                          ...(entry.notes.length ? [{ label: lt('상시 보정'), value: entry.notes.join(' · ') }] : []),
                        ]))}
                      >
                        <span className="sample-power-index-name">{entry.moveName}</span>
                        <strong>{entry.value == null ? (entry.moveMeta ? lt('상대 의존') : lt('대미지 계산 불가')) : formatBattleIndex(entry.value, siteLanguage)}</strong>
                        <small>{entry.value != null && entry.moveMeta ? `${lt('위력')} ${totalPower || '—'} · ${displayMoveCategoryName(entry.moveMeta.category, siteLanguage)}` : lt('대미지 계산 불가')}</small>
                      </div>
                    }) : <div className="sample-empty-state">{lt('등록 기술 없음')}</div>}
                  </div>
                </div>
                <div className="sample-damage-shared-controls sample-workbench-wide-card">
                  <strong>{lt('공유 전장')}</strong>
                  <label>{lt('날씨')}<select value={calcWeather} onChange={e => setCalcWeather(e.target.value as DamageWeather)}><option value="none">{lt('없음')}</option><option value="sun">{lt('쾌청')}</option><option value="rain">{lt('비')}</option><option value="sand">{lt('모래바람')}</option><option value="snow">{lt('싸라기눈')}</option></select></label>
                  <label>{lt('필드')}<select value={calcTerrain} onChange={e => setCalcTerrain(e.target.value as DamageTerrain)}><option value="none">{lt('없음')}</option><option value="electric">{lt('일렉트릭필드')}</option><option value="grassy">{lt('그래스필드')}</option><option value="psychic">{lt('사이코필드')}</option><option value="misty">{lt('미스트필드')}</option></select></label>
                </div>
              </div>
              </div>
              <div className="sample-calculator-side sample-calculator-target">
                  <div className="sample-calculator-side-heading enemy">
                    <span>{lt('상대 포켓몬')}</span>
                    <strong>{sampleDamageCalcs[0]?.row ? displayName(sampleDamageCalcs[0].row, siteLanguage) : lt('비교 대상 없음')}</strong>
                  </div>
              <div className="sample-speed-slider-field sample-damage-search-field sample-speed-control-card sample-workbench-section-block sample-compare-adder-block sample-damage-compare-adder-standalone">
                    <div className="sample-compare-adder-head">
                      <span className="sample-workbench-section-label">{lt(sampleDamageCalcs.length ? '비교 상대 교체' : '비교 상대 선택')}</span>
                    </div>
                    <PokemonSearchField id="sample-damage-add" label={lt('비교 상대 검색')} value={sampleDamageSearch} placeholder={lt('포켓몬 검색')} onChange={setSampleDamageSearch} onSelect={addSampleDamageTarget} options={sampleDamageSearchResults.map(option => ({ key: option.key, label: searchDisplayLabel(option.key, siteLanguage), sprite: indexByKey.get(option.key)?.sprite }))} menuClassName="sample-damage-search-menu" />
              </div>
              <div className="sample-overview-stack sample-workbench-section sample-compare-targets-section">
                <div className="row-between sample-workbench-section-head">
                  <span className="sample-workbench-section-label">{lt('비교 상대')}</span>
                </div>
                {sampleDamageCalcs.length ? sampleDamageCalcs.map((entry) => {
                  const bulkPresetKey = detectOpponentBulkPreset({ hpEv: entry.member.hpEv, defenseEv: entry.member.defenseEv, spDefenseEv: entry.member.spDefenseEv, defenseNature: entry.member.defenseNature, spDefenseNature: entry.member.spDefenseNature })
                  return (
                  <div key={`sample-damage-target-${entry.idx}`} className="sample-overview-card sample-damage-target-card sample-workbench-wide-card sample-damage-compare-card">
                    {heldAbilityError(entry.member.key, entry.member.ability, siteLanguage) && <div role="alert" className="item-validation-error">{heldAbilityError(entry.member.key, entry.member.ability, siteLanguage)}</div>}
                    <div className="row-between sample-compare-card-head">
                      <div className="sample-compare-hero sample-compare-hero-compact">
                        {entry.row?.sprite ? <img src={entry.row.sprite} alt={displayName(entry.row, siteLanguage)} className="sample-compare-sprite" /> : null}
                        <strong>{entry.row ? displayName(entry.row, siteLanguage) : lt('비교 대상 없음')}</strong>
                      </div>
                      <button type="button" className="pick-chip" onClick={() => removeSampleDamageTarget(entry.idx)}><UiIcon name="trash" size={16} />{lt('삭제')}</button>
                    </div>
                    {entry.defenderStats && entry.opponentEffortsValid ? <div className="combat-index-strip opponent-combat-index-strip" aria-label={`${lt('물리 내구력')} / ${lt('특수 내구력')}`}>
                      <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('physical-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${entry.defenderStats.hp} × ${entry.defenderStats.defense}` }]))}>
                        <small>{lt('물리 내구력')}</small><strong>{formatBattleIndex(durabilityIndices(entry.defenderStats).physical, siteLanguage)}</strong>
                      </span>
                      <span tabIndex={0} {...bindTooltip(battleIndexTooltipData('special-bulk', siteLanguage, [{ label: lt('계산 기준'), value: `${entry.defenderStats.hp} × ${entry.defenderStats.spDefense}` }]))}>
                        <small>{lt('특수 내구력')}</small><strong>{formatBattleIndex(durabilityIndices(entry.defenderStats).special, siteLanguage)}</strong>
                      </span>
                    </div> : null}
                    <div className="sample-workbench-card-body sample-damage-card-body">
                      <div className="sample-workbench-sidepanel">
                        <div className="sample-damage-target-controls sample-damage-target-controls-wide sample-damage-target-controls-stacked">
                          <div className="sample-damage-control-section sample-damage-control-section-primary">
                            <PokemonBuildFields key={`sample-damage-item-${entry.idx}-${entry.member.key}`} identity={`sample-damage-item-${entry.idx}-${entry.member.key}`} itemOnly className="sample-damage-item-editor"
                              ability={entry.member.ability} nature="hardy" item={entry.member.item} abilities={[]} natures={[]}
                              itemOptions={query => filterItemOptions(query, siteLanguage, { fallbackToAll: false }).filter(value => isAllowedChampionsItem(entry.member.key, value)).slice(0, 8).map(value => ({ value, label: itemAutocompletePrimaryLabel(value, siteLanguage), secondary: itemAutocompleteSecondaryLabel(value, siteLanguage), sprite: itemSpriteSrc(entry.member.key, value) }))}
                              onAbility={() => {}} onNature={() => {}}
                              onItem={item => updateSampleDamageTarget(entry.idx, { item: item ? resolveItemInput(entry.member.key, item, siteLanguage) : '' })}
                              labels={{ ability: lt('특성'), nature: lt('성격'), item: lt('상대 도구'), none: lt('미선택'), itemPlaceholder: lt('사용 가능 도구 선택'), fixed: lt('메가스톤 고정'), clear: lt('지우기') }}
                              itemLabel={value => displayItemLabel(value, siteLanguage)} itemSprite={value => itemSpriteSrc(entry.member.key, value)} fixedItem={requiredMegaStone(entry.member.key)}
                              itemError={heldItemError(entry.member.key, entry.member.item, siteLanguage)} repairLabel={requiredMegaStone(entry.member.key) ?? ''}
                              itemTooltip={value => bindTooltip(value ? itemTooltipData(value, siteLanguage) : null)} />
                            <label>{lt('특성')}<select value={entry.row ? resolveFormAbility(entry.row, entry.member.ability, abilityDescriptionFor, rows).slug ?? entry.member.ability : entry.member.ability} onChange={e => updateSampleDamageTarget(entry.idx, { ability: e.target.value })}>
                              <option value="">{lt('미선택')}</option>
                              {entry.member.ability && entry.row && !resolveFormAbility(entry.row, entry.member.ability, abilityDescriptionFor, rows).slug ? <option value={entry.member.ability}>{`${lt('원본 특성 표기')}: ${entry.member.ability}`}</option> : null}
                              {entry.row?.abilities.map(slug => <option key={slug} value={slug}>{localizedAbilityLabel(entry.row!, slug, siteLanguage, abilityDescriptionFor)}</option>)}
                            </select></label>

                             <div className="sample-damage-direction-result" aria-label={lt('상대 → 내 포켓몬')}>
                               <strong>{lt('상대 → 내 포켓몬')}</strong>
                               <small role="status">{learnsetStatusText(entry.reverse.opponentPool, siteLanguage) ? `${learnsetStatusText(entry.reverse.opponentPool, siteLanguage)} · ` : ''}{`EV ${entry.member.attackEv}/${entry.member.spAttackEv} · 성격 ${entry.member.attackNature}/${entry.member.spAttackNature} · ${entry.member.speedEv} Speed EV · ${conciseSpeedLabels[siteLanguage].lab}`}</small>
                               {!entry.opponentEffortsValid ? <p role="alert">{lt('노력치 합계가 66을 초과하거나 유효하지 않습니다.')}</p> : null}
                               <MoveSlotsEditor label={lt('기술 배치')} labels={moveSlotLabels} ownerId={`sample-opponent-${entry.member.key}-${entry.idx}`} role="editable"
                                 slots={entry.member.opponentMoves.slice(0, 4).map((move, slot) => {
                                   const editing = sampleOpponentMoveDraft?.key === entry.member.key && sampleOpponentMoveDraft.index === slot
                                   const input = editing ? sampleOpponentMoveDraft.text : move
                                   const meta = resolveMoveMeta(move, entry.reverse.opponentOptions, movePoolByKey)
                                   const result = entry.reverseMoves.find(item => item.moveName === move)
                                   return { id: `${slot}`, name: input, type: meta?.type, meta, className: moveTypeThemeClass(meta?.type),
                                       search: { id: `sample-opponent-move-${entry.member.key}-${slot}`, options: filterMoveOptions(input, entry.reverse.opponentOptions).slice(0, 8).map(option => ({ key: option.name, label: option.name })), showAllOnEmpty: true,
                                         onSelect: option => selectSampleOpponentMove(entry.idx, slot, option.key),
                                         optionClassName: option => moveTypeThemeClass(entry.reverse.opponentOptions.find(candidate => candidate.name === option.key)?.type),
                                         renderOption: option => <MoveCandidateRow name={option.label} type={entry.reverse.opponentOptions.find(candidate => candidate.name === option.key)?.type} meta={resolveMoveMeta(option.key, entry.reverse.opponentOptions, movePoolByKey)} labels={moveSlotLabels} />,
                                         optionProps: option => bindTooltip(moveTooltipData(option.key, siteLanguage)) },
                                       tooltipProps: bindTooltip(move ? moveTooltipData(move, siteLanguage) : null),
                                       inputProps: { placeholder: lt('상대 기술 검색'),
                                         onFocus: () => setSampleOpponentMoveDraft({ key: entry.member.key, index: slot, text: move }),
                                         onChange: event => setSampleOpponentMoveDraft({ key: entry.member.key, index: slot, text: event.target.value }),
                                         onBlur: event => { if (event.target.value !== move) selectSampleOpponentMove(entry.idx, slot, event.target.value); else setSampleOpponentMoveDraft(null) },
                                       }, children: recordedLearnsetText(move, entry.reverse.opponentPool, siteLanguage) ? <small role="status">{recordedLearnsetText(move, entry.reverse.opponentPool, siteLanguage)}</small> : null,
                                     preview: move ? <div className="sample-damage-move-result"><span>{result?.damage ? <><DamageRangeMeter damage={result.damage} targetHp={result.defenderStats.hp} language={siteLanguage} compact />{result.verdict ? <strong className="damage-verdict">{result.verdict}</strong> : null}</> : result?.reason}</span>
                                       {result?.moveHitOptions?.length ? <label>{lt('타수')}<select value={result.moveHitCount ?? result.moveHitOptions[0]} onChange={e => updateSampleMoveCondition(entry.idx, 'reverse', move, 'moveHits', Number(e.target.value))}>{result.moveHitOptions.map(hit => <option key={hit} value={hit}>{hit}</option>)}</select></label> : null}
                                       {result?.moveRule ? <label>{lt(result.moveRule.label)}{result.moveRule.kind === 'count' ? <input type="number" min={result.moveRule.min ?? 0} max={result.moveRule.max ?? 999} value={Number(result.moveConditionValue ?? result.moveRule.defaultValue)} onChange={e => updateSampleMoveCondition(entry.idx, 'reverse', move, 'conditionalValues', Number(e.target.value))} /> : <input type="checkbox" checked={Boolean(result.moveConditionValue)} onChange={e => updateSampleMoveCondition(entry.idx, 'reverse', move, 'conditionalValues', e.target.checked)} />}</label> : null}
                                     </div> : null }
                                 })}
                               />
                             <div className="sample-opponent-offense-grid">
                                {([{ key: 'attackEv', label: lt('상대 공격 EV') }, { key: 'spAttackEv', label: lt('상대 특공 EV') }] as const).map(({ key, label }) => <label key={key}>{label}<input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member[key]} onChange={e => updateSampleDamageTarget(entry.idx, { [key]: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} /></label>)}
                                {([{ key: 'attackNature', label: lt('상대 공격 성격') }, { key: 'spAttackNature', label: lt('상대 특공 성격') }] as const).map(({ key, label }) => <label key={key}>{label}<select value={entry.member[key]} onChange={e => updateSampleDamageTarget(entry.idx, { [key]: Number(e.target.value) })}><option value={0.9}>−</option><option value={1}>{lt('중립')}</option><option value={1.1}>+</option></select></label>)}
                              </div>
                               <small>{lt('내 체력')} {entry.reverse.defenderStats.hp} · {lt('내 방어')} {entry.reverse.defenderStats.defense} · {lt('내 특수방어')} {entry.reverse.defenderStats.spDefense}</small>
                           </div>
                          </div>
                          <div className="sample-damage-control-section">
                            <label>
                              {lt('상대 내구 프리셋')}
                              <select value={bulkPresetKey} onChange={(e) => applySampleDamageBulkPresetSelection(entry.idx, e.target.value as OpponentBulkPreset)}>
                                {Object.entries(OPPONENT_BULK_PRESETS).map(([key, preset]) => <option key={`sample-damage-bulk-preset-${entry.idx}-${key}`} value={key}>{preset.label}</option>)}
                                <option value="custom">{lt('직접 조절')}</option>
                              </select>
                            </label>
                            <div className="sample-damage-bulk-editor">
                                <label className="sample-bulk-hp-row">
                                  {lt('체력 EV')}
                                  <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.hpEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { hpEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                                </label>
                                <div className="sample-bulk-split-grid">
                                  <div className="sample-bulk-pair-row">
                                    <label>
                                      {lt('방어')}
                                      <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.defenseEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { defenseEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                                    </label>
                                    <label className="sample-bulk-check-label">
                                      <span>{lt('방어+')}</span>
                                      <input type="checkbox" checked={entry.member.defenseNature > 1} onChange={(e) => updateSampleDamageTarget(entry.idx, { defenseNature: e.target.checked ? 1.1 : 1 })} />
                                    </label>
                                  </div>
                                  <div className="sample-bulk-pair-row">
                                    <label>
                                      {lt('특방')}
                                      <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={entry.member.spDefenseEv} onChange={(e) => updateSampleDamageTarget(entry.idx, { spDefenseEv: clampNonNegativeInt(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                                    </label>
                                    <label className="sample-bulk-check-label">
                                      <span>{lt('특방+')}</span>
                                      <input type="checkbox" checked={entry.member.spDefenseNature > 1} onChange={(e) => updateSampleDamageTarget(entry.idx, { spDefenseNature: e.target.checked ? 1.1 : 1 })} />
                                    </label>
                                  </div>
                                </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sample-conditions-owner-grid">
                      {(['own', 'opponent'] as const).map(side => {
                        const battle = entry.conditions[side]
                        const sideLabel = side === 'own' ? lt('내 포켓몬') : lt('상대 포켓몬')
                        const opponentAbility = entry.row ? resolveSelectedAbility(entry.row, entry.member.ability, siteLanguage)?.slug ?? '' : ''
                        const ability = side === 'own' ? sampleAttackerAbilityValue : opponentAbility
                        const otherAbility = side === 'own' ? opponentAbility : sampleAttackerAbilityValue
                        const hasAttacks = (side === 'own' ? sampleDamageMoveChoices : entry.member.opponentMoves).some(Boolean)
                        const hasIncoming = (side === 'own' ? entry.member.opponentMoves : sampleDamageMoveChoices).some(Boolean)
                        const relevantCondition = (key: keyof SampleBattle) => Boolean(battle[key]) && key !== 'fullHp' || ({
                          burned: hasAttacks, lowHp: ['blaze','torrent','overgrow','swarm'].includes(ability),
                          poisoned: otherAbility === 'merciless', statused: ability === 'marvel-scale',
                          fullHp: ['multiscale','shadow-shield'].includes(ability), reflect: hasIncoming, lightScreen: hasIncoming, auroraVeil: hasIncoming,
                          critical: hasAttacks, movedAfterTarget: ability === 'analytic', electromorphosisCharged: ability === 'electromorphosis',
                          disguiseActive: ability === 'disguise', parentalBond: ability === 'parental-bond',
                        } as Partial<Record<keyof SampleBattle, boolean>>)[key] === true
                        return <div key={side} className="sample-damage-control-section"><strong>{sideLabel} · {conciseSpeedLabels[siteLanguage].battle}</strong>
                          <div className="sample-opponent-offense-grid">
                            {([{key:'attackStage',label:'공격 랭크'}, {key:'spAttackStage',label:'특공 랭크'}, {key:'defenseStage',label:'방어 랭크'}, {key:'spDefenseStage',label:'특방 랭크'}] as const).map(({key,label}) => <label key={key}>{sideLabel} {lt(label)}<select value={battle[key]} onChange={e => updateSampleBattle(entry.idx, side, {[key]: clampBattleStage(e.target.value)})}>{[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(n => <option key={n} value={n}>{n > 0 ? `+${n}` : n}</option>)}</select></label>)}
                            {(['attack','defense','spAttack','spDefense'] as const).map(key => <label key={key}>{sideLabel} {lt(({attack:'공격 실수치',defense:'방어 실수치',spAttack:'특공 실수치',spDefense:'특방 실수치'} as const)[key])}<input type="number" min={1} max={999} placeholder={lt('기본 실수치')} value={battle.actual[key] ?? ''} onChange={e => updateSampleBattle(entry.idx, side, {actual: {...battle.actual, [key]: e.target.value === '' ? undefined : Number(e.target.value)}})} /></label>)}
                          </div>
                          <div className="sample-reverse-conditions">
                            {([{key:'burned',label:'화상'}, {key:'lowHp',label:'HP 1/3 이하'}, {key:'poisoned',label:'독/맹독'}, {key:'statused',label:'상태이상'}, {key:'fullHp',label:'HP 100%'}, {key:'reflect',label:'리플렉터'}, {key:'lightScreen',label:'빛의장막'}, {key:'auroraVeil',label:'오로라베일'}, {key:'critical',label:'급소'}, {key:'movedAfterTarget',label:'상대보다 늦게 행동'}, {key:'electromorphosisCharged',label:'일렉트릭 차지됨'}, {key:'disguiseActive',label:'탈 intact'}, {key:'parentalBond',label:'부자유친 발동'}] as const).filter(({key}) => relevantCondition(key)).map(({key,label}) => <label key={key} className="sample-reverse-checkbox"><input type="checkbox" checked={battle[key]} onChange={e => updateSampleBattle(entry.idx, side, {[key]: e.target.checked})} />{sideLabel} {lt(label)}</label>)}
                            {ability === 'supreme-overlord' || battle.faintedAllies > 0 ? <label>{sideLabel} {lt('기절한 아군 수')}<input type="number" min={0} max={5} value={battle.faintedAllies} onChange={e => updateSampleBattle(entry.idx, side, {faintedAllies: Number(e.target.value)})} /></label> : null}
                            {ability === 'rivalry' || battle.rivalryMode !== 'neutral' ? <label>{sideLabel} {lt('라이벌리 성별 관계')}<select value={battle.rivalryMode} onChange={e => updateSampleBattle(entry.idx, side, {rivalryMode: e.target.value as RivalryMode})}><option value="neutral">{lt('없음')}</option><option value="same">{lt('같은 성별')}</option><option value="opposite">{lt('다른 성별')}</option></select></label> : null}
                          </div>
                        </div>
                      })}
                    </div>
                  </div>
                )}) : <div className="sample-empty-state sample-damage-empty-state">
                  <strong>{lt('비교 대상 없음')}</strong>
                </div>}
              </div>
                </div>
              </div>
            </div>
          </div>
          </section> : null}
          </>}
          </div>
        </section>
        {sampleWorkbenchTab === 'builder' ? <section id="sample-saved-card" className="panel wide">
          <details className="saved-sample-list flat-saved-sample-list sample-drawer sample-managed-drawer" open>
            <summary className="sample-drawer-summary sample-managed-summary">
              <span>{lt('저장한 샘플')}</span>
              <span className="pick-badge">{savedSampleCountLabel(savedSamples.length, siteLanguage)}</span>
            </summary>
            <div className="saved-sample-drawer-body sample-saved-grid">
            {savedSamples.length ? savedSamples.map((entry) => {
              const savedRow = indexByKey.get(entry.member.key) ?? rows[0]
              const savedItem = visibleChampionsItem(entry.member.key, entry.member.item)
              const savedMoves = entry.lockedMoves.filter(Boolean).slice(0, 4)
              return (
                <div key={entry.id} className="saved-sample-item sample-saved-card-item sample-saved-grid-card">
                  <div className="sample-saved-card-top">
                    <div className="sample-saved-card-hero">
                      {savedRow?.sprite ? <img src={savedRow.sprite} alt={displayName(savedRow, siteLanguage)} className="sample-saved-card-sprite" /> : null}
                      <div className="sample-saved-card-copy">
                        <strong>{entry.label}</strong>
                        <p className="muted">{displayName(savedRow, siteLanguage)} · {natureLabel(entry.member.config.nature, siteLanguage)}</p>
                      </div>
                    </div>

                  </div>
                  <div className="pick-summary-badges sample-saved-item-badges sample-saved-rich-badges">
                    {savedItem ? <span className="pick-badge item-badge-inline" {...bindTooltip(itemTooltipData(savedItem, siteLanguage))}>
                      <img src={itemSpriteSrc(entry.member.key, savedItem)} alt={displayItemLabel(savedItem, siteLanguage)} className="item-sprite" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} />
                      {displayItemLabel(savedItem, siteLanguage)}
                    </span> : null}
                    <span className="pick-badge">{lt('실수치 스피드')} {partyStatValue(savedRow, entry.member, 'speed')}</span>
                    <span className="pick-badge">{lt('노력치 합')} {Object.values(entry.member.evs).reduce((sum, value) => sum + value, 0)}</span>
                    <span className="pick-badge">{lt('확정 기술 수')} {savedMoves.length}/4</span>
                  </div>
                  <div className="sample-saved-move-row">
                    {savedMoves.length ? savedMoves.map((move) => <span key={`${entry.id}-${move}`} className={`move-chip core confirmed sample-saved-move-chip ${moveTypeThemeClass(resolveMoveType(move, moveOptionsForEntry(sampleMoves.find((sample) => sample.key === entry.member.key)), movePoolByKey))}`}>{move}</span>) : <span className="muted-inline">{lt('아직 없음')}</span>}
                  </div>
                  <div className="sample-saved-actions">
                    <button type="button" className="pick-chip" onClick={() => {
                      setSampleForge({ ...entry.member, evs: { ...entry.member.evs }, config: { ...entry.member.config }, tuning: { ...entry.member.tuning } })
                      setSampleLockedMoves(entry.lockedMoves.filter(Boolean).slice(0, 4))
                      setSampleItemDraft(displayItemLabel(visibleChampionsItem(entry.member.key, entry.member.item), siteLanguage))
                      setSampleSearch(searchDisplayLabel(entry.member.key, siteLanguage))
                    }}><UiIcon name="download" size={17} />{lt('샘플 불러오기')}</button>
                    <button type="button" className="action-button sample-saved-apply-button" onClick={() => confirmPartySlotReplacement(entry.member, selectedMy, entry.lockedMoves)}><UiIcon name="check" size={17} />{putInPartySlotLabel(selectedMy, siteLanguage)}</button>
                    <button type="button" className="pick-chip" onClick={() => setSavedSamples((prev) => prev.filter((saved) => saved.id !== entry.id))}><UiIcon name="trash" size={17} />{lt('저장 샘플 삭제')}</button>
                  </div>
                </div>
              )
            }) : <p className="muted">{lt('아직 저장한 샘플이 없습니다.')}</p>}
            </div>
          </details>
        </section> : null}
        </> : <>
        {(mainSection === 'single' && activeTab === 'speed') ? <section className="panel wide">
          <div className="row-between section-head">
            <div>
              <h2>{lt('내 파티 추월컷')}</h2>
              <p className="muted calc-screen-summary">{lt('내 파티/상대 엔트리를 먼저 맞추면 계산이 덜 흔들립니다.')}</p>
            </div>
          </div>
          {oppRow ? <>
            <div className="speed-scenario-ladder">
              <div className="speed-compare-head-grid">
                <div className="speed-inline-head speed-context-card">
                  <div className="speed-target-head">
                    {myRow.sprite ? <img src={myRow.sprite} alt={displayName(myRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <div>
                      <span className="speed-context-role">{lt('내 포켓몬')}</span>
                      <strong>{displayName(myRow, siteLanguage)}</strong>
                      {myMegaCandidates.length ? <div className="calc-toggle-row">
                        <button type="button" className={`pick-chip ${!calcMyMegaKey ? 'active' : ''}`} onClick={() => setCalcMyMegaKey(null)}>{lt('일반')}</button>
                        {myMegaCandidates.map((megaKey) => <button key={`my-speed-mega-${megaKey}`} type="button" className={`pick-chip ${calcMyMegaKey === megaKey ? 'active' : ''}`} onClick={() => setCalcMyMegaKey(megaKey)}>{megaToggleLabel(megaKey, siteLanguage)}</button>)}
                      </div> : null}
                    </div>
                  </div>
                  <div className="speed-at-glance">
                    <div><span>{lt('스피드 종족값')}</span><strong>{myRow.speed}</strong></div>
                    <div><span>{lt('성격 보정')}</span><strong>{natureMultiplier(myMember.config.nature, 'speed') === 1.1 ? '+10%' : natureMultiplier(myMember.config.nature, 'speed') === 0.9 ? '-10%' : lt('보정 없음')}</strong></div>
                    <div><span>{lt('스피드 노력')}</span><strong>{myMember.evs.speed}/32</strong></div>
                    <div><span>{lt('스피드 랭크')}</span><strong>{myMember.config.speedStage >= 0 ? '+' : ''}{myMember.config.speedStage}</strong></div>
                    <div><span>{conciseSpeedLabels[siteLanguage].scarf}</span><div className="speed-at-glance-controls" role="group" aria-label={conciseSpeedLabels[siteLanguage].scarf}>
                      {([false, true] as const).map(scarf => <button key={String(scarf)} type="button" className={`pick-chip ${singleSpeedOwnScarf === scarf ? 'active' : ''}`} aria-pressed={singleSpeedOwnScarf === scarf} onClick={() => setSingleSpeedOwnScarf({ identity: singleSpeedOwnIdentity, scarf })}>{scarf ? lt('스카프') : lt('일반')} {scarf ? '×1.5' : '×1'}</button>)}
                    </div></div>
                    <div><span>{lt('실수치 스피드')}</span><strong>{actualStat(myRow.speed, myMember.evs.speed, natureMultiplier(myMember.config.nature, 'speed'))}</strong></div>
                    <div className="speed-at-glance-final"><span>{lt('최종 스피드')}</span><strong>{singleSpeedComparison?.currentSpeed ?? '—'}</strong></div>
                  </div>
                  <small className="speed-assumption-note">{singleSpeedOwnScarfChoice?.identity === singleSpeedOwnIdentity ? conciseSpeedLabels[siteLanguage].partyNote : lt('파티 도구 기준')}</small>
                  {mySpeedAbilityLine ? <small className="muted">{mySpeedAbilityLine.label} · {lt('내 특성 발동은 이 비교에 미적용')}</small> : null}
                </div>
                <div className="speed-ladder-head speed-target-card enemy speed-context-card">
                  <div className="speed-target-head">
                    {oppRow.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                    <div>
                      <span className="speed-context-role">{lt('상대 포켓몬')}</span>
                      <strong>{displayName(oppRow, siteLanguage)}</strong>
                      {oppMegaCandidates.length ? <div className="calc-toggle-row">
                        <button type="button" className={`pick-chip ${!calcOppMegaKey ? 'active' : ''}`} onClick={() => setCalcOppMegaKey(null)}>{lt('일반')}</button>
                        {oppMegaCandidates.map((megaKey) => <button key={`opp-speed-mega-${megaKey}`} type="button" className={`pick-chip ${calcOppMegaKey === megaKey ? 'active' : ''}`} onClick={() => setCalcOppMegaKey(megaKey)}>{megaToggleLabel(megaKey, siteLanguage)}</button>)}
                      </div> : null}
                    </div>
                  </div>
                  <div className="speed-at-glance">
                    <div><span>{lt('스피드 종족값')}</span><strong>{oppRow.speed}</strong></div>
                    <div><span>{lt('성격 보정')}</span><div className="speed-at-glance-controls" role="group" aria-label={conciseSpeedLabels[siteLanguage].nature}>
                      {(['neutral', 'fast'] as const).map(nature => <button key={nature} type="button" className={`pick-chip ${singleSpeedNature === nature ? 'active' : ''}`} aria-pressed={singleSpeedNature === nature} onClick={() => setSingleSpeedAssumption({ identity: singleSpeedIdentity, nature, item: singleSpeedItem, abilityActive: singleSpeedAbilityActive })}>{nature === 'fast' ? `${lt('최속')} +10%` : `${lt('준속')} ${lt('보정 없음')}`}</button>)}
                    </div></div>
                    <div><span>{lt('스피드 노력')}</span><strong>32/32</strong></div>
                    <div><span>{lt('스피드 랭크')}</span><strong>{oppMember.speedStage >= 0 ? '+' : ''}{oppMember.speedStage}</strong></div>
                    <div><span>{conciseSpeedLabels[siteLanguage].scarf}</span><div className="speed-at-glance-controls" role="group" aria-label={conciseSpeedLabels[siteLanguage].item}>
                      {(['normal', 'scarf'] as const).map(item => <button key={item} type="button" className={`pick-chip ${singleSpeedItem === item ? 'active' : ''}`} aria-pressed={singleSpeedItem === item} onClick={() => setSingleSpeedAssumption({ identity: singleSpeedIdentity, nature: singleSpeedNature, item, abilityActive: singleSpeedAbilityActive })}>{item === 'scarf' ? lt('스카프') : lt('일반')} {item === 'scarf' ? '×1.5' : '×1'}</button>)}
                    </div></div>
                    <div><span>{lt('실수치 스피드')}</span><strong>{actualStat(oppRow.speed, 32, singleSpeedNature === 'fast' ? 1.1 : 1)}</strong></div>
                    <div className="speed-at-glance-final"><span>{lt('최종 스피드')}</span><strong>{singleSpeedComparison?.targetSpeed ?? '—'}</strong></div>
                  </div>
                  <small className="speed-assumption-note">{conciseSpeedLabels[siteLanguage].entryNote}</small>
                  {singleSpeedAbility ? <div className="single-speed-assumptions" role="group" aria-label={conciseSpeedLabels[siteLanguage].ability}>
                    <span>{conciseSpeedLabels[siteLanguage].ability} · {singleSpeedAbility.label} · {lt(({ 'swift-swim': '비가 내릴 때', 'sand-rush': '모래바람일 때', 'chlorophyll': '쾌청일 때', 'slush-rush': '눈이 내릴 때', 'surge-surfer': '일렉트릭필드일 때', unburden: '도구를 소비하거나 잃은 뒤' } as Record<string, string>)[singleSpeedAbility.slug])}</span>
                    <button type="button" className={`pick-chip ${!singleSpeedAbilityActive ? 'active' : ''}`} aria-pressed={!singleSpeedAbilityActive} onClick={() => setSingleSpeedAssumption({ identity: singleSpeedIdentity, nature: singleSpeedNature, item: singleSpeedItem, abilityActive: false })}>{lt('미발동')}</button>
                    <button type="button" className={`pick-chip ${singleSpeedAbilityActive ? 'active' : ''}`} aria-pressed={singleSpeedAbilityActive} onClick={() => setSingleSpeedAssumption({ identity: singleSpeedIdentity, nature: singleSpeedNature, item: singleSpeedItem, abilityActive: true })}>{conciseSpeedLabels[siteLanguage].active}</button>
                  </div> : null}
                </div>
              </div>
                <div className="speed-context-card single-speed-result">
                {singleItemError ? <p role="status">{singleItemError}</p> : singleSpeedComparison?.unavailableReason ? <p role="status">{lt(singleSpeedComparison.unavailableReason === 'own-mega-scarf' ? '내 메가폼은 메가스톤이 필요하여 스카프를 사용할 수 없습니다.' : singleSpeedComparison.unavailableReason === 'unburden-scarf' ? '곡예는 도구를 잃은 뒤 발동하므로 스카프를 지닌 상태와 함께 적용할 수 없습니다.' : singleSpeedComparison.unavailableReason === 'ability-unavailable' ? '이 폼에 없는 특성은 발동할 수 없습니다.' : '상대 메가폼은 메가스톤이 필요하여 스카프를 사용할 수 없습니다.')}</p> : singleSpeedComparison ? <div className="single-speed-verdict" role="status">
                 <strong>{singleSpeedComparison.verdict === 'faster' ? lt('내가 빠름') : singleSpeedComparison.verdict === 'equal' ? lt('동속') : lt('내가 느림')}</strong>
                 <span>{lt('내 스피드')} {singleSpeedComparison.currentSpeed} · {conciseSpeedLabels[siteLanguage].opponentSpeed} {singleSpeedComparison.targetSpeed}</span>
                 <span>{singleSpeedComparison.verdict === 'faster' ? `${lt('현재 투자로 이미 추월')} · ${lt('엄격히 추월할 최소 스피드 노력')} ${singleSpeedComparison.passEffort}/32 · ${lt('추가')} 0pt` : singleSpeedComparison.passEffort === null ? `${lt('현재 성격·도구로 추월 불가')} · ${lt('최대')} ${singleSpeedComparison.maxSpeed} (${lt('스피드 노력')} 32/32)` : `${lt('엄격히 추월할 최소 스피드 노력')} ${singleSpeedComparison.passEffort}/32 · ${lt('현재보다 추가')} ${singleSpeedComparison.additionalEffort}pt`}</span>
                 {singleSpeedComparison.tieEffort !== null ? <small>{lt('동속 최소 스피드 노력')} {singleSpeedComparison.tieEffort}/32 · {lt('동속은 추월이 아닙니다.')}</small> : null}
                </div> : null}
                </div>
                {!singleSpeedComparison?.unavailableReason && singleSpeedComparison ? <details className="speed-plane-details">
                <summary>{lt('스피드 비교 그래프 자세히 보기')}</summary>
                <div className="speed-plane-card">
                  <div className="speed-plane-header">
                    <strong>{lt('스피드 비교 그래프')}</strong>
                    <span>{lt('기준선')} = {displayName(myRow, siteLanguage)} · {lt('현재 스피드')} {singleSpeedComparison.currentSpeed}</span>
                  </div>
                  <div className="speed-plane-board">
                    <div className="speed-plane-axis-legend">
                      <span className="speed-plane-axis-chip upper">{singleSpeedNature === 'fast' ? lt('최속') : lt('준속')}</span>
                      <span className="speed-plane-axis-chip lower">{singleSpeedItem === 'scarf' ? lt('스카프') : lt('일반')}</span>
                    </div>
                    <div className="speed-plane-plot">
                      {speedAxisTicks.map((tick) => (
                        <div key={`speed-tick-${tick}`} className="speed-plane-tick" style={{ top: `${speedAxisTop(tick)}%` }}>
                          <span>{tick}</span>
                        </div>
                      ))}
                      <div className="speed-plane-baseline" style={{ top: `${speedAxisTop(singleSpeedComparison.currentSpeed!)}%` }} />
                      <div className="speed-plane-baseline-label" style={{ top: `${speedAxisTop(singleSpeedComparison.currentSpeed!)}%` }}>{lt('기준선')}</div>
                      {(singleSpeedComparison?.targetSpeed === null || singleSpeedComparison?.targetSpeed === undefined ? [] : [{ id: 'selected', scarf: singleSpeedItem === 'scarf', abilityLabel: singleSpeedAbilityActive ? singleSpeedAbility?.label : undefined, minScenario: { speedAtMax: singleSpeedComparison.targetSpeed }, maxScenario: { speedAtMax: singleSpeedComparison.targetSpeed } }]).map((band, idx) => {
                        const minScenario = band.minScenario!
                        const maxScenario = band.maxScenario!
                        const minTop = speedAxisTop(minScenario.speedAtMax)
                        const maxTop = speedAxisTop(maxScenario.speedAtMax)
                        const left = 50
                        const guideTop = Math.min(maxTop, speedAxisTop(singleSpeedComparison.currentSpeed!))
                        const guideBottom = Math.max(minTop, speedAxisTop(singleSpeedComparison.currentSpeed!))
                        const guideHeight = Math.max(0, guideBottom - guideTop)
                        const rangeClass = maxScenario.speedAtMax < singleSpeedComparison.currentSpeed! ? 'below' : minScenario.speedAtMax > singleSpeedComparison.currentSpeed! ? 'above' : 'cross'
                        const labelSideClass = speedBandLabelSideClass(idx, 1, left)
                        return (
                          <div key={`speed-band-${band.id}`} className="speed-plane-band-wrap" style={{ left: `${left}%` }}>
                            {rangeClass !== 'cross' && guideHeight > 0 ? <div className="speed-plane-guide" style={{ top: `${guideTop}%`, height: `${guideHeight}%` }} /> : null}
                            <div className={`speed-plane-range-node ${rangeClass} ${labelSideClass}`} style={{ top: `${maxTop}%`, height: `${Math.max(0.5, minTop - maxTop)}%` }}>
                              {band.scarf || band.abilityLabel ? <div className={`speed-plane-range-marker ${band.scarf ? 'item' : 'ability'}`}>
                                {band.scarf ? <img src={itemSpriteSrc('', '구애스카프')} alt={lt('스카프')} className="speed-band-item-icon" onError={(e) => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} /> : null}
                                {band.abilityLabel ? <>
                                  <span className="speed-plane-range-marker-burst" aria-hidden="true">✦</span>
                                  <span>{band.abilityLabel}</span>
                                </> : null}
                              </div> : null}
                              <div className="speed-plane-range-line" aria-hidden="true">
                                <i className="top-dot" />
                                <i className="bottom-dot" />
                              </div>
                              <div className="speed-plane-range-node-head">
                                <span>{singleSpeedNature === 'fast' ? lt('최속') : lt('준속')} · {singleSpeedItem === 'scarf' ? lt('스카프') : lt('일반')}</span>
                                <strong>{maxScenario.speedAtMax}</strong>
                              </div>

                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </details> : null}
            </div>
          </> : <div className="speed-empty-box">{lt('선택한 상대 없음')}</div>}
        </section> : null}

        {(mainSection === 'single' && activeTab === 'power') ? <section className="panel wide">
          <div className="row-between section-head">
            <h2>{lt('대미지 계산')}</h2>
          </div>
          <div className="damage-direction-switch" role="group" aria-label={lt('공수전환')}>
            <button
              type="button"
              className={!attackFromOpponent ? 'active' : ''}
              aria-pressed={!attackFromOpponent}
              onClick={() => setCalcSwapSides(false)}
            >
              <strong>{lt('내 포켓몬')}</strong>
              <span>→ {lt('상대 포켓몬')}</span>
            </button>
            <button
              type="button"
              className={attackFromOpponent ? 'active enemy' : ''}
              aria-pressed={attackFromOpponent}
              disabled={!oppRow}
              onClick={() => setCalcSwapSides(true)}
            >
              <strong>{lt('상대 포켓몬')}</strong>
              <span>→ {lt('내 포켓몬')}</span>
            </button>
          </div>
          <div className="speed-target-panel compare-target-panel damage-compare-panel">
            <div className={`speed-target-card damage-side-card ${!attackFromOpponent ? 'active-side' : ''}`}>
              <div className="speed-target-head">
                {myRow.sprite ? <img src={myRow.sprite} alt={displayName(myRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                <div>
                  <strong>{displayName(myRow, siteLanguage)}</strong>
                  <div className="pick-summary-badges">
                    <span className="pick-badge">{attackFromOpponent ? lt('방어측') : lt('공격측')}</span>
                  </div>
                  {myMegaCandidates.length ? <div className="calc-toggle-row">
                    <button type="button" className={`pick-chip ${!calcMyMegaKey ? 'active' : ''}`} onClick={() => setCalcMyMegaKey(null)}>{lt('일반')}</button>
                    {myMegaCandidates.map((megaKey) => <button key={`my-damage-mega-${megaKey}`} type="button" className={`pick-chip ${calcMyMegaKey === megaKey ? 'active' : ''}`} onClick={() => setCalcMyMegaKey(megaKey)}>{megaToggleLabel(megaKey, siteLanguage)}</button>)}
                  </div> : null}
                </div>
              </div>
              {!attackFromOpponent ? <div className="damage-side-moves damage-side-moves-player">
                {myMember.key ? learnsetStatusText(myMovePool, siteLanguage) ? <small className="quick-source-badge" role="status">{learnsetStatusText(myMovePool, siteLanguage)}</small> : null : null}
                {myMovePool?.status === 'load-error' ? <button type="button" onClick={() => window.location.reload()}>{siteLanguage === 'ko' ? '다시 시도 (새로고침)' : siteLanguage === 'ja' ? '再読込' : 'Reload to retry'}</button> : null}
                {myRegisteredDamageMoves.length ? myRegisteredDamageMoves.map((move) => {
                  const moveType = resolveMoveType(move, myMoveOptions, movePoolByKey)
                  const active = !attackFromOpponent && activeDamageMove === move
                  const preview = !attackFromOpponent ? damageMovePreviewByName.get(move) : null
                  return (
                    <button
                      key={`damage-move-my-${myMember.key}-${move}`}
                      type="button"
                      className={`move-chip core damage-move-chip ${moveTypeThemeClass(moveType)} ${active ? 'confirmed' : ''}`}
                      onClick={() => {
                        setCalcSwapSides(false)
                        setSelectedDamageMove({ key: myMember.key, move })
                      }}
                      {...bindTooltip(moveTooltipData(move, siteLanguage))}
                    >
                      <span className="damage-move-card-head">
                        {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                        <strong>{move}</strong>
                        {recordedLearnsetText(move, myMovePool, siteLanguage) ? <small role="status">{recordedLearnsetText(move, myMovePool, siteLanguage)}</small> : null}
                      </span>
                      {preview?.damage ? <span className="damage-move-card-result">
                        <strong>{isNoEffectDamage(preview.damage) ? lt('무효') : `${preview.damage.minPct}% ~ ${preview.damage.maxPct}%`}</strong>
                        <small>{isNoEffectDamage(preview.damage) ? '0' : `${preview.damage.min} ~ ${preview.damage.max}`} · {preview.verdict}</small>
                      </span> : <small className="damage-move-card-empty">{active ? lt('대미지 계산 불가') : '—'}</small>}
                    </button>
                  )
                }) : <div className="damage-side-empty">{lt('등록 기술 없음')}</div>}
              </div> : null}
            </div>
            <div className={`speed-target-card enemy damage-side-card ${attackFromOpponent ? 'active-side' : ''}`}>
              <div className="speed-target-head">
                {oppRow?.sprite ? <img src={oppRow.sprite} alt={displayName(oppRow, siteLanguage)} className="pick-slot-sprite" /> : null}
                <div>
                  <strong>{oppRow ? displayName(oppRow, siteLanguage) : lt('선택한 상대 없음')}</strong>
                  <div className="pick-summary-badges">
                    <span className="pick-badge enemy">{attackFromOpponent ? lt('공격측') : lt('방어측')}</span>
                  </div>
                  {oppMegaCandidates.length ? <div className="calc-toggle-row">
                    <button type="button" className={`pick-chip ${!calcOppMegaKey ? 'active' : ''}`} onClick={() => setCalcOppMegaKey(null)}>{lt('일반')}</button>
                    {oppMegaCandidates.map((megaKey) => <button key={`opp-damage-mega-${megaKey}`} type="button" className={`pick-chip ${calcOppMegaKey === megaKey ? 'active' : ''}`} onClick={() => setCalcOppMegaKey(megaKey)}>{megaToggleLabel(megaKey, siteLanguage)}</button>)}
                  </div> : null}
                </div>
              </div>
              {attackFromOpponent ? <div className="damage-side-moves damage-side-moves-opponent">
                {oppMember.key ? learnsetStatusText(oppMovePool, siteLanguage) ? <small className="quick-source-badge" role="status">{learnsetStatusText(oppMovePool, siteLanguage)}</small> : null : null}
                {oppMovePool?.status === 'load-error' ? <button type="button" onClick={() => window.location.reload()}>{siteLanguage === 'ko' ? '다시 시도 (새로고침)' : siteLanguage === 'ja' ? '再読込' : 'Reload to retry'}</button> : null}
                {opponentRegisteredDamageMoves.length ? opponentRegisteredDamageMoves.map((move) => {
                  const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                  const active = attackFromOpponent && activeDamageMove === move
                  const preview = attackFromOpponent ? damageMovePreviewByName.get(move) : null
                  return (
                    <div
                      key={`damage-move-opp-${oppMember.key}-${move}`}
                      className={`damage-move-chip-wrap ${active ? 'active' : ''}`}
                    >
                      <button
                        type="button"
                        className={`move-chip core damage-move-chip ${moveTypeThemeClass(moveType)} ${active ? 'confirmed' : ''}`}
                        onClick={() => {
                          if (!oppRow) return
                          setCalcSwapSides(true)
                          setSelectedDamageMove({ key: oppMember.key, move })
                        }}
                        disabled={!oppRow}
                        {...bindTooltip(moveTooltipData(move, siteLanguage))}
                      >
                        <span className="damage-move-card-head">
                          {moveType ? <SmallTypeBadgeImage type={moveType} /> : null}
                          <strong>{move}</strong>
                          {recordedLearnsetText(move, oppMovePool, siteLanguage) ? <small role="status">{recordedLearnsetText(move, oppMovePool, siteLanguage)}</small> : null}
                        </span>
                        {preview?.damage ? <span className="damage-move-card-result">
                          <strong>{isNoEffectDamage(preview.damage) ? lt('무효') : `${preview.damage.minPct}% ~ ${preview.damage.maxPct}%`}</strong>
                          <small>{isNoEffectDamage(preview.damage) ? '0' : `${preview.damage.min} ~ ${preview.damage.max}`} · {preview.verdict}</small>
                        </span> : <small className="damage-move-card-empty">{active ? lt('대미지 계산 불가') : '—'}</small>}
                      </button>
                      <button
                        type="button"
                        className="damage-move-remove-button"
                        onClick={() => removeOpponentRevealedMove(move)}
                        aria-label={`${move} remove`}
                      >
                        ×
                      </button>
                    </div>
                  )
                }) : <div className="damage-side-empty">{lt('등록 기술 없음')}</div>}
                <div className="damage-opponent-move-adder">
                  <div className="damage-opponent-move-meta">
                    <strong>{lt('공개 기술')}</strong>
                    <span>{opponentRegisteredDamageMoves.length} / 4</span>
                  </div>
                  {oppMember.key && oppTopSuggestedMoves.length ? <details className="damage-top-move-strip">
                    <summary className="damage-top-move-strip-summary">
                      <span className="damage-top-move-strip-summary-copy">
                        <strong>{lt('사용률 상위 기술')}</strong>
                        <span className="muted-inline">Top {Math.min(10, oppTopSuggestedMoves.length)}</span>
                      </span>
                      <span className="damage-top-move-strip-summary-status muted-inline">{lt('현재')} {opponentRegisteredDamageMoves.length} / 4</span>
                    </summary>
                    <div className="move-chip-wrap damage-top-move-strip-chips">
                      {oppTopSuggestedMoves.map((move) => {
                        const moveType = resolveMoveType(move, oppMoveOptions, movePoolByKey)
                        const locked = opponentRegisteredDamageMoves.includes(move)
                        const eligible = Boolean(resolveEligibleMoveInput(move, oppMovePool))
                        const reason = lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')
                        return <button key={`damage-top-opp-${oppMember.key}-${move}`} type="button" className={`move-chip core ${locked ? 'confirmed quiet-confirmed' : ''} ${moveTypeThemeClass(moveType)}`} onClick={() => addOpponentRevealedMove(move)} disabled={locked || opponentRegisteredDamageMoves.length >= 4 || !eligible} title={!eligible ? reason : undefined} aria-label={!eligible ? `${move} — ${reason}` : move} {...bindTooltip(moveTooltipData(move, siteLanguage))}>{move}</button>
                      })}
                    </div>
                  </details> : null}
                  {opponentMoveNotice?.key === oppMember.key && opponentMoveNotice.index === selectedOpp ? <small role="status">{lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')}</small> : null}
                  <div className="damage-opponent-move-entry">
                    <span id="calc-opp-move-label">{lt('상대 기술 추가')}</span>
                    <div className="damage-opponent-move-input-row">
                      <SearchCombobox id={`calc-opp-move-${selectedOpp}`} value={calcOpponentMoveDraft} onChange={setCalcOpponentMoveDraft}
                        options={revealedMoveCandidates(calcOpponentMoveDraft).map(option => ({ key: option.name, label: option.name }))}
                        onSelect={option => { if (addOpponentRevealedMove(option.key)) setCalcOpponentMoveDraft('') }}
                        optionClassName={option => `move-autocomplete-item ${moveTypeThemeClass(oppMoveOptions.find(move => move.name === option.key)?.type)}`}
                        renderOption={option => <MoveCandidateRow name={option.label} type={oppMoveOptions.find(move => move.name === option.key)?.type} meta={resolveMoveMeta(option.key, oppMoveOptions, movePoolByKey)} labels={moveSlotLabels} />}
                        optionProps={option => bindTooltip(moveTooltipData(option.key, siteLanguage))}
                        menuClassName="move-autocomplete-menu damage-opponent-move-menu"
                        inputProps={{ 'aria-labelledby': 'calc-opp-move-label', placeholder: lt('사용 가능 기술 검색'), disabled: !oppMember.key || oppMember.revealedMoves.length >= 4 || oppMovePool?.status !== 'ready-verified' }} />
                      <button type="button" className="pick-chip" onMouseDown={e => e.preventDefault()}
                        onClick={() => commitCalcOpponentMoveDraft()}
                        disabled={!revealedMoveCandidates(calcOpponentMoveDraft).length}>{lt('추가')}</button>
                    </div>
                  </div>
                </div>
              </div> : null}
            </div>
          </div>
          <div className="damage-surface-card damage-control-surface separated">
            {singleItemError && <p role="alert" className="item-validation-error">{singleItemError}</p>}
            {activeDamageMoveMeta?.variablePower && !activeDamageMoveHitOptions?.length ? <div className="pick-summary-badges damage-auto-badges">
              <span className="pick-badge warn">{variablePowerHint(activeDamageMove, lt, { targetWeightKnown: typeof calcTargetWeightKg === 'number', resolvedPower: activeDamageMovePower, totalPower: activeDamageMoveHitSummary?.totalPower ?? null })}</span>
            </div> : null}
            {activeDamageMove ? <details className="damage-fact-panel damage-fact-details">
              <summary className="damage-fact-summary">
                <span className="damage-fact-summary-title">
                  <small>{lt('현재 기술 기준')}</small>
                  <strong>{activeDamageMove}</strong>
                </span>
                <span className="damage-fact-summary-meta">
                  {activeDamageMoveType ? displayTypeName(activeDamageMoveType, siteLanguage) : '—'}
                  {' · '}{activeDamageMoveCategory ? lt(activeDamageMoveCategory === 'physical' ? '물리' : '특수') : '—'}
                  {' · '}{lt('위력')} {activeDamageMovePower ?? '—'}
                </span>
              </summary>
              <div className="damage-fact-detail-body" aria-label={lt('현재 기준 정보')}>
                <dl className="damage-fact-grid">
                  <div><dt>{lt('타입')}</dt><dd>{activeDamageMoveType ? displayTypeName(activeDamageMoveType, siteLanguage) : '—'}</dd></div>
                  <div><dt>{lt('분류')}</dt><dd>{activeDamageMoveCategory ? lt(activeDamageMoveCategory === 'physical' ? '물리' : '특수') : '—'}</dd></div>
                  <div><dt>{lt('위력')}</dt><dd>{activeDamageMovePower ?? '—'}</dd></div>
                  <div><dt>{lt('특성')}</dt><dd>{selectedAttackAbility?.label ?? abilityNoteLabel(attackerAbilitySlug) ?? '—'}</dd></div>
                  <div><dt>{lt('자속')}</dt><dd>{activeDamageMoveType ? autoStab : '—'}</dd></div>
                  <div><dt>{lt('상성')}</dt><dd>{activeDamageMoveType && damageModifiers ? `${damageModifiers.effectiveness}x` : '—'}</dd></div>
                </dl>
                {damageModifiers?.notes.length ? <div className="damage-applied-modifiers" aria-label={lt('적용 조건')}>
                  {damageModifiers.notes.map((note) => <span key={`damage-modifier-${note}`}>{note}</span>)}
                </div> : null}
              </div>
            </details> : <div className="damage-data-empty">{lt('계산할 기술을 선택해 주세요.')}</div>}
            {activeDamageMoveMeta ? <div className="damage-control-groups">
              <div className="damage-control-group damage-offense-control-group">
                <div className="damage-control-group-title">{lt('화력 조건')}</div>
                <div className="damage-quick-control-row">
                  <label>
                    <span>{lt('공격측 화력 랭크')}</span>
                    <select value={calcAttackStage} onChange={(e) => setCalcAttackStage(clampBattleStage(e.target.value))}>
                      {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`atk-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                    </select>
                  </label>
                  {activeDamageMoveAlwaysCrit ? <span className="damage-quick-status">{lt('급소')}</span> : <label className="damage-quick-toggle">
                    <input type="checkbox" checked={calcCritical} onChange={(e) => setCalcCritical(e.target.checked)} />
                    <span>{lt('급소')}</span>
                  </label>}
                  {activeDamageMoveCategory === 'physical' ? <label className="damage-quick-toggle">
                    <input type="checkbox" checked={calcBurned} onChange={(e) => setCalcBurned(e.target.checked)} />
                    <span>{lt('화상')}</span>
                  </label> : null}
                </div>
                {hasContextualOffenseControls ? <div className="calc-grid damage-calc-grid compact offense-grid damage-contextual-offense-grid">
                  {activeDamageMoveHitOptions?.length ? <label>
                    {lt('타수')}
                    <select value={activeDamageMoveHitCount ?? activeDamageMoveHitOptions[0]} onChange={(e) => setCalcHitCount(Math.max(1, Math.trunc(Number(e.target.value))))} disabled={activeDamageMoveHitOptions.length === 1}>
                      {activeDamageMoveHitOptions.map((hit) => <option key={`hit-${hit}`} value={hit}>{`${hit} ${lt('타수')}`}</option>)}
                    </select>
                    {activeDamageMoveHitSummary ? <small>{lt('총위력')} {activeDamageMoveHitSummary.totalPower}</small> : null}
                  </label> : activeDamageMoveRule ? <label>
                    {lt('위력 조건')}
                    {activeDamageMoveRule.kind === 'count'
                      ? <>
                          <span>{lt(activeDamageMoveRule.label)}</span>
                          <input type="number" min={activeDamageMoveRule.min ?? 0} max={activeDamageMoveRule.max ?? 999} value={Number(activeDamageMoveConditionValue ?? activeDamageMoveRule.defaultValue)} onChange={(e) => setActiveDamageMoveConditionValue(Number(e.target.value))} />
                        </>
                      : <span className="calc-toggle-box"><input type="checkbox" checked={Boolean(activeDamageMoveConditionValue)} onChange={(e) => setActiveDamageMoveConditionValue(e.target.checked)} /><span>{lt(activeDamageMoveRule.label)}</span></span>}
                    <small>{lt('위력')} {activeDamageMovePower ?? '-'}</small>
                  </label> : null}
                  {usesTypeChangeStabAbility ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcTypeChangeStab} onChange={(e) => setCalcTypeChangeStab(e.target.checked)} />
                    <span>{lt('타입변환 자속')} {autoStab}</span>
                  </label> : null}
                  {attackFromOpponent ? <>
                    <label>
                      {lt('상대 화력 프리셋')}
                      <select value={calcOpponentOffensePreset} onChange={(e) => applyOpponentOffensePresetSelection(e.target.value as OpponentOffensePreset)}>
                        {Object.entries(OPPONENT_OFFENSE_PRESETS).map(([key, preset]) => <option key={`opp-offense-preset-${key}`} value={key}>{preset.label}</option>)}
                        <option value="custom">{lt('직접 조절')}</option>
                      </select>
                    </label>
                    {calcOpponentOffensePreset === 'custom' ? <><div className="calc-inline-pair calc-stat-pair">
                      <label>
                        {lt('상대 공격')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentAttackEv} onChange={(e) => updateOpponentOffenseState({ attackEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      <label className="calc-toggle-box calc-toggle-box-compact">
                        <input type="checkbox" checked={calcOpponentAttackNature > 1} onChange={(e) => updateOpponentOffenseState({ attackNature: e.target.checked ? 1.1 : 1 })} />
                        <span>{lt('+공격 성격')}</span>
                      </label>
                    </div>
                    <div className="calc-inline-pair calc-stat-pair">
                      <label>
                        {lt('상대 특수공격')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentSpAttackEv} onChange={(e) => updateOpponentOffenseState({ spAttackEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      <label className="calc-toggle-box calc-toggle-box-compact">
                        <input type="checkbox" checked={calcOpponentSpAttackNature > 1} onChange={(e) => updateOpponentOffenseState({ spAttackNature: e.target.checked ? 1.1 : 1 })} />
                        <span>{lt('+특수공격 성격')}</span>
                      </label>
                    </div></> : null}
                  </> : null}
                  {showAttackerLowHpToggle || showTargetPoisonedToggle ? <div className="calc-inline-pair">
                    {showAttackerLowHpToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcAttackerLowHp} onChange={(e) => setCalcAttackerLowHp(e.target.checked)} />
                      <span>{lt('공격측 HP 1/3 이하')}</span>
                    </label> : null}
                    {showTargetPoisonedToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcTargetPoisoned} onChange={(e) => setCalcTargetPoisoned(e.target.checked)} />
                      <span>{lt('상대 독/맹독')}</span>
                    </label> : null}
                  </div> : null}
                  {showMovedAfterTargetToggle || showDefenderStatusedToggle ? <div className="calc-inline-pair">
                    {showMovedAfterTargetToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcMovedAfterTarget} onChange={(e) => setCalcMovedAfterTarget(e.target.checked)} />
                      <span>{lt('상대보다 늦게 행동')}</span>
                    </label> : null}
                    {showDefenderStatusedToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcDefenderStatused} onChange={(e) => setCalcDefenderStatused(e.target.checked)} />
                      <span>{lt('상대 상태이상')}</span>
                    </label> : null}
                  </div> : null}
                  {showFaintedAlliesInput || showRivalryModeInput ? <div className="calc-inline-pair">
                    {showFaintedAlliesInput ? <label>
                      {lt('기절한 아군 수')}
                      <input type="number" min={0} max={5} value={calcFaintedAllies} onChange={(e) => setCalcFaintedAllies(Math.max(0, Math.min(5, Math.trunc(Number(e.target.value) || 0))))} />
                    </label> : null}
                    {showRivalryModeInput ? <label>
                      {lt('라이벌리 성별 관계')}
                      <select value={calcRivalryMode} onChange={(e) => setCalcRivalryMode(e.target.value as RivalryMode)}>
                        <option value="neutral">{lt('없음')}</option>
                        <option value="same">{lt('같은 성별')}</option>
                        <option value="opposite">{lt('다른 성별')}</option>
                      </select>
                    </label> : null}
                  </div> : null}
                  {showParentalBondToggle || showElectromorphosisToggle ? <div className="calc-inline-pair">
                    {showParentalBondToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcParentalBond} onChange={(e) => setCalcParentalBond(e.target.checked)} />
                      <span>{lt('부자유친 발동')}</span>
                    </label> : null}
                    {showElectromorphosisToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcElectromorphosisCharged} onChange={(e) => setCalcElectromorphosisCharged(e.target.checked)} />
                      <span>{lt('일렉트릭 차지됨')}</span>
                    </label> : null}
                  </div> : null}
                </div> : null}
              </div>
              <button
                type="button"
                className={`damage-advanced-toggle ${calcFieldConditionsCollapsed ? '' : 'active'}`}
                onClick={() => setCalcFieldConditionsCollapsed((prev) => !prev)}
                aria-expanded={!calcFieldConditionsCollapsed}
              >
                <span>
                  <strong>{lt('세부 조건')}</strong>
                  <small>{activeFieldConditionLabels.length ? activeFieldConditionLabels.join(' · ') : lt('상대 내구')} · {calcDefenseStage > 0 ? `+${calcDefenseStage}` : calcDefenseStage}</small>
                </span>
                <b>{calcFieldConditionsCollapsed ? '＋' : '－'}</b>
              </button>
              {!calcFieldConditionsCollapsed ? <>
              <div className="damage-control-group">
                <div className="damage-control-group-title">{lt('방어측')}</div>
                <div className="calc-grid damage-calc-grid compact defender-grid">
                  {attackFromOpponent ? <div className="calc-lock-box">{lt('방어측은 내 파티 실수치를 사용함')}</div> : <>
                    <div className="calc-inline-pair">
                      <label>
                        {lt('상대 내구 프리셋')}
                        <select value={calcOpponentBulkPreset} onChange={(e) => applyOpponentBulkPresetSelection(e.target.value as OpponentBulkPreset)}>
                          {Object.entries(OPPONENT_BULK_PRESETS).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
                          <option value="custom">{lt('직접 조절')}</option>
                        </select>
                      </label>
                      <label>
                        {lt('방어측 내구 랭크')}
                        <select value={calcDefenseStage} onChange={(e) => setCalcDefenseStage(clampBattleStage(e.target.value))}>
                          {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((stage) => <option key={`def-stage-${stage}`} value={stage}>{stage > 0 ? `+${stage}` : stage}</option>)}
                        </select>
                      </label>
                    </div>
                    {calcOpponentBulkPreset === 'custom' ? <><div className="calc-inline-pair">
                      <label>
                        {lt('상대 체력')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentHpEv} onChange={(e) => updateOpponentBulkState({ hpEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      {showDefenderFullHpToggle ? <label className="calc-toggle-box">
                        <input type="checkbox" checked={calcDefenderFullHp} onChange={(e) => setCalcDefenderFullHp(e.target.checked)} />
                        <span>{lt('상대 HP 100%')}</span>
                      </label> : null}
                    </div>
                    <div className="calc-inline-pair calc-stat-pair">
                      <label>
                        {lt('상대 방어')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentDefenseEv} onChange={(e) => updateOpponentBulkState({ defenseEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      <label className="calc-toggle-box calc-toggle-box-compact">
                        <input type="checkbox" checked={calcOpponentDefenseNature > 1} onChange={(e) => updateOpponentBulkState({ defenseNature: e.target.checked ? 1.1 : 1 })} />
                        <span>{lt('+방어 성격')}</span>
                      </label>
                    </div>
                    <div className="calc-inline-pair calc-stat-pair">
                      <label>
                        {lt('상대 특수방어')}
                        <input type="number" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} value={calcOpponentSpDefenseEv} onChange={(e) => updateOpponentBulkState({ spDefenseEv: clampEv(e.target.value, CHAMPIONS_EFFORT_PER_STAT_CAP) })} />
                      </label>
                      <label className="calc-toggle-box calc-toggle-box-compact">
                        <input type="checkbox" checked={calcOpponentSpDefenseNature > 1} onChange={(e) => updateOpponentBulkState({ spDefenseNature: e.target.checked ? 1.1 : 1 })} />
                        <span>{lt('+특수방어 성격')}</span>
                      </label>
                    </div></> : showDefenderFullHpToggle ? <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcDefenderFullHp} onChange={(e) => setCalcDefenderFullHp(e.target.checked)} />
                      <span>{lt('상대 HP 100%')}</span>
                    </label> : null}
                  </>}
                  {showDefenderDisguiseToggle ? <label className="calc-toggle-box">
                    <input type="checkbox" checked={calcDefenderDisguise} onChange={(e) => setCalcDefenderDisguise(e.target.checked)} />
                    <span>{lt('상대 탈 intact')}</span>
                  </label> : null}
                </div>
              </div>
              <div className="damage-control-group damage-control-group-secondary">
                <div className="damage-control-group-title">{lt('전장 조건')}</div>
                <div className="calc-grid damage-calc-grid compact field-grid">
                  <div className="calc-inline-pair">
                    <label>
                      {lt('날씨')}
                      <select value={calcWeather} onChange={(e) => setCalcWeather(e.target.value as DamageWeather)}>
                        <option value="none">{lt('없음')}</option>
                        <option value="sun">{lt('쾌청')}</option>
                        <option value="rain">{lt('비')}</option>
                        <option value="sand">{lt('모래바람')}</option>
                        <option value="snow">{lt('싸라기눈')}</option>
                      </select>
                    </label>
                    <label>
                      {lt('필드')}
                      <select value={calcTerrain} onChange={(e) => setCalcTerrain(e.target.value as DamageTerrain)}>
                        <option value="none">{lt('없음')}</option>
                        <option value="electric">{lt('일렉트릭필드')}</option>
                        <option value="grassy">{lt('그래스필드')}</option>
                        <option value="psychic">{lt('사이코필드')}</option>
                        <option value="misty">{lt('미스트필드')}</option>
                      </select>
                    </label>
                  </div>
                  <div className="calc-inline-pair">
                    <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcReflect} onChange={(e) => setCalcReflect(e.target.checked)} />
                      <span>{lt('리플렉터')}</span>
                    </label>
                    <label className="calc-toggle-box">
                      <input type="checkbox" checked={calcLightScreen} onChange={(e) => setCalcLightScreen(e.target.checked)} />
                      <span>{lt('빛의장막')}</span>
                    </label>
                  </div>
                  <label className="calc-toggle-box span-2">
                    <input type="checkbox" checked={calcAuroraVeil} onChange={(e) => setCalcAuroraVeil(e.target.checked)} />
                    <span>{lt('오로라베일')}</span>
                  </label>
                </div>
              </div>
              </> : null}
            </div> : null}
          </div>
        </section> : null}
        </>}
        {hoverTooltip ? <div className={`floating-hover-tooltip ${tooltipPlacement} ${hoverTooltip.kind === 'item' ? 'item-tooltip' : ''}`} style={{ left: tooltipLeft, top: tooltipTop }} aria-hidden="true">
          <div className="floating-hover-tooltip-head">
            <div>
              <strong>{hoverTooltip.title}</strong>
              {hoverTooltip.subtitle ? <p>{hoverTooltip.subtitle}</p> : null}
            </div>
            {hoverTooltip.accentType ? <span className="floating-hover-tooltip-type"><TypeBadgeImage type={hoverTooltip.accentType} /></span> : null}
          </div>
          {hoverTooltip.rows.length ? <div className={`floating-hover-tooltip-body ${hoverTooltip.kind === 'item' ? 'item-tooltip-effect-body' : ''}`}>
            {hoverTooltip.rows.map((row) => <div key={`tooltip-row-${hoverTooltip.kind}-${row.label}`} className="floating-hover-tooltip-row">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>)}
          </div> : null}
          {hoverTooltip.description ? <div className="floating-hover-tooltip-description">
            <span>{hoverTooltip.kind === 'item' ? lt('설명') : lt('효과')}</span>
            <p>{hoverTooltip.description}</p>
          </div> : null}
          {hoverTooltip.chips?.length ? <div className="floating-hover-tooltip-chips">
            {hoverTooltip.chips.map((chip) => <span key={`tooltip-chip-${hoverTooltip.kind}-${chip}`} className="floating-hover-tooltip-chip">{chip}</span>)}
          </div> : null}
        </div> : null}
      </main>
    </div>
  )
}
