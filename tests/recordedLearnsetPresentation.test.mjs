import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let helper
function walk(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'recordedLearnsetText') helper = node
  ts.forEachChild(node, walk)
}
walk(ast)

test('saved four slots keep raw strings and show outside/unknown provenance in three locales', () => {
  assert.ok(helper, 'a shared provenance presenter must exist for all battle cards')
  const context = { recordedMoveSnapshotState(name, pool) { return pool?.status === 'ready-verified' ? pool.moves.some(m => m.name === name) ? 'in-snapshot' : 'outside-snapshot' : pool?.status === 'loading' ? 'pending' : 'unverified' } }
  vm.runInNewContext(ts.transpileModule(`${helper.getText(ast)}; globalThis.label = recordedLearnsetText`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
  for (const language of ['ko', 'en', 'ja']) {
    assert.ok(context.label('legacy', { status: 'ready-verified', moves: [] }, language), language)
    assert.ok(context.label('legacy', { status: 'missing', moves: [] }, language), language)
    assert.ok(context.label('legacy', { status: 'load-error', moves: [] }, language), language)
    assert.equal(context.label('known', { status: 'ready-verified', moves: [{ name: 'known' }] }, language), null)
  }
  assert.match(source, /recordedLearnsetText\(name, pools\[entry\.key\], language\)/)
  assert.match(source, /recordedLearnsetText\(move, memberMovePool, siteLanguage\)/)
  assert.match(source, /recordedLearnsetText\(move, sampleMovePool, siteLanguage\)/)
  assert.match(source, /recordedLearnsetText\(move, myMovePool, siteLanguage\)/)
  assert.match(source, /recordedLearnsetText\(move, oppMovePool, siteLanguage\)/)
})
