import React from 'react'
import type { EffortStatKey, NatureId, SiteLanguage, StatKey } from '../../app/types'
import type { EffortValues } from '../../domain/samples/myPartyChampionsSamples'
import { CHAMPIONS_EFFORT_PER_STAT_CAP, natureMultiplier } from '../../domain/champions/buildRules'
import { applyChampionsEffort, championsEffortPreset, maxEffortForStat, type ChampionsEffortPreset } from '../../domain/champions/effortProjection'
import { natureIdAfterAxisClick } from '../../domain/champions/natureProjection'
import { magicEffortScale, type MagicEffortScale } from '../../domain/champions/effortMagic'
import { natureLabel } from './formatters'
import { PokemonStatGrid, type CardStat } from './PokemonCardOverview'
import { STAT_PRESENTATION } from './statPresentation'
import { translateText } from './translation'

type EffortDraft = { key: EffortStatKey; value: number } | null
const statCode: Record<EffortStatKey, string> = { hp: 'H', attack: 'A', defense: 'B', spAttack: 'C', spDefense: 'D', speed: 'S' }

const presetIds: ChampionsEffortPreset[] = ['hb', 'hd', 'as', 'cs', 'max-speed', 'clear']
const presets: Record<ChampionsEffortPreset, { label: string; detail: string }> = {
  hb: { label: 'HB', detail: 'H32 · B32' }, hd: { label: 'HD', detail: 'H32 · D32' },
  as: { label: 'AS', detail: 'A32 · S32' }, cs: { label: 'CS', detail: 'C32 · S32' },
  'max-speed': { label: 'S', detail: 'S32' }, clear: { label: '0', detail: 'ALL 0' },
}

const copy = {
  ko: { replace: '전체 배분 교체', effort: '노력', nature: '성격', slider: '슬라이더', lowerNature: '하락 성격 ×0.9', raiseNature: '상승 성격 ×1.1', invalid: '입력 오류', unavailable: '현재 배분에서 도달 불가', current: '현재', actual: '실수치', positions: '매직 위치', reachable: '현재 가능 최대', locked: '잠김', reached: '매직 도달', base: '종' },
  en: { replace: 'Replace full spread', effort: 'Effort', nature: 'Nature', slider: 'slider', lowerNature: 'lowering nature ×0.9', raiseNature: 'boosting nature ×1.1', invalid: 'Invalid', unavailable: 'Not reachable with this spread', current: 'Current', actual: 'actual', positions: 'Magic positions', reachable: 'Currently reachable maximum', locked: 'locked', reached: 'Magic reached', base: 'Base' },
  ja: { replace: '配分全体を置換', effort: '努力', nature: '性格', slider: 'スライダー', lowerNature: '下降補正 ×0.9', raiseNature: '上昇補正 ×1.1', invalid: '入力エラー', unavailable: '現在の配分では到達不可', current: '現在', actual: '実数値', positions: 'マジック位置', reachable: '現在の上限', locked: 'ロック', reached: 'マジック到達', base: '種' },
} satisfies Record<SiteLanguage, Record<string, string>>

function EffortSlider({ value, cap, label, descriptionId, description, magicScale, onPreview, onCommit, onCancel }: {
  value: number
  cap: number
  label: string
  descriptionId: string
  description: string
  magicScale?: MagicEffortScale | null
  onPreview: (value: number) => number
  onCommit: (value: number) => number
  onCancel: () => void
}) {
  const pointerActive = React.useRef(false)
  const reached = magicScale?.recommendation.kind === 'reached'
  return <>
    <span id={descriptionId} className="visually-hidden">{description}</span>
    <div className={`quick-compact-effort-slider${reached ? ' magic-reached' : ''}`}>
      <div className="quick-compact-effort-bounds">
        <div className="quick-compact-effort-scale" aria-hidden="true">
          <span className="quick-compact-effort-reachable" style={{ width: `${(cap / CHAMPIONS_EFFORT_PER_STAT_CAP) * 100}%` }} />
          <span className="quick-compact-effort-filled" style={{ width: `${(value / CHAMPIONS_EFFORT_PER_STAT_CAP) * 100}%` }} />
          {magicScale?.points.map(point => <i key={point.effort} className={[point.reachable ? 'reachable' : 'locked', reached && value === point.effort ? 'reached' : ''].filter(Boolean).join(' ')} style={{ left: `${(point.effort / CHAMPIONS_EFFORT_PER_STAT_CAP) * 100}%` }} />)}
        </div>
        <input type="range" min={0} max={CHAMPIONS_EFFORT_PER_STAT_CAP} step={1} value={value} disabled={cap === 0 && value === 0}
          data-legal-max={cap} aria-label={label} aria-describedby={descriptionId}
          aria-valuemin={0} aria-valuemax={CHAMPIONS_EFFORT_PER_STAT_CAP} aria-valuenow={value}
          onPointerDown={event => { if (event.isPrimary) pointerActive.current = true }}
          onChange={event => { const legal = pointerActive.current ? onPreview(event.currentTarget.valueAsNumber) : onCommit(event.currentTarget.valueAsNumber); event.currentTarget.value = String(legal) }}
          onPointerUp={event => { if (!pointerActive.current) return; pointerActive.current = false; event.currentTarget.value = String(onCommit(event.currentTarget.valueAsNumber)) }}
          onPointerCancel={event => { if (!pointerActive.current) return; pointerActive.current = false; onCancel(); event.currentTarget.value = String(value) }}
          onLostPointerCapture={event => { if (!pointerActive.current) return; pointerActive.current = false; event.currentTarget.value = String(onCommit(event.currentTarget.valueAsNumber)) }}
          onBlur={event => { if (!pointerActive.current) return; pointerActive.current = false; event.currentTarget.value = String(onCommit(event.currentTarget.valueAsNumber)) }} />
      </div>
    </div>
  </>
}

export function CompactStatEditor({ identity, stats, evs, nature, language, showPresets = true, sampleStyle = false, actualValue, effectiveNatureMultiplier, onEffort, onSpread, onNature, magicScale }: {
  identity: string
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
  magicScale?: MagicEffortScale | null
}) {
  const [effortDraft, setEffortDraft] = React.useState<EffortDraft>(null)
  const [notice, setNotice] = React.useState('')
  const editorId = `compact-stat-${React.useId().replace(/:/g, '')}`
  const text = copy[language]
  const previewEvs = effortDraft ? applyChampionsEffort(evs, effortDraft.key, effortDraft.value) : evs
  const activePreset = presetIds.find(id => {
    const values = championsEffortPreset(id)
    return STAT_PRESENTATION.every(stat => values[stat.key] === previewEvs[stat.key])
  })
  React.useEffect(() => { setEffortDraft(null); setNotice('') }, [identity])
  React.useEffect(() => { setNotice('') }, [nature])

  const setEffort = (key: EffortStatKey, value: number) => {
    setNotice('')
    const legal = applyChampionsEffort(evs, key, value)[key]
    setEffortDraft(null)
    if (legal !== evs[key]) onEffort(key, legal)
    return legal
  }
  const previewEffort = (key: EffortStatKey, value: number) => {
    const legal = applyChampionsEffort(evs, key, value)[key]
    setEffortDraft({ key, value: legal })
    return legal
  }
  const applyPreset = (id: ChampionsEffortPreset) => {
    setEffortDraft(null)
    onSpread(championsEffortPreset(id))
    setNotice(`${presets[id].label} · ${presets[id].detail}`)
  }
  const setNature = (next: NatureId) => {
    onNature(next)
    setNotice(natureLabel(next, language))
  }
  const chooseNatureAxis = (axis: 'up' | 'down', stat: StatKey) => {
    const next = natureIdAfterAxisClick(nature, axis, stat)
    if (next === nature) { setNotice(natureLabel(nature, language)); return }
    setNature(next)
  }
  const renderNatureControls = (stat: StatKey, name: string) => {
    const factor = effectiveNatureMultiplier?.(stat) ?? natureMultiplier(nature, stat)
    const actualUp = factor === 1.1
    const actualDown = factor === .9
    return <div className="quick-compact-tile-nature" role="group" aria-label={`${name} ${text.nature}`}>
      <button type="button" className="nature-up" title={text.raiseNature} aria-label={`${name} · ${text.raiseNature}`} aria-pressed={actualUp} onClick={() => chooseNatureAxis('up', stat)}><span aria-hidden="true">↑</span></button>
      <button type="button" className="nature-down" title={text.lowerNature} aria-label={`${name} · ${text.lowerNature}`} aria-pressed={actualDown} onClick={() => chooseNatureAxis('down', stat)}><span aria-hidden="true">↓</span></button>
    </div>
  }

  const effortDescription = (name: string, effort: number, effortCap: number, scale?: MagicEffortScale | null) => {
    const base = `${name}; ${text.current} ${effort}/${CHAMPIONS_EFFORT_PER_STAT_CAP}; ${text.reachable} ${scale?.reachableMax === null ? text.unavailable : effortCap}`
    if (!scale) return base
    const reached = scale.recommendation.kind === 'reached'
      ? `${text.reached}: ${scale.recommendation.point.effort}, ${text.actual} ${scale.recommendation.point.actual}`
      : ''
    const points = scale.points.length ? scale.points.map(point => `${point.effort}${point.reachable ? '' : ` ${text.locked}`}`).join(', ') : text.unavailable
    return `${base}${reached ? `; ${reached}` : ''}; ${text.positions} ${points}`
  }

  const renderPreview = (stat: CardStat) => {
    const effort = previewEvs[stat.key]
    const effortCap = maxEffortForStat(previewEvs, stat.key)
    const statMagic = magicScale?.stat === stat.key
      ? magicEffortScale(stat.key, previewEvs, next => actualValue(stat.key, next) ?? 0)
      : null
    const presentation = STAT_PRESENTATION.find(item => item.key === stat.key)
    const name = presentation ? translateText(language, presentation.label) : stat.label
    const descriptionId = `${editorId}-${stat.key}-effort-scale`
    const description = effortDescription(name, effort, effortCap, statMagic)
    const displayValue = effortDraft?.key === stat.key ? actualValue(stat.key, effort) : stat.value
    return <div className="quick-compact-tile-preview">
      <div className="quick-compact-tile-head">
        <span className="quick-compact-tile-value"><span data-stat-code={statCode[stat.key]}>{name}</span><strong>{displayValue ?? text.invalid}</strong>{stat.base === undefined ? null : <small className="quick-compact-speed-base" aria-label={`${name} ${text.base} ${stat.base}`}>{text.base} {stat.base}</small>}</span>
        {stat.key === 'hp' ? null : renderNatureControls(stat.key as StatKey, name)}
      </div>
      <div className="quick-compact-effort-row">
        <EffortSlider value={effort} cap={effortCap} label={`${name} ${text.effort} ${text.slider}`} descriptionId={descriptionId} description={description} magicScale={statMagic} onPreview={next => previewEffort(stat.key, next)} onCommit={next => setEffort(stat.key, next)} onCancel={() => setEffortDraft(null)} />
        <output className="quick-compact-effort-value" aria-label={`${name} ${text.effort} ${effort}/${CHAMPIONS_EFFORT_PER_STAT_CAP}`}><strong>{effort}</strong><small aria-hidden="true">/{CHAMPIONS_EFFORT_PER_STAT_CAP}</small></output>
      </div>
    </div>
  }

  return <div className="quick-compact-stat-editor">
    <span className="visually-hidden" role="status" aria-live="polite">{notice}</span>
    <PokemonStatGrid stats={stats} showEffort sampleStyle={sampleStyle} onTune={() => undefined} renderPreview={renderPreview} />
    {showPresets ? <div className="quick-compact-stat-toolbar"><div className="quick-compact-presets" role="group" aria-label={text.replace}>{presetIds.map(id => <button key={id} type="button" title={`${text.replace}: ${presets[id].detail}`} aria-label={`${presets[id].label} · ${presets[id].detail}`} aria-pressed={activePreset === id} onClick={() => applyPreset(id)}>{presets[id].label}</button>)}</div></div> : null}
  </div>
}
