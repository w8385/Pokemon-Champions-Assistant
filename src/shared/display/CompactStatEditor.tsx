import React from 'react'
import type { EffortStatKey, NatureId, Row, SiteLanguage, StatKey } from '../../app/types'
import type { EffortValues } from '../../domain/samples/myPartyChampionsSamples'
import { CHAMPIONS_EFFORT_CAP, natureMultiplier } from '../../domain/champions/buildRules'
import { applyChampionsEffort, championsEffortPreset, maxEffortForStat, totalEffortPoints, type ChampionsEffortPreset } from '../../domain/champions/effortProjection'
import { natureAxes, natureIdForAxes } from '../../domain/champions/natureProjection'
import type { MagicEffortCandidate } from '../../domain/champions/effortMagic'
import { natureLabel, statThemeClass } from './formatters'
import { PokemonStatGrid, type CardStat } from './PokemonCardOverview'
import { STAT_PRESENTATION } from './statPresentation'
import { translateText } from './translation'
import { UiIcon } from './UiIcon'

type PendingNature = { axis: 'up' | 'down'; stat: StatKey } | null

const natureStats = STAT_PRESENTATION.filter((stat): stat is typeof stat & { key: StatKey } => stat.key !== 'hp')
const presetIds: ChampionsEffortPreset[] = ['hb', 'hd', 'as', 'cs', 'max-speed', 'clear']
const presets: Record<ChampionsEffortPreset, { label: string; detail: string }> = {
  hb: { label: 'HB', detail: 'H32 · B32' }, hd: { label: 'HD', detail: 'H32 · D32' },
  as: { label: 'AS', detail: 'A32 · S32' }, cs: { label: 'CS', detail: 'C32 · S32' },
  'max-speed': { label: 'S', detail: 'S32' }, clear: { label: '0', detail: 'ALL 0' },
}

const copy = {
  ko: { budget: '노력', replace: '전체 배분 교체', base: '종족값', direct: '직접 실수치', clear: '해제', min: '최소', max: '최대', effort: '노력', chooseUp: '상승 능력 선택', chooseDown: '하락 능력 선택', same: '같은 능력치는 동시에 상승·하락할 수 없습니다.', invalid: '입력 오류', close: '조정 닫기', magic: '매직넘버', achieved: '달성', apply: '적용', unavailable: '현재 배분에서 도달 불가' },
  en: { budget: 'Effort', replace: 'Replace full spread', base: 'Base', direct: 'Actual override', clear: 'Clear', min: 'MIN', max: 'MAX', effort: 'Effort', chooseUp: 'Choose boosted stat', chooseDown: 'Choose lowered stat', same: 'One stat cannot be both boosted and lowered.', invalid: 'Invalid', close: 'Close tuning', magic: 'Magic number', achieved: 'Reached', apply: 'Apply', unavailable: 'Not reachable with this spread' },
  ja: { budget: '努力', replace: '配分全体を置換', base: '種族値', direct: '実数値を直接入力', clear: '解除', min: '最小', max: '最大', effort: '努力', chooseUp: '上昇能力を選択', chooseDown: '下降能力を選択', same: '同じ能力を同時に上昇・下降にはできません。', invalid: '入力エラー', close: '調整を閉じる', magic: 'マジックナンバー', achieved: '達成', apply: '適用', unavailable: '現在の配分では到達不可' },
} satisfies Record<SiteLanguage, Record<string, string>>

function EffortNumberInput({ value, max, label, onCommit }: { value: number; max: number; label: string; onCommit: (value: number) => void }) {
  const [draft, setDraft] = React.useState(String(value))
  React.useEffect(() => setDraft(String(value)), [value])
  return <input type="number" inputMode="numeric" min={0} max={max} value={draft} aria-label={label}
    onFocus={event => event.currentTarget.select()}
    onChange={event => { const raw = event.target.value; setDraft(raw); if (/^\d+$/.test(raw)) onCommit(Number(raw)) }}
    onBlur={() => setDraft(String(value))} />
}

export function CompactStatEditor({ identity, row, stats, evs, nature, language, showPresets = true, sampleStyle = false, actualValue, onEffort, onSpread, onNature, override, onOverride, magicCandidate, magicPoints }: {
  identity: string
  row: Row
  stats: CardStat[]
  evs: EffortValues
  nature: NatureId
  language: SiteLanguage
  showPresets?: boolean
  sampleStyle?: boolean
  actualValue: (key: EffortStatKey, effort?: number) => number | null
  onEffort: (key: EffortStatKey, value: number) => void
  onSpread: (values: EffortValues) => void
  onNature: (nature: NatureId) => void
  override?: Partial<Record<EffortStatKey, string>>
  onOverride?: (key: EffortStatKey, value: string) => void
  magicCandidate?: MagicEffortCandidate | null
  magicPoints?: (key: EffortStatKey) => readonly number[]
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const returnFocus = React.useRef<EffortStatKey | null>(null)
  const [selected, setSelected] = React.useState<EffortStatKey | null>(null)
  const [pendingNature, setPendingNature] = React.useState<PendingNature>(null)
  const [showActual, setShowActual] = React.useState(false)
  const [notice, setNotice] = React.useState('')
  const tunerId = `compact-stat-tuner-${React.useId().replace(/:/g, '')}`
  const text = copy[language]
  const used = totalEffortPoints(evs)
  const activePreset = presetIds.find(id => {
    const values = championsEffortPreset(id)
    return STAT_PRESENTATION.every(stat => values[stat.key] === evs[stat.key])
  })
  const magicTarget = (() => {
    if (!magicCandidate) return null
    const key = magicCandidate.stat
    const cap = maxEffortForStat(evs, key)
    const legal = [...new Set([0, ...(magicPoints?.(key) ?? [])])]
      .filter(effort => effort <= cap && actualValue(key, effort) !== null && actualValue(key, effort)! % 11 === 0)
    const effort = magicCandidate.reached
      ? magicCandidate.currentEffort
      : magicCandidate.nextEffort ?? [...legal].reverse().find(point => point < magicCandidate.currentEffort) ?? null
    if (effort === null) return null
    const actual = actualValue(key, effort)
    return actual === null ? null : { stat: key, effort, actual, reached: effort === magicCandidate.currentEffort && magicCandidate.reached }
  })()
  const visibleStats = stats.map(stat => stat.key === magicTarget?.stat
    ? { ...stat, meta: <span className={`stat-preview-magic ${magicTarget.reached ? 'reached' : ''}`}>◆ {magicTarget.actual}</span> }
    : stat)

  React.useEffect(() => { returnFocus.current = null; setSelected(null); setPendingNature(null); setShowActual(false); setNotice('') }, [identity])
  React.useEffect(() => { setPendingNature(null); setNotice('') }, [nature])
  React.useEffect(() => {
    if (selected) {
      rootRef.current?.querySelector<HTMLElement>(`#${tunerId}`)?.focus()
      return
    }
    const key = returnFocus.current
    returnFocus.current = null
    if (key) rootRef.current?.querySelector<HTMLButtonElement>(`button[data-stat-key="${key}"]`)?.focus()
  }, [selected, nature, tunerId])

  const setEffort = (key: EffortStatKey, value: number) => {
    setNotice('')
    onEffort(key, applyChampionsEffort(evs, key, value)[key])
  }
  const applyPreset = (id: ChampionsEffortPreset) => {
    onSpread(championsEffortPreset(id))
    setNotice(`${presets[id].label} · ${presets[id].detail}`)
  }
  const setNature = (next: NatureId) => {
    onNature(next)
    setPendingNature(null)
    setNotice(natureLabel(next, language))
  }
  const chooseNatureAxis = (axis: 'up' | 'down', stat: StatKey) => {
    const axes = natureAxes(nature)
    if (pendingNature) {
      if (pendingNature.axis === axis) { setPendingNature({ axis, stat }); setNotice(axis === 'up' ? text.chooseDown : text.chooseUp); return }
      const up = axis === 'up' ? stat : pendingNature.stat
      const down = axis === 'down' ? stat : pendingNature.stat
      const next = natureIdForAxes(up, down)
      if (!next) { setNotice(text.same); return }
      setNature(next); return
    }
    const currentAxis = axis === 'up' ? axes.up : axes.down
    if (currentAxis === stat) { setNotice(natureLabel(nature, language)); return }
    const oppositeAxis = axis === 'up' ? axes.down : axes.up
    if (!oppositeAxis || oppositeAxis === stat) {
      setPendingNature({ axis, stat })
      setNotice(axis === 'up' ? text.chooseDown : text.chooseUp)
      return
    }
    const up = axis === 'up' ? stat : oppositeAxis
    const down = axis === 'down' ? stat : oppositeAxis
    const next = natureIdForAxes(up, down)
    if (!next) { setNotice(text.same); return }
    setNature(next)
  }
  const openStat = (key: EffortStatKey) => {
    setSelected(current => current === key ? null : key)
    setPendingNature(null); setShowActual(false); setNotice('')
  }
  const closeStat = () => {
    returnFocus.current = selected
    setSelected(null)
  }

  const selectedPresentation = selected ? STAT_PRESENTATION.find(stat => stat.key === selected) : null
  const selectedName = selectedPresentation ? translateText(language, selectedPresentation.label) : ''
  const current = selected ? evs[selected] : 0
  const cap = selected ? maxEffortForStat(evs, selected) : 0
  const value = selected ? actualValue(selected) : null
  const raw = selected ? override?.[selected] : undefined
  const factor = !selected || selected === 'hp' ? 1 : natureMultiplier(nature, selected)
  const selectedMagic = selected && magicCandidate?.stat === selected ? magicCandidate : null

  const tuneContent = selected && selectedPresentation ? <div className={`quick-compact-tile-editor ${statThemeClass(selected)} ${selected === 'hp' ? 'hp' : ''}`.trim()}>
    <div className="quick-compact-tile-head">
      <div className="quick-compact-tile-value"><span>{selected === 'hp' ? 'HP' : selectedName}</span>{onOverride
        ? <button type="button" aria-label={`${selectedName} ${text.direct}`} aria-expanded={showActual} onClick={() => setShowActual(currentValue => !currentValue)}><strong>{value ?? text.invalid}</strong>{raw !== undefined ? <i>●</i> : null}</button>
        : <strong>{value ?? text.invalid}</strong>}</div>
      <small className="quick-compact-tile-base"><span>{text.base}</span><strong>{row[selected]}</strong></small>
      {selectedMagic ? magicTarget ? magicTarget.reached
        ? <span className="quick-compact-tile-magic active" title={`${text.magic} ${magicTarget.actual} · ${magicTarget.effort}pt · ${text.achieved}`}>◆ <strong>{magicTarget.actual}</strong><small>{magicTarget.effort}</small></span>
        : <button type="button" className="quick-compact-tile-magic" title={`${text.magic} ${magicTarget.actual} · ${magicTarget.effort}pt · ${text.apply}`} aria-label={`${text.magic} ${magicTarget.actual} · ${magicTarget.effort}pt · ${text.apply}`} onClick={() => setEffort(selected, magicTarget.effort)}>◆ <strong>{magicTarget.actual}</strong><small>{magicTarget.effort}</small></button>
        : <span className="quick-compact-tile-magic unavailable" title={text.unavailable} aria-label={`${text.magic} · ${text.unavailable}`}>◆ <strong>—</strong></span>
        : null}
      <button type="button" className="quick-compact-tile-close" aria-label={text.close} onClick={closeStat}><UiIcon name="close" size={13} /></button>
    </div>
    {onOverride && showActual ? <div className="quick-compact-tile-actual-edit"><input autoFocus aria-label={text.direct} type="number" inputMode="numeric" min={1} max={999} value={raw ?? ''} placeholder={String(actualValue(selected, current) ?? '')} aria-invalid={raw !== undefined && value === null} onChange={event => onOverride(selected, event.target.value)} />{raw !== undefined ? <button type="button" onClick={() => { onOverride(selected, ''); setShowActual(false) }}>{text.clear}</button> : null}</div>
      : selected === 'hp' ? null
        : pendingNature ? <div className="quick-compact-tile-partner" role="group" aria-label={pendingNature.axis === 'up' ? text.chooseDown : text.chooseUp}>{natureStats.map(stat => {
          const label = translateText(language, stat.label)
          const axis = pendingNature.axis === 'up' ? 'down' : 'up'
          const short = stat.key === 'spAttack' ? 'C' : stat.key === 'spDefense' ? 'D' : stat.key === 'speed' ? 'S' : stat.key === 'attack' ? 'A' : 'B'
          if (stat.key === pendingNature.stat) return <span key={stat.key} className="nature-impossible" title={text.same} aria-label={`${label} · ${text.same}`}>—</span>
          return <button key={stat.key} type="button" aria-label={`${axis === 'up' ? '↑' : '↓'} ${label}`} onClick={() => chooseNatureAxis(axis, stat.key)}>{axis === 'up' ? '↑' : '↓'}{short}</button>
        })}</div>
          : <div className="quick-compact-tile-nature" role="group" aria-label={`${selectedName} ${translateText(language, '성격 보정')}`}>
            <button type="button" className="nature-down" aria-pressed={factor === .9} onClick={() => chooseNatureAxis('down', selected as StatKey)}>↓ .9</button>
            <button type="button" className="nature-up" aria-pressed={factor === 1.1} onClick={() => chooseNatureAxis('up', selected as StatKey)}>↑ 1.1</button>
          </div>}
    <div className="quick-compact-tile-effort" role="group" aria-label={`${selectedName} ${text.effort}`}>
      <button type="button" disabled={current === 0} aria-label={`${selectedName} ${text.min} 0`} onClick={() => setEffort(selected, 0)}>⇊</button>
      <button type="button" disabled={current === 0} aria-label={`${selectedName} -1`} onClick={() => setEffort(selected, current - 1)}>−</button>
      <EffortNumberInput value={current} max={cap} label={`${selectedName} ${text.effort}`} onCommit={next => setEffort(selected, next)} />
      <button type="button" disabled={current >= cap} aria-label={`${selectedName} +1`} onClick={() => setEffort(selected, current + 1)}>＋</button>
      <button type="button" disabled={current >= cap} aria-label={`${selectedName} ${text.max} ${cap}`} onClick={() => setEffort(selected, cap)}>⇈</button>
    </div>
  </div> : null

  return <div ref={rootRef} className="quick-compact-stat-editor">
    <div className={`quick-compact-stat-toolbar ${showPresets ? '' : 'presets-hidden'}`.trim()}>
      <output aria-live="polite"><span>{text.budget}</span><strong>{used}/{CHAMPIONS_EFFORT_CAP}</strong></output>
      {showPresets ? <div className="quick-compact-presets" role="group" aria-label={text.replace}>{presetIds.map(id => <button key={id} type="button" title={`${text.replace}: ${presets[id].detail}`} aria-label={`${presets[id].label} · ${presets[id].detail}`} aria-pressed={activePreset === id} onClick={() => applyPreset(id)}>{presets[id].label}</button>)}</div> : null}
      <span className="visually-hidden" role="status" aria-live="polite">{notice}</span>
    </div>
    <PokemonStatGrid stats={visibleStats} showEffort sampleStyle={sampleStyle} onTune={openStat} tuneExpandedKey={selected} tuneControls={selected ? tunerId : undefined} renderTune={() => tuneContent} />
  </div>
}
