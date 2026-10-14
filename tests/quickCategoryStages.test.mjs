import test from 'node:test'
import assert from 'node:assert/strict'
import { quickStagePair, quickBattleStages } from '../src/quickDamageState.ts'

test('physical attack rank never modifies special attack', () => {
  const source = { attackStage: 2, spAttackStage: 0, defenseStage: 0, spDefenseStage: 0 }
  assert.deepEqual(quickStagePair(source, {}, { category: 'physical' }), [2, 0])
  assert.deepEqual(quickStagePair(source, {}, { category: 'special' }), [0, 0])
})
test('physical defense rank never modifies special bulk', () => {
  const target = { attackStage: 0, spAttackStage: 0, defenseStage: 2, spDefenseStage: 0 }
  assert.deepEqual(quickStagePair({}, target, { category: 'physical' }), [0, 2])
  assert.deepEqual(quickStagePair({}, target, { category: 'special' }), [0, 0])
})
test('Body Press takes own defense rank and Foul Play takes target attack rank', () => {
  assert.deepEqual(quickStagePair({ defenseStage: 2 }, { defenseStage: 4 }, { category: 'physical', usesDefenseAsAttack: true }), [2, 4])
  assert.deepEqual(quickStagePair({}, { attackStage: 3, defenseStage: 4 }, { category: 'physical', usesTargetAttack: true }), [3, 4])
})
test('old attackStage migrates physical only and special stays independent', () => {
  assert.deepEqual(quickBattleStages({}, { attackStage: 2, defenseStage: 3 }, true), { attackStage: 2, spAttackStage: 0, defenseStage: 0, spDefenseStage: 0 })
  assert.deepEqual(quickBattleStages({}, { attackStage: 2, defenseStage: 3 }, false), { attackStage: 0, spAttackStage: 0, defenseStage: 3, spDefenseStage: 0 })
})
