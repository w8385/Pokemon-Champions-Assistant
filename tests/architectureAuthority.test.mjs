import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/module-ownership.json'), 'utf8'))
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile)
assert.equal(config.error, undefined)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const files = parsed.fileNames.filter(file => file.startsWith(src + path.sep))
const program = ts.createProgram(files, parsed.options)
const checker = program.getTypeChecker()
const relative = file => path.relative(root, file).replaceAll(path.sep, '/')
const edges = []
const externalEdges = []
for (const file of files) {
  const ast = program.getSourceFile(file)
  if (!ast) continue
  function add(specifier, kind, node) {
    const resolved = ts.resolveModuleName(specifier, file, parsed.options, ts.sys).resolvedModule?.resolvedFileName ?? (specifier.endsWith('.css') && fs.existsSync(path.resolve(path.dirname(file), specifier)) ? path.resolve(path.dirname(file), specifier) : undefined)
    assert.ok(resolved, `unresolved ${relative(file)}:${ast.getLineAndCharacterOfPosition(node.pos).line + 1} ${specifier}`)
    if (resolved.startsWith(src + path.sep)) edges.push({ from: relative(file), to: relative(resolved), kind })
    else externalEdges.push({ from: relative(file), specifier, kind })
  }
  function walk(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause
      let typeOnly = Boolean(clause?.isTypeOnly || (ts.isExportDeclaration(node) && node.isTypeOnly))
      if (clause && !typeOnly && !clause.name && clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        typeOnly = clause.namedBindings.elements.length > 0 && clause.namedBindings.elements.every(element => element.isTypeOnly || (checker.getSymbolAtLocation(element.name)?.flags & ts.SymbolFlags.TypeAlias) !== 0)
      }
      add(node.moduleSpecifier.text, typeOnly ? 'type' : 'runtime', node)
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      assert.ok(node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0]), `unresolved dynamic import ${relative(file)}`)
      add(node.arguments[0].text, 'lazy', node)
    }
    ts.forEachChild(node, walk)
  }
  walk(ast)
}

test('module ownership manifest matches actual source files; root stays at staged entrypoints', () => {
  const actual = new Set(fs.readdirSync(src, { recursive: true, withFileTypes: true }).filter(entry => entry.isFile()).map(entry => relative(path.join(entry.parentPath, entry.name))))
  assert.deepEqual([...actual].sort(), [...manifest.stage1Files].sort())
  assert.deepEqual(fs.readdirSync(src, { withFileTypes: true }).filter(entry => entry.isFile()).map(entry => entry.name).sort(), ['App.tsx', 'main.tsx', 'styles.css'])
})

test('resolved runtime graph keeps domain away from app, adapters, features and React', () => {
  const violations = edges.filter(edge => edge.kind !== 'type' && edge.from.startsWith('src/domain/') && (/^src\/(app|adapters|features)\//.test(edge.to) || edge.to === 'src/App.tsx'))
  assert.deepEqual(violations, [])
  assert.deepEqual(externalEdges.filter(edge => edge.kind !== 'type' && edge.from.startsWith('src/domain/') && /^(react|react-dom)(\/|$)/.test(edge.specifier)), [])
  for (const edge of edges.filter(edge => edge.from.startsWith('src/domain/') && edge.to === 'src/app/types.ts')) assert.equal(edge.kind, 'type', JSON.stringify(edge))
  assert.ok(edges.some(edge => edge.from === 'src/App.tsx' && edge.to === 'src/domain/battle/damageCore.ts' && edge.kind === 'runtime'))
})

test('large canonical catalogues are lazy, not statically reachable at startup', () => {
  const staticGraph = new Map()
  for (const edge of edges.filter(edge => edge.kind === 'runtime')) staticGraph.set(edge.from, [...(staticGraph.get(edge.from) ?? []), edge.to])
  const seen = new Set(), queue = ['src/main.tsx']
  while (queue.length) { const current = queue.pop(); if (seen.has(current)) continue; seen.add(current); queue.push(...(staticGraph.get(current) ?? [])) }
  for (const name of manifest.lazyJson) {
    assert.ok(!seen.has(name), `eager JSON ${name}`)
    assert.ok(edges.some(edge => edge.kind === 'lazy' && edge.to === name), `missing lazy consumer ${name}`)
  }
})

test('canonical JSON byte hashes and parsed namespaces remain unchanged', () => {
  for (const row of manifest.json) {
    const bytes = fs.readFileSync(path.join(root, row.path))
    assert.equal((awaitHash(bytes)), row.sha256, row.path)
    const parsed = JSON.parse(bytes.toString())
    assert.deepEqual(new Set(Object.keys(parsed)), new Set(row.topLevelKeys), row.path)
    assert.equal(row.rows, Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length, row.path)
  }
})
function awaitHash(bytes) { return createHash('sha256').update(bytes).digest('hex') }
