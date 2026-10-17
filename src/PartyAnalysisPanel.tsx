import React from 'react'
import type { SiteLanguage } from './app/types'
import { getTypeBadgeSrc } from './typeBadges'
import type { analyzePartyMatchups } from './partyAnalysis'

type Result = ReturnType<typeof analyzePartyMatchups>
const labels = {
  ko: { title: '내 파티 타점·약점', basis: '등록 공격기 → 단일 타입 대상 · 방어는 현재 폼의 타입', offense: '등록 공격기 커버리지', defense: '받는 타입 상성', none: '등록된 공격기로 약점 공략 없음', weak: '약점', safe: '반감·무효 후보', immune: '무효', resist: '반감', neutral: '보통', ability: '특성', caution: '타입 상성 기준 · 도구·날씨·상태·일시 효과 제외. 생존/승리 보장 아님.', empty: '파티에 포켓몬을 등록하면 분석합니다.', loading: '등록 기술 데이터를 불러오는 중…', warning: '미확인 항목', priority: '겹치는 약점' },
  en: { title: 'Party coverage & weaknesses', basis: 'Registered attacks vs single-type targets · defense uses current forms', offense: 'Registered attack coverage', defense: 'Incoming type matchups', none: 'No registered attack hits this type super-effectively', weak: 'Weak', safe: 'Resist/immune candidates', immune: 'Immune', resist: 'Resist', neutral: 'Neutral', ability: 'Ability', caution: 'Static type matchups · excludes items, weather, status and temporary effects. Not a survival/win guarantee.', empty: 'Add a Pokémon to analyze your party.', loading: 'Loading registered move data…', warning: 'Unresolved entries', priority: 'Overlapping weaknesses' },
  ja: { title: 'パーティの攻撃範囲・弱点', basis: '登録攻撃技→単タイプ対象・防御は現在のフォルム', offense: '登録攻撃技の範囲', defense: '受けるタイプ相性', none: '登録攻撃技で弱点を突けない', weak: '弱点', safe: '半減・無効候補', immune: '無効', resist: '半減', neutral: '等倍', ability: '特性', caution: 'タイプ相性のみ・持ち物、天候、状態、時限効果は対象外。生存・勝利の保証ではありません。', empty: 'ポケモンを登録すると分析します。', loading: '登録技データを読み込み中…', warning: '未確認項目', priority: '重なる弱点' },
} as const

export function PartyAnalysisPanel({ analysis, language, loading }: { analysis: Result; language: SiteLanguage; loading: boolean }) {
  const [selected, setSelected] = React.useState<string | null>(null)
  const text = labels[language]
  const typeName = (type: string) => language === 'en' ? type[0].toUpperCase() + type.slice(1) : language === 'ja' ? ({ normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき', grass: 'くさ', ice: 'こおり', fighting: 'かくとう', poison: 'どく', ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし', rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく', steel: 'はがね', fairy: 'フェアリー' } as Record<string, string>)[type] ?? type : ({ normal: '노말', fire: '불꽃', water: '물', electric: '전기', grass: '풀', ice: '얼음', fighting: '격투', poison: '독', ground: '땅', flying: '비행', psychic: '에스퍼', bug: '벌레', rock: '바위', ghost: '고스트', dragon: '드래곤', dark: '악', steel: '강철', fairy: '페어리' } as Record<string, string>)[type] ?? type
  const member = (entry: { name: string; sprite?: string; slot?: number; multiplier?: number; abilityImmune?: boolean }) => <span className="party-analysis-member" key={`${entry.slot}-${entry.name}`}>
    {entry.sprite ? <img src={entry.sprite} alt="" /> : null}<strong>{entry.name}</strong>{entry.multiplier !== undefined ? ` ${entry.multiplier}×` : ''}{entry.abilityImmune ? <small>{text.ability}</small> : null}
  </span>
  return <section className="party-analysis" aria-label={text.title}>
    <div className="party-analysis-heading"><h3>{text.title}</h3><span>{analysis.memberCount}/6</span></div>
    <p className="muted">{text.basis}</p>
    {!analysis.memberCount ? <p>{text.empty}</p> : <>
      <div className="party-analysis-priority">{text.priority}: {analysis.priority.length ? analysis.priority.map(entry => `${typeName(entry.type)} ${entry.weakCount}`).join(' · ') : '—'}
        {analysis.priority.filter(entry => !entry.resistCount && !entry.immuneCount).length ? <strong> · {text.safe} 0</strong> : null}
      </div>
      {[{ id: 'offense', heading: text.offense }, { id: 'defense', heading: text.defense }].map(section => <div className="party-analysis-group" key={section.id}>
        <h4>{section.heading}</h4>
        {section.id === 'offense' && loading ? <p className="muted">{text.loading}</p> : <div className="party-analysis-grid">{analysis.offense.map((offense, idx) => {
          const defense = analysis.defense[idx]
          const value = section.id === 'offense' ? offense.count : defense.weakCount
          const active = selected === `${section.id}:${offense.type}`
          return <button key={offense.type} type="button" aria-expanded={active} aria-controls="party-analysis-detail" className={`party-analysis-type ${active ? 'active' : ''} ${section.id === 'defense' && defense.weakCount >= 2 ? 'alert' : ''}`} onClick={() => setSelected(active ? null : `${section.id}:${offense.type}`)}>
            <img src={getTypeBadgeSrc(offense.type)} alt="" /><span>{typeName(offense.type)}</span><strong>{value}{section.id === 'offense' ? `/${analysis.memberCount}` : ` ${text.weak}`}</strong>
          </button>
        })}</div>}
      </div>)}
      {selected ? (() => {
        const [kind, type] = selected.split(':')
        const offense = analysis.offense.find(entry => entry.type === type)
        const defense = analysis.defense.find(entry => entry.type === type)
        if (!offense || !defense) return null
        return <div className="party-analysis-detail" id="party-analysis-detail" role="region" aria-label={`${typeName(type)} ${kind === 'offense' ? text.offense : text.defense}`}>
          <strong>{typeName(type)} · {kind === 'offense' ? text.offense : text.defense}</strong>
          {kind === 'offense' ? <>
            {loading ? <p>{text.loading}</p> : offense.hits.length ? offense.hits.map(hit => <p key={`${hit.slot}-${hit.key}`}>{member(hit)}: {hit.moves.map(move => `${move.name} ${move.multiplier}×`).join(' · ')}</p>) : <p>{text.none}</p>}
            {offense.immune.length ? <p>{text.immune}: {offense.immune.map(hit => `${hit.name} · ${hit.move}`).join(' / ')}</p> : null}
          </> : <>
            <p>{text.weak}: {defense.members.filter(entry => entry.multiplier > 1).map(member)}{!defense.weakCount ? '—' : null}</p>
            <p>{text.safe}: {defense.members.filter(entry => entry.multiplier < 1).map(member)}{!defense.resistCount && !defense.immuneCount ? '—' : null}</p>
            <p>{text.neutral}: {defense.members.filter(entry => entry.multiplier === 1).map(member)}{!defense.neutralCount ? '—' : null}</p>
          </>}
        </div>
      })() : null}
    </>}
    {loading && analysis.memberCount ? <p className="muted">{text.loading}</p> : null}
    {analysis.warnings.length ? <details><summary>{text.warning} ({analysis.warnings.length})</summary><ul>{analysis.warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}</ul></details> : null}
    <small className="muted">{text.caution}</small>
  </section>
}
