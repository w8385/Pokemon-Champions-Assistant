import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
const ts = createRequire(import.meta.url)('typescript')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const types = readFileSync(new URL('../src/app/types.ts', import.meta.url), 'utf8')

test('legacy forward move remains separate from opponent registered moves on restore and backup', () => {
  assert.match(types, /opponentMoves: string\[\]/)
  assert.match(types, /opponentMoveName: string/)
  const sanitizer = app.slice(app.indexOf('function sanitizeSampleDamageTargets'), app.indexOf('function sanitizeSavedSamples'))
  assert.match(sanitizer, /moveName: typeof raw\.moveName === 'string' \? raw\.moveName : ''/)
  assert.match(sanitizer, /opponentMoves: fixedSampleOpponentMoves/)
  assert.match(sanitizer, /opponentMoveName: typeof raw\.opponentMoveName === 'string' \? raw\.opponentMoveName : ''/)
  assert.match(app, /sampleDamageTargets,/) // whole workspace export/persistence retains targets
})

test('opponent uses exact-form confirmed pool and shared registered slots without selecting an attack', () => {
  assert.match(app, /movePoolByKey\[member\.key\]/)
  assert.match(app, /resolveEligibleMoveInput\(move, movePoolByKey\[member\.key\]\)/)
  assert.match(app, /<RegisteredMoveSlot number=\{slot \+ 1\} name=\{input\}/)
  assert.match(app, /selectSampleOpponentMove\(entry\.idx, slot, option\.key\)/)
  const opponentEditor = app.slice(app.indexOf("<strong>{lt('상대 → 내 포켓몬')}</strong>"), app.indexOf("{lt('타수')}", app.indexOf("<strong>{lt('상대 → 내 포켓몬')}</strong>")))
  assert.ok(opponentEditor.length > 0)
  assert.doesNotMatch(opponentEditor, /sampleDamageMoveChoices\.map/)
  assert.doesNotMatch(opponentEditor, /공격 선택|opponentMoveName: move/)
  assert.match(app, /sampleRegisteredMoves\.slice\(0, 4\)\.filter\(Boolean\)\.map\(\(moveName\)/)
  assert.match(app, /member\.opponentMoves\.filter\(Boolean\)\.map\(\(opponentMoveName\)/)
})

test('reverse damage owns opponent attack and own HP and reports a separate verdict', () => {
  assert.match(app, /buildOpponentBattleStats\(attackingFormRow\(row, reverseAbility\), [\s\S]*?attackEv: member\.attackEv/)
  assert.match(app, /buildPartyBattleStats\(sampleRow, sampleCalcMember\)/)
  assert.match(app, /sampleMoveStats\(opponentMoveName, reverseMeta, reverseAttackerStats, reverseDefenderStats, opponentBattle, ownBattle\)/)
  assert.match(app, /calcDamage\(reverseProjection\.attacker, reverseProjection\.defender/)
  assert.match(app, /resolveDamageVerdict\(reverseDamage, reverseDefenderStats\.hp, siteLanguage,/)
  assert.match(app, /lt\('상대 → 내 포켓몬'\)/)
  assert.match(app, /lt\('내 포켓몬 → 상대'\)/)
})

test('reverse conditions have independent owners and editable controls', () => {
  assert.match(types, /reverseAttackStage: number/)
  assert.match(types, /reverseDefenseStage: number/)
  assert.match(app, /attackStage: reverseProjection\.attackStage, defenseStage: reverseProjection\.defenseStage/)
  assert.match(app, /burned: opponentBattle\.burned/)
  assert.match(app, /reflect: ownBattle\.reflect, lightScreen: ownBattle\.lightScreen/)
  assert.match(app, /reverseAttackStage: clampSpeedStage\(raw\.reverseAttackStage\)/)
  assert.match(app, /reverseBurned: typeof raw\.reverseBurned === 'boolean'/)
  assert.match(app, /updateSampleBattle\(entry\.idx, side, \{\[key\]: clampBattleStage\(e\.target\.value\)\}\)/)
})

test('four forward and reverse damage previews use distinct numerical outputs from the existing engine', () => {
  const tree = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const names = ['pokeRound', 'chainMods', 'fixedMod', 'applyFixedMod', 'engineMovePower', 'getBaseDamage', 'getFinalDamageRoll', 'calcDamage']
  const functions = names.map(name => {
    const node = tree.statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === name)
    assert.ok(node, name)
    return node.getText(tree)
  }).join('\n')
  const code = ts.transpileModule(`const DAMAGE_MOD_SCALE = 4096;\n${functions}\nglobalThis.damage = calcDamage`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const context = {}
  vm.runInNewContext(code, context)
  const own = { hp: 150, attack: 150, defense: 110, spAttack: 80, spDefense: 90 }
  const foe = { hp: 160, attack: 100, defense: 120, spAttack: 90, spDefense: 110 }
  const preview = (attacker, defender, power) => context.damage(attacker, defender, power, 'physical', 1, 1, { power, category: 'physical' }, {})
  const forward = [40, 65, 80, 120].map(power => preview(own, foe, power))
  const reverse = [40, 65, 80, 120].map(power => preview(foe, own, power))
  for (const attacks of [forward, reverse]) {
    assert.equal(attacks.length, 4)
    assert.ok(attacks.every(d => d && Number.isFinite(Number(d.minPct)) && Number.isFinite(Number(d.maxPct))))
    assert.ok(attacks.every((d, i) => i === 0 || d.min > attacks[i - 1].min))
  }
  assert.ok(forward[1].min > reverse[1].min)
  assert.match(app, /calcDamage\(forwardProjection\.attacker, forwardProjection\.defender, movePower/)
  assert.match(app, /reverseDamage = calcDamage\(reverseProjection\.attacker/)
})
