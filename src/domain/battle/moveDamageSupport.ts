import type { BattleStatBlock } from './damageCore.ts'

export type QuickDamageUnsupportedReason =
  | 'one-hit-ko'
  | 'counter-damage'
  | 'level-fixed-damage'
  | 'target-current-hp'
  | 'hp-difference'
  | 'user-current-hp'
  | 'party-dependent'
  | 'held-item-dependent'
  | 'form-dependent-type'

type MoveDamageException =
  | { kind: 'unsupported'; reason: QuickDamageUnsupportedReason }
  | { kind: 'effectiveness'; rule: 'freeze-dry' | 'flying-press' }
  | { kind: 'ignore-defensive-stage' }
  | { kind: 'dynamic-category'; rule: 'shell-side-arm' }
  | { kind: 'dynamic-type'; rule: 'raging-bull' }

/**
 * One reviewed authority for damaging moves that cannot use the ordinary
 * category, effectiveness, or positive-base-power path.
 */
export const MOVE_DAMAGE_EXCEPTIONS: Readonly<Record<string, MoveDamageException>> = Object.freeze({
  '가위자르기': { kind: 'unsupported', reason: 'one-hit-ko' },
  '뿔드릴': { kind: 'unsupported', reason: 'one-hit-ko' },
  '땅가르기': { kind: 'unsupported', reason: 'one-hit-ko' },
  '절대영도': { kind: 'unsupported', reason: 'one-hit-ko' },
  '카운터': { kind: 'unsupported', reason: 'counter-damage' },
  '미러코트': { kind: 'unsupported', reason: 'counter-damage' },
  '메탈버스트': { kind: 'unsupported', reason: 'counter-damage' },
  // Comeuppance's generated BP 1 is a sentinel. Its real damage is 1.5x the
  // damage most recently received this turn, which this battle state lacks.
  '앙갚음': { kind: 'unsupported', reason: 'counter-damage' },
  '지구던지기': { kind: 'unsupported', reason: 'level-fixed-damage' },
  '나이트헤드': { kind: 'unsupported', reason: 'level-fixed-damage' },
  '분노의앞니': { kind: 'unsupported', reason: 'target-current-hp' },
  '죽기살기': { kind: 'unsupported', reason: 'hp-difference' },
  '목숨걸기': { kind: 'unsupported', reason: 'user-current-hp' },
  '집단구타': { kind: 'unsupported', reason: 'party-dependent' },
  '내던지기': { kind: 'unsupported', reason: 'held-item-dependent' },
  // The current battle model has no Full Belly/Hangry fact. Returning an
  // Electric result would be silently wrong on every Hangry turn.
  '오라휠': { kind: 'unsupported', reason: 'form-dependent-type' },
  '프리즈드라이': { kind: 'effectiveness', rule: 'freeze-dry' },
  '플라잉프레스': { kind: 'effectiveness', rule: 'flying-press' },
  'DD래리어트': { kind: 'ignore-defensive-stage' },
  '성스러운칼': { kind: 'ignore-defensive-stage' },
  '셸암즈': { kind: 'dynamic-category', rule: 'shell-side-arm' },
  '레이징불': { kind: 'dynamic-type', rule: 'raging-bull' },
})

export const QUICK_DAMAGE_UNSUPPORTED_REASONS: Readonly<Record<string, QuickDamageUnsupportedReason>> = Object.freeze(
  Object.fromEntries(Object.entries(MOVE_DAMAGE_EXCEPTIONS)
    .filter((entry): entry is [string, Extract<MoveDamageException, { kind: 'unsupported' }>] => entry[1].kind === 'unsupported')
    .map(([name, exception]) => [name, exception.reason])),
)

export function quickDamageUnsupportedReason(moveName: string): QuickDamageUnsupportedReason | null {
  return QUICK_DAMAGE_UNSUPPORTED_REASONS[moveName] ?? null
}

export function moveEffectivenessRule(moveName: string): 'freeze-dry' | 'flying-press' | null {
  const exception = MOVE_DAMAGE_EXCEPTIONS[moveName]
  return exception?.kind === 'effectiveness' ? exception.rule : null
}

export function moveIgnoresDefensiveStage(moveName: string): boolean {
  return MOVE_DAMAGE_EXCEPTIONS[moveName]?.kind === 'ignore-defensive-stage'
}

export function moveDynamicCategoryRule(moveName: string): 'shell-side-arm' | null {
  const exception = MOVE_DAMAGE_EXCEPTIONS[moveName]
  return exception?.kind === 'dynamic-category' ? exception.rule : null
}

export function moveDynamicTypeRule(moveName: string): 'raging-bull' | null {
  const exception = MOVE_DAMAGE_EXCEPTIONS[moveName]
  return exception?.kind === 'dynamic-type' ? exception.rule : null
}

const RAGING_BULL_TYPE_BY_KEY: Readonly<Record<string, string>> = Object.freeze({
  tauros: 'normal',
  'tauros-paldean': 'fighting',
  'tauros-paldean-combat': 'fighting',
  'tauros-paldean-combat-breed': 'fighting',
  'tauros-paldean-blaze': 'fire',
  'tauros-paldean-blaze-breed': 'fire',
  'tauros-paldean-aqua': 'water',
  'tauros-paldean-aqua-breed': 'water',
})

export function ragingBullType(attackerKey: string): string | null {
  return RAGING_BULL_TYPE_BY_KEY[attackerKey] ?? null
}

export type QuickDamageContextUnavailableReason = 'gravity-blocked'

const GRAVITY_BLOCKED_DAMAGE_MOVES: ReadonlySet<string> = new Set([
  '공중날기', '무릎차기', '뛰어오르기', '플라잉프레스',
])

/** A move can be generally supported yet unusable in the selected field state. */
export function quickDamageContextUnavailableReason(
  moveName: string,
  context?: { gravity?: boolean },
): QuickDamageContextUnavailableReason | null {
  return context?.gravity && GRAVITY_BLOCKED_DAMAGE_MOVES.has(moveName) ? 'gravity-blocked' : null
}

export type ShellSideArmCategory = 'physical' | 'special' | 'tie'

function stageMultiplier(stage: number) {
  const value = Math.max(-6, Math.min(6, Math.trunc(Number(stage) || 0)))
  return value >= 0 ? (2 + value) / 2 : 2 / (2 + Math.abs(value))
}

function stagedStat(value: number, stage: number) {
  return Math.max(1, Math.floor(value * stageMultiplier(stage)))
}

function shellSideArmComparisonDamage(attack: number, defense: number) {
  // Matches the category-selection calculation: level 50, BP 90, and no +2.
  return Math.floor(Math.floor(Math.floor(Math.floor(22 * 90 * attack) / defense)) / 50)
}

/** Shell Side Arm chooses a category before ordinary damage modifiers apply. */
export function shellSideArmCategory(
  attacker: BattleStatBlock,
  defender: BattleStatBlock,
  stages: { attack: number; spAttack: number; defense: number; spDefense: number },
): ShellSideArmCategory {
  const physical = shellSideArmComparisonDamage(
    stagedStat(attacker.attack, stages.attack),
    stagedStat(defender.defense, stages.defense),
  )
  const special = shellSideArmComparisonDamage(
    stagedStat(attacker.spAttack, stages.spAttack),
    stagedStat(defender.spDefense, stages.spDefense),
  )
  return physical === special ? 'tie' : physical > special ? 'physical' : 'special'
}
