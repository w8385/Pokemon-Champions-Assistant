import type { MoveMeta, ConditionalPowerValue } from '../../app/types'

export type ConditionalMovePowerRule = {
  kind: 'count' | 'toggle'
  label: string
  min?: number
  max?: number
  defaultValue: ConditionalPowerValue
  resolvePower: (basePower: number, value: ConditionalPowerValue) => number
}

export const CONDITIONAL_MOVE_POWER_RULES: Record<string, ConditionalMovePowerRule> = {
  '성묘': {
    kind: 'count',
    label: '내 쓰러진 포켓몬 수',
    min: 0,
    max: 5,
    defaultValue: 0,
    resolvePower: (basePower, value) => basePower + Math.max(0, Math.min(5, Math.trunc(Number(value) || 0))) * 50,
  },
  '어시스트파워': {
    kind: 'count',
    label: '내 능력 상승 랭크 합',
    min: 0,
    max: 36,
    defaultValue: 0,
    resolvePower: (basePower, value) => basePower + Math.max(0, Math.min(36, Math.trunc(Number(value) || 0))) * 20,
  },
  '객기': {
    kind: 'toggle',
    label: '내가 상태이상임',
    defaultValue: false,
    resolvePower: (basePower, value) => value ? basePower * 2 : basePower,
  },
  '병상첨병': {
    kind: 'toggle',
    label: '상대가 상태이상임',
    defaultValue: false,
    resolvePower: (basePower, value) => value ? basePower * 2 : basePower,
  },
  '리벤지': {
    kind: 'toggle',
    label: '이번 턴 먼저 맞음',
    defaultValue: false,
    resolvePower: (basePower, value) => value ? basePower * 2 : basePower,
  },
}

export function normalizeConditionalPowerValue(rule: ConditionalMovePowerRule, raw: unknown): ConditionalPowerValue {
  if (rule.kind === 'toggle') return Boolean(raw)
  const min = rule.min ?? 0
  const max = rule.max ?? min
  const num = Number(raw)
  if (!Number.isFinite(num)) return Number(rule.defaultValue)
  return Math.max(min, Math.min(max, Math.trunc(num)))
}

export function applyConditionalMovePower(moveName: string, moveMeta: MoveMeta | null, rawValue: unknown) {
  if (!moveMeta) return moveMeta
  const rule = CONDITIONAL_MOVE_POWER_RULES[moveName]
  if (!rule || typeof moveMeta.power !== 'number') return moveMeta
  const value = normalizeConditionalPowerValue(rule, rawValue)
  return {
    ...moveMeta,
    power: rule.resolvePower(moveMeta.power, value),
    variablePower: true,
  }
}

export function weightBasedMovePower(weightKg: number) {
  if (weightKg < 10) return 20
  if (weightKg < 25) return 40
  if (weightKg < 50) return 60
  if (weightKg < 100) return 80
  if (weightKg < 200) return 100
  return 120
}

export function applyTargetWeightMovePower(moveName: string, moveMeta: MoveMeta | null, targetWeightKg: number | null) {
  if (!moveMeta) return moveMeta
  const isWeightMove = moveName === '로우킥' || moveName === '풀묶기' || moveName === '안다리걸기' || moveName === '안다리 걸기'
  if (!isWeightMove || typeof targetWeightKg !== 'number' || !Number.isFinite(targetWeightKg)) return moveMeta
  return {
    ...moveMeta,
    power: weightBasedMovePower(targetWeightKg),
    variablePower: true,
  }
}

type MultiHitRule = {
  options: readonly number[]
  skillLink?: boolean
  powerMultipliers?: readonly number[]
}

const VARIABLE_HITS: MultiHitRule = { options: [2, 3, 4, 5], skillLink: true }
const FIXED_TWO_HITS: MultiHitRule = { options: [2] }
const rulesFor = (names: readonly string[], rule: MultiHitRule): Record<string, MultiHitRule> =>
  Object.fromEntries(names.map(name => [name, rule]))

// Canonical Champions move names plus historical Korean aliases kept in saved data.
export const MULTI_HIT_RULES: Readonly<Record<string, MultiHitRule>> = {
  ...rulesFor([
    '손바닥치기', '본러쉬', '본러시', '기관총', '씨기관총', '연속펀치',
    '연속뺨치기', '마구찌르기', '마구할퀴기', '고드름침', '바늘미사일',
    '락블레스트', '록블라스트', '스케일샷', '가시대포', '스위프뺨치기', '물수리검',
  ], VARIABLE_HITS),
  ...rulesFor([
    '더블어택', '두번차기', '두번치기', '드래곤애로', '더블촙',
    '더블윙', '트윈빔', '더블니들',
  ], FIXED_TWO_HITS),
  '트리플악셀': { options: [1, 2, 3], skillLink: true, powerMultipliers: [1, 2, 3] },
  '찍찍베기': { options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], skillLink: true },
}

export function multiHitOptions(moveName: string): number[] | null {
  const options = MULTI_HIT_RULES[moveName]?.options
  return options ? [...options] : null
}

export function skillLinkAppliesToMove(moveName: string) {
  return Boolean(MULTI_HIT_RULES[moveName]?.skillLink)
}

export function resolveMultiHitMeta(moveName: string, moveMeta: MoveMeta | null, hitCount: number | null, attackerAbility = '') {
  if (!moveMeta) return moveMeta
  const rule = MULTI_HIT_RULES[moveName]
  if (!rule) return moveMeta
  const requestedHits = hitCount !== null && rule.options.includes(hitCount) ? hitCount : rule.options[0]
  const hits = attackerAbility === 'skill-link' && rule.skillLink
    ? rule.options[rule.options.length - 1]
    : requestedHits
  const basePower = typeof moveMeta.power === 'number' ? moveMeta.power : null
  const hitPowers = basePower === null
    ? moveMeta.hitPowers
    : rule.powerMultipliers
      ? rule.powerMultipliers.slice(0, hits).map(multiplier => basePower * multiplier)
      : Array.from({ length: hits }, () => basePower)
  return { ...moveMeta, hits, hitPowers, variablePower: false }
}

export function multiHitSummary(moveName: string, moveMeta: MoveMeta | null, hitCount: number | null) {
  const resolved = moveMeta?.hitPowers?.length ? moveMeta : resolveMultiHitMeta(moveName, moveMeta, hitCount)
  const powers = resolved?.hitPowers?.length
    ? resolved.hitPowers
    : typeof resolved?.power === 'number' && resolved.hits
      ? Array.from({ length: resolved.hits }, () => resolved.power!)
      : []
  if (!powers.length) return null
  return { hits: powers.length, totalPower: powers.reduce((sum, value) => sum + value, 0) }
}
