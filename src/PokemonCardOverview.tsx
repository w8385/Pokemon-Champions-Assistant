import type { ReactNode } from 'react'
import { getTypeBadgeLabel, getTypeBadgeSrc } from './typeBadges'
import type { EffortStatKey, MoveMeta } from './app/types'
import type { PartialLibraryBuild } from './creatorSampleLibrary'

export type CardStat = { key: EffortStatKey; label: string; theme: string; value: number | null; ev: number | null }

/** Source-recorded values take priority; missing nature/roster never erases confirmed efforts. */
export function createReadonlyCardStats(
  labels: Pick<CardStat, 'key' | 'label' | 'theme'>[], build?: PartialLibraryBuild | null,
  calculatedValue?: (key: EffortStatKey) => number | null,
  formKey?: string,
): CardStat[] {
  return labels.map(stat => ({ ...stat,
    value: (build?.actualStatsForm === formKey ? build?.actualStats?.[stat.key] : null) ?? (build?.nature ? calculatedValue?.(stat.key) : null) ?? null,
    ev: build?.evs?.[stat.key] ?? null,
  }))
}

/** Shared registered slot for party, sample builder and read-only creator builds. */
export function RegisteredMoveSlot({ number, name, type, meta, children, className = '', labels }: {
  number: number; name: string; type?: string | null; meta?: MoveMeta | null; children?: ReactNode; className?: string
  labels: { slot: string; category: (category: MoveMeta['category']) => string; power: string; accuracy: string; pp: string; unknown: string }
}) {
  return <label className={`registered-move-slot ${className}`.trim()}>
    <div className="registered-move-slot-head"><span>{number}{labels.slot}</span>
      {type ? <img src={getTypeBadgeSrc(type)} alt={getTypeBadgeLabel(type)} title={getTypeBadgeLabel(type)} className="type-badge-image-small" /> : null}
    </div>
    {children ?? <strong className="registered-move-name">{name}</strong>}
    {name ? <small className="registered-move-meta">
      {meta?.category ? labels.category(meta.category) : labels.unknown} · {labels.power} {meta?.power ?? '—'} · {labels.accuracy} {meta?.accuracy == null ? '—' : `${meta.accuracy}%`} · {labels.pp} {meta?.pp ?? '—'}
    </small> : null}
  </label>
}

/** The party editor and source library share the same card heading, icons and stat tiles. */
export function PokemonCardHeading({ name, sprite, types = [], spriteAlt = '' }: { name: ReactNode; sprite?: string; types?: string[]; spriteAlt?: string }) {
  return <div className="entry-card-top">
    {sprite ? <img src={sprite} alt={spriteAlt} className="entry-sprite" /> : null}
    <div className="entry-card-head"><div className="party-card-header"><div className="party-card-title-block">
      {name}
      {types.length ? <div className="type-line"><span className="type-badge-wrap">{types.map(type => {
        const label = getTypeBadgeLabel(type)
        return <img key={type} src={getTypeBadgeSrc(type)} alt={label} title={label} className="type-badge-image" />
      })}</span></div> : null}
    </div></div></div>
  </div>
}

export function PokemonStatGrid({ stats, onTune, unknown = '미확인', className = '', sampleStyle = false, showEffort = true }: { stats: CardStat[]; onTune?: () => void; unknown?: string; className?: string; sampleStyle?: boolean; showEffort?: boolean }) {
  return <div className={`stat-preview-list ${className}`.trim()}>{stats.map(stat => {
    const content = <>
      <div className={`stat-preview-topline ${sampleStyle ? 'sample-stat-topline' : ''}`.trim()}><span>{stat.label}</span><strong>{stat.value ?? unknown}</strong></div>
      <div className="stat-preview-bar"><span style={{ width: stat.value === null ? '0%' : `${Math.max(0, Math.min(100, (stat.value / 255) * 100))}%` }} /></div>
      {showEffort ? <div className="stat-preview-meta"><span className={`stat-preview-ev ${sampleStyle ? 'sample-stat-ev' : ''}`.trim()}>{stat.ev === null ? unknown : `EV +${stat.ev}`}</span></div> : null}
    </>
    const rowClass = `stat-preview-row ${onTune ? 'stat-preview-button ' : ''}${sampleStyle ? 'sample-stat-preview-row ' : ''}${stat.theme}`
    return onTune
      ? <button key={stat.key} type="button" className={rowClass} onClick={e => { e.stopPropagation(); onTune() }}>{content}</button>
      : <div key={stat.key} className={rowClass}>{content}</div>
  })}</div>
}

export function ReadonlyPokemonCard({ name, sprite, types, ability, nature, item, itemSprite, stats, labels, statsLabel, statsUnknown, calculationNote, showEffort = true, children }: {
  name: string; sprite?: string; types?: string[]; ability?: string; nature?: string; item?: string; itemSprite?: string; calculationNote?: string; statsLabel?: string; statsUnknown?: string
  stats: CardStat[]; showEffort?: boolean; labels: { ability: string; nature: string; item: string; unknown: string }
  children?: ReactNode
}) {
  return <div className="card entry-card creator-library-pokemon-card">
    <PokemonCardHeading name={<strong>{name}</strong>} sprite={sprite} spriteAlt={name} types={types} />
    <div className="party-meta-grid">
      <div className="party-meta-chip"><span>{labels.ability}</span><strong>{ability || labels.unknown}</strong></div>
      <div className="party-meta-chip wide"><span>{labels.nature}</span><strong>{nature || labels.unknown}</strong></div>
      <div className="party-meta-chip item-meta-chip"><span>{labels.item}</span><div className="item-meta-row">
        {item && itemSprite ? <img src={itemSprite} alt="" className="item-sprite" onError={e => { e.currentTarget.src = `${import.meta.env.BASE_URL}item-generic.svg` }} /> : null}
        <strong>{item || labels.unknown}</strong>
      </div></div>
    </div>
    {statsLabel ? <strong className="creator-library-stats-label">{statsLabel}</strong> : null}
    <PokemonStatGrid stats={stats} unknown={statsUnknown ?? labels.unknown} showEffort={showEffort} />
    {children}
    {calculationNote ? <small className="creator-library-calculation-note">{calculationNote}</small> : null}
  </div>
}
