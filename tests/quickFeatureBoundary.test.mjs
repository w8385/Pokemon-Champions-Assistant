import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const sf = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
test('Quick panel and Quick-only declarations have one feature owner; both actual App callers import it', () => {
  const declarations = sf.statements.flatMap(s => ts.isFunctionDeclaration(s) && s.name ? [s.name.text] : ts.isVariableStatement(s) ? s.declarationList.declarations.map(d => d.name.getText(sf)) : [])
  for (const name of ['QuickDamagePanel', 'quickSide', 'quickStat', 'quickMagicProjection', 'restoredComparisonSide', 'QUICK_KEY']) assert.ok(!declarations.includes(name), `${name} still owned by App`)
  const imports = sf.statements.filter(ts.isImportDeclaration).filter(s => s.moduleSpecifier.text === './features/damage/QuickDamagePanel')
  assert.equal(imports.length, 1)
  assert.match(imports[0].importClause.getText(sf), /QuickDamagePanel/)
  assert.equal((source.match(/<QuickDamagePanel\b/g) ?? []).length, 1)
  assert.equal((readFileSync(new URL('../src/features/single/SingleEntryComparison.tsx', import.meta.url), 'utf8').match(/<QuickDamagePanel\b/g) ?? []).length, 1)
  const panel = readFileSync(new URL('../src/features/damage/QuickDamagePanel.tsx', import.meta.url), 'utf8')
  assert.match(panel, /useQuickDamageState/)
  assert.match(panel, /QuickDamageView/)
  assert.doesNotMatch(panel, /function calculateQuickDamage\(/)
})
test('selected damage result is a focused presentation owner, not inline in the feature shell', () => {
  const view = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
  const result = readFileSync(new URL('../src/features/damage/QuickDamageResult.tsx', import.meta.url), 'utf8')
  assert.match(view, /<QuickDamageResult model=/)
  assert.doesNotMatch(view, /className="quick-result-head"/)
  assert.match(result, /className="quick-result-head"/)
  assert.match(result, /selectedReason/)
})

test('retargeted Quick view, state, calculation, result and standalone IO form the actual import graph', () => {
  const files = {
    panel: 'QuickDamagePanel.tsx', hook: 'useQuickDamageState.ts', view: 'QuickDamageView.tsx',
    result: 'QuickDamageResult.tsx', calculation: 'calculateQuickDamage.ts',
  }
  const imports = name => {
    const text = readFileSync(new URL(`../src/features/damage/${files[name]}`, import.meta.url), 'utf8')
    const ast = ts.createSourceFile(files[name], text, ts.ScriptTarget.Latest, true,
      files[name].endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
    return ast.statements.filter(ts.isImportDeclaration).map(node => node.moduleSpecifier.text)
  }
  assert.ok(imports('panel').includes('./useQuickDamageState'))
  assert.ok(imports('panel').includes('./QuickDamageView'))
  assert.ok(imports('hook').includes('./calculateQuickDamage'))
  assert.ok(imports('hook').includes('../../adapters/persistence/quickDamage'))
  assert.ok(imports('view').includes('./QuickDamageResult'))
  assert.ok(imports('view').includes('./QuickSpeedPresentation'))
  assert.ok(imports('result').includes('./quickPresentation'))
  assert.ok(imports('calculation').includes('./prepareQuickDamageInput'))
  assert.ok(imports('hook').includes('./prepareQuickDamageInput'))
  assert.ok(imports('view').includes('./QuickSideCard'))
  assert.ok(imports('view').includes('./QuickConditions'))
  assert.ok(imports('view').includes('./QuickEffortModal'))
  const calculation = readFileSync(new URL('../src/features/damage/calculateQuickDamage.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(calculation, /from ['"][^'"]*(?:adapters|shared\/display|quickModel)(?:\/|['"])/)
  assert.doesNotMatch(calculation, /\b(?:localStorage|window|document|resolveMoveMeta|indexByKey|rows)\b/)
  assert.match(calculation, /export function calculateQuickDamage\(/)
})

test('pure calculator traverses real production runtime imports without IO or React', () => {
  const root = fileURLToPath(new URL('../src/', import.meta.url))
  const queue = [resolve(root, 'features/damage/calculateQuickDamage.ts')]
  const visited = new Set()
  while (queue.length) {
    const file = queue.pop()
    if (visited.has(file)) continue
    visited.add(file)
    assert.ok(!file.includes('/adapters/'), file)
    const text = readFileSync(file, 'utf8')
    assert.doesNotMatch(text, /\b(?:localStorage|document|window)\b/, file)
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    for (const node of ast.statements.filter(ts.isImportDeclaration)) {
      const bindings = node.importClause?.namedBindings
      if (node.importClause?.isTypeOnly || (bindings && ts.isNamedImports(bindings) && bindings.elements.every(e => e.isTypeOnly))) continue
      const spec = node.moduleSpecifier.text
      assert.notEqual(spec, 'react', file)
      if (!spec.startsWith('.')) continue
      const candidate = resolve(dirname(file), spec)
      const next = extname(candidate) ? candidate : `${candidate}.ts`
      if (!next.endsWith('.json')) queue.push(next)
    }
  }
  assert.ok(visited.size > 8, 'traversed actual rule imports')
})

test('Quick standalone storage is a single adapter, not an App or comparison draft key', async () => {
  const { createServer } = await import('vite')
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
  try {
  const { QUICK_KEY, readQuickStandalone, writeQuickStandalone } = await server.ssrLoadModule('/src/adapters/persistence/quickDamage.ts')
  assert.equal(QUICK_KEY, 'pokemon-champions-quick-damage:v1')
  let raw = '{malformed', writes = []
  const storage = { getItem(key) { assert.equal(key, QUICK_KEY); return raw }, setItem(key, value) { writes.push([key,value]); raw = value } }
  assert.deepEqual(readQuickStandalone(storage), {})
  writeQuickStandalone(storage, { attacker: { moves: ['A','','C',''] }, defender: {}, conditions: { weather: 'rain' }, manualFields: { weather: true, terrain: true } })
  assert.deepEqual(JSON.parse(raw).attacker.moves, ['A','','C',''])
  assert.deepEqual(writes.map(([key]) => key), [QUICK_KEY])
  assert.throws(() => readQuickStandalone({ getItem() { throw Error('getItem') } }), /getItem/)
  assert.throws(() => writeQuickStandalone({ setItem() { throw Error('setItem') } }, {}), /setItem/)
  } finally { await server.close() }
})
