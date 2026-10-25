import type { NatureId, StatKey } from './app/types'
import effortLimits from './effortLimits.json' with { type: 'json' }

// New build edits share these bounds; historical backup restoration has a separate policy.
export const CHAMPIONS_EFFORT_CAP = effortLimits.total
export const CHAMPIONS_EFFORT_PER_STAT_CAP = effortLimits.perStat
export const EFFORT_KEYS = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'] as const
export const NATURES: { id: NatureId; label: string; up?: StatKey; down?: StatKey }[] = [
  { id: 'hardy', label: '노력' },
  { id: 'lonely', label: '외로움', up: 'attack', down: 'defense' },
  { id: 'brave', label: '용감', up: 'attack', down: 'speed' },
  { id: 'adamant', label: '고집', up: 'attack', down: 'spAttack' },
  { id: 'naughty', label: '개구쟁이', up: 'attack', down: 'spDefense' },
  { id: 'bold', label: '대담', up: 'defense', down: 'attack' },
  { id: 'docile', label: '온순' },
  { id: 'relaxed', label: '무사태평', up: 'defense', down: 'speed' },
  { id: 'impish', label: '장난꾸러기', up: 'defense', down: 'spAttack' },
  { id: 'lax', label: '촐랑', up: 'defense', down: 'spDefense' },
  { id: 'timid', label: '겁쟁이', up: 'speed', down: 'attack' },
  { id: 'hasty', label: '성급', up: 'speed', down: 'defense' },
  { id: 'serious', label: '성실' },
  { id: 'jolly', label: '명랑', up: 'speed', down: 'spAttack' },
  { id: 'naive', label: '천진난만', up: 'speed', down: 'spDefense' },
  { id: 'modest', label: '조심', up: 'spAttack', down: 'attack' },
  { id: 'mild', label: '의젓', up: 'spAttack', down: 'defense' },
  { id: 'quiet', label: '냉정', up: 'spAttack', down: 'speed' },
  { id: 'bashful', label: '수줍음' },
  { id: 'rash', label: '덜렁', up: 'spAttack', down: 'spDefense' },
  { id: 'calm', label: '차분', up: 'spDefense', down: 'attack' },
  { id: 'gentle', label: '얌전', up: 'spDefense', down: 'defense' },
  { id: 'sassy', label: '건방', up: 'spDefense', down: 'speed' },
  { id: 'careful', label: '신중', up: 'spDefense', down: 'spAttack' },
  { id: 'quirky', label: '변덕' },
]
const natureById = new Map(NATURES.map(nature => [nature.id, nature]))
export const knownNature = (value: unknown): value is NatureId => typeof value === 'string' && natureById.has(value as NatureId)
export function natureMultiplier(natureId: NatureId, stat: StatKey) {
  const nature = natureById.get(natureId)
  if (!nature) return 1
  if (nature.up === stat) return 1.1
  if (nature.down === stat) return 0.9
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
