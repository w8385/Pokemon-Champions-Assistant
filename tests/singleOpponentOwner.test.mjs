import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ownerPath = new URL('../src/features/single/useOpponentEntries.ts', import.meta.url)
const owner = readFileSync(ownerPath, 'utf8')
const declarations = source => {
  const ast = ts.createSourceFile('owner.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const names = new Set()
  function visit(node) {
    if (ts.isVariableDeclaration(node)) {
      const collect = name => {
        if (ts.isIdentifier(name)) names.add(name.text)
        else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) for (const element of name.elements) if (ts.isBindingElement(element)) collect(element.name)
      }
      if (!source.includes('const opponentEntries = useOpponentEntries(') || !node.initializer || !ts.isIdentifier(node.initializer) || node.initializer.text !== 'opponentEntries') collect(node.name)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return names
}

test('actual App imports and always mounts the one registered opponent owner', () => {
  assert.match(app, /import \{ useOpponentEntries \} from '\.\/features\/single\/useOpponentEntries'/)
  assert.match(app, /useOpponentEntries\(/)
  const owned = declarations(owner), root = declarations(app)
  for (const name of ['opponents', 'selectedOpp', 'singleDraftIdentity', 'opponentResetRevision', 'opponentSearch', 'opponentItemDrafts', 'opponentAbilityDrafts', 'opponentQuickSearch', 'resetSingleOpponentEntry', 'registerSingleOpponentSpecies', 'commitOpponentQuickSearch', 'clearOpponentSlot']) {
    assert.ok(owned.has(name), `${name} must be declared in owner`)
    assert.ok(!root.has(name), `${name} must not be declared in App`)
  }
  assert.match(owner, /snapshotDefenderDrafts\(/)
  assert.match(owner, /removeDefenderDrafts\(/)
  assert.ok(owner.indexOf('snapshotDefenderDrafts(') < owner.indexOf('window.confirm('))
  assert.ok(owner.indexOf('removeDefenderDrafts(') < owner.indexOf('resetOpponentsForFreshEntry()'))
})
