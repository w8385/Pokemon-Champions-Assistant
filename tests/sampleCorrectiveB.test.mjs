import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
const ts = createRequire(import.meta.url)('typescript')
const source = readFileSync(new URL('../src/sampleDamageProjection.ts', import.meta.url), 'utf8')
const quick = readFileSync(new URL('../src/quickDamageState.ts', import.meta.url), 'utf8')
const context = {}
vm.runInNewContext(ts.transpileModule(`${quick.replace(/^import .*$/gm, '')}\n${source.replace(/^import .*$/gm, '')}\nglobalThis.api = { sampleBattle, sampleMoveKey, sampleMoveStats }`, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace(/^export /gm, ''), context)
const { sampleBattle, sampleMoveKey, sampleMoveStats } = context.api

test('Body Press and Foul Play stat and stage owners are direction independent', () => {
  const own = { hp: 170, attack: 70, defense: 120, spAttack: 80, spDefense: 90 }
  const foe = { hp: 180, attack: 160, defense: 100, spAttack: 130, spDefense: 110 }
  const ownState = sampleBattle({ defenseStage: 2, attackStage: -2 })
  const foeState = sampleBattle({ attackStage: 3, defenseStage: -1 })
  const press = { category: 'physical', usesDefenseAsAttack: true }
  const foul = { category: 'physical' }
  const forwardPress = sampleMoveStats('바디프레스', press, own, foe, ownState, foeState)
  const reversePress = sampleMoveStats('바디프레스', press, foe, own, foeState, ownState)
  assert.equal(forwardPress.attacker.defense, 120)
  assert.equal(forwardPress.attackStage, 2)
  assert.equal(reversePress.attacker.defense, 100)
  assert.equal(reversePress.attackStage, -1)
  const forwardFoul = sampleMoveStats('속임수', foul, own, foe, ownState, foeState)
  const reverseFoul = sampleMoveStats('속임수', foul, foe, own, foeState, ownState)
  assert.equal(forwardFoul.attacker.attack, 160)
  assert.equal(forwardFoul.attackStage, 3)
  assert.equal(reverseFoul.attacker.attack, 70)
  assert.equal(reverseFoul.attackStage, -2)
  assert.equal(sampleMoveStats('테스트', { category: 'special' }, own, foe, sampleBattle({ spAttackStage: 4 }), sampleBattle({ spDefenseStage: -2 })).attackStage, 4)
})

test('App projects both directions through owner-aware stats and local move conditions', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const block = app.slice(app.indexOf('const sampleDamageCalcs ='), app.indexOf('const addSampleSpeedTarget ='))
  assert.match(block, /sampleMoveStats\(opponentMoveName/)
  assert.match(block, /sampleMoveStats\(moveName/)
  assert.match(block, /sampleMoveKey\(sampleForge\.key, member\.key, 'reverse'/)
  assert.match(block, /sampleMoveKey\(sampleForge\.key, member\.key, 'forward'/)
  assert.doesNotMatch(block, /attackerLowHp: false|targetPoisoned: false|electromorphosisCharged: false/)
  assert.doesNotMatch(block, /attackStage: calcAttackStage|attackStage: member\.reverseAttackStage/)
})

test('move conditional keys encode source, target, direction and move without collision', () => {
  assert.notEqual(sampleMoveKey('own','a','forward','연속기'), sampleMoveKey('own','b','forward','연속기'))
  assert.notEqual(sampleMoveKey('own','a','forward','연속기'), sampleMoveKey('own','a','reverse','연속기'))
  assert.notEqual(sampleMoveKey('own','a','forward','연속기'), sampleMoveKey('other','a','forward','연속기'))
})

test('canonical App engine changes independently with Body Press and Foul Play actual stats and ranks in both directions', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const tree = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const names = ['battleStageMultiplier', 'pokeRound', 'chainMods', 'fixedMod', 'applyFixedMod', 'engineMovePower', 'getBaseDamage', 'getFinalDamageRoll', 'calcDamage']
  const functions = names.map(name => {
    const node = tree.statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === name)
    assert.ok(node, name)
    return node.getText(tree)
  }).join('\n')
  const engine = {}
  vm.runInNewContext(ts.transpileModule(`const DAMAGE_MOD_SCALE = 4096;\n${functions}\nglobalThis.engine = { calcDamage, battleStageMultiplier }`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText, engine)
  const { calcDamage, battleStageMultiplier } = engine.engine
  const own = { hp: 150, attack: 85, defense: 130, spAttack: 100, spDefense: 95 }
  const foe = { hp: 160, attack: 125, defense: 105, spAttack: 110, spDefense: 100 }
  const preview = (name, meta, source, target, s, t) => {
    const projected = sampleMoveStats(name, meta, source, target, sampleBattle(s), sampleBattle(t))
    return calcDamage(projected.attacker, projected.defender, 80, 'physical', 1, 1, { power: 80, ...meta }, {
      attackMultiplier: battleStageMultiplier(projected.attackStage), defenseMultiplier: battleStageMultiplier(projected.defenseStage),
    }).min
  }
  for (const [source, target] of [[own, foe], [foe, own]]) {
    const press = { category: 'physical', usesDefenseAsAttack: true }
    const baselinePress = preview('바디프레스', press, source, target, {}, {})
    assert.notEqual(preview('바디프레스', press, source, target, { actual: { defense: source.defense + 50 } }, {}), baselinePress)
    assert.notEqual(preview('바디프레스', press, source, target, { defenseStage: 2 }, {}), baselinePress)
    assert.equal(preview('바디프레스', press, source, target, { attackStage: 2 }, {}), baselinePress)
    const foul = { category: 'physical' }
    const baselineFoul = preview('속임수', foul, source, target, {}, {})
    assert.notEqual(preview('속임수', foul, source, target, {}, { actual: { attack: target.attack + 60 } }), baselineFoul)
    assert.notEqual(preview('속임수', foul, source, target, {}, { attackStage: 2 }), baselineFoul)
    assert.equal(preview('속임수', foul, source, target, { attackStage: 2 }, {}), baselineFoul)
  }
})
