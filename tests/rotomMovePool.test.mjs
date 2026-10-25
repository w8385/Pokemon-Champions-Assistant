import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const pools = JSON.parse(readFileSync(new URL('../src/championsMovePools.json', import.meta.url), 'utf8'))
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

async function withResolver(callback) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try { await callback(await server.ssrLoadModule('/src/formAwareMovePool.ts')) } finally { await server.close() }
}

test('real embedded resolver gives Wash base moves and only its verified signature', async () => withResolver(({ resolveFormAwareMovePool }) => {
  const names = resolveFormAwareMovePool('rotom-wash', ['rotom-wash'], pools).map(move => move.name)
  assert.ok(names.includes('볼트체인지'))
  assert.ok(names.includes('도깨비불'))
  assert.ok(names.includes('하이드로펌프'))
  assert.equal(names.filter(name => name === '볼트체인지').length, 1)
  for (const other of ['오버히트', '눈보라', '에어슬래시', '리프스톰']) assert.ok(!names.includes(other), other)
}))

test('every Rotom form has only its own signature; base form gains none', async () => withResolver(({ resolveFormAwareMovePool }) => {
  const signatures = { 'rotom-wash': '하이드로펌프', 'rotom-heat': '오버히트', 'rotom-frost': '눈보라', 'rotom-fan': '에어슬래시', 'rotom-mow': '리프스톰' }
  for (const key of ['rotom', ...Object.keys(signatures)]) {
    const names = resolveFormAwareMovePool(key, [key], pools).map(move => move.name)
    assert.ok(names.includes('볼트체인지'), key)
    for (const [form, signature] of Object.entries(signatures)) assert.equal(names.includes(signature), key === form, `${key}: ${signature}`)
  }
}))

test('actual move search resolves abbreviation and full name inside the eligible Wash pool', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { resolveFormAwareMovePool } = await server.ssrLoadModule('/src/formAwareMovePool.ts')
    const { searchMoves } = await server.ssrLoadModule('/src/moveSearch.ts')
    const wash = resolveFormAwareMovePool('rotom-wash', ['rotom-wash'], pools)
    const heat = resolveFormAwareMovePool('rotom-heat', ['rotom-heat'], pools)
    for (const query of ['볼체', '볼트체인지']) assert.equal(searchMoves(wash, query, { allowLoose: false })[0]?.name, '볼트체인지')
    assert.equal(searchMoves(wash, '하이드로펌프', { allowLoose: false })[0]?.name, '하이드로펌프')
    assert.deepEqual(searchMoves(heat, '하이드로펌프', { allowLoose: false }), [])
  } finally { await server.close() }
})

test('resolver does not broaden unrelated forms or invent moves for unknown keys', async () => withResolver(({ resolveFormAwareMovePool }) => {
  assert.deepEqual(resolveFormAwareMovePool('unknown-form', ['unknown-form'], pools), [])
  assert.deepEqual(resolveFormAwareMovePool('alolan-vulpix', ['alolan-vulpix'], { vulpix: [{ name: '불꽃세례', type: 'fire' }] }), [])
}))

test('battle callers select from shared source and distinguish missing from loading and failure', () => {
  assert.match(app, /choicesForPool\(memberMovePool\)/)
  assert.match(app, /choicesForPool\(sampleMovePool\)/)
  assert.match(app, /status === 'loading' \? lt\('기술풀 불러오는 중…'\)/)
  assert.match(app, /status === 'load-error' \? lt\('기술풀을 불러오지 못했습니다.'\)/)
  assert.match(app, /status === 'missing' \? lt\('기술풀 미확인'\)/)
})
