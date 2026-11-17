import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const usage = JSON.parse(readFileSync(new URL('../src/canonical-data/champions/championsUsageTopMoves.json', import.meta.url), 'utf8'))
const moveIndex = JSON.parse(readFileSync(new URL('../src/canonical-data/champions/dexGameMoveIndex.json', import.meta.url), 'utf8'))
const moveMetaReport = JSON.parse(readFileSync(new URL('../reports/championsMoveMetaReport.json', import.meta.url), 'utf8'))
const pokeApiMoveDetails = JSON.parse(readFileSync(new URL('../reports/pokeapiMoveDetailsCache.json', import.meta.url), 'utf8'))
const builderSource = readFileSync(new URL('../scripts/build-champions-usage-top-moves.mjs', import.meta.url), 'utf8')

const legacyMoveNames = [
  '앵콜', '속이다', '바톤터치', '락블레스트', '얼다바람', '태만함', '머드숏', '기관총', '메가폰',
  '달의불빛', '뒀다쓰기', '벌레먹음', '브레이즈킥', '드래곤크루', '레이징볼', '블러스트번', '우드호른',
]

test('usage builder resolves Japanese names to the pinned canonical move before legacy PokeAPI Korean text', () => {
  const canonicalNames = new Set(Object.keys(moveIndex))
  const canonicalByApiName = new Map(moveMetaReport.generatedMoves
    .filter(entry => entry.apiName && canonicalNames.has(entry.moveName))
    .map(entry => [entry.apiName, entry.moveName]))
  assert.equal(canonicalByApiName.get('first-impression'), '만나자마자')
  assert.equal(canonicalByApiName.get('upper-hand'), '기선제압')
  assert.equal(pokeApiMoveDetails['first-impression'].names.ja, 'であいがしら')
  assert.equal(pokeApiMoveDetails['upper-hand'].names.ja, 'はやてがえし')

  assert.match(builderSource, /import dexGameMoveIndex from/)
  assert.match(builderSource, /canonicalMoveNameByApiName\.get\(apiName\) \?\? entry\.ko \?\? entry\.moveName/)
  assert.match(builderSource, /'ねこだまし': '속이기'/)
  assert.match(builderSource, /'であいがしら': '만나자마자'/)
  assert.doesNotMatch(builderSource, /'ねこだまし': '속이다'/)
  assert.doesNotMatch(builderSource, /'であいがしら': '기선제압'/)
})

test('stored usage recommendations use canonical names without conflating First Impression and Upper Hand', () => {
  const allMoves = Object.values(usage).flatMap(entry => entry.moves)
  for (const legacyName of legacyMoveNames) assert.equal(allMoves.includes(legacyName), false, legacyName)
  for (const name of allMoves) assert.ok(Object.hasOwn(moveIndex, name), `${name} is outside the pinned canonical move index`)

  for (const key of ['ariados', 'falinks', 'mega-falinks']) {
    assert.ok(usage[key].moves.includes('만나자마자'), key)
    assert.equal(usage[key].moves.includes('기선제압'), false, key)
  }
  assert.equal(moveIndex['만나자마자'].id, 660)
  assert.equal(moveIndex['기선제압'].id, 918)
})

test('every ready-form usage recommendation passes the shared gate except the reviewed Archaludon conflict', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { loadFormLearnset, resolveEligibleMoveInput } = await server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts')
    const rejected = []
    for (const [key, entry] of Object.entries(usage)) {
      const pool = await loadFormLearnset(key)
      for (const name of entry.moves) {
        if (!resolveEligibleMoveInput(name, pool)) rejected.push(`${key}:${name}`)
      }
    }

    const expected = [
      ...usage['tauros-paldean'].moves.map(name => `tauros-paldean:${name}`),
      'archaludon:미러코트',
    ]
    assert.deepEqual(rejected.sort(), expected.sort())

    const taurosPool = await loadFormLearnset('tauros-paldean')
    assert.equal(taurosPool.status, 'missing')
    assert.equal(taurosPool.provenance.reason, 'ambiguous-form')
    const archaludonPool = await loadFormLearnset('archaludon')
    assert.equal(archaludonPool.status, 'ready-verified')
    assert.equal(resolveEligibleMoveInput('미러코트', archaludonPool), null)
  } finally {
    await server.close()
  }
})
