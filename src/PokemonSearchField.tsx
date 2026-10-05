import React from 'react'

export type PokemonSearchOption = { key: string; label: string; sprite?: string }
type Props = {
  id: string
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSelect: (key: string) => void
  options: readonly PokemonSearchOption[]
  className?: string
  menuClassName?: string
  inputClassName?: string
  noResults?: string
  showEmpty?: boolean
  disabled?: boolean
}

export function nextSearchHighlight(index: number, count: number, direction: -1 | 1): number {
  if (count === 0) return -1
  if (index < 0) return direction === 1 ? 0 : count - 1
  return (index + direction + count) % count
}

/** The same input-owning picker is used by the speed-line reference and sample-speed cards. */
export default function PokemonSearchField({ id, label, placeholder, value, onChange, onSelect, options, className, menuClassName, inputClassName, noResults, showEmpty = false, disabled = false }: Props) {
  const [open, setOpen] = React.useState(false)
  const [highlight, setHighlight] = React.useState(-1)
  const composing = React.useRef(false)
  const listId = `${id}-options`
  const choose = (option: PokemonSearchOption) => { if (disabled) return; onSelect(option.key); setOpen(false); setHighlight(-1) }
  const keyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setHighlight(-1); return }
    if (event.key === 'Tab') { setOpen(false); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setHighlight(index => nextSearchHighlight(open ? index : -1, options.length, event.key === 'ArrowDown' ? 1 : -1))
    }
    if (event.key === 'Enter' && open && highlight >= 0 && options[highlight]) {
      event.preventDefault(); choose(options[highlight])
    }
  }
  return <div className={`pokemon-search-field ${className ?? ''}`}>
    {label ? <label htmlFor={id}>{label}</label> : null}
    <input id={id} className={inputClassName} type="search" value={value} placeholder={placeholder} disabled={disabled} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && highlight >= 0 && options[highlight] ? `${id}-option-${highlight}` : undefined}
      onFocus={() => setOpen(true)} onBlur={() => { setOpen(false); setHighlight(-1) }}
      onCompositionStart={() => { composing.current = true }} onCompositionEnd={() => { composing.current = false; setHighlight(-1) }}
      onChange={event => { onChange(event.target.value); setOpen(true); setHighlight(-1) }} onKeyDown={keyDown} />
    {open && (options.length || showEmpty && value.trim()) ? <div id={listId} role="listbox" className={`autocomplete-menu unified-dropdown-menu ${menuClassName ?? ''}`}>
      {options.length ? options.map((option, index) => <button key={option.key} id={`${id}-option-${index}`} role="option" aria-selected={highlight === index} type="button" className={`autocomplete-item ${highlight === index ? 'active' : ''}`} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>{option.sprite ? <img src={option.sprite} alt="" loading="lazy" /> : null}{option.label}</button>) : <span className="pokemon-search-empty">{noResults ?? 'No results'}</span>}
    </div> : null}
  </div>
}
