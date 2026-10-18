import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'

const data = JSON.parse(readFileSync(new URL('../src/dexGameLearnsets.json', import.meta.url), 'utf8'))
const mapping = JSON.parse(readFileSync(new URL('../scripts/dex_game_primary_key_map.json', import.meta.url), 'utf8'))
const ids = key => data.forms[key].moves

test('pinned source and exhaustive mapped roster preserve exact form identity', () => {
  assert.equal(data.source.commit, '50e7233b78c3b81df29563f9695386c28e77fc95')
  assert.equal(data.source.date, '2026-09-09')
  assert.equal(Object.keys(data.forms).length, 339)
  assert.deepEqual(Object.keys(data.forms).sort(),Object.keys(mapping).sort())
  assert.ok(Object.entries(mapping).every(([key, evidence]) => data.forms[key].primaryId === evidence.primaryId))
  assert.equal(data.source.sha256['masterdata/waza_learn.json'],'fa40af93a85ad57b7308332e498437bed35be42c526a237b02f0af314e766b1a')
  assert.equal(data.source.sha256['masterdata/waza.json'],'f6bfc143b78410ead2d69bebf52dff7ddbed9bb08bfaf7fd0ca2d28f21838ffa')
  assert.deepEqual(Object.keys(data.unresolved).sort(), ['mega-meowstic','tauros-paldean'])
  assert.equal(new Set(Object.values(data.forms).flatMap(form => form.moves)).size, 510)
  assert.equal(data.forms.rotom.primaryId, '0479000')
  assert.equal(data.forms['rotom-heat'].primaryId, '0479001')
  assert.equal(data.forms['rotom-wash'].primaryId, '0479002')
  assert.equal(data.forms['mega-lucario-z'].primaryId, '0448002')
  assert.equal(ids('rotom').length,42)
  assert.equal(ids('rotom-heat').length,43)
  assert.equal(ids('rotom-wash').length,43)
  assert.equal(ids('mega-lucario-z').length,83)
  assert.equal(ids('samurott-hisui').length,68)
  assert.ok(ids('rotom-heat').includes(315))
  assert.ok(!ids('rotom').includes(315))
  assert.ok(ids('rotom-wash').includes(56))
  assert.ok(!ids('rotom-heat').includes(56))
  assert.ok(!ids('rotom').includes(5))
  assert.ok(!ids('rotom').includes(17))
  assert.ok(Object.values(data.forms).every(form => form.moves.every(id => data.moves[id])))
})

test('loader projects all moves including status and four source spelling discrepancies without guessed aliases', async () => {
  const server = await createServer({ server:{ middlewareMode:true }, appType:'custom', logLevel:'silent' })
  try {
    const {loadDexGameLearnset} = await server.ssrLoadModule('/src/dexGameLearnsets.ts')
    const result = await loadDexGameLearnset('rotom-wash')
    assert.equal(result.status,'ready')
    assert.equal(result.provenance.kind,'game-snapshot')
    assert.equal(result.provenance.date,'2026-09-09')
    assert.equal(result.moves.length,43)
    assert.ok(result.moves.some(move => move.name==='하이드로펌프'))
    const out = await loadDexGameLearnset('mega-lucario-z')
    assert.equal(out.moves.length,83)
    assert.ok(out.moves.some(move => data.moves[280].appName === move.name))
    assert.equal(data.moves[280].sourceKo,'깨트리기')
    assert.equal(data.moves[280].appName,'깨트리다')
    assert.equal(data.moves[747].appName,'볼가득넣기')
    assert.equal(data.moves[747].type,'normal')
    assert.ok(out.moves.some(move => move.name==='칼춤'))
  } finally { await server.close() }
})

test('ambiguous or unknown forms never inherit base moves or masquerade as ready empty', async () => {
  const server = await createServer({ server:{ middlewareMode:true }, appType:'custom', logLevel:'silent' })
  try {
    const {loadDexGameLearnset} = await server.ssrLoadModule('/src/dexGameLearnsets.ts')
    for (const key of ['mega-meowstic','tauros-paldean']) {
      const result = await loadDexGameLearnset(key)
      assert.equal(result.status,'missing')
      assert.deepEqual(result.moves,[])
      assert.equal(result.provenance.reason,'ambiguous-form')
    }
    const unknown = await loadDexGameLearnset('rotom-invented')
    assert.equal(unknown.status,'missing')
    assert.deepEqual(unknown.moves,[])
    assert.equal(unknown.provenance.reason,'not-recorded')
  } finally { await server.close() }
})
