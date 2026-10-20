import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'

let server, Panel
const rows = [{ key: 'reference', name_ko: '기준', name_en: 'Reference', speed: 100, types: [] }, { key: 'mega-other', name_ko: '메가상대', name_en: 'Mega Other', speed: 110, types: [] }]
const state = { referenceKey: 'reference', referenceEffort: 16, referenceNature: 'neutral', referenceStage: 1, referenceAbility: null, listEffort: 32, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10, items: 'both', abilityMode: 'conditions', targetKey: null, targetItem: 'normal', targetAbility: null }
const render = (patch, language = 'ko') => renderToStaticMarkup(React.createElement(Panel, { rows, state: { ...state, ...patch }, language, onChange() {}, translate: x => x, displayName: x => x.name_ko }))
const summary = (html, cls) => html.match(new RegExp(`class="${cls}"[^>]*><summary>([^<]*)</summary>`))?.[1]
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => server?.close())

test('real search, Scarf, ability controls precede list outside extra filter disclosure', () => {
  const html = render()
  const toolbar = html.indexOf('class="speed-line-list-toolbar speed-line-controls"')
  const search = html.indexOf('id="speed-line-list-search"')
  const scarf = html.indexOf('구애스카프<select')
  const ability = html.indexOf('특성 효과<select')
  const extra = html.indexOf('class="speed-line-secondary-filters"')
  const list = html.indexOf('class="speed-line-list"')
  assert.ok(toolbar > 0 && toolbar < search && search < scarf && scarf < ability && ability < extra && extra < list, JSON.stringify({ toolbar, search, scarf, ability, extra, list }))
  assert.equal(html.match(/id="speed-line-list-search"/g)?.length, 1)
  assert.equal(html.match(/구애스카프<select/g)?.length, 1)
  assert.equal(html.match(/특성 효과<select/g)?.length, 1)
  assert.equal(summary(html, 'speed-line-secondary-filters'), '목록 설정 · 32pt · +10%')
  assert.equal(summary(html, 'speed-line-reference-options'), '랭크·특성 · +1 · 특성 없음')
  assert.doesNotMatch(html, /speed-line-condition-summary|실전에서 불가능한 조합도 보기/)
})

test('only usable scenarios become rows; an old Mega Scarf target is blocked with repair', () => {
  const html = render({ targetKey: 'mega-other', targetItem: 'scarf' })
  assert.doesNotMatch(html, /data-key="mega-other" data-variant="scarf"/)
  assert.match(html, /data-key="mega-other" data-variant="normal"/)
  assert.doesNotMatch(html, /추월 최소 노력:|상대 유효 스피드: <strong>/)
  assert.match(html, /구애스카프 미적용으로 바꾸기/)
})

test('row leads with actual to effective Speed before base Speed', () => {
  const html = render()
  const heading = html.match(/class="speed-line-row speed-line-heading"[^]*?<\/div>/)?.[0]
  const row = html.match(/data-key="mega-other"[^]*?<\/div>/)?.[0]
  assert.ok(heading && heading.indexOf('실수치 → 유효 스피드') < heading.indexOf('스피드 종족값'))
  assert.ok(row && row.indexOf(' → ') < row.indexOf('>110<'))
})

test('an invalid target stays visibly repairable even if the investment disclosure was closed', () => {
  const original = React.useState
  React.useState = initial => typeof initial === 'boolean' ? [false, () => {}] : original(initial)
  try {
    const html = render({ targetKey: 'mega-other', targetItem: 'scarf' })
    assert.match(html, /class="speed-line-investment card"[^>]*open=""/)
    assert.match(html, /구애스카프 미적용으로 바꾸기/)
  } finally { React.useState = original }
})

test('compact summaries retain values without repeating default filters in all languages', () => {
  for (const language of ['ko', 'en', 'ja']) {
    const html = render({ referenceStage: 0 }, language)
    const reference = summary(html, 'speed-line-reference-options')
    const filters = summary(html, 'speed-line-secondary-filters')
    assert.ok(reference && filters, language)
    assert.equal((reference.match(/0/g) ?? []).length, 1, reference)
    assert.match(filters, /32.*10%/, language)
    assert.doesNotMatch(filters, /메가폼 포함|기준 대비|빠른 순 → 느린 순|전체 범위|All speeds|全範囲/, language)
    assert.ok(filters.length < 50, `${language}: ${filters}`)
    assert.match(html, /<label>기준 스피드 랭크<select|<label>Reference Speed stage<select|<label>基準の素早さランク<select/)
  }
})

test('every nondefault hidden filter remains visible in collapsed summary including range gap', () => {
  const html = render({ listEffort: 8, listNature: 'lower', forms: 'nonMega', comparison: 'faster', sort: 'asc', rangeMode: 'around', gap: 12, referenceAbility: 'chlorophyll' })
  const reference = summary(html, 'speed-line-reference-options')
  const filters = summary(html, 'speed-line-secondary-filters')
  assert.match(reference, /\+1.*엽록소/)
  for (const value of ['8', '-10%', '메가폼 제외', '내가 빠름', '느린 순 → 빠른 순', '±12']) assert.ok(filters.includes(value), `${value}: ${filters}`)
  assert.match(html, /<label>메가폼 포함<select/)
  assert.match(html, /<label>정렬<select/)
})

test('mobile overview and three actions fit one row with 44px targets; toolbar stays visible', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.speed-line-reference-overview\s*\{[^}]*gap:\s*\.35rem \.4rem/)
  assert.match(css, /\.speed-line-reference-overview\s*>\s*\.entry-card-top\s*\{[^}]*margin-bottom:\s*0/)
  assert.match(css, /\.speed-line-actions\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(css, /\.speed-line-actions button\s*\{[^}]*min-height:\s*44px/)
  assert.match(css, /\.speed-line-list-toolbar\s*>\s*:first-child\s*\{\s*grid-column:\s*1 \/ -1/)
})