import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const start = app.lastIndexOf('  const poolMounted =', app.indexOf('for (const key of new Set([attacker.key, defender.key]))'))
const end = app.indexOf('}, [attacker.key, defender.key])', start) + '}, [attacker.key, defender.key])'.length
assert.ok(start > 0 && end > start)
const effect = ts.transpileModule(app.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText

function fixture() {
  const requests = new Map()
  const effects = []
  let mountedCleanup, cleanup
  const state = {
    attacker: { key: 'A' }, defender: { key: 'B' }, pools: {},
    React: { useRef(value) { return { current: value } }, useEffect(fn) { effects.push(fn) } },
    LEARNSET_SOURCE: { date: '2026-09-09' },
    setPools(update) { state.pools = update(state.pools) },
    loadFormLearnset(key) { return new Promise((resolve, reject) => { requests.set(key, { resolve, reject }) }) },
  }
  vm.runInNewContext(effect, state)
  mountedCleanup = effects[0]()
  return {
    state, requests,
    select(key) { cleanup?.(); state.attacker.key = key; cleanup = effects[1]() },
    unmount() { cleanup?.(); mountedCleanup() },
    settle(key, status = 'ready-verified') { requests.get(key).resolve({ status, moves: [{ name: key }], moveIds: [1] }) },
  }
}
const flush = () => new Promise(setImmediate)

test('Quick A→C keeps pending B load and caches A by its original key', async () => {
  const f = fixture()
  f.select('A')
  f.select('C')
  f.settle('B'); f.settle('A'); f.settle('C')
  await flush()
  for (const key of ['A', 'B', 'C']) assert.equal(f.state.pools[key]?.status, 'ready-verified', key)
})

test('Quick A→B→A never strands either pending pool or reissues a pending load', async () => {
  const f = fixture()
  f.select('A')
  f.select('B')
  const firstA = f.requests.get('A')
  f.select('A')
  assert.equal(f.requests.get('A'), firstA)
  f.settle('A'); f.settle('B')
  await flush()
  assert.equal(f.state.pools.A.status, 'ready-verified')
  assert.equal(f.state.pools.B.status, 'ready-verified')
})
