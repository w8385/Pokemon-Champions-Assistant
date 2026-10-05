import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const roster = [
  { id: 1, key: 'fast', name_ko: '빠름', name_en: 'Fast', name_ja: 'はやい', speed: 100, types: ['electric'] },
  { id: 2, key: 'slow', name_ko: '느림', name_en: 'Slow', name_ja: 'おそい', speed: 50, types: ['water'] },
  { id: 3, key: 'mega-fast', name_ko: '메가빠름', name_en: 'Mega Fast', speed: 130, types: ['electric'] },
]
const state = { referenceKey: 'slow', referenceEffort: 0, referenceNature: 'neutral', listEffort: 32, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10, items: 'normal', targetKey: null, targetItem: 'normal' }
let server
let Panel

test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default
})
test.after(async () => { await server?.close() })
const render = (overrides = {}, properties = {}) => renderToStaticMarkup(React.createElement(Panel, {
  rows: roster, state: { ...state, ...overrides }, onChange() {}, language: 'en', translate: text => text,
  displayName: row => row.name_en, ...properties,
}))

test('reference picker uses full roster while results filters hide it; condition summary and computed comparison remain', () => {
  const html = render({ forms: 'mega', query: 'mega', comparison: 'slower' })
  assert.match(html, /<strong>Slow<\/strong>/)
  assert.match(html, /role="combobox"/)
  assert.match(html, /Reference Speed/)
  assert.match(html, /Comparison conditions/)
  assert.match(html, /mega-fast/)
  assert.match(html, /reference-marker/)
  assert.match(html, /Speed difference/)
})

test('unselected reference keeps entire listing and disables around control', () => {
  const html = render({ referenceKey: null })
  assert.match(html, /Fast/)
  assert.match(html, /Slow/)
  assert.match(html, /disabled=""[^>]*>[^<]*Around|disabled=""/)
  assert.doesNotMatch(html, /reference-marker/)
})

test('empty filtered results show explicit reset with pinned reference', () => {
  const html = render({ query: 'nothing', comparison: 'equal' })
  assert.match(html, /Reset filters/)
  assert.match(html, /Reference Speed/)
  assert.match(html, /No results/)
})

test('same form uses independent efforts and cannot be mislabeled a zero difference', () => {
  const html = render({ referenceKey: 'fast', referenceEffort: 0, listEffort: 32 })
  assert.match(html, /data-key="fast"/)
  assert.match(html, /-47 · Reference slower/)
})

test('localized conditions expose assumptions, reference viewpoint, actual reference speed and restored gap', () => {
  const html = render({ referenceKey: 'fast', referenceEffort: 31, referenceNature: 'boost', rangeMode: 'around', gap: 3 }, { language: 'ko' })
  assert.match(html, /레벨 50 · 개체값 31/)
  assert.match(html, /내가 빠름/)
  assert.match(html, /내가 느림/)
  assert.match(html, /기준 주변 \(±3\)/)
  assert.match(html, /class="speed-line-condition-summary"[^>]*>[^]*?기준 실수치 스피드[^]*?166/)
})

test('invalid URL fields are surfaced as a localized repair notice', () => {
  const html = render({}, { language: 'ko', warnings: ['refEp', 'forms'] })
  assert.match(html, /URL의 잘못된 값을 기본값으로 복원했습니다/)
  assert.match(html, /refEp, forms/)
})

test('unknown reference key stays visibly selected rather than pretending it was cleared', () => {
  const html = render({ referenceKey: 'nonexistent' })
  assert.match(html, /role="combobox"/)
  assert.match(html, /<strong>Unknown reference: nonexistent<\/strong>/)
  assert.match(html, /Reference is not in the verified roster/)
  assert.doesNotMatch(html, /reference-marker/)
})
