import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import ts from 'typescript'

const data = JSON.parse(readFileSync(new URL('../src/dexGameLearnsets.json', import.meta.url), 'utf8'))
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

async function withLoader(check) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try { await check(await server.ssrLoadModule('/src/dexGameLearnsets.ts')) }
  finally { await server.close() }
}

test('ID 747 returns exactly four forms from the dated snapshot', async () => withLoader(async ({ loadDexGameMoveLearners }) => {
  const result = await loadDexGameMoveLearners('볼가득넣기')
  assert.equal(result.status, 'ready')
  assert.deepEqual([...result.keys].sort(), ['simipour', 'simisage', 'simisear', 'swalot'])
  assert.equal(result.provenance.kind, 'game-snapshot')
  assert.equal(result.provenance.date, '2026-09-09')
}))

test('every one of 510 canonical moves reverses the exact 339 form pools, including forms and sparse moves', async () => withLoader(async ({ loadDexGameMoveLearners }) => {
  assert.equal(Object.keys(data.forms).length, 339)
  assert.equal(Object.keys(data.moves).length, 510)
  for (const [id, move] of Object.entries(data.moves)) {
    const expected = Object.entries(data.forms).filter(([, form]) => form.moves.includes(Number(id))).map(([key]) => key).sort()
    const result = await loadDexGameMoveLearners(move.appName)
    assert.equal(result.status, 'ready', move.appName)
    assert.deepEqual([...result.keys].sort(), expected, `move ${id}: ${move.appName}`)
    assert.ok(result.keys.every(key => !Object.hasOwn(data.unresolved, key)), `ambiguous ${id}`)
  }
}))

test('unknown name is missing, not an asserted zero-learner ready pool', async () => withLoader(async ({ loadDexGameMoveLearners }) => {
  const result = await loadDexGameMoveLearners('없는기술')
  assert.equal(result.status, 'missing')
  assert.deepEqual(result.keys, [])
  assert.equal(result.provenance.reason, 'not-recorded')
}))

test('actual Dex detail effect calls canonical reverse loader and renders only its keyed result', () => {
  let effect
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'React.useEffect' && node.arguments[0]?.getText(ast).includes('setDexMoveLearnerResult')) effect = node
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(effect)
  const body = effect.getText(ast)
  assert.match(body, /loadDexGameMoveLearners\(dexSelectedMoveName\)/)
  assert.doesNotMatch(body, /dexMoveLearnerRows\(/)
  assert.match(body, /cancelled/)
  assert.match(app, /dexMoveLearnersStatus === 'missing'/)
  assert.match(app, /dexMoveLearnersStatus === 'error'/)
  assert.match(app, /window\.location\.reload\(\)/)
})
