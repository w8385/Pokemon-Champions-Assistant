import React from 'react'
import type { PartyMember, SavedPartyPreset, SiteLanguage } from '../../app/types'
import { indexByKey } from '../../adapters/catalog/roster'
import { displayItemLabel } from '../../shared/display/itemPresentation'
import { searchDisplayLabel } from '../../shared/display/formatters'
import { translateText } from '../../shared/display/translation'
import { abilityForSpeciesSelection } from '../../domain/champions/abilityIdentity'
import { itemForSpeciesSelection } from '../../domain/champions/itemIdentity'
import type { usePartyWorkspace } from './usePartyWorkspace'

type WorkspaceOwner = ReturnType<typeof usePartyWorkspace>
type EditorInput = {
  initialParty: PartyMember[]
  emptyParty: PartyMember[]
  workspace: WorkspaceOwner['workspace']
  setParty: WorkspaceOwner['setParty']
  selectPreset: WorkspaceOwner['selectPreset']
  createPreset: WorkspaceOwner['createPreset']
  renamePreset: WorkspaceOwner['renamePreset']
  deletePreset: WorkspaceOwner['deletePreset']
  language: SiteLanguage
  defaultNatureForKey: (key: string) => PartyMember['config']['nature']
  onSelectMy: (index: number) => void
  onCloseTuning: () => void
  onPresetSelectControls: () => void
  onClearSlotControls: (index: number, key: string) => void
}

// App calls this on every render, regardless of whether either Party surface is mounted.
// Transient raw input survives menu round trips; only explicit transitions replace it.
export function usePartyEditor(input: EditorInput) {
  const { initialParty, emptyParty, workspace, setParty, selectPreset, createPreset, renamePreset, deletePreset, language, defaultNatureForKey, onSelectMy, onCloseTuning, onPresetSelectControls, onClearSlotControls } = input
  const { party, savedPartyPresets, activePartyPresetId } = workspace
  const lt = (text: string) => translateText(language, text)
  const activePartyLabel = savedPartyPresets.find(record => record.id === activePartyPresetId)?.label ?? ''
  const [partySearch, setPartySearch] = React.useState<string[]>(() => initialParty.map(member => searchDisplayLabel(member.key, 'ko')))
  const [partyItemDrafts, setPartyItemDrafts] = React.useState<string[]>(() => initialParty.map(member => displayItemLabel(member.item, 'ko')))
  const [partyPresetLabelDraft, setPartyPresetLabelDraft] = React.useState('')
  const [partyNameDraft, setPartyNameDraft] = React.useState(activePartyLabel)
  const renameActivePartyName = (name: string) => {
    setPartyNameDraft(name)
    if (name.trim()) renamePreset(activePartyPresetId, name)
  }
  React.useEffect(() => { setPartyNameDraft(activePartyLabel) }, [activePartyPresetId, activePartyLabel])
  React.useEffect(() => {
    setPartySearch(prev => party.map((member, idx) => prev[idx] ?? searchDisplayLabel(member.key, language)))
    setPartyItemDrafts(prev => party.map((member, idx) => prev[idx] ?? displayItemLabel(member.item, language)))
  }, [party, language])
  const resetDrafts = (next: PartyMember[]) => {
    setPartySearch(next.map(member => searchDisplayLabel(member.key, language)))
    setPartyItemDrafts(next.map(member => displayItemLabel(member.item, language)))
  }
  const applyPartyPreset = (id: string) => {
    const record = selectPreset(id)
    if (!record) return false
    resetDrafts(record.party)
    onSelectMy(0)
    onPresetSelectControls()
    onCloseTuning()
    return true
  }
  const createNewParty = () => {
    createPreset(`party-${crypto.randomUUID()}`, partyPresetLabelDraft.trim() || lt('새 파티'), emptyParty.map(member => ({ ...member, evs: { ...member.evs }, config: { ...member.config }, tuning: { ...member.tuning } })))
    setPartyPresetLabelDraft('')
    setPartySearch(emptyParty.map(() => ''))
    setPartyItemDrafts(emptyParty.map(() => ''))
    onSelectMy(0)
    onCloseTuning()
  }
  const renamePartyPreset = (preset: SavedPartyPreset) => {
    if (typeof window === 'undefined') return
    const nextLabel = window.prompt(lt('파티 이름'), preset.label)?.trim()
    if (nextLabel) renamePreset(preset.id, nextLabel)
  }
  const deletePartyPreset = (preset: SavedPartyPreset) => {
    if (!window.confirm(`${preset.label}: ${lt('저장 파티 삭제')}?`)) return
    const next = deletePreset(preset.id, emptyParty.map(member => ({ ...member, evs: { ...member.evs }, config: { ...member.config }, tuning: { ...member.tuning } })), `party-${crypto.randomUUID()}`)
    if (preset.id === activePartyPresetId) resetDrafts(next?.party ?? emptyParty)
  }
  const resetPartyForFreshEntry = () => {
    if (!window.confirm(`${activePartyLabel || lt('새 파티')}: ${lt('현재 파티 비우기')} (6)`)) return
    setParty(emptyParty.map(member => ({ ...member, evs: { ...member.evs }, config: { ...member.config }, tuning: { ...member.tuning } })))
    setPartySearch(emptyParty.map(() => ''))
    setPartyItemDrafts(emptyParty.map(() => ''))
    onSelectMy(0)
    onCloseTuning()
  }
  const clearPartySlot = (idx: number) => {
    const previousKey = party[idx]?.key ?? ''
    setParty(prev => prev.map((member, memberIdx) => memberIdx === idx ? { ...emptyParty[idx], evs: { ...emptyParty[idx].evs }, config: { ...emptyParty[idx].config }, tuning: { ...emptyParty[idx].tuning } } : member))
    setPartySearch(prev => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    setPartyItemDrafts(prev => prev.map((value, valueIdx) => valueIdx === idx ? '' : value))
    onClearSlotControls(idx, previousKey)
  }
  const selectPartySpecies = (idx: number, key: string) => {
    const member = party[idx]
    if (!member) return
    if (key === member.key) {
      setPartySearch(prev => prev.map((value, slot) => slot === idx ? searchDisplayLabel(key, language) : value))
      return
    }
    const next = [...party]
    next[idx] = { ...member, key, ability: abilityForSpeciesSelection(indexByKey.get(key), '', key, ''), item: itemForSpeciesSelection(key, member.item), config: { ...member.config, nature: defaultNatureForKey(key) } }
    setParty(next)
    setPartyItemDrafts(prev => {
      const drafts = [...prev]
      drafts[idx] = displayItemLabel(next[idx].item, language)
      return drafts
    })
    const nextSearch = [...partySearch]
    nextSearch[idx] = searchDisplayLabel(key, language)
    setPartySearch(nextSearch)
    const nextEmptyIdx = next.findIndex((entry, entryIdx) => entryIdx > idx && !entry.key)
    if (nextEmptyIdx >= 0) window.setTimeout(() => { document.getElementById(`party-species-${nextEmptyIdx}`)?.focus() }, 0)
  }
  return { partySearch, setPartySearch, partyItemDrafts, setPartyItemDrafts, partyPresetLabelDraft, setPartyPresetLabelDraft,
    partyNameDraft, setPartyNameDraft, renameActivePartyName, activePartyLabel, resetDrafts, applyPartyPreset, createNewParty, renamePartyPreset,
    deletePartyPreset, resetPartyForFreshEntry, clearPartySlot, selectPartySpecies }
}
