import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'

const source = ts.createSourceFile('App.tsx', readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const roster = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url))).rows
const found = {}
function visit(node) {
  if (ts.isFunctionDeclaration(node) && ['abilitySearchCandidates', 'filterDexAbilityOptions'].includes(node.name?.text)) found[node.name.text] = node
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'dexAbilityOptions') found.memo = node.initializer
  ts.forEachChild(node, visit)
}
visit(source)
assert.ok(found.abilitySearchCandidates && found.filterDexAbilityOptions && found.memo)

test('Dex ability search memo refreshes a newly loaded shared Japanese alias on unchanged query', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { abilityIndex, abilityAliases } = await server.ssrLoadModule('/src/abilityIdentity.ts')
    const { abilityDescriptionFor, loadDexDescriptions } = await server.ssrLoadModule('/src/dex/data.ts')
    const { normalizeSearchText } = await server.ssrLoadModule('/src/pokemonSearch.ts')
    let cached
    const context = vm.createContext({
      rows: roster, abilityIndex, abilityAliases, abilityDescriptionFor, normalizeSearchText,
      byDisplayName: entries => entries, matchesLooseQuery: () => false,
      deferredDexSearch: 'トレース', asyncDataVersion: 0,
      React: { useMemo(fn, deps) {
        if (cached && deps.length === cached.deps.length && deps.every((dep, idx) => Object.is(dep, cached.deps[idx]))) return cached.value
        cached = { deps, value: fn() }; return cached.value
      } },
    })
    const code = `${found.abilitySearchCandidates.getText(source)}\n${found.filterDexAbilityOptions.getText(source)}\nconst result = ${found.memo.getText(source)}; globalThis.result = result;`
    const run = () => vm.runInContext(ts.transpileModule(`(() => { ${code} })()`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText, context)
    assert.equal(abilityDescriptionFor('trace'), null)
    run()
    assert.ok(!context.result.some(entry => entry.key === 'trace'))
    await loadDexDescriptions()
    context.asyncDataVersion = 1
    run()
    assert.ok(context.result.some(entry => entry.key === 'trace'), 'same search must recompute from lazy shared identity aliases')
  } finally { await server.close() }
})
