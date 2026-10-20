import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'

let server, Panel
const rows = [{ key: 'reference', name_ko: '기준', name_en: 'Reference', speed: 100, types: [] }, { key: 'mega-other', name_ko: '메가상대', name_en: 'Mega Other', speed: 110, types: [] }]
const state = { referenceKey: 'reference', referenceEffort: 16, referenceNature: 'neutral', referenceStage: 1, referenceAbility: null, listEffort: 32, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10, items: 'both', abilityMode: 'conditions', targetKey: null, targetItem: 'normal', targetAbility: null }
const render = (patch = {}, language = 'ko') => renderToStaticMarkup(React.createElement(Panel, { rows, state: { ...state, ...patch }, language, onChange() {}, translate: x => x, displayName: x => x.name_ko }))
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => server?.close())

test('reference and list controls appear directly in order without calculation disclosure', () => {
  const html = render()
  const positions = ['기준 포켓몬 검색', '기준 노력 포인트', '기준 성격', '기준 스피드 랭크', '기준 특성', 'id="speed-line-list-search"', '구애스카프<select', '특성 효과<select', '목록 노력 포인트', '목록 성격', '메가폼 포함', '기준 대비', '정렬<select', '속도 범위'].map(text => html.indexOf(text))
  assert.ok(positions.every((value, index) => value >= 0 && (!index || value > positions[index - 1])), positions.join(','))
  assert.doesNotMatch(html, /<details|계산기준|speed-line-assumption-details|speed-line-ability-note/)
  assert.equal(html.match(/id="speed-line-list-search"/g)?.length, 1)
})

test('investment appears only for selected targets including invalid targets needing repair', () => {
  assert.doesNotMatch(render(), /speed-line-investment/)
  const invalid = render({ targetKey: 'mega-other', targetItem: 'scarf' })
  assert.match(invalid, /class="speed-line-investment card"/)
  assert.doesNotMatch(invalid, /<details/)
  assert.doesNotMatch(invalid, /data-key="mega-other" data-variant="scarf"/)
  assert.match(invalid, /구애스카프 미적용으로 바꾸기/)
  assert.doesNotMatch(invalid, /추월 최소 노력:|상대 유효 스피드: <strong>/)
  assert.match(render({ targetKey: 'missing' }), /미확인 상대: missing/)
  assert.match(render({ targetKey: 'reference' }), /추월 최소 노력/)
})

test('row leads with actual to effective Speed before base Speed', () => {
  const html = render()
  const heading = html.match(/class="speed-line-row speed-line-heading"[^]*?<\/div>/)?.[0]
  const row = html.match(/data-key="mega-other"[^]*?<\/div>/)?.[0]
  assert.ok(heading && heading.indexOf('실수치 → 유효 스피드') < heading.indexOf('스피드 종족값'))
  assert.ok(row && row.indexOf(' → ') < row.indexOf('>110<'))
})

test('actions reuse shared button design while name selection remains compact', () => {
  const html = render({ targetKey: 'mega-other', targetItem: 'scarf', query: 'no-match' })
  for (const text of ['기준선으로 이동', '기준 해제', '공유 링크 복사', '구애스카프 미적용으로 바꾸기', '필터 초기화']) assert.match(html, new RegExp(`<button[^>]*class="[^"]*action-button[^"]*"[^>]*>${text}</button>`), text)
  assert.match(render(), /class="action-button subtle speed-line-name-action"/)
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.speed-line-actions button\s*\{[^}]*min-height:\s*44px/)
  assert.match(css, /\.speed-line-species \.speed-line-name-action\s*\{[^}]*min-height:\s*44px/)
  assert.match(css, /\.speed-line-secondary-filters\s*\{[^}]*grid-template-columns:/)
})

test('nondefault form, comparison, sort, nature and restored gap remain selected in visible controls', () => {
  const html = render({ listEffort: 8, listNature: 'lower', forms: 'nonMega', comparison: 'faster', sort: 'asc', rangeMode: 'around', gap: 12 })
  for (const [value, text] of [['lower', '성격 보정 -10%'], ['nonMega', '메가폼 제외'], ['faster', '내가 빠름'], ['asc', '느린 순 → 빠른 순'], ['around', '기준 주변 (±12)']]) assert.match(html, new RegExp(`<option value="${value}" selected="">${text.replace(/[()+]/g, '\\$&')}</option>`))
  assert.match(html, /목록 노력 포인트<input[^>]*value="8"/)
})

test('all three locales keep reference rank and list settings accessible without a summary', () => {
  for (const [language, rank, nature] of [['ko', '기준 스피드 랭크', '목록 성격'], ['en', 'Reference Speed stage', 'List nature'], ['ja', '基準の素早さランク', '一覧の性格']]) {
    const html = render({ referenceStage: 0 }, language)
    assert.match(html, new RegExp(`<label>${rank}<select`))
    assert.match(html, new RegExp(`<label>${nature}<select`))
    assert.doesNotMatch(html, /<details|<summary/)
  }
})

test('mobile overview and three reference actions retain a single row of 44px targets', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.speed-line-reference-overview\s*\{[^}]*gap:\s*\.35rem \.4rem/)
  assert.match(css, /\.speed-line-reference-overview\s*>\s*\.entry-card-top\s*\{[^}]*margin-bottom:\s*0/)
  assert.match(css, /\.speed-line-actions\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(css, /\.speed-line-list-toolbar\s*>\s*:first-child\s*\{\s*grid-column:\s*1 \/ -1/)
})
