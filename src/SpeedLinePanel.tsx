import React from 'react'
import { buildSpeedComparison, buildSpeedScenario } from './speedLine'
import { calculateSpeedInvestment } from './speedLineInvestment'
import { searchPokemon } from './pokemonSearch'
import PokemonSearchField from './PokemonSearchField'
import { localizedChampionsItemLabel } from './championsItems'
import type { SpeedLineState } from './speedLineState'
import { PokemonCardHeading } from './PokemonCardOverview'
import { getJaName } from './jaLabels'
import { getSpeedAbility, speedAbilitiesFor } from './speedAbilities'
import type { SpeedAbilitySelection } from './speedLineState'
import type { Row, SiteLanguage } from './app/types'

type Props = {
  warnings?: readonly string[]
  rows: readonly Row[]
  state: SpeedLineState
  onChange: (state: SpeedLineState) => void
  language: SiteLanguage
  translate: (text: string) => string
  displayName: (row: Row) => string
}

const labels: Record<SiteLanguage, Record<string, string>> = {
  en: { reference: 'Reference Pokémon / form', none: 'No reference', refEffort: 'Reference effort points', refNature: 'Reference nature', listEffort: 'List effort points', listNature: 'List nature', referenceSpeed: 'Reference effective Speed', conditions: 'Comparison conditions', search: 'Search · name/form', forms: 'Mega forms', comparison: 'Relative Speed', all: 'All', faster: 'Reference faster', equal: 'Equal', slower: 'Reference slower', nonMega: 'Exclude Mega', mega: 'Mega only', boost: '+10%', neutral: 'Neutral', lower: '-10%', sort: 'Order', desc: 'Fastest first', asc: 'Slowest first', range: 'Speed range', around: 'Around reference (±10)', allRange: 'All speeds', jump: 'Jump to reference', share: 'Copy share link', fallback: 'Copy unavailable. Select this link to share:', reset: 'Reset filters', noResults: 'No results under these filters.', invalid: 'Enter an integer from 0 to 32.', base: 'Base Speed', actual: 'Actual Speed', difference: 'Speed difference', pokemon: 'Pokémon', count: 'Pokémon count', missing: 'Reference is not in the verified roster.', marker: 'Reference marker', notes: 'Level 50 · IV 31 · Champions effort points 0–32 before nature · excludes items, abilities, stages and field effects · ties ordered by key', clear: 'Clear reference' },
  ko: { reference: '기준 포켓몬/폼', none: '기준 없음', refEffort: '기준 노력 포인트', refNature: '기준 성격', listEffort: '목록 노력 포인트', listNature: '목록 성격', referenceSpeed: '기준 유효 스피드', conditions: '비교 조건', search: '검색 · 이름/폼', forms: '메가폼 포함', comparison: '기준 대비', all: '전체', faster: '내가 빠름', equal: '동속', slower: '내가 느림', nonMega: '메가폼 제외', mega: '메가폼만', boost: '성격 보정 +10%', neutral: '성격 보정 없음', lower: '성격 보정 -10%', sort: '정렬', desc: '빠른 순 → 느린 순', asc: '느린 순 → 빠른 순', range: '속도 범위', around: '기준 주변 (±10)', allRange: '전체 범위', jump: '기준선으로 이동', share: '공유 링크 복사', fallback: '복사할 수 없습니다. 아래 링크를 선택하세요:', reset: '필터 초기화', noResults: '이 조건에 맞는 결과가 없습니다.', invalid: '0부터 32까지 정수를 입력하세요.', base: '기본 스피드', actual: '실수치 스피드', difference: '기준과 차이', pokemon: '포켓몬', count: '포켓몬 수', missing: '기준 포켓몬이 확인된 목록에 없습니다.', marker: '기준선', notes: '레벨 50 · 개체값 31 · 챔피언스 노력 포인트 0~32를 성격 보정 전에 가산 · 도구/특성/랭크/필드 효과 제외 · 동속은 키순', clear: '기준 해제' },
  ja: { reference: '基準ポケモン/フォルム', none: '基準なし', refEffort: '基準の努力ポイント', refNature: '基準の性格', listEffort: '一覧の努力ポイント', listNature: '一覧の性格', referenceSpeed: '基準の有効素早さ', conditions: '比較条件', search: '検索 · 名前/フォルム', forms: 'メガシンカ', comparison: '基準との比較', all: 'すべて', faster: '基準が速い', equal: '同速', slower: '基準が遅い', nonMega: 'メガ除外', mega: 'メガのみ', boost: '+10%', neutral: '補正なし', lower: '-10%', sort: '並び順', desc: '速い順', asc: '遅い順', range: '素早さ範囲', around: '基準付近 (±10)', allRange: '全範囲', jump: '基準へ移動', share: '共有リンクをコピー', fallback: 'コピーできません。以下のリンクを選択してください:', reset: 'フィルターをリセット', noResults: '該当する結果がありません。', invalid: '0～32の整数を入力してください。', base: '種族値素早さ', actual: '実数値素早さ', difference: '基準との差', pokemon: 'ポケモン', count: 'ポケモン数', missing: '基準ポケモンは図鑑にありません。', marker: '基準線', notes: 'レベル50 · 個体値31 · 努力ポイント0～32（性格補正前）· 道具/特性/ランク/場の効果なし · 同速はキー順', clear: '基準解除' },
}

export default function SpeedLinePanel({ rows, state, onChange, language, translate, displayName, warnings = [] }: Props) {
  const extra = {
    en: { searchReference: 'Reference Pokémon search', items: 'Item scenarios', both: 'Normal + Choice Scarf', normal: 'Normal only', scarf: 'Choice Scarf only', normalBadge: 'Normal', hypothetical: 'This item combination is not verified as usable in battle', investment: 'Investment against selected target', selectTarget: 'See effort needed to pass this opponent', targetMissing: 'Unknown target', targetNone: 'Select a row to calculate investment.', targetSpeed: 'Target effective Speed', tie: 'Minimum effort for exact tie', pass: 'Minimum effort to pass', noTie: 'No exact tie', noPass: 'Cannot pass even at 32 points', maximum: 'Maximum effective Speed', current: 'Current effective Speed', already: 'Already ahead', extra: 'Additional effort from current setting', previous: 'Effective Speed at previous effort', noSearch: 'No matching Pokémon.', stage: 'Reference Speed stage', effective: 'Effective Speed', actualReference: 'Actual Speed', extraOptions: 'Additional options', showHypothetical: 'Show item combinations not verified for battle', detail: 'Effort needed to pass selected opponent', actualCurrent: 'Current actual Speed', actualMaximum: 'Maximum actual Speed' },
    ko: { searchReference: '기준 포켓몬 검색', items: '도구 조건', both: '일반+스카프', normal: '일반만', scarf: '스카프만', normalBadge: '일반', hypothetical: '이 도구 조합은 실전 사용 가능 여부가 확인되지 않음', investment: '상대 추월에 필요한 투자', selectTarget: '이 상대를 추월할 투자 보기', targetMissing: '미확인 상대', targetNone: '상대 이름을 눌러 필요한 노력을 확인하세요.', targetSpeed: '상대 유효 스피드', tie: '정확한 동속 최소 노력', pass: '추월 최소 노력', noTie: '정확한 동속 없음', noPass: '32포인트로도 추월 불가', maximum: '최대 유효 스피드', current: '현재 유효 스피드', already: '이미 추월', extra: '현재 설정 대비 추가 투자량', previous: '직전 노력의 유효 스피드', noSearch: '검색 결과가 없습니다.', stage: '기준 스피드 랭크', effective: '유효 스피드', actualReference: '실수치', extraOptions: '추가 옵션', showHypothetical: '실전에서 불가능한 조합도 보기', detail: '선택한 상대 추월에 필요한 투자', actualCurrent: '현재 실수치', actualMaximum: '최대 실수치' },
    ja: { searchReference: '基準ポケモン検索', items: '持ち物条件', both: '通常+スカーフ', normal: '通常のみ', scarf: 'スカーフのみ', normalBadge: '通常', hypothetical: 'この持ち物の組み合わせは実戦での使用が未確認', investment: '選択相手への最小投資', selectTarget: 'この相手を追い越す努力を見る', targetMissing: '不明な相手', targetNone: '相手の名前を選んでください。', targetSpeed: '相手の有効素早さ', tie: '同速の最小ポイント', pass: '追い越す最小ポイント', noTie: '正確な同速なし', noPass: '32ポイントでも追い越せません', maximum: '最大有効素早さ', current: '現在の有効素早さ', already: '既に速い', extra: '現設定からの追加ポイント', previous: '直前の有効素早さ', noSearch: '検索結果なし', stage: '基準の素早さランク', effective: '有効素早さ', actualReference: '実数値', extraOptions: '追加オプション', showHypothetical: '実戦で使えない組み合わせも表示', detail: '選択相手を追い越す努力', actualCurrent: '現在の実数値', actualMaximum: '最大実数値' },
  }
  const overrides = {
    en: { base: 'Base Speed', actual: 'Actual → effective Speed', count: 'Forms · condition rows', search: 'Comparison list search · name/form', notes: 'Level 50 · IV 31 · Champions effort points 0–32 before nature · reference Speed stage, Choice Scarf and conditional abilities; no automatic field/status simulation · ties ordered by key' },
    ko: { base: '스피드 종족값', actual: '실수치 → 유효 스피드', count: '폼 · 조건행', search: '비교 목록 검색 · 이름/폼', notes: '레벨 50 · 개체값 31 · 챔피언스 노력 포인트 0~32 · 기준 스피드 랭크·구애스카프·조건부 특성 반영 · 날씨/필드/상태 자동 판정 없음 · 동속은 키순' },
    ja: { base: '素早さ種族値', actual: '実数値 → 有効素早さ', count: 'フォルム · 条件行', search: '比較一覧検索 · 名前/フォルム', notes: 'レベル50 · 個体値31 · 努力ポイント0～32 · 基準のランク・スカーフ・条件付き特性を反映 · 天候/状態の自動判定なし · 同速はキー順' },
  }
  const abilityText = {
    ko: { mode: '특성 발동 시 속도 포함', conditions: '특성 발동 시 속도 포함', off: '일반·스카프만', reference: '기준 특성', noAbility: '특성 없음', separate: '각 특성 행은 별도 조건을 가정합니다. 모든 특성이 항상 또는 동시에 발동하는 것은 아닙니다. 날씨·필드·상태·도구 소비를 자동 판정하지 않습니다.', unavailable: '선택한 특성이 이 폼에 없습니다', 'ability-not-available': '선택한 특성이 이 폼에 없습니다', 'item-required-for-mega': '메가진화에 필요한 도구와 구애스카프를 동시에 지닐 수 없습니다', 'unburden-has-item': '곡예 발동 중에는 도구를 지니지 않으므로 구애스카프와 병용할 수 없습니다', 'z-mega-scarf': 'Z메가폼은 구애스카프를 지닐 수 없습니다' },
    en: { mode: 'Conditional ability Speed', conditions: 'Include active abilities', off: 'Normal and Scarf only', reference: 'Reference ability', noAbility: 'No active ability', separate: 'Each ability row is a separate conditional scenario, not an always-on or simultaneous effect. Weather, terrain, status, and item loss are not automatically detected.', unavailable: 'Selected ability is unavailable on this form', 'ability-not-available': 'Selected ability is unavailable on this form', 'item-required-for-mega': 'Mega item and Choice Scarf cannot both be held', 'unburden-has-item': 'Unburden requires no held item; it cannot combine with Choice Scarf', 'z-mega-scarf': 'Z-Mega forms cannot hold Choice Scarf' },
    ja: { mode: '特性発動時の素早さ', conditions: '発動時の特性を含む', off: '通常・スカーフのみ', reference: '基準の特性', noAbility: '特性なし', separate: '各特性行は個別の条件です。同時・常時発動ではなく、天候・フィールド・状態・道具消費は自動判定しません。', unavailable: '選択した特性はこのフォルムにありません', 'ability-not-available': '選択した特性はこのフォルムにありません', 'item-required-for-mega': 'メガシンカ用の道具とスカーフは同時に持てません', 'unburden-has-item': 'かるわざ発動中は道具を持たないためスカーフと併用できません', 'z-mega-scarf': 'Zメガフォルムはスカーフを持てません' },
  }[language]
  const abilityLabel = (slug: SpeedAbilitySelection) => { const ability = getSpeedAbility(slug); return ability ? `${ability[language === 'ko' ? 'labelKo' : language === 'ja' ? 'labelJa' : 'labelEn']} (${ability[language === 'ko' ? 'conditionKo' : language === 'ja' ? 'conditionJa' : 'conditionEn']})` : slug ?? '' }
  const l = (key: string): string => key === 'around' ? labels[language][key].replace('±10', `±${state.gap}`) : extra[language][key as keyof typeof extra.en] ?? overrides[language][key as keyof typeof overrides.en] ?? labels[language][key] ?? key
  const [referenceDraft, setReferenceDraft] = React.useState(String(state.referenceEffort))
  const [listDraft, setListDraft] = React.useState(String(state.listEffort))
  const [searchDraft, setSearchDraft] = React.useState('')
  const [copyFailed, setCopyFailed] = React.useState(false)
  const [showHypothetical, setShowHypothetical] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(Boolean(state.targetKey))
  const detailRef = React.useRef<HTMLDetailsElement>(null)
  const referenceStage = state.referenceStage ?? 0
  const markerRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => setReferenceDraft(String(state.referenceEffort)), [state.referenceEffort])
  React.useEffect(() => setListDraft(String(state.listEffort)), [state.listEffort])
  const valid = (draft: string) => /^(?:[0-9]|[12][0-9]|3[012])$/.test(draft)
  const draftsValid = valid(referenceDraft) && valid(listDraft)
  const update = (patch: Partial<SpeedLineState>) => onChange({ ...state, ...patch })
  const effort = (field: 'referenceEffort' | 'listEffort', draft: string) => {
    if (field === 'referenceEffort') setReferenceDraft(draft)
    else setListDraft(draft)
    if (valid(draft)) update({ [field]: Number(draft) })
  }
  const roster = React.useMemo(() => rows.map(row => ({ ...row, name_ja: row.name_ja || getJaName(row.key, row.name_ko, row.name_en) })), [rows])
  const suggestions = React.useMemo(() => searchDraft.trim() ? searchPokemon(roster, searchDraft, { includeMega: true, limit: 12 }).map(row => ({ key: row.key, label: `${displayName(row)} (${row.name_en})`, sprite: row.sprite })) : [], [roster, searchDraft, displayName])
  const result = draftsValid ? buildSpeedComparison(roster, state.referenceKey ? state : { ...state, comparison: 'all', rangeMode: 'all' }) : null
  const reference = result?.reference ?? null
  const referenceRow = state.referenceKey ? roster.find(row => row.key === state.referenceKey) : undefined
  const referenceUnavailable = result?.referenceUnavailableReason ?? null
  const unknownReference = state.referenceKey && !roster.some(row => row.key === state.referenceKey)
    ? `${language === 'ko' ? '미확인 기준' : language === 'ja' ? '不明な基準' : 'Unknown reference'}: ${state.referenceKey}` : null
  const referenceSpeed = reference?.effectiveSpeed ?? null
  const entries = (result?.entries ?? []).filter(entry => showHypothetical || !entry.hypothetical)
  const selectedRow = state.targetKey ? roster.find(row => row.key === state.targetKey) : undefined
  const selectedTarget = draftsValid && selectedRow ? buildSpeedScenario(selectedRow, state.listEffort, state.listNature, state.targetItem, referenceSpeed, state.targetAbility ?? null) : null
  const targetUnavailable = selectedTarget?.unavailableReason ?? null
  const targetNeedsOptIn = selectedTarget?.hypothetical && !targetUnavailable && !showHypothetical
  const investment = draftsValid && reference && !referenceUnavailable && selectedTarget && !targetUnavailable && !targetNeedsOptIn ? calculateSpeedInvestment(reference.row, state.referenceNature, state.referenceEffort, selectedTarget, referenceStage, state.referenceAbility ?? null) : null
  const itemLabel = (variant: 'normal' | 'scarf') => variant === 'scarf' ? localizedChampionsItemLabel('こだわりスカーフ', language) : l('normalBadge')
  const markerAt = reference && entries.length ? (state.sort === 'asc'
    ? entries.findIndex(entry => entry.effectiveSpeed >= reference.effectiveSpeed)
    : entries.findIndex(entry => entry.effectiveSpeed <= reference.effectiveSpeed)) : -1
  const markerIndex = markerAt < 0 ? entries.length : markerAt
  const referenceMarker = reference ? <div ref={markerRef} tabIndex={-1} className="speed-line-row speed-line-reference-marker" role="row" aria-label={`${l('marker')}: ${displayName(reference.row)} ${reference.effectiveSpeed}${state.referenceAbility ? ` · ${abilityLabel(state.referenceAbility)}` : ''}`}>
    <span role="cell">◆</span><span role="cell">{l('marker')} · {displayName(reference.row)} <small>{l('refEffort')} {state.referenceEffort} · {l('stage')} {referenceStage > 0 ? '+' : ''}{referenceStage}{state.referenceAbility ? ` · ${abilityLabel(state.referenceAbility)}` : ''}</small></span><span role="cell">{reference.row.speed}</span><strong role="cell">{reference.actualSpeed} → {reference.effectiveSpeed}</strong><span role="cell">—</span>
  </div> : null
  const select = (label: string, value: string, choices: [string, string][], change: (value: string) => void, disabled = false) => <label>{label}<select value={value} onChange={e => change(e.target.value)} disabled={disabled}>{choices.map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></label>
  const numeric = (label: string, field: 'referenceEffort' | 'listEffort', draft: string) => <label>{label}<input type="number" min="0" max="32" step="1" value={draft} aria-invalid={!valid(draft)} aria-describedby={!valid(draft) ? `${field}-error` : undefined} onChange={e => effort(field, e.target.value)} />{!valid(draft) ? <small role="alert" id={`${field}-error`}>{l('invalid')}</small> : null}</label>
  const jump = () => {
    markerRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })
    markerRef.current?.focus({ preventScroll: true })
    requestAnimationFrame(() => requestAnimationFrame(() => markerRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })))
  }
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopyFailed(false) }
    catch { setCopyFailed(true) }
  }
  return <section className="panel wide speed-line-panel">
    <div className="section-head"><div><h2>{translate('실능 스피드라인')}</h2><p className="muted">{l('notes')}</p></div></div>
    {warnings.length ? <p role="alert">{language === 'ko' ? 'URL의 잘못된 값을 기본값으로 복원했습니다' : language === 'ja' ? 'URLの不正な値を既定値に戻しました' : 'Invalid URL values were restored to defaults'}: {warnings.join(', ')}</p> : null}
    <div className="speed-line-reference card entry-card">
      <PokemonCardHeading name={<strong>{referenceRow ? displayName(referenceRow) : unknownReference ?? l('none')}</strong>} sprite={referenceRow?.sprite} spriteAlt={referenceRow ? displayName(referenceRow) : ''} types={referenceRow?.types} />
      <div className="speed-line-controls">
        <PokemonSearchField id="speed-line-reference-search" label={l('searchReference')} placeholder={l('reference')} value={searchDraft} onChange={setSearchDraft} disabled={!draftsValid} onSelect={key => { update({ referenceKey: key, referenceAbility: null }); setSearchDraft('') }} options={suggestions} noResults={l('noSearch')} showEmpty />
        {numeric(l('refEffort'), 'referenceEffort', referenceDraft)}
        {select(l('refNature'), state.referenceNature, ['boost', 'neutral', 'lower'].map(key => [key, l(key)]), value => update({ referenceNature: value as SpeedLineState['referenceNature'] }))}
        {select(l('stage'), String(referenceStage), Array.from({ length: 13 }, (_, index) => index - 6).map(stage => [String(stage), stage > 0 ? `+${stage}` : String(stage)]), value => update({ referenceStage: Number(value) }))}
        {select(abilityText.reference, state.referenceAbility ?? '', [['', abilityText.noAbility], ...speedAbilitiesFor(referenceRow ?? {}).map(ability => [ability.slug, abilityLabel(ability.slug)] as [string, string]), ...(state.referenceAbility && !speedAbilitiesFor(referenceRow ?? {}).some(ability => ability.slug === state.referenceAbility) ? [[state.referenceAbility, `${state.referenceAbility} · ${abilityText.unavailable}`] as [string, string]] : [])], value => update({ referenceAbility: value || null }), !referenceRow)}
      </div>
      <div className="speed-line-reference-stat"><span>{l('actualReference')} <strong>{draftsValid ? reference?.actualSpeed ?? '—' : '—'}</strong></span><span>{l('effective')} <strong>{draftsValid ? referenceSpeed ?? '—' : '—'}</strong></span></div>
      {result?.referenceMissing ? <p role="alert">{l('missing')}</p> : null}
      {referenceUnavailable ? <p role="alert">{abilityText[referenceUnavailable]}: {state.referenceAbility || '""'}</p> : null}
      <div className="speed-line-actions"><button type="button" disabled={!reference || !draftsValid} onClick={jump}>{l('jump')}</button><button type="button" onClick={() => { update({ referenceKey: null, referenceAbility: null, comparison: 'all', rangeMode: 'all' }); setSearchDraft('') }}>{l('clear')}</button><button type="button" disabled={!draftsValid} onClick={share}>{l('share')}</button></div>
      {copyFailed ? <label>{l('fallback')}<input readOnly onFocus={e => e.currentTarget.select()} value={typeof window !== 'undefined' ? window.location.href : ''} /></label> : null}
    </div>
    <div className="speed-line-controls">
      <label>{l('search')}<input type="search" value={state.query} onChange={e => update({ query: e.target.value })} /></label>
      {numeric(l('listEffort'), 'listEffort', listDraft)}
      {select(l('listNature'), state.listNature, ['boost', 'neutral', 'lower'].map(key => [key, l(key)]), value => update({ listNature: value as SpeedLineState['listNature'] }))}
      {select(l('items'), state.items, [['both', l('both')], ['normal', l('normal')], ['scarf', l('scarf')]], value => update({ items: value as SpeedLineState['items'] }))}
      {select(abilityText.mode, state.abilityMode ?? 'off', [['conditions', abilityText.conditions], ['off', abilityText.off]], value => update({ abilityMode: value as SpeedLineState['abilityMode'] }))}
      {select(l('forms'), state.forms, ['all', 'nonMega', 'mega'].map(key => [key, l(key)]), value => update({ forms: value as SpeedLineState['forms'] }))}
      {select(l('comparison'), state.comparison, ['all', 'faster', 'equal', 'slower'].map(key => [key, l(key)]), value => update({ comparison: value as SpeedLineState['comparison'] }), !reference)}
      {select(l('sort'), state.sort, ['desc', 'asc'].map(key => [key, l(key)]), value => update({ sort: value as SpeedLineState['sort'] }))}
      {select(l('range'), state.rangeMode, [['all', l('allRange')], ['around', l('around')]], value => update({ rangeMode: value as SpeedLineState['rangeMode'], gap: 10 }), !reference)}
    </div>
    {draftsValid ? <div className="speed-line-condition-summary" role="status"><strong>{l('conditions')}</strong>: {l('referenceSpeed')} {referenceSpeed ?? '—'} ({l('actualReference')} {reference?.actualSpeed ?? '—'} · {l('stage')} {referenceStage > 0 ? '+' : ''}{referenceStage}{state.referenceAbility ? ` · ${abilityLabel(state.referenceAbility)}` : ''}) · {l('refEffort')} {state.referenceEffort} {l(state.referenceNature)} · {l('listEffort')} {state.listEffort} {l(state.listNature)} · {l('items')}: {l(state.items)} · {abilityText[state.abilityMode ?? 'off']} · {l(state.forms)} · {l(state.comparison)} · {l(state.sort)} · {state.rangeMode === 'around' ? l('around') : l('allRange')}</div> : null}
    <p className="muted speed-line-ability-note">{abilityText.separate}</p>
    <details className="speed-line-additional"><summary>{l('extraOptions')}</summary><label><input type="checkbox" checked={showHypothetical} onChange={event => setShowHypothetical(event.target.checked)} /> {l('showHypothetical')}</label></details>
    {!draftsValid ? <p role="alert">{l('invalid')}</p> : <><p className="muted">{l('count')}: {new Set(entries.map(entry => entry.row.key)).size} · {entries.length}</p>
      {entries.length ? <div className="speed-line-list" role="table" aria-label={language === 'en' ? 'Actual Speed Line' : '실능 스피드라인'}>
        <div className="speed-line-row speed-line-heading" role="row"><span role="columnheader">#</span><span role="columnheader">{l('pokemon')}</span><span role="columnheader">{l('base')}</span><span role="columnheader">{l('actual')}</span><span role="columnheader">{l('difference')}</span></div>
        {entries.map((entry, idx) => <React.Fragment key={entry.id}>
          {idx === markerIndex ? referenceMarker : null}
          <div className="speed-line-row" role="row" data-key={entry.row.key} data-variant={entry.variant} data-ability={entry.abilitySlug ?? ''} data-scenario-id={entry.id}>
            <span role="cell">{idx + 1}</span><span role="cell" className="speed-line-species">{entry.row.sprite ? <img src={entry.row.sprite} alt="" loading="lazy" /> : null}<span><button className="speed-line-name-action" type="button" aria-label={`${l('selectTarget')}: ${displayName(entry.row)} ${itemLabel(entry.variant)}${entry.abilitySlug ? ` ${abilityLabel(entry.abilitySlug)}` : ''}`} aria-pressed={state.targetKey === entry.row.key && state.targetItem === entry.variant && (state.targetAbility ?? null) === entry.abilitySlug} onClick={() => { update({ targetKey: entry.row.key, targetItem: entry.variant, targetAbility: entry.abilitySlug }); setDetailOpen(true); if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => detailRef.current?.scrollIntoView({ block: 'nearest' })) }}>{displayName(entry.row)}</button><small>{entry.row.name_en}</small><small className="speed-line-item-badge">{itemLabel(entry.variant)}{entry.abilitySlug ? ` · ${abilityLabel(entry.abilitySlug)}` : ''} {entry.hypothetical ? <em className="speed-line-hypothetical">{l('hypothetical')}</em> : null}</small></span></span><span role="cell">{entry.row.speed}</span><strong role="cell">{entry.actualSpeed} → {entry.effectiveSpeed}</strong><span role="cell">{entry.difference === null ? '—' : `${entry.difference > 0 ? '+' : ''}${entry.difference} · ${l(entry.relation!)}`}</span>
          </div>
        </React.Fragment>)}
        {markerIndex === entries.length ? referenceMarker : null}
      </div> : <div className="speed-line-empty"><p>{l('noResults')}</p><button type="button" onClick={() => update({ query: '', forms: 'all', comparison: 'all', rangeMode: 'all' })}>{l('reset')}</button>{referenceMarker}</div>}
    </>}
    <details ref={detailRef} className="speed-line-investment card" aria-label={l('investment')} open={detailOpen} onToggle={event => setDetailOpen(event.currentTarget.open)}><summary>{l('investment')}{selectedTarget ? ` · ${displayName(selectedTarget.row)} · ${itemLabel(selectedTarget.variant)}${state.targetAbility ? ` · ${abilityLabel(state.targetAbility)}` : ''}` : state.targetKey ? ` · ${state.targetKey}` : ''}</summary>
      {!draftsValid ? <p role="alert">{l('invalid')}</p> : state.targetKey && !selectedRow ? <p role="alert">{l('targetMissing')}: {state.targetKey}</p> : selectedTarget ? <><p><strong>{displayName(selectedTarget.row)}</strong> · {itemLabel(selectedTarget.variant)}{state.targetAbility ? ` · ${abilityLabel(state.targetAbility)}` : ''} {selectedTarget.hypothetical && !targetUnavailable ? <em className="speed-line-hypothetical">{l('hypothetical')}</em> : null} · {l('listEffort')} {state.listEffort} · {l(state.listNature)}</p>{targetUnavailable ? <p role="alert">{abilityText[targetUnavailable]}</p> : targetNeedsOptIn ? <p role="alert">{l('hypothetical')}. {l('extraOptions')} → {l('showHypothetical')}.</p> : <><p>{l('actualReference')} {selectedTarget.actualSpeed} → {l('targetSpeed')}: <strong>{selectedTarget.effectiveSpeed}</strong></p>{investment && reference ? <><p>{l('actualCurrent')}: {investment.currentActualSpeed} · {l('current')}: {investment.currentSpeed}{investment.alreadyAhead ? ` · ${l('already')}` : ''}</p>{referenceStage !== 0 || state.referenceAbility ? <p>{l('actualMaximum')}: {investment.maxActualSpeed} · {l('maximum')}: {investment.maxSpeed}</p> : null}<p>{l('tie')}: {investment.tieEffort === null ? l('noTie') : `${investment.tieEffort} → ${investment.tieSpeed}`}</p><p>{l('pass')}: {investment.passEffort === null ? `${l('noPass')}${referenceStage === 0 && !state.referenceAbility ? ` · ${l('maximum')} ${investment.maxSpeed}` : ''}` : `${investment.passEffort} → ${investment.passSpeed}`}</p><p>{l('extra')}: {investment.additionalEffort === null ? '—' : investment.additionalEffort}{investment.previousPassSpeed !== null ? ` · ${l('previous')}: ${investment.previousPassSpeed}` : ''}</p></> : <p>{referenceUnavailable ? abilityText[referenceUnavailable] : reference ? l('invalid') : l('none')}</p>}</>}</> : <p>{l('targetNone')}</p>}
    </details>
  </section>
}
