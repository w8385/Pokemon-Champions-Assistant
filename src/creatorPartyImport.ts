import { canImportCreatorSample, type CreatorSource } from './creatorSampleLibrary.ts'
import type { PartyMember } from './app/types'

/** Prepare every slot before any UI state setter. Source abilities from pre-Mega screens
 * are not abilities of the selected Mega species; use its supported form ability. */
export function prepareCreatorParty(source: CreatorSource, abilitiesForKey: (key: string) => readonly string[] | null): {
  party: PartyMember[]; lockedMovesBySlot: string[][]
} | null {
  if (source.contentKind !== 'party' || source.partySize !== 6 || source.members.length !== 6 || source.completeMemberCount !== 6) return null
  const keys = source.members.map(member => member.pokemonKey)
  if (new Set(keys).size !== 6) return null
  const party: PartyMember[] = []
  const lockedMovesBySlot: string[][] = []
  for (const entry of source.members) {
    if (!canImportCreatorSample(entry)) return null
    const abilities = abilitiesForKey(entry.pokemonKey)
    if (!abilities?.length) return null
    const preMega = entry.pokemonKey.startsWith('mega-') && entry.partialBuild?.preMegaAbilities?.includes(entry.build.ability)
    const ability = preMega ? abilities.length === 1 ? abilities[0] : null : abilities.includes(entry.build.ability) ? entry.build.ability : null
    if (!ability) return null
    party.push({ key: entry.pokemonKey, item: entry.build.item, ability, evs: { ...entry.build.evs },
      config: { nature: entry.build.nature, scarf: false, speedStage: 0 },
      picked: false, tuning: { magicNumber: 0, maxValue: 0 } })
    lockedMovesBySlot.push([...entry.build.moves])
  }
  return { party, lockedMovesBySlot }
}
