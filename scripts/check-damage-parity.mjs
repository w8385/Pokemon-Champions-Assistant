// Frozen outputs of the pinned full calculateChampions engine versus live App declarations.
// Synthetic species/type overrides and neutral tagged-move mocks: not a mounted caller
// and not evidence of complete in-game mechanics parity.
import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const ts = require(path.join(root, 'node_modules/typescript'))
const fixtureDir = path.join(root, 'tests/fixtures/damage-reference')
const fixture = JSON.parse(fs.readFileSync(path.join(fixtureDir, 'cases.json'), 'utf8'))
const digest = (s) => crypto.createHash('sha256').update(s).digest('hex')
if (fixture.cases.length !== 18 || fixture.source.commit !== 'bacbbfc86f333cb0878cafba7b495a59a69111f0') throw Error('Unexpected frozen reference identity/count')
if (digest(fs.readFileSync(path.join(fixtureDir, 'LICENSE'))) !== fixture.source.licenseSHA256) throw Error('Pinned MIT license changed')

export function loadAppDamageEngine() {
  const text = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8')
  const names = ['pokeRound', 'chainMods', 'fixedMod', 'applyFixedMod', 'engineMovePower', 'getBaseDamage', 'getFinalDamageRoll', 'calcDamage', 'battleStageMultiplier', 'resolveDamageModifiers', 'knockOffPowerMultiplier', 'isDamageGrounded', 'typeEffectiveness', 'abilityAdjustedTypeEffectiveness', 'effectiveDefenderAbility']
  const ast = ts.createSourceFile('App.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const found = new Map()
  function visit(n) {
    if (ts.isFunctionDeclaration(n) && names.includes(n.name?.text)) found.set(n.name.text, n.getText(ast))
    ts.forEachChild(n, visit)
  }
  visit(ast)
  // The resolver, type projection and Mold Breaker authority all come from the
  // same live App AST; no second parity-only implementation is compiled here.
  for (const n of names) if (!found.has(n)) throw Error(`Missing actual App declaration: ${n}`)
  const context = {
    console, Math, DAMAGE_MOD_SCALE: Number(text.match(/const DAMAGE_MOD_SCALE = (\d+)/)?.[1]),
    canonicalChampionsItemName: (s) => s === 'たつじんのおび' ? 'たつじんのおび' : s,
    classifyHeldItem: () => ({ status: 'allowed' }), abilityNoteLabel: s => s,
    moveMatchesTaggedSet: () => false,
  }
  for (const name of ['CONTACT_MOVE_NAMES', 'SOUND_MOVE_NAMES', 'PUNCH_MOVE_NAMES', 'RECKLESS_MOVE_NAMES', 'SHEER_FORCE_MOVE_NAMES', 'BITE_MOVE_NAMES', 'PULSE_MOVE_NAMES', 'SLICING_MOVE_NAMES']) context[name] = new Set()
  vm.createContext(context)
  const declarations = [...ast.statements.filter(n => ts.isVariableStatement(n) && n.declarationList.declarations.some(d => ['typeChart', 'normalizedTypeChart'].includes(d.name.getText(ast)))).map(n => n.getText(ast)), ...names.filter(n => found.has(n)).map(n => found.get(n))].join('\n').replace(/\bexport /g, '')
  vm.runInContext(ts.transpileModule(declarations, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText, context)
  return context
}

export function compareFrozenReference() {
  const engine = loadAppDamageEngine()
  const { hp, atk, def, spa, spd, spe } = fixture.fixtureStats
  const stats = { hp, attack: atk, defense: def, spAttack: spa, spDefense: spd, speed: spe }
  const outcomes = fixture.cases.map(({ id, input, attacker, defender, field, expectedDamage }) => {
    const moveType = input.moveType.toLowerCase()
    const attackerTypes = attacker.types.map(t => t.toLowerCase())
    const defenderTypes = defender.types.map(t => t.toLowerCase())
    const attackerAbility = input.attackerAbility?.toLowerCase().replaceAll(' ', '-') ?? ''
    const defenderAbility = input.defenderAbility?.toLowerCase().replaceAll(' ', '-') ?? ''
    const terrain = (field.terrain ?? 'none').toLowerCase()
    const params = {
      attackerAbility, attackerAllyAbility: '', attackerItem: input.attackerItem ? 'たつじんのおび' : '',
      defenderAbility, defenderItem: '', defenderKey: 'target', moveName: '검증용',
      moveMeta: { power: fixture.movePower, category: 'physical' }, baseMoveType: moveType,
      moveType, movePower: fixture.movePower, mode: 'physical',
      effectiveness: engine.abilityAdjustedTypeEffectiveness(moveType, defenderTypes, defenderAbility, attackerAbility),
      attackStage: 0, defenseStage: 0, attackerTypes, defenderTypes, burned: !!input.burn,
      attackerLowHp: false, targetPoisoned: false, defenderFullHp: true, movedAfterTarget: false,
      faintedAllies: 0, rivalryMode: 'neutral', parentalBond: false, defenderStatused: false,
      electromorphosisCharged: false, weather: (field.weather ?? 'none').toLowerCase(), terrain,
      reflect: !!field.defenderSide.isReflect, lightScreen: false, auroraVeil: false,
      friendGuard: false, critical: !!input.critical, format: field.gameType,
    }
    const modifiers = engine.resolveDamageModifiers(params)
    const stab = attackerTypes.includes(moveType) ? 1.5 : 1
    const result = engine.calcDamage(stats, stats, fixture.movePower, 'physical', stab, modifiers.effectiveness, params.moveMeta, modifiers)
    const expected = expectedDamage === 0 ? Array(16).fill(0) : expectedDamage
    const actual = Array.from(result?.rolls ?? [])
    return { id, match: JSON.stringify(actual) === JSON.stringify(expected), actual, expected, scalarZeroImmunity: expectedDamage === 0 }
  })
  return outcomes
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outcomes = compareFrozenReference()
  for (const { id, match, actual, expected } of outcomes) console.log(`${match ? 'PASS' : 'FAIL'} ${id}: ${actual.join(',')} / ${expected.join(',')}`)
  const failed = outcomes.filter(x => !x.match)
  console.log(`${outcomes.length - failed.length}/${outcomes.length} pinned full-engine fixtures matched (three scalar-zero immunities normalized to zero-16)`)
  if (failed.length) process.exitCode = 1
}
