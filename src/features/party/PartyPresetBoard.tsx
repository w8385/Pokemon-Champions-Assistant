import React from 'react'
import { indexByKey, rows } from '../../adapters/catalog/roster'
import { displayName } from '../../shared/display/formatters'
import { translateText } from '../../shared/display/translation'
import { UiIcon } from '../../shared/display/UiIcon'
import { savedSampleCountLabel } from '../../shared/display/entryHelpers'
import type { SavedPartyPreset, SiteLanguage } from '../../app/types'
import type { usePartyEditor } from './usePartyEditor'

type Editor = ReturnType<typeof usePartyEditor>
type BoardEditor = Pick<Editor, 'partyPresetLabelDraft' | 'setPartyPresetLabelDraft' | 'partyNameDraft' | 'setPartyNameDraft' | 'renameActivePartyName' | 'activePartyLabel' | 'createNewParty' | 'renamePartyPreset' | 'applyPartyPreset' | 'deletePartyPreset' | 'resetPartyForFreshEntry'>
export function PartyPresetBoard({ editor, savedPartyPresets, activePartyPresetId, siteLanguage, persistenceStatus, partyImageImportBusy, partyImageImportStatus, onOpenImageImport, onRetrySave, onApproveOverwrite }: {
  editor: BoardEditor; savedPartyPresets: readonly SavedPartyPreset[]; activePartyPresetId: string; siteLanguage: SiteLanguage;
  persistenceStatus: 'saving' | 'saved' | 'failed' | 'read-failed'; partyImageImportBusy: boolean; partyImageImportStatus: string;
  onOpenImageImport: () => void; onRetrySave: () => void; onApproveOverwrite: () => void
}) {
  const { partyPresetLabelDraft, setPartyPresetLabelDraft, partyNameDraft, setPartyNameDraft, activePartyLabel, createNewParty, renamePartyPreset, applyPartyPreset, deletePartyPreset, resetPartyForFreshEntry } = editor
  const lt = (text: string) => translateText(siteLanguage, text)
  return <>
            <div className="section-head row-between party-actions-heading">
              <div className="inline-controls compact-actions">
                <button type="button" className="action-button" onClick={onOpenImageImport} disabled={partyImageImportBusy}><UiIcon name="upload" size={17} />{partyImageImportBusy ? lt('OCR 추출 중...') : lt('이미지에서 파티 가져오기')}</button>
                <button type="button" className="action-button danger" onClick={resetPartyForFreshEntry}><UiIcon name="trash" size={17} />{lt('현재 파티 비우기')}</button>
              </div>
            </div>
            <div className="party-preset-board">
              <div className="party-preset-board-head row-between">
                <strong>{lt('저장한 파티')}</strong>
                <span className="muted-inline">{savedSampleCountLabel(savedPartyPresets.length, siteLanguage)}</span>
              </div>
              <div className="party-preset-controls">
                <input
                  value={partyPresetLabelDraft}
                  onChange={(e) => setPartyPresetLabelDraft(e.target.value)}
                  placeholder={lt('파티 이름')}
                />
                <button type="button" className="pick-chip" onClick={createNewParty}><UiIcon name="plus" size={17} />{lt('새 파티')}</button>
                <label className="party-active-name">{lt('선택 파티 이름')}
                  <input aria-label={lt('선택 파티 이름')} value={partyNameDraft}
                    onChange={event => {
                      const nextName = event.target.value
                      editor.renameActivePartyName(nextName)
                    }}
                    onBlur={() => { if (!partyNameDraft.trim()) setPartyNameDraft(activePartyLabel) }} />
                </label>
              </div>
              <div role="status" aria-live="polite" className={persistenceStatus === 'failed' || persistenceStatus === 'read-failed' ? 'party-persistence-error' : 'muted-inline'}>
                {persistenceStatus === 'read-failed' ? lt('저장 데이터 읽기 실패 · 원본 보호 중') : persistenceStatus === 'failed' ? lt('저장 실패 · 변경은 현재 화면에만 유지') : persistenceStatus === 'saving' ? lt('저장 중') : lt('자동 저장됨')}
                {persistenceStatus === 'failed' ? <button type="button" className="pick-chip" onClick={onRetrySave}>{lt('저장 재시도')}</button> : null}
                {persistenceStatus === 'read-failed' ? <button type="button" className="pick-chip" onClick={onApproveOverwrite}>{lt('원본 덮어쓰기 확인')}</button> : null}
              </div>
              {partyImageImportStatus ? <span className="muted-inline">{partyImageImportStatus}</span> : null}
              <div className="party-preset-grid">
                {savedPartyPresets.length ? savedPartyPresets.map((preset) => {
                  const leadMembers = preset.party.filter((member) => member.key).slice(0, 6)
                  return <div key={preset.id} className={`party-preset-card ${activePartyPresetId === preset.id ? 'active' : ''}`}>
                    <button type="button" aria-pressed={activePartyPresetId === preset.id} className="party-preset-card-main" onClick={() => applyPartyPreset(preset.id)}>
                      <div className="party-preset-sprite-row">
                        {leadMembers.length ? leadMembers.map((member, idx) => {
                          const row = indexByKey.get(member.key) ?? rows[0]
                          return row?.sprite ? <img key={`${preset.id}-${member.key}-${idx}`} src={row.sprite} alt={displayName(row, siteLanguage)} className="party-preset-sprite" /> : null
                        }) : <span className="muted-inline">—</span>}
                      </div>
                      <strong>{preset.label}</strong>
                      <span className="muted-inline">{leadMembers.length}/6</span>
                    </button>
                    <div className="party-preset-card-actions">
                      <button type="button" className="pick-chip" aria-label={`${preset.label}: ${lt('저장 파티 이름 변경')}`} onClick={() => renamePartyPreset(preset)}><UiIcon name="edit" size={17} />{lt('이름 변경')}</button>
                      <button type="button" className="pick-chip" aria-label={`${preset.label}: ${lt('저장 파티 삭제')}`} onClick={() => deletePartyPreset(preset)}><UiIcon name="trash" size={17} />{lt('삭제')}</button>
                    </div>
                  </div>
                }) : <p className="muted">{lt('아직 저장한 파티가 없습니다.')}</p>}
              </div>
            </div>
  </>
}
