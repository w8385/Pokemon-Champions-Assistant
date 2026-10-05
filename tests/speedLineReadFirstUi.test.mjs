import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, Panel
const rows = [
  { key: 'reference', name_ko: '기준', name_en: 'Reference', speed: 102, types: [] },
  { key: 'charizard', name_ko: '리자몽', name_en: 'Charizard', speed: 100, types: [], sprite: '/charizard.png' },
  { key: 'mega-charizard', name_ko: '메가리자몽', name_en: 'Mega Charizard', speed: 100, types: [] },
]
const state = { referenceKey: 'reference', referenceEffort: 31, referenceNature: 'boost', referenceStage: 1, listEffort: 32, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10, items: 'both', targetKey: 'charizard', targetItem: 'scarf' }
const props = patch => ({ rows, state: { ...state, ...patch }, onChange() {}, language: 'ko', translate: x => x, displayName: x => x.name_ko })
const render = patch => renderToStaticMarkup(React.createElement(Panel, props(patch)))
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => { await server?.close() })

test('ranked reference shows actual 168, effective 252, +2 against Charizard scarf 250 and inverse 30/31', () => {
  const html = render()
  assert.match(html, /기준 스피드 랭크/)
  assert.match(html, /실수치[^<]*<strong>168<\/strong>/)
  assert.match(html, /유효 스피드[^<]*<strong>252<\/strong>/)
  assert.match(html, /data-key="charizard" data-variant="scarf"[^]*?\+2 · 내가 빠름/)
  assert.match(html, /정확한 동속 최소 노력[^]*?30 → 250/)
  assert.match(html, /추월 최소 노력[^]*?31 → 252/)
  assert.match(html, /현재 실수치[^]*?168/)
  assert.match(html, /최대 실수치[^]*?169/)
})

test('read-first list hides impossible scarf megas, keeps compact row action and preserves unknown selected target', () => {
  const html = render({ targetKey: 'unknown-key' })
  assert.doesNotMatch(html, /data-key="mega-charizard" data-variant="scarf"/)
  assert.match(html, /data-key="charizard" data-variant="normal"/)
  assert.match(html, /data-key="charizard" data-variant="scarf"/)
  assert.match(html, /이 상대를 추월할 투자 보기/)
  assert.doesNotMatch(html, /역산 상대 선택|가상 조건/)
  assert.match(html, /unknown-key/)
  assert.match(html, /실전에서 불가능한 조합도 보기/)
})

test('selected target details open on action, optional impossible combinations show plain explanation', () => {
  let tree
  function Capture() { tree = Panel(props({ targetKey: null })); return tree }
  renderToStaticMarkup(React.createElement(Capture))
  const nodes = []
  const walk = n => { if (Array.isArray(n)) return n.forEach(walk); if (n?.props) { nodes.push(n); walk(n.props.children) } }
  walk(tree)
  const button = nodes.find(n => n.type === 'button' && n.props['aria-label']?.includes('이 상대를 추월할 투자 보기') && n.props['aria-label']?.includes('리자몽'))
  assert.ok(button)
  let changed
  function CaptureChange() { tree = Panel({ ...props({ targetKey: null }), onChange: next => { changed = next } }); return tree }
  renderToStaticMarkup(React.createElement(CaptureChange))
  nodes.length = 0; walk(tree)
  const action = nodes.find(n => n.type === 'button' && n.props['aria-label']?.includes('이 상대를 추월할 투자 보기') && n.props['aria-label']?.includes('리자몽'))
  action.props.onClick()
  assert.equal(changed.targetKey, 'charizard')
  const opt = render({ targetKey: 'mega-charizard', targetItem: 'scarf' })
  assert.match(opt, /이 도구 조합은 실전 사용 가능 여부가 확인되지 않음/)
})
