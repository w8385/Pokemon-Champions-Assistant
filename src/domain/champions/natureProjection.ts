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
