import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import { classifyHeldItem } from '../src/itemIdentity.ts'
const require = createRequire(import.meta.url)
const ts = require('typescript')

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const section = app.split('<section id="sample-damage-section"')[1]?.split('</section>')[0]

test('sample damage shows the real condition controls without a disclosure or repeated condition summaries', () => {
  assert.ok(section)
  assert.doesNotMatch(section, /sampleDamageConditionsCollapsed|sample-damage-conditions-summary-grid|aria-expanded=/)
  assert.match(section, /className="sample-conditions-owner-grid"/)
  for (const field of ['attackStage', 'spAttackStage', 'defenseStage', 'spDefenseStage', 'critical', 'burned', 'reflect', 'lightScreen']) assert.ok(section.includes(`key:'${field}'`), field)
  assert.match(section, /updateSampleBattle\(entry.idx, side/)
  for (const control of ['calcWeather', 'calcTerrain']) assert.match(section, new RegExp(`value=\\{${control}\\}`), control)
  assert.doesNotMatch(app, /sampleDamageConditionsCollapsed/)
})

test('each target places four move results beside editable conditions and bulk', () => {
  assert.ok(section)
  assert.doesNotMatch(section, /sample-damage-target-summary-strip|sample-damage-bulk-details|sample-damage-context-row primary/)
  assert.doesNotMatch(section, /sample-damage-bulk-summary|<details/)
  const target = section.split('key={`sample-damage-target-${entry.idx}`}')[1]?.split(')}) : <div className="sample-empty-state')[0]
  assert.ok(target)
  assert.match(target, /entry\.forwardMoves\.map\(\(move, slot\)/)
  assert.match(target, /entry\.member\.opponentMoves\.map\(\(move, slot\)/)
  assert.doesNotMatch(target, /공격 선택|moveName: e\.target\.value|sample-damage-metric-grid/)
  assert.match(target, /applySampleDamageBulkPresetSelection\(entry\.idx/)
  for (const field of ['hpEv', 'defenseEv', 'spDefenseEv', 'defenseNature', 'spDefenseNature']) {
    assert.match(target, new RegExp(`updateSampleDamageTarget\\(entry.idx, \\{ ${field}:`), field)
  }
  for (const result of ['move.damage.minPct', 'result.damage.minPct', 'move.verdict', 'result.verdict']) assert.ok(target.includes(result), result)
  assert.doesNotMatch(target, /sample-damage-context-row primary|sample-damage-target-summary-strip/)
  assert.match(css, /\.sample-calculator-target \.sample-damage-card-body\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/)
})

test('sample target uses the shared item editor with the same item validation and damage inputs', () => {
  assert.match(section, /<PokemonBuildFields[^>]*itemOnly/s)
  assert.match(section, /onItem=\{item => updateSampleDamageTarget\(entry.idx, \{ item: item \? resolveItemInput\(entry.member.key, item, siteLanguage\) : '' \}\)\}/)
  assert.match(section, /itemOptions=\{query => filterItemOptions\(query, siteLanguage/)
  assert.match(section, /itemError=\{heldItemError\(entry.member.key, entry.member.item, siteLanguage\)\}/)
  assert.match(app, /defenderItem: member.item/)
})

test('Knock Off power depends on an allowed removable target item, not no item or its required Mega Stone', () => {
  const source = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const helper = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'knockOffPowerMultiplier')
  assert.ok(helper, 'missing Knock Off mechanics helper')
  const code = ts.transpileModule(`${helper.getText(source)}\nglobalThis.knockOffPowerMultiplier = knockOffPowerMultiplier`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const context = { classifyHeldItem }
  vm.runInNewContext(code, context)
  assert.equal(context.knockOffPowerMultiplier('탁쳐서떨구기', 'scizor', ''), 1)
  assert.equal(context.knockOffPowerMultiplier('탁쳐서떨구기', 'scizor', 'いのちのたま'), 1.5)
  assert.equal(context.knockOffPowerMultiplier('탁쳐서떨구기', 'mega-scizor', '핫삼나이트'), 1)
  assert.equal(context.knockOffPowerMultiplier('탁쳐서떨구기', 'scizor', 'いのちのたま', 'sticky-hold'), 1.5)
  assert.equal(context.knockOffPowerMultiplier('탁쳐서떨구기', 'mega-scizor', '핫삼나이트', 'sticky-hold'), 1)
  assert.equal(context.knockOffPowerMultiplier('탁쳐서떨구기', 'scizor', '', 'sticky-hold'), 1)
  assert.equal(context.knockOffPowerMultiplier('탁쳐서떨구기', 'scizor', '알 수 없는 도구'), 1)
  assert.equal(context.knockOffPowerMultiplier('유턴', 'scizor', 'いのちのたま'), 1)
  assert.match(app, /powerMultiplier \*= knockOffMultiplier/)
  assert.match(app, /defenderKey: member.key/)
  assert.match(section, /move\.effectivePower/)
  assert.match(section, /move\.appliedDecisionPower/)
  assert.match(app, /decisionPowerIndex\(forwardProjection\.attacker, moveMeta, resolveStabMultiplier\(effectiveAttackerTypes, moveType, sampleAttackerAbilityValue, calcTypeChangeStab\), modifierPack\)/)
})

test('Knock Off item branches feed the existing damage and decision-power engines', () => {
  const source = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const names = ['knockOffPowerMultiplier', 'pokeRound', 'chainMods', 'fixedMod', 'applyFixedMod', 'engineMovePower', 'getBaseDamage', 'getFinalDamageRoll', 'calcDamage', 'decisionPowerIndex']
  const functions = names.map(name => {
    const node = source.statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === name)
    assert.ok(node, name)
    return node.getText(source)
  }).join('\n')
  const code = ts.transpileModule(`const DAMAGE_MOD_SCALE = 4096;\n${functions}\nglobalThis.engines = { knockOffPowerMultiplier, calcDamage, decisionPowerIndex, engineMovePower }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const context = { classifyHeldItem }
  vm.runInNewContext(code, context)
  const { knockOffPowerMultiplier, calcDamage, decisionPowerIndex, engineMovePower } = context.engines
  assert.equal(engineMovePower(65, 1.5), 97)
  assert.match(app, /const effectivePower = engineMovePower\(movePower, modifierPack\.powerMultiplier \?\? 1\)/)
  assert.match(app, /const scaledPower = engineMovePower\(power, modifiers\?\.powerMultiplier \?\? 1\)/)
  assert.match(section, /\{lt\('상대 적용 결정력'\)\} \{move\.appliedDecisionPower/)
  const attacker = { hp: 150, attack: 150, defense: 110, spAttack: 80, spDefense: 90 }
  const defender = { hp: 160, attack: 100, defense: 120, spAttack: 90, spDefense: 110 }
  const meta = { power: 65, category: 'physical' }
  const scenarios = [
    ['scizor', '', 1],
    ['scizor', 'いのちのたま', 1.5],
    ['mega-scizor', '핫삼나이트', 1],
    ['scizor', 'いのちのたま', 1.5, 'sticky-hold'],
  ]
  const results = scenarios.map(([key, item, expected, ability]) => {
    const multiplier = knockOffPowerMultiplier('탁쳐서떨구기', key, item, ability)
    assert.equal(multiplier, expected)
    const mods = { powerMultiplier: multiplier }
    return { power: engineMovePower(65, multiplier), index: decisionPowerIndex(attacker, meta, 1.5, mods), damage: calcDamage(attacker, defender, 65, 'physical', 1.5, 1, meta, mods) }
  })
  assert.equal(results[0].index, results[2].index)
  assert.equal(results[1].index, Math.round(results[0].index * 1.5))
  assert.deepEqual(Array.from(results[0].damage.rolls), Array.from(results[2].damage.rolls))
  assert.deepEqual(Array.from(results[1].damage.rolls), Array.from(results[3].damage.rolls))
  assert.equal(results[1].index, results[3].index)
  assert.ok(results[1].damage.min > results[0].damage.min)
  assert.ok(results[1].damage.max > results[0].damage.max)
  assert.deepEqual(results.map(({ power, index, damage }) => ({ power, index, min: damage.min, max: damage.max })), [
    { power: 65, index: 14625, min: 46, max: 55 },
    { power: 97, index: 21938, min: 69, max: 82 },
    { power: 65, index: 14625, min: 46, max: 55 },
    { power: 97, index: 21938, min: 69, max: 82 },
  ])
})

test('sample-only layout gives the item a full track, usable bulk numbers, and places compact results before bulk', () => {
  assert.match(css, /\.sample-calculator-target \.sample-damage-item-editor\s*\{\s*grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(css, /\.sample-calculator-target \.sample-bulk-pair-row input\[type="number"\],[\s\S]*?min-width: 76px/)
  assert.match(css, /\.sample-damage-move-result\s*\{[^}]*display: grid/)
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?#sample-damage-section \.sample-calculator-target \.sample-damage-card-body\s*\{\s*grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(css, /#sample-damage-section \.sample-opponent-move-grid,[\s\S]*?#sample-damage-section \.sample-track-input-grid,[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/)
  assert.match(css, /#sample-damage-section \.registered-move-slot input\s*\{[^}]*height: 40px/)
  assert.doesNotMatch(section, /className="sample-workbench-mainpanel"/)
})
