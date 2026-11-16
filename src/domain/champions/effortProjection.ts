import type { EffortValues } from '../samples/myPartyChampionsSamples'
import type { EffortStatKey } from '../../app/types'
import { CHAMPIONS_EFFORT_PER_STAT_CAP, CHAMPIONS_EFFORT_CAP } from './buildRules'

export type ChampionsEffortPreset = 'hb' | 'hd' | 'as' | 'cs' | 'max-speed' | 'clear'

const zeroEfforts = (): EffortValues => ({ hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 })

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

/** The largest legal value for one stat while every other stat remains unchanged. */
export function maxEffortForStat(evs: EffortValues, field: EffortStatKey) {
  return Math.max(0, Math.min(CHAMPIONS_EFFORT_PER_STAT_CAP, remainingEffortPoints(evs, field)))
}

export function applyChampionsEffort(evs: EffortValues, field: keyof EffortValues, nextValue: unknown) {
  const clamped = clampEv(nextValue, CHAMPIONS_EFFORT_PER_STAT_CAP)
  const remainder = maxEffortForStat(evs, field)
  return {
    ...evs,
    [field]: Math.max(0, Math.min(clamped, remainder)),
  }
}


/** One-tap spreads replace the whole allocation atomically, so stale Speed never consumes HB/HD budget. */
export function championsEffortPreset(preset: ChampionsEffortPreset): EffortValues {
  const evs = zeroEfforts()
  if (preset === 'hb') return { ...evs, hp: CHAMPIONS_EFFORT_PER_STAT_CAP, defense: CHAMPIONS_EFFORT_PER_STAT_CAP }
  if (preset === 'hd') return { ...evs, hp: CHAMPIONS_EFFORT_PER_STAT_CAP, spDefense: CHAMPIONS_EFFORT_PER_STAT_CAP }
  if (preset === 'as') return { ...evs, attack: CHAMPIONS_EFFORT_PER_STAT_CAP, speed: CHAMPIONS_EFFORT_PER_STAT_CAP }
  if (preset === 'cs') return { ...evs, spAttack: CHAMPIONS_EFFORT_PER_STAT_CAP, speed: CHAMPIONS_EFFORT_PER_STAT_CAP }
  if (preset === 'max-speed') return { ...evs, speed: CHAMPIONS_EFFORT_PER_STAT_CAP }
  return evs
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
