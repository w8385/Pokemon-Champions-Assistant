import React from 'react'
import type { EffortStatKey, NatureId, Row, SiteLanguage, StatKey } from '../../app/types'
import type { EffortValues } from '../../domain/samples/myPartyChampionsSamples'
import { CHAMPIONS_EFFORT_CAP, CHAMPIONS_EFFORT_PER_STAT_CAP, natureMultiplier } from '../../domain/champions/buildRules'
import { applyChampionsEffort, championsEffortPreset, maxEffortForStat, totalEffortPoints, type ChampionsEffortPreset } from '../../domain/champions/effortProjection'
import { natureAxes, natureIdForAxes } from '../../domain/champions/natureProjection'
import type { MagicEffortScale } from '../../domain/champions/effortMagic'
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
  ko: { budget: '노력', replace: '전체 배분 교체', base: '종족값', direct: '직접 실수치', clear: '해제', min: '최소', max: '최대', effort: '노력', slider: '슬라이더', lowerNature: '하락 성격 ×0.9', raiseNature: '상승 성격 ×1.1', chooseUp: '상승 능력 선택', chooseDown: '하락 능력 선택', same: '같은 능력치는 동시에 상승·하락할 수 없습니다.', invalid: '입력 오류', close: '조정 닫기', unavailable: '현재 배분에서 도달 불가', current: '현재', positions: '매직 위치', reachable: '현재 가능 최대' },
  en: { budget: 'Effort', replace: 'Replace full spread', base: 'Base', direct: 'Actual override', clear: 'Clear', min: 'MIN', max: 'MAX', effort: 'Effort', slider: 'slider', lowerNature: 'lowering nature ×0.9', raiseNature: 'boosting nature ×1.1', chooseUp: 'Choose boosted stat', chooseDown: 'Choose lowered stat', same: 'One stat cannot be both boosted and lowered.', invalid: 'Invalid', close: 'Close tuning', unavailable: 'Not reachable with this spread', current: 'Current', positions: 'Magic positions', reachable: 'Currently reachable maximum' },
  ja: { budget: '努力', replace: '配分全体を置換', base: '種族値', direct: '実数値を直接入力', clear: '解除', min: '最小', max: '最大', effort: '努力', slider: 'スライダー', lowerNature: '下降補正 ×0.9', raiseNature: '上昇補正 ×1.1', chooseUp: '上昇能力を選択', chooseDown: '下降能力を選択', same: '同じ能力を同時に上昇・下降にはできません。', invalid: '入力エラー', close: '調整を閉じる', unavailable: '現在の配分では到達不可', current: '現在', positions: 'マジック位置', reachable: '現在の上限' },
} satisfies Record<SiteLanguage, Record<string, string>>

function EffortNumberInput({ value, max, label, describedBy, onCommit }: { value: number; max: number; label: string; describedBy?: string; onCommit: (value: number) => void }) {
  const [draft, setDraft] = React.useState(String(value))
  React.useEffect(() => setDraft(String(value)), [value])
  return <input type="number" inputMode="numeric" min={0} max={max} value={draft} aria-label={label} aria-describedby={describedBy}
    onFocus={event => event.currentTarget.select()}
    onChange={event => { const raw = event.target.value; setDraft(raw); if (/^\d+$/.test(raw)) onCommit(Number(raw)) }}
    onBlur={() => setDraft(String(value))} />
}

function EffortSlider({ value, cap, label, descriptionId, description, magicScale, onCommit }: {
  value: number
  cap: number
  label: string
  descriptionId: string
  description: string
  magicScale?: MagicEffortScale | null
  onCommit: (value: number) => number
}) {
  const recommendation = magicScale?.recommendation
  const target = recommendation && recommendation.kind !== 'blocked' ? recommendation.point.effort : null
  const reached = recommendation?.kind === 'reached'
  const inputMax = Math.max(value, cap)
  const inputWidth = `calc(${(inputMax / CHAMPIONS_EFFORT_PER_STAT_CAP) * 100}% + var(--effort-thumb-size))`
  return <>
    <span id={descriptionId} className="visually-hidden">{description}</span>
    <div className={`quick-compact-effort-slider ${reached && target === value ? 'magic-reached' : ''}`.trim()}>
      <div className="quick-compact-effort-bounds">
        <div className="quick-compact-effort-scale" aria-hidden="true">
          <span className="quick-compact-effort-reachable" style={{ width: `${(cap / CHAMPIONS_EFFORT_PER_STAT_CAP) * 100}%` }} />
          <span className="quick-compact-effort-filled" style={{ width: `${(value / CHAMPIONS_EFFORT_PER_STAT_CAP) * 100}%` }} />
          {magicScale?.points.map(point => <i key={point.effort} className={[point.reachable ? 'reachable' : 'locked', target === point.effort ? 'target' : '', reached && value === point.effort ? 'reached' : ''].filter(Boolean).join(' ')} style={{ left: `${(point.effort / CHAMPIONS_EFFORT_PER_STAT_CAP) * 100}%` }} />)}
        </div>
        <input type="range" min={0} max={inputMax} step={1} value={value} disabled={inputMax === 0}
          style={{ width: inputWidth }} aria-label={label} aria-describedby={descriptionId}
          aria-valuemin={0} aria-valuemax={inputMax} aria-valuenow={value} aria-valuetext={`${value}/${inputMax}`}
          onChange={event => { const legal = onCommit(event.currentTarget.valueAsNumber); event.currentTarget.value = String(legal) }} />
      </div>
    </div>
  </>
}

export function CompactStatEditor({ identity, row, stats, evs, nature, language, showPresets = true, sampleStyle = false, actualValue, effectiveNatureMultiplier, onEffort, onSpread, onNature, override, onOverride, magicScale }: {
  identity: string
  row: Row
  stats: CardStat[]
  evs: EffortValues
  nature: NatureId
  language: SiteLanguage
  showPresets?: boolean
  sampleStyle?: boolean
  actualValue: (key: EffortStatKey, effort?: number) => number | null
  effectiveNatureMultiplier?: (key: EffortStatKey) => number
  onEffort: (key: EffortStatKey, value: number) => void
  onSpread: (values: EffortValues) => void
  onNature: (nature: NatureId) => void
  override?: Partial<Record<EffortStatKey, string>>
  onOverride?: (key: EffortStatKey, value: string) => void
  magicScale?: MagicEffortScale | null
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
  React.useEffect(() => { returnFocus.current = null; setSelected(null); setPendingNature(null); setShowActual(false); setNotice('') }, [identity])
  React.useEffect(() => { setPendingNature(null); setNotice('') }, [nature])
  React.useEffect(() => {
    if (selected) {
      rootRef.current?.querySelector<HTMLElement>(`#${tunerId}-${selected}`)?.focus()
      return
    }
    const key = returnFocus.current
    returnFocus.current = null
    if (key) rootRef.current?.querySelector<HTMLButtonElement>(`button[data-stat-key="${key}"]`)?.focus()
  }, [selected, tunerId])

  const setEffort = (key: EffortStatKey, value: number) => {
    setNotice('')
    const legal = applyChampionsEffort(evs, key, value)[key]
    onEffort(key, legal)
    return legal
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
  const factor = !selected || selected === 'hp' ? 1 : (effectiveNatureMultiplier?.(selected) ?? natureMultiplier(nature, selected))
  const selectedMagic = selected && magicScale?.stat === selected ? magicScale : null
  const effortDescription = (name: string, effort: number, effortCap: number, scale?: MagicEffortScale | null) =>
    `${text.current} ${effort}/${CHAMPIONS_EFFORT_PER_STAT_CAP}; ${text.reachable} ${scale?.reachableMax === null ? text.unavailable : effortCap}${scale ? `; ${text.positions} ${scale.points.length ? scale.points.map(point => point.effort).join(', ') : text.unavailable}` : ''}`

  const tuneContent = selected && selectedPresentation ? (() => {
    const scaleId = `${tunerId}-${selected}-effort-scale`
    const description = effortDescription(selectedName, current, cap, selectedMagic)
    return <div className={`quick-compact-tile-editor ${statThemeClass(selected)} ${selected === 'hp' ? 'hp' : ''}`.trim()}>
      <div className="quick-compact-tile-head">
        <div className="quick-compact-tile-value"><span>{selected === 'hp' ? 'HP' : selectedName}</span>{onOverride
          ? <button type="button" aria-label={`${selectedName} ${text.direct}`} aria-expanded={showActual} onClick={() => setShowActual(currentValue => !currentValue)}><strong>{value ?? text.invalid}</strong>{raw !== undefined ? <i>●</i> : null}</button>
          : <strong>{value ?? text.invalid}</strong>}</div>
        <small className="quick-compact-tile-base"><span>{text.base}</span><strong>{row[selected]}</strong></small>
        <button type="button" className="quick-compact-tile-close" aria-label={text.close} onClick={closeStat}><UiIcon name="close" size={13} /></button>
      </div>
      {onOverride && showActual ? <div className="quick-compact-tile-actual-edit"><input autoFocus aria-label={text.direct} type="number" inputMode="numeric" min={1} max={999} value={raw ?? ''} placeholder={String(actualValue(selected, current) ?? '')} aria-invalid={raw !== undefined && value === null} onChange={event => onOverride(selected, event.target.value)} />{raw !== undefined ? <button type="button" onClick={() => { onOverride(selected, ''); setShowActual(false) }}>{text.clear}</button> : null}</div>
        : selected === 'hp' ? <div className="quick-compact-tile-middle-label"><span>{text.effort}</span></div>
          : pendingNature ? <div className="quick-compact-tile-partner" role="group" aria-label={pendingNature.axis === 'up' ? text.chooseDown : text.chooseUp}>{natureStats.map(stat => {
            const label = translateText(language, stat.label)
            const axis = pendingNature.axis === 'up' ? 'down' : 'up'
            const short = stat.key === 'spAttack' ? 'C' : stat.key === 'spDefense' ? 'D' : stat.key === 'speed' ? 'S' : stat.key === 'attack' ? 'A' : 'B'
            if (stat.key === pendingNature.stat) return <span key={stat.key} className="nature-impossible" title={text.same} aria-label={`${label} · ${text.same}`}>—</span>
            return <button key={stat.key} type="button" aria-label={`${axis === 'up' ? '↑' : '↓'} ${label}`} onClick={() => chooseNatureAxis(axis, stat.key)}>{axis === 'up' ? '↑' : '↓'}{short}</button>
          })}</div>
            : <div className="quick-compact-tile-nature" role="group" aria-label={`${selectedName} ${translateText(language, '성격 보정')}`}>
              <button type="button" className="nature-down" title={text.lowerNature} aria-label={`${selectedName} · ${text.lowerNature}`} aria-pressed={factor === .9} onClick={() => chooseNatureAxis('down', selected as StatKey)}><span aria-hidden="true">↓</span></button>
              <button type="button" className="nature-up" title={text.raiseNature} aria-label={`${selectedName} · ${text.raiseNature}`} aria-pressed={factor === 1.1} onClick={() => chooseNatureAxis('up', selected as StatKey)}><span aria-hidden="true">↑</span></button>
            </div>}
      <div className="quick-compact-effort-zone" role="group" aria-label={`${selectedName} ${text.effort}`}>
        <EffortSlider value={current} cap={cap} label={`${selectedName} ${text.effort} ${text.slider}`} descriptionId={scaleId} description={description} magicScale={selectedMagic} onCommit={next => setEffort(selected, next)} />
        <div className="quick-compact-tile-effort">
          <button type="button" disabled={current === 0} aria-label={`${selectedName} ${text.min} 0`} onClick={() => setEffort(selected, 0)}>⇊</button>
          <button type="button" disabled={current === 0} aria-label={`${selectedName} -1`} onClick={() => setEffort(selected, current - 1)}>−</button>
          <EffortNumberInput value={current} max={cap} label={`${selectedName} ${text.effort}`} describedBy={scaleId} onCommit={next => setEffort(selected, next)} />
          <button type="button" disabled={current >= cap} aria-label={`${selectedName} +1`} onClick={() => setEffort(selected, current + 1)}>＋</button>
          <button type="button" disabled={current >= cap} aria-label={`${selectedName} ${text.max} ${cap}`} onClick={() => setEffort(selected, cap)}>⇈</button>
        </div>
      </div>
    </div>
  })() : null

  const renderPreview = (stat: CardStat, open: () => void) => {
    const effort = evs[stat.key]
    const effortCap = maxEffortForStat(evs, stat.key)
    const statMagic = magicScale?.stat === stat.key ? magicScale : null
    const descriptionId = `${tunerId}-${stat.key}-effort-scale`
    const description = effortDescription(stat.label, effort, effortCap, statMagic)
    const statFactor = stat.key === 'hp' ? 1 : (effectiveNatureMultiplier?.(stat.key) ?? natureMultiplier(nature, stat.key))
    return <div className="quick-compact-tile-preview">
      <button type="button" className="quick-compact-preview-open" data-stat-key={stat.key} aria-expanded="false" aria-controls={`${tunerId}-${stat.key}`} aria-label={`${stat.label} · ${stat.value ?? text.invalid} · ${text.base} ${row[stat.key]}`} onClick={open}>
        <span className="quick-compact-tile-value"><span>{stat.label}</span><strong>{stat.value ?? text.invalid}</strong></span>
        <small className="quick-compact-tile-base"><span>{text.base}</span><strong>{row[stat.key]}</strong></small>
        <UiIcon name="chevron" size={13} />
      </button>
      <div className="quick-compact-preview-label"><span>{text.effort}</span>{stat.key !== 'hp' && statFactor !== 1 ? <span className={statFactor === 1.1 ? 'nature-up' : 'nature-down'} role="img" aria-label={statFactor === 1.1 ? text.raiseNature : text.lowerNature}>{statFactor === 1.1 ? '↑' : '↓'}</span> : null}</div>
      <div className="quick-compact-effort-zone">
        <EffortSlider value={effort} cap={effortCap} label={`${stat.label} ${text.effort} ${text.slider}`} descriptionId={descriptionId} description={description} magicScale={statMagic} onCommit={next => setEffort(stat.key, next)} />
        <div className="quick-compact-preview-footer"><span>EV <strong>{effort}</strong></span><span>{text.max} <strong>{effortCap}</strong></span></div>
      </div>
    </div>
  }

  return <div ref={rootRef} className="quick-compact-stat-editor">
    <div className={`quick-compact-stat-toolbar ${showPresets ? '' : 'presets-hidden'}`.trim()}>
      <output aria-live="polite"><span>{text.budget}</span><strong>{used}/{CHAMPIONS_EFFORT_CAP}</strong></output>
      {showPresets ? <div className="quick-compact-presets" role="group" aria-label={text.replace}>{presetIds.map(id => <button key={id} type="button" title={`${text.replace}: ${presets[id].detail}`} aria-label={`${presets[id].label} · ${presets[id].detail}`} aria-pressed={activePreset === id} onClick={() => applyPreset(id)}>{presets[id].label}</button>)}</div> : null}
      <span className="visually-hidden" role="status" aria-live="polite">{notice}</span>
    </div>
    <PokemonStatGrid stats={stats} showEffort sampleStyle={sampleStyle} onTune={openStat} tuneExpandedKey={selected} tuneControls={selected ? `${tunerId}-${selected}` : undefined} renderTune={() => tuneContent} renderPreview={renderPreview} />
  </div>
}
