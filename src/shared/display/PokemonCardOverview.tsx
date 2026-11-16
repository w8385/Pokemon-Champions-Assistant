import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { getTypeBadgeLabel, getTypeBadgeSrc } from './typeBadges'
import type { EffortStatKey, MoveMeta } from '../../app/types'
import type { PartialLibraryBuild } from '../../domain/samples/creatorSampleLibrary'
import SearchCombobox, { type SearchComboboxProps, type SearchOption } from '../search/SearchCombobox'

export type CardStat = { key: EffortStatKey; label: string; theme: string; value: number | null; ev: number | null; base?: number; meta?: ReactNode }

/** Source-recorded values take priority; missing nature/roster never erases confirmed efforts. */
export function createReadonlyCardStats(
  labels: Pick<CardStat, 'key' | 'label' | 'theme'>[], build?: PartialLibraryBuild | null,
  calculatedValue?: (key: EffortStatKey) => number | null,
  formKey?: string,
): CardStat[] {
  return labels.map(stat => ({ ...stat,
    value: (build?.actualStatsForm === formKey ? build?.actualStats?.[stat.key] : null) ?? (build?.nature ? calculatedValue?.(stat.key) : null) ?? null,
    ev: build?.evsKnown ? (build.evsKnown[stat.key] ?? null) : (build?.evs?.[stat.key] ?? null),
  }))
}

/** Shared registered slot for party, sample builder and read-only creator builds. */
export type RegisteredMoveSearch = Omit<SearchComboboxProps<SearchOption>, 'value' | 'onChange' | 'inputProps' | 'label'>

/** One candidate presentation for every editable move pool; no eligibility lives here. */
export function MoveCandidateRow({ name, type, meta, labels }: {
  name: string; type?: string | null; meta?: MoveMeta | null
  labels: { category: (category: MoveMeta['category']) => string; power: string; accuracy: string; pp: string; unknown: string }
}) {
  return <span className="move-candidate-row">
    {type ? <img src={getTypeBadgeSrc(type)} alt={getTypeBadgeLabel(type)} title={getTypeBadgeLabel(type)} className="type-badge-image-small" /> : null}
    <span className="move-candidate-text"><strong>{name}</strong><small className="move-candidate-meta">
      {meta?.category ? labels.category(meta.category) : labels.unknown} · {labels.power} {meta?.power ?? '—'} · {labels.accuracy} {meta?.accuracy == null ? '—' : `${meta.accuracy}%`} · {labels.pp} {meta?.pp ?? '—'}
    </small></span>
  </span>
}

export type RegisteredMoveLabels = { slot: string; category: (category: MoveMeta['category']) => string; power: string; accuracy: string; pp: string; unknown: string }
export type MoveUsageSuggestion = {
  name: string; type?: string | null; selected?: boolean; disabled?: boolean; title?: string; ariaLabel?: string; className?: string;
  onSelect: () => void; tooltipProps?: HTMLAttributes<HTMLElement>;
}

/** Shared compact Top-usage rail. Callers own eligibility and slot selection; this component only presents the SSOT result. */
export function MoveUsageSuggestions({ label, moves }: { label: string; moves: readonly MoveUsageSuggestion[] }) {
  if (!moves.length) return null
  return <section className="move-usage-suggestions" aria-label={label}>
    <div className="move-usage-suggestions-head"><strong>{label}</strong><span>Top {moves.length}</span></div>
    <div className="move-usage-suggestions-grid">
      {moves.map((move, index) => <button key={`${move.name}-${index}`} type="button"
        className={`move-usage-suggestion ${move.className ?? ''}`.trim()} disabled={move.disabled}
        aria-pressed={move.selected} aria-label={move.ariaLabel ?? move.name} title={move.title}
        {...move.tooltipProps} onClick={move.onSelect}>
        {move.type ? <img src={getTypeBadgeSrc(move.type)} alt="" aria-hidden="true" className="type-badge-image-small" /> : null}
        <span>{move.name}</span>
      </button>)}
    </div>
  </section>
}

export type MoveSlotView = {
  id: string; name: string; type?: string | null; meta?: MoveMeta | null;
  /** Persisted occupancy can differ from the live search draft while an editor is focused. */
  occupied?: boolean;
  inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, 'value'>;
  tooltipProps?: Pick<InputHTMLAttributes<HTMLInputElement>, 'onFocus' | 'onBlur' | 'onMouseEnter' | 'onMouseLeave'>;
  search?: RegisteredMoveSearch; metaActions?: ReactNode; children?: ReactNode; className?: string; preview?: ReactNode;
}
export function MoveSlotsEditor({ label, ariaLabel, labels, slots, role, ownerId, selectedIndex = null, toolbar, belowGrid, onClick, className = '' }: {
  label: string; labels: RegisteredMoveLabels; slots: readonly MoveSlotView[]; role: 'editable' | 'readonly'; ownerId: string;
  ariaLabel?: string; selectedIndex?: number | null; toolbar?: ReactNode; belowGrid?: ReactNode; onClick?: React.MouseEventHandler<HTMLDivElement>; className?: string
}) {
  return <div className={`move-slots-editor ${className}`.trim()} role="group" aria-label={ariaLabel ?? label} data-owner={ownerId} onClick={onClick}>
    <div className="move-slots-editor-head"><strong>{label}</strong>{toolbar ? <div className="move-slots-editor-toolbar">{toolbar}</div> : null}</div>
    <div className="move-slots-editor-grid">{Array.from({ length: 4 }, (_, index) => {
      const slot = slots[index]
      const occupied = slot?.occupied ?? Boolean(slot?.name)
      const selected = role === 'editable' && selectedIndex === index && occupied
      return <div key={`${ownerId}-${slot?.id ?? index}`} className={`move-slots-editor-cell ${slot?.className ?? ''}`.trim()} data-slot={index + 1} data-empty={!occupied} data-selected={selected}>
        <RegisteredMoveSlot number={index + 1} name={slot?.name ?? ''} type={slot?.type} meta={slot?.meta} labels={labels}
          className={`move-slots-editor-slot ${slot?.className ?? ''}`.trim()} data-selected={selected}
          inputProps={{ ...slot?.inputProps, readOnly: role === 'readonly' || slot?.inputProps?.readOnly }}
          tooltipProps={slot?.tooltipProps} search={role === 'editable' ? slot?.search : undefined} metaActions={slot?.metaActions}>{slot?.children}</RegisteredMoveSlot>
        <div className="move-slots-editor-preview">{role === 'editable' ? slot?.preview : null}</div>
      </div>
    })}</div>{belowGrid}
  </div>
}

export function RegisteredMoveSlot({ number, name, type, meta, inputProps, tooltipProps, metaActions, children, className = '', labels, search, ...surfaceProps }: {
  number: number; name: string; type?: string | null; meta?: MoveMeta | null; inputProps: Omit<InputHTMLAttributes<HTMLInputElement>, 'value'>; tooltipProps?: Pick<InputHTMLAttributes<HTMLInputElement>, 'onFocus' | 'onBlur' | 'onMouseEnter' | 'onMouseLeave'>; children?: ReactNode; className?: string
  metaActions?: ReactNode
  search?: RegisteredMoveSearch
  labels: RegisteredMoveLabels; 'data-selected'?: boolean
}) {
  const sharedInputProps = { ...inputProps, ...tooltipProps,
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => { tooltipProps?.onFocus?.(event); inputProps.onFocus?.(event) },
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => { tooltipProps?.onBlur?.(event); inputProps.onBlur?.(event) },
    onMouseEnter: (event: React.MouseEvent<HTMLInputElement>) => { tooltipProps?.onMouseEnter?.(event); inputProps.onMouseEnter?.(event) },
    onMouseLeave: (event: React.MouseEvent<HTMLInputElement>) => { tooltipProps?.onMouseLeave?.(event); inputProps.onMouseLeave?.(event) },
  }
  const content = <>
    <div className="registered-move-slot-head">{search && !inputProps.readOnly ? <label htmlFor={search.id}><span>{number}{labels.slot}</span></label> : <span>{number}{labels.slot}</span>}
      {type ? <img src={getTypeBadgeSrc(type)} alt={getTypeBadgeLabel(type)} title={getTypeBadgeLabel(type)} className="type-badge-image-small" /> : null}
    </div>
    {search && !inputProps.readOnly ? <SearchCombobox {...search} value={name} onChange={() => {}} inputProps={sharedInputProps}
      menuClassName={`move-autocomplete-menu ${search.menuClassName ?? ''}`.trim()}
      optionClassName={(option, index) => `move-autocomplete-item ${typeof search.optionClassName === 'function' ? search.optionClassName(option, index) : search.optionClassName ?? ''}`.trim()} /> : <input {...inputProps} {...tooltipProps} value={name}
      onFocus={event => { tooltipProps?.onFocus?.(event); inputProps.onFocus?.(event) }}
      onBlur={event => { tooltipProps?.onBlur?.(event); inputProps.onBlur?.(event) }} />}
    <div className="registered-move-slot-detail"><small className="registered-move-meta" aria-hidden={name ? undefined : true}>
      {name ? <>{meta?.category ? labels.category(meta.category) : labels.unknown} · {labels.power} {meta?.power ?? '—'} · {labels.accuracy} {meta?.accuracy == null ? '—' : `${meta.accuracy}%`} · {labels.pp} {meta?.pp ?? '—'}</> : '\u00a0'}
    </small>{metaActions ? <div className="registered-move-slot-meta-actions">{metaActions}</div> : null}</div>
    {children}
  </>
  return search && !inputProps.readOnly
    ? <div {...surfaceProps} className={`registered-move-slot ${className}`.trim()}>{content}</div>
    : <label {...surfaceProps} className={`registered-move-slot ${className}`.trim()}>{content}</label>
}

/** The party editor and source library share the same card heading, icons and stat tiles. */
export function PokemonCardHeading({ name, sprite, types = [], spriteAlt = '', actions }: { name: ReactNode; sprite?: string; types?: string[]; spriteAlt?: string; actions?: ReactNode }) {
  return <div className="entry-card-top">
    {sprite ? <img src={sprite} alt={spriteAlt} className="entry-sprite" /> : null}
    <div className="entry-card-head"><div className="party-card-header"><div className="party-card-title-block">
      {name}
      {types.length ? <div className="type-line"><span className="type-badge-wrap">{types.map(type => {
        const label = getTypeBadgeLabel(type)
        return <img key={type} src={getTypeBadgeSrc(type)} alt={label} title={label} className="type-badge-image" />
      })}</span></div> : null}
    </div></div></div>
    {actions ? <div className="entry-card-actions">{actions}</div> : null}
  </div>
}

export function PokemonStatGrid({ stats, onTune, tuneExpandedKey, tuneControls, renderTune, renderPreview, unknown = '미확인', className = '', sampleStyle = false, showEffort = true }: { stats: CardStat[]; onTune?: (key: EffortStatKey) => void; tuneExpandedKey?: EffortStatKey | null; tuneControls?: string; renderTune?: (stat: CardStat) => ReactNode; renderPreview?: (stat: CardStat, open: () => void) => ReactNode; unknown?: string; className?: string; sampleStyle?: boolean; showEffort?: boolean }) {
  return <div className={`stat-preview-list ${className}`.trim()}>{stats.map(stat => {
    const content = <>
      <div className={`stat-preview-topline ${sampleStyle ? 'sample-stat-topline' : ''}`.trim()}><span>{stat.label}</span><strong>{stat.value ?? unknown}</strong></div>
      <div className="stat-preview-bar"><span style={{ width: stat.value === null ? '0%' : `${Math.max(0, Math.min(100, (stat.value / 255) * 100))}%` }} /></div>
      {showEffort ? <div className="stat-preview-meta"><span className={`stat-preview-ev ${sampleStyle ? 'sample-stat-ev' : ''}`.trim()}>{stat.ev === null ? unknown : `EV +${stat.ev}`}</span>{stat.meta}</div> : null}
    </>
    const rowClass = `stat-preview-row ${sampleStyle ? 'sample-stat-preview-row ' : ''}${stat.theme}`
    if (onTune && tuneExpandedKey === stat.key && renderTune) return <div key={stat.key} className={`${rowClass} stat-preview-editor`} id={tuneControls} role="group" aria-label={stat.label} tabIndex={-1}>{renderTune(stat)}</div>
    if (onTune && renderPreview) return <div key={stat.key} className={`${rowClass} stat-preview-interactive`}>{renderPreview(stat, () => onTune(stat.key))}</div>
    return onTune
      ? <button key={stat.key} type="button" className={`${rowClass} stat-preview-button`} data-stat-key={stat.key} onClick={e => { e.stopPropagation(); onTune(stat.key) }}>{content}</button>
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
