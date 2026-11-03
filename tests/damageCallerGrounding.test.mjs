import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { loadAppDamageEngine } from '../scripts/check-damage-parity.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8')
const ts = createRequire(import.meta.url)(path.join(root, 'node_modules/typescript'))
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const calls = []
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(ast) === 'resolveDamageModifiers') calls.push(node)
  ts.forEachChild(node, visit)
}
visit(ast)

test('each of seven real resolver callers passes attacker identity; only Double passes Doubles format', () => {
  assert.equal(calls.length, 7)
  let doubleCalls = 0
  for (const call of calls) {
    const arg = call.arguments[0]
    assert.ok(ts.isObjectLiteralExpression(arg))
    const keys = arg.properties.map(p => p.name?.getText(ast))
    assert.ok(keys.includes('attackerTypes'), `missing actual attacker types at ${ast.getLineAndCharacterOfPosition(call.pos).line + 1}`)
    if (arg.getText(ast).includes("format: 'Doubles'")) doubleCalls += 1
  }
  assert.equal(doubleCalls, 1, 'one actual Double caller and six Singles/Quick/sample callers')
})

test('airborne, Levitate and Air Balloon do not receive attacker terrain power', () => {
  const { resolveDamageModifiers: resolve } = loadAppDamageEngine()
  const baseline = {
    attackerAbility: '', attackerItem: '', defenderAbility: '', defenderKey: 'target', defenderItem: '',
    moveName: '검증용', moveMeta: { power: 80, category: 'physical' }, baseMoveType: 'grass',
    moveType: 'grass', movePower: 80, mode: 'physical', effectiveness: 1, attackStage: 0,
    defenseStage: 0, defenderTypes: ['normal'], burned: false, attackerLowHp: false,
    targetPoisoned: false, defenderFullHp: true, movedAfterTarget: false, faintedAllies: 0,
    rivalryMode: 'neutral', parentalBond: false, defenderStatused: false,
    electromorphosisCharged: false, weather: 'none', terrain: 'grassy', reflect: false,
    lightScreen: false, auroraVeil: false, friendGuard: false,
  }
  assert.deepEqual(Array.from(resolve({ ...baseline, attackerTypes: ['normal'] }).fixedBpMods), [5325])
  for (const patch of [
    { attackerTypes: ['flying'] }, { attackerTypes: ['normal'], attackerAbility: 'levitate' },
    { attackerTypes: ['normal'], attackerItem: 'ふうせん' }, { attackerTypes: undefined },
  ]) assert.deepEqual(Array.from(resolve({ ...baseline, ...patch }).fixedBpMods), [])
})
