import React from 'react'
import type { PartyMember, SiteLanguage, MoveFieldTarget, MoveCategory, NatureId, Row, HoverTooltipCard } from '../../app/types'
import { rows, indexByKey } from '../../adapters/catalog/roster'
import { abilityDescriptionFor, usageTopMovesForKey } from '../../adapters/catalog/data'
import { filterSpeciesOptions } from '../../shared/search/speciesOptions'
import { searchDisplayLabel, displayName, statThemeClass, moveTypeThemeClass } from '../../shared/display/formatters'
import { selectedAbilityDisplayName, heldAbilityError } from '../../shared/display/abilityPresentation'
import { displayItemLabel, megaStoneForKey, filterItemOptions, isAllowedChampionsItem, itemAutocompletePrimaryLabel, itemAutocompleteSecondaryLabel, itemSpriteSrc, heldItemError } from '../../shared/display/itemPresentation'
import { classifyHeldItem } from '../../domain/champions/itemIdentity'
import { localizedAbilityLabel } from '../../domain/champions/abilityIdentity'
import { natureById, SELECTABLE_NATURES } from '../../shared/display/naturePresentation'
import { applyChampionsEffort } from '../../domain/champions/effortProjection'
import { effortMagicProjection } from '../../domain/champions/effortMagic'
import { STAT_PRESENTATION as EFFORT_STAT_OPTIONS } from '../../shared/display/statPresentation'
import { PokemonCardHeading, MoveSlotsEditor, MoveCandidateRow, MoveUsageSuggestions, isFocusEnteringMoveUsageRail } from '../../shared/display/PokemonCardOverview'
import { CompactStatEditor } from '../../shared/display/CompactStatEditor'
import PokemonSearchField from '../../shared/search/PokemonSearchField'
import { PokemonBuildFields } from '../../shared/display/PokemonBuildFields'
import { UiIcon } from '../../shared/display/UiIcon'
import { getTypeBadgeLabel, getTypeBadgeSrc } from '../../shared/display/typeBadges'
import { lookupMoveMeta, resolveMoveType, resolveMoveMeta, filterMoveOptions } from '../../adapters/catalog/movePresentation'
import { choicesForPool, eligibleMoveRecommendations, resolveEligibleMoveInput } from '../../domain/champions/sharedLearnsets'
import { learnsetStatusText, recordedLearnsetText, type SharedPoolState } from '../damage/quickPresentation'
import { translateText } from '../../shared/display/translation'
import { emptySlotLabel, natureChipLabel, resolveItemInput, partyStatValue, displayAbilities, sameMoveField } from '../../shared/display/entryHelpers'
import type { usePartyEditor } from './usePartyEditor'
import { nextOpenMoveSlot } from '../../domain/party/moveSlots'

type Editor = ReturnType<typeof usePartyEditor>
type CardEditor = Pick<Editor, 'partySearch' | 'setPartySearch' | 'clearPartySlot' | 'selectPartySpecies'>
type MovePort = {
  activeMoveField: MoveFieldTarget; moveInputDraft: string | null; moveCommitNotice: MoveFieldTarget;
  setActiveMoveField: React.Dispatch<React.SetStateAction<MoveFieldTarget>>; setMoveInputDraft: React.Dispatch<React.SetStateAction<string | null>>;
  setMoveCommitNotice: React.Dispatch<React.SetStateAction<MoveFieldTarget>>;
  selectMoveOption: (key: string, slot: number, name: string) => void;
  commitEditorMove: (raw: string, previous: string, pool: SharedPoolState | undefined, key: string, slot: number, scope: 'party' | 'sample') => void;
  applyMoveToSlot: (key: string, move: string, preferredSlot?: number) => void;
}
export function PartyMemberCard({ member, idx, editorIdentity, siteLanguage, mainSection, editor, setParty, confirmedMovesByKey, movePoolByKey, moveSlotLabels, moves, tooltip }: {
  member: PartyMember; idx: number; editorIdentity: string; siteLanguage: SiteLanguage; mainSection: 'party' | 'double'; editor: CardEditor;
  setParty: (update: PartyMember[] | ((prev: PartyMember[]) => PartyMember[])) => void;
  confirmedMovesByKey: Readonly<Record<string, string[]>>; movePoolByKey: Readonly<Record<string, SharedPoolState>>;
  moveSlotLabels: { slot: string; category: (category: MoveCategory | null) => string; power: string; accuracy: string; pp: string; unknown: string };
  moves: MovePort;
  tooltip: { bindTooltip: (card: HoverTooltipCard | null | undefined) => React.HTMLAttributes<HTMLElement>; abilityTooltipData: (name: string, language: SiteLanguage, row?: Row | null) => HoverTooltipCard | null; itemTooltipData: (name: string, language: SiteLanguage) => HoverTooltipCard | null; moveTooltipData: (name: string, language: SiteLanguage) => HoverTooltipCard | null };
}) {
  const { partySearch, setPartySearch, clearPartySlot, selectPartySpecies } = editor
  const { activeMoveField, moveInputDraft, moveCommitNotice, setActiveMoveField, setMoveInputDraft, setMoveCommitNotice, selectMoveOption, commitEditorMove, applyMoveToSlot } = moves
  const { bindTooltip, abilityTooltipData, itemTooltipData, moveTooltipData } = tooltip
  const lt = (text: string) => translateText(siteLanguage, text)
                const row = member.key ? (indexByKey.get(member.key) ?? rows[0]) : null
                const fixedMegaStone = megaStoneForKey(member.key)
                const abilityOptions = row ? displayAbilities(row, siteLanguage) : []
                const memberMovePool = movePoolByKey[member.key]
                const memberMoveOptions = choicesForPool(memberMovePool)
                const memberTopSuggestedMoves = eligibleMoveRecommendations(usageTopMovesForKey(member.key), memberMovePool)
                const partySpeciesOptions = filterSpeciesOptions(partySearch[idx] ?? '').slice(0, 8)
                const findMoveType = (moveName: string) => resolveMoveType(moveName, memberMoveOptions, movePoolByKey)
                const registeredMoves = [...(confirmedMovesByKey[member.key] ?? [])]
                while (registeredMoves.length < 4) registeredMoves.push('')
                const focusNextMoveSlot = (nextMoves: readonly string[], fromIndex: number) => {
                  const nextIndex = nextOpenMoveSlot(nextMoves, fromIndex)
                  if (nextIndex !== null) window.setTimeout(() => document.getElementById(`party-${idx}-${member.key}-move-${nextIndex}`)?.focus(), 0)
                }
    return (
                  <div id={`party-slot-${idx}`} className={`card entry-card party-member-card ${mainSection === 'party' && new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('edit') === String(idx) ? 'party-entry-target' : ''}`}>
                    <PokemonCardHeading sprite={row?.sprite} spriteAlt={row ? displayName(row, siteLanguage) : ''} types={row?.types}
                      actions={row ? <button type="button" className="entry-card-clear-button" aria-label={`${idx + 1} · ${lt('슬롯 비우기')}`} title={lt('슬롯 비우기')} onClick={() => clearPartySlot(idx)}><UiIcon name="trash" size={17} /><span className="visually-hidden">{idx + 1} · {lt('슬롯 비우기')}</span></button> : null} name={
                            <PokemonSearchField id={`party-species-${idx}`} className="party-inline-species-picker"
                              inputClassName="party-inline-species-input" value={partySearch[idx] ?? ''}
                              placeholder={row ? lt('포켓몬 검색') : emptySlotLabel(idx, siteLanguage)}
                              onChange={value => setPartySearch(prev => prev.map((text, slot) => slot === idx ? value : text))}
                              onSelect={key => selectPartySpecies(idx, key)}
                              options={partySpeciesOptions.map(option => ({ key: option.key, label: searchDisplayLabel(option.key, siteLanguage), sprite: indexByKey.get(option.key)?.sprite }))} />
                    } />
                    {row ? <><PokemonBuildFields key={`${idx}-${member.key}`} identity={`${idx}-${member.key}`}
                      ability={member.ability} abilityLabel={selectedAbilityDisplayName(row, member.ability, siteLanguage)} abilityError={heldAbilityError(member.key, member.ability, siteLanguage)} nature={member.config.nature} item={member.item}
                      abilities={abilityOptions.map(value => ({ value, label: value }))}
                      natures={SELECTABLE_NATURES.map(n => ({ value: n.id, label: natureChipLabel(n.id, siteLanguage) }))}
                      itemOptions={query => filterItemOptions(query, siteLanguage, { fallbackToAll: false }).filter(value => isAllowedChampionsItem(member.key, value)).slice(0, 8).map(value => ({ value, label: itemAutocompletePrimaryLabel(value, siteLanguage), secondary: itemAutocompleteSecondaryLabel(value, siteLanguage), sprite: itemSpriteSrc(member.key, value) }))}
                      onAbility={ability => setParty(prev => prev.map((entry, slot) => slot === idx ? { ...entry, ability } : entry))}
                      onNature={nature => setParty(prev => prev.map((entry, slot) => slot === idx ? { ...entry, config: { ...entry.config, nature: nature as NatureId } } : entry))}
                      onItem={item => setParty(prev => prev.map((entry, slot) => slot === idx ? { ...entry, item: item ? resolveItemInput(entry.key, item, siteLanguage) : '' } : entry))}
                      labels={{ ability: lt('특성'), nature: lt('성격'), item: lt('도구'), none: lt('미선택'), itemPlaceholder: lt('사용 가능 도구 선택'), fixed: lt('메가스톤 고정'), clear: lt('지우기') }}
                      itemLabel={value => displayItemLabel(value, siteLanguage)} itemSprite={value => itemSpriteSrc(member.key, value)} fixedItem={fixedMegaStone}
                      itemError={heldItemError(member.key, member.item, siteLanguage)} repairLabel={siteLanguage === 'ko' ? `${fixedMegaStone} 장착` : siteLanguage === 'ja' ? `${fixedMegaStone} を装備` : `Equip ${fixedMegaStone}`}
                      abilityTooltip={value => bindTooltip(value ? abilityTooltipData(value, siteLanguage, row) : null)}
                      itemTooltip={value => bindTooltip(value ? itemTooltipData(value, siteLanguage) : null)}
                    />{memberMovePool?.status === 'loading' ? <div className="move-pool-helper">{lt('기술풀 불러오는 중…')}</div> : null}</> : null}
                    {row ? (() => {
                      const magic = effortMagicProjection(row, member.evs, member.config.nature)
                      return <CompactStatEditor identity={`party-${editorIdentity}-${idx}-${member.key}`} language={siteLanguage} evs={member.evs} nature={member.config.nature}
                        stats={EFFORT_STAT_OPTIONS.map(stat => ({ key: stat.key, label: lt(stat.label), theme: statThemeClass(stat.key), value: partyStatValue(row, member, stat.key), ev: member.evs[stat.key] }))}
                        actualValue={(key, effort) => partyStatValue(row, effort === undefined ? member : { ...member, evs: { ...member.evs, [key]: effort } }, key)}
                        onEffort={(key, value) => setParty(prev => prev.map((entry, slot) => slot === idx ? { ...entry, evs: applyChampionsEffort(entry.evs, key, value) } : entry))}
                        onSpread={evs => setParty(prev => prev.map((entry, slot) => slot === idx ? { ...entry, evs } : entry))}
                        onNature={nature => setParty(prev => prev.map((entry, slot) => slot === idx ? { ...entry, config: { ...entry.config, nature } } : entry))}
                        magicScale={magic.scale} />
                    })() : null}
                    {row ? <MoveSlotsEditor className="inline-move-card party-move-slots" label={lt('기술 배치')} labels={moveSlotLabels} ownerId={`party-${idx}-${member.key}`} role="editable" onClick={e => e.stopPropagation()}
                      toolbar={<>
                        {member.key ? learnsetStatusText(memberMovePool, siteLanguage) ? <small className="quick-source-badge" role="status">{learnsetStatusText(memberMovePool, siteLanguage)}</small> : null : null}
                        {memberMovePool?.status === 'load-error' ? <button type="button" onClick={() => window.location.reload()}>{siteLanguage === 'ko' ? '다시 시도 (새로고침)' : siteLanguage === 'ja' ? '再読込' : 'Reload to retry'}</button> : null}
                      </>}
                      slots={registeredMoves.slice(0, 4).map((move, moveIdx) => {
                          const moveType = findMoveType(move)
                          return { id: `${moveIdx}`, name: sameMoveField(activeMoveField, member.key, moveIdx, 'party') && moveInputDraft !== null ? moveInputDraft : move, type: moveType, meta: resolveMoveMeta(move, memberMoveOptions, movePoolByKey), className: moveTypeThemeClass(moveType),
                            tooltipProps: bindTooltip(move ? moveTooltipData(move, siteLanguage) : null),
                            search: { id: `party-${idx}-${member.key}-move-${moveIdx}`, options: filterMoveOptions(sameMoveField(activeMoveField, member.key, moveIdx, 'party') && moveInputDraft !== null ? moveInputDraft : move, memberMoveOptions).slice(0, 8).map(option => ({ key: option.name, label: option.name })), showAllOnEmpty: true,
                              onSelect: option => {
                                const accepted = resolveEligibleMoveInput(option.key, memberMovePool)
                                selectMoveOption(member.key, moveIdx, option.key)
                                setActiveMoveField(null)
                                if (accepted) {
                                  const nextMoves = [...registeredMoves]
                                  nextMoves[moveIdx] = accepted
                                  focusNextMoveSlot(nextMoves, moveIdx)
                                }
                              },
                              optionClassName: option => moveTypeThemeClass(memberMoveOptions.find(moveOption => moveOption.name === option.key)?.type),
                              renderOption: option => <MoveCandidateRow name={option.label} type={memberMoveOptions.find(moveOption => moveOption.name === option.key)?.type} meta={resolveMoveMeta(option.key, memberMoveOptions, movePoolByKey)} labels={moveSlotLabels} />,
                              optionProps: option => bindTooltip(moveTooltipData(option.key, siteLanguage)) },
                            inputProps: {
                              placeholder: memberMovePool?.status === 'loading' ? lt('기술풀 불러오는 중…') : memberMoveOptions.length ? lt('사용 가능 기술 검색') : lt('기술 입력'),
                              onFocus: () => {
                                setActiveMoveField({ key: member.key, slotIdx: moveIdx, scope: 'party' })
                                setMoveInputDraft(move)
                                setMoveCommitNotice(null)
                              },
                              onBlur: (e) => {
                                if (isFocusEnteringMoveUsageRail(e.currentTarget, e.relatedTarget)) return
                                if (sameMoveField(activeMoveField, member.key, moveIdx, 'party') && moveInputDraft !== null) commitEditorMove(e.target.value, move, memberMovePool, member.key, moveIdx, 'party')
                                setActiveMoveField((prev) => sameMoveField(prev, member.key, moveIdx, 'party') ? null : prev)
                              },

                              onChange: (e) => {
                                setMoveInputDraft(e.target.value)
                                setActiveMoveField({ key: member.key, slotIdx: moveIdx, scope: 'party' })
                              },
                            }, children: <>{recordedLearnsetText(move, memberMovePool, siteLanguage) ? <small role="status">{recordedLearnsetText(move, memberMovePool, siteLanguage)}</small> : null}{sameMoveField(moveCommitNotice, member.key, moveIdx, 'party') ? <small role="status">{lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')}</small> : null}</> }
                        })}
                      belowGrid={<MoveUsageSuggestions label={lt('사용률 상위 기술')} onFocusLeave={() => {
                        if (activeMoveField?.scope === 'party' && activeMoveField.key === member.key) {
                          const slotIdx = activeMoveField.slotIdx
                          if (moveInputDraft !== null) commitEditorMove(moveInputDraft, registeredMoves[slotIdx] ?? '', memberMovePool, member.key, slotIdx, 'party')
                        }
                        setActiveMoveField(prev => prev?.scope === 'party' && prev.key === member.key ? null : prev)
                      }} moves={memberTopSuggestedMoves.map(move => {
                        const selected = registeredMoves.includes(move)
                        const eligible = Boolean(resolveEligibleMoveInput(move, memberMovePool))
                        const reason = lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')
                        const moveType = findMoveType(move)
                        const preferredSlot = sameMoveField(activeMoveField, member.key, activeMoveField?.slotIdx ?? -1, 'party') ? activeMoveField?.slotIdx : undefined
                        return { name: move, type: moveType, selected, disabled: !eligible, title: !eligible ? reason : undefined,
                          ariaLabel: !eligible ? `${move} — ${reason}` : move, className: moveTypeThemeClass(moveType),
                          onSelect: () => {
                            const accepted = resolveEligibleMoveInput(move, memberMovePool)
                            const existingIndex = accepted ? registeredMoves.indexOf(accepted) : -1
                            const firstEmptyIndex = registeredMoves.findIndex(entry => !entry.trim())
                            const targetIndex = preferredSlot ?? (existingIndex >= 0 ? existingIndex : firstEmptyIndex >= 0 ? firstEmptyIndex : 3)
                            // The usage rail preserves input focus through mousedown so the
                            // clicked slot remains the target. Retire its draft before the
                            // deferred next-slot focus can fire a blur commit.
                            setMoveInputDraft(null)
                            setActiveMoveField(null)
                            applyMoveToSlot(member.key, move, preferredSlot)
                            if (accepted && !(existingIndex >= 0 && preferredSlot === undefined)) {
                              const nextMoves = [...registeredMoves]
                              if (existingIndex >= 0) nextMoves[existingIndex] = ''
                              nextMoves[targetIndex] = accepted
                              focusNextMoveSlot(nextMoves, targetIndex)
                            }
                          }, tooltipProps: bindTooltip(moveTooltipData(move, siteLanguage)) }
                      })} />} /> : null}
                  </div>
                )
}
