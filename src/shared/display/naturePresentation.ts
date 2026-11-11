import type { NatureId, StatKey } from '../../app/types'
import { NATURES } from '../../domain/champions/natures'
export const natureById = new Map(NATURES.map(nature => [nature.id, nature]))
// Choice policy only: preserve all 25 identities for display, validation, OCR and calculations.
export const SELECTABLE_NATURES = NATURES.filter(nature => nature.id === 'hardy' || Boolean(nature.up && nature.down))
export function natureSelectionId(natureId: string): string {
  const nature = natureById.get(natureId as NatureId)
  return nature && !nature.up && !nature.down ? 'hardy' : natureId
}
export function boostedStatForNature(natureId: NatureId): StatKey | null {
  return natureById.get(natureId)?.up ?? null
}
