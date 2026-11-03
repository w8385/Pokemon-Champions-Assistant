import { quickStagePair, type QuickStages } from './quickDamageState'

export type SampleBattle = QuickStages & {
  burned: boolean; lowHp: boolean; poisoned: boolean; fullHp: boolean; statused: boolean
  reflect: boolean; lightScreen: boolean; auroraVeil: boolean; critical: boolean
  movedAfterTarget: boolean; electromorphosisCharged: boolean; disguiseActive: boolean
  faintedAllies: number; rivalryMode: 'neutral' | 'same' | 'opposite'; parentalBond: boolean
  actual: Partial<Record<'attack' | 'defense' | 'spAttack' | 'spDefense', number>>
}
export type SampleConditions = {
  ownerKey: string
  own: SampleBattle
  opponent: SampleBattle
  moveHits: Record<string, number>
  conditionalValues: Record<string, boolean | number>
}
export function sampleBattle(input: Partial<SampleBattle> = {}): SampleBattle {
  const stage = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= -6 && v <= 6 ? v : 0
  const actual: SampleBattle['actual'] = {}
  for (const key of ['attack', 'defense', 'spAttack', 'spDefense'] as const) {
    const value = input.actual?.[key]
    if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 999) actual[key] = value
  }
  return {
    attackStage: stage(input.attackStage), spAttackStage: stage(input.spAttackStage), defenseStage: stage(input.defenseStage), spDefenseStage: stage(input.spDefenseStage),
    burned: input.burned === true, lowHp: input.lowHp === true, poisoned: input.poisoned === true, fullHp: input.fullHp !== false,
    statused: input.statused === true, reflect: input.reflect === true, lightScreen: input.lightScreen === true, auroraVeil: input.auroraVeil === true,
    critical: input.critical === true, movedAfterTarget: input.movedAfterTarget === true, electromorphosisCharged: input.electromorphosisCharged === true,
    disguiseActive: input.disguiseActive === true, faintedAllies: typeof input.faintedAllies === 'number' && Number.isInteger(input.faintedAllies) ? Math.max(0, Math.min(5, input.faintedAllies)) : 0,
    rivalryMode: input.rivalryMode === 'same' || input.rivalryMode === 'opposite' ? input.rivalryMode : 'neutral', parentalBond: input.parentalBond === true,
    actual,
  }
}
export function sampleConditions(ownerKey: string, previous?: Partial<SampleConditions> | null): SampleConditions {
  return {
    ownerKey, own: sampleBattle(previous?.ownerKey === ownerKey ? previous.own : undefined),
    opponent: sampleBattle(previous?.ownerKey === ownerKey ? previous.opponent : undefined),
    moveHits: previous?.ownerKey === ownerKey && previous.moveHits ? { ...previous.moveHits } : {},
    conditionalValues: previous?.ownerKey === ownerKey && previous.conditionalValues ? { ...previous.conditionalValues } : {},
  }
}
export function sampleMoveKey(ownKey: string, targetKey: string, direction: 'forward' | 'reverse', move: string): string {
  return JSON.stringify([ownKey, targetKey, direction, move])
}
export function sampleMoveStats<T extends { attack: number; defense: number; spAttack: number; spDefense: number }>(
  name: string, meta: { category?: string | null; usesDefenseAsAttack?: boolean; targetsDefenseStat?: string },
  source: T, target: T, sourceBattle: SampleBattle, targetBattle: SampleBattle,
): { attacker: T; defender: T; attackStage: number; defenseStage: number } {
  const attacker = { ...source, ...sourceBattle.actual }
  const defender = { ...target, ...targetBattle.actual }
  const foulPlay = name === '속임수'
  const [attackStage, defenseStage] = quickStagePair(sourceBattle, targetBattle, { ...meta, usesTargetAttack: foulPlay })
  return { attacker: foulPlay ? { ...attacker, attack: defender.attack } : attacker, defender, attackStage, defenseStage }
}
