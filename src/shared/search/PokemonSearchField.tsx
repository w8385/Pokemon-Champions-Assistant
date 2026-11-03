import React from 'react'
import SearchCombobox, { nextSearchHighlight } from './SearchCombobox'
export { nextSearchHighlight }

export type PokemonSearchOption = { key: string; label: string; sprite?: string }
type Props = {
  id: string
  inputRef?: React.Ref<HTMLInputElement>
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

/** Species adapter retains the existing public key callback and stable input id. */
export default function PokemonSearchField(props: Props) {
  return <SearchCombobox {...props} onSelect={option => props.onSelect(option.key)} />
}
