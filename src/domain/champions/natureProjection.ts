import { NATURES, type NatureId, type StatKey } from './natures.ts'

export type NatureAxes = { up: StatKey | null; down: StatKey | null }

const byId = new Map(NATURES.map(nature => [nature.id, nature]))

/** Neutral identities remain intact until the user explicitly chooses another nature. */
export function natureAxes(natureId: NatureId): NatureAxes {
  const nature = byId.get(natureId)
  return { up: nature?.up ?? null, down: nature?.down ?? null }
}

/** Incomplete or self-cancelling axes are UI drafts, never persisted builds. */
export function natureIdForAxes(up: StatKey | null, down: StatKey | null): NatureId | null {
  if (up === null && down === null) return 'hardy'
  if (!up || !down || up === down) return null
  return NATURES.find(nature => nature.up === up && nature.down === down)?.id ?? null
}

const neutralPartner: Record<'up' | 'down', Record<StatKey, StatKey>> = {
  up: {
    attack: 'spAttack',
    defense: 'attack',
    spAttack: 'attack',
    spDefense: 'attack',
    speed: 'spAttack',
  },
  down: {
    attack: 'spAttack',
    defense: 'spAttack',
    spAttack: 'attack',
    spDefense: 'attack',
    speed: 'attack',
  },
}

/**
 * Apply one direct arrow click without leaving an incomplete UI-only nature.
 * Keep the other axis when possible; clicking the current opposite axis swaps
 * the two stats, and a neutral nature starts from a conventional valid pair.
 */
export function natureIdAfterAxisClick(natureId: NatureId, axis: 'up' | 'down', stat: StatKey): NatureId {
  const axes = natureAxes(natureId)
  if (axes[axis] === stat) return natureId

  const oppositeAxis = axis === 'up' ? 'down' : 'up'
  let partner = axes[oppositeAxis]
  if (partner === stat) partner = axes[axis]
  if (!partner || partner === stat) partner = neutralPartner[axis][stat]

  const up = axis === 'up' ? stat : partner
  const down = axis === 'down' ? stat : partner
  return natureIdForAxes(up, down) ?? natureId
}
