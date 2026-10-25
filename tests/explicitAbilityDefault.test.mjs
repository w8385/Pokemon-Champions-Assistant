import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'

const rows = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url))).rows
const text = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const source = ts.createSourceFile('App.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const declaration = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'defaultAbilityForKey')
assert.ok(declaration)

test('every explicit new form defaults only its sole ability through both authority and actual App wrapper', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { abilityForSpeciesSelection } = await server.ssrLoadModule('/src/abilityIdentity.ts')
    const context = vm.createContext({ indexByKey: new Map(rows.map(row => [row.key, row])), abilityForSpeciesSelection })
    vm.runInContext(ts.transpileModule(declaration.getText(source), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText, context)
    for (const row of [...rows].sort((a, b) => b.abilities.length - a.abilities.length)) {
      const expected = row.abilities.length === 1 ? row.abilities[0] : ''
      assert.equal(abilityForSpeciesSelection(row, '', row.key, 'previous-record'), expected, `authority: ${row.key}`)
      assert.equal(context.defaultAbilityForKey(row.key), expected, `actual App default: ${row.key}`)
      for (const raw of ['', 'creator-original', row.abilities[0] ?? '']) {
        assert.equal(abilityForSpeciesSelection(row, row.key, row.key, raw), raw, `same form: ${row.key}`)
      }
    }
    assert.equal(context.defaultAbilityForKey('unresolved-form'), '')
    assert.equal(abilityForSpeciesSelection(undefined, '', 'unresolved-form', 'previous'), '')
  } finally { await server.close() }
})
