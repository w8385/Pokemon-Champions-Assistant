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

test('restored ordinary Mega + Scarf target requires explicit advanced opt-in, unlike filtered valid targets', () => {
  const { state } = parseSpeedLineState(new URLSearchParams('slv=3&ref=qwilfish&target=mega-charizard-x&targetItem=scarf&q=not-a-match&forms=nonMega&items=normal'))
  const hidden = html(state)
  assert.match(hidden, /Mega Charizard X/)
  assert.match(hidden, /Show item combinations not verified for battle/)
  assert.match(hidden, /not verified as usable in battle/)
  assert.doesNotMatch(hidden, /Target effective Speed: <strong>|Minimum effort to pass:/)
  // Simulate the component's local advanced checkbox state, then turn it off again.
  const original = React.useState
  let enabled = false
  let checkbox
  React.useState = initial => {
    const [value, setter] = original(initial)
    if (initial === false && !checkbox) { checkbox = true; return [value, setter] }
    if (initial === false) return [enabled, next => { enabled = next }]
    return [value, setter]
  }
  try {
    let tree
    function Capture() { tree = Panel(panelProps(state)); return tree }
    renderToStaticMarkup(React.createElement(Capture))
    const flatten = node => !node ? [] : Array.isArray(node) ? node.flatMap(flatten) : node.props ? [node, ...flatten(node.props.children)] : []
    const toggle = flatten(tree).find(node => node.type === 'input' && node.props.type === 'checkbox')
    assert.ok(toggle)
    toggle.props.onChange({ target: { checked: true } })
    assert.equal(enabled, true)
    checkbox = false
    assert.match(html(state), /Target effective Speed: <strong>/)
    assert.match(html(state), /Minimum effort to pass:/)
    toggle.props.onChange({ target: { checked: false } })
    checkbox = false
    assert.doesNotMatch(html(state), /Target effective Speed: <strong>|Minimum effort to pass:/)
  } finally { React.useState = original }
  const valid = html({ ...state, targetKey: 'qwilfish', targetItem: 'normal' })
  assert.match(valid, /Minimum effort to pass:/)
})

test('Z-Mega Scarf and Unburden Scarf remain unavailable regardless of advanced display state', () => {
  for (const [key, ability] of [['mega-absol-z', null], ['unburden', 'unburden']]) {
    const state = parseSpeedLineState(new URLSearchParams(`slv=3&ref=qwilfish&target=${key}&targetItem=scarf${ability ? `&targetAbility=${ability}` : ''}`)).state
    const scenario = buildSpeedScenario(rows.find(row => row.key === key), state.listEffort, state.listNature, 'scarf', null, ability)
    assert.ok(scenario.unavailableReason)
    assert.throws(() => calculateSpeedInvestment(rows[0], state.referenceNature, state.referenceEffort, scenario), RangeError)
    assert.doesNotMatch(html(state), /Target effective Speed: <strong>|Minimum effort to pass:/)
    const original = React.useState
    let falseCalls = 0
    React.useState = initial => initial === false && ++falseCalls === 2 ? [true, () => {}] : original(initial)
    try {
      assert.doesNotMatch(html(state), /Target effective Speed: <strong>|Minimum effort to pass:/)
    } finally { React.useState = original }
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
