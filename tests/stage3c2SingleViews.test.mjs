import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const appPath = new URL('../src/App.tsx', import.meta.url)
const singlePath = new URL('../src/features/single/SingleEntryComparison.tsx', import.meta.url)
const pickPath = new URL('../src/features/single/OpponentsPickView.tsx', import.meta.url)
const source = path => fs.readFileSync(path, 'utf8')
const parse = path => ts.createSourceFile(path.pathname, source(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const jsxNames = ast => {
  const names = []
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) names.push(node.tagName.text ?? node.tagName.getText())
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return names
}
const exportedFunction = (ast, name) => {
  const nodes = ast.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword))
  assert.equal(nodes.length, 1, `${name} must have one stable module-scope export`)
  return nodes[0]
}

test('App mounts real Single entry Quick and shared Pick owners on both original routes', () => {
  const app = parse(appPath)
  const single = parse(singlePath)
  const pick = parse(pickPath)
  const imports = app.statements.filter(ts.isImportDeclaration).map(node => [node.moduleSpecifier.text, node.importClause?.getText(app) ?? ''])
  assert.ok(imports.some(([path, names]) => path.endsWith('/SingleEntryComparison') && names.includes('SingleEntryComparison')))
  assert.ok(imports.some(([path, names]) => path.endsWith('/OpponentsPickView') && names.includes('OpponentsPickView')))
  assert.ok(jsxNames(app).includes('SingleEntryComparison'))
  assert.ok(jsxNames(app).includes('OpponentsPickView'))
  assert.ok(jsxNames(app).includes('QuickDamagePanel'), 'standalone damage route retains its independent Quick owner')
  const singleMount = source(appPath).match(/mainSection === 'single' \? <SingleEntryComparison[\s\S]*?\/> : null\}/)?.[0]
  assert.ok(singleMount, 'entry-backed route must mount SingleEntryComparison')
  assert.ok(!singleMount.includes('<QuickDamagePanel'), 'entry-backed Quick assembly leaves App')
  assert.ok(jsxNames(exportedFunction(single, 'SingleEntryComparison')).includes('QuickDamagePanel'))
  assert.ok(jsxNames(exportedFunction(pick, 'OpponentsPickView')).includes('PokemonSearchField'))
  assert.ok(jsxNames(exportedFunction(pick, 'OpponentsPickView')).includes('SearchCombobox'))
  assert.ok(jsxNames(exportedFunction(pick, 'OpponentsPickView')).includes('MoveCandidateRow'))
  const appText = source(appPath)
  assert.match(appText, /mainSection === 'single' && activeTab === 'pick'/)
  assert.match(appText, /mainSection === 'double' && activeTab === 'pick'/)
  assert.doesNotMatch(appText, /id="opponent-entry-quick"/)
  assert.doesNotMatch(appText, /className="unified-single-pair"/)
})

test('single view preserves registered own-key guard, four moves and opponent save boundary', () => {
  const ast = parse(singlePath)
  const owner = exportedFunction(ast, 'SingleEntryComparison').getText(ast)
  assert.match(owner, /draft\.key !== party\[selectedMy\]\?\.key/)
  assert.match(owner, /commitComparisonEntry\('own'/)
  assert.match(owner, /normalizeMoveSlots\(draft\.moves\)/)
  assert.match(owner, /saveComparisonOpponent\(selectedOpp, draft, dirty\)/)
  assert.match(owner, /comparisonSides\(party, opponents, selectedMy, selectedOpp/)
  assert.match(owner, /setOpponentDraftIdentity\(side, ''\)/)
})

test('Pick reads existing owner and shared popup controls without local record state', () => {
  const ast = parse(pickPath)
  const owner = exportedFunction(ast, 'OpponentsPickView').getText(ast)
  for (const token of ['opponent-entry-quick', 'opponent-detail-species-', 'opponent-item-', 'opp-entry-move-', 'opponent-board-card', 'pick-slot-card', 'opponent-revealed-moves-grid', 'battleNote']) assert.ok(owner.includes(token), token)
  assert.doesNotMatch(owner, /(?:React\.)?useState\s*\(/)
  assert.match(owner, /e\.nativeEvent\.isComposing/)
  assert.match(owner, /e\.keyCode === 229/)
  assert.match(owner, /e\.key === 'Escape' \|\| e\.key === 'Tab'/)
})
