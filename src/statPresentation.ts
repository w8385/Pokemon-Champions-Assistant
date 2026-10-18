import type { EffortStatKey } from './app/types'

/** Row-major order shared by card tiles and effort dialogs. */
export const STAT_PRESENTATION: { key: EffortStatKey; short: string; label: string; modalLabel?: string }[] = [
  { key: 'hp', short: '체력', label: '체력', modalLabel: 'HP' },
  { key: 'attack', short: '공격', label: '공격', modalLabel: '공격' },
  { key: 'defense', short: '방어', label: '방어', modalLabel: '방어' },
  { key: 'spAttack', short: '특수공격', label: '특수공격', modalLabel: '특수공격' },
  { key: 'spDefense', short: '특수방어', label: '특수방어', modalLabel: '특수방어' },
  { key: 'speed', short: '스피드', label: '스피드', modalLabel: '스피드' },
]
