import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'

import { Window } from 'happy-dom'
import { createServer } from 'vite'

const browser = new Window({ url: 'http://localhost/' })
Object.assign(globalThis, { window: browser, document: browser.document, localStorage: browser.localStorage, HTMLElement: browser.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
let Panel, quickSide
try { ({ QuickDamagePanel: Panel, quickSide } = await server.ssrLoadModule('/src/App.tsx')) } catch (error) { await server.close(); throw error }
test.after(async () => {
  const { loadFormLearnset } = await server.ssrLoadModule('/src/sharedLearnsets.ts')
  const { loadMoveMetaByName } = await server.ssrLoadModule('/src/dex/data.ts')
  await Promise.all([loadFormLearnset('pelipper'), loadFormLearnset('pincurchin'), loadFormLearnset('starmie'), loadFormLearnset('mega-starmie'), loadMoveMetaByName()])
  await server.close(); await browser.happyDOM.abort()
})
const side = (key, ability) => quickSide({ key, ability })
async function mount(own, foe, comparisonMode = true) {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  const props = { language: 'ko', tooltipForMove: () => ({}), ...(comparisonMode ? { comparisonMode, comparisonSlots: [0, 0], initialSides: [own, foe] } : {}) }
  if (!comparisonMode && !localStorage.getItem('pokemon-champions-quick-damage:v1')) localStorage.setItem('pokemon-champions-quick-damage:v1', JSON.stringify({ attacker: own, defender: foe, conditions: { weather: 'none', terrain: 'none' } }))
  await act(async () => root.render(React.createElement(Panel, props)))
  const values = () => [...host.querySelectorAll('.quick-common-conditions label select')].slice(0, 2).map(el => el.value)
  const choose = async (index, value) => { const select = host.querySelectorAll('.quick-common-conditions label select')[index]; await act(async () => { select.value = value; select.dispatchEvent(new browser.Event('change', { bubbles: true })) }) }
  const update = async (attacker, defender, reset = 0, comparisonSlots = [0, 0]) => { await act(async () => root.render(React.createElement(Panel, { ...props, comparisonSlots, initialSides: [attacker, defender], opponentResetRevision: reset }))) }
  const cleanup = async () => { await act(async () => root.unmount()); host.remove(); localStorage.clear() }
  return { values, choose, update, cleanup, host }
}

test('mounted matchup uses canonical valid weather/terrain in visible conditions, not legacy stored fields', async () => {
  const view = await mount(side('pelipper', 'drizzle'), side('pincurchin', 'electric-surge'))
  try { assert.deepEqual(view.values(), ['rain', 'electric']) } finally { await view.cleanup() }
})

test('wrong-form raw ability never activates either field and remains blocked', async () => {
  for (const wrong of ['drizzle', 'electric-surge']) {
    const own = side('mega-starmie', wrong)
    const view = await mount(own, side('starmie', ''))
    try {
      assert.deepEqual(view.values(), ['none', 'none'])
      assert.equal(own.ability, wrong)
      assert.match(view.host.textContent, /비교 불가/)
    } finally { await view.cleanup() }
  }
})

test('manual sun and explicit none survive ability removal; automatic-only fields clear', async () => {
  const pelipper = side('pelipper', 'drizzle'), surge = side('pincurchin', 'electric-surge')
  const view = await mount(pelipper, surge)
  try {
    await view.choose(0, 'sun'); await view.choose(1, 'none')
    assert.deepEqual(view.values(), ['sun', 'none'])
    await view.update(side('pelipper', ''), side('pincurchin', ''))
    assert.deepEqual(view.values(), ['sun', 'none'])
  } finally { await view.cleanup() }
  const auto = await mount(pelipper, surge)
  try {
    await auto.update(side('pelipper', ''), side('pincurchin', ''))
    assert.deepEqual(auto.values(), ['none', 'none'])
  } finally { await auto.cleanup() }
})

test('pair change and opponent reset clear manual provenance on both fields', async () => {
  const pelipper = side('pelipper', 'drizzle'), surge = side('pincurchin', 'electric-surge')
  const view = await mount(pelipper, surge)
  try {
    await view.choose(0, 'sun'); await view.choose(1, 'none')
    await view.update(pelipper, surge, 0, [1, 0])
    assert.deepEqual(view.values(), ['rain', 'electric'])
    await view.choose(0, 'sun'); await view.choose(1, 'none')
    await view.update(pelipper, surge, 1, [1, 0])
    assert.deepEqual(view.values(), ['rain', 'electric'])
  } finally { await view.cleanup() }
})

test('selected damage uses the visible automatic field in both battle directions', async () => {
  const { loadFormLearnset } = await server.ssrLoadModule('/src/sharedLearnsets.ts')
  const { loadMoveMetaByName } = await server.ssrLoadModule('/src/dex/data.ts')
  await Promise.all([loadFormLearnset('pelipper'), loadFormLearnset('pincurchin'), loadMoveMetaByName()])
  for (const [key, ability, move, index, auto] of [
    ['pelipper', 'drizzle', '파도타기', 0, 'rain'],
    ['pincurchin', 'electric-surge', '10만볼트', 1, 'electric'],
  ]) {
    for (const direction of ['attacker', 'defender']) {
      const source = side(key, ability); source.moves[0] = move
      const neutralSide = side('starmie', '')
      const view = await mount(direction === 'attacker' ? source : neutralSide, direction === 'defender' ? source : neutralSide)
      try {
        assert.equal(view.values()[index], auto)
        const computed = view.host.querySelector('.quick-result h3')?.textContent
        assert.match(computed ?? '', /\d+–\d+/)
        await view.choose(index, 'none')
        const neutral = view.host.querySelector('.quick-result h3')?.textContent
        assert.match(neutral ?? '', /\d+–\d+/)
        assert.notEqual(computed, neutral, `${direction} ${key} ${move}: automatic field changes numerical damage`)
      } finally { await view.cleanup() }
    }
  }
})

test('standalone calculator stores manual none separately, not in matchup records', async () => {
  const view = await mount(side('pelipper', 'drizzle'), side('starmie', ''), false)
  try {
    assert.deepEqual(view.values(), ['rain', 'none'])
    await view.choose(0, 'none')
    assert.deepEqual(view.values(), ['none', 'none'])
    const saved = JSON.parse(localStorage.getItem('pokemon-champions-quick-damage:v1'))
    assert.equal(saved.attacker.ability, 'drizzle')
    assert.equal(saved.conditions.weather, 'none')
    assert.equal(saved.manualFields.weather, true)
    assert.equal(localStorage.getItem('pokemon-champions-comparison-build:v1:attacker:0'), null)
    await view.cleanup()
    localStorage.setItem('pokemon-champions-quick-damage:v1', JSON.stringify(saved))
    const reloaded = await mount(side('starmie', ''), side('starmie', ''), false)
    try {
      assert.deepEqual(reloaded.values(), ['none', 'none'])
      assert.equal(JSON.parse(localStorage.getItem('pokemon-champions-quick-damage:v1')).attacker.ability, 'drizzle')
    } finally { await reloaded.cleanup() }
  } catch (error) { if (view.host.isConnected) await view.cleanup(); throw error }
})

test('standalone species selection preserves manual weather and terrain with their ownership', async () => {
  const view = await mount(side('pelipper', 'drizzle'), side('starmie', ''), false)
  try {
    await view.choose(0, 'sun'); await view.choose(1, 'none')
    const input = view.host.querySelector('#quick-attacker')
    assert.ok(input)
    await act(async () => {
      Object.getOwnPropertyDescriptor(browser.HTMLInputElement.prototype, 'value').set.call(input, '한카리아스')
      input.dispatchEvent(new browser.Event('input', { bubbles: true }))
    })
    await act(async () => input.focus())
    const option = [...view.host.querySelectorAll('[role="option"]')].find(node => node.textContent.includes('한카리아스'))
    assert.ok(option, 'actual species option must exist')
    await act(async () => option.click())
    const saved = JSON.parse(localStorage.getItem('pokemon-champions-quick-damage:v1'))
    assert.equal(saved.attacker.key, 'garchomp', 'actual selection committed')
    assert.deepEqual(view.values(), ['sun', 'none'])
    assert.deepEqual(saved.manualFields, { weather: true, terrain: true })
    assert.equal(saved.conditions.weather, 'sun')
    assert.equal(saved.conditions.terrain, 'none')
  } finally { await view.cleanup() }
})
