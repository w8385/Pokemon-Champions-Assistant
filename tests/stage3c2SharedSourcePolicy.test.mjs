import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { createServer } from 'vite'

const files = ['src/App.tsx', 'src/features/single/OpponentsPickView.tsx', 'src/features/single/SingleEntryComparison.tsx']
const owners = {
  searchSlotPlaceholder: 'src/shared/display/searchSlotLabel.ts',
  SPEED_STAGE_OPTIONS: 'src/shared/input/opponentInputPolicy.ts',
  MAX_OPPONENTS: 'src/shared/input/opponentInputPolicy.ts',
  TypeBadgeImage: 'src/shared/display/TypeBadgeImage.tsx',
  sameItemField: 'src/shared/input/autocompleteField.ts',
  highlightedAutocompleteIndex: 'src/shared/input/autocompleteField.ts',
  clampNonNegativeInt: 'src/shared/input/opponentInputPolicy.ts',
  clampSpeedStage: 'src/shared/input/opponentInputPolicy.ts',
  normalizeMoveSlots: 'src/domain/party/moveSlots.ts',
}
function inspect(file) {
  const content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
  const ast = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const declarations = ast.statements.filter(node => (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)))
    .flatMap(node => ts.isVariableStatement(node) ? node.declarationList.declarations.map(d => d.name.getText(ast)) : [node.name?.text])
  return { content, ast, declarations, imports: ast.statements.filter(ts.isImportDeclaration) }
}
test('single actual definition for nine policies; App and extracted views import their real owners', () => {
  const all = [...new Set(Object.values(owners))]
  for (const [name, owner] of Object.entries(owners)) {
    assert.equal(all.filter(file => inspect(file).declarations.includes(name)).length, 1, `${name}: one owner`)
    assert.ok(inspect(owner).declarations.includes(name), `${name}: declared by ${owner}`)
    for (const file of files) {
      const { content, declarations, imports } = inspect(file)
      assert.ok(!declarations.includes(name), `${file} must not copy ${name}`)
      if (!new RegExp(`\\b${name}\\b`).test(content)) continue
      assert.ok(imports.some(node => node.importClause?.namedBindings?.elements?.some(e => e.name.text === name) && node.moduleSpecifier.text.endsWith(owner.replace(/^src\//, '').split('/').at(-1).replace(/\.[^.]+$/, ''))), `${file} must import ${name} from ${owner}`)
    }
  }
})
test('actual exported finite guard and slot normalization preserve original boundaries', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
  try {
    const { clampNonNegativeInt, clampSpeedStage, MAX_OPPONENTS, SPEED_STAGE_OPTIONS } = await vite.ssrLoadModule('/src/shared/input/opponentInputPolicy.ts')
    for (const [input, max, result] of [
      [Infinity, 999, 0], ['Infinity', 999, 0], [-Infinity, 999, 0], ['-Infinity', 999, 0], [NaN, 999, 0],
      ['not-a-number', 999, 0], ['', 999, 0], [' 12.9 ', 999, 12], [-3, 999, 0], [1200, 999, 999],
      ['0x10', 999, 16], [21.9, 10, 10], [-0, 999, 0],
    ]) assert.equal(clampNonNegativeInt(input, max), result, `number ${String(input)} / ${max}`)
    for (const [input, result] of [[NaN, 0], [Infinity, 0], [-Infinity, 0], ['invalid', 0], ['', 0], [' 1.9 ', 1], [-7, -2], [7, 2], [-0, -0]]) assert.equal(clampSpeedStage(input), result, `stage ${String(input)}`)
    assert.equal(MAX_OPPONENTS, 6)
    assert.deepEqual([...SPEED_STAGE_OPTIONS], [-2, -1, 0, 1, 2])
    const { normalizeMoveSlots } = await vite.ssrLoadModule('/src/domain/party/moveSlots.ts')
    for (const [raw, expected] of [[[' a ', '', ' b ', ''], ['a', '', 'b']], [['', '', ''], []], [[' a ', ' b ', ' c ', ' d ', ' e '], ['a', 'b', 'c', 'd']], [[' raw  inner ', ''], ['raw  inner']]]) assert.deepEqual(normalizeMoveSlots(raw), expected)
  } finally { await vite.close() }
})
