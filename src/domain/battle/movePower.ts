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

export function multiHitOptions(moveName: string) {
  switch (moveName) {
    case '드래곤애로':
      return [2]
    case '스케일샷':
      return [2, 3, 4, 5]
    case '트리플악셀':
      return [1, 2, 3]
    default:
      return null
  }
}

export function resolveMultiHitMeta(moveName: string, moveMeta: MoveMeta | null, hitCount: number | null, attackerAbility = '') {
  if (!moveMeta) return moveMeta
  const skillLink = attackerAbility === 'skill-link'
  if (moveName === '드래곤애로') return { ...moveMeta, hits: 2, hitPowers: [50, 50] }
  if (moveName === '스케일샷') {
    const hits = skillLink ? 5 : (hitCount && hitCount >= 2 && hitCount <= 5 ? hitCount : 2)
    return { ...moveMeta, power: 25, hits, hitPowers: Array.from({ length: hits }, () => 25), variablePower: false }
  }
  if (moveName === '트리플악셀') {
    const hits = skillLink ? 3 : (hitCount && hitCount >= 1 && hitCount <= 3 ? hitCount : 3)
    return { ...moveMeta, power: 20, hits, hitPowers: [20, 40, 60].slice(0, hits), variablePower: false }
  }
  return moveMeta
}

export function multiHitSummary(moveName: string, moveMeta: MoveMeta | null, hitCount: number | null) {
  const resolved = resolveMultiHitMeta(moveName, moveMeta, hitCount)
  const powers = resolved?.hitPowers ?? []
  if (!powers.length) return null
  const totalPower = powers.reduce((sum, value) => sum + value, 0)
  return {
    hits: powers.length,
    totalPower,
  }
}
