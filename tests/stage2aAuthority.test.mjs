import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = name => fs.readFileSync(path.join(root, name), 'utf8')
const parse = (name, kind) => ts.createSourceFile(name, source(name), ts.ScriptTarget.Latest, true, kind)
const definitions = (ast, name) => ast.statements.filter(node =>
  (ts.isFunctionDeclaration(node) && node.name?.text === name) ||
  (ts.isVariableStatement(node) && node.declarationList.declarations.some(decl => ts.isIdentifier(decl.name) && decl.name.text === name)))
const imports = (ast, specifier, name) => ast.statements.some(node =>
  ts.isImportDeclaration(node) && node.moduleSpecifier.text === specifier &&
  node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) &&
  node.importClause.namedBindings.elements.some(item => !item.isTypeOnly && item.name.text === name))

test('generator imports the sole actualStat implementation and keeps speed row projection', async () => {
  const owner = parse('src/domain/champions/statMechanics.ts', ts.ScriptKind.TS)
  const generator = parse('scripts/sync-champions-verified-data.mjs', ts.ScriptKind.JS)
  assert.equal(definitions(owner, 'actualStat').length, 1)
  assert.equal(definitions(generator, 'actualStat').length, 0, 'no generator shadow implementation')
  assert.ok(imports(generator, '../src/domain/champions/statMechanics.ts', 'actualStat'))
  assert.equal(definitions(generator, 'speedTemplate').length, 1)
  assert.equal(definitions(generator, 'buildRow').length, 1)
  const { actualStat } = await import('../src/domain/champions/statMechanics.ts')
  for (const [base, ev, mult, hp, result] of [
    [100, 0, 1, false, 120], [100, 5, 1.1, false, 137], [100, 6, 1.1, false, 138],
    [100, 19, 1.1, false, 152], [100, 20, 1.1, false, 154], [100, 32, .9, false, 136],
    [45, 32, 1, true, 152], [111, 32, 1.1, false, 179], [111, 32, 1, false, 163],
  ]) assert.equal(actualStat(base, ev, mult, hp), result)
})

test('single JSON-free nature owner supplies actual builder, UI, and OCR consumers', async () => {
  const owner = parse('src/domain/champions/natures.ts', ts.ScriptKind.TS)
  const builder = parse('src/domain/champions/buildRules.ts', ts.ScriptKind.TS)
  const app = parse('src/App.tsx', ts.ScriptKind.TSX)
  const ocr = parse('scripts/check-party-image-import-harness.mjs', ts.ScriptKind.JS)
  assert.equal(definitions(owner, 'NATURES').length, 1)
  assert.equal(definitions(builder, 'NATURES').length, 0)
  assert.equal(definitions(ocr, 'NATURES').length, 0)
  assert.ok(imports(builder, './natures.ts', 'NATURES'))
  assert.ok(imports(app, './domain/champions/natures', 'NATURES'))
  assert.ok(imports(ocr, '../src/domain/champions/natures.ts', 'NATURES'))
  assert.ok(!owner.statements.some(node => ts.isImportDeclaration(node) || ts.isExportDeclaration(node) && node.moduleSpecifier), 'nature owner has no eager JSON or higher-level imports')
  const { NATURES } = await import('../src/domain/champions/natures.ts')
  const { knownNature, natureMultiplier } = await import('../src/domain/champions/buildRules.ts')
  assert.equal(NATURES.length, 25)
  assert.deepEqual(NATURES.map(n => [n.id, n.label]), [
    ['hardy','노력'],['lonely','외로움'],['brave','용감'],['adamant','고집'],['naughty','개구쟁이'],
    ['bold','대담'],['docile','온순'],['relaxed','무사태평'],['impish','장난꾸러기'],['lax','촐랑'],
    ['timid','겁쟁이'],['hasty','성급'],['serious','성실'],['jolly','명랑'],['naive','천진난만'],
    ['modest','조심'],['mild','의젓'],['quiet','냉정'],['bashful','수줍음'],['rash','덜렁'],
    ['calm','차분'],['gentle','얌전'],['sassy','건방'],['careful','신중'],['quirky','변덕'],
  ])
  for (const nature of NATURES) {
    assert.equal(knownNature(nature.id), true)
    for (const stat of ['attack', 'defense', 'spAttack', 'spDefense', 'speed'])
      assert.equal(natureMultiplier(nature.id, stat), nature.up === stat ? 1.1 : nature.down === stat ? .9 : 1)
  }
  assert.equal(knownNature('invalid'), false)
  const producerNodes = ['normalizeSearchText', 'matchesLooseQuery', 'scoreOcrCandidate', 'parseNature', 'natureIndex'].map(name => {
    const node = definitions(ocr, name)[0]
    assert.ok(node, `real OCR producer ${name}`)
    return node.getText(ocr)
  })
  const parseNature = vm.runInNewContext(`${producerNodes.join('\n')}\nparseNature`, { NATURES, Math, Number, String, Set })
  for (const [id, label] of NATURES.map(n => [n.id, n.label])) {
    assert.equal(parseNature([id]), id, `OCR identifier ${id}`)
    assert.equal(parseNature([label]), id, `OCR label ${label}`)
  }
  assert.equal(parseNature(['unknown']), null)
})

test('TS/JS producer declarations have one owner and resolved consumer graph reaches it', () => {
  const candidates = ['src', 'scripts']
  const found = { actualStat: [], NATURES: [] }
  const visitDir = dir => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const name = `${dir}/${entry.name}`
      if (entry.isDirectory()) visitDir(name)
      else if (/\.(?:ts|tsx|mjs|js)$/.test(name)) {
        const ast = parse(name, name.endsWith('.tsx') ? ts.ScriptKind.TSX : /\.[mc]?js$/.test(name) ? ts.ScriptKind.JS : ts.ScriptKind.TS)
        const walk = node => {
          if (ts.isFunctionDeclaration(node) && node.name?.text === 'actualStat' ||
              ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'actualStat' && node.initializer)
            found.actualStat.push(name)
          if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'NATURES' && node.initializer) found.NATURES.push(name)
          ts.forEachChild(node, walk)
        }
        walk(ast)
      }
    }
  }
  for (const dir of candidates) visitDir(dir)
  assert.deepEqual(found.actualStat, ['src/domain/champions/statMechanics.ts'])
  assert.deepEqual(found.NATURES, ['src/domain/champions/natures.ts'])
  const options = ts.parseJsonConfigFileContent(ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile).config, ts.sys, root).options
  const resolve = (from, specifier) => path.relative(root, ts.resolveModuleName(specifier, path.join(root, from), options, ts.sys).resolvedModule?.resolvedFileName ?? '')
  assert.equal(resolve('src/App.tsx', './domain/champions/natures'), 'src/domain/champions/natures.ts')
  assert.equal(resolve('src/domain/champions/buildRules.ts', './natures.ts'), 'src/domain/champions/natures.ts')
  assert.equal(resolve('scripts/check-party-image-import-harness.mjs', '../src/domain/champions/natures.ts'), 'src/domain/champions/natures.ts')
  assert.equal(resolve('scripts/sync-champions-verified-data.mjs', '../src/domain/champions/statMechanics.ts'), 'src/domain/champions/statMechanics.ts')
})
