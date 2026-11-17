import type { MoveMeta, ConditionalPowerValue } from '../../app/types'

export type ConditionalMovePowerRule = {
  kind: 'count' | 'toggle'
  label: string
  min?: number
  max?: number
  basePower?: number
  defaultValue: ConditionalPowerValue
  resolvePower: (basePower: number, value: ConditionalPowerValue) => number
}

const doubled = (basePower: number, value: ConditionalPowerValue) => value ? basePower * 2 : basePower
const multiplied = (multiplier: number) => (basePower: number, value: ConditionalPowerValue) => value ? Math.floor(basePower * multiplier) : basePower
const counted = (increment: number, cap: number) => (basePower: number, value: ConditionalPowerValue) => basePower + Math.max(0, Math.min(cap, Math.trunc(Number(value) || 0))) * increment

export function lowHpMovePower(hpPercent: number) {
  const value = Math.max(0, Math.min(100, Number(hpPercent) || 0))
  if (value <= 4.17) return 200
  if (value <= 10.42) return 150
  if (value <= 20.83) return 100
  if (value <= 35.42) return 80
  if (value <= 68.75) return 40
  return 20
}

export function currentHpMovePower(maxPower: number, hpPercent: number) {
  return Math.max(1, Math.floor(maxPower * Math.max(1, Math.min(100, Number(hpPercent) || 100)) / 100))
}

export function electroBallPower(sourceSpeed: number, targetSpeed: number) {
  if (!(sourceSpeed > 0) || !(targetSpeed > 0)) return 40
  const ratio = sourceSpeed / targetSpeed
  return ratio >= 4 ? 150 : ratio >= 3 ? 120 : ratio >= 2 ? 80 : ratio >= 1 ? 60 : 40
}

export function gyroBallPower(sourceSpeed: number, targetSpeed: number) {
  if (!(sourceSpeed > 0) || !(targetSpeed > 0)) return 1
  return Math.min(150, Math.floor(25 * targetSpeed / sourceSpeed) + 1)
}

export function userWeightMovePower(sourceWeightKg: number, targetWeightKg: number) {
  if (!(sourceWeightKg > 0) || !(targetWeightKg > 0)) return 40
  const ratio = sourceWeightKg / targetWeightKg
  return ratio >= 5 ? 120 : ratio >= 4 ? 100 : ratio >= 3 ? 80 : ratio >= 2 ? 60 : 40
}

export function abilityAdjustedWeight(weightKg: number, ability: string) {
  if (!(weightKg > 0)) return 0
  if (ability === 'heavy-metal') return weightKg * 2
  if (ability === 'light-metal') return weightKg / 2
  return weightKg
}

export const CONDITIONAL_MOVE_POWER_RULES: Record<string, ConditionalMovePowerRule> = {
  '성묘': {
    kind: 'count',
    label: '내 쓰러진 포켓몬 수',
    min: 0,
    max: 5,
    defaultValue: 0,
    resolvePower: counted(50, 5),
  },
  '어시스트파워': {
    kind: 'count',
    label: '내 능력 상승 랭크 합',
    min: 0,
    max: 42,
    defaultValue: 0,
    resolvePower: counted(20, 42),
  },
  '기어오르기': { kind: 'count', label: '내 능력 상승 랭크 합', min: 0, max: 42, defaultValue: 0, resolvePower: counted(20, 42) },
  '객기': {
    kind: 'toggle',
    label: '내가 상태이상임',
    defaultValue: false,
    resolvePower: doubled,
  },
  '병상첨병': {
    kind: 'toggle',
    label: '상대가 상태이상임',
    defaultValue: false,
    resolvePower: doubled,
  },
  '리벤지': {
    kind: 'toggle',
    label: '이번 턴 먼저 맞음',
    defaultValue: false,
    resolvePower: doubled,
  },
  '백귀야행': { kind: 'toggle', label: '상대가 상태이상임', defaultValue: false, resolvePower: doubled },
  '독침천발': { kind: 'toggle', label: '상대가 독/맹독임', defaultValue: false, resolvePower: doubled },
  '베놈쇼크': { kind: 'toggle', label: '상대가 독/맹독임', defaultValue: false, resolvePower: doubled },
  '눈사태': { kind: 'toggle', label: '이번 턴 상대에게 먼저 맞음', defaultValue: false, resolvePower: doubled },
  '보복': { kind: 'toggle', label: '상대보다 늦게 행동', defaultValue: false, resolvePower: doubled },
  '승부굳히기': { kind: 'toggle', label: '상대가 이번 턴 피해를 입음', defaultValue: false, resolvePower: doubled },
  '분풀이': { kind: 'toggle', label: '이번 턴 내 능력 랭크가 하락함', defaultValue: false, resolvePower: doubled },
  '분함의발구르기': { kind: 'toggle', label: '직전 기술이 실패함', defaultValue: false, resolvePower: doubled },
  '열불내기': { kind: 'toggle', label: '직전 기술이 실패함', defaultValue: false, resolvePower: doubled },
  '돌림노래': { kind: 'toggle', label: '아군이 이번 턴 먼저 사용함', defaultValue: false, resolvePower: doubled },
  '분노의주먹': { kind: 'count', label: '공격받은 횟수', min: 0, max: 6, defaultValue: 0, resolvePower: counted(50, 6) },
  '토해내기': { kind: 'count', label: '비축 횟수', min: 1, max: 3, basePower: 0, defaultValue: 1, resolvePower: (_basePower, value) => Math.max(1, Math.min(3, Math.trunc(Number(value) || 1))) * 100 },
  '기사회생': { kind: 'count', label: '현재 HP', min: 1, max: 100, basePower: 0, defaultValue: 100, resolvePower: (_basePower, value) => lowHpMovePower(Number(value)) },
  '바둥바둥': { kind: 'count', label: '현재 HP', min: 1, max: 100, basePower: 0, defaultValue: 100, resolvePower: (_basePower, value) => lowHpMovePower(Number(value)) },
  '분화': { kind: 'count', label: '현재 HP', min: 1, max: 100, defaultValue: 100, resolvePower: (basePower, value) => currentHpMovePower(basePower, Number(value)) },
  '해수스파우팅': { kind: 'count', label: '현재 HP', min: 1, max: 100, defaultValue: 100, resolvePower: (basePower, value) => currentHpMovePower(basePower, Number(value)) },
  '하드프레스': { kind: 'count', label: '상대 현재 HP', min: 1, max: 100, basePower: 100, defaultValue: 100, resolvePower: (basePower, value) => currentHpMovePower(basePower, Number(value)) },
  '애크러뱃': { kind: 'toggle', label: '도구를 지니지 않음', defaultValue: false, resolvePower: doubled },
  '헤비봄버': { kind: 'count', label: '자동 위력', min: 40, max: 120, basePower: 40, defaultValue: 40, resolvePower: (_basePower, value) => Number(value) },
  '히트스탬프': { kind: 'count', label: '자동 위력', min: 40, max: 120, basePower: 40, defaultValue: 40, resolvePower: (_basePower, value) => Number(value) },
  '일렉트릭볼': { kind: 'count', label: '자동 위력', min: 40, max: 150, basePower: 40, defaultValue: 40, resolvePower: (_basePower, value) => Number(value) },
  '자이로볼': { kind: 'count', label: '자동 위력', min: 1, max: 150, basePower: 1, defaultValue: 1, resolvePower: (_basePower, value) => Number(value) },
  '솔라빔': { kind: 'toggle', label: '불리한 날씨', defaultValue: false, resolvePower: multiplied(.5) },
  '솔라블레이드': { kind: 'toggle', label: '불리한 날씨', defaultValue: false, resolvePower: multiplied(.5) },
  '대지의파동': { kind: 'toggle', label: '필드 적용', defaultValue: false, resolvePower: doubled },
  '라이징볼트': { kind: 'toggle', label: '일렉트릭필드의 상대', defaultValue: false, resolvePower: doubled },
  '와이드포스': { kind: 'toggle', label: '사이코필드 적용', defaultValue: false, resolvePower: multiplied(1.5) },
  '미스트버스트': { kind: 'toggle', label: '미스트필드 적용', defaultValue: false, resolvePower: multiplied(1.5) },
  'G의힘': { kind: 'toggle', label: '중력 적용', defaultValue: false, resolvePower: multiplied(1.5) },
  '변덕레이저': { kind: 'toggle', label: '위력 2배가 발동함', defaultValue: false, resolvePower: doubled },
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
  const basePower = rule?.basePower ?? moveMeta.power
  if (!rule || typeof basePower !== 'number') return moveMeta
  const value = normalizeConditionalPowerValue(rule, rawValue)
  return {
    ...moveMeta,
    power: rule.resolvePower(basePower, value),
    variablePower: true,
  }
}

export function applyTerrainPulseType(moveName: string, moveMeta: MoveMeta | null, terrain: string, grounded: boolean) {
  if (!moveMeta || moveName !== '대지의파동' || !grounded || terrain === 'none') return moveMeta
  const type = ({ electric: 'electric', grassy: 'grass', psychic: 'psychic', misty: 'fairy' } as Record<string, string>)[terrain]
  return type ? { ...moveMeta, type } : moveMeta
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

/** One authority for the hit count shown in controls and used by damage math. */
export function resolveMultiHitCount(moveName: string, hitCount: number | null | undefined, attackerAbility = '') {
  const rule = MULTI_HIT_RULES[moveName]
  if (!rule) return null
  if (attackerAbility === 'skill-link' && rule.skillLink) return rule.options[rule.options.length - 1]
  return typeof hitCount === 'number' && rule.options.includes(hitCount) ? hitCount : rule.options[0]
}

export function resolveMultiHitMeta(moveName: string, moveMeta: MoveMeta | null, hitCount: number | null | undefined, attackerAbility = '') {
  if (!moveMeta) return moveMeta
  const rule = MULTI_HIT_RULES[moveName]
  if (!rule) return moveMeta
  const hits = resolveMultiHitCount(moveName, hitCount, attackerAbility)!
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
