import type { EffortValues } from '../samples/myPartyChampionsSamples'
import type { EffortStatKey } from '../../app/types'
import { CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_CAP } from './buildRules'
export function clampEv(value: unknown, max = CHAMPIONS_EFFORT_PER_STAT_CAP) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.min(max, Math.trunc(num)))
}

export function totalEffortPoints(evs: EffortValues) {
  return evs.hp + evs.attack + evs.defense + evs.spAttack + evs.spDefense + evs.speed
}

export function remainingEffortPoints(evs: EffortValues, field?: EffortStatKey) {
  if (!field) return CHAMPIONS_EFFORT_CAP - totalEffortPoints(evs)
  return CHAMPIONS_EFFORT_CAP - (totalEffortPoints(evs) - evs[field])
}

export function applyChampionsEffort(evs: EffortValues, field: keyof EffortValues, nextValue: unknown) {
  const clamped = clampEv(nextValue, CHAMPIONS_EFFORT_PER_STAT_CAP)
  const remainder = remainingEffortPoints(evs, field)
  return {
    ...evs,
    [field]: Math.max(0, Math.min(clamped, remainder)),
  }
}

export function sanitizeEvs(input: unknown): EffortValues {
  const evs = input && typeof input === 'object' ? (input as Partial<EffortValues>) : {}
  return {
    hp: clampEv(evs.hp, CHAMPIONS_EFFORT_PER_STAT_CAP),
    attack: clampEv(evs.attack, CHAMPIONS_EFFORT_PER_STAT_CAP),
    defense: clampEv(evs.defense, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spAttack: clampEv(evs.spAttack, CHAMPIONS_EFFORT_PER_STAT_CAP),
    spDefense: clampEv(evs.spDefense, CHAMPIONS_EFFORT_PER_STAT_CAP),
    speed: clampEv(evs.speed, CHAMPIONS_EFFORT_PER_STAT_CAP),
  }
}
