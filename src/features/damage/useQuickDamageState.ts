import { calculateQuickDamage } from './calculateQuickDamage'
import { prepareQuickDamageInput, toStats } from './prepareQuickDamageInput'
import { readQuickStandalone, writeQuickStandalone } from '../../adapters/persistence/quickDamage'
import { filterSpeciesOptions } from '../../shared/search/speciesOptions'
import { MovePoolState, SharedPoolState, learnsetStatusText, recordedLearnsetText, quickKoVerdict, quickKoLabels, conciseSpeedLabels } from './quickPresentation.ts'
import { QuickBattle, QuickSide, QuickConditions, quickBlank, quickDefaultConditions, quickSide, restoredComparisonSide, quickMagicProjection, quickStat } from './quickModel.ts'
import { applyChampionsEffort } from '../../domain/champions/effortProjection'
import { heldAbilityError, selectedAbilityDisplayName } from '../../shared/display/abilityPresentation.ts'
import { resolveMoveMeta, filterMoveOptions } from '../../adapters/catalog/movePresentation.ts'
import { megaStoneForKey, isAllowedChampionsItem, heldItemError, itemSpriteSrc, displayItemLabel, filterItemOptions, itemAutocompleteSecondaryLabel, itemAutocompletePrimaryLabel } from '../../shared/display/itemPresentation.ts'
import { statThemeClass, moveTypeThemeClass, natureLabel, displayMoveCategoryName, displayName, searchDisplayLabel } from '../../shared/display/formatters.ts'
import { rows, indexByKey } from '../../adapters/catalog/roster.ts'
import { translateText } from '../../shared/display/translation.ts'
import { abilityAdjustedTypeEffectiveness } from '../../domain/battle/typeEffectiveness.ts'
import { resolveDamageModifiers } from '../../domain/battle/modifierRules.ts'
import { isChoiceScarfItem } from '../../domain/battle/statProjection.ts'
import { CONDITIONAL_MOVE_POWER_RULES, applyTargetWeightMovePower, multiHitOptions, resolveMultiHitMeta } from '../../domain/battle/movePower.ts'
import { resolveAbilityAdjustedMoveMeta, resolveAbilityAdjustedTypes, resolveStabMultiplier, deriveAutoWeatherFromAbilities, deriveAutoTerrainFromAbilities } from '../../domain/battle/moveEffects.ts'
import React from 'react'
import { CHAMPIONS_ITEM_OPTIONS } from '../../domain/champions/championsItems'
import { classifyHeldItem, requiredMegaStone, isCalculableHeldItem } from '../../domain/champions/itemIdentity'
import { UiIcon } from '../../shared/display/UiIcon'
import { DamageRangeMeter } from '../../shared/display/DamageRangeMeter'
import { quickItem, quickStatNature, quickMoveSupported, readQuickSaved, replaceQuickMove, quickStagePair } from '../../domain/battle/quickDamageState'
import { type ComparisonSeed } from '../../domain/party/unifiedComparisonAdapter'
import { readDraft, writeDraft, forgetDraft } from '../../adapters/persistence/comparisonDraftState'
import { natureMultiplier } from '../../domain/champions/buildRules'
import { NATURES } from '../../domain/champions/natures'
import { soleAbilityForSelectedSpecies } from '../../domain/party/singleOpponentRegistration'
import { pairTarget, resetPairAssumptions } from '../../domain/party/comparisonPairState'
import { effectiveComparisonSpeed } from '../../domain/battle/unifiedComparisonSpeed'
import { compareSpeedVisual } from '../../domain/battle/speedVisual'
import { EffortTuningModal } from '../../shared/display/EffortTuningModal'
import { actualStat } from '../../domain/champions/statMechanics'
import { STAT_PRESENTATION as EFFORT_STAT_OPTIONS } from '../../shared/display/statPresentation'
import { getSpeedAbility, speedActivationAllowed } from '../../domain/battle/speed/speedAbilities'
import { PokemonCardHeading, PokemonStatGrid, MoveSlotsEditor, MoveCandidateRow } from '../../shared/display/PokemonCardOverview'
import PokemonSearchField from '../../shared/search/PokemonSearchField'
import { loadFormLearnset, choicesForPool, moveInPool, LEARNSET_SOURCE } from '../../domain/champions/sharedLearnsets'
import { getMoveMetadata } from '../../domain/champions/moveMetadata'
import { PokemonBuildFields } from '../../shared/display/PokemonBuildFields'
import { applySpeedModifiers, applySpeedStage } from '../../domain/battle/speed/speedModifiers'
import { localizedAbilityLabel, resolveFormAbility } from '../../domain/champions/abilityIdentity'
import { calcDamage, type BattleStatBlock } from '../../domain/battle/damageCore'
import { DamageTerrain, DamageWeather, MoveCategory, MoveOption, NatureId, Row, SiteLanguage } from '../../app/types'
import { abilityDescriptionFor, loadMoveMetaByName, moveDescriptionFor } from '../../adapters/catalog/data'
import type { QuickDamageProps } from './QuickDamagePanel'
export function useQuickDamageState({ language, tooltipForMove, initialSides, comparisonSlots, comparisonMode = false, entrySelectors, onSaveEntry, onDraftIdentity, onOpponentSpecies, onResetOpponents, opponentResetRevision = 0, movesForSpecies, sharedMoveSpecies }: QuickDamageProps) {
const lt = (text: string) => translateText(language, text)

  const [saved] = React.useState(() => readQuickStandalone(localStorage))
  const [attacker, setAttacker] = React.useState(() => {
    const seed = initialSides?.[0]
    const side = seed ? restoredComparisonSide(seed, 'attacker', comparisonSlots?.[0] ?? 0).side : quickSide(saved.attacker, saved.conditions as Record<string, unknown> ?? {}, true)
    if (!comparisonMode && typeof saved.move === 'string' && !(saved.attacker && typeof saved.attacker === 'object' && 'moves' in saved.attacker)) side.moves[0] = saved.move
    return side
  })
  const [defender, setDefender] = React.useState(() => initialSides?.[1] ? restoredComparisonSide(initialSides[1], 'defender', comparisonSlots?.[1] ?? 0).side : quickSide(saved.defender, saved.conditions as Record<string, unknown> ?? {}))
  const [configuredConditions, setConditions] = React.useState<QuickConditions>(() => {
    const input = !comparisonMode && saved.conditions && typeof saved.conditions === 'object' ? saved.conditions as Record<string, unknown> : {}
    const defaults = quickDefaultConditions()
    return { ...defaults, weather: ['none','sun','rain','sand','snow'].includes(String(input.weather)) ? input.weather as DamageWeather : 'none', terrain: ['none','electric','grassy','psychic','misty'].includes(String(input.terrain)) ? input.terrain as DamageTerrain : 'none', hits: [1,2,3,4,5].includes(Number(input.hits)) ? Number(input.hits) : 2, critical: input.critical === true, typeChangeStab: input.typeChangeStab !== false }
  })
  // The two cards own the field projection; persisted/manual conditions remain separate.
  const [manualFields, setManualFields] = React.useState(() => {
    const previous = !comparisonMode && saved.manualFields && typeof saved.manualFields === 'object' ? saved.manualFields as Record<string, unknown> : null
    return { weather: previous ? previous.weather === true : configuredConditions.weather !== 'none', terrain: previous ? previous.terrain === true : configuredConditions.terrain !== 'none' }
  })
  const ownAbility = resolveFormAbility(indexByKey.get(attacker.key), attacker.ability, abilityDescriptionFor, rows).slug ?? ''
  const opposingAbility = resolveFormAbility(indexByKey.get(defender.key), defender.ability, abilityDescriptionFor, rows).slug ?? ''
  const conditions: QuickConditions = { ...configuredConditions,
    weather: manualFields.weather ? configuredConditions.weather : deriveAutoWeatherFromAbilities(ownAbility, opposingAbility),
    terrain: manualFields.terrain ? configuredConditions.terrain : deriveAutoTerrainFromAbilities(ownAbility, opposingAbility) }
  const [attackerSearch, setAttackerSearch] = React.useState('')
  const [defenderSearch, setDefenderSearch] = React.useState('')
  const [pools, setPools] = React.useState<Record<string, SharedPoolState>>({})
  const [activeSlot, setActiveSlot] = React.useState<{ side: 'attacker' | 'defender'; index: number } | null>(null)
  const [drafts, setDrafts] = React.useState<Record<string, string>>({})
  const [selected, setSelected] = React.useState<{ side: 'attacker' | 'defender'; index: number }>(() => {
    const own = initialSides?.[0].moves.findIndex(Boolean) ?? -1
    const opp = initialSides?.[1].moves.findIndex(Boolean) ?? -1
    return own >= 0 ? { side: 'attacker', index: own } : opp >= 0 ? { side: 'defender', index: opp } : { side: 'attacker', index: 0 }
  })
  const [modalSide, setModalSide] = React.useState<'attacker' | 'defender' | null>(null)
  const [modalKey, setModalKey] = React.useState('')
  const [dirty, setDirty] = React.useState<Record<'attacker' | 'defender', ReadonlySet<string>>>(() => ({ attacker: initialSides ? restoredComparisonSide(initialSides[0], 'attacker', comparisonSlots?.[0] ?? 0).dirty : new Set(), defender: initialSides ? restoredComparisonSide(initialSides[1], 'defender', comparisonSlots?.[1] ?? 0).dirty : new Set() }))
  const [draftStorageFailed, setDraftStorageFailed] = React.useState(false)
  const markDirty = (side: 'attacker' | 'defender', field: string) => setDirty(prev => ({ ...prev, [side]: new Set([...prev[side], field]) }))
  // A saved seed or slot change belongs to one card; never remount both cards.
  const seedFingerprint = initialSides?.map((seed, index) => `${comparisonSlots?.[index] ?? 0}:${JSON.stringify(seed)}`) as [string, string] | undefined
  const seed0 = seedFingerprint?.[0], seed1 = seedFingerprint?.[1]
  const previousSeeds = React.useRef<[string | undefined, string | undefined]>([seed0, seed1])
  const previousTargets = React.useRef<[string, string]>([pairTarget(comparisonSlots?.[0] ?? 0, attacker), pairTarget(comparisonSlots?.[1] ?? 0, defender)])
  const skipDraftWrite = React.useRef(false)
  const clearSideUI = (side: 'attacker' | 'defender') => {
    setDrafts(prev => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${side}-`))))
    setActiveSlot(prev => prev?.side === side ? null : prev)
    setModalSide(prev => prev === side ? null : prev)
  }
  React.useEffect(() => {
    if (!comparisonMode || !initialSides) return
    const changed = (['attacker', 'defender'] as const).map((side, index) => previousSeeds.current[index] === (index === 0 ? seed0 : seed1) ? null : restoredComparisonSide(initialSides[index], side, comparisonSlots?.[index] ?? 0))
    const targets = (['attacker', 'defender'] as const).map((side, index) => pairTarget(comparisonSlots?.[index] ?? 0, changed[index]?.side ?? (side === 'attacker' ? attacker : defender))) as [string, string]
    const pairChanged = targets.some((target, index) => target !== previousTargets.current[index])
    if (pairChanged) {
      setConditions(quickDefaultConditions())
      setManualFields({ weather: false, terrain: false })
      setModalSide(null)
      setAttacker(prev => resetPairAssumptions(prev, initialSides[0], dirty.attacker))
      setDefender(prev => resetPairAssumptions(prev, initialSides[1], dirty.defender))
    }
    previousTargets.current = targets
    for (const [index, side] of (['attacker', 'defender'] as const).entries()) {
      const fingerprint = index === 0 ? seed0 : seed1
      if (previousSeeds.current[index] === fingerprint) continue
      skipDraftWrite.current = true
      previousSeeds.current[index] = fingerprint
      const restored = changed[index]!
      const next = pairChanged ? resetPairAssumptions(restored.side as QuickSide, initialSides[index], restored.dirty) : restored.side
      if (side === 'attacker') setAttacker(next as QuickSide); else setDefender(next as QuickSide)
      setDirty(prev => ({ ...prev, [side]: restored.dirty }))
      onDraftIdentity?.(side, restored.dirty.has('key') ? next.key : '')
      if (side === 'attacker') setAttackerSearch(''); else setDefenderSearch('')
      clearSideUI(side)
      setSelected(prev => prev.side === side ? { side, index: Math.max(0, initialSides[index].moves.findIndex(Boolean)) } : prev)
    }
  }, [comparisonMode, seed0, seed1])
  React.useEffect(() => {
    if (!comparisonMode || !initialSides) return
    for (const [index, side] of (['attacker', 'defender'] as const).entries()) {
      const restored = restoredComparisonSide(initialSides[index], side, comparisonSlots?.[index] ?? 0)
      if (restored.dirty.has('key')) onDraftIdentity?.(side, restored.side.key)
    }
  }, [])

  React.useEffect(() => {
    if (!comparisonMode || !initialSides || !opponentResetRevision) return
    skipDraftWrite.current = true
    setAttacker(prev => resetPairAssumptions(prev, initialSides[0], dirty.attacker))
    setDefender(resetPairAssumptions(initialSides[1] as QuickSide, initialSides[1], new Set()))
    setDirty(prev => ({ ...prev, defender: new Set() }))
    setDefenderSearch('')
    setModalSide(null)
    clearSideUI('defender')
    setConditions(quickDefaultConditions())
    setManualFields({ weather: false, terrain: false })
    previousTargets.current = [pairTarget(comparisonSlots?.[0] ?? 0, initialSides[0]), pairTarget(comparisonSlots?.[1] ?? 0, initialSides[1])]
    setSelected(prev => prev.side === 'defender' ? { side: 'attacker', index: 0 } : prev)
  }, [opponentResetRevision])

  const opener = React.useRef<HTMLElement | null>(null)
  const [, refreshMeta] = React.useState(0)
  const [moveMetaReady, setMoveMetaReady] = React.useState(false)
  React.useEffect(() => { if (!comparisonMode) writeQuickStandalone(localStorage, { attacker, defender, conditions: configuredConditions, manualFields }) }, [attacker, defender, configuredConditions, manualFields, comparisonMode])
  React.useEffect(() => {
    if (!comparisonMode || !initialSides || !comparisonSlots) return
    if (skipDraftWrite.current) { skipDraftWrite.current = false; return }
    const legacyOwnSpeciesDraft = readDraft(localStorage, 'attacker', comparisonSlots[0], initialSides[0])?.dirty.has('key')
    const ownKept = legacyOwnSpeciesDraft && !dirty.attacker.size ? true : writeDraft(localStorage, 'attacker', comparisonSlots[0], initialSides[0], attacker, dirty.attacker)
    const otherKept = writeDraft(localStorage, 'defender', comparisonSlots[1], initialSides[1], defender, dirty.defender)
    setDraftStorageFailed(!(ownKept && otherKept))
  }, [comparisonMode, seed0, seed1, attacker, defender, dirty])
  const poolMounted = React.useRef(false)
  React.useEffect(() => {
    poolMounted.current = true
    return () => { poolMounted.current = false }
  }, [])
  React.useEffect(() => {
    for (const key of new Set([attacker.key, defender.key])) {
      if (!key || pools[key]) continue
      setPools(prev => ({ ...prev, [key]: { status: 'loading', moves: [], moveIds: [], provenance: LEARNSET_SOURCE } }))
      void loadFormLearnset(key).then(result => {
        if (poolMounted.current) setPools(prev => ({ ...prev, [key]: result }))
      }).catch(() => {
        if (poolMounted.current) setPools(prev => ({ ...prev, [key]: { status: 'load-error', moves: [], moveIds: [], provenance: LEARNSET_SOURCE } }))
      })
    }
  }, [attacker.key, defender.key])
  React.useEffect(() => { let active = true; void loadMoveMetaByName().then(() => { if (active) { refreshMeta(n => n + 1); setMoveMetaReady(true) } }); return () => { active = false } }, [])
  const attackingRow = indexByKey.get(attacker.key)
  const defendingRow = indexByKey.get(defender.key)
  const scarfFor = (entry: QuickSide) => entry.speedScarfOverride ?? isChoiceScarfItem(entry.item)
  const abilityFor = (entry: QuickSide, row: Row | undefined) => getSpeedAbility(row ? resolveFormAbility(row, entry.ability, abilityDescriptionFor, rows).slug ?? '' : '')
  const abilityPermitted = (entry: QuickSide, row: Row | undefined) => Boolean(abilityFor(entry, row) && speedActivationAllowed(resolveFormAbility(row, entry.ability, abilityDescriptionFor, rows).slug ?? '', { weather: conditions.weather, terrain: conditions.terrain, item: entry.item, scarf: scarfFor(entry), statused: entry.battle.burned || entry.battle.poisoned }))
  const speedFor = (entry: QuickSide, row: Row | undefined, scarf: boolean, ability: 1 | 1.5 | 2 = 1) => {
    if (!row) return null
    const itemStatus = classifyHeldItem(entry.key, entry.item)
    if (!isCalculableHeldItem(entry.key, entry.item) || heldAbilityError(entry.key, entry.ability, language)) return { value: null, reason: heldItemError(entry.key, entry.item, language) || heldAbilityError(entry.key, entry.ability, language) }
    if (scarf && itemStatus.requiredStone) return { value: null, reason: lt('메가폼은 메가스톤이 필요하여 스카프를 사용할 수 없습니다.') }
    if (entry.speedAbilityActive && entry.ability === 'unburden' && scarf) return { value: null, reason: lt('곡예 발동에는 현재 지닌 도구가 없어야 합니다.') }
    const actual = entry.actual.speed
    if (actual !== undefined) {
      const value = quickStat(entry, row, 'speed')
      if (value === null) return { value: null, reason: lt('실수치는 1~999의 정수로 입력하세요.') }
      if (scarf && row.key.startsWith('mega-')) return { value: null, reason: lt('메가폼은 메가스톤이 필요하여 스카프를 사용할 수 없습니다.') }
      if (scarf && entry.ability === 'unburden' && ability !== 1) return { value: null, reason: lt('곡예 발동에는 현재 지닌 도구가 없어야 합니다.') }
      return { value: applySpeedModifiers(applySpeedStage(value, entry.speedStage), { scarf, abilityMultiplier: ability }), reason: null }
    }
    return effectiveComparisonSpeed(row, entry.evs.speed, quickStatNature(entry, 'speed', natureMultiplier(entry.nature, 'speed')), entry.speedStage, scarf, ability, entry.ability)
  }
  const mySpeedResult = speedFor(attacker, attackingRow, scarfFor(attacker), attacker.speedAbilityActive && abilityPermitted(attacker, attackingRow) ? abilityFor(attacker, attackingRow)!.multiplier : 1)
  const oppSpeedResult = speedFor(defender, defendingRow, scarfFor(defender), defender.speedAbilityActive && abilityPermitted(defender, defendingRow) ? abilityFor(defender, defendingRow)!.multiplier : 1)
  const moveLabel = (name: string) => language === 'ko' ? name : language === 'en' ? moveDescriptionFor(name)?.nameEn || name : moveDescriptionFor(name)?.nameJa || name
  const selectedSide = selected.side === 'attacker' ? attacker : defender
  const selectedMove = selectedSide.moves[selected.index] ?? ''
  const calculate = (direction: 'attacker' | 'defender', name: string) => calculateQuickDamage(prepareQuickDamageInput({ source: direction === 'attacker' ? attacker : defender, target: direction === 'attacker' ? defender : attacker, name, conditions, pools, language }))
  const result = calculate(selected.side, selectedMove)
  const selectedVerdict = quickKoVerdict(result)
  const selectedSource = selected.side === 'attacker' ? attackingRow : defendingRow
  const selectedTarget = selected.side === 'attacker' ? defendingRow : attackingRow
  const selectedPool = pools[selectedSide.key]
  const selectedReason = heldItemError(attacker.key, attacker.item, language) || heldItemError(defender.key, defender.item, language) || heldAbilityError(attacker.key, attacker.ability, language) || heldAbilityError(defender.key, defender.ability, language) || (!selectedMove ? lt('기술을 등록하거나 선택하세요.') : !selectedSource || !selectedTarget ? lt('양쪽 포켓몬을 선택하세요.') : !toStats(attacker, attackingRow!) || !toStats(defender, defendingRow!) ? lt('실수치는 1~999의 정수로 입력하세요.') : !selectedPool || selectedPool.status === 'loading' || !moveMetaReady ? lt('기술/계산 메타 확인 중 · 미확인') : selectedPool.status === 'load-error' || selectedPool.status === 'missing' || !getMoveMetadata(selectedMove)?.provenance.category || getMoveMetadata(selectedMove)?.provenance.category === 'unknown' ? lt('기술/계산 메타 미확인') : lt('이 기술은 현재 계산 조건에서 지원되지 않거나 변화기입니다.'))
  const hits = multiHitOptions(selectedMove)
  const setSide = (side: 'attacker' | 'defender', updater: (prev: QuickSide) => QuickSide) => side === 'attacker' ? setAttacker(updater) : setDefender(updater)
  const selectSide = (side: 'attacker' | 'defender', key: string) => {
    if (comparisonMode && side === 'attacker') return
    if (comparisonMode && side === 'defender' && onOpponentSpecies) {
      onOpponentSpecies?.(key)
      setDefenderSearch('')
      window.setTimeout(() => document.getElementById('quick-defender')?.focus(), 0)
      return
    }
    if (key === (side === 'attacker' ? attacker.key : defender.key)) { if (!comparisonMode && side === 'attacker') window.setTimeout(() => document.getElementById('quick-defender')?.focus(), 0); return }
    setModalSide(null)
    clearSideUI(side)
    if (comparisonMode) {
      setConditions(quickDefaultConditions())
      setManualFields({ weather: false, terrain: false })
      setAttacker(prev => resetPairAssumptions(prev, initialSides![0], dirty.attacker))
      setDefender(prev => resetPairAssumptions(prev, initialSides![1], dirty.defender))
      previousTargets.current[side === 'attacker' ? 0 : 1] = pairTarget(comparisonSlots?.[side === 'attacker' ? 0 : 1] ?? 0, { key })
    }
    if (comparisonMode && key === initialSides?.[side === 'attacker' ? 0 : 1].key) {
      if (side === 'attacker') setAttacker(initialSides![0]); else setDefender(initialSides![1])
      setDirty(prev => ({ ...prev, [side]: new Set() }))
      onDraftIdentity?.(side, '')
      if (side === 'attacker') setAttackerSearch(''); else setDefenderSearch('')
      return
    }
    const next = { ...quickBlank(), key, ability: soleAbilityForSelectedSpecies(indexByKey.get(key)), item: megaStoneForKey(key) ?? '', moves: side === 'attacker' && comparisonMode ? Array.from({ length: 4 }, (_, index) => movesForSpecies?.(key)?.[index] ?? '') : ['', '', '', ''] }
    if (comparisonMode) setDirty(prev => ({ ...prev, [side]: new Set(['key']) }))
    onDraftIdentity?.(side, key)
    if (side === 'attacker') { setAttacker(next); setAttackerSearch(''); setSelected({ side: 'attacker', index: 0 }) }
    else { setDefender(next); setDefenderSearch('') }
    if (!comparisonMode && side === 'attacker') window.setTimeout(() => document.getElementById('quick-defender')?.focus(), 0)
  }
  const searchOptions = (query: string) => query.trim() ? filterSpeciesOptions(query, { includeMega: true, allowLoose: false }).slice(0, 12).map(option => ({ key: option.key, label: searchDisplayLabel(option.key, language), sprite: indexByKey.get(option.key)?.sprite })) : []
  const speedVisual = compareSpeedVisual(mySpeedResult?.value, oppSpeedResult?.value)
  return { model: { attacker, defender, attackingRow, defendingRow, conditions, pools, selected, selectedMove, selectedSource, selectedTarget, selectedVerdict, selectedReason, result, hits, attackerSearch, defenderSearch, drafts, activeSlot, dirty, draftStorageFailed, moveMetaReady, mySpeedResult, oppSpeedResult, speedVisual, modalSide, modalKey, moveLabel, scarfFor, abilityFor, abilityPermitted, calculate, searchOptions }, commands: { setAttacker, setDefender, setConditions, setManualFields, setAttackerSearch, setDefenderSearch, setActiveSlot, setDrafts, setSelected, setModalSide, setModalKey, setDirty, setDraftStorageFailed, setSide, markDirty, selectSide, opener } }
}
