import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { loadAppDamageEngine } from '../scripts/check-damage-parity.mjs'

const source=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
const ast=ts.createSourceFile('App.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
let callback
function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='buildDoubleDamageContext')callback=n.initializer;ts.forEachChild(n,visit)}visit(ast)
assert.ok(callback,'real Double callback AST')
const roster=JSON.parse(fs.readFileSync(new URL('../src/canonical-data/champions/pokemon_champions_verified_data.json',import.meta.url))).rows
const learned=JSON.parse(fs.readFileSync(new URL('../src/canonical-data/champions/dexGameLearnsets.json',import.meta.url))).forms
const moves=JSON.parse(fs.readFileSync(new URL('../src/canonical-data/champions/championsLearnedMoveMeta.json',import.meta.url)))
const index=JSON.parse(fs.readFileSync(new URL('../src/canonical-data/champions/dexGameMoveIndex.json',import.meta.url)))
const row=k=>roster.find(r=>r.key===k)
const engine=loadAppDamageEngine()
const stats={hp:160,attack:150,defense:120,spAttack:150,spDefense:120,speed:100} // Isolated numerical harness, not actual in-game build stats.
const side=(key,ability,item='')=>({key,ability,item,hpEv:0,defenseEv:0,spDefenseEv:0,defenseNature:1,spDefenseNature:1})
const slots={myLeft:{side:'my',option:null},myRight:{side:'my',option:null},oppLeft:{side:'opp',option:null},oppRight:{side:'opp',option:null}}
const env={...engine,React:{useCallback:fn=>fn},doubleSlotMeta:slots,doubleFriendGuardMy:false,doubleFriendGuardOpp:false,doubleProtectBySlot:{myLeft:false,myRight:false,oppLeft:false,oppRight:false},doubleWideGuardMy:false,doubleWideGuardOpp:false,lt:x=>x,movePoolByKey:{},asyncDataVersion:0,siteLanguage:'ko',isCalculableHeldItem:(key,item)=>key!=='mega-gyarados'||item==='gyaradosite',heldAbilityError:(key,raw)=>raw===''||row(key)?.abilities.includes(raw)||row(key)?.abilities_ko.includes(raw)?null:'invalid ability',classifyAbilityForKey:(key,raw)=>({slug:row(key)?.abilities.includes(raw)?raw:row(key)?.abilities[row(key).abilities_ko.indexOf(raw)]??null}),attackingFormRow:r=>r,buildPartyBattleStats:()=>stats,buildOpponentBattleStats:()=>stats,choicesForPool:x=>x??[],resolveMoveMeta:(name)=>moves[name]??null,resolveAbilityAdjustedMoveMeta:(_name,meta)=>meta,resolveMoveType:name=>moves[name]?.type??null,resolveAbilityAdjustedTypes:r=>r,abilityAdjustedTypeEffectiveness:engine.abilityAdjustedTypeEffectiveness,protectionDamageMultiplier:()=>1,resolveDamageModifiers:engine.resolveDamageModifiers,calcDamage:engine.calcDamage,abilityNoteLabel:x=>x}
vm.runInNewContext(ts.transpileModule(`globalThis.actualCallback=${callback.getText(ast)}`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,env)
function setup(attackerKey,attackerAbility,targetKey,targetAbility,item=''){
  slots.myLeft.option={row:row(attackerKey),member:side(attackerKey,attackerAbility,item)}
  slots.oppLeft.option={row:row(targetKey),entry:side(targetKey,targetAbility)}
}
test('real Double callback, actual type projection: legal Excadrill Earthquake hits Rotom only with Mold Breaker; raw record retained',()=>{
  assert.ok(row('excadrill').abilities.includes('mold-breaker'))
  assert.ok(row('rotom').abilities.includes('levitate'))
  assert.ok(learned.excadrill.moves.includes(index['지진'].id));assert.equal(moves['지진'].type,'ground')
  setup('excadrill','틀깨기','rotom','부유')
  const hit=env.actualCallback('myLeft','oppLeft','지진',false)
  assert.deepEqual(Array.from(hit.damage.rolls),[144,146,146,150,150,152,152,156,158,158,162,162,164,164,168,170]) // Callback regression only; not a reference-engine fixture.
  assert.equal(hit.effectiveness,2);assert.ok(hit.damage.min>0)
  assert.equal(slots.myLeft.option.member.ability,'틀깨기');assert.equal(slots.oppLeft.option.entry.ability,'부유')
  slots.myLeft.option.member.ability='모래헤치기'
  const blocked=env.actualCallback('myLeft','oppLeft','지진',false)
  assert.equal(blocked.effectiveness,0);assert.deepEqual(Array.from(blocked.damage.rolls),Array(16).fill(0))
  slots.myLeft.option.member.ability='틀깨기';slots.oppLeft.option.entry.ability='알수없는능력'
  assert.equal(env.actualCallback('myLeft','oppLeft','지진',false),null)
})
test('real Double callback: legal Mega Gyarados + Waterfall ignores Vaporeon Water Absorb only with required stone',()=>{
  assert.ok(row('mega-gyarados').abilities.includes('mold-breaker'))
  assert.ok(row('vaporeon').abilities.includes('water-absorb'))
  assert.ok(learned['mega-gyarados'].moves.includes(index['폭포오르기'].id))
  setup('mega-gyarados','mold-breaker','vaporeon','water-absorb','gyaradosite')
  const hit=env.actualCallback('myLeft','oppLeft','폭포오르기',false)
  assert.equal(hit.effectiveness,0.5);assert.ok(hit.damage.min>0)
  assert.equal(slots.oppLeft.option.entry.ability,'water-absorb')
  slots.myLeft.option.member.item=''
  assert.equal(env.actualCallback('myLeft','oppLeft','폭포오르기',false),null)
})
