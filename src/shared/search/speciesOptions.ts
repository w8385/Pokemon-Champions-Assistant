import { rows } from '../../adapters/catalog/roster'
import { searchPokemon } from './pokemonSearch'
export function filterSpeciesOptions(query: string, options?: { includeMega?: boolean; allowLoose?: boolean }) {
  return searchPokemon(rows, query, options).map(row => ({ key: row.key, label: `${row.name_ko} (${row.name_en})` }))
}
