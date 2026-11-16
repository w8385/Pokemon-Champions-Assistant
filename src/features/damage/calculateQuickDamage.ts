import type { QuickDamageInput } from './prepareQuickDamageInput'
import { isCalculableHeldItem, classifyHeldItem } from '../../domain/champions/itemIdentity'
import { quickMoveSupported, quickStagePair } from '../../domain/battle/quickDamageState'
import { CONDITIONAL_MOVE_POWER_RULES, abilityAdjustedWeight, applyConditionalMovePower, applyTerrainPulseType, electroBallPower, gyroBallPower, multiHitOptions, resolveMultiHitMeta, applyTargetWeightMovePower, userWeightMovePower } from '../../domain/battle/movePower'
import { resolveAbilityAdjustedMoveMeta, resolveAbilityAdjustedTypes, resolveStabMultiplier } from '../../domain/battle/moveEffects'
import { abilityAdjustedTypeEffectiveness } from '../../domain/battle/typeEffectiveness'
import { isDamageGrounded, resolveDamageModifiers } from '../../domain/battle/modifierRules'
import { calcDamage } from '../../domain/battle/damageCore'
import { quickPositiveStageTotal, quickStatused } from '../../domain/battle/quickBattleFacts'
export function calculateQuickDamage({ source, target, name, conditions, sourceRow, targetRow, sourceStats, targetStats, sourceForm, targetForm, sourceAbilityValid, targetAbilityValid, sourceAbility, targetAbility, base, hitCount, conditionalValue: configuredConditionalValue, sourceSpeed, targetSpeed }: QuickDamageInput) {
    if (!isCalculableHeldItem(source.key, source.item) || !isCalculableHeldItem(target.key, target.item) || !sourceAbilityValid || !targetAbilityValid) return null
    if (!sourceStats || !targetStats || !base || !sourceRow || !targetRow) return null
    const rule = CONDITIONAL_MOVE_POWER_RULES[name]
    const sourceGrounded = isDamageGrounded(sourceRow.types, sourceAbility, source.item, conditions.gravity)
    const targetGrounded = isDamageGrounded(targetRow.types, targetAbility, target.item, conditions.gravity)
    const sourceWeight = abilityAdjustedWeight(sourceRow.weightKg ?? 0, sourceAbility)
    const targetWeight = abilityAdjustedWeight(targetRow.weightKg ?? 0, targetAbility)
    const automaticConditionalValue = name === '성묘' ? source.battle.faintedAllies
      : name === '어시스트파워' || name === '기어오르기' ? quickPositiveStageTotal(source)
        : name === '객기' ? quickStatused(source)
          : name === '병상첨병' || name === '백귀야행' ? quickStatused(target)
            : name === '독침천발' || name === '베놈쇼크' ? target.battle.poisoned
              : name === '리벤지' || name === '눈사태' ? source.battle.damagedByTarget
                : name === '보복' ? source.battle.movedAfterTarget
                  : name === '승부굳히기' ? target.battle.damagedThisTurn
                    : name === '분풀이' ? source.battle.statDroppedThisTurn
                      : name === '분함의발구르기' || name === '열불내기' ? source.battle.previousMoveFailed
                        : name === '돌림노래' ? source.battle.allyUsedRound
                          : name === '분노의주먹' ? source.battle.timesHit
                            : name === '토해내기' ? source.battle.stockpile
                              : ['기사회생', '바둥바둥', '분화', '해수스파우팅'].includes(name) ? source.battle.hpPercent
                                : name === '하드프레스' ? target.battle.hpPercent
                                  : name === '애크러뱃' ? classifyHeldItem(source.key, source.item).status === 'none'
                                    : name === '헤비봄버' || name === '히트스탬프' ? userWeightMovePower(sourceWeight, targetWeight)
                                      : name === '일렉트릭볼' ? electroBallPower(sourceSpeed ?? 0, targetSpeed ?? 0)
                                        : name === '자이로볼' ? gyroBallPower(sourceSpeed ?? 0, targetSpeed ?? 0)
                                          : name === '솔라빔' || name === '솔라블레이드' ? ['rain', 'sand', 'snow'].includes(conditions.weather)
                                            : name === '대지의파동' ? conditions.terrain !== 'none' && sourceGrounded
                                              : name === '라이징볼트' ? conditions.terrain === 'electric' && targetGrounded
                                                : name === '와이드포스' ? conditions.terrain === 'psychic' && sourceGrounded
                                                  : name === '미스트버스트' ? conditions.terrain === 'misty' && sourceGrounded
                                                    : name === 'G의힘' ? conditions.gravity
                                                      : name === '변덕레이저' ? source.battle.randomDoublePower
                                                        : undefined
    const conditionalValue = automaticConditionalValue ?? configuredConditionalValue ?? rule?.defaultValue
    const supportedBase = rule ? { ...base, power: rule.basePower ?? base.power ?? 1, variablePower: false } : base
    if (!quickMoveSupported(name, supportedBase)) return null
    const choices = multiHitOptions(name)
    const conditionalBase = rule ? applyConditionalMovePower(name, base, conditionalValue) : base
    const requestedHits = choices?.includes(hitCount ?? conditions.hits) ? (hitCount ?? conditions.hits) : choices?.[0] ?? null
    const abilityMeta = resolveAbilityAdjustedMoveMeta(name, resolveMultiHitMeta(name, conditionalBase, requestedHits, sourceAbility), sourceAbility, conditions.weather)
    const meta = applyTargetWeightMovePower(name, applyTerrainPulseType(name, abilityMeta, conditions.terrain, sourceGrounded), targetWeight || null)
    if (!meta) return null
    const type = meta.type, mode = meta.category === 'physical' || meta.category === 'special' ? meta.category : null
    if (!type || !mode || !meta.power) return null
    const sourceTypes = resolveAbilityAdjustedTypes(sourceRow.types, sourceAbility, conditions.weather, conditions.terrain)
    const targetTypes = resolveAbilityAdjustedTypes(targetRow.types, targetAbility, conditions.weather, conditions.terrain)
    const foulPlay = name === '속임수'
    const [attackStage, defenseStage] = quickStagePair(source.battle, target.battle, { ...meta, usesTargetAttack: foulPlay })
    const modifiers = resolveDamageModifiers({ attackerAbility: sourceAbility, attackerTypes: sourceTypes, attackerItem: source.item, defenderAbility: targetAbility, defenderKey: target.key, defenderItem: target.item, moveName: name, moveMeta: meta, baseMoveType: base.type ?? type, moveType: type, movePower: meta.power, mode, effectiveness: abilityAdjustedTypeEffectiveness(type, targetTypes, targetAbility, sourceAbility), attackStage, defenseStage, defenderTypes: targetTypes, burned: source.battle.burned || (sourceAbility === 'guts' && quickStatused(source)), attackerLowHp: source.battle.lowHp, targetPoisoned: target.battle.poisoned, defenderFullHp: target.battle.fullHp, movedAfterTarget: source.battle.movedAfterTarget || source.battle.damagedByTarget, faintedAllies: source.battle.faintedAllies, rivalryMode: 'neutral', parentalBond: false, defenderStatused: quickStatused(target), electromorphosisCharged: false, weather: conditions.weather, terrain: conditions.terrain, gravity: conditions.gravity, reflect: target.battle.reflect, lightScreen: target.battle.lightScreen, auroraVeil: target.battle.auroraVeil, friendGuard: false, critical: conditions.critical })
    const damage = calcDamage(foulPlay ? { ...sourceStats, attack: targetStats.attack } : sourceStats, targetStats, meta.power, mode, resolveStabMultiplier(sourceTypes, type, sourceAbility, conditions.typeChangeStab), modifiers.effectiveness, meta, modifiers)
    return damage ? { damage, targetHp: targetStats.hp, hits: meta.hits ?? 1, effectiveness: modifiers.effectiveness, sourceForm: sourceRow.key === 'aegislash' && sourceAbility === 'stance-change' ? sourceForm : null, targetForm: targetRow.key === 'aegislash' && targetAbility === 'stance-change' ? targetForm : null } : null
}
