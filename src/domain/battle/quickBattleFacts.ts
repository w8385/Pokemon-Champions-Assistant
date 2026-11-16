type QuickBattleFactSide = {
  speedStage: number
  battle: {
    attackStage: number
    spAttackStage: number
    defenseStage: number
    spDefenseStage: number
    accuracyStage: number
    evasionStage: number
    statused: boolean
    burned: boolean
    poisoned: boolean
  }
}

export function quickPositiveStageTotal(side: QuickBattleFactSide) {
  return [
    side.battle.attackStage,
    side.battle.spAttackStage,
    side.battle.defenseStage,
    side.battle.spDefenseStage,
    side.speedStage,
    side.battle.accuracyStage,
    side.battle.evasionStage,
  ].reduce((total, stage) => total + Math.max(0, Number(stage) || 0), 0)
}

export const quickStatused = (side: QuickBattleFactSide) =>
  side.battle.statused || side.battle.burned || side.battle.poisoned

export function quickHpFacts(value: unknown) {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 100
  const hpPercent = Math.max(1, Math.min(100, Math.trunc(numeric)))
  return { hpPercent, fullHp: hpPercent === 100, lowHp: hpPercent <= 33 }
}
