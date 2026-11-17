import { MovePoolState, learnsetStatusText, recordedLearnsetText, quickKoVerdict, quickKoLabels } from './quickPresentation.ts'
import { QuickSide, quickHpFacts, quickMoveConditionKey, quickPositiveStageTotal, quickStat, quickStatused } from './quickModel.ts'
import { heldAbilityError, selectedAbilityDisplayName } from '../../shared/display/abilityPresentation.ts'
import { resolveMoveMeta, filterMoveOptions } from '../../adapters/catalog/movePresentation.ts'
import { megaStoneForKey, isAllowedChampionsItem, heldItemError, itemSpriteSrc, displayItemLabel, filterItemOptions, itemAutocompleteSecondaryLabel, itemAutocompletePrimaryLabel } from '../../shared/display/itemPresentation.ts'
import { statThemeClass, moveTypeThemeClass, natureLabel, displayMoveCategoryName, displayName } from '../../shared/display/formatters.ts'
import { translateText } from '../../shared/display/translation.ts'
import React from 'react'
import { CHAMPIONS_ITEM_OPTIONS } from '../../domain/champions/championsItems'
import { classifyHeldItem, requiredMegaStone } from '../../domain/champions/itemIdentity'
import { DamageRangeMeter, damageRangePresentation } from '../../shared/display/DamageRangeMeter'
import { quickItem, replaceQuickMove } from '../../domain/battle/quickDamageState'
import { type ComparisonSeed } from '../../domain/party/unifiedComparisonAdapter'
import { SELECTABLE_NATURES } from '../../shared/display/naturePresentation'
import { STAT_PRESENTATION as EFFORT_STAT_OPTIONS } from '../../shared/display/statPresentation'
import { PokemonCardHeading, MoveSlotsEditor, MoveCandidateRow, MoveUsageSuggestions } from '../../shared/display/PokemonCardOverview'
import { choicesForPool, resolveEligibleMoveInput } from '../../domain/champions/sharedLearnsets'
import { getMoveMetadata } from '../../domain/champions/moveMetadata'
import { PokemonBuildFields } from '../../shared/display/PokemonBuildFields'
import { localizedAbilityLabel } from '../../domain/champions/abilityIdentity'
import { MoveCategory, MoveOption, NatureId, Row, SiteLanguage } from '../../app/types'
import { abilityDescriptionFor, usageTopMovesForKey } from '../../adapters/catalog/data'
import { battleFormRow } from '../../domain/battle/statProjection'
import type { QuickDamageProps } from './QuickDamagePanel'
import type { useQuickDamageState } from './useQuickDamageState'
import { QuickStatEditor } from './QuickStatEditor'
import { CONDITIONAL_MOVE_POWER_RULES, abilityAdjustedWeight, electroBallPower, gyroBallPower, multiHitOptions, normalizeConditionalPowerValue, resolveMultiHitCount, userWeightMovePower, weightBasedMovePower } from '../../domain/battle/movePower'
import { formatBattleIndex } from '../../domain/battle/battleIndices'
import { indexByKey } from '../../adapters/catalog/roster'
import { isDamageGrounded } from '../../domain/battle/modifierRules'
export function QuickSideCard({ side, editorIdentity, entry, targetEntry, row, setEntry, setTargetEntry, searchField, language, comparisonMode, sharedMoveSpecies, tooltipForMove, opponentSource, model, commands }: {
  side: 'attacker' | 'defender'; entry: QuickSide; targetEntry: QuickSide; row: Row | undefined; setEntry: React.Dispatch<React.SetStateAction<QuickSide>>; setTargetEntry: React.Dispatch<React.SetStateAction<QuickSide>>; searchField: React.ReactNode;
  editorIdentity?: string;
  language: SiteLanguage; comparisonMode: boolean; sharedMoveSpecies?: (key: string) => boolean; tooltipForMove: QuickDamageProps['tooltipForMove']; opponentSource: ComparisonSeed | undefined;
  model: Pick<ReturnType<typeof useQuickDamageState>['model'], 'pools' | 'selected' | 'drafts' | 'activeSlot' | 'dirty' | 'moveMetaReady' | 'calculate' | 'conditions' | 'mySpeedResult' | 'oppSpeedResult'>;
  commands: Pick<ReturnType<typeof useQuickDamageState>['commands'], 'setActiveSlot' | 'setDrafts' | 'setSelected' | 'setConditions' | 'markDirty'>;
}) {
  const { pools, selected, drafts, activeSlot, dirty, moveMetaReady, calculate, conditions, mySpeedResult, oppSpeedResult } = model
  const { setActiveSlot, setDrafts, setSelected, setConditions, markDirty } = commands
  const lt = (text: string) => translateText(language, text)
const sourceLabels = {
    ko: { shared: '같은 종 슬롯과 기술 공유 · 변경 시 모두 적용', condition: '계산 조건 · 이 대면만', battle: '전투 조건', draft: '비교 초안', natureUnknown: '성격 미확인' },
    en: { shared: 'Moves shared by same-species slots · edits apply to all', condition: 'Calculation conditions · this matchup only', battle: 'Battle conditions', draft: 'Comparison draft', natureUnknown: 'Nature unknown' },
    ja: { shared: '同じ種の枠で技を共有 · 変更は全枠に反映', condition: '計算条件 · この対面のみ', battle: '戦闘条件', draft: '比較下書き', natureUnknown: '性格未確認' },
  }[language]
  const natureSourceStatus = () => {
    if (dirty.defender.has('nature')) return sourceLabels.draft
    return opponentSource?.speedNatureKnown && !dirty.defender.has('key') ? null : sourceLabels.natureUnknown
  }
  const moveControlCopy = {
    ko: { targetItem: '상대 도구', removable: '적용 ×1.5', absent: '미적용 ×1', auto: '자동', skillLink: '스킬링크', accuracy: '명중', evasion: '회피' },
    en: { targetItem: 'Target item', removable: 'active ×1.5', absent: 'inactive ×1', auto: 'Auto', skillLink: 'Skill Link', accuracy: 'Accuracy', evasion: 'Evasion' },
    ja: { targetItem: '相手の道具', removable: '適用 ×1.5', absent: '未適用 ×1', auto: '自動', skillLink: 'スキルリンク', accuracy: '命中', evasion: '回避' },
  }[language]
  const patchBattle = (dispatch: React.Dispatch<React.SetStateAction<QuickSide>>, patch: Partial<QuickSide['battle']>) => dispatch(prev => ({ ...prev, battle: { ...prev.battle, ...patch } }))
  const setStatused = (dispatch: React.Dispatch<React.SetStateAction<QuickSide>>, checked: boolean) => dispatch(prev => ({ ...prev, battle: { ...prev.battle, statused: checked, ...(checked ? {} : { burned: false, poisoned: false }) } }))
  const renderMoveControls = (name: string, index: number, decisionPower?: number | null) => {
    if (!name) return null
    const conditionKey = quickMoveConditionKey(side, index, name)
    const rule = CONDITIONAL_MOVE_POWER_RULES[name]
    const hitOptions = multiHitOptions(name)
    const storedHits = conditions.moveHits[conditionKey]
    const skillLink = entry.ability === 'skill-link' && Boolean(hitOptions?.length && hitOptions.length > 1)
    const effectiveHits = resolveMultiHitCount(name, storedHits, entry.ability)
    const choose = () => setSelected({ side, index })
    const setHitCount = (value: number) => {
      choose()
      setConditions(prev => ({ ...prev, moveHits: { ...prev.moveHits, [conditionKey]: value } }))
    }
    const setMoveValue = (value: number | boolean) => {
      choose()
      setConditions(prev => ({ ...prev, moveValues: { ...prev.moveValues, [conditionKey]: value } }))
    }
    const checkbox = (label: string, checked: boolean, onChange: (checked: boolean) => void) => <label className="quick-move-condition-check"><input type="checkbox" checked={checked} onChange={event => { choose(); onChange(event.target.checked) }} /><span>{lt(label)}</span></label>
    const count = (label: string, value: number, min: number, max: number, onChange: (value: number) => void) => <label><span>{lt(label)}</span><input type="number" inputMode="numeric" min={min} max={max} value={value} onChange={event => { choose(); onChange(Math.max(min, Math.min(max, Number(event.target.value)))) }} /></label>
    const auto = (label: string, value: React.ReactNode) => <span className="quick-move-auto-condition"><span>{lt(label)}</span><strong>{value}</strong></span>
    const setHpPercent = (dispatch: React.Dispatch<React.SetStateAction<QuickSide>>, value: number) => patchBattle(dispatch, quickHpFacts(value))
    const sourceSpeed = side === 'attacker' ? mySpeedResult?.value : oppSpeedResult?.value
    const targetSpeed = side === 'attacker' ? oppSpeedResult?.value : mySpeedResult?.value
    const targetRow = indexByKey.get(targetEntry.key)
    const sourceGrounded = isDamageGrounded(row?.types, entry.ability, entry.item, conditions.gravity)
    const targetGrounded = isDamageGrounded(targetRow?.types, targetEntry.ability, targetEntry.item, conditions.gravity)
    const sourceWeight = abilityAdjustedWeight(row?.weightKg ?? 0, entry.ability)
    const targetWeight = abilityAdjustedWeight(targetRow?.weightKg ?? 0, targetEntry.ability)
    let automaticCondition: React.ReactNode = null
    if (name === '성묘') automaticCondition = count(rule.label, entry.battle.faintedAllies, 0, 5, value => patchBattle(setEntry, { faintedAllies: value }))
    else if (name === '어시스트파워' || name === '기어오르기') automaticCondition = <>{auto(rule.label, `+${quickPositiveStageTotal(entry)}`)}{count(moveControlCopy.accuracy, entry.battle.accuracyStage, -6, 6, value => patchBattle(setEntry, { accuracyStage: value }))}{count(moveControlCopy.evasion, entry.battle.evasionStage, -6, 6, value => patchBattle(setEntry, { evasionStage: value }))}</>
    else if (name === '객기') automaticCondition = checkbox(rule.label, quickStatused(entry), checked => setStatused(setEntry, checked))
    else if (name === '병상첨병' || name === '백귀야행') automaticCondition = checkbox(rule.label, quickStatused(targetEntry), checked => setStatused(setTargetEntry, checked))
    else if (name === '독침천발' || name === '베놈쇼크') automaticCondition = checkbox(rule.label, targetEntry.battle.poisoned, checked => patchBattle(setTargetEntry, { poisoned: checked }))
    else if (name === '리벤지' || name === '눈사태') automaticCondition = checkbox(rule.label, entry.battle.damagedByTarget, checked => patchBattle(setEntry, { damagedByTarget: checked, ...(checked ? { movedAfterTarget: true } : {}) }))
    else if (name === '보복') automaticCondition = checkbox(rule.label, entry.battle.movedAfterTarget, checked => patchBattle(setEntry, { movedAfterTarget: checked }))
    else if (name === '승부굳히기') automaticCondition = checkbox(rule.label, targetEntry.battle.damagedThisTurn, checked => patchBattle(setTargetEntry, { damagedThisTurn: checked }))
    else if (name === '분풀이') automaticCondition = checkbox(rule.label, entry.battle.statDroppedThisTurn, checked => patchBattle(setEntry, { statDroppedThisTurn: checked }))
    else if (name === '분함의발구르기' || name === '열불내기') automaticCondition = checkbox(rule.label, entry.battle.previousMoveFailed, checked => patchBattle(setEntry, { previousMoveFailed: checked }))
    else if (name === '돌림노래') automaticCondition = checkbox(rule.label, entry.battle.allyUsedRound, checked => patchBattle(setEntry, { allyUsedRound: checked }))
    else if (name === '분노의주먹') automaticCondition = count(rule.label, entry.battle.timesHit, 0, 6, value => patchBattle(setEntry, { timesHit: value }))
    else if (name === '토해내기') automaticCondition = count(rule.label, entry.battle.stockpile, 1, 3, value => patchBattle(setEntry, { stockpile: value }))
    else if (['기사회생', '바둥바둥', '분화', '해수스파우팅'].includes(name)) automaticCondition = count(rule.label, entry.battle.hpPercent, 1, 100, value => setHpPercent(setEntry, value))
    else if (name === '하드프레스') automaticCondition = count(rule.label, targetEntry.battle.hpPercent, 1, 100, value => setHpPercent(setTargetEntry, value))
    else if (name === '애크러뱃') automaticCondition = auto(rule.label, classifyHeldItem(entry.key, entry.item).status === 'none' ? '×2' : '×1')
    else if ((name === '헤비봄버' || name === '히트스탬프') && row && targetRow) automaticCondition = auto(rule.label, userWeightMovePower(sourceWeight, targetWeight))
    else if (name === '일렉트릭볼') automaticCondition = auto(rule.label, electroBallPower(sourceSpeed ?? 0, targetSpeed ?? 0))
    else if (name === '자이로볼') automaticCondition = auto(rule.label, gyroBallPower(sourceSpeed ?? 0, targetSpeed ?? 0))
    else if (name === '솔라빔' || name === '솔라블레이드') automaticCondition = auto(rule.label, ['rain', 'sand', 'snow'].includes(conditions.weather) ? '×0.5' : '×1')
    else if (name === '대지의파동') automaticCondition = auto(rule.label, conditions.terrain !== 'none' && sourceGrounded ? '×2' : '×1')
    else if (name === '라이징볼트') automaticCondition = auto(rule.label, conditions.terrain === 'electric' && targetGrounded ? '×2' : '×1')
    else if (name === '와이드포스') automaticCondition = auto(rule.label, conditions.terrain === 'psychic' && sourceGrounded ? '×1.5' : '×1')
    else if (name === '미스트버스트') automaticCondition = auto(rule.label, conditions.terrain === 'misty' && sourceGrounded ? '×1.5' : '×1')
    else if (name === 'G의힘') automaticCondition = checkbox(rule.label, conditions.gravity, checked => setConditions(prev => ({ ...prev, gravity: checked })))
    else if (name === '변덕레이저') automaticCondition = checkbox(rule.label, entry.battle.randomDoublePower, checked => patchBattle(setEntry, { randomDoublePower: checked }))
    else if (name === '웨더볼') automaticCondition = auto('날씨', lt(({ none: '없음', sun: '쾌청', rain: '비', sand: '모래바람', snow: '싸라기눈' } as const)[conditions.weather]))
    else if (rule?.kind === 'count') automaticCondition = count(rule.label, Number(normalizeConditionalPowerValue(rule, conditions.moveValues[conditionKey] ?? rule.defaultValue)), rule.min ?? 0, rule.max ?? 999, setMoveValue)
    else if (rule) automaticCondition = checkbox(rule.label, Boolean(normalizeConditionalPowerValue(rule, conditions.moveValues[conditionKey] ?? rule.defaultValue)), setMoveValue)
    else if (['로우킥', '풀묶기', '안다리걸기', '안다리 걸기'].includes(name) && targetRow) automaticCondition = auto('자동 위력', weightBasedMovePower(targetWeight))
    const knockOff = name === '탁쳐서떨구기' ? classifyHeldItem(targetEntry.key, targetEntry.item).status === 'allowed' : null
    return <div className="quick-move-local-condition" role="group" aria-label={language === 'ko' ? `${name} 결정력 및 계산 조건` : language === 'ja' ? `${name}の火力指数と計算条件` : `${name} power index and calculation conditions`}>
      <span className="quick-move-condition-power"><span>{lt('결정력')}</span><strong>{decisionPower == null ? '—' : formatBattleIndex(decisionPower, language)}</strong></span>
      {automaticCondition}
      {hitOptions?.length ? hitOptions.length === 1 || skillLink
        ? <span className="quick-hit-count-static"><span>{skillLink ? moveControlCopy.skillLink : lt('타수')}</span><strong>{effectiveHits}</strong></span>
        : <span className="quick-hit-count" role="group" aria-label={lt('타수')}><span>{lt('타수')}</span><span className="quick-hit-count-options">{hitOptions.map(hit => <button key={hit} type="button" className="quick-hit-count-option" aria-label={`${lt('타수')} ${hit}`} aria-pressed={effectiveHits === hit} onClick={() => setHitCount(hit)}>{hit}</button>)}</span></span> : null}
      {knockOff !== null ? <span className="quick-move-auto-condition" title={`${moveControlCopy.auto} · ${moveControlCopy.targetItem}`}><span>{moveControlCopy.targetItem}</span><strong>{knockOff ? moveControlCopy.removable : moveControlCopy.absent}</strong></span> : null}
    </div>
  }
  const sideCard = () => {
    const pool = choicesForPool(pools[entry.key])
    const status = pools[entry.key]?.status ?? 'loading'
    const poolMap: Record<string, MovePoolState> = { [entry.key]: { status: 'ready', moves: pool } }
    const labels = { slot: language === 'ja' ? '番' : language === 'en' ? ' · Move' : lt('번'), category: (category: MoveCategory | null) => displayMoveCategoryName(category, language), power: lt('위력'), accuracy: lt('명중'), pp: 'PP', unknown: lt('미확인') }
    const commit = (index: number, option: MoveOption) => {
      setEntry(prev => ({ ...prev, moves: replaceQuickMove(prev.moves, index, option.name) }))
      if (entry.moves[index] !== option.name) {
        const prefix = `${side}:${index}:`
        setConditions(prev => ({ ...prev,
          moveHits: Object.fromEntries(Object.entries(prev.moveHits).filter(([key]) => !key.startsWith(prefix))),
          moveValues: Object.fromEntries(Object.entries(prev.moveValues).filter(([key]) => !key.startsWith(prefix))),
        }))
      }
      if (comparisonMode) markDirty(side, 'moves')
      setSelected({ side, index }); setActiveSlot(null)
      setDrafts(prev => ({ ...prev, [`${side}-${index}`]: '' }))
      if (index < 3 && !entry.moves[index + 1]) window.setTimeout(() => document.getElementById(`quick-${side}-move-${index + 1}`)?.focus(), 0)
    }
    const sideLabel = lt(comparisonMode ? side === 'attacker' ? '내 포켓몬' : '상대 포켓몬' : side === 'attacker' ? '포켓몬 1' : '포켓몬 2')
    const topMoveSuggestions = usageTopMovesForKey(entry.key).map(name => {
      const accepted = resolveEligibleMoveInput(name, pools[entry.key])
      const option = accepted ? pool.find(candidate => candidate.name === accepted) : undefined
      const existingIndex = entry.moves.indexOf(name)
      const emptyIndex = Array.from({ length: 4 }, (_, index) => entry.moves[index] ?? '').findIndex(move => !move)
      const targetIndex = existingIndex >= 0 ? existingIndex
        : activeSlot?.side === side ? activeSlot.index
          : emptyIndex >= 0 ? emptyIndex
            : selected.side === side ? selected.index : null
      const needsTarget = targetIndex === null
      const invalidReason = lt('스냅샷 후보만 새로 저장할 수 있습니다. 기존 값 유지.')
      const targetReason = language === 'ko' ? '교체할 기술 슬롯을 먼저 선택하세요.' : language === 'ja' ? '入れ替える技スロットを選択してください。' : 'Select a move slot to replace first.'
      const reason = !option ? invalidReason : needsTarget ? targetReason : undefined
      return { name, type: option?.type, selected: existingIndex >= 0, disabled: Boolean(reason), title: reason,
        ariaLabel: reason ? `${name} — ${reason}` : name, className: moveTypeThemeClass(option?.type),
        onSelect: () => { if (option && targetIndex !== null) commit(targetIndex, option) }, tooltipProps: tooltipForMove(name) }
    })
    return <section className="card entry-card quick-side-card" data-side={side} data-has-entry={Boolean(row)}>
      <div className="quick-side-identity">
        <strong>{sideLabel}</strong>
        {comparisonMode ? null : searchField}
        {row ? <>
        <PokemonCardHeading name={<strong>{displayName(row, language)}</strong>} sprite={row.sprite} spriteAlt={displayName(row, language)} types={row.types} />
        {row.key === 'aegislash' && entry.ability && !heldAbilityError(row.key, entry.ability, language) && row.abilities.includes(entry.ability) ? <div className="quick-form-controls">
          <div role="group" aria-label={language === 'ko' ? '실수치 폼' : language === 'ja' ? '実数値のフォルム' : 'Actual-stat form'}>
            <strong>{language === 'ko' ? '실수치 폼' : language === 'ja' ? '実数値のフォルム' : 'Actual-stat form'}</strong>
            {(['shield', 'blade'] as const).map(form => <button key={form} type="button" className="pick-chip" aria-pressed={(entry.actualForm ?? 'shield') === form} onClick={() => setEntry(prev => ({ ...prev, actualForm: form }))}>{form === 'shield' ? language === 'ko' ? '실드' : language === 'ja' ? 'シールド' : 'Shield' : language === 'ko' ? '블레이드' : language === 'ja' ? 'ブレード' : 'Blade'}</button>)}
          </div>
          <div role="group" aria-label={language === 'ko' ? '피격 폼' : language === 'ja' ? '被弾時フォルム' : 'Form when hit'}>
            <strong>{language === 'ko' ? '피격 폼' : language === 'ja' ? '被弾時フォルム' : 'Form when hit'}</strong>
            {(['shield', 'blade'] as const).map(form => <button key={form} type="button" className="pick-chip" aria-pressed={(entry.hitForm ?? 'shield') === form} onClick={() => setEntry(prev => ({ ...prev, hitForm: form }))}>{form === 'shield' ? language === 'ko' ? '실드' : language === 'ja' ? 'シールド' : 'Shield' : language === 'ko' ? '블레이드' : language === 'ja' ? 'ブレード' : 'Blade'}</button>)}
          </div>
          <small>{language === 'ko' ? `표시 실수치: ${entry.actualForm === 'blade' ? '블레이드' : '실드'} · 공격기 사용 시 블레이드 자동 · 피격 폼은 계산 조건(킹실드 후 실드 선택)` : language === 'ja' ? `表示実数値: ${entry.actualForm === 'blade' ? 'ブレード' : 'シールド'} · 攻撃技はブレード · 被弾時フォルムは計算条件` : `Shown stats: ${entry.actualForm === 'blade' ? 'Blade' : 'Shield'} · attacking moves use Blade · hit-time form is a calculation condition`}</small>
        </div> : null}
        </> : null}
      </div>
      {row ? <>
        {statCard(side, entry, row)}
        <MoveSlotsEditor className="quick-side-moves" label={lt('기술 배치')} ariaLabel={`${sideLabel} · ${lt('기술 배치')}`} labels={labels} ownerId={`quick-${side}-${entry.key}`} role="editable" selectedIndex={selected.side === side ? selected.index : null}
          toolbar={<>{learnsetStatusText(pools[entry.key], language) ? <small className="quick-source-badge" role="status">{learnsetStatusText(pools[entry.key], language)}</small> : null}
            {status === 'load-error' ? <button type="button" onClick={() => window.location.reload()}>{language === 'ko' ? '다시 시도 (새로고침)' : language === 'ja' ? '再読込' : 'Reload to retry'}</button> : null}
            {side === 'attacker' && comparisonMode && sharedMoveSpecies?.(entry.key) ? <small className="quick-source-badge">{sourceLabels.shared}</small> : null}</>}
          slots={Array.from({ length: 4 }, (_, index) => {
          const name = entry.moves[index] ?? ''
          const draftKey = `${side}-${index}`
          const draft = drafts[draftKey] ?? ''
          const options = filterMoveOptions(draft, pool).slice(0, 8)
          const meta = name ? resolveMoveMeta(name, pool, poolMap) : null
          const preview = calculate(side, name, index)
          const previewVerdict = quickKoVerdict(preview)
          const rangePresentation = preview ? damageRangePresentation(preview.damage, preview.targetHp, language) : null
          const noEffect = Boolean(preview && preview.effectiveness <= 0)
          const verdictLabel = noEffect ? lt('무효') : previewVerdict ? quickKoLabels[language][previewVerdict] : null
          const unavailableLabel = status === 'loading' || !moveMetaReady ? lt('기술/계산 메타 확인 중 · 미확인') : status === 'load-error' || status === 'missing' || getMoveMetadata(name)?.provenance.category !== 'legacy' ? lt('기술/계산 메타 미확인') : meta?.category === 'status' ? lt('변화기') : lt('계산 미지원')
          const resultLabel = rangePresentation?.label ?? unavailableLabel
          return { id: `${index}`, name: activeSlot?.side === side && activeSlot.index === index ? draft : name, occupied: Boolean(name), type: meta?.type, meta, className: moveTypeThemeClass(meta?.type),
              metaActions: renderMoveControls(name, index, preview?.decisionPower),
              children: recordedLearnsetText(name, pools[entry.key], language) ? <small role="status">{recordedLearnsetText(name, pools[entry.key], language)}</small> : null,
              tooltipProps: tooltipForMove(name),
              search: { id: `quick-${side}-move-${index}`, options: options.map(option => ({ key: option.name, label: option.name })), showAllOnEmpty: true,
                onSelect: option => { const found = options.find(move => move.name === option.key); if (found) commit(index, found) },
                optionClassName: option => moveTypeThemeClass(options.find(move => move.name === option.key)?.type),
                renderOption: option => <MoveCandidateRow name={option.label} type={options.find(move => move.name === option.key)?.type} meta={resolveMoveMeta(option.key, options, poolMap)} labels={labels} />,
                optionProps: option => tooltipForMove(option.key) },
              inputProps: { 'aria-label': `${sideLabel} ${index + 1} ${lt('기술')}`, placeholder: status === 'loading' ? lt('기술풀 불러오는 중…') : status === 'load-error' ? lt('기술풀을 불러오지 못했습니다.') : status === 'missing' ? lt('기술풀 미확인') : lt('사용 가능 기술 검색'), onFocus: () => { setActiveSlot({ side, index }); setDrafts(prev => ({ ...prev, [draftKey]: '' })) }, onChange: event => setDrafts(prev => ({ ...prev, [draftKey]: event.target.value })), onBlur: () => setActiveSlot(prev => prev?.side === side && prev.index === index ? null : prev) },
              preview: name ? <button type="button" className={`quick-move-preview${previewVerdict ? ` quick-ko-${previewVerdict}` : ''}`} aria-label={`${sideLabel} ${index + 1} ${lt('기술')} · ${name} · ${lt('계산 결과')} · ${resultLabel}${verdictLabel ? ` · ${verdictLabel}` : ''}`} aria-pressed={selected.side === side && selected.index === index} aria-live={selected.side === side && selected.index === index ? 'polite' : undefined} aria-atomic={selected.side === side && selected.index === index ? 'true' : undefined} onClick={() => setSelected({ side, index })}>{preview ? <><DamageRangeMeter damage={preview.damage} targetHp={preview.targetHp} language={language} compact />{noEffect ? <strong className="quick-effectiveness-immune">{verdictLabel}</strong> : previewVerdict ? <strong className="quick-ko-verdict">{verdictLabel}</strong> : null}</> : unavailableLabel}</button> : null
            }
        })} belowGrid={<MoveUsageSuggestions label={lt('사용률 상위 기술')} moves={topMoveSuggestions} />} />
      </> : <p className="muted">{lt('포켓몬을 선택하세요.')}</p>}
    </section>
  }

  const statCard = (side: 'attacker' | 'defender', entry: QuickSide, row: Row | undefined) => {
    const projectedRow = row ? battleFormRow(row, entry.ability, entry.actualForm ?? 'shield') : null
    const stats = projectedRow ? EFFORT_STAT_OPTIONS.map(stat => {
      return { key: stat.key, label: lt(stat.label), theme: statThemeClass(stat.key), value: quickStat(entry, projectedRow, stat.key), ev: entry.evs[stat.key], base: stat.key === 'speed' ? projectedRow.speed : undefined }
    }) : []

    return row ? <div className="quick-stat-card" key={side}><PokemonBuildFields key={`${side}-${entry.key}`} identity={`${side}-${entry.key}`} className="quick-build-fields"
          ability={entry.ability} abilityLabel={selectedAbilityDisplayName(row, entry.ability, language)} nature={entry.nature} item={entry.item}
          abilities={row.abilities.map(value => ({ value, label: localizedAbilityLabel(row, value, language, abilityDescriptionFor) }))}
          abilityError={heldAbilityError(row.key, entry.ability, language)}
          natures={SELECTABLE_NATURES.map(n => ({ value: n.id, label: natureLabel(n.id, language) }))}
          itemOptions={query => filterItemOptions(query, language, { fallbackToAll: false }).filter(value => isAllowedChampionsItem(row.key, value)).slice(0, 8).map(value => ({ value, label: itemAutocompletePrimaryLabel(value, language), secondary: itemAutocompleteSecondaryLabel(value, language), sprite: itemSpriteSrc(row.key, value) }))}
          onAbility={value => { setEntry(prev => ({ ...prev, ability: value, speedAbilityActive: false })); if (comparisonMode) markDirty(side, 'ability') }}
          onNature={value => { setEntry(prev => ({ ...prev, nature: value as NatureId, statNatureMultipliers: {}, speedNatureKnown: true, speedNatureOverride: null })); if (comparisonMode) markDirty(side, 'nature') }}
          onItem={value => { setEntry(prev => ({ ...prev, item: quickItem(value, megaStoneForKey(row.key), CHAMPIONS_ITEM_OPTIONS) })); if (comparisonMode) markDirty(side, 'item') }}
          labels={{ ability: lt('특성'), nature: side === 'defender' && comparisonMode && natureSourceStatus() ? natureSourceStatus() === sourceLabels.natureUnknown ? sourceLabels.natureUnknown : `${lt('성격')} · ${natureSourceStatus()}` : lt('성격'), item: lt('도구'), none: lt('미선택'), itemPlaceholder: lt('사용 가능 도구 선택'), fixed: lt('메가스톤 고정'), clear: lt('지우기') }}
          itemLabel={value => displayItemLabel(value, language)} itemSprite={value => itemSpriteSrc(row.key, value)} fixedItem={requiredMegaStone(row.key)} itemError={heldItemError(row.key, entry.item, language)} repairLabel={language === 'ko' ? `${requiredMegaStone(row.key)} 장착` : language === 'ja' ? `${requiredMegaStone(row.key)} を装備` : `Equip ${requiredMegaStone(row.key)}`} />
<QuickStatEditor side={side} identity={editorIdentity ?? `${side}-standalone-${entry.key}`} entry={entry} row={row} language={language} showPresets={!comparisonMode || side === 'defender'} setEntry={setEntry} onDirty={field => { if (comparisonMode) markDirty(side, field) }} stats={stats} /></div> : null
  }
  return sideCard()
}
