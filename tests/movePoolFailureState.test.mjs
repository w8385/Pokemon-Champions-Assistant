import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const marker = app.indexOf('const targetKeys = Array.from(new Set([...party.map(')
const start = app.lastIndexOf('React.useEffect(', marker)
const end = app.indexOf('}, [party, opponents, sampleForge.key, movePoolByKey])', marker) + '}, [party, opponents, sampleForge.key, movePoolByKey])'.length
const effectCode = ts.transpileModule(app.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
function mount(initial) {
  let effect, loads = 0
  const context = {
    React: { useEffect(callback) { effect = callback } },
    party: [{ key: 'fixture' }], opponents: [], sampleForge: { key: '' },
    movePoolByKey: initial,
    setMovePoolByKey(update) { context.movePoolByKey = update(context.movePoolByKey) },
    loadFormLearnset() { loads++; return Promise.reject(new Error('fixture snapshot failure')) },
    LEARNSET_SOURCE: { kind: 'game-snapshot', date: '2026-09-09' },
  }
  vm.runInNewContext(effectCode, context)
  return { context, run: () => effect(), loads: () => loads }
}

test('Party/Builder move-pool failure settles instead of refetching on its own state update', async () => {
  const mounted = mount({})
  mounted.run()
  assert.equal(mounted.loads(), 1)
  mounted.run() // render with loading state
  assert.equal(mounted.loads(), 1)
  await new Promise(setImmediate)
  assert.equal(mounted.context.movePoolByKey.fixture.status, 'load-error')
  for (let i = 0; i < 4; i++) {
    mounted.run()
    await new Promise(setImmediate)
  }
  assert.equal(mounted.loads(), 1, 'the settled error must not trigger an automatic request loop')
  assert.equal(mounted.context.movePoolByKey.fixture.status, 'load-error')
})

test('verified, missing, loading and failed entries do not start duplicate pool loads', () => {
  for (const status of ['ready-verified', 'missing', 'loading', 'load-error']) {
    const mounted = mount({ fixture: { status, moves: [] } })
    mounted.run()
    assert.equal(mounted.loads(), 0, status)
    assert.equal(mounted.context.movePoolByKey.fixture.status, status)
  }
})
