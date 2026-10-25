import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'

const appUrl = new URL('../src/App.tsx', import.meta.url)
const app = readFileSync(appUrl, 'utf8')
const source = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let callback
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(source) === 'React.useEffect' && node.arguments[0]?.getText(source).includes('setDexPoolByKey')) callback = node.arguments[0]
  ts.forEachChild(node, visit)
}
visit(source)
assert.ok(callback, 'actual mounted Dex pool effect exists')

async function runEffect(key) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
  const primary = await server.ssrLoadModule('/src/sharedLearnsets.ts')
  let state = {}
  const context = {
    mainSection: 'dex', dexSelectedRow: { key }, dexPoolByKey: {},
    setDexPoolByKey: update => { state = update(state) },
    loadFormLearnset: primary.loadFormLearnset,
    DEX_GAME_LEARNSET_SOURCE: primary.LEARNSET_SOURCE,
  }
  const output = ts.transpileModule(`globalThis.run = ${callback.getText(source)}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(output, context)
  const cleanup = context.run()
  for (let attempts = 0; attempts < 100 && state[key]?.status === 'loading'; attempts++) await new Promise(resolve => setTimeout(resolve, 10))
  cleanup?.()
  return state[key]
  } finally { await server.close() }
}

test('the actual App Dex effect loads the dated game learnset rather than historical seed', async () => {
  const result = await runEffect('rotom')
  assert.equal(result.status, 'ready')
  assert.equal(result.moves.length, 42)
  assert.equal(result.provenance.date, '2026-09-09')
  assert.match(app, /provenance=\{dexSelectedPool\?\.provenance\}/)
})

test('the actual App Dex effect does not turn an ambiguous form into a historical ready pool', async () => {
  const result = await runEffect('mega-meowstic')
  assert.equal(result.status, 'missing')
  assert.equal(result.moves.length, 0)
  assert.equal(result.provenance.reason, 'ambiguous-form')
})

test('explicit failed-module retry reloads the same route rather than reusing a rejected import', () => {
  let retry
  function find(node) {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(source) === 'DexMovePoolSection') {
      retry = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(source) === 'onRetry')?.initializer.expression
    }
    ts.forEachChild(node, find)
  }
  find(source)
  assert.ok(retry)
  let reloads = 0
  const context = { window: { location: { reload: () => { reloads++ } } }, dexSelectedRow: {key: 'rotom'}, setDexPoolByKey: () => {}, setDexPoolRetry: () => {} }
  const output = ts.transpileModule(`globalThis.retry = ${retry.getText(source)}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(output, context)
  context.retry()
  assert.equal(reloads, 1)
})
