import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, Panel
const rows = [
  { key: 'swimmer', name_ko: '수영', name_en: 'Swimmer', speed: 102, types: [], abilities: ['swift-swim'] },
  { key: 'feet', name_ko: '발', name_en: 'Feet', speed: 102, types: [], abilities: ['quick-feet'] },
  { key: 'burden', name_ko: '가벼움', name_en: 'Burden', speed: 102, types: [], abilities: ['unburden'] },
  { key: 'mega-absol-z', name_ko: '메가앱솔Z', name_en: 'Mega Absol Z', speed: 102, types: [], abilities: ['swift-swim'] },
]
const state = { referenceKey: 'swimmer', referenceEffort: 30, referenceNature: 'boost', referenceStage: 0, referenceAbility: null, listEffort: 30, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10, items: 'both', abilityMode: 'conditions', targetKey: 'swimmer', targetItem: 'scarf', targetAbility: 'swift-swim' }
const props = (patch = {}, extras = {}) => ({ rows, state: { ...state, ...patch }, language: 'ko', onChange() {}, translate: x => x, displayName: x => x.name_ko, ...extras })
const render = patch => renderToStaticMarkup(React.createElement(Panel, props(patch)))
const nodes = (tree, found = []) => { if (Array.isArray(tree)) tree.forEach(x => nodes(x, found)); else if (tree?.props) { found.push(tree); nodes(tree.props.children, found) }; return found }
const capture = (patch = {}, extras = {}) => { let tree; function Capture() { tree = Panel(props(patch, extras)); return tree }; renderToStaticMarkup(React.createElement(Capture)); return nodes(tree) }
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => server?.close())

test('condition scenarios show item and weather, stable IDs, and combined 501 Speed', () => {
  const html = render()
  assert.match(html, /특성 발동 시 속도 포함/)
  assert.match(html, /각 특성 행은 별도 조건/)
  assert.match(html, /data-key="swimmer" data-variant="scarf" data-ability="swift-swim" data-scenario-id="swimmer:scarf:swift-swim"/)
  assert.match(html, /data-scenario-id="swimmer:scarf:swift-swim"[^]*?501/)
  assert.match(html, /쓱쓱[^<]*\(비가 내릴 때\)/)
  assert.doesNotMatch(html, /data-key="burden" data-variant="scarf" data-ability="unburden"/)
  assert.doesNotMatch(html, /data-key="mega-absol-z" data-variant="scarf"/)
  assert.match(html, /aria-label="[^"]*수영[^"]*구애스카프[^"]*쓱쓱[^"]*비가 내릴 때/)
})
test('clicking condition row selects its full identity and mode switch preserves target', () => {
  let changed
  const all = capture({ targetKey: null, targetAbility: null }, { onChange: next => { changed = next } })
  const action = all.find(x => x.type === 'button' && x.props['aria-label']?.includes('수영') && x.props['aria-label']?.includes('쓱쓱') && x.props['aria-label']?.includes('구애스카프'))
  assert.ok(action)
  action.props.onClick()
  assert.deepEqual([changed.targetKey, changed.targetItem, changed.targetAbility], ['swimmer', 'scarf', 'swift-swim'])
  const off = render({ abilityMode: 'off' })
  assert.doesNotMatch(off, /data-ability="swift-swim"/)
  assert.match(off, /501/)
  assert.match(off, /쓱쓱/)
})
test('invalid targets and references never yield a computed Speed or inverse', () => {
  const z = render({ targetKey: 'mega-absol-z', targetItem: 'scarf', targetAbility: null })
  assert.match(z, /Z메가폼은 구애스카프를 지닐 수 없습니다/)
  assert.doesNotMatch(z, /상대 유효 스피드: <strong>|추월 최소 노력:/)
  const invalid = render({ referenceKey: 'feet', referenceAbility: 'swift-swim' })
  assert.match(invalid, /발/)
  assert.doesNotMatch(invalid, /기준 없음/)
  assert.match(invalid, /선택한 특성이 이 폼에 없습니다/)
  assert.doesNotMatch(invalid, /추월 최소 노력:/)
  assert.match(invalid, /value="swift-swim" selected=""/)
})
test('reference picker only offers actual abilities and resets ability on change or clear', () => {
  let changed
  const all = capture({ referenceAbility: 'swift-swim' }, { onChange: next => { changed = next } })
  const search = all.find(x => x.props.id === 'speed-line-reference-search')
  assert.ok(search)
  const options = all.filter(x => x.type === 'option')
  assert.ok(options.some(x => x.props.value === 'swift-swim'))
  assert.ok(!options.some(x => x.props.value === 'quick-feet'))
  search.props.onSelect('feet')
  assert.equal(changed.referenceAbility, null)
  assert.equal(changed.referenceKey, 'feet')
  const clear = all.find(x => x.type === 'button' && x.props.children === '기준 해제')
  clear.props.onClick()
  assert.equal(changed.referenceAbility, null)
})

test('all seven known abilities have named condition badges and distinct scenario identifiers', () => {
  const abilities = ['swift-swim', 'chlorophyll', 'sand-rush', 'slush-rush', 'surge-surfer', 'unburden', 'quick-feet']
  const names = ['쓱쓱', '엽록소', '모래헤치기', '눈치우기', '서핑테일', '곡예', '속보']
  const conditions = ['비가 내릴 때', '햇살이 강할 때', '모래바람일 때', '눈이 내릴 때', '일렉트릭필드일 때', '도구를 사용하거나 잃고', '상태 이상일 때']
  const allRows = abilities.map((ability, i) => ({ key: `ability-${i}`, name_ko: `조건${i}`, name_en: `Condition ${i}`, speed: 100, types: [], abilities: [ability] }))
  const html = renderToStaticMarkup(React.createElement(Panel, props({ referenceKey: null, items: 'normal', targetKey: null, targetAbility: null }, { rows: allRows })))
  abilities.forEach((ability, i) => {
    assert.match(html, new RegExp(`data-scenario-id="ability-${i}:normal:${ability}"`))
    assert.match(html, new RegExp(`${names[i]}[^<]*${conditions[i]}`))
  })
})

test('reference ability applies to reference marker and inversion while actual and effective Speed stay distinct', () => {
  const html = render({ referenceAbility: 'swift-swim', targetItem: 'normal', targetAbility: null })
  assert.match(html, /기준선: 수영 334 · 쓱쓱 \(비가 내릴 때\)/)
  assert.match(html, /실수치 <strong>167<\/strong>/)
  assert.match(html, /유효 스피드 <strong>334<\/strong>/)
  assert.match(html, /현재 실수치: 167 · 현재 유효 스피드: 334/)
  assert.match(html, /최대 실수치: 169 · 최대 유효 스피드: 338/)
})
