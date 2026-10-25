import React from 'react'
import { searchPokemon } from './pokemonSearch'
import { speciesSearchCandidates } from './pokemonSearch'
import { searchMatchScore } from './searchMatching'
import PokemonSearchField from './PokemonSearchField'
import { PokemonCardHeading } from './PokemonCardOverview'
import { getJaName } from './jaLabels'
import { buildSpeedCoverage, coverageCategories, speedCoverageAt, type CoverageCategory, type CoverageTarget } from './speedLineCoverage'
import type { SpeedLineState } from './speedLineState'
import type { Row, SiteLanguage } from './app/types'

type Props = {
  rows: readonly Row[]; state: SpeedLineState; onChange: (state: SpeedLineState) => void
  language: SiteLanguage; translate: (text: string) => string; displayName: (row: Row) => string
  warnings?: readonly string[]
}
const copy = {
  ko: { title: '추월컷 커버리지', detail: '개별 조건 계산', search: '기준 포켓몬/폼 검색', placeholder: '기준 포켓몬/폼', empty: '기준 포켓몬을 선택하면 노력별 추월컷을 계산합니다.', missing: '기준 포켓몬이 확인된 목록에 없습니다.', clear: '기준 포켓몬 해제', noMatch: '검색 결과가 없습니다.', nature: '내 성격', boost: '최속 (+10%)', neutral: '무보정', effort: '내 스피드 노력 (0–32)', invalid: '0부터 32까지 정수를 입력하세요. 계산을 보류합니다.', now: '내 현재 스피드', max: '내 32점 최대', coverage: '현재 추월 커버리지', ties: '동속', next: '다음 추월컷', more: '추가 노력', noNext: '앞으로 새로 추월할 수 있는 컷이 없습니다.', impossible: '32점으로도 추월 불가', effortRange: '내 노력 구간', ownSpeed: '내 스피드', newTargets: '새로 추월하는 대상', targetSearch: '선택 구간 대상 검색', targetCount: '표시 / 구간 전체', atZero: '노력 0에서 이미 추월', none: '새 컷 없음', current: '현재', all: '전체 적합 조건', restore: 'URL의 잘못된 값을 기본값으로 복원했습니다', premise: '상대 노력 32 · 준속=성격 무보정 · 최속=+10% · 상대 스카프 적용/미적용 · 내 스카프 미적용 · 양측 랭크 0/특성 미발동 · 실제 상대 빌드/행동 순서는 별도', normalNeutral: '일반 준속', normalBoost: '일반 최속', scarfNeutral: '스카프 준속', scarfBoost: '스카프 최속', detailCut: '개별 조건 계산으로 보기' },
  en: { title: 'Overtake coverage', detail: 'Individual calculation', search: 'Reference Pokémon / form search', placeholder: 'Pokémon / form', empty: 'Choose a reference to calculate effort breakpoints.', missing: 'Reference is not in the verified roster.', clear: 'Clear reference', noMatch: 'No matching Pokémon.', nature: 'Own Speed nature', boost: 'Fastest (+10%)', neutral: 'Neutral', effort: 'Own Speed effort (0–32)', invalid: 'Enter an integer from 0 to 32. Calculation is paused.', now: 'Current actual Speed', max: 'Maximum at 32', coverage: 'Current overtake coverage', ties: 'Ties', next: 'Next strict-pass cut', more: 'Extra effort', noNext: 'No more cuts can be passed.', impossible: 'Cannot pass at 32', effortRange: 'Own effort interval', ownSpeed: 'Own Speed', newTargets: 'Newly passed targets', targetSearch: 'Search selected interval targets', targetCount: 'Shown / interval total', atZero: 'Already passed at effort 0', none: 'No new cuts', current: 'Current', all: 'All eligible conditions', restore: 'Invalid URL values were restored to defaults', premise: 'Opponent effort 32 · neutral/+10% nature · opponent Scarf off/on · own Scarf off · stages 0/abilities inactive · not an actual opponent build or turn-order guarantee', normalNeutral: 'Normal neutral', normalBoost: 'Normal fastest', scarfNeutral: 'Scarf neutral', scarfBoost: 'Scarf fastest', detailCut: 'Open individual calculation' },
  ja: { title: '追い越しライン・カバレッジ', detail: '個別条件計算', search: '基準ポケモン/フォルム検索', placeholder: 'ポケモン/フォルム', empty: '基準ポケモンを選んで努力ポイント別の追い越しラインを計算します。', missing: '基準ポケモンは確認済み一覧にありません。', clear: '基準ポケモンを解除', noMatch: '該当ポケモンなし', nature: '自分の性格', boost: '最速 (+10%)', neutral: '補正なし', effort: '自分の素早さ努力 (0–32)', invalid: '0～32の整数を入力してください。計算を保留します。', now: '現在の実数値', max: '32ポイントの最大値', coverage: '現在の追い越しカバレッジ', ties: '同速', next: '次の追い越しライン', more: '追加努力', noNext: 'これ以上追い越せるラインはありません。', impossible: '32でも追い越せない', effortRange: '努力区間', ownSpeed: '自分の素早さ', newTargets: '新しく追い越す対象', targetSearch: '選択区間の対象を検索', targetCount: '表示 / 区間全体', atZero: '努力0で既に追い越し', none: '新しいラインなし', current: '現在', all: '全適合条件', restore: 'URLの不正な値を既定値に戻しました', premise: '相手努力32 · 準速=無補正・最速=+10% · 相手スカーフなし/あり · 自分スカーフなし · 双方ランク0・特性未発動 · 相手の実際の構成/行動順を保証しない', normalNeutral: '通常 準速', normalBoost: '通常 最速', scarfNeutral: 'スカーフ 準速', scarfBoost: 'スカーフ 最速', detailCut: '個別条件計算へ' },
}
const validEffort = (draft: string) => /^(?:0|[1-9]|[12][0-9]|3[012])$/.test(draft)

export default function SpeedLineRangesPanel({ rows, state, onChange, language, translate, displayName, warnings = [] }: Props) {
  const l = copy[language]
  const [searchDraft, setSearchDraft] = React.useState('')
  const [targetQuery, setTargetQuery] = React.useState('')
  const [effortDraft, setEffortDraft] = React.useState(String(state.referenceEffort))
  React.useEffect(() => setEffortDraft(String(state.referenceEffort)), [state.referenceEffort])
  const valid = validEffort(effortDraft)
  const roster = React.useMemo(() => rows.map(row => ({ ...row, name_ja: row.name_ja || getJaName(row.key, row.name_ko, row.name_en) })), [rows])
  const projection = React.useMemo(() => buildSpeedCoverage(roster, state.referenceKey, state.referenceNature), [roster, state.referenceKey, state.referenceNature])
  const selected = valid ? speedCoverageAt(projection, state.referenceEffort) : null
  const selectedGroup = selected ? projection.groups.find(group => group.start <= state.referenceEffort && state.referenceEffort <= group.end) : null
  React.useEffect(() => setTargetQuery(''), [state.referenceKey, state.referenceNature, selectedGroup?.start])
  const tableViewport = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const viewport = tableViewport.current
    const current = viewport?.querySelector<HTMLElement>('tr.is-current')
    if (!viewport || !current) return
    const bounds = viewport.getBoundingClientRect()
    const row = current.getBoundingClientRect()
    if (row.top < bounds.top || row.top >= bounds.bottom) viewport.scrollTop += row.top - bounds.top - 35
  }, [projection, state.referenceEffort, valid])
  const suggestions = React.useMemo(() => searchDraft.trim() ? searchPokemon(roster, searchDraft, { includeMega: true, limit: 12 }).map(row => ({ key: row.key, label: `${displayName(row)} (${row.name_en})`, sprite: row.sprite })) : [], [roster, searchDraft, displayName])
  const update = (patch: Partial<SpeedLineState>) => onChange({ ...state, ...patch })
  const setEffort = (value: string) => { setEffortDraft(value); if (validEffort(value)) update({ referenceEffort: Number(value) }) }
  const categoryName = (category: CoverageCategory) => ({ 'normal-neutral': l.normalNeutral, 'normal-boost': l.normalBoost, 'scarf-neutral': l.scarfNeutral, 'scarf-boost': l.scarfBoost })[category]
  const targetName = (target: CoverageTarget<typeof roster[number]>) => `${displayName(target.row)} · ${categoryName(target.category)} · ${target.speed}`
  const visibleTargets = selectedGroup?.newTargets.filter(target => !targetQuery.trim() || Number.isFinite(searchMatchScore(targetQuery, {
    official: [target.row.name_ko, target.row.name_en, target.row.name_ja, target.row.key, displayName(target.row), categoryName(target.category), String(target.speed)],
    aliases: speciesSearchCandidates(target.row),
  }))) ?? []
  const openCut = (target: CoverageTarget<typeof roster[number]>) => update({ view: 'detail', targetKey: target.row.key, targetItem: target.variant, targetAbility: null,
    listEffort: 32, listNature: target.nature, referenceStage: 0, referenceAbility: null, items: target.variant, abilityMode: 'off', query: '', forms: 'all', comparison: 'all', rangeMode: 'all' })
  return <section className="panel wide speed-coverage-panel">
    <div className="section-head"><h2>{translate('스피드라인')}</h2></div>
    <nav className="speed-line-view-switch" aria-label={translate('스피드라인')}><button type="button" className="action-button" aria-current="page">{l.title}</button><button type="button" className="action-button subtle" onClick={() => update({ view: 'detail' })}>{l.detail}</button></nav>
    {warnings.length ? <p role="alert">{l.restore}: {warnings.join(', ')}</p> : null}
    <div className="speed-coverage-reference card entry-card">
      <PokemonCardHeading name={<strong>{projection.reference ? displayName(projection.reference) : state.referenceKey ? `${l.missing} (${state.referenceKey})` : l.empty}</strong>} sprite={projection.reference?.sprite} spriteAlt={projection.reference ? displayName(projection.reference) : ''} types={projection.reference?.types} />
      <div className="speed-coverage-inputs">
        <PokemonSearchField id="speed-line-reference-search" label={l.search} placeholder={l.placeholder} value={searchDraft} onChange={setSearchDraft} onSelect={key => { update({ referenceKey: key }); setSearchDraft('') }} options={suggestions} noResults={l.noMatch} showEmpty />
        <label>{l.nature}<select value={state.referenceNature} onChange={e => update({ referenceNature: e.target.value as SpeedLineState['referenceNature'] })}><option value="boost">{l.boost}</option><option value="neutral">{l.neutral}</option>{state.referenceNature === 'lower' ? <option value="lower">−10% ({language === 'ko' ? '복원한 성격' : language === 'ja' ? '復元した性格' : 'Restored nature'})</option> : null}</select></label>
        <div className="speed-coverage-effort"><label htmlFor="speed-coverage-slider">{l.effort}</label><div><input id="speed-coverage-slider" type="range" min="0" max="32" step="1" value={valid ? state.referenceEffort : 0} onChange={e => setEffort(e.target.value)} /><input aria-label={l.effort} type="number" min="0" max="32" step="1" value={effortDraft} aria-invalid={!valid} aria-describedby={!valid ? 'speed-coverage-error' : undefined} onChange={e => setEffort(e.target.value)} /></div></div>
      </div>
      {!valid ? <p role="alert" id="speed-coverage-error">{l.invalid}</p> : null}
      {state.referenceKey && !projection.reference ? <p role="alert">{l.missing}: {state.referenceKey}</p> : null}
      {projection.reference ? <button type="button" className="action-button subtle" onClick={() => { update({ referenceKey: null }); setSearchDraft('') }}>{l.clear}</button> : null}
    </div>
    {selected ? <>
      <div className="speed-coverage-summary" aria-live="polite"><p>{l.now} <strong>{selected.currentSpeed}</strong> · {l.max} <strong>{selected.maxSpeed}</strong></p><p>{l.coverage}: <strong>{selected.passed}/{selected.total}</strong> {l.all} · {l.ties}: <strong>{selected.ties}</strong></p>
        <p>{l.next}: {selected.next ? <><strong>{selected.next.passEffort}</strong> ({l.more} +{selected.next.additionalEffort}) · {l.ownSpeed} {selected.next.passSpeed} &gt; <button type="button" className="action-button subtle speed-coverage-cut" onClick={() => openCut(selected.next!)}>{targetName(selected.next)} · {l.detailCut}</button></> : <>{l.noNext} · {l.impossible}: {selected.unreachable} · {l.max} {selected.maxSpeed}</>}</p>
        <div className="speed-coverage-classes">{coverageCategories.map(category => <span key={category}>{categoryName(category)} <strong>{selected.categories[category].passed}/{selected.categories[category].total}</strong></span>)}</div>
      </div>
      <div className="speed-coverage-workspace"><div ref={tableViewport} className="speed-coverage-scroll"><table className="speed-coverage-table" aria-label={l.title}><thead><tr><th>{l.effortRange}</th><th>{l.ownSpeed}</th>{coverageCategories.map(category => <th key={category}>{categoryName(category)}</th>)}<th>{l.newTargets}</th></tr></thead><tbody>{projection.groups.map(group => <tr key={group.start} data-effort-start={group.start} data-effort-end={group.end} className={state.referenceEffort >= group.start && state.referenceEffort <= group.end ? 'is-current' : ''}>
        <th scope="row"><button type="button" className="action-button subtle speed-coverage-effort-action" aria-label={`${l.effortRange} ${group.start}${group.end !== group.start ? `–${group.end}` : ''}: ${l.effort} ${group.start}`} onClick={() => setEffort(String(group.start))}>{group.start}{group.end !== group.start ? `–${group.end}` : ''}</button>{state.referenceEffort >= group.start && state.referenceEffort <= group.end ? <small> {l.current} {state.referenceEffort}</small> : null}</th>
        <td data-label={l.ownSpeed}>{group.firstSpeed}{group.lastSpeed !== group.firstSpeed ? `–${group.lastSpeed}` : ''}</td>{coverageCategories.map(category => <td key={category} data-label={categoryName(category)}>{group.counts[category]}/{projection.totals[category]}</td>)}
        <td data-label={l.newTargets}><button type="button" className="action-button subtle speed-coverage-show-targets" aria-label={`${l.effortRange} ${group.start}${group.end !== group.start ? `–${group.end}` : ''}: ${l.newTargets} ${group.newTargets.length}`} aria-controls="speed-coverage-target-list" aria-current={selectedGroup?.start === group.start ? 'true' : undefined} onClick={() => { setEffort(String(group.start)); setTargetQuery('') }}>{group.newTargets.length}</button></td>
      </tr>)}</tbody></table></div>
      {selectedGroup ? <section className="speed-coverage-targets" aria-label={l.targetSearch}>
        <h3>{l.newTargets} · {l.effortRange} {selectedGroup.start}{selectedGroup.end !== selectedGroup.start ? `–${selectedGroup.end}` : ''}</h3>
        <p className="muted">{selectedGroup.start === 0 ? l.atZero : l.newTargets} · {l.targetCount}: {visibleTargets.length}/{selectedGroup.newTargets.length}</p>
        <label htmlFor="speed-coverage-target-search">{l.targetSearch}</label><input id="speed-coverage-target-search" type="search" value={targetQuery} onChange={e => setTargetQuery(e.target.value)} />
        <div id="speed-coverage-target-list" className="speed-coverage-target-list" role="list">{visibleTargets.length ? visibleTargets.map(target => <div role="listitem" key={`${target.row.key}:${target.variant}:${target.nature}`} className="speed-coverage-target-item">{targetName(target)} · {l.effort} {target.passEffort} <button type="button" className="action-button subtle speed-coverage-cut" onClick={() => openCut(target)}>{l.detailCut}</button></div>) : <p className="muted">{l.none}</p>}</div>
      </section> : null}</div>
      <p className="muted speed-coverage-premise">{l.premise}</p>
    </> : null}
  </section>
}
