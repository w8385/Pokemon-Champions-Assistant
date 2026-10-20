import React from 'react'

export type SearchOption = { key: string; label: string; sprite?: string }
export type SearchComboboxProps<T extends SearchOption> = {
  id: string
  /** Access to the owned input for caller focus handoff after a selection. */
  inputRef?: React.Ref<HTMLInputElement>
  /** Filter-only input: results are rendered by the caller, never as a duplicate popup. */
  mode?: 'combobox' | 'filter'
  value: string
  onChange: (value: string) => void
  onSelect: (option: T) => void
  options: readonly T[]
  label?: string
  placeholder?: string
  className?: string
  inputClassName?: string
  menuClassName?: string
  optionClassName?: string | ((option: T, index: number) => string)
  renderOption?: (option: T, index: number) => React.ReactNode
  optionProps?: (option: T, index: number) => React.ButtonHTMLAttributes<HTMLButtonElement>
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'id'>
  noResults?: string
  showEmpty?: boolean
  /** Show the provided ranked pool even when the draft is empty. Empty Enter still cannot commit by default. */
  showAllOnEmpty?: boolean
  /** Opt in only if empty Enter is an intentional picker action. */
  commitOnEmpty?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function nextSearchHighlight(index: number, count: number, direction: -1 | 1): number {
  if (count === 0) return -1
  if (index < 0) return direction === 1 ? 0 : count - 1
  return (index + direction + count) % count
}

/** Owns the only input, suggestion list and all selection/IME state for species and moves. */
export default function SearchCombobox<T extends SearchOption>({ id, inputRef, mode = 'combobox', value, onChange, onSelect, options, label, placeholder, className = '', inputClassName, menuClassName = '', optionClassName, renderOption, optionProps, inputProps, noResults, showEmpty = false, showAllOnEmpty = false, commitOnEmpty = false, disabled = false, readOnly = false }: SearchComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const openRef = React.useRef(false)
  const [highlight, setHighlight] = React.useState(-1)
  const highlightRef = React.useRef(-1)
  const composing = React.useRef(false)
  const inactive = disabled || readOnly || inputProps?.disabled || inputProps?.readOnly
  const visible = !inactive && (value.trim() || showAllOnEmpty) ? options : []
  const listId = `${id}-options`
  const setDropdownOpen = (next: boolean) => { openRef.current = next; setOpen(next) }
  const setIndex = (next: number) => { highlightRef.current = next; setHighlight(next) }
  const close = () => { setDropdownOpen(false); setIndex(-1) }
  const choose = (option: T) => { if (inactive || !openRef.current) return; close(); onSelect(option) }
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (mode === 'filter') { inputProps?.onKeyDown?.(event); return }
    if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) { inputProps?.onKeyDown?.(event); return }
    if (event.key === 'Escape') { event.preventDefault(); close() }
    else if (event.key === 'Tab') close()
    else if (!inactive && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      const wasOpen = openRef.current
      setDropdownOpen(true)
      setIndex(nextSearchHighlight(wasOpen ? highlightRef.current : -1, visible.length, event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key === 'Enter' && !inactive && openRef.current && (value.trim() || commitOnEmpty) && visible.length) {
      const option = visible[highlightRef.current] ?? visible[0]
      if (option) { event.preventDefault(); choose(option) }
    }
    inputProps?.onKeyDown?.(event)
  }
  return <div className={`pokemon-search-field ${className}`.trim()}>
    {label ? <label htmlFor={id}>{label}</label> : null}
    <input {...inputProps} ref={inputRef} id={id} className={inputClassName ?? inputProps?.className} type={inputProps?.type ?? 'search'} value={value} placeholder={placeholder ?? inputProps?.placeholder} disabled={disabled || inputProps?.disabled} readOnly={readOnly || inputProps?.readOnly}
      role={mode === 'filter' ? 'searchbox' : 'combobox'} aria-autocomplete={mode === 'filter' ? undefined : 'list'} aria-expanded={mode === 'filter' ? undefined : open && Boolean(visible.length || showEmpty && value.trim())} aria-controls={mode === 'filter' ? undefined : listId}
      aria-activedescendant={mode === 'combobox' && open && highlight >= 0 && visible[highlight] ? `${id}-option-${highlight}` : undefined}
      onFocus={event => { if (!inactive && mode === 'combobox') setDropdownOpen(true); inputProps?.onFocus?.(event) }}
      onBlur={event => { close(); inputProps?.onBlur?.(event) }}
      onCompositionStart={event => { composing.current = true; inputProps?.onCompositionStart?.(event) }}
      onCompositionEnd={event => { composing.current = false; setIndex(-1); inputProps?.onCompositionEnd?.(event) }}
      onChange={event => { onChange(event.target.value); inputProps?.onChange?.(event); if (!inactive && mode === 'combobox') setDropdownOpen(true); setIndex(-1) }} onKeyDown={onKeyDown} />
    {mode === 'combobox' && open && (visible.length || showEmpty && value.trim()) ? <div id={listId} role="listbox" className={`autocomplete-menu unified-dropdown-menu ${menuClassName}`.trim()}>
      {visible.length ? visible.map((option, index) => {
        const extra = optionProps?.(option, index)
        return <button {...extra} key={option.key} id={`${id}-option-${index}`} role="option" aria-selected={highlight === index} type="button"
          className={`autocomplete-item ${highlight === index ? 'active ' : ''}${typeof optionClassName === 'function' ? optionClassName(option, index) : optionClassName ?? ''} ${extra?.className ?? ''}`.trim()}
          onMouseDown={event => { event.preventDefault(); extra?.onMouseDown?.(event) }} onClick={event => { extra?.onClick?.(event); if (!event.defaultPrevented) choose(option) }}>
          {renderOption ? renderOption(option, index) : <>{option.sprite ? <img src={option.sprite} alt="" loading="lazy" /> : null}{option.label}</>}
        </button>
      }) : <span className="pokemon-search-empty">{noResults ?? 'No results'}</span>}
    </div> : null}
  </div>
}
