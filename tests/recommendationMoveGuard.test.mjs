import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const names = ['applyMoveToSlot', 'selectMoveOption', 'commitEditorMove', 'selectSampleMoveOption', 'applySampleCandidateMove', 'addOpponentRevealedMove']
const declarations = new Map()
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name && names.includes(node.name.getText(ast))) declarations.set(node.name.getText(ast), node.getText(ast))
  ts.forEachChild(node, visit)
}
visit(ast)
assert.deepEqual([...declarations.keys()].sort(), [...names].sort())
const callbacks = ts.transpileModule(declarations.values().toArray().map(declaration => `const ${declaration};`).join('\n') + '\nglobalThis.handlers = { ' + names.join(', ') + ' }', { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText

async function fixture(key, initial) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const provider = await server.ssrLoadModule('/src/sharedLearnsets.ts')
    const pool = await provider.loadFormLearnset(key)
    const state = { party: { [key]: [...initial] }, sample: [...initial], opponents: [{ key, revealedMoves: [...initial.filter(Boolean)] }], notice: null, draft: null, focus: null }
    const set = field => update => { state[field] = typeof update === 'function' ? update(state[field]) : update }
    const context = vm.createContext({
      ...provider, movePoolByKey: { [key]: pool }, sampleMovePool: pool, sampleForge: { key }, sampleRegisteredMoves: [...initial],
      confirmedMovesByKey: state.party, setConfirmedMovesByKey: set('party'), setSampleLockedMoves: set('sample'),
      setMoveCommitNotice: set('notice'), setMoveInputDraft: set('draft'), setActiveMoveField: set('focus'),
      setConfirmedMoveSlot: (owner, slot, value) => { const next = [...state.party[owner]]; next[slot] = value; state.party = { ...state.party, [owner]: next } },
      normalizeMoveSlots: moves => [...moves, ...Array(4).fill('')].slice(0, 4),
      nextOpenSampleSlot: () => null, focusSampleSlot: slot => { state.focus = slot },
      oppMember: state.opponents[0], oppMovePool: pool, selectedOpp: 0, opponents: state.opponents, setOpponents: set('opponents'), setOpponentMoveNotice: set('opponentNotice'),
    })
    vm.runInContext(callbacks, context)
    return { state, pool, handlers: context.handlers, key, close: () => server.close() }
  } catch (error) { await server.close(); throw error }
}

const slots = values => [...values]

test('Party recommendation cannot overwrite a recorded move with an outside-snapshot candidate', async () => {
  const f = await fixture('ninetales-alolan', ['오래된 원문', '', '아쿠아제트', ''])
  try {
    const original = slots(f.state.party[f.key])
    f.handlers.applyMoveToSlot(f.key, '화염방사', 0)
    assert.deepEqual(f.state.party[f.key], original)
    assert.deepEqual({ ...f.state.notice }, { key: f.key, slotIdx: 0, scope: 'party' })
  } finally { await f.close() }
})

test('Builder curated candidate cannot replace recorded raw slot with unrecognized recommendation', async () => {
  const f = await fixture('mega-lopunny', ['이전 기록', '', '', ''])
  try {
    f.handlers.applySampleCandidateMove('속이다', 0)
    assert.deepEqual(f.state.sample, ['이전 기록', '', '', ''])
    assert.deepEqual({ ...f.state.notice }, { key: f.key, slotIdx: 0, scope: 'sample' })
  } finally { await f.close() }
})

test('all explicit choices share source identity gate; valid learned Aqua Jet enters selected slot', async () => {
  const f = await fixture('starmie', ['이전 기록', '', '', ''])
  try {
    f.handlers.applyMoveToSlot(f.key, '아쿠아제트', 2)
    assert.equal(f.state.party[f.key][2], '아쿠아제트')
    f.handlers.applySampleCandidateMove('아쿠아제트', 1)
    assert.equal(f.state.sample[1], '아쿠아제트')
    f.handlers.selectMoveOption(f.key, 0, '화염방사')
    assert.equal(f.state.party[f.key][0], '이전 기록')
    f.handlers.selectSampleMoveOption(0, '화염방사')
    assert.equal(f.state.sample[0], '이전 기록')
    f.handlers.selectMoveOption(f.key, 0, '이전 기록')
    assert.equal(f.state.party[f.key][0], '이전 기록')
  } finally { await f.close() }
})

test('opponent usage and picker callback cannot add unverified move while retaining revealed history', async () => {
  const f = await fixture('ninetales-alolan', ['오래된 원문', '', '', ''])
  try {
    assert.equal(f.handlers.addOpponentRevealedMove('화염방사'), false)
    assert.deepEqual(f.state.opponents[0].revealedMoves, ['오래된 원문'])
    assert.equal(f.handlers.addOpponentRevealedMove(f.pool.moves[0].name), true)
    assert.deepEqual([...f.state.opponents[0].revealedMoves], ['오래된 원문', f.pool.moves[0].name])
  } finally { await f.close() }
})

test('suggestion chips are unavailable with a visible reason unless exact-form source authorizes move', () => {
  const party = source.slice(source.indexOf('memberTopSuggestedMoves.map((move)'), source.indexOf('</div> : null}', source.indexOf('memberTopSuggestedMoves.map((move)')))
  const builder = source.slice(source.indexOf('sampleVisibleMoveBuckets.map((bucket)'), source.indexOf('</div> : sampleMovePool', source.indexOf('sampleVisibleMoveBuckets.map((bucket)')))
  const oppEntry = source.slice(source.indexOf('oppTopSuggestedMoves.map((move)'), source.indexOf('</details> : null}', source.indexOf('oppTopSuggestedMoves.map((move)')))
  const oppDamage = source.slice(source.lastIndexOf('oppTopSuggestedMoves.map((move)'), source.indexOf('</details> : null}', source.lastIndexOf('oppTopSuggestedMoves.map((move)')))
  for (const section of [party, builder, oppEntry, oppDamage]) {
    assert.match(section, /disabled=\{[^}]+\}/)
    assert.match(section, /title=\{[^}]+\}/)
    assert.match(section, /aria-label=\{[^}]+\}/)
    assert.match(section, /resolveEligibleMoveInput\(move,/)
  }
  assert.equal((builder.match(/onClick=\{\(\) => applySampleCandidateMove\(move,/g) ?? []).length, 2)
})

test('pending, missing and failed pools reject recommendations, while an evidenced alias normalizes only on explicit choice', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { resolveEligibleMoveInput, loadFormLearnset, commitRecordedMoveInput } = await server.ssrLoadModule('/src/sharedLearnsets.ts')
    const pool = await loadFormLearnset('mega-lopunny')
    assert.equal(resolveEligibleMoveInput('속이다', pool), null)
    assert.equal(resolveEligibleMoveInput('로우킥', pool), '안다리걸기')
    for (const status of ['loading', 'missing', 'load-error', 'legacy-unverified']) {
      assert.equal(resolveEligibleMoveInput('안다리걸기', { status, moves: pool.moves }), null, status)
    }
    assert.equal(commitRecordedMoveInput('로우킥', '로우킥', pool), '로우킥')
    assert.equal(commitRecordedMoveInput('', '로우킥', undefined), '')
  } finally { await server.close() }
})
