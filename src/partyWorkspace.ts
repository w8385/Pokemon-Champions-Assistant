import type { PartyMember, SavedPartyPreset } from './app/types'

export type PartyWorkspace = {
  party: PartyMember[]
  confirmedMovesByKey: Record<string, string[]>
  savedPartyPresets: SavedPartyPreset[]
  activePartyPresetId: string
}
type Update<T> = T | ((previous: T) => T)
export type PartyWorkspaceAction =
  | { type: 'SELECT'; id: string }
  | { type: 'EDIT_PARTY'; update: Update<PartyMember[]> }
  | { type: 'EDIT_MOVES'; update: Update<Record<string, string[]>>; key?: string }
  | { type: 'EDIT_BUILD'; targetId: string; party: PartyMember[]; moves: Record<string, string[]> }
  | { type: 'CREATE' | 'RESET'; id: string; emptyParty: PartyMember[]; label?: string }
  | { type: 'RENAME'; id: string; label: string }
  | { type: 'DELETE'; id: string; emptyParty: PartyMember[]; replacementId?: string }
  | { type: 'ADD'; preset: SavedPartyPreset }
  | { type: 'IMPORT'; workspace: PartyWorkspace }

export const fourMoves = (input: unknown): string[] => Array.from({length: 4}, (_, index) =>
  Array.isArray(input) && typeof input[index] === 'string' ? input[index] : '')
export function uniquePartyId(records: SavedPartyPreset[], preferred: string): string {
  const ids = new Set(records.map(record => record.id))
  let candidate = preferred, index = 1
  while (ids.has(candidate)) candidate = `${preferred}-${index++}`
  return candidate
}
export function projectPartyMoves(record: SavedPartyPreset): Record<string, string[]> {
  const moves: Record<string, string[]> = {}
  record.party.forEach((member, index) => {
    if (member.key && !(member.key in moves)) moves[member.key] = fourMoves(record.lockedMovesBySlot[index])
  })
  return moves
}
function snapshot(party: PartyMember[], moves: Record<string, string[]>): string[][] {
  return party.map(member => member.key ? fourMoves(moves[member.key]) : [])
}
function matches(record: SavedPartyPreset, party: PartyMember[], moves: Record<string, string[]>): boolean {
  if (JSON.stringify(record.party) !== JSON.stringify(party)) return false
  const projected = projectPartyMoves(record)
  return Object.keys(projected).every(key => JSON.stringify(projected[key]) === JSON.stringify(fourMoves(moves[key])))
}
export function initializeWorkspace(input: {
  party?: PartyMember[]; confirmedMovesByKey?: Record<string, string[]>;
  savedPartyPresets?: SavedPartyPreset[]; activePartyPresetId?: string | null
}, fallbackParty: PartyMember[]): PartyWorkspace {
  const party = input.party ?? fallbackParty
  const moves = input.confirmedMovesByKey ?? {}
  const seen = new Set<string>()
  const records = (input.savedPartyPresets ?? []).map((preset, index) => {
    const id = uniquePartyId(Array.from(seen, id => ({id} as SavedPartyPreset)),preset.id?.trim() || `party-${index + 1}`)
    seen.add(id)
    return {...preset,id}
  })
  // Missing working party is not the app's starter roster: the record is authoritative.
  if (!input.party && records.length) {
    const record = records.find(entry => entry.id === input.activePartyPresetId) ?? records[0]
    return {party:record.party,confirmedMovesByKey:projectPartyMoves(record),savedPartyPresets:records,activePartyPresetId:record.id}
  }
  if (input.party && input.confirmedMovesByKey === undefined) {
    const sameParty = records.find(entry => entry.id === input.activePartyPresetId && JSON.stringify(entry.party) === JSON.stringify(party))
      ?? records.find(entry => JSON.stringify(entry.party) === JSON.stringify(party))
    if (sameParty) return {party,confirmedMovesByKey:projectPartyMoves(sameParty),savedPartyPresets:records,activePartyPresetId:sameParty.id}
  }
  const active = records.find(entry => entry.id === input.activePartyPresetId && matches(entry,party,moves))
    ?? records.find(entry => matches(entry,party,moves))
  if (active) return {party,confirmedMovesByKey:moves,savedPartyPresets:records,activePartyPresetId:active.id}
  const id = uniquePartyId(records,input.party && records.length ? 'recovered-party' : 'party-1')
  const record = {id,label:input.party && records.length ? '복구한 파티' : '파티 1',party,lockedMovesBySlot:snapshot(party,moves)}
  return {party,confirmedMovesByKey:moves,savedPartyPresets:[...records,record],activePartyPresetId:id}
}
const apply = <T,>(update: Update<T>, previous: T): T => typeof update === 'function' ? (update as (previous:T)=>T)(previous) : update
export function workspaceReducer(state: PartyWorkspace, action: PartyWorkspaceAction): PartyWorkspace {
  const active = state.savedPartyPresets.find(record => record.id === state.activePartyPresetId)
  switch (action.type) {
    case 'SELECT': {
      const record = state.savedPartyPresets.find(record => record.id === action.id)
      return record ? {...state,party:record.party,confirmedMovesByKey:projectPartyMoves(record),activePartyPresetId:record.id} : state
    }
    case 'EDIT_PARTY': {
      if (!active) return state
      const party = apply(action.update,state.party)
      if (party === state.party) return state
      // Preserve original slot move evidence unless the species occupying that slot changed.
      const lockedMovesBySlot = party.map((member,index) =>
        member.key === state.party[index]?.key ? active.lockedMovesBySlot[index] ?? [] : member.key ? fourMoves(state.confirmedMovesByKey[member.key]) : [])
      return {...state,party,savedPartyPresets:state.savedPartyPresets.map(record => record.id === active.id ? {...record,party,lockedMovesBySlot} : record)}
    }
    case 'EDIT_MOVES': {
      if (!active) return state
      const confirmedMovesByKey = apply(action.update,state.confirmedMovesByKey)
      if (confirmedMovesByKey === state.confirmedMovesByKey) return state
      const changedKeys = action.key ? [action.key] : Object.keys(confirmedMovesByKey).filter(key =>
        JSON.stringify(fourMoves(confirmedMovesByKey[key])) !== JSON.stringify(fourMoves(state.confirmedMovesByKey[key])))
      const lockedMovesBySlot = active.party.map((member,index) => member.key && changedKeys.includes(member.key)
        ? fourMoves(confirmedMovesByKey[member.key]) : active.lockedMovesBySlot[index] ?? [])
      return {...state,confirmedMovesByKey,savedPartyPresets:state.savedPartyPresets.map(record => record.id === active.id ? {...record,lockedMovesBySlot} : record)}
    }
    case 'EDIT_BUILD': {
      if (!active || active.id !== action.targetId) return state
      const lockedMovesBySlot = action.party.map(member => member.key ? fourMoves(action.moves[member.key]) : [])
      return {...state,party:action.party,confirmedMovesByKey:action.moves,
        savedPartyPresets:state.savedPartyPresets.map(record => record.id === active.id ? {...record,party:action.party,lockedMovesBySlot} : record)}
    }
    case 'CREATE':
    case 'RESET': {
      const id = uniquePartyId(action.type === 'RESET' ? [] : state.savedPartyPresets,action.id)
      const party = action.emptyParty
      const record = {id,label:action.label?.trim() || '새 파티',party,lockedMovesBySlot:party.map(()=>[])}
      return {party,confirmedMovesByKey:{},savedPartyPresets:action.type === 'RESET' ? [record] : [record,...state.savedPartyPresets],activePartyPresetId:id}
    }
    case 'RENAME': {
      return action.label.trim() ? {...state,savedPartyPresets:state.savedPartyPresets.map(record => record.id === action.id ? {...record,label:action.label} : record)} : state
    }
    case 'DELETE': {
      const savedPartyPresets = state.savedPartyPresets.filter(record => record.id !== action.id)
      if (savedPartyPresets.length === state.savedPartyPresets.length) return state
      if (action.id !== state.activePartyPresetId) return {...state,savedPartyPresets}
      if (!savedPartyPresets.length) return workspaceReducer({...state,savedPartyPresets},{type:'CREATE',id:action.replacementId ?? 'party-1',emptyParty:action.emptyParty})
      const next = savedPartyPresets[0]
      return {...state,savedPartyPresets,party:next.party,confirmedMovesByKey:projectPartyMoves(next),activePartyPresetId:next.id}
    }
    case 'ADD': {
      const preset = {...action.preset,id:uniquePartyId(state.savedPartyPresets,action.preset.id)}
      return {...state,savedPartyPresets:[preset,...state.savedPartyPresets]}
    }
    case 'IMPORT': return action.workspace
  }
}

export async function runGuardedOcrImport<File, Entry>(options: {
  files: File[]; recognize: (file: File) => Promise<string>; parse: (documents: string[]) => Entry[];
  confirm: (imported: Entry[]) => boolean; isCurrent: () => boolean; apply: (imported: Entry[]) => void
}): Promise<'applied' | 'stale' | 'empty' | 'cancelled'> {
  const documents: string[] = []
  for (const file of options.files) documents.push(await options.recognize(file))
  const imported = options.parse(documents)
  if (!imported.length) return 'empty'
  if (!options.isCurrent()) return 'stale'
  if (!options.confirm(imported)) return 'cancelled'
  // Confirmation can itself synchronously select/delete a different record.
  if (!options.isCurrent()) return 'stale'
  options.apply(imported)
  return 'applied'
}

export function persistWorkspace(storage: Pick<Storage, 'setItem'> | (() => Pick<Storage, 'setItem'>), key: string, payload: object): boolean {
  try { (typeof storage === 'function' ? storage() : storage).setItem(key,JSON.stringify(payload)); return true } catch { return false }
}
