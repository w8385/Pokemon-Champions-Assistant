import { MovePoolState, learnsetStatusText, recordedLearnsetText, quickKoVerdict, quickKoLabels } from './quickPresentation.ts'
import { QuickSide, quickStat } from './quickModel.ts'
import { heldAbilityError, selectedAbilityDisplayName } from '../../shared/display/abilityPresentation.ts'
import { resolveMoveMeta, filterMoveOptions } from '../../adapters/catalog/movePresentation.ts'
import { megaStoneForKey, isAllowedChampionsItem, heldItemError, itemSpriteSrc, displayItemLabel, filterItemOptions, itemAutocompleteSecondaryLabel, itemAutocompletePrimaryLabel } from '../../shared/display/itemPresentation.ts'
import { statThemeClass, moveTypeThemeClass, natureLabel, displayMoveCategoryName, displayName } from '../../shared/display/formatters.ts'
import { translateText } from '../../shared/display/translation.ts'
import React from 'react'
import { CHAMPIONS_ITEM_OPTIONS } from '../../domain/champions/championsItems'
import { requiredMegaStone } from '../../domain/champions/itemIdentity'
import { DamageRangeMeter } from '../../shared/display/DamageRangeMeter'
import { quickItem, replaceQuickMove } from '../../domain/battle/quickDamageState'
import { type ComparisonSeed } from '../../domain/party/unifiedComparisonAdapter'
import { NATURES } from '../../domain/champions/natures'
import { STAT_PRESENTATION as EFFORT_STAT_OPTIONS } from '../../shared/display/statPresentation'
import { PokemonCardHeading, PokemonStatGrid, MoveSlotsEditor, MoveCandidateRow } from '../../shared/display/PokemonCardOverview'
import { choicesForPool } from '../../domain/champions/sharedLearnsets'
import { getMoveMetadata } from '../../domain/champions/moveMetadata'
import { PokemonBuildFields } from '../../shared/display/PokemonBuildFields'
import { localizedAbilityLabel } from '../../domain/champions/abilityIdentity'
import { MoveCategory, MoveOption, NatureId, Row, SiteLanguage } from '../../app/types'
import { abilityDescriptionFor } from '../../adapters/catalog/data'
import type { QuickDamageProps } from './QuickDamagePanel'
import type { useQuickDamageState } from './useQuickDamageState'
export function QuickSideCard({ side, entry, row, setEntry, searchField, language, comparisonMode, sharedMoveSpecies, tooltipForMove, opponentSource, model, commands }: {
  side: 'attacker' | 'defender'; entry: QuickSide; row: Row | undefined; setEntry: React.Dispatch<React.SetStateAction<QuickSide>>; searchField: React.ReactNode;
  language: SiteLanguage; comparisonMode: boolean; sharedMoveSpecies?: (key: string) => boolean; tooltipForMove: QuickDamageProps['tooltipForMove']; opponentSource: ComparisonSeed | undefined;
  model: Pick<ReturnType<typeof useQuickDamageState>['model'], 'pools' | 'selected' | 'drafts' | 'activeSlot' | 'dirty' | 'moveMetaReady' | 'calculate'>;
  commands: Pick<ReturnType<typeof useQuickDamageState>['commands'], 'setActiveSlot' | 'setDrafts' | 'setSelected' | 'setModalKey' | 'setModalSide' | 'markDirty' | 'opener'>;
}) {
  const { pools, selected, drafts, activeSlot, dirty, moveMetaReady, calculate } = model
  const { setActiveSlot, setDrafts, setSelected, setModalKey, setModalSide, markDirty, opener } = commands
  const lt = (text: string) => translateText(language, text)
const sourceLabels = {
    ko: { shared: '같은 종 슬롯과 기술 공유 · 변경 시 모두 적용', condition: '계산 조건 · 이 대면만', battle: '전투 조건', draft: '비교 초안', unknown: '미확인 · 계산값 0', natureUnknown: '성격 미확인', modifier: '기록 보정' },
    en: { shared: 'Moves shared by same-species slots · edits apply to all', condition: 'Calculation conditions · this matchup only', battle: 'Battle conditions', draft: 'Comparison draft', unknown: 'Unknown · calculated as 0', natureUnknown: 'Nature unknown', modifier: 'Recorded modifier' },
    ja: { shared: '同じ種の枠で技を共有 · 変更は全枠に反映', condition: '計算条件 · この対面のみ', battle: '戦闘条件', draft: '比較下書き', unknown: '未確認 · 計算値0', natureUnknown: '性格未確認', modifier: '記録補正' },
  }[language]
  const sourceStatus = (field: 'nature' | 'attack' | 'spAttack') => {
    if (dirty.defender.has(field)) return sourceLabels.draft
    if (field === 'nature') return opponentSource?.speedNatureKnown && !dirty.defender.has('key') ? null : sourceLabels.natureUnknown
    return opponentSource?.knownOffense?.[field] && !dirty.defender.has('key') ? null : sourceLabels.unknown
  }
  const sideCard = () => {
    const pool = choicesForPool(pools[entry.key])
    const status = pools[entry.key]?.status ?? 'loading'
    const poolMap: Record<string, MovePoolState> = { [entry.key]: { status: 'ready', moves: pool } }
    const labels = { slot: language === 'ja' ? '番' : language === 'en' ? ' · Move' : lt('번'), category: (category: MoveCategory | null) => displayMoveCategoryName(category, language), power: lt('위력'), accuracy: lt('명중'), pp: 'PP', unknown: lt('미확인') }
    const commit = (index: number, option: MoveOption) => {
      setEntry(prev => ({ ...prev, moves: replaceQuickMove(prev.moves, index, option.name) }))
      if (comparisonMode) markDirty(side, 'moves')
      setSelected({ side, index }); setActiveSlot(null)
      setDrafts(prev => ({ ...prev, [`${side}-${index}`]: '' }))
    }
    return <section className="card entry-card quick-side-card">
      <strong>{lt(comparisonMode ? side === 'attacker' ? '내 포켓몬' : '상대 포켓몬' : side === 'attacker' ? '공격측' : '방어측')}</strong>
      {comparisonMode ? null : searchField}
      {row ? <>
        <PokemonCardHeading name={<strong>{displayName(row, language)}</strong>} sprite={row.sprite} spriteAlt={displayName(row, language)} types={row.types} />
        {statCard(side, entry, row)}
        <MoveSlotsEditor label={lt('기술 배치')} labels={labels} ownerId={`quick-${side}-${entry.key}`} role="editable" selectedIndex={selected.side === side ? selected.index : null}
          toolbar={<>{learnsetStatusText(pools[entry.key], language) ? <small className="quick-source-badge" role="status">{learnsetStatusText(pools[entry.key], language)}</small> : null}
            {status === 'load-error' ? <button type="button" onClick={() => window.location.reload()}>{language === 'ko' ? '다시 시도 (새로고침)' : language === 'ja' ? '再読込' : 'Reload to retry'}</button> : null}
            {side === 'attacker' && comparisonMode && sharedMoveSpecies?.(entry.key) ? <small className="quick-source-badge">{sourceLabels.shared}</small> : null}</>}
          slots={Array.from({ length: 4 }, (_, index) => {
          const name = entry.moves[index] ?? ''
          const draftKey = `${side}-${index}`
          const draft = drafts[draftKey] ?? ''
          const options = filterMoveOptions(draft, pool).slice(0, 8)
          const meta = name ? resolveMoveMeta(name, pool, poolMap) : null
          const preview = calculate(side, name)
          const previewVerdict = quickKoVerdict(preview)
          return { id: `${index}`, name: activeSlot?.side === side && activeSlot.index === index ? draft : name, type: meta?.type, meta, className: moveTypeThemeClass(meta?.type),
              children: recordedLearnsetText(name, pools[entry.key], language) ? <small role="status">{recordedLearnsetText(name, pools[entry.key], language)}</small> : null,
              tooltipProps: tooltipForMove(name),
              search: { id: `quick-${side}-move-${index}`, options: options.map(option => ({ key: option.name, label: option.name })), showAllOnEmpty: true,
                onSelect: option => { const found = options.find(move => move.name === option.key); if (found) commit(index, found) },
                optionClassName: option => moveTypeThemeClass(options.find(move => move.name === option.key)?.type),
                renderOption: option => <MoveCandidateRow name={option.label} type={options.find(move => move.name === option.key)?.type} meta={resolveMoveMeta(option.key, options, poolMap)} labels={labels} />,
                optionProps: option => tooltipForMove(option.key) },
              inputProps: { 'aria-label': `${lt(comparisonMode ? side === 'attacker' ? '내 포켓몬' : '상대 포켓몬' : side === 'attacker' ? '공격측' : '방어측')} ${index + 1} ${lt('기술')}`, placeholder: status === 'loading' ? lt('기술풀 불러오는 중…') : status === 'load-error' ? lt('기술풀을 불러오지 못했습니다.') : status === 'missing' ? lt('기술풀 미확인') : lt('사용 가능 기술 검색'), onFocus: () => { setActiveSlot({ side, index }); setDrafts(prev => ({ ...prev, [draftKey]: '' })) }, onChange: event => setDrafts(prev => ({ ...prev, [draftKey]: event.target.value })), onBlur: () => setActiveSlot(prev => prev?.side === side && prev.index === index ? null : prev) },
              preview: <button type="button" className={`quick-move-preview${previewVerdict ? ` quick-ko-${previewVerdict}` : ''}`} aria-pressed={selected.side === side && selected.index === index} onClick={() => setSelected({ side, index })}>{preview ? <><DamageRangeMeter damage={preview.damage} targetHp={preview.targetHp} language={language} compact />{previewVerdict ? <strong className="quick-ko-verdict">{quickKoLabels[language][previewVerdict]}</strong> : null}</> : name ? status === 'loading' || !moveMetaReady ? lt('기술/계산 메타 확인 중 · 미확인') : status === 'load-error' || status === 'missing' || getMoveMetadata(name)?.provenance.category !== 'legacy' ? lt('기술/계산 메타 미확인') : lt('조건 미지원 / 변화기') : lt('기술 등록 →')}</button>
            }
        })} />
      </> : <p className="muted">{lt('포켓몬을 선택하세요.')}</p>}
    </section>
  }

  const statCard = (side: 'attacker' | 'defender', entry: QuickSide, row: Row | undefined) => {

    return row ? <div className="quick-stat-card" key={side}><PokemonBuildFields key={`${side}-${entry.key}`} identity={`${side}-${entry.key}`} className="quick-build-fields"
          ability={entry.ability} abilityLabel={selectedAbilityDisplayName(row, entry.ability, language)} nature={entry.nature} item={entry.item}
          abilities={row.abilities.map(value => ({ value, label: localizedAbilityLabel(row, value, language, abilityDescriptionFor) }))}
          abilityError={heldAbilityError(row.key, entry.ability, language)}
          natures={NATURES.map(n => ({ value: n.id, label: natureLabel(n.id, language) }))}
          itemOptions={query => filterItemOptions(query, language, { fallbackToAll: false }).filter(value => isAllowedChampionsItem(row.key, value)).slice(0, 8).map(value => ({ value, label: itemAutocompletePrimaryLabel(value, language), secondary: itemAutocompleteSecondaryLabel(value, language), sprite: itemSpriteSrc(row.key, value) }))}
          onAbility={value => { setEntry(prev => ({ ...prev, ability: value, speedAbilityActive: false })); if (comparisonMode) markDirty(side, 'ability') }}
          onNature={value => { setEntry(prev => ({ ...prev, nature: value as NatureId, statNatureMultipliers: {}, speedNatureKnown: true })); if (comparisonMode) markDirty(side, 'nature') }}
          onItem={value => { setEntry(prev => ({ ...prev, item: quickItem(value, megaStoneForKey(row.key), CHAMPIONS_ITEM_OPTIONS) })); if (comparisonMode) markDirty(side, 'item') }}
          labels={{ ability: lt('특성'), nature: side === 'defender' && comparisonMode && sourceStatus('nature') ? sourceStatus('nature') === sourceLabels.natureUnknown ? sourceLabels.natureUnknown : `${lt('성격')} · ${sourceStatus('nature')}` : lt('성격'), item: lt('도구'), none: lt('미선택'), itemPlaceholder: lt('사용 가능 도구 선택'), fixed: lt('메가스톤 고정'), clear: lt('지우기') }}
          itemLabel={value => displayItemLabel(value, language)} itemSprite={value => itemSpriteSrc(row.key, value)} fixedItem={requiredMegaStone(row.key)} itemError={heldItemError(row.key, entry.item, language)} repairLabel={language === 'ko' ? `${requiredMegaStone(row.key)} 장착` : language === 'ja' ? `${requiredMegaStone(row.key)} を装備` : `Equip ${requiredMegaStone(row.key)}`} />
<PokemonStatGrid showEffort stats={EFFORT_STAT_OPTIONS.map(stat => ({ key: stat.key, label: `${lt(stat.label)}${side === 'defender' && comparisonMode && (stat.key === 'attack' || stat.key === 'spAttack') && sourceStatus(stat.key) ? ` · ${sourceStatus(stat.key)}` : ''}${side === 'defender' && comparisonMode && entry.statNatureMultipliers[stat.key] !== undefined ? ` · ${sourceLabels.modifier} ×${entry.statNatureMultipliers[stat.key]}` : ''}`, theme: statThemeClass(stat.key), value: quickStat(entry, row, stat.key), ev: entry.evs[stat.key] }))} onTune={() => { opener.current = document.activeElement as HTMLElement; setModalKey(entry.key); setModalSide(side) }} /></div> : null
  }
  return sideCard()
}
