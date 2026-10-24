import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSpeedRanges } from '../src/speedLine.ts'
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

test('one species projects both max-investment nature intervals with canonical rounding', () => {
  const result = buildSpeedRanges(roster, 'odd')
  const odd = result.entries.find(entry => entry.row.key === 'odd')
  assert.deepEqual(odd.normal, { min: 152, max: 167 })
  assert.deepEqual(odd.scarf, { min: 228, max: 250 })
  assert.equal(result.reference?.row.key, 'odd')
  assert.equal(result.reference?.normal.max, 167)
  assert.equal(result.scaleMax, 250)
})

test('reference changes highlight only, never the common physical scale or another interval', () => {
  const a = buildSpeedRanges(roster, 'slow')
  const b = buildSpeedRanges(roster, 'odd')
  assert.equal(a.reference?.row.key, 'slow')
  assert.equal(b.reference?.row.key, 'odd')
  assert.deepEqual(a.entries, b.entries)
  assert.equal(a.scaleMax, b.scaleMax)
  assert.deepEqual(a.entries.find(entry => entry.row.key === 'slow').normal, { min: 102, max: 112 })
})

test('Mega and Z-Mega have no fabricated scarf interval; unknown reference never falls back', () => {
  const result = buildSpeedRanges(roster, 'missing')
  assert.equal(result.reference, null)
  assert.equal(result.referenceMissing, true)
  assert.equal(result.entries.length, roster.length)
  for (const entry of result.entries.filter(entry => entry.row.key.startsWith('mega-'))) {
    assert.ok(entry.normal)
    assert.equal(entry.scarf, null)
  }
})

test('fresh route is ranges, old parameterized routes stay in detail and explicit view round-trips', () => {
  assert.equal(defaultSpeedLineState.view, 'ranges')
  assert.equal(parseSpeedLineState(new URLSearchParams('ref=odd')).state.view, 'ranges')
  assert.equal(parseSpeedLineState(new URLSearchParams('ref=odd&refEp=0&target=slow')).state.view, 'detail')
  const state = { ...defaultSpeedLineState, referenceKey: 'odd', view: 'detail', targetKey: 'slow' }
  const params = new URLSearchParams()
  writeSpeedLineState(params, state)
  assert.equal(params.get('view'), 'detail')
  assert.deepEqual(parseSpeedLineState(params).state, state)
  params.set('view', 'invalid')
  const bad = parseSpeedLineState(params)
  assert.equal(bad.state.view, 'detail')
  assert.ok(bad.warnings.includes('view'))
})

let server, Panel
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => { await server?.close() })
const render = (patch = {}) => renderToStaticMarkup(React.createElement(Panel, { rows: roster, state: { ...defaultSpeedLineState, ...patch }, onChange() {}, language: 'ko', translate: x => x, displayName: x => x.name_ko }))
test('default view shows two labeled ranges per row, one reference input and no individual-calculation settings', () => {
  const html = render({ referenceKey: 'odd', referenceEffort: 0, referenceNature: 'lower', referenceStage: 6, items: 'normal', abilityMode: 'conditions' })
  assert.match(html, /일반 준속~최속/)
  assert.match(html, /스카프 준속~최속/)
  assert.match(html, /152[^]*167/)
  assert.match(html, /228[^]*250/)
  assert.match(html, /노력 32 · 랭크 0 · 특성 미발동/)
  assert.match(html, /data-key="odd"[^>]*data-reference="true"/)
  assert.match(html, /스카프 사용 불가/)
  assert.doesNotMatch(html, /기준 노력 포인트|기준 스피드 랭크|목록 노력 포인트|상대 추월에 필요한 투자/)
  assert.equal((html.match(/id="speed-line-reference-search"/g) ?? []).length, 1)
  assert.equal((html.match(/data-key="odd"/g) ?? []).length, 1)
})

test('empty and unknown reference remain usable without silently selecting another form', () => {
  assert.match(render(), /기준 포켓몬을 선택/)
  const html = render({ referenceKey: 'unverified' })
  assert.match(html, /unverified/)
  assert.match(html, /기준 포켓몬이 확인된 목록에 없습니다/)
  assert.doesNotMatch(html, /data-reference="true"/)
})

test('highlight does not alter the selected row box or the common physical axis', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  const rule = css.match(/\.speed-range-row\.is-reference\s*\{([^}]*)\}/)?.[1]
  assert.ok(rule)
  assert.doesNotMatch(rule, /(?:^|;)\s*(?:border(?:-inline-start|-left)?|padding(?:-inline-start|-left)?|margin(?:-inline-start|-left)?|width|transform)\s*:/)
  assert.match(rule, /(?:inset\s+)?(?:box-shadow|outline)\s*:/)
})

test('range rows use measured height rather than deferred intrinsic placeholders', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  const rule = css.match(/\.speed-range-row\s*\{([^}]*)\}/)?.[1]
  assert.ok(rule)
  assert.doesNotMatch(rule, /content-visibility|contain-intrinsic-size/)
})

test('reference anchoring centers an offscreen row using only internal list scroll', async () => {
  const { scrollReferenceIntoList } = await server.ssrLoadModule('/src/SpeedLineRangesPanel.tsx')
  const row = { dataset: { key: 'odd' }, getBoundingClientRect: () => ({ top: 620, bottom: 700 }) }
  const list = { scrollTop: 100, clientTop: 1, clientHeight: 298, children: [row], getBoundingClientRect: () => ({ top: 200, bottom: 500 }) }
  assert.equal(scrollReferenceIntoList(list, 'odd'), true)
  assert.equal(list.scrollTop, 410)
  assert.equal(scrollReferenceIntoList(list, null), false)
  assert.equal(list.scrollTop, 410)
  assert.equal(scrollReferenceIntoList(list, 'missing'), false)
  assert.equal(list.scrollTop, 410)
})

test('reference anchoring centers an already visible row on selection', async () => {
  const { scrollReferenceIntoList } = await server.ssrLoadModule('/src/SpeedLineRangesPanel.tsx')
  const row = { dataset: { key: 'odd' }, getBoundingClientRect: () => ({ top: 240, bottom: 330 }) }
  const list = { scrollTop: 80, clientTop: 1, clientHeight: 298, children: [row], getBoundingClientRect: () => ({ top: 200, bottom: 500 }) }
  assert.equal(scrollReferenceIntoList(list, 'odd'), true)
  assert.equal(list.scrollTop, 15)
})

test('reference anchoring treats the border-box bottom as outside the client viewport', async () => {
  const { scrollReferenceIntoList } = await server.ssrLoadModule('/src/SpeedLineRangesPanel.tsx')
  const row = { dataset: { key: 'odd' }, getBoundingClientRect: () => ({ top: 480, bottom: 500 }) }
  const list = { scrollTop: 100, clientTop: 2, clientHeight: 296, children: [row], getBoundingClientRect: () => ({ top: 200, bottom: 500 }) }
  assert.equal(scrollReferenceIntoList(list, 'odd'), true)
  assert.equal(list.scrollTop, 240)
})
