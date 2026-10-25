import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
const snapshot = JSON.parse(readFileSync(new URL('../src/dexGameLearnsets.json', import.meta.url)))
const app = () => readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

async function provider(fn) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try { return await fn(await server.ssrLoadModule('/src/sharedLearnsets.ts')) } finally { await server.close() }
}

test('all mapped forms return exact canonical IDs and reverse the same source, including sparse metadata', async () => provider(async ({ loadFormLearnset, loadMoveLearners }) => {
  assert.equal(Object.keys(snapshot.forms).length, 339)
  for (const [key, form] of Object.entries(snapshot.forms)) {
    const result = await loadFormLearnset(key)
    assert.equal(result.status, 'ready-verified', key)
    assert.equal(result.primaryId, form.primaryId, key)
    assert.deepEqual(result.moveIds, form.moves, key)
    assert.deepEqual(result.moves.map(move => move.name), form.moves.map(id => snapshot.moves[id].appName), key)
  }
  for (const [id, move] of Object.entries(snapshot.moves)) {
    const actual = await loadMoveLearners(move.appName)
    assert.equal(actual.status, 'ready-verified', id)
    assert.deepEqual(actual.keys.sort(), Object.entries(snapshot.forms).filter(([,form]) => form.moves.includes(Number(id))).map(([key]) => key).sort(), id)
  }
  assert.equal((await loadFormLearnset('ninetales-alolan')).moveIds.includes(53), false)
  assert.equal((await loadFormLearnset('gourgeist-average')).moveIds.length, 60)
  assert.equal((await loadMoveLearners('볼가득넣기')).keys.length, 4)
  assert.equal((await loadFormLearnset('ninetales-alolan')).provenance.kind, 'game-snapshot')
}))

test('unresolved forms do not inherit base pools or erase recorded moves', async () => provider(async ({ loadFormLearnset, choicesForPool }) => {
  for (const key of ['mega-meowstic', 'tauros-paldean']) {
    const result = await loadFormLearnset(key)
    assert.equal(result.status, 'missing')
    assert.deepEqual(result.moveIds, [])
    assert.deepEqual(choicesForPool(result), [])
  }
}))

test('recorded moves distinguish pending, missing, source member and outside-snapshot; metadata is independent', async () => provider(async ({ loadFormLearnset, recordedMoveSnapshotState, choicesForPool }) => {
  const verified = await loadFormLearnset('ninetales-alolan')
  assert.equal(recordedMoveSnapshotState('화염방사', verified), 'outside-snapshot')
  assert.equal(recordedMoveSnapshotState('화염방사', undefined), 'pending')
  assert.equal(recordedMoveSnapshotState('화염방사', { status: 'loading', moves: [] }), 'pending')
  assert.equal(recordedMoveSnapshotState('화염방사', { status: 'load-error', moves: [] }), 'unverified')
  assert.equal(recordedMoveSnapshotState('화염방사', await loadFormLearnset('mega-meowstic')), 'unverified')
  assert.equal(recordedMoveSnapshotState(verified.moves[0].name, verified), 'in-snapshot')
  const rare = await loadFormLearnset('mega-lucario-z')
  assert.deepEqual(choicesForPool(rare), rare.moves)
  assert.ok(Object.values(snapshot.forms).filter(form => form.moves.includes(747)).length === 4)
}))

test('all four battle choices and both Dex directions use the canonical provider, not recommendations as eligibility', () => {
  const source = app()
  assert.match(source, /loadFormLearnset\(key\)/)
  assert.match(source, /loadMoveLearners\(dexSelectedMoveName\)/)
  assert.match(source, /loadFormLearnset\(key\)\.then/)
  assert.doesNotMatch(source, /embeddedMovePoolForKey\(key\)/)
  assert.doesNotMatch(source, /(?:my|opp|sample|member)MovePool\?\.moves\?\.length\s*\?[^\n]+moveOptionsForEntry/)
  assert.match(source, /choicesForPool\(memberMovePool\)/)
  assert.match(source, /choicesForPool\(sampleMovePool\)/)
  assert.match(source, /choicesForPool\(myMovePool\)/)
  assert.match(source, /choicesForPool\(oppMovePool\)/)
  assert.match(source, /choicesForPool\(pools\[entry\.key\]\)/)
})

test('legacy recorded four move slots remain intact independent of source pool', async () => {
  const { restoreQuickMoves } = await import('../src/quickDamageState.ts')
  const recorded = ['구 기록', '', '아쿠아제트', '볼가득넣기']
  assert.deepEqual(restoreQuickMoves(recorded, '', []), recorded)
  assert.deepEqual(restoreQuickMoves(undefined, '구 기록', []), ['구 기록', '', '', ''])
})

test('recorded Low Kick alias shares Mega Lopunny snapshot identity and reverse learners without rewriting it', async () => provider(async ({ loadFormLearnset, loadMoveLearners, recordedMoveSnapshotState, moveInPool }) => {
  const original = ['로우킥', '', '테라버스트', '모르는 기술']
  const pool = await loadFormLearnset('mega-lopunny')
  assert.equal(pool.status, 'ready-verified')
  assert.ok(pool.moves.some(move => move.name === '안다리걸기'))
  assert.equal(recordedMoveSnapshotState(original[0], pool), 'in-snapshot')
  assert.equal(moveInPool(original[0], pool.moves), true)
  assert.deepEqual(await loadMoveLearners(original[0]), await loadMoveLearners('안다리걸기'))
  assert.equal(recordedMoveSnapshotState(original[2], pool), 'outside-snapshot')
  assert.equal(moveInPool(original[3], pool.moves), false)
  const { restoreQuickMoves } = await import('../src/quickDamageState.ts')
  assert.deepEqual(restoreQuickMoves(original, '', pool.moves), original)
}))

test('evidenced aliases resolve to the same source identity in either direction without rewriting raw history', async () => provider(async ({ loadFormLearnset, loadMoveLearners, recordedMoveSnapshotState, moveInPool }) => {
  const pool = await loadFormLearnset('garchomp')
  assert.equal(recordedMoveSnapshotState('섀도크루', pool), 'in-snapshot')
  assert.equal(moveInPool('섀도크루', pool.moves), true)
  assert.deepEqual(await loadMoveLearners('섀도크루'), await loadMoveLearners('섀도클로'))
  const aliases = JSON.parse(readFileSync(new URL('../src/championsMoveMetaNameAliases.json', import.meta.url)))
  const index = JSON.parse(readFileSync(new URL('../src/dexGameMoveIndex.json', import.meta.url)))
  for (const [left, right] of Object.entries(aliases)) {
    const canonical = index[left] ? left : index[right] ? right : null
    if (!canonical) continue
    assert.deepEqual(await loadMoveLearners(left), await loadMoveLearners(canonical), left)
    assert.deepEqual(await loadMoveLearners(right), await loadMoveLearners(canonical), right)
  }
  const { restoreQuickMoves } = await import('../src/quickDamageState.ts')
  assert.deepEqual(restoreQuickMoves(['섀도크루', '', '옛 원문', ''], '', pool.moves), ['섀도크루', '', '옛 원문', ''])
}))

test('Quick calculator gates a recorded alias through shared pool identity', () => {
  assert.match(app(), /moveInPool\(name, pool\)\s*\?\s*resolveMoveMeta\(name, pool, poolMap\)/)
})

test('new editor text requires exact form evidence while unchanged raw history and explicit clear survive', async () => provider(async ({ loadFormLearnset, commitRecordedMoveInput }) => {
  const verified = await loadFormLearnset('ninetales-alolan')
  const unverified = await loadFormLearnset('tauros-paldean')
  assert.equal(commitRecordedMoveInput('화염방사', '', verified), '')
  assert.equal(commitRecordedMoveInput('화염방사', '기존 원문', verified), '기존 원문')
  assert.equal(commitRecordedMoveInput('기존 원문', '기존 원문', verified), '기존 원문')
  assert.equal(commitRecordedMoveInput('', '기존 원문', verified), '')
  assert.equal(commitRecordedMoveInput('인파이트', '', unverified), '')
  assert.equal(commitRecordedMoveInput('인파이트', '기존 원문', undefined), '기존 원문')
  assert.equal(commitRecordedMoveInput(verified.moves[0].name, '', verified), verified.moves[0].name)
  const lopunny = await loadFormLearnset('mega-lopunny')
  assert.equal(commitRecordedMoveInput('로우킥', '', lopunny), '안다리걸기')
}))

test('Party and Builder edit drafts are not persisted until validated at commit', () => {
  const source = app()
  assert.match(source, /commitRecordedMoveInput\(raw, previous, pool\)/)
  assert.match(source, /commitEditorMove\(e\.target\.value, move, memberMovePool/)
  assert.match(source, /commitEditorMove\(e\.target\.value, move, sampleMovePool/)
  assert.doesNotMatch(source, /setConfirmedMoveSlot\(member\.key, moveIdx, e\.target\.value\)/)
  assert.doesNotMatch(source, /current\[moveIdx\] = e\.target\.value/)
})
