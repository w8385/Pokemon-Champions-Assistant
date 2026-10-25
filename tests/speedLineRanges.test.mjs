import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultSpeedLineState, parseSpeedLineState, writeSpeedLineState } from '../src/speedLineState.ts'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'

const roster = [
  { key: 'slow', speed: 50, name_ko: '느림', name_en: 'Slow', types: [] },
  { key: 'odd', speed: 100, name_ko: '홀수', name_en: 'Odd', types: [] },
  { key: 'mega-odd', speed: 130, name_ko: '메가홀수', name_en: 'Mega Odd', types: [] },
  { key: 'mega-absol-z', speed: 151, name_ko: 'Z메가', name_en: 'Z Mega', types: [] },
]
test('fresh reference and explicit ranges restore coverage; historical parameterized URLs remain detailed', () => {
  assert.equal(defaultSpeedLineState.view, 'ranges')
  assert.equal(parseSpeedLineState(new URLSearchParams('ref=odd')).state.view, 'ranges')
  assert.equal(parseSpeedLineState(new URLSearchParams('ref=odd&refEp=0&target=slow')).state.view, 'detail')
  const state = { ...defaultSpeedLineState, referenceKey: 'odd', view: 'ranges', referenceEffort: 0, referenceNature: 'neutral', targetKey: 'slow' }
  const params = new URLSearchParams()
  writeSpeedLineState(params, state)
  assert.equal(params.get('view'), 'ranges')
  assert.equal(params.get('refEp'), '0')
  assert.equal(params.get('refNature'), 'neutral')
  assert.deepEqual(parseSpeedLineState(params).state, state)
  const detailed = { ...state, view: 'detail' }
  writeSpeedLineState(params, detailed)
  assert.deepEqual(parseSpeedLineState(params).state, detailed)
})
let server, Panel
 test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => { await server?.close() })
const render = (patch = {}, language = 'ko') => renderToStaticMarkup(React.createElement(Panel, { rows: roster, state: { ...defaultSpeedLineState, ...patch }, onChange() {}, language, translate: x => x, displayName: x => x.name_ko }))
test('fresh individual mode selects no Scarf and renders only normal comparison rows', () => {
  const parsed = parseSpeedLineState(new URLSearchParams('view=detail&ref=odd'))
  const html = render(parsed.state)
  assert.match(html, /구애스카프<select[^>]*><option value="both">미적용·적용 모두<\/option><option value="normal" selected="">미적용<\/option>/)
  assert.match(html, /data-variant="normal"/)
  assert.doesNotMatch(html, /data-variant="scarf"/)
  const explicit = render(parseSpeedLineState(new URLSearchParams('view=detail&ref=odd&items=both')).state)
  assert.match(explicit, /data-variant="scarf"/)
})
test('default SSR shows editable effort, real current speed, next cut, four classes and an always-visible grouped table without bands', () => {
  const html = render({ referenceKey: 'odd', referenceEffort: 0, referenceNature: 'neutral', referenceStage: 6, referenceAbility: 'swift-swim', items: 'scarf', listEffort: 0, listNature: 'lower' })
  assert.match(html, /추월컷 커버리지/)
  assert.match(html, /type="range"[^>]*min="0"[^>]*max="32"/)
  assert.match(html, /type="number"[^>]*min="0"[^>]*max="32"/)
  assert.match(html, /내 현재 스피드[^]*120/)
  assert.match(html, /내 32점 최대[^]*152/)
  assert.match(html, /현재 추월 커버리지/)
  assert.match(html, /동속/)
  assert.match(html, /다음 추월컷/)
  assert.match(html, /일반 준속[^]*일반 최속[^]*스카프 준속[^]*스카프 최속/)
  assert.match(html, /새로 추월하는 대상/)
  assert.match(html, /<table class="speed-coverage-table"/)
  assert.match(html, /data-effort-start="0"/)
  assert.doesNotMatch(html, /speed-range-band|speed-range-axis|준속~최속/)
  assert.doesNotMatch(html, /목록 노력 포인트|기준 스피드 랭크|특성 효과<select/)
  assert.equal((html.match(/id="speed-line-reference-search"/g) ?? []).length, 1)
})
test('unknown or unselected reference does not substitute roster, and locale labels remain distinct', () => {
  assert.match(render(), /기준 포켓몬을 선택/)
  const html = render({ referenceKey: 'unverified' })
  assert.match(html, /unverified/)
  assert.match(html, /기준 포켓몬이 확인된 목록에 없습니다/)
  assert.doesNotMatch(html, /role="table"|현재 추월 커버리지: [0-9]/)
  assert.match(render({referenceKey:'odd'},'en'),/Overtake coverage/)
  assert.match(render({referenceKey:'odd'},'ja'),/追い越しライン/)
})
test('a large effort-zero cut stays a compact row; complete target identities live only in the selected searchable pane', () => {
  const many = Array.from({length: 500}, (_, i) => ({ key: `target-${i}`, speed: 30, name_ko: `대상${i}`, name_en: `Target ${i}`, types: [] }))
  const html = renderToStaticMarkup(React.createElement(Panel, { rows: [roster[1], ...many], state: { ...defaultSpeedLineState, referenceKey: 'odd', referenceEffort: 0 }, onChange() {}, language: 'ko', translate: x => x, displayName: x => x.name_ko }))
  const body = html.match(/<tbody>([^]*?)<\/tbody>/)?.[1]
  assert.ok(body)
  assert.doesNotMatch(body, /대상499|speed-coverage-cut-label/)
  assert.match(body, /data-effort-start="0"/)
  assert.match(html, /class="speed-coverage-targets"/)
  assert.match(html, /대상499/)
  assert.match(html, /1500\/1500/)
})
test('mobile coverage cuts are labeled cards without forced 800px table width', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.doesNotMatch(css, /\.speed-coverage-table\s*\{[^}]*min-width:\s*800px/)
  assert.match(css, /@media \(max-width: 700px\)[^]*\.speed-coverage-table tbody tr\s*\{[^}]*display:\s*grid/)
  assert.match(css, /\.speed-coverage-target-list\s*\{[^}]*max-height:/)
  const html = render({referenceKey:'odd'})
  assert.match(html, /data-label="일반 준속"/)
  assert.match(html, /data-label="스카프 최속"/)
})
test('removed range-axis CSS and new coverage layout styles are present', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.doesNotMatch(css, /\.speed-range-(?:axis|band|marker|track-row)\s*\{/)
  assert.match(css, /\.speed-coverage-table/)
})
