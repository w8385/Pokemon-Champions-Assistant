import type { ItemFieldTarget, AutocompleteHighlight } from '../../app/types'

export function sameItemField(a: ItemFieldTarget, scope: 'party' | 'sample' | 'opponent', idx: number) {
  return a?.scope === scope && a?.idx === idx
}

export function highlightedAutocompleteIndex(state: AutocompleteHighlight, id: string) {
  return state?.id === id ? state.index : -1
}
