import React from 'react'
import type { EffortValues } from './myPartyChampionsSamples'
import type { EffortStatKey, NatureId } from './app/types'

const stats: { key: EffortStatKey; label: string }[] = [
  { key: 'hp', label: 'HP' }, { key: 'attack', label: '공격' }, { key: 'defense', label: '방어' },
  { key: 'spAttack', label: '특수공격' }, { key: 'spDefense', label: '특수방어' }, { key: 'speed', label: '스피드' },
]
const checkpoints = [11, 22, 32]
export function EffortTuningModal({ evs, nature, natureOptions, actualValue, onEffort, onNature, onClose, translate, statTheme, override, onOverride, title, opener, magicCandidate, magicPoints }: {
  evs: EffortValues; nature: NatureId; natureOptions: { id: NatureId; label: string }[]
  actualValue: (key: EffortStatKey, effort?: number) => number | null
  onEffort: (key: EffortStatKey, value: number) => void; onNature: (nature: NatureId) => void
  onClose: () => void; translate: (text: string) => string; statTheme: (key: EffortStatKey) => string
  override?: Partial<Record<EffortStatKey, string>>; onOverride?: (key: EffortStatKey, value: string) => void
  title?: string; opener?: HTMLElement | null
  magicCandidate?: { stat: EffortStatKey; nextEffort: number | null } | null
  magicPoints?: (key: EffortStatKey) => number[]
}) {
  const closeRef = React.useRef(onClose)
  closeRef.current = onClose
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const restoreRef = React.useRef<HTMLElement | null>(null)
  React.useEffect(() => {
    const dialog = dialogRef.current
    restoreRef.current = opener?.isConnected ? opener : document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0)
    focusables()[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return }
      if (event.key !== 'Tab') return
      const available = focusables()
      if (!available.length) { event.preventDefault(); dialog?.focus(); return }
      const first = available[0], last = available[available.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog?.contains(document.activeElement))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !dialog?.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); if (restoreRef.current?.isConnected) restoreRef.current.focus(); else document.querySelector<HTMLElement>('main button, main a, header a')?.focus() }
  }, [])
  return <div className="modal-backdrop" onClick={onClose}>
    <div ref={dialogRef} tabIndex={-1} className="modal-card effort-tuning-modal" role="dialog" aria-modal="true" aria-label={title ?? translate('노력치 보정')} onClick={event => event.stopPropagation()}>
      <div className="row-between modal-header"><h2>{title ?? translate('노력치 보정')}</h2><button type="button" className="action-button" onClick={onClose}>{translate('닫기')}</button></div>
      <div className="modal-grid"><label>{translate('성격')}<select value={nature} onChange={event => onNature(event.target.value as NatureId)}>{natureOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label><span>{translate('노력치 합')} {Object.values(evs).reduce((sum, value) => sum + value, 0)}/66</span></div>
      <div className="drag-stat-list">{stats.map(stat => {
        const current = evs[stat.key]
        const cap = Math.min(32, 66 - Object.entries(evs).reduce((sum, [key, value]) => sum + (key === stat.key ? 0 : value), 0))
        const theme = statTheme(stat.key)
        const apply = (value: number) => onEffort(stat.key, Math.max(0, Math.min(cap, value)))
        const value = actualValue(stat.key)
        const isMagicStat = magicCandidate?.stat === stat.key && value !== null && value % 11 === 0
        const targetEffort = magicCandidate?.stat === stat.key ? magicCandidate.nextEffort : null
        const points = magicPoints?.(stat.key) ?? []
        const raw = override?.[stat.key]
        return <div key={stat.key} className={`drag-stat-card ${theme} ${isMagicStat ? 'magic' : ''}`}>
          <div className="row-between"><strong>{translate(stat.label)}</strong><span>{value ?? translate('입력 오류')}</span></div>
          <div className="effort-gauge-wrap" role="group" aria-label={`${translate(stat.label)} effort points`}>
            <div className={`effort-gauge-track ${theme}`} tabIndex={0} role="slider" aria-label={`${translate(stat.label)} effort points`} aria-valuemin={0} aria-valuemax={cap} aria-valuenow={current} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); apply(current + (event.key === 'ArrowRight' ? 1 : -1)) } }} onPointerDown={event => { if (event.target !== event.currentTarget && !(event.target instanceof Element && event.target.closest('.effort-gauge-cells'))) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); const box = event.currentTarget.getBoundingClientRect(); apply(Math.round((event.clientX - box.left) / box.width * 32)) }} onPointerMove={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const box = event.currentTarget.getBoundingClientRect(); apply(Math.round((event.clientX - box.left) / box.width * 32)) }} onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}>
              <div className={`effort-gauge-cells ${theme}`} aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <span key={i} className={['effort-gauge-cell', i + 1 <= cap ? 'reachable' : 'locked', i + 1 <= current ? 'filled' : '', points.includes(i + 1) ? 'magic' : '', i + 1 === current ? 'current' : '', checkpoints.includes(i + 1) ? 'checkpoint' : '', i + 1 === targetEffort ? 'target' : ''].filter(Boolean).join(' ')} />)}</div>
              <input type="range" className="effort-gauge-range" min={0} max={32} step={1} value={current} onChange={event => apply(Number(event.target.value))} />
            </div><div className={`effort-gauge-scale ${theme}`}>{checkpoints.map(point => <div key={point} className="effort-gauge-scale-item"><span>{point}pt</span><small>{magicPoints && magicCandidate?.stat !== stat.key ? '' : actualValue(stat.key, point) ?? ''}</small></div>)}</div>
          </div>
          <div className="effort-cell-toolbar"><button type="button" className="mini-action" disabled={!current} onClick={() => apply(current - 1)}>-1</button><button type="button" className="mini-action" disabled={!current} onClick={() => apply(0)}>{translate('최소')}</button><button type="button" className="mini-action" disabled={current >= cap} onClick={() => apply(cap)}>{translate('최대')}</button><button type="button" className="mini-action" disabled={current >= cap} onClick={() => apply(current + 1)}>+1</button></div>
          <div className="row-between effort-cell-meta"><span className="muted-inline">{translate('현재')} {current}pt · {translate('추가 가능')} {Math.max(0, cap - current)}pt</span>{targetEffort ? <span className="magic-inline">{translate('목표')} {targetEffort}칸</span> : isMagicStat ? <span className="magic-inline">{translate('11배수 달성')}</span> : null}</div>
          {onOverride ? <label className="quick-actual-override">{translate('실수치')} <input type="number" min="1" max="999" placeholder={String(actualValue(stat.key, evs[stat.key]) ?? '')} value={raw ?? ''} aria-invalid={raw !== undefined && value === null} onChange={event => onOverride(stat.key, event.target.value)} /></label> : null}
        </div>
      })}</div>
    </div>
  </div>
}
