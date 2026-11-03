import { normalizeMoveSlots } from '../../domain/party/moveSlots'
import React from 'react'
import type { PartyMember, OpponentState, SiteLanguage } from '../../app/types'
import { indexByKey } from '../../adapters/catalog/roster'
import { displayName } from '../../shared/display/formatters'
import { translateText } from '../../shared/display/translation'
import { comparisonSides } from '../../domain/party/unifiedComparisonAdapter'
import { commitComparisonEntry } from '../../domain/party/singleInlineEntry'
import { QuickDamagePanel, type QuickDamageProps } from '../damage/QuickDamagePanel'

type EntryOwner = {
  opponents: OpponentState[]
  selectedOpp: number
  setSelectedOpp: (idx: number) => void
  opponentResetRevision: number
  registerSingleOpponentSpecies: (key: string) => void
  resetSingleOpponentEntry: (search: string) => boolean
  setOpponentDraftIdentity: (side: 'attacker' | 'defender', key: string) => void
  saveComparisonOpponent: (idx: number, draft: Parameters<NonNullable<QuickDamageProps['onSaveEntry']>>[1], dirty: Set<string>) => void
}
type Props = {
  language: SiteLanguage
  party: PartyMember[]
  selectedMy: number
  onSelectMy: (idx: number) => void
  entry: EntryOwner
  confirmedMovesByKey: Record<string, string[]>
  comparisonAbility: Parameters<typeof comparisonSides>[5]
  onSaveParty: React.Dispatch<React.SetStateAction<PartyMember[]>>
  onSaveMoves: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  tooltipForMove: QuickDamageProps['tooltipForMove']
}

export function SingleEntryComparison({ language, party, selectedMy, onSelectMy, entry, confirmedMovesByKey, comparisonAbility, onSaveParty, onSaveMoves, tooltipForMove }: Props) {
  const { opponents, selectedOpp, setSelectedOpp, opponentResetRevision, registerSingleOpponentSpecies, resetSingleOpponentEntry, setOpponentDraftIdentity, saveComparisonOpponent } = entry
  const lt = (text: string) => translateText(language, text)

  return <div className="unified-single-pair">
    <QuickDamagePanel language={language} tooltipForMove={tooltipForMove}
      initialSides={comparisonSides(party, opponents, selectedMy, selectedOpp, confirmedMovesByKey, comparisonAbility)}
      comparisonSlots={[selectedMy, selectedOpp]} comparisonMode opponentResetRevision={opponentResetRevision}
      onOpponentSpecies={registerSingleOpponentSpecies} onResetOpponents={resetSingleOpponentEntry}
      movesForSpecies={key => confirmedMovesByKey[key] ?? []}
      sharedMoveSpecies={key => Boolean(key) && party.filter(member => member.key === key).length > 1}
      onDraftIdentity={(side, key) => setOpponentDraftIdentity(side, key)}
      onSaveEntry={(side, draft, fields) => {
        const dirty = new Set(fields)
        if (side === 'attacker') {
          if (draft.key !== party[selectedMy]?.key) return
          onSaveParty(prev => prev.map((entry, slot) => slot === selectedMy ? commitComparisonEntry('own', entry, draft, dirty) : entry))
          if (dirty.has('moves')) onSaveMoves(prev => ({ ...prev, [draft.key]: normalizeMoveSlots(draft.moves) }))
        } else {
          saveComparisonOpponent(selectedOpp, draft, dirty)
        }
        setOpponentDraftIdentity(side, '')
      }}
      entrySelectors={(opponentSearch, reset) => <div className="single-entry-selectors">
        <div className="single-entry-toolbar"><div className="selected-opponent-search">{opponentSearch}</div>{reset}</div>
        <div className="unified-pair-pickers"><div><div className="single-picker-head"><strong>{lt('내 파티')}</strong></div><div className="unified-pair-buttons">{party.map((member, idx) => { const row = indexByKey.get(member.key); return <button key={idx} type="button" aria-pressed={selectedMy === idx} onClick={() => { if (idx !== selectedMy) { setOpponentDraftIdentity('attacker', ''); onSelectMy(idx) } }}>{row?.sprite ? <img src={row.sprite} alt="" /> : null}<span>{idx + 1}. {row ? displayName(row, language) : lt('빈 슬롯')}</span></button> })}</div>{!party[selectedMy]?.key ? <small>{lt('빈 슬롯: 내 파티 관리에서 포켓몬을 등록하세요.')}</small> : null}</div><div><div className="single-picker-head"><strong>{lt('상대 엔트리')}</strong></div><div className="unified-pair-buttons">{opponents.map((member, idx) => { const row = indexByKey.get(member.key); return <button key={idx} type="button" aria-pressed={selectedOpp === idx} onClick={() => { if (idx !== selectedOpp) { setOpponentDraftIdentity('defender', ''); setSelectedOpp(idx) } }}>{row?.sprite ? <img src={row.sprite} alt="" /> : null}<span>{idx + 1}. {row ? displayName(row, language) : lt('빈 슬롯')}</span></button> })}</div></div></div>
      </div>} />
  </div>
}
