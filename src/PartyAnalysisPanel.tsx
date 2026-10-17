import React from 'react'
import type { SiteLanguage } from './app/types'
import { getTypeBadgeSrc } from './typeBadges'
import type { analyzePartyMatchups } from './partyAnalysis'

type Result = ReturnType<typeof analyzePartyMatchups>
const labels = {
  ko: { title: '내 파티 타점·약점', basis: '등록 공격기 → 단일 타입 대상 · 방어는 현재 폼의 타입', offense: '등록 공격기 커버리지', defense: '받는 타입 상성', weak: '약점', safe: '반감·무효', cover: '약점공략', resist: '반감·무효', confirmedResist: '확정 반감·무효', ability: '특성', caution: '타입 상성 기준 · 도구·날씨·상태·일시 효과 제외. 생존/승리 보장 아님.', empty: '파티에 포켓몬을 등록하면 분석합니다.', loading: '등록 기술 데이터를 불러오는 중…', warning: '미확인 항목', priority: '겹치는 약점', type: '타입', slot: '슬롯', blank: '빈 슬롯', noMove: '등록 공격기 없음', unknown: '확인되지 않은 기술', partial: '확인된 기술 기준 최소값 (미확인/조건부 기술 제외)', detail: '상세', incoming: '받는 공격 타입', target: '대상 단일 타입' },
  en: { title: 'Party coverage & weaknesses', basis: 'Registered attacks vs single-type targets · defense uses current forms', offense: 'Registered attack coverage', defense: 'Incoming type matchups', weak: 'Weak', safe: 'Resist/immune', cover: 'Super-effective', resist: 'Resist/immune', confirmedResist: 'Confirmed resisted/immune', ability: 'Ability', caution: 'Static type matchups · excludes items, weather, status and temporary effects. Not a survival/win guarantee.', empty: 'Add a Pokémon to analyze your party.', loading: 'Loading registered move data…', warning: 'Unresolved entries', priority: 'Overlapping weaknesses', type: 'Type', slot: 'Slot', blank: 'Empty slot', noMove: 'No registered attack', unknown: 'Unverified move', partial: 'At least this much from verified moves (unverified/conditional moves excluded)', detail: 'Details', incoming: 'Incoming attack type', target: 'Single defending type' },
  ja: { title: 'パーティの攻撃範囲・弱点', basis: '登録攻撃技→単タイプ対象・防御は現在のフォルム', offense: '登録攻撃技の範囲', defense: '受けるタイプ相性', weak: '弱点', safe: '半減・無効', cover: '弱点を突く', resist: '半減・無効', confirmedResist: '確定半減・無効', ability: '特性', caution: 'タイプ相性のみ・持ち物、天候、状態、時限効果は対象外。生存・勝利の保証ではありません。', empty: 'ポケモンを登録すると分析します。', loading: '登録技データを読み込み中…', warning: '未確認項目', priority: '重なる弱点', type: 'タイプ', slot: '枠', blank: '空き枠', noMove: '登録攻撃技なし', unknown: '未確認の技', partial: '確認済みの技による下限（未確認・条件付き技を除外）', detail: '詳細', incoming: '受ける技のタイプ', target: '相手の単タイプ' },
} as const
const names = {
  ko: ['노말', '불꽃', '물', '전기', '풀', '얼음', '격투', '독', '땅', '비행', '에스퍼', '벌레', '바위', '고스트', '드래곤', '악', '강철', '페어리'],
  ja: ['ノーマル', 'ほのお', 'みず', 'でんき', 'くさ', 'こおり', 'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし', 'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー'],
}
const types = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy']
const tone = (value: number | null) => value === null ? 'unknown' : value >= 2 ? 'weak' : value === 0 ? 'immune' : value < 1 ? 'resist' : 'neutral'
const display = (value: number | null) => value === null ? '—' : `${value}×`
const displayCell = (value: number | null, incomplete = false, loading = false) => loading ? '?' : incomplete ? value === null ? '?' : `≥${display(value)}` : display(value)
export const partyTotalClass = (tone: 'risk' | 'support', count: number | null) => count === null ? 'party-analysis-total' : `party-analysis-total total-${tone} total-count-${count}`

export function PartyAnalysisPanel({ analysis, language, loading }: { analysis: Result; language: SiteLanguage; loading: boolean }) {
  const [selected, setSelected] = React.useState<string | null>(null)
  const text = labels[language]
  const typeName = (type: string) => language === 'en' ? type[0].toUpperCase() + type.slice(1) : (names[language] as readonly string[])[types.indexOf(type)] ?? type
  const slots = Array.from({ length: 6 }, (_, slot) => analysis.defense[0]?.members.find((member, index) => (member.slot ?? index) === slot))
  const rows = (kind: 'offense' | 'defense') => analysis[kind].map(row => {
    const partial = kind === 'offense' && (row as Result['offense'][number]).incompleteCount > 0
    const entries = kind === 'offense' ? (row as Result['offense'][number]).cells : (row as Result['defense'][number]).members
    return <tr key={row.type}>
      <th scope="row" className="party-analysis-type-col"><img src={getTypeBadgeSrc(row.type)} alt="" />{typeName(row.type)}</th>
      {slots.map((_, slot) => {
        const entry = entries.find((item, index) => (item.slot ?? index) === slot)
        const offenseCell = kind === 'offense' ? entry as Result['offense'][number]['cells'][number] | undefined : undefined
        const defenseCell = kind === 'defense' ? entry as Result['defense'][number]['members'][number] | undefined : undefined
        const value = loading && kind === 'offense' ? null : entry?.multiplier ?? null
        const info = offenseCell?.moves.join(' · ')
        const symbol = displayCell(value, offenseCell?.incomplete, loading && kind === 'offense')
        const description = entry ? `${typeName(row.type)} · ${entry.name}: ${symbol}${info ? ` · ${info}` : ''}${offenseCell?.incomplete ? ` · ${text.unknown} · ${text.partial}` : ''}` : `${text.slot} ${slot + 1}: ${text.blank}`
        return <td key={slot} className={`party-analysis-value ${tone(value)}`}>
          {entry ? <button type="button" aria-label={description} aria-expanded={selected === `${kind}:${row.type}:${slot}`} onClick={() => setSelected(selected === `${kind}:${row.type}:${slot}` ? null : `${kind}:${row.type}:${slot}`)}>
            <span>{symbol}</span>{defenseCell?.abilityImmune ? <small>{text.ability}</small> : null}{offenseCell?.incomplete && value !== null ? <small title={text.partial}>?</small> : null}
          </button> : <span className="party-analysis-blank" aria-label={description}>—</span>}
        </td>
      })}
      {kind === 'defense' ? <><td className={partyTotalClass('risk', (row as Result['defense'][number]).weakCount)}>{(row as Result['defense'][number]).weakCount}</td><td className={partyTotalClass('support', (row as Result['defense'][number]).resistCount + (row as Result['defense'][number]).immuneCount)}>{(row as Result['defense'][number]).resistCount + (row as Result['defense'][number]).immuneCount}</td></>
        : <><td className={partyTotalClass('support', !loading && (row as Result['offense'][number]).knownCount ? (row as Result['offense'][number]).count : null)} title={partial ? text.partial : undefined}>{loading ? '?' : !(row as Result['offense'][number]).knownCount ? partial ? '?' : '—' : `${partial ? '≥' : ''}${(row as Result['offense'][number]).count}`}</td><td className={partyTotalClass('risk', !loading && (row as Result['offense'][number]).knownCount ? (row as Result['offense'][number]).resistCount : null)} title={text.confirmedResist}>{loading ? '?' : !(row as Result['offense'][number]).knownCount ? partial ? '?' : '—' : (row as Result['offense'][number]).resistCount}</td></>}
    </tr>
  })
  return <section className="party-analysis" aria-label={text.title}>
    <div className="party-analysis-heading"><h3>{text.title}</h3><span>{analysis.memberCount}/6</span></div>
    <p className="muted">{text.basis}</p>
    {!analysis.memberCount ? <p>{text.empty}</p> : <>
      <div className="party-analysis-priority">{text.priority}: {analysis.priority.length ? analysis.priority.map(entry => `${typeName(entry.type)} ${entry.weakCount}`).join(' · ') : '—'}</div>
      {(['defense', 'offense'] as const).map(kind => <div className="party-analysis-group" key={kind}>
        <h4>{text[kind]}</h4>
        {loading && kind === 'offense' ? <p className="muted">{text.loading}</p> : null}
        <div className="party-analysis-table-scroll" role="region" aria-label={`${text[kind]} ${text.detail}`} tabIndex={0}>
          <table className="party-analysis-table">
            <caption>{text[kind]} · {kind === 'defense' ? text.incoming : text.target}</caption>
            <thead><tr><th scope="col" rowSpan={2} className="party-analysis-type-col">{text.type}</th><th scope="colgroup" colSpan={6}>{text.slot} 1–6</th><th scope="colgroup" colSpan={2}>{text.detail}</th></tr><tr>{slots.map((entry, slot) => <th scope="col" key={slot} className="party-analysis-slot"><span>{text.slot} {slot + 1}</span>{entry ? <span className="party-analysis-slot-name">{entry.sprite ? <img src={entry.sprite} alt="" /> : null}{entry.name}</span> : <span className="party-analysis-slot-name muted">{text.blank}</span>}</th>)}<th scope="col">{kind === 'defense' ? text.weak : text.cover}</th><th scope="col">{kind === 'defense' ? text.resist : text.confirmedResist}</th></tr></thead>
            <tbody>{rows(kind)}</tbody>
          </table>
        </div>
      </div>)}
      {selected ? (() => {
        const [kind, type, slotText] = selected.split(':')
        const slot = Number(slotText)
        const row = kind === 'offense' ? analysis.offense.find(x => x.type === type) : analysis.defense.find(x => x.type === type)
        const entry = row && (kind === 'offense' ? (row as Result['offense'][number]).cells : (row as Result['defense'][number]).members).find((item, index) => (item.slot ?? index) === slot)
        if (!entry) return null
        const moves = kind === 'offense' ? (entry as Result['offense'][number]['cells'][number]).moves : []
        const incomplete = kind === 'offense' && (entry as Result['offense'][number]['cells'][number]).incomplete
        const pending = kind === 'offense' && loading
        return <div className="party-analysis-detail" role="status"><strong>{typeName(type)} · {entry.name} · {displayCell(entry.multiplier, incomplete, pending)}</strong>{pending ? <p>{text.loading}</p> : <>{moves.length ? <p>{moves.join(' · ')}</p> : kind === 'offense' ? <p>{incomplete ? text.unknown : text.noMove}</p> : null}{incomplete ? <p>{text.partial}</p> : null}</>}</div>
      })() : null}
    </>}
    {analysis.warnings.length ? <details><summary>{text.warning} ({analysis.warnings.length})</summary><ul>{analysis.warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}</ul></details> : null}
    <small className="muted">{text.caution}</small>
  </section>
}
