import React from 'react'
import type { PartyMember, SavedPartyPreset } from '../../app/types'
import { workspaceReducer, type PartyWorkspace, type PartyWorkspaceAction } from '../../domain/party/partyWorkspace'

// One working record and one synchronous snapshot: the latter makes multiple edits in
// the same event (including functional updates) observe the preceding transition.
export function usePartyWorkspace(initialWorkspace: PartyWorkspace, markSaving: () => void) {
  const [workspace, setWorkspace] = React.useState(initialWorkspace)
  const workspaceRef = React.useRef(workspace)
  const workspaceSelectionRevision = React.useRef(0)
  const dispatchWorkspace = (action: PartyWorkspaceAction) => {
    const next = workspaceReducer(workspaceRef.current, action)
    if (action.type === 'IMPORT' || next.activePartyPresetId !== workspaceRef.current.activePartyPresetId) workspaceSelectionRevision.current++
    workspaceRef.current = next
    setWorkspace(next)
  }
  const setParty = (update: PartyMember[] | ((previous: PartyMember[]) => PartyMember[])) => {
    markSaving()
    dispatchWorkspace({ type: 'EDIT_PARTY', update })
  }
  const setConfirmedMovesByKey = (update: Record<string, string[]> | ((previous: Record<string, string[]>) => Record<string, string[]>)) => {
    markSaving()
    dispatchWorkspace({ type: 'EDIT_MOVES', update })
  }
  const selectPreset = (id: string): SavedPartyPreset | null => {
    const current = workspaceRef.current
    const record = current.savedPartyPresets.find(entry => entry.id === id)
    if (!record || id === current.activePartyPresetId) return null
    dispatchWorkspace({ type: 'SELECT', id })
    return record
  }
  const createPreset = (id: string, label: string, emptyParty: PartyMember[]) => dispatchWorkspace({ type: 'CREATE', id, label, emptyParty })
  const renamePreset = (id: string, label: string) => dispatchWorkspace({ type: 'RENAME', id, label })
  const addPreset = (preset: SavedPartyPreset) => dispatchWorkspace({ type: 'ADD', preset })
  const resetWorkspace = (id: string, emptyParty: PartyMember[]) => dispatchWorkspace({ type: 'RESET', id, emptyParty })
  const importWorkspace = (next: PartyWorkspace) => dispatchWorkspace({ type: 'IMPORT', workspace: next })
  const deletePreset = (id: string, emptyParty: PartyMember[], replacementId: string): SavedPartyPreset | null => {
    const current = workspaceRef.current
    const next = id === current.activePartyPresetId ? current.savedPartyPresets.find(record => record.id !== id) ?? null : null
    dispatchWorkspace({ type: 'DELETE', id, emptyParty, replacementId })
    return next
  }
  const captureSelection = () => {
    const targetId = workspaceRef.current.activePartyPresetId
    const revision = workspaceSelectionRevision.current
    return { targetId, isCurrent: () => workspaceSelectionRevision.current === revision
      && workspaceRef.current.activePartyPresetId === targetId
      && workspaceRef.current.savedPartyPresets.some(record => record.id === targetId) }
  }
  const applyImportedBuild = (targetId: string, party: PartyMember[], movesByKey: Record<string, string[]>) => {
    dispatchWorkspace({type:'EDIT_BUILD',targetId,party,moves:{...workspaceRef.current.confirmedMovesByKey,...movesByKey}})
  }
  return { workspace: workspace as Readonly<PartyWorkspace>, workspaceRef, workspaceSelectionRevision,
    setParty, setConfirmedMovesByKey, selectPreset, createPreset, renamePreset, addPreset, deletePreset,
    resetWorkspace, importWorkspace, captureSelection, applyImportedBuild }
}
