import { NATURES } from './natures.ts'
import type { NatureId, StatKey } from './natures.ts'
import effortLimits from '../../canonical-data/champions/effortLimits.json' with { type: 'json' }
export { NATURES } from './natures.ts'

// New build edits share these bounds; historical backup restoration has a separate policy.
export const CHAMPIONS_EFFORT_CAP = effortLimits.total
export const CHAMPIONS_EFFORT_PER_STAT_CAP = effortLimits.perStat
export const EFFORT_KEYS = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const
const natureById = new Map(NATURES.map(nature => [nature.id, nature]))
export const knownNature = (value: unknown): value is NatureId => typeof value === 'string' && natureById.has(value as NatureId)
export function natureMultiplier(natureId: NatureId, stat: StatKey) {
  const nature = natureById.get(natureId)
  if (!nature) return 1
  if ('up' in nature && nature.up === stat) return 1.1
  if ('down' in nature && nature.down === stat) return 0.9
  return 1
}
export const validEffort = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 0 && Number(value) <= CHAMPIONS_EFFORT_PER_STAT_CAP
export function validCompleteEfforts(value: unknown): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const efforts = value as Record<string, unknown>
  return EFFORT_KEYS.every(key => validEffort(efforts[key])) &&
    EFFORT_KEYS.reduce((total, key) => total + Number(efforts[key]), 0) <= CHAMPIONS_EFFORT_CAP
}
