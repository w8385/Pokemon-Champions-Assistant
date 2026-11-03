import React from 'react'
import type { OpponentState, SiteLanguage, EffortStatKey } from '../../app/types'
import type { SharedPoolState } from '../damage/quickPresentation'
import type { QuickSide } from '../damage/quickModel'
import { indexByKey } from '../../adapters/catalog/roster'
import { filterSpeciesOptions } from '../../shared/search/speciesOptions'
import { searchDisplayLabel } from '../../shared/display/formatters'
import { displayItemLabel } from '../../shared/display/itemPresentation'
import { resolveItemInput } from '../../shared/display/entryHelpers'
import { classifyHeldItem, itemForSpeciesSelection } from '../../domain/champions/itemIdentity'
import { abilityForSpeciesSelection } from '../../domain/champions/abilityIdentity'
import { registerOpponentSpecies, soleAbilityForSelectedSpecies, hasOpponentEntryData } from '../../domain/party/singleOpponentRegistration'
import { snapshotDefenderDrafts, removeDefenderDrafts } from '../../adapters/persistence/defenderDrafts'
import { forgetDraft } from '../../adapters/persistence/comparisonDraftState'
import { commitComparisonEntry } from '../../domain/party/singleInlineEntry'
import { choicesForPool, resolveEligibleMoveInput } from '../../domain/champions/sharedLearnsets'
import { filterMoveOptions } from '../../adapters/catalog/movePresentation'
import { applyChampionsEffort } from '../../domain/champions/effortProjection'
import { displayAbilities } from '../../shared/display/entryHelpers'

type Initial = {
  initialOpponents: OpponentState[]
  initialSelectedOpp: number
  emptyOpponents: OpponentState[]
  siteLanguage: SiteLanguage
  resolveSpeciesKey: (query: string, options?: { includeMega?: boolean }) => string | null
  resolveAbilityInput: (options: string[], raw: string) => string
  movePoolByKey: Record<string, SharedPoolState>
  onCloseOpponentItem: (idx: number) => void
  onDismissOpponentItem: () => void
  onFocusOpponentItem: (idx: number) => void
  onCloseOpponentMove: (key: string) => void
}
const visibleChampionsItem = (_key: string, item: string) => item
const normalizeItemForKey = itemForSpeciesSelection
function sanitizeSelectedIndex(value: unknown, length: number) {
  const number = Number(value)
  return Number.isInteger(number) && number >= 0 && number < length ? number : 0
}
function opponentEffortValues(entry: OpponentState) {
  return { hp: entry.hpEv, attack: 0, defense: entry.defenseEv, spAttack: 0, spDefense: entry.spDefenseEv, speed: entry.speedEv }
}
function opponentPatchFromEffortValues(evs: ReturnType<typeof opponentEffortValues>) {
  return { hpEv: evs.hp, defenseEv: evs.defense, spDefenseEv: evs.spDefense, speedEv: evs.speed }
}
export function useOpponentEntries({ initialOpponents, initialSelectedOpp, emptyOpponents, siteLanguage, resolveSpeciesKey, resolveAbilityInput, movePoolByKey, onCloseOpponentItem, onDismissOpponentItem, onFocusOpponentItem, onCloseOpponentMove }: Initial) {
  const [opponents, setOpponents] = React.useState<OpponentState[]>(initialOpponents)
  const [selectedOpp, setSelectedOpp] = React.useState(initialSelectedOpp)
  const [singleDraftIdentity, setSingleDraftIdentity] = React.useState<{ attacker?: string; defender?: string }>({})
  const [opponentResetRevision, setOpponentResetRevision] = React.useState(0)
  const [opponentSearch, setOpponentSearch] = React.useState<string[]>(() => initialOpponents.map(member => searchDisplayLabel(member.key, 'ko')))
  const [opponentItemDrafts, setOpponentItemDrafts] = React.useState<string[]>(() => initialOpponents.map(member => displayItemLabel(visibleChampionsItem(member.key, member.item), 'ko')))
  const [opponentAbilityDrafts, setOpponentAbilityDrafts] = React.useState<string[]>(() => initialOpponents.map(member => member.ability ?? ''))
  const [opponentMoveDraft, setOpponentMoveDraft] = React.useState('')
  const [calcOpponentMoveDraft, setCalcOpponentMoveDraft] = React.useState('')
  const [opponentMoveNotice, setOpponentMoveNotice] = React.useState<{ key: string; index: number } | null>(null)
  const [activeOpponentAbilityField, setActiveOpponentAbilityField] = React.useState<number | null>(null)
  const [opponentQuickSearch, setOpponentQuickSearch] = React.useState('')
  const opponentQuickInputRef = React.useRef<HTMLInputElement | null>(null)

  const oppMember = opponents[selectedOpp] ?? opponents[0]
  const oppMovePool = movePoolByKey[oppMember?.key ?? '']
  const oppMoveOptions = choicesForPool(oppMovePool)
  const revealedMoveCandidates = (query: string) => oppMovePool?.status === 'ready-verified' && oppMember.revealedMoves.length < 4 && query.trim()
    ? filterMoveOptions(query, oppMoveOptions).filter(option => !oppMember.revealedMoves.includes(option.name)).slice(0, 8) : []
  const blankOpponent = () => ({ ...emptyOpponents[0], revealedMoves: [...emptyOpponents[0].revealedMoves] })
  const abilitiesForKey = (key: string, language: SiteLanguage) => { const row = indexByKey.get(key); return row ? displayAbilities(row, language) : [] }
  const setOpponentField = (idx: number, patch: Partial<OpponentState>) => setOpponents(prev => prev.map((entry, slot) => slot === idx ? { ...entry, ...patch } : entry))
  const toggleOpponentPicked = (idx: number) => setOpponents(prev => {
    const entry = prev[idx]
    if (!entry?.key || (!entry.picked && prev.filter(member => member.picked).length >= 3)) return prev
    return prev.map((member, slot) => slot === idx ? { ...member, picked: !member.picked } : member)
  })
  const setOpponentDraftIdentity = (side: 'attacker' | 'defender', key: string) => setSingleDraftIdentity(prev => ({ ...prev, [side]: key }))
  const updateDoubleOpponentBulkAt = (idx: number, patch: Partial<Pick<OpponentState, 'hpEv' | 'defenseEv' | 'spDefenseEv' | 'speedEv' | 'natureBoost' | 'scarf' | 'speedStage' | 'defenseNature' | 'spDefenseNature'>>) => setOpponentField(idx, patch)
  const updateDoubleOpponentEffortAt = (idx: number, stat: Extract<EffortStatKey, 'hp' | 'defense' | 'spDefense' | 'speed'>, value: number) => setOpponents(prev => prev.map((entry, slot) => slot === idx ? { ...entry, ...opponentPatchFromEffortValues(applyChampionsEffort(opponentEffortValues(entry), stat, value)) } : entry))
  const nudgeDoubleOpponentEffortAt = (idx: number, stat: Extract<EffortStatKey, 'hp' | 'defense' | 'spDefense' | 'speed'>, delta: number, availableCap: number) => setOpponents(prev => prev.map((entry, slot) => slot === idx ? { ...entry, ...opponentPatchFromEffortValues(applyChampionsEffort(opponentEffortValues(entry), stat, Math.max(0, Math.min(availableCap, opponentEffortValues(entry)[stat] + delta)))) } : entry))
  const saveComparisonOpponent = (idx: number, draft: QuickSide, dirty: Set<string>) => setOpponents(prev => prev.map((entry, slot) => slot === idx ? commitComparisonEntry('opponent', entry, draft, dirty) : entry))
  const importOpponentEntries = (entries: OpponentState[], selected: number, language: SiteLanguage) => {
    setOpponents(entries)
    setOpponentItemDrafts(entries.map(member => displayItemLabel(visibleChampionsItem(member.key, member.item), language)))
    setOpponentAbilityDrafts(entries.map(member => member.ability ?? ''))
    setOpponentSearch(entries.map(member => searchDisplayLabel(member.key, language)))
    setSelectedOpp(selected)
  }
  const resetRegisteredOpponents = () => {
    setOpponents(emptyOpponents.map(entry => ({ ...entry, revealedMoves: [...entry.revealedMoves] })))
    setOpponentSearch(emptyOpponents.map(() => ''))
    setOpponentItemDrafts(emptyOpponents.map(() => ''))
    setOpponentAbilityDrafts(emptyOpponents.map(() => ''))
    setActiveOpponentAbilityField(null)
    setSelectedOpp(0)
    setOpponentQuickSearch('')
  }
  React.useEffect(() => {
    setSelectedOpp(prev => sanitizeSelectedIndex(prev, opponents.length))
    setOpponentSearch(prev => opponents.map((member, idx) => prev[idx] ?? searchDisplayLabel(member.key, siteLanguage)))
    setOpponentItemDrafts(prev => opponents.map((member, idx) => prev[idx] ?? displayItemLabel(visibleChampionsItem(member.key, member.item), siteLanguage)))
    setOpponentAbilityDrafts(prev => opponents.map((member, idx) => prev[idx] ?? member.ability ?? ''))
  }, [opponents, selectedOpp, siteLanguage])
  React.useEffect(() => { setOpponentMoveDraft(''); setCalcOpponentMoveDraft('') }, [selectedOpp, oppMember.key])
  const addOpponentRevealedMove = (move: string) => {
    const accepted = resolveEligibleMoveInput(move, oppMovePool)
    if (!accepted) {
      setOpponentMoveNotice({ key: oppMember.key, index: selectedOpp })
      return false
    }
    setOpponentMoveNotice(null)
    const nextMoves = [...oppMember.revealedMoves]
    if (nextMoves.includes(accepted) || nextMoves.length >= 4) return false
    const next = [...opponents]
    next[selectedOpp] = { ...oppMember, revealedMoves: [...nextMoves, accepted] }
    setOpponents(next)
    return true
  }
  const commitOpponentMoveDraft = () => {
    const top = revealedMoveCandidates(opponentMoveDraft)[0]
    if (!top) return false
    const added = addOpponentRevealedMove(top.name)
    if (added) {
      setOpponentMoveDraft('')
    }
    return added
  }
  const commitCalcOpponentMoveDraft = () => {
    const top = revealedMoveCandidates(calcOpponentMoveDraft)[0]
    if (!top) return false
    const added = addOpponentRevealedMove(top.name)
    if (added) {
      setCalcOpponentMoveDraft('')
    }
    return added
  }
  const removeOpponentRevealedMove = (move: string) => {
    const next = [...opponents]
    next[selectedOpp] = { ...oppMember, revealedMoves: oppMember.revealedMoves.filter((entry) => entry !== move) }
    setOpponents(next)
  }
  const selectOpponentItemOption = (idx: number, itemName: string) => {
    const member = opponents[idx]
    if (!member) return
    const resolved = resolveItemInput(member.key, itemName, siteLanguage)
    const next = [...opponents]
    next[idx] = { ...member, item: resolved }
    setOpponents(next)
    setOpponentItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = displayItemLabel(resolved, siteLanguage)
      return nextDrafts
    })
    onDismissOpponentItem()
  }
  const commitOpponentItemInput = (idx: number, rawValue?: string) => {
    const member = opponents[idx]
    if (!member) return false
    const draft = rawValue ?? opponentItemDrafts[idx] ?? ''
    // An untouched legacy value is display-only; only an explicit new valid choice/clear is committed.
    if (draft === displayItemLabel(member.item, siteLanguage)) return true
    const identity = classifyHeldItem(member.key, draft)
    if (!['none', 'allowed', 'required-stone'].includes(identity.status)) {
      setOpponentItemDrafts(prev => prev.map((value, slot) => slot === idx ? displayItemLabel(member.item, siteLanguage) : value))
      return false
    }
    const resolved = resolveItemInput(member.key, draft, siteLanguage)
    const next = [...opponents]
    next[idx] = { ...member, item: resolved }
    setOpponents(next)
    setOpponentItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = displayItemLabel(resolved, siteLanguage)
      return nextDrafts
    })
    return Boolean(resolved)
  }
  const commitOpponentAbilityInput = (idx: number, rawValue?: string) => {
    const member = opponents[idx]
    if (!member) return false
    const options = abilitiesForKey(member.key, siteLanguage)
    if (!options.length) {
      const next = [...opponents]
      next[idx] = { ...member, ability: '' }
      setOpponents(next)
      setOpponentAbilityDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = ''
        return nextDrafts
      })
      return false
    }
    const resolved = resolveAbilityInput(options, rawValue ?? opponentAbilityDrafts[idx] ?? '')
    const next = [...opponents]
    next[idx] = { ...member, ability: resolved }
    setOpponents(next)
    setOpponentAbilityDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = resolved
      return nextDrafts
    })
    return Boolean(resolved)
  }
  const selectOpponentAbilityOption = (idx: number, ability: string) => {
    const member = opponents[idx]
    if (!member) return
    const next = [...opponents]
    next[idx] = { ...member, ability }
    setOpponents(next)
    setOpponentAbilityDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = ability
      return nextDrafts
    })
    setActiveOpponentAbilityField(null)
  }
  const clearOpponentAbilityInput = (idx: number) => {
    const member = opponents[idx]
    if (!member) return
    const next = [...opponents]
    next[idx] = { ...member, ability: '' }
    setOpponents(next)
    setOpponentAbilityDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = ''
      return nextDrafts
    })
    setActiveOpponentAbilityField(idx)
  }
  const clearOpponentItemInput = (idx: number) => {
    const member = opponents[idx]
    if (!member) return
    const next = [...opponents]
    next[idx] = { ...member, item: '' }
    setOpponents(next)
    setOpponentItemDrafts((prev) => {
      const nextDrafts = [...prev]
      nextDrafts[idx] = ''
      return nextDrafts
    })
    onFocusOpponentItem(idx)
  }
  const selectOpponentSpecies = (idx: number, key: string) => {
  const member = opponents[idx]
      if (!member) return
      if (key === member.key) {
        setOpponentSearch(prev => prev.map((value, slot) => slot === idx ? searchDisplayLabel(key, siteLanguage) : value))
        return
      }
      const nextAbility = abilityForSpeciesSelection(indexByKey.get(key), member.key, key, member.ability)
      const next = [...opponents]
      next[idx] = { ...member, key, item: itemForSpeciesSelection(key, member.item), ability: nextAbility }
      setOpponents(next)
      setOpponentItemDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = displayItemLabel(visibleChampionsItem(key, next[idx].item), siteLanguage)
        return nextDrafts
      })
      setOpponentAbilityDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[idx] = nextAbility
        return nextDrafts
      })
      const nextSearch = [...opponentSearch]
      nextSearch[idx] = searchDisplayLabel(key, siteLanguage)
      setOpponentSearch(nextSearch)
  }
  const nextOpponentSlotIndex = (fromIdx: number) => {
    const emptyAfter = opponents.findIndex((member, idx) => idx > fromIdx && !member.key)
    if (emptyAfter >= 0) return emptyAfter
    if (fromIdx + 1 < emptyOpponents.length) return fromIdx + 1
    return fromIdx
  }

  const commitOpponentQuickSearch = (forcedKey?: string) => {
    const resolvedKey = forcedKey ?? resolveSpeciesKey(opponentQuickSearch, { includeMega: false }) ?? filterSpeciesOptions(opponentQuickSearch, { includeMega: false })[0]?.key
    if (!resolvedKey) return
    const slotIdx = selectedOpp
    if (opponents[slotIdx]?.key !== resolvedKey) {
      const nextAbility = abilityForSpeciesSelection(indexByKey.get(resolvedKey), opponents[slotIdx]?.key ?? '', resolvedKey, opponents[slotIdx]?.ability ?? '')
      const next = [...opponents]
      next[slotIdx] = { ...next[slotIdx], key: resolvedKey, item: normalizeItemForKey(resolvedKey, next[slotIdx].item), ability: nextAbility }
      setOpponents(next)
      setOpponentItemDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[slotIdx] = displayItemLabel(visibleChampionsItem(resolvedKey, next[slotIdx].item), siteLanguage)
        return nextDrafts
      })
      setOpponentAbilityDrafts((prev) => {
        const nextDrafts = [...prev]
        nextDrafts[slotIdx] = nextAbility
        return nextDrafts
      })
    }
    const nextSearch = [...opponentSearch]
    nextSearch[slotIdx] = searchDisplayLabel(resolvedKey, siteLanguage)
    setOpponentSearch(nextSearch)
    const nextIdx = nextOpponentSlotIndex(slotIdx)
    setSelectedOpp(nextIdx)
    setOpponentQuickSearch('')
    setTimeout(() => opponentQuickInputRef.current?.focus(), 0)
  }

  const resetOpponentsForFreshEntry = () => {
    const next = emptyOpponents.map((entry) => ({ ...entry, revealedMoves: [...entry.revealedMoves] }))
    setOpponents(next)
    setOpponentSearch(next.map(() => ''))
    setOpponentItemDrafts(next.map(() => ''))
    setOpponentAbilityDrafts(next.map(() => ''))
    setActiveOpponentAbilityField(null)
    setSelectedOpp(0)
    setOpponentQuickSearch('')
    setTimeout(() => opponentQuickInputRef.current?.focus(), 0)
  }

  const registerSingleOpponentSpecies = (key: string) => {
    const current = selectedOpp
    const { slots, nextIndex } = registerOpponentSpecies(opponents, current, key, () => ({ ...blankOpponent(), ability: soleAbilityForSelectedSpecies(indexByKey.get(key)), item: normalizeItemForKey(key, '') }))
    if (opponents[current]?.key !== key) forgetDraft(localStorage, 'defender', current)
    setOpponents(slots)
    setOpponentSearch(prev => prev.map((value, index) => index === current ? searchDisplayLabel(key, siteLanguage) : value))
    setOpponentItemDrafts(prev => prev.map((value, index) => index === current ? displayItemLabel(visibleChampionsItem(key, slots[current].item), siteLanguage) : value))
    setOpponentAbilityDrafts(prev => prev.map((value, index) => index === current ? slots[current].ability : value))
    setSingleDraftIdentity(prev => ({ ...prev, defender: '' }))
    setSelectedOpp(nextIndex)
  }
  const resetSingleOpponentEntry = (search: string) => {
    const snapshot = (() => { try { return snapshotDefenderDrafts(localStorage, emptyOpponents.length) } catch { return { ok: false } as const } })()
    if (!snapshot.ok) {
      window.alert(siteLanguage === 'en' ? 'Could not read opponent drafts. Nothing was reset.' : siteLanguage === 'ja' ? '相手の下書きを読み込めませんでした。初期化していません。' : '상대 초안을 읽지 못했습니다. 초기화하지 않았습니다.')
      return false
    }
    if (hasOpponentEntryData(opponents, snapshot.hasDraft, [search, opponentQuickSearch, ...opponentSearch].join(' '), blankOpponent) && !window.confirm(siteLanguage === 'en' ? 'Reset all opponent entry slots and comparison drafts?' : siteLanguage === 'ja' ? '相手エントリーの全枠と比較下書きを初期化しますか？' : '상대 엔트리와 비교 초안을 모두 초기화할까요?')) return false
    const removal = (() => { try { return removeDefenderDrafts(localStorage, snapshot) } catch { return { ok: false, restored: true } as const } })()
    if (!removal.ok) {
      window.alert(removal.restored
        ? siteLanguage === 'en' ? 'Could not remove opponent drafts. Nothing was reset.' : siteLanguage === 'ja' ? '相手の下書きを削除できませんでした。初期化していません。' : '상대 초안을 삭제하지 못했습니다. 초기화하지 않았습니다.'
        : siteLanguage === 'en' ? 'Could not remove opponent drafts; some drafts could not be restored. Opponent entries were not reset.' : siteLanguage === 'ja' ? '相手の下書きを削除できず、一部を復元できませんでした。エントリーは初期化していません。' : '상대 초안을 삭제하지 못했고 일부 복원에도 실패했습니다. 엔트리는 초기화하지 않았습니다.')
      return false
    }
    resetOpponentsForFreshEntry()
    setSingleDraftIdentity(prev => ({ ...prev, defender: '' }))
    setOpponentResetRevision(prev => prev + 1)
    window.setTimeout(() => document.getElementById('quick-defender')?.focus(), 0)
    return true
  }

  const clearOpponentSlot = (idx: number) => {
    setOpponents((prev) => prev.map((member, memberIdx) => memberIdx === idx ? { ...emptyOpponents[idx], revealedMoves: [...emptyOpponents[idx].revealedMoves] } : member))
    setOpponentSearch((prev) => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setOpponentItemDrafts((prev) => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setOpponentAbilityDrafts((prev) => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setActiveOpponentAbilityField((prev) => prev === idx ? null : prev)
    onCloseOpponentItem(idx)
    onCloseOpponentMove(opponents[idx]?.key ?? '')
    if (selectedOpp === idx) setSelectedOpp(0)
  }

  return { opponents, selectedOpp, singleDraftIdentity, opponentResetRevision, opponentSearch, opponentItemDrafts, opponentAbilityDrafts,
    opponentMoveDraft, calcOpponentMoveDraft, opponentMoveNotice, activeOpponentAbilityField, opponentQuickSearch, opponentQuickInputRef,
    setSelectedOpp, setOpponentSearch, setOpponentItemDrafts, setOpponentAbilityDrafts, setOpponentMoveDraft, setCalcOpponentMoveDraft,
    setActiveOpponentAbilityField, setOpponentQuickSearch, setSingleDraftIdentity,
    selectOpponentItemOption, commitOpponentItemInput, commitOpponentAbilityInput, selectOpponentAbilityOption, clearOpponentAbilityInput, clearOpponentItemInput,
    selectOpponentSpecies, nextOpponentSlotIndex, commitOpponentQuickSearch, resetOpponentsForFreshEntry, registerSingleOpponentSpecies,
    resetSingleOpponentEntry, clearOpponentSlot, addOpponentRevealedMove, commitOpponentMoveDraft, commitCalcOpponentMoveDraft,
    removeOpponentRevealedMove, setOpponentField, toggleOpponentPicked, updateDoubleOpponentBulkAt, updateDoubleOpponentEffortAt,
    nudgeDoubleOpponentEffortAt, importOpponentEntries, saveComparisonOpponent, resetRegisteredOpponents, setOpponentDraftIdentity,
  }
}
