import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { classifyHeldItem, canonicalHeldItem } from '../src/itemIdentity.ts'
import { loadAppDamageEngine } from '../scripts/check-damage-parity.mjs'
const metadata = JSON.parse(fs.readFileSync(new URL('../src/championsLearnedMoveMeta.json', import.meta.url)))
const index = JSON.parse(fs.readFileSync(new URL('../src/dexGameMoveIndex.json', import.meta.url)))
const getMoveMetadata = name => index[name] ? { id:index[name].id, meta:metadata[name] } : null
const text = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const names = ['knockOffPowerMultiplier','battleStageMultiplier','abilityNoteLabel','pokeRound','chainMods','fixedMod','applyFixedMod','engineMovePower','getBaseDamage','getFinalDamageRoll','calcDamage','effectiveDefenderAbility','resolveDamageModifiers']
const declaration = name => { const node = ast.statements.find(s => ts.isFunctionDeclaration(s) && s.name?.text === name); assert.ok(node, name); return node.getText(ast) }
const context = { classifyHeldItem, canonicalChampionsItemName: canonicalHeldItem, moveMatchesTaggedSet: () => false, SOUND_MOVE_NAMES: new Set(), PUNCH_MOVE_NAMES: new Set(), RECKLESS_MOVE_NAMES: new Set(), SHEER_FORCE_MOVE_NAMES: new Set(), BITE_MOVE_NAMES: new Set(), PULSE_MOVE_NAMES: new Set(), SLICING_MOVE_NAMES: new Set(), CONTACT_MOVE_NAMES: new Set() }
vm.runInNewContext(ts.transpileModule(`const DAMAGE_MOD_SCALE = 4096;\n${names.map(declaration).join('\n')}\nglobalThis.calculator={resolveDamageModifiers,calcDamage,engineMovePower}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
const { resolveDamageModifiers, calcDamage, engineMovePower } = context.calculator
const attacker = {hp:150,attack:150,defense:110,spAttack:150,spDefense:90}
const defender = {hp:160,attack:100,defense:120,spAttack:90,spDefense:120}
function run(name, options = {}) {
  const meta = getMoveMetadata(name)?.meta
  assert.ok(meta, name)
  const p = { attackerAbility:'',attackerItem:'',defenderAbility:'',defenderKey:'scizor',defenderItem:'',moveName:name,baseMoveType:meta.type,moveType:meta.type,movePower:meta.power,moveMeta:meta,mode:meta.category,effectiveness:1,attackStage:0,defenseStage:0,defenderTypes:[],burned:false,attackerLowHp:false,targetPoisoned:false,defenderFullHp:false,movedAfterTarget:false,faintedAllies:0,rivalryMode:'neutral',parentalBond:false,defenderStatused:false,electromorphosisCharged:false,weather:'none',terrain:'none',reflect:false,lightScreen:false,auroraVeil:false,friendGuard:false,critical:false,...options }
  const mod = resolveDamageModifiers(p)
  const damage = calcDamage(attacker,defender,meta.power,meta.category,1.5,mod.effectiveness,meta,mod)
  return { p,mod,damage,rolls: [...damage.rolls] }
}
const same = (a,b) => assert.deepEqual(a.rolls,b.rolls)
test('Knock Off ordinary item vs required stone preserves full rolls', () => {
  const none=run('탁쳐서떨구기'), stone=run('탁쳐서떨구기',{defenderKey:'mega-scizor',defenderItem:'핫삼나이트'}), ordinary=run('탁쳐서떨구기',{defenderItem:'いのちのたま'}), sticky=run('탁쳐서떨구기',{defenderItem:'いのちのたま',defenderAbility:'sticky-hold'})
  assert.equal(engineMovePower(65,none.mod.powerMultiplier),65); assert.equal(engineMovePower(65,stone.mod.powerMultiplier),65)
  assert.equal(engineMovePower(65,ordinary.mod.powerMultiplier),97)
  same(none,stone);same(ordinary,sticky)
  assert.deepEqual([none.damage.min,none.damage.max,ordinary.damage.min,ordinary.damage.max],[46,55,69,82])
})
for (const name of ['트릭플라워','얼음숨결','업어후리기']) test(`${name} guaranteed critical shares one authority through screens, stages, armor`, () => {
  assert.equal(getMoveMetadata(name)?.meta.alwaysCrit,true)
  const base=run(name), screens=run(name,{reflect:true,lightScreen:true,auroraVeil:true}), disadvantaged=run(name,{attackStage:-2,defenseStage:2,reflect:true,lightScreen:true}), advantageous=run(name,{attackStage:2,defenseStage:-2}), manual=run(name,{critical:true,reflect:true,lightScreen:true})
  for(const value of [base,screens,disadvantaged,manual]) assert.equal(value.mod.critical,true)
  for(const value of [screens,disadvantaged]) { assert.equal(value.mod.incomingScreenName,null);same(base,value) }
  assert.ok(advantageous.damage.min>base.damage.min)
  same(base,manual)
  for(const ability of ['shell-armor','battle-armor']) for(const critical of [false,true]) {
    const blocked=run(name,{defenderAbility:ability,critical,reflect:true,lightScreen:true})
    assert.equal(blocked.mod.critical,false);assert.equal(blocked.mod.incomingScreenName,name==='얼음숨결'?'빛의장막':'리플렉터')
    assert.ok(blocked.damage.max<base.damage.min)
  }
})
for(const name of ['깨트리다','사이코팽']) test(`${name} bypasses all screens this hit, retains other reductions`, () => {
  const base=run(name), screens=run(name,{reflect:true,lightScreen:true,auroraVeil:true}), guarded=run(name,{reflect:true,friendGuard:true})
  assert.equal(screens.mod.incomingScreenName,null);same(base,screens)
  assert.equal(screens.p.reflect,true);assert.equal(screens.p.lightScreen,true);assert.equal(screens.p.auroraVeil,true)
  assert.ok(guarded.damage.max<base.damage.max)
  assert.deepEqual([base.damage.min,base.damage.max],name==='깨트리다'?[54,64]:[60,72])
})
test('manual and Merciless critical obey armor; Sniper applies only to effective critical', () => {
  const plain=run('탁쳐서떨구기'), manual=run('탁쳐서떨구기',{critical:true,reflect:true}), merciless=run('탁쳐서떨구기',{attackerAbility:'merciless',targetPoisoned:true,reflect:true})
  assert.equal(manual.mod.critical,true);same(manual,merciless)
  const sniper=run('탁쳐서떨구기',{attackerAbility:'sniper',critical:true,reflect:true})
  assert.ok(sniper.damage.min>manual.damage.min)
  for(const ability of ['shell-armor','battle-armor']) {
    const blockedManual=run('탁쳐서떨구기',{critical:true,reflect:true,defenderAbility:ability})
    const blockedMerciless=run('탁쳐서떨구기',{attackerAbility:'merciless',targetPoisoned:true,reflect:true,defenderAbility:ability})
    assert.equal(blockedManual.mod.critical,false);assert.equal(blockedMerciless.mod.critical,false)
    assert.equal(blockedManual.mod.incomingScreenName,'리플렉터');same(blockedManual,blockedMerciless)
    assert.ok(blockedManual.damage.max<plain.damage.max)
  }
})
test('ordinary physical and special moves still take matching screen reduction; Infiltrator only bypasses', () => {
  const physical=run('탁쳐서떨구기'), screened=run('탁쳐서떨구기',{reflect:true}), infiltrator=run('탁쳐서떨구기',{reflect:true,attackerAbility:'infiltrator'})
  assert.deepEqual([screened.damage.min,screened.damage.max],[23,27]);same(physical,infiltrator)
  const special=run('냉동빔'), light=run('냉동빔',{lightScreen:true});assert.ok(light.damage.max<special.damage.max)
})
test('Double caller uses resolved effectiveness including defensive ability immunity', () => {
  const app=ts.createSourceFile('App.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
  const candidates=[]
  const visit=node=>{ if(ts.isCallExpression(node)&&node.expression.getText(app)==='calcDamage') candidates.push(node);ts.forEachChild(node,visit) };visit(app)
  assert.equal(candidates.length,5)
  for(const candidate of candidates) assert.match(candidate.arguments[5].getText(app),/^(?:modifiers!?|reverseModifiers|modifierPack)\.effectiveness$/)
  const double=candidates.find(node=>node.getText(app).includes('attackerStats, defenderStats'))
  assert.ok(double)
  assert.match(double.arguments[5].getText(app),/^modifiers!?\.effectiveness$/)
  const callback = text.slice(text.indexOf('const buildDoubleDamageContext ='),text.indexOf('const doubleDamageContext ='))
  assert.match(callback,/friendGuard, effectiveness: modifiers\?\.effectiveness \?\? effectiveness/)
  for(const [ability,type] of [['water-absorb','water'],['flash-fire','fire'],['earth-eater','ground']]) {
    const hit=run('탁쳐서떨구기',{defenderAbility:ability,baseMoveType:type,moveType:type})
    assert.equal(hit.mod.effectiveness,0);assert.deepEqual([hit.damage.min,hit.damage.max],[0,0])
  }
})
test('actual Double callback passes ability immunity into all sixteen rolls', () => {
  let initializer
  const visit=node=>{ if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='buildDoubleDamageContext') initializer=node.initializer;ts.forEachChild(node,visit) };visit(ast)
  assert.ok(initializer)
  const compiled=ts.transpileModule(`globalThis.doubleCallback = ${initializer.getText(ast)}`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
  const side=(key,ability) => ({ key,ability,item:'',hpEv:0,defenseEv:0,spDefenseEv:0,defenseNature:1,spDefenseNature:1 })
  const owner={ key:'source', types:['normal'] }, target={ key:'target', types:[] }
  const slots={ myLeft:{side:'my',option:{row:owner,member:side('source','')}}, myRight:{side:'my',option:null}, oppLeft:{side:'opp',option:{row:target,entry:side('target','')}}, oppRight:{side:'opp',option:null} }
  const env={...context,React:{useCallback:fn=>fn},doubleSlotMeta:slots,doubleFriendGuardMy:false,doubleFriendGuardOpp:false,doubleProtectBySlot:{myLeft:false,myRight:false,oppLeft:false,oppRight:false},doubleWideGuardMy:false,doubleWideGuardOpp:false,lt:x=>x,movePoolByKey:{},asyncDataVersion:0,siteLanguage:'ko',isCalculableHeldItem:()=>true,heldAbilityError:()=>null,classifyAbilityForKey:(_key,raw)=>({slug:raw}),attackingFormRow:row=>row,buildPartyBattleStats:()=>attacker,buildOpponentBattleStats:()=>defender,choicesForPool:()=>[],resolveMoveMeta:()=>({type:env.attackType,category:'physical',power:80}),resolveAbilityAdjustedMoveMeta:(_name,meta)=>meta,resolveMoveType:()=>env.attackType,resolveAbilityAdjustedTypes:row=>row,abilityAdjustedTypeEffectiveness:loadAppDamageEngine().abilityAdjustedTypeEffectiveness,protectionDamageMultiplier:()=>1,resolveDamageModifiers,calcDamage,abilityNoteLabel:x=>x,attackType:'water'}
  vm.runInNewContext(compiled,env)
  const baseline=env.doubleCallback('myLeft','oppLeft','test-hit',false)
  assert.deepEqual([...baseline.damage.rolls],[39,39,40,40,40,41,41,42,42,43,43,44,44,45,45,46])
  for(const [ability,type] of [['water-absorb','water'],['flash-fire','fire'],['earth-eater','ground']]) {
    env.attackType=type;slots.oppLeft.option.entry.ability=ability
    const result=env.doubleCallback('myLeft','oppLeft','test-hit',false)
    assert.equal(result.effectiveness,0,ability);assert.deepEqual([...result.damage.rolls],Array(16).fill(0),ability)
  }
})
test('all actual resolver call sites propagate post-transformation metadata', () => {
  const calls=[];const visit=node=>{if(ts.isCallExpression(node)&&node.expression.getText(ast)==='resolveDamageModifiers') calls.push(node);ts.forEachChild(node,visit)};visit(ast)
  assert.equal(calls.length,7)
  for(const call of calls) { const object=call.arguments[0];assert.ok(ts.isObjectLiteralExpression(object)); assert.ok(object.properties.some(p=>p.name?.getText(ast)==='moveMeta'),`missing moveMeta at ${ast.getLineAndCharacterOfPosition(call.pos).line+1}`) }
})
