import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, Panel
const rows = [{ key: 'swimmer', name_ko: '수영', name_en: 'Swimmer', speed: 102, types: [], abilities: ['swift-swim'] }]
const state = { referenceKey: 'swimmer', referenceEffort: 30, referenceNature: 'boost', referenceStage: 0, referenceAbility: null, listEffort: 30, listNature: 'boost', query: '', forms: 'all', comparison: 'all', sort: 'desc', rangeMode: 'all', gap: 10, items: 'both', abilityMode: 'conditions', targetKey: null, targetItem: 'normal', targetAbility: null }
const props = (patch = {}, language = 'ko', onChange = () => {}) => ({ rows, state: { ...state, ...patch }, language, onChange, translate: text => text, displayName: row => row.name_ko })
const render = (patch, language) => renderToStaticMarkup(React.createElement(Panel, props(patch, language)))
const nodes = (tree, found = []) => { if (Array.isArray(tree)) tree.forEach(x => nodes(x, found)); else if (tree?.props) { found.push(tree); nodes(tree.props.children, found) }; return found }
const capture = onChange => { let tree; function Capture() { tree = Panel(props({}, 'ko', onChange)); return tree }; renderToStaticMarkup(React.createElement(Capture)); return nodes(tree) }

test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => server?.close())

test('Scarf and ability controls have distinct, non-repeating Korean labels and a readable current summary', () => {
  const html = render()
  assert.match(html, /구애스카프<\/label>|구애스카프<select/)
  assert.match(html, /특성 효과<select/)
  assert.match(html, /<option value="normal">미적용<\/option>/)
  assert.match(html, /<option value="scarf">적용<\/option>/)
  assert.match(html, /<option value="conditions" selected="">발동 포함<\/option>/)
  assert.match(html, /구애스카프<select[^]*?<option value="both" selected="">미적용·적용 모두<\/option>/)
  assert.doesNotMatch(html, /도구 조건|일반만|특성 발동 시 속도 포함|일반·스카프만/)
  assert.match(html, /data-scenario-id="swimmer:normal:swift-swim"/)
  assert.match(html, /data-scenario-id="swimmer:scarf:swift-swim"/)
})

test('each combination reports the chosen Scarf and ability modes without changing scenario generation', () => {
  for (const [items, itemText, variant] of [['normal', '미적용', 'normal'], ['scarf', '적용', 'scarf'], ['both', '미적용·적용 모두', 'both']]) {
    for (const [abilityMode, abilityText] of [['off', '미발동만'], ['conditions', '발동 포함']]) {
      const html = render({ items, abilityMode })
      assert.match(html, new RegExp(`<option value="${items}" selected="">${itemText}</option>`))
      assert.match(html, new RegExp(`<option value="${abilityMode}" selected="">${abilityText}</option>`))
      assert.equal((html.match(/data-scenario-id="swimmer:normal(?:"|:)/g) ?? []).length > 0, variant !== 'scarf')
      assert.equal((html.match(/data-scenario-id="swimmer:scarf(?:"|:)/g) ?? []).length > 0, variant !== 'normal')
      assert.equal((html.match(/data-ability="swift-swim"/g) ?? []).length > 0, abilityMode === 'conditions')
    }
  }
})

test('the two existing selects independently write the unchanged persisted values', () => {
  let next
  const all = capture(value => { next = value })
  const selects = all.filter(x => x.type === 'select')
  const items = selects.find(x => x.props.value === 'both' && x.props.children.some(option => option.props.value === 'scarf'))
  const ability = selects.find(x => x.props.value === 'conditions' && x.props.children.some(option => option.props.value === 'off'))
  assert.ok(items)
  assert.ok(ability)
  items.props.onChange({ target: { value: 'normal' } })
  assert.equal(next.items, 'normal')
  assert.equal(next.abilityMode, 'conditions')
  ability.props.onChange({ target: { value: 'off' } })
  assert.equal(next.items, 'both')
  assert.equal(next.abilityMode, 'off')
})

test('English and Japanese labels separate Scarf from ability activation', () => {
  for (const [language, item, ability, baseline] of [['en', 'Choice Scarf', 'Ability effects', 'Inactive only'], ['ja', 'こだわりスカーフ', '特性の効果', '未発動のみ']]) {
    const html = render({ items: 'normal', abilityMode: 'off' }, language)
    assert.match(html, new RegExp(`${item}<select`))
    assert.match(html, new RegExp(`${ability}<select`))
    assert.match(html, new RegExp(`${ability}<select[^]*?<option value="off" selected="">${baseline}</option>`))
  }
})
