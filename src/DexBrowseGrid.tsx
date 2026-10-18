import type React from 'react'
import type { SiteLanguage } from './app/types'
import './dexBrowse.css'

export type DexBrowseCard = {
  id: string
  href: string
  kind: 'pokemon' | 'move' | 'ability' | 'item'
  label: string
  secondaryLabel?: string
  sprite?: string
  types?: string[]
  metaText?: string
  pokemonSprites?: Array<{ key: string; src: string }>
}

export type DexBrowseGridProps = {
  items: DexBrowseCard[]
  language: SiteLanguage
  busy: boolean
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, id: string) => void
  renderTypeBadge: (type: string) => React.ReactNode
  tooltipPropsForItem?: (id: string) => React.HTMLAttributes<HTMLElement>
}

const labels = {
  ko: { pokemon: '포켓몬', move: '기술', ability: '특성', item: '도구', empty: '검색 결과가 없습니다.', busy: '검색 중…' },
  en: { pokemon: 'Pokémon', move: 'Move', ability: 'Ability', item: 'Item', empty: 'No results.', busy: 'Searching…' },
  ja: { pokemon: 'ポケモン', move: 'わざ', ability: 'とくせい', item: 'どうぐ', empty: '検索結果がありません。', busy: '検索中…' },
} as const

/** The sole card preview renderer for both blank-query and searched catalog projections. */
export function DexBrowseGrid({ items, language, busy, onNavigate, renderTypeBadge, tooltipPropsForItem }: DexBrowseGridProps) {
  const text = labels[language]
  return <div className="dex-browse-grid dex-results-list" aria-busy={busy}>
    {busy ? <p role="status" className="dex-browse-grid-status">{text.busy}</p> : null}
    {!busy && !items.length ? <div className="dex-empty-state muted dex-browse-grid-status">{text.empty}</div> : null}
    {items.map(item => {
      const tooltip = item.kind === 'item' ? tooltipPropsForItem?.(item.id) : undefined
      return <a key={item.id} href={item.href} className="dex-result-item dex-browse-card"
        {...tooltip} onClick={event => { tooltip?.onClick?.(event); if (!event.defaultPrevented && !busy) onNavigate(event, item.id); if (busy) event.preventDefault() }}
        aria-disabled={busy || undefined}>
        <div className="row-between compact-gap"><span className="pick-badge subtle">{text[item.kind]}</span></div>
        {item.kind === 'pokemon' ? <div className="dex-pokemon-preview-row">
          {item.sprite ? <img src={item.sprite} alt={item.label} className="dex-result-sprite" /> : <div className="dex-result-sprite placeholder" />}
          <div className="dex-pokemon-preview-body"><div><strong>{item.label}</strong>{item.secondaryLabel ? <div className="muted dex-result-subline">{item.secondaryLabel}</div> : null}</div>
            <div className="type-badge-wrap dex-result-typebadges">{item.types?.map(type => <span key={type}>{renderTypeBadge(type)}</span>)}</div>
          </div>
        </div> : null}
        {item.kind === 'move' ? <div className="dex-move-preview-row">
          {item.types?.map(type => <span key={type}>{renderTypeBadge(type)}</span>)}
          <div className="dex-pokemon-preview-body"><strong>{item.label}</strong>{item.metaText ? <span className="muted">{item.metaText}</span> : null}</div>
        </div> : null}
        {item.kind === 'ability' ? <div className="dex-ability-result-card">
          <div className="dex-ability-result-copy"><strong>{item.label}</strong>{item.metaText ? <span className="muted">{item.metaText}</span> : null}</div>
          {item.pokemonSprites?.length ? <div className="dex-ability-result-sprites" aria-hidden="true">{item.pokemonSprites.map(sprite => <img key={sprite.key} src={sprite.src} alt="" className="dex-ability-result-sprite" />)}</div> : null}
        </div> : null}
        {item.kind === 'item' ? <div className="dex-move-preview-row">
          <img src={item.sprite || `${import.meta.env.BASE_URL}item-generic.svg`} alt={item.label} className="dex-item-preview-sprite"
            onError={event => { const fallback = `${import.meta.env.BASE_URL}item-generic.svg`; if (!event.currentTarget.src.endsWith(fallback)) event.currentTarget.src = fallback }} />
          <div className="dex-pokemon-preview-body dex-item-result-body"><strong>{item.label}</strong>{item.secondaryLabel ? <span className="muted">{item.secondaryLabel}</span> : null}</div>
        </div> : null}
      </a>
    })}
  </div>
}
