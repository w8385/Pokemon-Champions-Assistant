import type { OpponentState, PartyMember, NatureId } from './app/types'
import type { EffortValues } from './myPartyChampionsSamples'

type Draft = { key: string; item: string; ability: string; nature: NatureId; evs: EffortValues; moves: string[] }
type Dirty = ReadonlySet<string>

/** Only committed build fields cross this boundary; battle assumptions never do. */
export function commitComparisonEntry<T extends 'own' | 'opponent'>(side: T, record: T extends 'own' ? PartyMember : OpponentState, draft: Draft, dirty: Dirty): T extends 'own' ? PartyMember : OpponentState {
  if (side === 'own') {
    const current = record as PartyMember
    const speciesChanged = dirty.has('key') && current.key !== draft.key
    const evs = speciesChanged ? { ...draft.evs } : { ...current.evs }
    for (const stat of ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const) if (dirty.has(stat)) evs[stat] = draft.evs[stat]
    return { ...current, key: dirty.has('key') ? draft.key : current.key,
      item: dirty.has('item') || dirty.has('key') ? draft.item : current.item,
      ability: dirty.has('ability') || dirty.has('key') ? draft.ability : current.ability,
      config: speciesChanged ? { ...current.config, nature: draft.nature, speedStage: 0, scarf: false } : dirty.has('nature') ? { ...current.config, nature: draft.nature } : current.config,
      evs } as T extends 'own' ? PartyMember : OpponentState
  }
  const current = record as OpponentState
  const speciesChanged = dirty.has('key') && current.key !== draft.key
  const next = speciesChanged ? { ...current, item: '', ability: '', notes: '', revealedMoves: [], nature: undefined, attackEv: undefined, spAttackEv: undefined, natureBoost: false, scarf: false, speedStage: 0, hpEv: 0, defenseEv: 0, spDefenseEv: 0, speedEv: 0, defenseNature: 1, spDefenseNature: 1 } : { ...current }
  if (dirty.has('key')) next.key = draft.key
  if (dirty.has('item') || dirty.has('key')) next.item = draft.item
  if (dirty.has('ability') || dirty.has('key')) next.ability = draft.ability
  if (dirty.has('nature')) next.nature = draft.nature
  if (dirty.has('moves')) next.revealedMoves = draft.moves.filter(Boolean).slice(0, 4)
  if (dirty.has('hp')) next.hpEv = draft.evs.hp
  if (dirty.has('attack')) next.attackEv = draft.evs.attack
  if (dirty.has('defense')) next.defenseEv = draft.evs.defense
  if (dirty.has('spAttack')) next.spAttackEv = draft.evs.spAttack
  if (dirty.has('spDefense')) next.spDefenseEv = draft.evs.spDefense
  if (dirty.has('speed')) next.speedEv = draft.evs.speed
  return next as T extends 'own' ? PartyMember : OpponentState
}
