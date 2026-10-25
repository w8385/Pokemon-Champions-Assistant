import React from 'react'
import { createPortal } from 'react-dom'

export type BuildOption = { value: string; label: string; sprite?: string; secondary?: string }
type Field = 'ability' | 'nature' | 'item'
type Tooltip = React.HTMLAttributes<HTMLElement>
export type PokemonBuildFieldsProps = {
  identity: string
  ability: string
  abilityLabel?: string
  nature: string
  item: string
  abilities: BuildOption[]
  natures: BuildOption[]
  itemOptions: (query: string) => BuildOption[]
  onAbility: (value: string) => void
  onNature: (value: string) => void
  onItem: (value: string) => void
  labels: { ability: string; nature: string; item: string; none: string; itemPlaceholder: string; fixed?: string }
  itemLabel: (value: string) => string
  itemSprite: (value: string) => string
  fixedItem?: string | null
  itemError?: string | null
  repairLabel?: string
  abilityTooltip?: (value: string) => Tooltip
  itemTooltip?: (value: string) => Tooltip
  className?: string
}

/** The input and its popup are owned here; callers only adapt values and commits. */
export function PokemonBuildFields(props: PokemonBuildFieldsProps) {
  const { identity, ability, abilityLabel, nature, item, abilities, natures, itemOptions, onAbility, onNature, onItem, labels, itemLabel, itemSprite, fixedItem, itemError, abilityTooltip, itemTooltip } = props
  const [open, setOpen] = React.useState<Field | null>(null)
  const [draft, setDraft] = React.useState('')
  const [highlight, setHighlight] = React.useState(-1)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const trigger = React.useRef<Record<Field, HTMLButtonElement | null>>({ ability: null, nature: null, item: null })
  const input = React.useRef<HTMLInputElement>(null)
  const popupRef = React.useRef<HTMLDivElement>(null)
  const optionRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const previousIdentity = React.useRef(identity)
  if (previousIdentity.current !== identity) {
    previousIdentity.current = identity
    if (open) { setOpen(null); setDraft(''); setHighlight(-1) }
  }
  const options = open === 'item' && !fixedItem ? itemOptions(draft).slice(0, 8) : []
  React.useEffect(() => {
    if (!open) return
    const onOutside = (event: PointerEvent) => {
      const target = event.target as Node
      if (popupRef.current?.contains(target) || trigger.current[open]?.contains(target)) return
      setOpen(null); setHighlight(-1); setDraft('')
    }
    document.addEventListener('pointerdown', onOutside)
    return () => document.removeEventListener('pointerdown', onOutside)
  }, [open])
  React.useLayoutEffect(() => {
    if (!open || !popupRef.current) return
    const bounds = popupRef.current.getBoundingClientRect()
    if (bounds.bottom > window.innerHeight - 8) {
      const anchor = trigger.current[open]?.getBoundingClientRect()
      setPosition(prev => ({ ...prev, top: Math.max(8, (anchor?.top ?? bounds.top) - bounds.height - 4) }))
    }
  }, [open])
  const close = (restore = false) => {
    const field = open
    setOpen(null); setHighlight(-1); setDraft('')
    if (restore && field) trigger.current[field]?.focus()
  }
  const begin = (field: Field) => {
    if (open === field) { close(true); return }
    const rect = trigger.current[field]?.getBoundingClientRect()
    if (rect) setPosition({ top: Math.min(rect.bottom + 4, window.innerHeight - 60), left: Math.max(12, Math.min(rect.left, window.innerWidth - 332)) })
    setOpen(field); setDraft(field === 'item' ? itemLabel(item || fixedItem || '') : ''); setHighlight(-1)
  }
  const choose = (field: Field, value: string) => {
    if (field === 'ability') onAbility(value)
    else if (field === 'nature') onNature(value)
    else if (!fixedItem) onItem(value)
    close(true)
  }
  const onPopupBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    // A typed draft is not a committed value; only explicit option selection mutates source.
    close()
  }
  const button = (field: Field, title: string, content: React.ReactNode, tooltip?: Tooltip) => <button
    type="button" className="party-meta-chip-button" aria-label={`${title}: ${field === 'ability' ? ability || labels.none : field === 'nature' ? nature || labels.none : item ? itemLabel(item) : labels.none}`}
    aria-expanded={open === field} ref={el => { trigger.current[field] = el }} onClick={() => begin(field)}
    {...tooltip}>{<><span>{title}</span>{content}</>}
  </button>
  const optionButton = (field: Field, option: BuildOption, index: number) => {
    const optionTooltip = field === 'ability' ? abilityTooltip?.(option.value) : undefined
    return <button key={`${field}-${option.value}`} type="button"
      className={`party-meta-option ${field === 'item' ? 'move-autocomplete-item item-autocomplete-item' : ''} ${highlight === index ? 'active' : ''}`}
      ref={el => { optionRefs.current[index] = el }} autoFocus={field !== 'item' && index === 0}
      {...optionTooltip}
      onFocus={event => { setHighlight(index); optionTooltip?.onFocus?.(event) }} onMouseDown={event => event.preventDefault()} onClick={() => choose(field, option.value)}>
    {field === 'item' ? <span className="move-autocomplete-main"><img src={option.sprite || itemSprite(option.value)} alt="" className="item-autocomplete-sprite" /><span className="item-autocomplete-copy"><strong>{option.label}</strong>{option.secondary && <small>{option.secondary}</small>}</span></span> : option.label}
  </button>
  }
  const popup = (field: Field) => open === field ? <div ref={popupRef} className={`party-meta-popover build-fields-popover ${field !== 'item' ? 'party-meta-option-list' : ''}`} style={{ top: position.top, left: position.left }} onBlurCapture={onPopupBlur}
    onKeyDown={event => {
      if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return
      if (event.key === 'Escape') { event.preventDefault(); close(true) }
      if (field !== 'item' && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        const count = popupRef.current?.querySelectorAll('.party-meta-option').length ?? 0
        const next = Math.max(0, Math.min(count - 1, highlight + (event.key === 'ArrowDown' ? 1 : -1)))
        optionRefs.current[next]?.focus()
      }
    }}>
    {field === 'item' ? <>
      <div className="meta-item-input-row"><input ref={input} autoFocus value={fixedItem ? itemLabel(item) : draft} readOnly={Boolean(fixedItem)} placeholder={fixedItem ? labels.fixed : labels.itemPlaceholder}
        onFocus={() => setHighlight(-1)} onChange={event => { setDraft(event.target.value); setHighlight(-1) }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return
          if (options.length && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { event.preventDefault(); setHighlight(i => Math.max(0, Math.min(options.length - 1, i + (event.key === 'ArrowDown' ? 1 : -1)))) }
          if (event.key === 'Enter' && options.length) { event.preventDefault(); choose('item', options[highlight < 0 ? 0 : highlight].value) }
        }} />
        {!fixedItem && (draft || item) && <button type="button" className="meta-item-clear-button" aria-label="clear item" onMouseDown={event => event.preventDefault()} onClick={() => choose('item', '')}>×</button>}
      </div>
      {fixedItem && itemError && <button type="button" className="party-meta-option" onClick={() => { onItem(fixedItem); close(true) }}>{props.repairLabel || fixedItem}</button>}
      {!fixedItem && options.length > 0 && <div className="move-autocomplete-menu unified-dropdown-menu">{options.map((option, idx) => optionButton(field, option, idx))}</div>}
    </> : (field === 'ability' ? [{ value: '', label: labels.none }, ...abilities] : natures).map((option, idx) => optionButton(field, option, idx))}
  </div> : null
  return <div className={`party-meta-grid pokemon-build-fields ${props.className || ''}`} onClick={event => event.stopPropagation()}>
    <div className="party-meta-chip party-meta-chip-editor">{button('ability', labels.ability, <strong {...abilityTooltip?.(ability)}>{abilityLabel || abilities.find(option => option.value === ability)?.label || ability || labels.none}</strong>)}</div>
    <div className="party-meta-chip party-meta-chip-editor wide">{button('nature', labels.nature, <strong>{natures.find(option => option.value === nature)?.label || nature || labels.none}</strong>)}</div>
    <div className="party-meta-chip party-meta-chip-editor item-meta-chip">{button('item', labels.item, <div className="item-meta-row"><img src={itemSprite(item || '')} alt="" className="item-sprite" /><strong>{item ? itemLabel(item) : labels.none}</strong></div>, itemTooltip?.(item))}</div>
    {itemError && <small role="alert" className="item-validation-error">{itemError}</small>}
    {open && typeof document !== 'undefined' ? createPortal(popup(open), document.body) : null}
  </div>
}
