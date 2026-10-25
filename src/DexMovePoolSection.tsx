import { useEffect, useState } from 'react'
import type React from 'react'
import type { MoveMeta, MoveOption, SiteLanguage } from './app/types'
import type { DexLearnsetProvenance } from './dexGameLearnsets'
import { moveDescriptionFor } from './dex/data'
import { localizedDexText } from './dex/helpers'
import { searchMoves } from './moveSearch'
import './dexBrowse.css'

export type DexMovePoolSectionProps = {
  recordKey: string
  language: SiteLanguage
  status: 'idle' | 'loading' | 'ready' | 'error' | 'missing'
  moves: MoveOption[]
  metaForMove: (name: string) => MoveMeta | null
  displayMoveName: (name: string) => string
  renderTypeBadge: (type: string) => React.ReactNode
  detailHref: (name: string) => string
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, name: string) => void
  tooltipPropsForMove?: (name: string) => React.HTMLAttributes<HTMLElement>
  onRetry?: () => void
  provenance?: DexLearnsetProvenance
}

const labels = {
  ko: { title:'수록 기술 전체', warning:'챔피언스 습득 가능 여부 미검증 · 수록 데이터는 기준 종/별칭 시드이며 공식 적격 목록이 아닙니다.', total:'전체', shown:'표시', search:'기술 이름 검색', type:'타입', category:'분류', all:'전체', name:'기술', power:'위력', accuracy:'명중', pp:'PP', description:'설명', physical:'물리', special:'특수', status:'상태', unknown:'미확인', idle:'기술 데이터를 불러오기 전입니다.', loading:'기술 데이터를 불러오는 중…', error:'기술 데이터를 불러오지 못했습니다.', missing:'이 폼의 수록 기술 데이터가 없습니다. 습득 기술 0개로 확인된 것은 아닙니다.', empty:'이 데이터셋에 수록된 기술이 없습니다.', noMatches:'필터에 맞는 기술이 없습니다.', retry:'다시 시도' },
  en: { title:'Full listed move pool', warning:'Champions learnability unverified · Seed data from baseline species and aliases, not an official eligibility list.', total:'Total', shown:'Shown', search:'Search move names', type:'Type', category:'Category', all:'All', name:'Move', power:'Power', accuracy:'Accuracy', pp:'PP', description:'Description', physical:'Physical', special:'Special', status:'Status', unknown:'Unknown', idle:'Move data not loaded yet.', loading:'Loading move data…', error:'Could not load move data.', missing:'No move dataset for this form; this does not confirm zero learnable moves.', empty:'No moves in this dataset.', noMatches:'No moves match the filters.', retry:'Retry' },
  ja: { title:'収録わざ全件', warning:'チャンピオンズでの習得可否は未検証 · 基本種と別名のシードデータで、公式の適格リストではありません。', total:'全件', shown:'表示', search:'わざ名を検索', type:'タイプ', category:'分類', all:'すべて', name:'わざ', power:'威力', accuracy:'命中', pp:'PP', description:'説明', physical:'物理', special:'特殊', status:'変化', unknown:'未確認', idle:'わざデータは未読込です。', loading:'わざデータを読み込み中…', error:'わざデータを読み込めませんでした。', missing:'このフォルムのわざデータがありません。習得可能なわざが0件という意味ではありません。', empty:'このデータセットにわざはありません。', noMatches:'条件に一致するわざはありません。', retry:'再試行' },
} as const

type Filters = { recordKey: string; query: string; type: string; category: string }

const snapshotLabels = {
  ko: { badge:'게임 데이터 스냅샷', warning:'현재 게임 버전과 일치 여부 미검증', metadata:'타입은 게임 스냅샷, 그외 메타는 기존 도감 · 미수록 메타 미확인', ambiguous:'성별·품종을 확정할 수 없어 기술 목록을 표시하지 않습니다.', missing:'이 폼은 고정 게임 덤프에 검증 대응되지 않았습니다.', source:'원본 덤프' },
  en: { badge:'Game data snapshot', warning:'Match with current game version unverified', metadata:'Type from game snapshot; other available metadata from legacy Dex · missing metadata unknown', ambiguous:'Sex or breed is ambiguous; no move list is shown.', missing:'This form was not verified against the pinned game dump.', source:'Source dump' },
  ja: { badge:'ゲームデータスナップショット', warning:'現行バージョンとの一致は未検証', metadata:'タイプはゲームスナップショット、他のメタデータは既存図鑑 · 未収録は未確認', ambiguous:'性別・品種が特定できないため、わざ一覧を表示しません。', missing:'このフォルムは固定されたゲームデータとの対応が未確認です。', source:'元データ' },
} as const

/** Read-only display of the parent-resolved form pool; never guesses eligibility or loads data. */
export function DexMovePoolSection({ recordKey, language, status, moves, metaForMove, displayMoveName, renderTypeBadge, detailHref, onNavigate, tooltipPropsForMove, onRetry, provenance }: DexMovePoolSectionProps) {
  const text = labels[language]
  const [filters, setFilters] = useState<Filters>({ recordKey, query:'', type:'', category:'' })
  const current = filters.recordKey === recordKey ? filters : { recordKey, query:'', type:'', category:'' }
  useEffect(() => { setFilters(prev => prev.recordKey === recordKey ? prev : { recordKey, query:'', type:'', category:'' }) }, [recordKey])
  const setFilter = (key: 'query' | 'type' | 'category', value: string) => setFilters(prev => ({ ...(prev.recordKey === recordKey ? prev : { recordKey, query:'', type:'', category:'' }), [key]: value }))
  const types = [...new Set(moves.map(move => provenance?.kind === 'game-snapshot' ? move.type : metaForMove(move.name)?.type ?? move.type).filter((type): type is string => Boolean(type)))].sort()
  const searched = searchMoves(moves, current.query, { names: move => ({ aliases:[displayMoveName(move.name)] }) })
  const displayed = searched.filter(move => {
    const meta = metaForMove(move.name)
    const type = provenance?.kind === 'game-snapshot' ? move.type : meta?.type ?? move.type
    return (!current.type || type === current.type) && (!current.category || meta?.category === current.category)
  })
  return <section className="dex-move-pool" aria-busy={status === 'loading'}>
    <div className="dex-move-pool-heading"><h3>{text.title}</h3>{provenance ? <p className="dex-move-pool-warning">{snapshotLabels[language].badge} · {provenance.date} · {snapshotLabels[language].warning} · {snapshotLabels[language].metadata} · <a href={`https://github.com/projectpokemon/champout/tree/${provenance.commit}`} target="_blank" rel="noopener noreferrer">{snapshotLabels[language].source}</a></p> : <p className="dex-move-pool-warning">{text.warning}</p>}</div>
    {status === 'ready' ? <>
      <p className="dex-move-pool-count" role="status">{text.total} {moves.length} · {text.shown} {displayed.length}</p>
      {moves.length ? <>
        <div className="dex-move-pool-filters">
          <label>{text.search}<input type="search" value={current.query} onChange={event => setFilter('query', event.target.value)} autoComplete="off" /></label>
          <label>{text.type}<select value={current.type} onChange={event => setFilter('type', event.target.value)}><option value="">{text.all}</option>{types.map(type => <option key={type} value={type}>{type}</option>)}</select></label>
          <label>{text.category}<select value={current.category} onChange={event => setFilter('category', event.target.value)}><option value="">{text.all}</option>{(['physical','special','status'] as const).map(category => <option key={category} value={category}>{text[category]}</option>)}</select></label>
        </div>
        {displayed.length ? <div className="dex-move-pool-table-wrap"><table className="dex-move-pool-table"><thead><tr>{[text.name,text.type,text.category,text.power,text.accuracy,text.pp,text.description].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
          {displayed.map((move, index) => {
            const meta = metaForMove(move.name)
            const type = provenance?.kind === 'game-snapshot' ? move.type : meta?.type ?? move.type
            const tooltip = tooltipPropsForMove?.(move.name)
            const description = localizedDexText(moveDescriptionFor(move.name), language)
            return <tr key={`${move.name}-${index}`}>
              <th scope="row"><a className="dex-move-pool-link" href={detailHref(move.name)} {...tooltip} onClick={event => { tooltip?.onClick?.(event); if (!event.defaultPrevented) onNavigate(event, move.name) }}>{displayMoveName(move.name)}</a></th>
              <td>{type ? renderTypeBadge(type) : '—'}</td><td>{meta?.category ? text[meta.category] : '—'}</td>
              <td>{meta?.power ?? '—'}</td><td>{meta?.accuracy == null ? '—' : `${meta.accuracy}%`}</td><td>{meta?.pp ?? '—'}</td>
              <td className="dex-move-pool-description">{description?.summary || description?.detail || '—'}</td>
            </tr>
          })}
        </tbody></table></div> : <p role="status">{text.noMatches}</p>}
      </> : <p role="status">{text.empty}</p>}
    </> : <p role="status">{status === 'missing' && provenance ? (provenance.reason === 'ambiguous-form' ? snapshotLabels[language].ambiguous : snapshotLabels[language].missing) : text[status]}</p>}
    {status === 'error' && onRetry ? <button type="button" onClick={onRetry}>{text.retry}</button> : null}
  </section>
}
