import React from 'react'
import { buildSpeedRanges, type SpeedInterval } from './speedLine'
import { searchPokemon } from './pokemonSearch'
import PokemonSearchField from './PokemonSearchField'
import SearchCombobox from './SearchCombobox'
import { PokemonCardHeading } from './PokemonCardOverview'
import { getJaName } from './jaLabels'
import type { SpeedLineState } from './speedLineState'
import type { Row, SiteLanguage } from './app/types'

type Props = {
  rows: readonly Row[]
  state: SpeedLineState
  onChange: (state: SpeedLineState) => void
  language: SiteLanguage
  translate: (text: string) => string
  displayName: (row: Row) => string
  warnings?: readonly string[]
}

const text = {
  ko: { ranges: '구간 보기', detail: '개별 조건 계산', reference: '기준 포켓몬 검색', placeholder: '기준 포켓몬/폼', empty: '기준 포켓몬을 선택하면 해당 행과 기준선이 표시됩니다.', missing: '기준 포켓몬이 확인된 목록에 없습니다.', clear: '기준 포켓몬 해제', search: '목록 검색 · 이름/폼', noMatch: '검색 결과가 없습니다.', normal: '일반 준속~최속', scarf: '스카프 준속~최속', unavailable: '스카프 사용 불가', basis: '노력 32 · 랭크 0 · 특성 미발동', neutral: '준속: 성격 무보정', boost: '최속: 성격 +10%', actual: '일반 실수치', effective: '스카프 유효 스피드', marker: '기준 일반 최속선', selected: '기준', restore: 'URL의 잘못된 값을 기본값으로 복원했습니다' },
  en: { ranges: 'Speed ranges', detail: 'Individual calculation', reference: 'Reference Pokémon search', placeholder: 'Pokémon / form', empty: 'Choose a reference Pokémon to highlight its row and line.', missing: 'Reference is not in the verified roster.', clear: 'Clear reference Pokémon', search: 'Filter Pokémon · name/form', noMatch: 'No matching Pokémon.', normal: 'Normal neutral–fastest', scarf: 'Scarf neutral–fastest', unavailable: 'Scarf unavailable', basis: 'Effort 32 · stage 0 · ability inactive', neutral: 'Neutral: no nature boost', boost: 'Fastest: +10% nature', actual: 'Normal actual Speed', effective: 'Scarf effective Speed', marker: 'Reference normal fastest line', selected: 'Reference', restore: 'Invalid URL values were restored to defaults' },
  ja: { ranges: '範囲表示', detail: '個別条件計算', reference: '基準ポケモン検索', placeholder: 'ポケモン/フォルム', empty: '基準ポケモンを選ぶと該当行と基準線を表示します。', missing: '基準ポケモンは図鑑にありません。', clear: '基準ポケモンを解除', search: '一覧検索 · 名前/フォルム', noMatch: '該当ポケモンなし', normal: '通常 準速～最速', scarf: 'スカーフ 準速～最速', unavailable: 'スカーフ使用不可', basis: '努力32 · ランク0 · 特性未発動', neutral: '準速: 性格補正なし', boost: '最速: 性格+10%', actual: '通常の実数値', effective: 'スカーフ適用後の素早さ', marker: '基準の通常最速ライン', selected: '基準', restore: 'URLの不正な値を既定値に戻しました' },
}

// Center within the list's client viewport, without scrolling the page.
export function scrollReferenceIntoList(list: HTMLElement, key: string | null): boolean {
  if (!key) return false
  const row = Array.from(list.children).find(child => (child as HTMLElement).dataset.key === key)
  if (!row) return false
  const bounds = list.getBoundingClientRect()
  const target = row.getBoundingClientRect()
  const viewportCenter = bounds.top + list.clientTop + list.clientHeight / 2
  list.scrollTop += (target.top + target.bottom) / 2 - viewportCenter
  return true
}

export default function SpeedLineRangesPanel({ rows, state, onChange, language, translate, displayName, warnings = [] }: Props) {
  const [referenceDraft, setReferenceDraft] = React.useState('')
  const [query, setQuery] = React.useState('')
  const listRef = React.useRef<HTMLDivElement>(null)
  const anchoredKey = React.useRef<string | null>(null)
  const l = text[language]
  const roster = React.useMemo(() => rows.map(row => ({ ...row, name_ja: row.name_ja || getJaName(row.key, row.name_ko, row.name_en) })), [rows])
  const { entries, reference, referenceMissing, scaleMax } = React.useMemo(() => buildSpeedRanges(roster, state.referenceKey), [roster, state.referenceKey])
  const suggestions = React.useMemo(() => referenceDraft.trim() ? searchPokemon(roster, referenceDraft, { limit: 12 }).map(row => ({ key: row.key, label: `${displayName(row)} (${row.name_en})`, sprite: row.sprite })) : [], [roster, referenceDraft, displayName])
  const visibleKeys = React.useMemo(() => query.trim() ? new Set(searchPokemon(roster, query).map(row => row.key)) : null, [roster, query])
  const visible = visibleKeys ? entries.filter(entry => visibleKeys.has(entry.row.key)) : entries
  React.useLayoutEffect(() => {
    if (!state.referenceKey) { anchoredKey.current = null; return }
    if (anchoredKey.current !== state.referenceKey && listRef.current && scrollReferenceIntoList(listRef.current, state.referenceKey)) anchoredKey.current = state.referenceKey
  }, [state.referenceKey, visible])
  const referencePosition = reference ? `${reference.normal.max / scaleMax * 100}%` : undefined
  const track = (interval: SpeedInterval | null, variant: 'normal' | 'scarf', name: string) => <div className={`speed-range-track-row speed-range-${variant}`}>
    <span className="speed-range-variant">{variant === 'normal' ? l.normal : l.scarf}</span>
    {interval ? <><strong className="speed-range-end">{interval.min}</strong><div className="speed-range-axis" aria-label={`${name} ${variant === 'normal' ? l.normal : l.scarf} ${interval.min}–${interval.max}`}>
      <span className="speed-range-band" style={{ left: `${interval.min / scaleMax * 100}%`, width: `${(interval.max - interval.min) / scaleMax * 100}%` }} />
      {referencePosition ? <span className="speed-range-marker" style={{ left: referencePosition }} aria-hidden="true" /> : null}
    </div><strong className="speed-range-end">{interval.max}</strong></> : <span className="speed-range-unavailable">{l.unavailable}</span>}
  </div>
  return <section className="panel wide speed-range-panel">
    <div className="section-head"><h2>{translate('스피드라인')}</h2></div>
    <nav className="speed-line-view-switch" aria-label={translate('스피드라인')}><button type="button" className="action-button" aria-current="page">{l.ranges}</button><button type="button" className="action-button subtle" onClick={() => onChange({ ...state, view: 'detail' })}>{l.detail}</button></nav>
    {warnings.length ? <p role="alert">{l.restore}: {warnings.join(', ')}</p> : null}
    <div className="speed-range-reference card entry-card">
      <PokemonCardHeading name={<strong>{reference ? displayName(reference.row) : state.referenceKey ? `${l.missing} (${state.referenceKey})` : l.empty}</strong>} sprite={reference?.row.sprite} spriteAlt={reference ? displayName(reference.row) : ''} types={reference?.row.types} />
      <PokemonSearchField id="speed-line-reference-search" label={l.reference} placeholder={l.placeholder} value={referenceDraft} onChange={setReferenceDraft} onSelect={key => { onChange({ ...state, referenceKey: key }); setReferenceDraft(''); setQuery('') }} options={suggestions} noResults={l.noMatch} showEmpty />
      {referenceMissing ? <p role="alert">{l.missing}: {state.referenceKey}</p> : null}
      {reference ? <div className="speed-range-reference-values"><span>{l.normal} <strong>{reference.normal.min}–{reference.normal.max}</strong></span><span>{l.scarf} <strong>{reference.scarf ? `${reference.scarf.min}–${reference.scarf.max}` : l.unavailable}</strong></span><button type="button" className="action-button subtle" onClick={() => onChange({ ...state, referenceKey: null })}>{l.clear}</button></div> : null}
    </div>
    <div className="speed-range-toolbar"><SearchCombobox id="speed-range-list-search" mode="filter" label={l.search} value={query} onChange={setQuery} options={[]} onSelect={() => {}} /><p>{l.basis} · {l.neutral} · {l.boost}<br />{l.actual} / {l.effective}{reference ? ` · ${l.marker}: ${reference.normal.max}` : ''}</p></div>
    <div ref={listRef} className="speed-range-list" aria-label={translate('스피드라인')}>
      {visible.length ? visible.map(entry => <div className={`speed-range-row${reference?.row.key === entry.row.key ? ' is-reference' : ''}`} key={entry.row.key} data-key={entry.row.key} data-reference={reference?.row.key === entry.row.key ? 'true' : 'false'}>
        <div className="speed-range-species">{entry.row.sprite ? <img src={entry.row.sprite} alt="" loading="lazy" /> : null}<strong>{displayName(entry.row)}</strong>{reference?.row.key === entry.row.key ? <small>{l.selected}</small> : null}</div>
        <div className="speed-range-tracks">{track(entry.normal, 'normal', displayName(entry.row))}{track(entry.scarf, 'scarf', displayName(entry.row))}</div>
      </div>) : <p className="speed-range-no-results">{l.noMatch}</p>}
    </div>
  </section>
}
