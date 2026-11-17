import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { quickSpeedState, quickStatNature } from '../src/domain/battle/quickDamageState.ts'

test('stat tiles and modal checkpoints use the same Speed nature as comparison', () => {
 const side=quickSpeedState({speedNatureKnown:false,speedNatureMultiplier:.9,statNatureMultipliers:{defense:1.1}})
 assert.equal(quickStatNature(side,'speed',1),.9)
 assert.equal(quickStatNature(side,'defense',1),1.1)
 assert.equal(quickStatNature(side,'hp',.9),1)
 assert.equal(quickStatNature({...side,speedNatureKnown:true},'speed',.9),.9)
 assert.match(readFileSync(new URL('../src/features/damage/quickModel.ts',import.meta.url),'utf8'), /quickStatNature\(side, key,/)
 assert.match(readFileSync(new URL('../src/features/damage/QuickEffortModal.tsx',import.meta.url),'utf8'), /quickStatNature\(entry, key,/)
 assert.match(readFileSync(new URL('../src/features/damage/QuickStatEditor.tsx',import.meta.url),'utf8'), /effectiveNatureMultiplier=\{key => quickStatNature\(entry, key,/)
})

test('speed assumptions and stages survive a quick reload', () => {
 const restored = quickSpeedState({ speedStage: -2, speedNatureKnown: false, speedNatureMultiplier: .9, statNatureMultipliers:{ defense:1.1, spDefense:.9 } })
 assert.equal(restored.speedStage,-2)
 assert.equal(restored.speedNatureKnown,false)
 assert.equal(restored.speedNatureMultiplier,.9)
 assert.deepEqual(restored.statNatureMultipliers,{defense:1.1,spDefense:.9})
})
test('invalid speed restore values use safe validated defaults', () => {
 const restored=quickSpeedState({speedStage:99,speedNatureKnown:'false',speedNatureMultiplier:7,statNatureMultipliers:{hp:8,defense:'1.1'}})
 assert.equal(restored.speedStage,6)
 assert.equal(restored.speedNatureKnown,true)
 assert.equal(restored.speedNatureMultiplier,1)
 assert.deepEqual(restored.statNatureMultipliers,{})
})
test('Speed comparison has no second nature state and legacy overrides are ignored', () => {
 const presentation=readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx',import.meta.url),'utf8')
 const model=readFileSync(new URL('../src/features/damage/quickModel.ts',import.meta.url),'utf8')
 assert.doesNotMatch(presentation, /speedNatureOverride|option value=\{0\.9\}/)
 assert.doesNotMatch(model, /speedNatureOverride/)
 assert.match(model, /\.\.\.quickSpeedState\(value\)/)
})
