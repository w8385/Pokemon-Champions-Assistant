import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import { defaultSpeedLineState, parseSpeedLineState, writeSpeedLineState } from '../src/speedLineState.ts'

const rows = [
  { key: 'starmie', speed: 115, name_ko: '스타미', name_en: 'Starmie', types: [] },
  { key: 'venusaur', speed: 80, name_ko: '이상해꽃', name_en: 'Venusaur', types: [] },
  { key: 'garchomp', speed: 102, name_ko: '한카리아스', name_en: 'Garchomp', types: [] },
]
let server, Panel
 test.before(async () => { server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } }); Panel = (await server.ssrLoadModule('/src/SpeedLineRangesPanel.tsx')).default })
test.after(async () => { await server?.close() })

test('number draft suppresses stale result; slider, effort group and cut selection persist through the actual state handler', async () => {
  const window = new Window({ url: 'http://localhost/' })
  globalThis.window = window
  globalThis.document = window.document
  globalThis.HTMLElement = window.HTMLElement
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const { createRoot } = await import('react-dom/client')
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  let state = { ...defaultSpeedLineState, referenceKey: 'starmie', referenceEffort: 0 }
  const onChange = next => { state = next; root.render(React.createElement(Panel, { rows, state, onChange, language: 'ko', translate: x => x, displayName: x => x.name_ko })) }
  const setInput = (input, value) => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value); input.dispatchEvent(new window.Event('input', { bubbles: true })); input.dispatchEvent(new window.Event('change', { bubbles: true })) }
  try {
    await act(async () => onChange(state))
    assert.match(container.textContent, /내 현재 스피드 148/)
    assert.match(container.textContent, /다음 추월컷: 6/)
    const targetList = container.querySelector('#speed-coverage-target-list')
    assert.equal(container.querySelectorAll('.speed-coverage-table .speed-coverage-target-item').length, 0)
    assert.equal(targetList.querySelectorAll('[role="listitem"]').length, 2)
    const targetSearch = container.querySelector('#speed-coverage-target-search')
    await act(async () => setInput(targetSearch, '이상해'))
    assert.equal(targetList.querySelectorAll('[role="listitem"]').length, 2)
    assert.match(targetList.textContent, /이상해꽃/)
    await act(async () => setInput(targetSearch, '일반 최속'))
    assert.equal(targetList.querySelectorAll('[role="listitem"]').length, 1)
    assert.equal(state.referenceEffort, 0)
    assert.match(container.querySelector('.speed-coverage-summary').textContent, /현재 추월 커버리지/)
    const number = container.querySelector('input[type="number"]')
    await act(async () => setInput(number, '33'))
    assert.equal(number.getAttribute('aria-invalid'), 'true')
    assert.equal(container.querySelector('.speed-coverage-summary'), null)
    assert.equal(state.referenceEffort, 0)
    await act(async () => setInput(number, '5'))
    assert.equal(state.referenceEffort, 5)
    assert.match(container.textContent, /내 현재 스피드 154/)
    assert.match(container.textContent, /동속: 1/)
    const nextCut = container.querySelector('.speed-coverage-summary .speed-coverage-cut')
    await act(async () => nextCut.click())
    assert.deepEqual([state.view, state.targetKey, state.targetItem, state.listEffort, state.listNature, state.referenceStage, state.referenceAbility], ['detail', 'garchomp', 'normal', 32, 'neutral', 0, null])
    await act(async () => onChange({ ...state, view: 'ranges' }))
    const slider = container.querySelector('input[type="range"]')
    await act(async () => setInput(slider, '6'))
    assert.equal(state.referenceEffort, 6)
    assert.equal(container.querySelector('#speed-coverage-target-search').value, '')
    const group = container.querySelector('tr[data-effort-start="20"] .speed-coverage-effort-action')
    await act(async () => group.click())
    assert.equal(state.referenceEffort, 20)
    assert.equal(container.querySelector('.speed-coverage-targets h3').textContent.includes('20'), true)
    await act(async () => setInput(container.querySelector('#speed-coverage-target-search'), '한카'))
    assert.match(container.querySelector('#speed-coverage-target-list').textContent, /한카리아스/)
    assert.equal(container.querySelector('.speed-coverage-targets p').textContent.includes('1/'), true)
    await act(async () => onChange({ ...state, referenceNature: 'neutral' }))
    assert.equal(container.querySelector('#speed-coverage-target-search').value, '')
    assert.equal(state.referenceEffort, 20)
    const params = new URLSearchParams()
    writeSpeedLineState(params,state)
    assert.equal(params.get('view'),'ranges')
    assert.equal(params.get('refEp'),'20')
    assert.equal(parseSpeedLineState(params).state.referenceEffort,20)
  } finally {
    await act(async () => root.unmount())
    window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.HTMLElement
  }
})
