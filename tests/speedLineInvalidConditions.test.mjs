import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { parseSpeedLineState, writeSpeedLineState } from '../src/speedLineState.ts'
import { buildSpeedComparison, buildSpeedScenario } from '../src/speedLine.ts'
import { calculateSpeedInvestment } from '../src/speedLineInvestment.ts'
import { getSpeedAbility } from '../src/speedAbilities.ts'

const rows = [
  { key: 'qwilfish', name_ko: '침바루', name_en: 'Qwilfish', speed: 85, types: [], abilities: ['swift-swim'] },
  { key: 'mega-charizard-x', name_ko: '메가리자몽X', name_en: 'Mega Charizard X', speed: 100, types: [], abilities: [] },
  { key: 'mega-absol-z', name_ko: '메가앱솔Z', name_en: 'Mega Absol Z', speed: 100, types: [], abilities: [] },
  { key: 'unburden', name_ko: '곡예', name_en: 'Unburden', speed: 100, types: [], abilities: ['unburden'] },
]
const route = 'slv=3&ref=qwilfish&target=qwilfish&targetItem=normal'
let server, Panel
const panelProps = state => ({ rows, state, language: 'en', onChange() {}, translate: x => x, displayName: x => x.name_en })
const html = state => renderToStaticMarkup(React.createElement(Panel, panelProps(state)))
test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLinePanel.tsx')).default })
test.after(async () => server?.close())

test('invalid reference slug survives route and blocks reference speed, differences and inverse', () => {
  const { state, warnings } = parseSpeedLineState(new URLSearchParams(`${route}&refAbility=bogus`))
  assert.deepEqual(warnings, ['refAbility'])
  assert.equal(state.referenceAbility, 'bogus')
  const written = new URLSearchParams()
  writeSpeedLineState(written, state)
  assert.equal(written.get('refAbility'), 'bogus')
  const result = buildSpeedComparison(rows, state)
  assert.equal(result.referenceUnavailableReason, 'ability-not-available')
  assert.equal(result.reference, null)
  assert.equal(result.referenceMissing, false)
  assert.ok(result.entries.every(entry => entry.difference === null && entry.relation === null))
  const view = html(state)
  assert.match(view, /Qwilfish/)
  assert.match(view, /bogus/)
  assert.match(view, /Selected ability is unavailable on this form/)
  assert.doesNotMatch(view, /Reference effective Speed 141|Minimum effort to pass:/)
})

test('invalid target slug survives route and blocks effective target speed and minimum investment', () => {
  const { state, warnings } = parseSpeedLineState(new URLSearchParams(`${route}&targetAbility=bogus`))
  assert.deepEqual(warnings, ['targetAbility'])
  assert.equal(state.targetAbility, 'bogus')
  const written = new URLSearchParams()
  writeSpeedLineState(written, state)
  assert.equal(written.get('targetAbility'), 'bogus')
  const scenario = buildSpeedScenario(rows[0], state.listEffort, state.listNature, state.targetItem, null, state.targetAbility)
  assert.equal(scenario.unavailableReason, 'ability-not-available')
  assert.throws(() => calculateSpeedInvestment(rows[0], state.referenceNature, state.referenceEffort, scenario), RangeError)
  const view = html(state)
  assert.match(view, /bogus/)
  assert.match(view, /Selected ability is unavailable on this form/)
  assert.doesNotMatch(view, /Target effective Speed: <strong>|Minimum effort to pass:/)
})

test('restored ordinary Mega + Scarf target stays blocked and offers a repair without changing the reference', () => {
  const { state } = parseSpeedLineState(new URLSearchParams('slv=3&ref=qwilfish&target=mega-charizard-x&targetItem=scarf&q=not-a-match&forms=nonMega&items=normal'))
  const hidden = html(state)
  assert.match(hidden, /Mega Charizard X/)
  assert.match(hidden, /Mega forms cannot hold Choice Scarf|Mega item and Choice Scarf cannot both be held/)
  assert.doesNotMatch(hidden, /Show item combinations not verified for battle|Additional options →/)
  assert.doesNotMatch(hidden, /Target effective Speed: <strong>|Minimum effort to pass:/)
  assert.doesNotMatch(hidden, /type="checkbox"/)
  let next
  let tree
  function Capture() { tree = Panel({ ...panelProps(state), onChange: value => { next = value } }); return tree }
  renderToStaticMarkup(React.createElement(Capture))
  const flatten = node => !node ? [] : Array.isArray(node) ? node.flatMap(flatten) : node.props ? [node, ...flatten(node.props.children)] : []
  const repair = flatten(tree).find(node => node.type === 'button' && node.props.children === 'Use without Choice Scarf')
  assert.ok(repair)
  repair.props.onClick()
  assert.deepEqual([next.targetKey, next.targetItem, next.referenceKey], ['mega-charizard-x', 'normal', 'qwilfish'])
  const valid = html({ ...state, targetKey: 'qwilfish', targetItem: 'normal' })
  assert.match(valid, /Minimum effort to pass:/)
})

test('Z-Mega Scarf and Unburden Scarf remain unavailable', () => {
  for (const [key, ability] of [['mega-absol-z', null], ['unburden', 'unburden']]) {
    const state = parseSpeedLineState(new URLSearchParams(`slv=3&ref=qwilfish&target=${key}&targetItem=scarf${ability ? `&targetAbility=${ability}` : ''}`)).state
    const scenario = buildSpeedScenario(rows.find(row => row.key === key), state.listEffort, state.listNature, 'scarf', null, ability)
    assert.ok(scenario.unavailableReason)
    assert.throws(() => calculateSpeedInvestment(rows[0], state.referenceNature, state.referenceEffort, scenario), RangeError)
    assert.doesNotMatch(html(state), /Target effective Speed: <strong>|Minimum effort to pass:/)
    assert.match(html(state), /Use without Choice Scarf/)
  }
})

test('Quick Feet condition describes its paralysis Speed exception in all three languages', () => {
  const ability = getSpeedAbility('quick-feet')
  assert.match(ability.conditionKo, /마비의 스피드 저하 없음/)
  assert.match(ability.conditionEn, /no paralysis Speed reduction/i)
  assert.match(ability.conditionJa, /まひによる素早さ低下なし/)
})

test('present but empty ability parameters remain invalid and round-trip without normal fallback', () => {
  const { state, warnings } = parseSpeedLineState(new URLSearchParams(`${route}&refAbility=&targetAbility=`))
  assert.deepEqual(warnings, ['refAbility', 'targetAbility'])
  const written = new URLSearchParams()
  writeSpeedLineState(written, state)
  assert.equal(written.has('refAbility'), true)
  assert.equal(written.has('targetAbility'), true)
  assert.equal(buildSpeedComparison(rows, state).reference, null)
  assert.equal(buildSpeedScenario(rows[0], 32, 'boost', 'normal', null, state.targetAbility).unavailableReason, 'ability-not-available')
  assert.doesNotMatch(html(state), /Target effective Speed: <strong>|Minimum effort to pass:/)
})

test('empty refAbility shows visible invalid selection and repairs to absent ability in every language', () => {
  const { state, warnings } = parseSpeedLineState(new URLSearchParams(`${route}&refAbility=`))
  assert.deepEqual(warnings, ['refAbility'])
  assert.equal(state.referenceAbility, '')
  const labels = [
    ['ko', '선택한 특성이 이 폼에 없습니다', '특성 없음', '선택 불가 특성 해제'],
    ['en', 'Selected ability is unavailable on this form', 'No active ability', 'Clear unavailable ability'],
    ['ja', '選択した特性はこのフォルムにありません', '特性なし', '使用不可の特性を解除'],
  ]
  for (const [language, invalid, absent, repairLabel] of labels) {
    const properties = { ...panelProps(state), language, warnings }
    const view = renderToStaticMarkup(React.createElement(Panel, properties))
    const referenceControls = view.match(/class="speed-line-controls speed-line-reference-options"([^]*?)<\/div>/)?.[1]
    assert.ok(referenceControls, `missing visible ${language} controls`)
    assert.match(view, new RegExp(invalid))
    assert.match(referenceControls, new RegExp(absent))
    assert.match(view, new RegExp(`refAbility[^]*?${repairLabel}`))
    let tree, next
    function Capture() { tree = Panel({ ...properties, onChange: value => { next = value } }); return tree }
    renderToStaticMarkup(React.createElement(Capture))
    const flatten = node => !node ? [] : Array.isArray(node) ? node.flatMap(flatten) : node.props ? [node, ...flatten(node.props.children)] : []
    const repair = flatten(tree).find(node => node.type === 'button' && node.props.children === repairLabel)
    assert.ok(repair)
    repair.props.onClick()
    assert.equal(next.referenceAbility, null)
    assert.equal(next.referenceKey, state.referenceKey)
    const repairedParams = new URLSearchParams()
    writeSpeedLineState(repairedParams, next)
    assert.equal(repairedParams.has('refAbility'), false)
    const repaired = renderToStaticMarkup(React.createElement(Panel, { ...properties, state: next, warnings: [] }))
    const repairedControls = repaired.match(/class="speed-line-controls speed-line-reference-options"([^]*?)<\/div>/)?.[1]
    assert.ok(repairedControls)
    assert.match(repairedControls, new RegExp(`selected="">${absent}`))
    assert.doesNotMatch(repaired, new RegExp(invalid))
  }
})
