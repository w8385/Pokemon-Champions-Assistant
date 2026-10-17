import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { analyzePartyMatchups } from '../src/partyAnalysis.ts'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const literal = source.match(/const typeChart: Record<[^\n]+ = (\{[\s\S]*?\n\})\n\nconst normalizedTypeChart/)
assert.ok(literal)
const canonical = vm.runInNewContext(`(${literal[1]})`)
const chart = Object.fromEntries(Object.entries(canonical).map(([attack, targets]) => [attack.toLowerCase(), Object.fromEntries(Object.entries(targets).map(([target, multiplier]) => [target.toLowerCase(), multiplier]))]))
const member = (key, slot, types, ability = '', moves = []) => ({ key, name: key, slot, types, ability, moves })
const move = (name, type, category = 'special') => ({ name, type, category })
const members = [member('rotom', 0, ['electric', 'ghost'], 'levitate', [move('10만볼트', 'electric')]), member('dragon', 2, ['dragon', 'flying'], '', [move('프리즈드라이', 'ice')]), member('dragon', 5, ['dragon', 'flying'], '', [move('파멸의빛', 'fairy')])]
const analyze = entries => analyzePartyMatchups(entries, chart)
const row = (analysis, type, kind) => analysis[kind].find(entry => entry.type === type)

test('pure matchup cells preserve actual slots, abilities, dual types and best verified attacks', () => {
  const analysis = analyze(members)
  assert.equal(analysis.defense.length, 18)
  assert.equal(row(analysis, 'ground', 'defense').members[0].multiplier, 0)
  assert.equal(row(analysis, 'ground', 'defense').members[0].abilityImmune, true)
  assert.equal(row(analysis, 'ice', 'defense').members[1].multiplier, 4)
  assert.deepEqual(row(analysis, 'water', 'offense').cells.map(cell => [cell.slot, cell.multiplier]), [[0, 2], [2, 2], [5, 1]])
  assert.equal(row(analysis, 'water', 'offense').cells[1].moves[0], '프리즈드라이')
  assert.equal(row(analysis, 'dragon', 'offense').cells[2].multiplier, 2)
  assert.equal(row(analysis, 'water', 'offense').count, 2)
  assert.equal(row(analysis, 'dragon', 'offense').count, 2)
  const noMoves = analyze([member('blank', 4, ['water'])])
  assert.equal(row(noMoves, 'water', 'offense').cells[0].multiplier, null)
  assert.equal(row(noMoves, 'water', 'offense').count, 0)
  const unknown = analyze([member('unknown', 4, ['water'], '', [move('미확인기', null)])])
  assert.equal(row(unknown, 'water', 'offense').cells[0].multiplier, null)
  assert.equal(row(unknown, 'water', 'offense').cells[0].incomplete, true)
  const partial = analyze([member('partial', 0, ['water'], '', [move('얼음기술', 'ice'), move('미확인기', null)])])
  assert.equal(row(partial, 'fire', 'offense').resistCount, 0, 'unverified move prevents definitive resisted total')
  assert.ok(unknown.warnings.some(message => message.includes('미확인기')))
  const updated = analyze([member('blank', 4, ['water'], '', [move('파멸의빛', 'fairy')])])
  assert.equal(row(updated, 'dragon', 'offense').cells[0].multiplier, 2)
  assert.equal(row(updated, 'dragon', 'offense').count, 1)
})

let server, Panel
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/PartyAnalysisPanel.tsx')).PartyAnalysisPanel })
test.after(async () => { await server?.close() })
test('SSR renders two semantic 18-row tables, six fixed slot headings and numeric cells', () => {
  const html = renderToStaticMarkup(React.createElement(Panel, { analysis: analyze(members), language: 'ko', loading: false }))
  assert.equal((html.match(/<table\b/g) ?? []).length, 2)
  assert.equal((html.match(/<tbody>/g) ?? []).length, 2)
  assert.equal((html.match(/<tr\b/g) ?? []).length, 40)
  assert.equal((html.match(/scope="row"/g) ?? []).length, 36)
  assert.equal((html.match(/scope="col"/g) ?? []).length, 18)
  assert.match(html, /4×/)
  assert.match(html, /0×/)
  assert.match(html, /특성/)
  assert.match(html, /프리즈드라이/)
  assert.match(html, /파멸의빛/)
  assert.match(html, /2×/)
  assert.match(html, /빈 슬롯/)
  assert.match(html, /<caption>.*?등록 공격기/)
  assert.match(html, /약점공략/)
  assert.match(html, /scope="colgroup"/)
  const unknownHtml = renderToStaticMarkup(React.createElement(Panel, { analysis: analyze([member('unknown', 4, ['water'], '', [move('미확인기', null)])]), language: 'ko', loading: false }))
  assert.match(unknownHtml, /확인되지 않은 기술/)
  assert.match(unknownHtml, />\?</)
  const emptyHtml = renderToStaticMarkup(React.createElement(Panel, { analysis: analyze([member('no-attacks', 4, ['water'])]), language: 'ko', loading: false }))
  assert.match(emptyHtml, /<td class="party-analysis-total">—<\/td><td class="party-analysis-total"[^>]*>—<\/td>/)
})

test('selected partial and loading offense details retain the matrix uncertainty markers', () => {
  const originalUseState = React.useState
  React.useState = () => ['offense:fire:0', () => {}]
  try {
    const analysis = analyze([member('partial', 0, ['water'], '', [move('냉동빔', 'ice'), move('미확인기', null)])])
    const html = renderToStaticMarkup(React.createElement(Panel, { analysis, language: 'ko', loading: false }))
    const detail = html.slice(html.indexOf('class="party-analysis-detail"'))
    assert.ok(detail.includes('partial · ≥0.5×'), 'selected detail must not turn the known lower bound into an exact value')
    assert.ok(detail.includes('미확인') || detail.includes('확인된 기술 기준'), 'partial details retain an explanation')
    const loadingHtml = renderToStaticMarkup(React.createElement(Panel, { analysis, language: 'ko', loading: true }))
    const offense = loadingHtml.slice(loadingHtml.indexOf('<caption>등록 공격기'))
    assert.match(offense, /<span>\?<\/span>/)
    const pendingDetail = loadingHtml.slice(loadingHtml.indexOf('class="party-analysis-detail"'))
    assert.ok(pendingDetail.includes('partial · ?') && pendingDetail.includes('불러오는 중'))
  } finally {
    React.useState = originalUseState
  }
})
