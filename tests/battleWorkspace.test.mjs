import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { createServer } from 'vite'
import { Window } from 'happy-dom'
import { routeGroups } from '../src/app/navigation.ts'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const quickView = readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx', import.meta.url), 'utf8')
const quickCard = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const compactEditor = readFileSync(new URL('../src/shared/display/CompactStatEditor.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const key = 'pokemon-champions-assistant-demo:v1'
let server, App, createRoot
const browser = new Window({ url: 'http://localhost/#/party' })
Object.assign(globalThis, { window: browser, document: browser.document, localStorage: browser.localStorage, HTMLElement: browser.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })

test.before(async () => {
  ;({ createRoot } = await import('react-dom/client'))
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  App = (await server.ssrLoadModule('/src/App.tsx')).default
})
test.after(async () => { await browser?.happyDOM?.whenAsyncComplete?.(); await server?.close(); await browser?.happyDOM?.abort?.() })
async function mount() {
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(React.createElement(App)))
  return { host, async cleanup() { await act(async () => root.unmount()); host.remove() } }
}
async function navigate(hash) {
  await act(async () => { window.location.hash = hash; window.dispatchEvent(new window.Event('hashchange')) })
}

test('header renders named visible groups with native direct anchors, including home', async () => {
  assert.deepEqual(routeGroups.map(g => g.label), ['배틀', '분석 도구', '샘플', '도감'])
  const mounted = await mount()
  try {
    const nav = mounted.host.querySelector('#primary-navigation')
    assert.equal(nav.querySelector('a[href="#/"]')?.textContent, '홈')
    const groups = [...nav.querySelectorAll('.header-route-group')]
    assert.deepEqual(groups.map(g => g.getAttribute('aria-label')), routeGroups.map(g => g.label))
    assert.equal(groups.at(-1).querySelectorAll('.header-route-group-label').length, 0)
    assert.deepEqual(groups.flatMap(g => [...g.querySelectorAll('a')].map(a => a.getAttribute('href'))), routeGroups.flatMap(g => g.links.map(l => l.href)))
    assert.equal(nav.querySelectorAll('button,details,summary').length, 0)
  } finally { await mounted.cleanup() }
})

test('saved-party selector moves inside the single left entry pane without creating records', async () => {
  window.localStorage.removeItem(key)
  const mounted = await mount()
  try {
    const create = [...mounted.host.querySelectorAll('button')].find(button => button.textContent.trim() === '새 파티')
    await act(async () => create.click())
    const before = JSON.parse(window.localStorage.getItem(key))
    assert.equal(before.savedPartyPresets.length, 2)
    const bar = mounted.host.querySelector('.party-context-bar')
    assert.ok(bar)
    assert.equal(bar.querySelector('select').value, before.activePartyPresetId)
    assert.equal(bar.querySelector('a[href^="#/single"]')?.getAttribute('href')?.includes('my='), true)
    const first = before.savedPartyPresets.find(p => p.id !== before.activePartyPresetId)
    await act(async () => { bar.querySelector('select').value = first.id; bar.querySelector('select').dispatchEvent(new window.Event('change', { bubbles: true })) })
    assert.equal(JSON.parse(window.localStorage.getItem(key)).activePartyPresetId, first.id)
    assert.equal(JSON.parse(window.localStorage.getItem(key)).savedPartyPresets.length, 2)
    await navigate('#/single?tab=party&my=2&opp=3')
    const singleBar = mounted.host.querySelector('.party-context-bar')
    assert.ok(singleBar)
    assert.ok(singleBar.classList.contains('embedded'))
    assert.ok(singleBar.closest('.single-entry-picker-pane-party'))
    assert.equal(singleBar.querySelector('select').value, first.id)
    assert.equal(singleBar.querySelector('a'), null)
    assert.equal(mounted.host.querySelector('.unified-pair-buttons button[aria-pressed="true"]')?.textContent.includes('3.'), true)
    const beforeReselect = JSON.parse(window.localStorage.getItem(key))
    await act(async () => { singleBar.querySelector('select').dispatchEvent(new window.Event('change', { bubbles: true })) })
    const afterReselect = JSON.parse(window.localStorage.getItem(key))
    assert.equal(afterReselect.savedPartyPresets.length, 2)
    assert.equal(afterReselect.selectedMy, 2)
    assert.equal(afterReselect.selectedOpp, 3)
    assert.deepEqual(afterReselect.opponents, beforeReselect.opponents)
    assert.deepEqual(afterReselect.confirmedMovesByKey, beforeReselect.confirmedMovesByKey)
    assert.equal(afterReselect.activePartyPresetId, first.id)
  } finally { await mounted.cleanup() }
})

test('party screen keeps its matchup link while single removes the edit detour', async () => {
  const mounted = await mount()
  try {
    await navigate('#/party?my=4&opp=1')
    const link = mounted.host.querySelector('.party-context-bar a[href^="#/single"]')
    assert.equal(link?.getAttribute('href'), '#/single?tab=party&my=4&opp=1')
    await navigate('#/single?tab=party&my=4&opp=1')
    assert.equal(mounted.host.querySelector('.single-entry-picker-pane-party .party-context-bar a'), null)
  } finally { await mounted.cleanup() }
})

test('slot focus scrolls the editing input into view instead of centering a tall card', () => {
  assert.match(source, /if \(input\) input\.scrollIntoView\?\.\(\{ block: 'center' \}\)/)
  assert.doesNotMatch(source, /target\?\.scrollIntoView\?\.\(\{ block: 'center' \}\)/)
})

test('effective Speed comparison leaves base Speed in the lower stat tile', () => {
  assert.doesNotMatch(quickView, /quick-speed-base-badge|스피드 종족값|row\.speed/)
  assert.match(quickCard, /base: stat\.key === 'speed' \? projectedRow\.speed : undefined/)
  assert.match(compactEditor, /className="quick-compact-speed-base"/)
  assert.match(css, /\.quick-compact-tile-value > small\s*\{/)
})
