import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const root = new URL('../src/', import.meta.url)
const read = name => fs.readFileSync(new URL(name, root), 'utf8')
const app = read('App.tsx')
function names(file) {
  const ast = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  return new Set(ast.statements.flatMap(node => ts.isFunctionDeclaration(node) ? [node.name?.text] : ts.isVariableStatement(node) ? node.declarationList.declarations.map(d => d.name.getText(ast)) : []))
}
test('App consumes real battle rules and owns no duplicate declarations', () => {
  const appNames = names('App.tsx')
  for (const [file, exported] of Object.entries({
    'domain/battle/typeEffectiveness.ts': ['typeChart', 'normalizedTypeChart', 'typeEffectiveness', 'effectiveDefenderAbility', 'abilityAdjustedTypeEffectiveness'],
    'domain/battle/modifierRules.ts': ['resolveDamageModifiers'],
    'domain/battle/statProjection.ts': ['buildPartyBattleStats', 'buildOpponentBattleStats', 'partySpeedValue', 'opponentSpeedValue', 'attackingFormRow'],
    'domain/battle/movePower.ts': ['CONDITIONAL_MOVE_POWER_RULES', 'applyConditionalMovePower'],
  })) {
    const owner = names(file)
    assert.match(app, new RegExp(`from ['"]\\./${file.replace(/\.ts$/, '')}(?:\\.ts)?['"]`), `App must import ${file}`)
    for (const name of exported) {
      assert.ok(owner.has(name), `${file} must own ${name}`)
      assert.ok(!appNames.has(name), `App duplicates ${name}`)
    }
  }
})
test('static ability immunity has one declaration and two real consumers', () => {
  const party = read('domain/party/partyAnalysis.ts')
  const rules = read('domain/battle/modifierRules.ts')
  assert.ok(names('domain/battle/abilityImmunities.ts').has('alwaysOnAbilityImmunity'))
  assert.ok(!names('domain/party/partyAnalysis.ts').has('alwaysOnAbilityImmunity'))
  for (const text of [party, rules]) assert.match(text, /from ['"]\.\.\/battle\/abilityImmunities(?:\.ts)?['"]|from ['"]\.\/abilityImmunities(?:\.ts)?['"]|from ['"]\.\.\/\.\.\/domain\/battle\/abilityImmunities(?:\.ts)?['"]/)
})
