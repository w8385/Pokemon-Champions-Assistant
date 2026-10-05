import React from 'react'
import { buildSpeedComparison } from './speedLine'
import type { SpeedLineState } from './speedLineState'
import { PokemonCardHeading } from './PokemonCardOverview'
import { getJaName } from './jaLabels'
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
  en: { reference: 'Reference Pokémon / form', none: 'No reference', refEffort: 'Reference effort points', refNature: 'Reference nature', listEffort: 'List effort points', listNature: 'List nature', referenceSpeed: 'Reference Speed', conditions: 'Comparison conditions', search: 'Search · name/form', forms: 'Mega forms', comparison: 'Relative Speed', all: 'All', faster: 'Reference faster', equal: 'Equal', slower: 'Reference slower', nonMega: 'Exclude Mega', mega: 'Mega only', boost: '+10%', neutral: 'Neutral', lower: '-10%', sort: 'Order', desc: 'Fastest first', asc: 'Slowest first', range: 'Speed range', around: 'Around reference (±10)', allRange: 'All speeds', jump: 'Jump to reference', share: 'Copy share link', fallback: 'Copy unavailable. Select this link to share:', reset: 'Reset filters', noResults: 'No results under these filters.', invalid: 'Enter an integer from 0 to 32.', base: 'Base Speed', actual: 'Actual Speed', difference: 'Speed difference', pokemon: 'Pokémon', count: 'Pokémon count', missing: 'Reference is not in the verified roster.', marker: 'Reference marker', notes: 'Level 50 · IV 31 · Champions effort points 0–32 before nature · excludes items, abilities, stages and field effects · ties ordered by key', clear: 'Clear reference' },
  ko: { reference: '기준 포켓몬/폼', none: '기준 없음', refEffort: '기준 노력 포인트', refNature: '기준 성격', listEffort: '목록 노력 포인트', listNature: '목록 성격', referenceSpeed: '기준 실수치 스피드', conditions: '비교 조건', search: '검색 · 이름/폼', forms: '메가폼 포함', comparison: '기준 대비', all: '전체', faster: '내가 빠름', equal: '동속', slower: '내가 느림', nonMega: '메가폼 제외', mega: '메가폼만', boost: '성격 보정 +10%', neutral: '성격 보정 없음', lower: '성격 보정 -10%', sort: '정렬', desc: '빠른 순 → 느린 순', asc: '느린 순 → 빠른 순', range: '속도 범위', around: '기준 주변 (±10)', allRange: '전체 범위', jump: '기준선으로 이동', share: '공유 링크 복사', fallback: '복사할 수 없습니다. 아래 링크를 선택하세요:', reset: '필터 초기화', noResults: '이 조건에 맞는 결과가 없습니다.', invalid: '0부터 32까지 정수를 입력하세요.', base: '기본 스피드', actual: '실수치 스피드', difference: '기준과 차이', pokemon: '포켓몬', count: '포켓몬 수', missing: '기준 포켓몬이 확인된 목록에 없습니다.', marker: '기준선', notes: '레벨 50 · 개체값 31 · 챔피언스 노력 포인트 0~32를 성격 보정 전에 가산 · 도구/특성/랭크/필드 효과 제외 · 동속은 키순', clear: '기준 해제' },
  ja: { reference: '基準ポケモン/フォルム', none: '基準なし', refEffort: '基準の努力ポイント', refNature: '基準の性格', listEffort: '一覧の努力ポイント', listNature: '一覧の性格', referenceSpeed: '基準の実数値素早さ', conditions: '比較条件', search: '検索 · 名前/フォルム', forms: 'メガシンカ', comparison: '基準との比較', all: 'すべて', faster: '基準が速い', equal: '同速', slower: '基準が遅い', nonMega: 'メガ除外', mega: 'メガのみ', boost: '+10%', neutral: '補正なし', lower: '-10%', sort: '並び順', desc: '速い順', asc: '遅い順', range: '素早さ範囲', around: '基準付近 (±10)', allRange: '全範囲', jump: '基準へ移動', share: '共有リンクをコピー', fallback: 'コピーできません。以下のリンクを選択してください:', reset: 'フィルターをリセット', noResults: '該当する結果がありません。', invalid: '0～32の整数を入力してください。', base: '種族値素早さ', actual: '実数値素早さ', difference: '基準との差', pokemon: 'ポケモン', count: 'ポケモン数', missing: '基準ポケモンは図鑑にありません。', marker: '基準線', notes: 'レベル50 · 個体値31 · 努力ポイント0～32（性格補正前）· 道具/特性/ランク/場の効果なし · 同速はキー順', clear: '基準解除' },
}

export default function SpeedLinePanel({ rows, state, onChange, language, translate, displayName, warnings = [] }: Props) {
  const l = (key: string) => key === 'around' ? labels[language][key].replace('±10', `±${state.gap}`) : labels[language][key]
  const [referenceDraft, setReferenceDraft] = React.useState(String(state.referenceEffort))
  const [listDraft, setListDraft] = React.useState(String(state.listEffort))
  const [copyFailed, setCopyFailed] = React.useState(false)
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
  const result = draftsValid ? buildSpeedComparison(roster, state.referenceKey ? state : { ...state, comparison: 'all', rangeMode: 'all' }) : null
  const reference = result?.reference ?? null
  const unknownReference = state.referenceKey && !roster.some(row => row.key === state.referenceKey)
    ? `${language === 'ko' ? '미확인 기준' : language === 'ja' ? '不明な基準' : 'Unknown reference'}: ${state.referenceKey}` : null
  const referenceSpeed = reference?.speed ?? null
  const entries = result?.entries ?? []
  const markerAt = reference && entries.length ? (state.sort === 'asc'
    ? entries.findIndex(entry => entry.speed >= reference.speed)
    : entries.findIndex(entry => entry.speed <= reference.speed)) : -1
  const markerIndex = markerAt < 0 ? entries.length : markerAt
  const referenceMarker = reference ? <div ref={markerRef} tabIndex={-1} className="speed-line-row speed-line-reference-marker" role="row" aria-label={`${l('marker')}: ${displayName(reference.row)} ${reference.speed}`}>
    <span role="cell">◆</span><span role="cell">{l('marker')} · {displayName(reference.row)} <small>{l('refEffort')} {state.referenceEffort} · {l(state.referenceNature)}</small></span><span role="cell">{reference.row.speed}</span><strong role="cell">{reference.speed}</strong><span role="cell">—</span>
  </div> : null
  const select = (label: string, value: string, choices: [string, string][], change: (value: string) => void, disabled = false) => <label>{label}<select value={value} onChange={e => change(e.target.value)} disabled={disabled}>{choices.map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></label>
  const numeric = (label: string, field: 'referenceEffort' | 'listEffort', draft: string) => <label>{label}<input type="number" min="0" max="32" step="1" value={draft} aria-invalid={!valid(draft)} aria-describedby={!valid(draft) ? `${field}-error` : undefined} onChange={e => effort(field, e.target.value)} />{!valid(draft) ? <small role="alert" id={`${field}-error`}>{l('invalid')}</small> : null}</label>
  const jump = () => { markerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); markerRef.current?.focus({ preventScroll: true }) }
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopyFailed(false) }
    catch { setCopyFailed(true) }
  }
  return <section className="panel wide speed-line-panel">
    <div className="section-head"><div><h2>{translate('실능 스피드라인')}</h2><p className="muted">{l('notes')}</p></div></div>
    {warnings.length ? <p role="alert">{language === 'ko' ? 'URL의 잘못된 값을 기본값으로 복원했습니다' : language === 'ja' ? 'URLの不正な値を既定値に戻しました' : 'Invalid URL values were restored to defaults'}: {warnings.join(', ')}</p> : null}
    <div className="speed-line-reference card entry-card">
      <PokemonCardHeading name={<strong>{reference ? displayName(reference.row) : unknownReference ?? l('none')}</strong>} sprite={reference?.row.sprite} spriteAlt={reference ? displayName(reference.row) : ''} types={reference?.row.types} />
      <div className="speed-line-controls">
        {select(l('reference'), state.referenceKey ?? '', [['', l('none')], ...(unknownReference ? [[state.referenceKey!, unknownReference] as [string, string]] : []), ...roster.map(row => [row.key, displayName(row)] as [string, string])], value => update({ referenceKey: value || null }))}
        {numeric(l('refEffort'), 'referenceEffort', referenceDraft)}
        {select(l('refNature'), state.referenceNature, ['boost', 'neutral', 'lower'].map(key => [key, l(key)]), value => update({ referenceNature: value as SpeedLineState['referenceNature'] }))}
      </div>
      <div className="speed-line-reference-stat"><span>{l('referenceSpeed')}</span><strong>{draftsValid ? referenceSpeed ?? '—' : '—'}</strong></div>
      {result?.referenceMissing ? <p role="alert">{l('missing')}</p> : null}
      <div className="speed-line-actions"><button type="button" disabled={!reference || !draftsValid} onClick={jump}>{l('jump')}</button><button type="button" onClick={() => update({ referenceKey: null, comparison: 'all', rangeMode: 'all' })}>{l('clear')}</button><button type="button" disabled={!draftsValid} onClick={share}>{l('share')}</button></div>
      {copyFailed ? <label>{l('fallback')}<input readOnly onFocus={e => e.currentTarget.select()} value={typeof window !== 'undefined' ? window.location.href : ''} /></label> : null}
    </div>
    <div className="speed-line-controls">
      <label>{l('search')}<input type="search" value={state.query} onChange={e => update({ query: e.target.value })} /></label>
      {numeric(l('listEffort'), 'listEffort', listDraft)}
      {select(l('listNature'), state.listNature, ['boost', 'neutral', 'lower'].map(key => [key, l(key)]), value => update({ listNature: value as SpeedLineState['listNature'] }))}
      {select(l('forms'), state.forms, ['all', 'nonMega', 'mega'].map(key => [key, l(key)]), value => update({ forms: value as SpeedLineState['forms'] }))}
      {select(l('comparison'), state.comparison, ['all', 'faster', 'equal', 'slower'].map(key => [key, l(key)]), value => update({ comparison: value as SpeedLineState['comparison'] }), !reference)}
      {select(l('sort'), state.sort, ['desc', 'asc'].map(key => [key, l(key)]), value => update({ sort: value as SpeedLineState['sort'] }))}
      {select(l('range'), state.rangeMode, [['all', l('allRange')], ['around', l('around')]], value => update({ rangeMode: value as SpeedLineState['rangeMode'], gap: 10 }), !reference)}
    </div>
    {draftsValid ? <div className="speed-line-condition-summary" role="status"><strong>{l('conditions')}</strong>: {l('referenceSpeed')} {referenceSpeed ?? '—'} · {l('refEffort')} {state.referenceEffort} {l(state.referenceNature)} · {l('listEffort')} {state.listEffort} {l(state.listNature)} · {l(state.forms)} · {l(state.comparison)} · {l(state.sort)} · {state.rangeMode === 'around' ? l('around') : l('allRange')}</div> : null}
    {!draftsValid ? <p role="alert">{l('invalid')}</p> : <><p className="muted">{l('count')}: {entries.length}</p>
      {entries.length ? <div className="speed-line-list" role="table" aria-label={language === 'en' ? 'Actual Speed Line' : '실능 스피드라인'}>
        <div className="speed-line-row speed-line-heading" role="row"><span role="columnheader">#</span><span role="columnheader">{l('pokemon')}</span><span role="columnheader">{l('base')}</span><span role="columnheader">{l('actual')}</span><span role="columnheader">{l('difference')}</span></div>
        {entries.map((entry, idx) => <React.Fragment key={entry.row.key}>
          {idx === markerIndex ? referenceMarker : null}
          <div className="speed-line-row" role="row" data-key={entry.row.key}>
            <span role="cell">{idx + 1}</span><span role="cell" className="speed-line-species">{entry.row.sprite ? <img src={entry.row.sprite} alt="" loading="lazy" /> : null}<span>{displayName(entry.row)}<small>{entry.row.name_en}</small></span></span><span role="cell">{entry.row.speed}</span><strong role="cell">{entry.speed}</strong><span role="cell">{entry.difference === null ? '—' : `${entry.difference > 0 ? '+' : ''}${entry.difference} · ${l(entry.relation!)}`}</span>
          </div>
        </React.Fragment>)}
        {markerIndex === entries.length ? referenceMarker : null}
      </div> : <div className="speed-line-empty"><p>{l('noResults')}</p><button type="button" onClick={() => update({ query: '', forms: 'all', comparison: 'all', rangeMode: 'all' })}>{l('reset')}</button>{referenceMarker}</div>}
    </>}
  </section>
}
