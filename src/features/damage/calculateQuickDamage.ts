import type { QuickDamageInput } from './prepareQuickDamageInput'
import { isCalculableHeldItem, classifyHeldItem } from '../../domain/champions/itemIdentity'
import { quickMoveSupported, quickStagePair } from '../../domain/battle/quickDamageState'
import { CONDITIONAL_MOVE_POWER_RULES, multiHitOptions, resolveMultiHitMeta, applyTargetWeightMovePower } from '../../domain/battle/movePower'
import { resolveAbilityAdjustedMoveMeta, resolveAbilityAdjustedTypes, resolveStabMultiplier } from '../../domain/battle/moveEffects'
import { abilityAdjustedTypeEffectiveness } from '../../domain/battle/typeEffectiveness'
import { resolveDamageModifiers } from '../../domain/battle/modifierRules'
import { calcDamage } from '../../domain/battle/damageCore'
import { isChoiceScarfItem } from '../../domain/battle/statProjection'
export function calculateQuickDamage({ source, target, name, conditions, sourceRow, targetRow, sourceStats, targetStats, sourceAbilityValid, targetAbilityValid, sourceAbility, targetAbility, base }: QuickDamageInput) {
    if (!isCalculableHeldItem(source.key, source.item) || !isCalculableHeldItem(target.key, target.item) || !sourceAbilityValid || !targetAbilityValid) return null
    if ((source.speedScarfOverride === true && classifyHeldItem(source.key, source.item).requiredStone) || (target.speedScarfOverride === true && classifyHeldItem(target.key, target.item).requiredStone)) return null
    if ((source.ability === 'unburden' && source.speedAbilityActive && isChoiceScarfItem(source.item)) || (target.ability === 'unburden' && target.speedAbilityActive && isChoiceScarfItem(target.item))) return null

    if (!sourceStats || !targetStats || !base || !quickMoveSupported(name, base, Boolean(CONDITIONAL_MOVE_POWER_RULES[name]))) return null
    const choices = multiHitOptions(name)
    const meta = applyTargetWeightMovePower(name, resolveAbilityAdjustedMoveMeta(name, resolveMultiHitMeta(name, base, choices?.includes(conditions.hits) ? conditions.hits : choices?.[0] ?? null, sourceAbility), sourceAbility, conditions.weather), targetRow?.weightKg ?? null)
    if (!meta) return null
    const type = meta.type, mode = meta.category === 'physical' || meta.category === 'special' ? meta.category : null
    if (!type || !mode || !meta.power || !sourceRow || !targetRow) return null
    const sourceTypes = resolveAbilityAdjustedTypes(sourceRow.types, sourceAbility, conditions.weather, conditions.terrain)
    const targetTypes = resolveAbilityAdjustedTypes(targetRow.types, targetAbility, conditions.weather, conditions.terrain)
    const foulPlay = name === '속임수'
    const [attackStage, defenseStage] = quickStagePair(source.battle, target.battle, { ...meta, usesTargetAttack: foulPlay })
    const modifiers = resolveDamageModifiers({ attackerAbility: sourceAbility, attackerTypes: sourceTypes, attackerItem: source.item, defenderAbility: targetAbility, defenderKey: target.key, defenderItem: target.item, moveName: name, moveMeta: meta, baseMoveType: base.type ?? type, moveType: type, movePower: meta.power, mode, effectiveness: abilityAdjustedTypeEffectiveness(type, targetTypes, targetAbility, sourceAbility), attackStage, defenseStage, defenderTypes: targetTypes, burned: source.battle.burned, attackerLowHp: source.battle.lowHp, targetPoisoned: target.battle.poisoned, defenderFullHp: target.battle.fullHp, movedAfterTarget: false, faintedAllies: 0, rivalryMode: 'neutral', parentalBond: false, defenderStatused: target.battle.poisoned, electromorphosisCharged: false, weather: conditions.weather, terrain: conditions.terrain, reflect: target.battle.reflect, lightScreen: target.battle.lightScreen, auroraVeil: target.battle.auroraVeil, friendGuard: false, critical: conditions.critical })
    const damage = calcDamage(foulPlay ? { ...sourceStats, attack: targetStats.attack } : sourceStats, targetStats, meta.power, mode, resolveStabMultiplier(sourceTypes, type, sourceAbility, conditions.typeChangeStab), modifiers.effectiveness, meta, modifiers)
    return damage ? { damage, targetHp: targetStats.hp, hits: meta.hits ?? 1, effectiveness: modifiers.effectiveness } : null
}
