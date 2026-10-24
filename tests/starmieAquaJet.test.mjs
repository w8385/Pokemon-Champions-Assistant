import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { quickMoveSupported } from '../src/quickDamageState.ts'

const readJson = name => JSON.parse(readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8'))
const pools = readJson('championsMovePools.json')
const snapshot = readJson('dexGameLearnsets.json')
const metaByName = readJson('championsLearnedMoveMeta.json')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

async function withMoveModules(callback) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const resolver = await server.ssrLoadModule('/src/formAwareMovePool.ts')
    const search = await server.ssrLoadModule('/src/moveSearch.ts')
    await callback(resolver.resolveFormAwareMovePool, search.searchMoves)
  } finally { await server.close() }
}

test('the pinned game source supports Aqua Jet in both exact Starmie forms', () => {
  assert.equal(snapshot.moves['453'].appName, '아쿠아제트')
  assert.equal(snapshot.moves['453'].type, 'water')
  for (const [key, id] of [['starmie', '0121000'], ['mega-starmie', '0121001']]) {
    assert.equal(snapshot.forms[key].primaryId, id)
    assert.ok(snapshot.forms[key].moves.includes(453), key)
  }
})

test('the actual battle pool resolves Aqua Jet for Starmie and Mega without broadening unrelated forms', async () => withMoveModules(async resolve => {
  for (const [key, related] of [['starmie', ['starmie']], ['mega-starmie', ['mega-starmie', 'starmie']]]) {
    const moves = resolve(key, related, pools)
    assert.equal(moves.filter(move => move.name === '아쿠아제트').length, 1, key)
    assert.equal(moves.find(move => move.name === '아쿠아제트')?.type, 'water')
    assert.ok(moves.some(move => move.name === '냉동빔'), 'preserve old pool')
  }
  assert.equal(resolve('rotom', ['rotom'], pools).some(move => move.name === '아쿠아제트'), false)
  assert.match(app, /resolveFormAwareMovePool\(key, relatedMovePoolKeys\(key\), embeddedMovePools\)/)
}))

test('the actual move search finds full name and 아젯 only inside the selected battle pool', async () => withMoveModules(async (resolve, search) => {
  const mega = resolve('mega-starmie', ['mega-starmie', 'starmie'], pools)
  for (const query of ['아쿠아제트', '아젯']) {
    assert.equal(search(mega, query, { allowLoose: false })[0]?.name, '아쿠아제트', query)
    assert.deepEqual(search(resolve('rotom', ['rotom'], pools), query, { allowLoose: false }), [], query)
  }
  assert.match(app, /filterMoveOptions\(draft, pool\)/)
}))

test('selected Aqua Jet crosses the real calculation eligibility gate with water physical 40 and priority +1', () => {
  const meta = metaByName['아쿠아제트']
  assert.deepEqual({ type: meta.type, category: meta.category, power: meta.power, priority: meta.priority }, { type: 'water', category: 'physical', power: 40, priority: 1 })
  assert.equal(quickMoveSupported('아쿠아제트', meta), true)
  assert.match(app, /pool\.some\(option => option\.name === name\) \? resolveMoveMeta\(name, pool, poolMap\) : null/)
  assert.match(app, /quickMoveSupported\(name, base, Boolean\(CONDITIONAL_MOVE_POWER_RULES\[name\]\)\)/)
  assert.match(app, /calcDamage\(foulPlay \? \{ \.\.\.sourceStats, attack: targetStats\.attack \} : sourceStats, targetStats, meta\.power/)
})
