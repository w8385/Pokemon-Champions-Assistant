import React from 'react'
import type { SiteLanguage, MainSection, MoveCategory, MoveFieldTarget, HoverTooltipCard, Row } from '../../app/types'
import type { usePartyWorkspace } from './usePartyWorkspace'
import type { usePartyEditor } from './usePartyEditor'
import { PartyPresetBoard } from './PartyPresetBoard'
import { PartyMemberCard } from './PartyMemberCard'
import { PartyAnalysisPanel } from './PartyAnalysisPanel'
import { MOVE_META_BY_NAME } from '../../adapters/catalog/data'
import { indexByKey } from '../../adapters/catalog/roster'
import { resolveSelectedAbility } from '../../shared/display/abilityPresentation'
import { lookupMoveMeta } from '../../adapters/catalog/movePresentation'
import { resolveAbilityAdjustedMoveMeta } from '../../domain/battle/moveEffects'
import { displayName } from '../../shared/display/formatters'
import { analyzePartyMatchups } from '../../domain/party/partyAnalysis'
import { normalizedTypeChart, abilityAdjustedTypeEffectiveness } from '../../domain/battle/typeEffectiveness'
import type { SharedPoolState } from '../damage/quickPresentation'

type Workspace = ReturnType<typeof usePartyWorkspace>['workspace']
type Editor = ReturnType<typeof usePartyEditor>
export function PartyView({ workspace, editor, siteLanguage, mainSection, asyncDataVersion, movePoolByKey, moveSlotLabels, moves, tooltip, persistenceStatus, partyImageImportBusy, partyImageImportStatus, onOpenImageImport, onRetrySave, onApproveOverwrite, onTune, setParty }: {
  workspace: Workspace; editor: Editor; siteLanguage: SiteLanguage; mainSection: 'party' | 'double'; asyncDataVersion: number;
  movePoolByKey: Readonly<Record<string, SharedPoolState>>;
  moveSlotLabels: { slot: string; category: (category: MoveCategory | null) => string; power: string; accuracy: string; pp: string; unknown: string };
  moves: { activeMoveField: MoveFieldTarget; moveInputDraft: string | null; moveCommitNotice: MoveFieldTarget;
    setActiveMoveField: React.Dispatch<React.SetStateAction<MoveFieldTarget>>; setMoveInputDraft: React.Dispatch<React.SetStateAction<string | null>>;
    setMoveCommitNotice: React.Dispatch<React.SetStateAction<MoveFieldTarget>>;
    selectMoveOption: (key: string, slot: number, name: string) => void;
    commitEditorMove: (raw: string, previous: string, pool: SharedPoolState | undefined, key: string, slot: number, scope: 'party' | 'sample') => void;
    applyMoveToSlot: (key: string, move: string, preferredSlot?: number) => void };
  tooltip: { bindTooltip: (card: HoverTooltipCard | null | undefined) => React.HTMLAttributes<HTMLElement>; abilityTooltipData: (name: string, language: SiteLanguage, row?: Row | null) => HoverTooltipCard | null; itemTooltipData: (name: string, language: SiteLanguage) => HoverTooltipCard | null; moveTooltipData: (name: string, language: SiteLanguage) => HoverTooltipCard | null };
  persistenceStatus: 'saving' | 'saved' | 'failed' | 'read-failed'; partyImageImportBusy: boolean; partyImageImportStatus: string;
  onOpenImageImport: () => void; onRetrySave: () => void; onApproveOverwrite: () => void; onTune: (idx: number) => void;
  setParty: ReturnType<typeof usePartyWorkspace>['setParty'];
}) {
  const { party, confirmedMovesByKey, savedPartyPresets, activePartyPresetId } = workspace
  const partyAnalysisLoading = Object.keys(MOVE_META_BY_NAME).length === 0
  const partyAnalysis = React.useMemo(() => {
    const unknownKeys: string[] = []
    const members = party.flatMap((member, slot) => {
      if (!member.key) return []
      const row = indexByKey.get(member.key)
      if (!row) { unknownKeys.push(member.key); return [] }
      const selectedAbility = member.ability ? resolveSelectedAbility(row, member.ability, siteLanguage) : null
      if (member.ability && !selectedAbility) unknownKeys.push(`${member.key} · 특성 원본: ${member.ability}`)
      const ability = selectedAbility?.slug ?? ''
      const moves = (confirmedMovesByKey[member.key] ?? []).filter(Boolean).slice(0, 4).map(name => {
        const base = lookupMoveMeta(name)
        const adjusted = resolveAbilityAdjustedMoveMeta(name, base, ability)
        return { name, type: adjusted?.type ?? null, category: adjusted?.category ?? null }
      })
      return [{ key: member.key, name: displayName(row, siteLanguage), sprite: row.sprite, types: row.types, ability, moves, slot }]
    })
    return analyzePartyMatchups(members, normalizedTypeChart, { unknownKeys, offensiveEffectiveness: (type, target, ability) => abilityAdjustedTypeEffectiveness(type, [target], '', ability) })
  }, [party, confirmedMovesByKey, asyncDataVersion, siteLanguage])

  return <section className="panel wide">
    <div className="party-columns party-manage-columns">
      <PartyPresetBoard editor={{ partyPresetLabelDraft: editor.partyPresetLabelDraft, setPartyPresetLabelDraft: editor.setPartyPresetLabelDraft,
        partyNameDraft: editor.partyNameDraft, setPartyNameDraft: editor.setPartyNameDraft, renameActivePartyName: editor.renameActivePartyName, activePartyLabel: editor.activePartyLabel,
        createNewParty: editor.createNewParty, renamePartyPreset: editor.renamePartyPreset, applyPartyPreset: editor.applyPartyPreset,
        deletePartyPreset: editor.deletePartyPreset, resetPartyForFreshEntry: editor.resetPartyForFreshEntry }}
        savedPartyPresets={savedPartyPresets} activePartyPresetId={activePartyPresetId} siteLanguage={siteLanguage}
        persistenceStatus={persistenceStatus} partyImageImportBusy={partyImageImportBusy} partyImageImportStatus={partyImageImportStatus}
        onOpenImageImport={onOpenImageImport} onRetrySave={onRetrySave} onApproveOverwrite={onApproveOverwrite} />
      <div className="entry-grid manage-entry-grid">
        {party.map((member, idx) => <PartyMemberCard key={`${member.key}-${idx}`} member={member} idx={idx} siteLanguage={siteLanguage} mainSection={mainSection}
          editor={{ partySearch: editor.partySearch, setPartySearch: editor.setPartySearch, clearPartySlot: editor.clearPartySlot, selectPartySpecies: editor.selectPartySpecies }}
          setParty={setParty} confirmedMovesByKey={confirmedMovesByKey} movePoolByKey={movePoolByKey} moveSlotLabels={moveSlotLabels}
          moves={moves} tooltip={tooltip} onTune={onTune} />)}
      </div>
      <PartyAnalysisPanel analysis={partyAnalysis} language={siteLanguage} loading={partyAnalysisLoading} />
    </div>
  </section>
}
