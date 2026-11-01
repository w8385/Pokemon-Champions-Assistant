import test from 'node:test'
import assert from 'node:assert/strict'
import { loadAppDamageEngine } from '../scripts/check-damage-parity.mjs'

const engine = loadAppDamageEngine()
const stats = { hp:160, attack:150, defense:120, spAttack:150, spDefense:120, speed:100 }
const meta = { power:80, category:'physical' }
function hit(attackerAbility, defenderAbility, moveType='ground', patch={}) {
  const raw = { attackerAbility, attackerAllyAbility:'', attackerItem:'', defenderAbility, defenderKey:'target', defenderItem:'', moveName:'검증용', moveMeta:meta, baseMoveType:moveType, moveType, movePower:80, mode:'physical', effectiveness:engine.abilityAdjustedTypeEffectiveness(moveType,['normal'],defenderAbility,attackerAbility), attackStage:0, defenseStage:0, attackerTypes:[moveType], defenderTypes:['normal'], burned:false, attackerLowHp:false, targetPoisoned:false, defenderFullHp:true, movedAfterTarget:false, faintedAllies:0, rivalryMode:'neutral', parentalBond:false, defenderStatused:false, electromorphosisCharged:false, weather:'none', terrain:'none', reflect:false, lightScreen:false, auroraVeil:false, friendGuard:false, critical:false, ...patch }
  const mod = engine.resolveDamageModifiers(raw)
  return {raw, mod, rolls:Array.from(engine.calcDamage(stats,stats,80,'physical',1.5,mod.effectiveness,meta,mod).rolls)}
}
test('actual type helper precedes resolver: Mold Breaker bypasses Levitate, not natural Flying/Air Balloon', () => {
  const ignored=hit('mold-breaker','levitate'), plain=hit('','levitate')
  assert.equal(ignored.raw.effectiveness,1)
  assert.deepEqual(ignored.rolls,Array.from(hit('','','ground').rolls))
  assert.deepEqual(plain.rolls,Array(16).fill(0))
  assert.deepEqual(hit('mold-breaker','levitate','ground',{ defenderTypes:['flying'], effectiveness:engine.abilityAdjustedTypeEffectiveness('ground',['flying'],'levitate','mold-breaker') }).rolls,Array(16).fill(0))
  assert.deepEqual(hit('mold-breaker','levitate','ground',{ defenderItem:'ふうせん' }).rolls,Array(16).fill(0))
})
test('ignored armor and defensive power effects differ from a nonignored supported ability', () => {
  const crit={critical:true,reflect:true}
  assert.equal(hit('mold-breaker','shell-armor','fire',crit).mod.critical,true)
  assert.equal(hit('','shell-armor','fire',crit).mod.critical,false)
  const neutral=hit('mold-breaker','','fire',{effectiveness:2})
  const ignored=hit('mold-breaker','thick-fat','fire',{effectiveness:2})
  assert.deepEqual(ignored.rolls,neutral.rolls)
  const retained=hit('mold-breaker','prism-armor','fire',{effectiveness:2})
  assert.ok(retained.rolls[0]<neutral.rolls[0])
  assert.ok(hit('mold-breaker','ice-scales','fire',{mode:'special',moveMeta:{power:80,category:'special'},effectiveness:2}).mod.finalMultiplier<1)
})
test('Mold Breaker does not erase ally Friend Guard or nonignored defender effects; Unaware stage reader uses projection', () => {
  const stage={attackStage:2}
  assert.ok(hit('','unaware','ground',stage).rolls[0]<hit('mold-breaker','unaware','ground',stage).rolls[0])
  const guarded=hit('mold-breaker','water-absorb','water',{friendGuard:true})
  const unguarded=hit('mold-breaker','water-absorb','water')
  assert.ok(guarded.rolls[0]<unguarded.rolls[0])
  assert.ok(guarded.mod.notes.includes('프렌드가드'))
  assert.ok(hit('mold-breaker','shadow-shield','ground').rolls[0]<hit('mold-breaker','','ground').rolls[0])
})

test('pinned grounding order: Levitate removed before defender terrain check, but Flying remains airborne', () => {
  const patch={terrain:'misty',moveType:'dragon',baseMoveType:'dragon',attackerTypes:['dragon'],effectiveness:1}
  assert.deepEqual(Array.from(hit('mold-breaker','levitate','dragon',patch).mod.fixedBpMods),[2048])
  assert.deepEqual(Array.from(hit('','levitate','dragon',patch).mod.fixedBpMods),[])
  assert.deepEqual(Array.from(hit('mold-breaker','levitate','dragon',{...patch,defenderTypes:['flying']}).mod.fixedBpMods),[])
})
