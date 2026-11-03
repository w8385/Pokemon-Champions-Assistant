import { searchSlotPlaceholder } from '../../shared/display/searchSlotLabel'
import { SPEED_STAGE_OPTIONS, MAX_OPPONENTS, clampNonNegativeInt, clampSpeedStage } from '../../shared/input/opponentInputPolicy'
import { TypeBadgeImage } from '../../shared/display/TypeBadgeImage'
import { sameItemField, highlightedAutocompleteIndex } from '../../shared/input/autocompleteField'
import React from 'react'
import type { AutocompleteHighlight, HoverTooltipCard, ItemFieldTarget, OpponentState, SiteLanguage, MoveCategory, Row } from '../../app/types'
import type { SharedPoolState } from '../damage/quickPresentation'
import { indexByKey, rows } from '../../adapters/catalog/roster'
import { filterSpeciesOptions } from '../../shared/search/speciesOptions'
import { searchDisplayLabel, displayName, moveTypeThemeClass } from '../../shared/display/formatters'
import { emptySlotLabel, SmallTypeBadgeImage } from '../../shared/display/entryHelpers'
import { displayItemLabel, filterItemOptions, isAllowedChampionsItem, itemSpriteSrc, itemAutocompletePrimaryLabel, itemAutocompleteSecondaryLabel } from '../../shared/display/itemPresentation'
import { resolveSelectedAbility, selectedAbilityDisplayName, heldAbilityError } from '../../shared/display/abilityPresentation'
import { localizedAbilityLabel } from '../../domain/champions/abilityIdentity'
import { resolveMoveType, resolveMoveMeta, filterMoveOptions } from '../../adapters/catalog/movePresentation'
import { choicesForPool, resolveEligibleMoveInput } from '../../domain/champions/sharedLearnsets'
import { usageTopMovesForKey, abilityDescriptionFor } from '../../adapters/catalog/data'
import { translateText } from '../../shared/display/translation'
import { CHAMPIONS_EFFORT_PER_STAT_CAP } from '../../domain/champions/buildRules'
import { UiIcon } from '../../shared/display/UiIcon'
import PokemonSearchField from '../../shared/search/PokemonSearchField'
import SearchCombobox from '../../shared/search/SearchCombobox'
import { MoveCandidateRow } from '../../shared/display/PokemonCardOverview'
import type { useOpponentEntries } from './useOpponentEntries'

type Entry = ReturnType<typeof useOpponentEntries>
type PickEntry = Pick<Entry,
  'opponents' | 'selectedOpp' | 'opponentSearch' | 'opponentItemDrafts' | 'opponentMoveDraft' | 'opponentMoveNotice' |
  'opponentQuickSearch' | 'opponentQuickInputRef' | 'setSelectedOpp' | 'setOpponentSearch' | 'setOpponentItemDrafts' |
  'setOpponentMoveDraft' | 'setOpponentQuickSearch' | 'selectOpponentItemOption' | 'commitOpponentItemInput' |
  'clearOpponentItemInput' | 'selectOpponentSpecies' | 'commitOpponentQuickSearch' | 'resetOpponentsForFreshEntry' |
  'addOpponentRevealedMove' | 'commitOpponentMoveDraft' | 'removeOpponentRevealedMove' | 'setOpponentField' | 'toggleOpponentPicked'>
type Popup = {
  activeItemField: ItemFieldTarget
  autocompleteHighlight: AutocompleteHighlight
  setActiveItemField: React.Dispatch<React.SetStateAction<ItemFieldTarget>>
  setAutocompleteMenuOpen: (id: string) => void
  closeAutocompleteMenu: (id: string) => void
  moveAutocompleteMenuHighlight: (id: string, length: number, direction: -1 | 1) => void
}
type Props = {
  entry: PickEntry
  siteLanguage: SiteLanguage
  movePoolByKey: Record<string, SharedPoolState>
  moveSlotLabels: { slot: string; category: (category: MoveCategory | null) => string; power: string; accuracy: string; pp: string; unknown: string }
  popup: Popup
  bindTooltip: (card: HoverTooltipCard | null) => React.HTMLAttributes<HTMLElement>
  itemTooltipData: (name: string, language: SiteLanguage) => HoverTooltipCard | null
  abilityTooltipData: (name: string, language: SiteLanguage, row?: Row | null) => HoverTooltipCard | null
  moveTooltipData: (name: string, language: SiteLanguage) => HoverTooltipCard | null
  onInspectMove: (key: string, move: string) => void
  battleNote: string
  onBattleNote: (value: string) => void
}









export function OpponentsPickView({ entry, siteLanguage, movePoolByKey, moveSlotLabels, popup, bindTooltip, itemTooltipData, abilityTooltipData, moveTooltipData, onInspectMove, battleNote, onBattleNote }: Props) {
  const { opponents, selectedOpp, opponentSearch, opponentItemDrafts, opponentMoveDraft, opponentMoveNotice, opponentQuickSearch, opponentQuickInputRef,
    setSelectedOpp, setOpponentSearch, setOpponentItemDrafts, setOpponentMoveDraft, setOpponentQuickSearch, selectOpponentItemOption,
    commitOpponentItemInput, clearOpponentItemInput, selectOpponentSpecies, commitOpponentQuickSearch, resetOpponentsForFreshEntry,
    addOpponentRevealedMove, commitOpponentMoveDraft, removeOpponentRevealedMove, setOpponentField, toggleOpponentPicked } = entry
  const { activeItemField, autocompleteHighlight, setActiveItemField, setAutocompleteMenuOpen, closeAutocompleteMenu, moveAutocompleteMenuHighlight } = popup
  const lt = (text: string) => translateText(siteLanguage, text)
  const pickedOpponents = opponents.filter(member => member.picked)
  const oppMember: OpponentState = opponents[selectedOpp] ?? opponents[0]
  const oppRow = oppMember.key ? (indexByKey.get(oppMember.key) ?? rows[0]) : null
  const oppMovePool = movePoolByKey[oppMember.key]
  const oppMoveOptions = choicesForPool(oppMovePool)
  const oppTopSuggestedMoves = usageTopMovesForKey(oppMember.key)
  const revealedMoveCandidates = (query: string) => oppMovePool?.status === 'ready-verified' && oppMember.revealedMoves.length < 4 && query.trim()
    ? filterMoveOptions(query, oppMoveOptions).filter(option => !oppMember.revealedMoves.includes(option.name)).slice(0, 8) : []
  return <>

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
                  onSelect={key => selectOpponentSpecies(selectedOpp, key)}
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
                            onInspectMove(oppMember.key, move)
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
            onChange={(e) => onBattleNote(e.target.value)}
          />
        </section>
          </>
}
