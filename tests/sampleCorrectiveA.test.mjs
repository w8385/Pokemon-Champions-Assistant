import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import React, { act } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import { fixedSampleOpponentMoves, replaceSampleOpponentMove, sampleDamageMoveGate } from '../src/sampleDamageMoves.ts'

import { validateBackup } from '../src/backupValidation.ts'
const ts = createRequire(import.meta.url)('typescript')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

const source = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const sanitizer = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'sanitizeSampleDamageTargets')
assert.ok(sanitizer)
const sample = { key: 'starmie', item: '', ability: '', notes: '', revealedMoves: [], natureBoost: false, scarf: false, speedStage: 0, picked: false, hpEv: 0, defenseEv: 0, spDefenseEv: 0, speedEv: 0, defenseNature: 1, spDefenseNature: 1, moveName: 'historic-forward', opponentMoveName: '', attackEv: 0, spAttackEv: 0, attackNature: 1, spAttackNature: 1, reverseAttackStage: 0, reverseDefenseStage: 0, reverseBurned: false, reverseReflect: false, reverseLightScreen: false, reverseAuroraVeil: false, reverseDefenderFullHp: true }
const env = { defaultSampleDamageTargets: [], indexByKey: new Map([['starmie', {}]]), CHAMPIONS_EFFORT_PER_STAT_CAP: 32, clampNonNegativeInt: (value, cap) => Math.max(0, Math.min(cap, Math.trunc(Number(value) || 0))), clampSpeedStage: value => Math.max(-2, Math.min(2, Number(value) || 0)), fixedSampleOpponentMoves, replaceSampleOpponentMove }
vm.runInNewContext(ts.transpileModule(`${sanitizer.getText(source)}\nglobalThis.hydrate = sanitizeSampleDamageTargets`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, env)
const hydrate = record => env.hydrate([record])[0]
const backup = record => ({ version: 1, party: [], opponents: [], sampleDamageTargets: [record] })
const snapshot = value => JSON.parse(JSON.stringify(value))

test('actual hydration + actual selection callback keep positional four slots through export/import', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
  const { resolveEligibleMoveInput, loadFormLearnset } = await server.ssrLoadModule('/src/sharedLearnsets.ts')
  const callback = app.match(/const selectSampleOpponentMove = \(idx: number, slot: number, move: string\) => \{[\s\S]*?\n  \}/)?.[0]
  assert.ok(callback, 'real App callback found')
  const pool = await loadFormLearnset('starmie')
  assert.equal(pool.status, 'ready-verified')
  assert.ok(pool.moves.some(move => move.name === '파도타기'))
  let current = [hydrate(sample)]
  const context = { ...env, resolveEligibleMoveInput, movePoolByKey: { starmie: pool }, setSampleDamageTargets: updater => { current = updater(current) }, setSampleOpponentMoveDraft: () => {} }
  vm.runInNewContext(ts.transpileModule(`${callback}\nglobalThis.select = selectSampleOpponentMove`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
  const roundtrip = () => { const exported = snapshot(backup(current[0])); const imported = validateBackup(exported); current = [hydrate(imported.sampleDamageTargets[0])]; return current[0].opponentMoves }
  assert.deepEqual(snapshot(roundtrip()), ['', '', '', ''])
  // Mount the real shared slot and send its selected candidate to the extracted
  // App callback, then read the same export/import path (not a simulated setter).
  const browser = new Window({ url: 'http://localhost/' })
  Object.assign(globalThis, { window: browser, document: browser.document, HTMLElement: browser.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
  const { createRoot } = await import('react-dom/client')
  const { RegisteredMoveSlot } = await server.ssrLoadModule('/src/PokemonCardOverview.tsx')
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  const labels = { slot: '번', category: value => value, power: '위력', accuracy: '명중', pp: 'PP', unknown: '미확인' }
  try {
    await act(async () => root.render(React.createElement(RegisteredMoveSlot, { number: 4, name: '', labels,
      search: { id: 'mounted-sample-target-move-4', options: [{ key: '파도타기', label: '파도타기' }], showAllOnEmpty: true, onSelect: option => context.select(0, 3, option.key) },
      inputProps: { placeholder: '상대 기술 검색' },
    })))
    const input = host.querySelector('input'); assert.ok(input)
    await act(async () => input.dispatchEvent(new browser.Event('focusin', { bubbles: true })))
    const option = [...host.querySelectorAll('button')].find(button => button.textContent.includes('파도타기'))
    assert.ok(option, 'real shared search exposes the source move')
    await act(async () => option.click())
    assert.deepEqual(snapshot(roundtrip()), ['', '', '', '파도타기'])
  } finally { await act(async () => root.unmount()); host.remove(); await browser.happyDOM.abort() }
  context.select(0, 3, '')
  context.select(0, 3, '파도타기')
  assert.deepEqual(snapshot(roundtrip()), ['', '', '', '파도타기'])
  context.select(0, 0, '파도타기')
  assert.deepEqual(snapshot(roundtrip()), ['파도타기', '', '', '파도타기'])
  context.select(0, 3, '')
  assert.deepEqual(snapshot(roundtrip()), ['파도타기', '', '', ''])
  context.select(0, 1, 'invalid outside source')
  assert.deepEqual(snapshot(roundtrip()), ['파도타기', '', '', ''])
  assert.equal(current[0].moveName, 'historic-forward')
  assert.deepEqual(snapshot(hydrate({ ...sample, opponentMoves: ['', ' raw unknown ', '', ''] }).opponentMoves), ['', ' raw unknown ', '', ''])
  assert.deepEqual(snapshot(hydrate({ ...sample, opponentMoves: ['only'] }).opponentMoves), ['only', '', '', ''])
  assert.deepEqual(snapshot(fixedSampleOpponentMoves([])), ['', '', '', ''])
  assert.deepEqual(snapshot(replaceSampleOpponentMove(['', 'x', '', ''], 1, '')), ['', '', '', ''])
  } finally { await server.close() }
})

test('symmetric source eligibility and mechanics support keep unknown/unsupported numbers out', () => {
  const known = { type: 'Water', category: 'special', power: 90 }
  for (const direction of ['forward', 'reverse']) {
    assert.equal(sampleDamageMoveGate('파도타기', 'ready-verified', true, known), null, direction)
    assert.equal(sampleDamageMoveGate('파도타기', 'loading', false, known), 'loading', direction)
    assert.equal(sampleDamageMoveGate('outside', 'ready-verified', false, known), 'source', direction)
    assert.equal(sampleDamageMoveGate('파도타기', 'ready-verified', true, null), 'unsupported', direction)
    assert.equal(sampleDamageMoveGate('파도타기', 'ready-verified', true, { ...known, variablePower: true }), 'unsupported', direction)
    assert.equal(sampleDamageMoveGate('파도타기', 'ready-verified', true, { ...known, variablePower: true }, true), 'unsupported', direction)
    assert.equal(sampleDamageMoveGate('객기', 'ready-verified', true, { ...known, variablePower: true }, true), null, direction)
  }
  assert.equal((app.match(/sampleDamageMoveGate\(/g) ?? []).length, 3)
  assert.doesNotMatch(app, /reverseRule \? \{ \.\.\.reverseMeta, variablePower: false \}/)
})

test('mounted actual registered editor renders four inputs and edits a slot', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { RegisteredMoveSlot } = await server.ssrLoadModule('/src/PokemonCardOverview.tsx')
    const labels = { slot: '번', category: value => value, power: '위력', accuracy: '명중', pp: 'PP', unknown: '미확인' }
    const moves = fixedSampleOpponentMoves(['', '파도타기'])
    const html = renderToStaticMarkup(React.createElement('div', null, moves.map((name, index) => React.createElement(RegisteredMoveSlot, { key: index, number: index + 1, name, labels, inputProps: { onChange: event => replaceSampleOpponentMove(moves, index, event.target.value) } }))))
    assert.equal((html.match(/<input\b/g) ?? []).length, 4)
    assert.match(html, /value="파도타기"/)
    assert.match(app, /const renderSampleMoveEditor = \(\) =>/)
    assert.equal((app.match(/\{renderSampleMoveEditor\(\)\}/g) ?? []).length, 2)
    assert.doesNotMatch(app, /scrollIntoView\([^\n]*sample-moves-card/)
  } finally { await server.close() }
})

test('multihit sample verdict uses bounds, not an invented percentage', () => {
  const verdict = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'resolveDamageVerdict')
  const noEffect = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'isNoEffectDamage')
  const code = ts.transpileModule(`${noEffect.getText(source)}\n${verdict.getText(source)}\nglobalThis.verdict=resolveDamageVerdict`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const context = { koChanceForHits: () => 0.25 }
  vm.runInNewContext(code, context)
  const damage = { min: 45, max: 55, rolls: [45,55] }
  assert.equal(context.verdict(damage, 100, 'ko', true), '최대 2타 가능 (범위만)')
  assert.equal(context.verdict(damage, 100, 'en', true), 'Possible 2HKO (range only)')
  assert.match(context.verdict(damage, 100, 'en'), /%/)
})
