import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { quickMoveSupported, quickMoveSuggestions, restoreQuickMoves } from '../src/quickDamageState.ts'

const readJson = name => JSON.parse(readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8'))
const pools = readJson('championsMovePools.json')
const game = readJson('dexGameLearnsets.json')
const moveIndex = readJson('dexGameMoveIndex.json')
const learnedMeta = readJson('championsLearnedMoveMeta.json')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const omittedForms = [['azumarill', '0184000'], ['golisopod', '0768000'], ['mega-golisopod', '0768001']]
const sourceLearners = [
  'azumarill', 'basculegion', 'basculegion-female', 'beartic', 'blastoise', 'clawitzer',
  'dragonite', 'empoleon', 'feraligatr', 'golisopod', 'inteleon', 'mega-blastoise',
  'mega-dragonite', 'mega-feraligatr', 'mega-golisopod', 'mega-sharpedo', 'mega-starmie',
  'overqwil', 'palafin', 'primarina', 'quaquaval', 'qwilfish', 'samurott',
  'samurott-hisui', 'sharpedo', 'starmie',
]

async function withResolver(callback) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { resolveFormAwareMovePool } = await server.ssrLoadModule('/src/formAwareMovePool.ts')
    await callback(resolveFormAwareMovePool)
  } finally { await server.close() }
}

test('pinned exact missing game forms learn enabled Aqua Jet (move 453)', () => {
  for (const [key, id] of omittedForms) {
    assert.equal(game.forms[key].primaryId, id)
    assert.ok(game.forms[key].moves.includes(453), key)
  }
  assert.deepEqual({ id: moveIndex['아쿠아제트'].id, type: moveIndex['아쿠아제트'].type }, { id: 453, type: 'water' })
  assert.deepEqual({ name: game.moves['453'].appName, type: game.moves['453'].type }, { name: '아쿠아제트', type: 'water' })
})

test('all 26 pinned Aqua Jet learner forms have the direct battle move and actual resolver eligibility', async () => withResolver(resolve => {
  const actualSourceLearners = Object.entries(game.forms)
    .filter(([, form]) => form.moves.includes(453))
    .map(([key]) => key).sort()
  assert.deepEqual(actualSourceLearners, sourceLearners)
  for (const key of sourceLearners) {
    assert.ok(pools[key], `battle pool missing for ${key}`)
    const related = key === 'mega-golisopod' ? [key, 'golisopod'] : [key]
    const actual = resolve(key, related, pools).filter(move => move.name === '아쿠아제트')
    assert.deepEqual(actual, [{ name: '아쿠아제트', type: 'water' }], key)
    assert.deepEqual(pools[key].filter(move => move.name === '아쿠아제트'), actual, `${key} direct battle pool`)
  }
}))

test('actual battle resolver includes Aqua Jet once for Azumarill, preserving the rest of its pool', async () => withResolver(resolve => {
  const moves = resolve('azumarill', ['azumarill'], pools)
  assert.deepEqual(moves.filter(move => move.name === '아쿠아제트'), [{ name: '아쿠아제트', type: 'water' }])
  assert.ok(moves.some(move => move.name === '아쿠아브레이크'))
  assert.equal(moves.length, pools.azumarill.length)
  assert.equal(resolve('rotom', ['rotom'], pools).some(move => move.name === '아쿠아제트'), false)
  assert.match(app, /resolveFormAwareMovePool\(key, relatedMovePoolKeys\(key\), embeddedMovePools\)/)
}))

test('real move picker finds Azumarill Aqua Jet with full name and 아젯, but not for unrelated forms', async () => withResolver(resolve => {
  const azumarill = resolve('azumarill', ['azumarill'], pools)
  const rotom = resolve('rotom', ['rotom'], pools)
  for (const query of ['아쿠아제트', '아젯']) {
    assert.equal(quickMoveSuggestions(query, azumarill)[0]?.name, '아쿠아제트', query)
    assert.deepEqual(quickMoveSuggestions(query, rotom), [], query)
  }
  assert.match(app, /filterMoveOptions\(draft, pool\)/)
}))

test('selected Aqua Jet remains valid and passes the actual physical-damage support gate', async () => withResolver(resolve => {
  const moves = resolve('azumarill', ['azumarill'], pools)
  assert.equal(restoreQuickMoves(['아쿠아제트'], null, moves)[0], '아쿠아제트')
  const meta = learnedMeta['아쿠아제트']
  assert.deepEqual({ type: meta.type, category: meta.category, power: meta.power, priority: meta.priority }, { type: 'water', category: 'physical', power: 40, priority: 1 })
  assert.equal(quickMoveSupported('아쿠아제트', meta), true)
  assert.match(app, /pool\.some\(option => option\.name === name\) \? resolveMoveMeta\(name, pool, poolMap\) : null/)
  assert.match(app, /quickMoveSupported\(name, base, Boolean\(CONDITIONAL_MOVE_POWER_RULES\[name\]\)\)/)
}))
