import type { ReactNode } from 'react'
import { getTypeBadgeLabel, getTypeBadgeSrc } from './typeBadges'
import type { EffortStatKey } from './app/types'
import type { PartialLibraryBuild } from './creatorSampleLibrary'

export type CardStat = { key: EffortStatKey; label: string; theme: string; value: number | null; ev: number | null }

/** Source-recorded values take priority; missing nature/roster never erases confirmed efforts. */
export function createReadonlyCardStats(
  labels: Pick<CardStat, 'key' | 'label' | 'theme'>[], build?: PartialLibraryBuild | null,
  calculatedValue?: (key: EffortStatKey) => number | null,
): CardStat[] {
  return labels.map(stat => ({ ...stat,
    value: build?.actualStats?.[stat.key] ?? (build?.nature ? calculatedValue?.(stat.key) : null) ?? null,
    ev: build?.evs?.[stat.key] ?? null,
  }))
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

export function PokemonStatGrid({ stats, onTune, unknown = '미확인', className = '' }: { stats: CardStat[]; onTune?: () => void; unknown?: string; className?: string }) {
  return <div className={`stat-preview-list ${className}`.trim()}>{stats.map(stat => {
    const content = <>
      <div className="stat-preview-topline"><span>{stat.label}</span><strong>{stat.value ?? unknown}</strong></div>
      <div className="stat-preview-bar"><span style={{ width: stat.value === null ? '0%' : `${Math.max(0, Math.min(100, (stat.value / 255) * 100))}%` }} /></div>
      <div className="stat-preview-meta"><span className="stat-preview-ev">{stat.ev === null ? unknown : `EV +${stat.ev}`}</span></div>
    </>
    return onTune
      ? <button key={stat.key} type="button" className={`stat-preview-row stat-preview-button ${stat.theme}`} onClick={e => { e.stopPropagation(); onTune() }}>{content}</button>
      : <div key={stat.key} className={`stat-preview-row ${stat.theme}`}>{content}</div>
  })}</div>
}

export function ReadonlyPokemonCard({ name, sprite, types, ability, nature, item, itemSprite, stats, labels, statsLabel, statsUnknown, calculationNote, children }: {
  name: string; sprite?: string; types?: string[]; ability?: string; nature?: string; item?: string; itemSprite?: string; calculationNote?: string; statsLabel?: string; statsUnknown?: string
  stats: CardStat[]; labels: { ability: string; nature: string; item: string; unknown: string }
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
    <PokemonStatGrid stats={stats} unknown={statsUnknown ?? labels.unknown} />
    {children}
    {calculationNote ? <small className="creator-library-calculation-note">{calculationNote}</small> : null}
  </div>
}
