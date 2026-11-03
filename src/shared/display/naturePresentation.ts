import type { NatureId, StatKey } from '../../app/types'
import { NATURES } from '../../domain/champions/natures'
export const natureById = new Map(NATURES.map(nature => [nature.id, nature]))
export function boostedStatForNature(natureId: NatureId): StatKey | null {
  return natureById.get(natureId)?.up ?? null
}
