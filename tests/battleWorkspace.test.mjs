import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { createServer } from 'vite'
import { Window } from 'happy-dom'
import { routeGroups } from '../src/navigation.ts'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
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

test('same PartyContextBar on party and single selects the existing saved record without creating one', async () => {
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
    assert.equal(singleBar.querySelector('select').value, first.id)
    assert.equal(singleBar.querySelector('a[href^="#/party"]')?.getAttribute('href'), '#/party?my=2&opp=3&edit=2')
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

test('party slot link targets stable card and does not mutate selection before native navigation', async () => {
  const mounted = await mount()
  try {
    await navigate('#/single?tab=party&my=4&opp=1')
    const link = mounted.host.querySelector('.party-context-bar a[href^="#/party"]')
    assert.equal(link.getAttribute('href'), '#/party?my=4&opp=1&edit=4')
    // happy-dom navigates modified anchors in-place; suppress its default action, not the App handler.
    link.addEventListener('click', event => event.preventDefault(), { once: true })
    link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, ctrlKey: true, cancelable: true }))
    assert.equal(new URL(window.location.hash.slice(1), 'http://localhost').pathname, '/single')
    assert.equal(new URL(window.location.hash.slice(1), 'http://localhost').searchParams.get('my'), '4')
    await navigate(link.getAttribute('href'))
    assert.equal(mounted.host.querySelector('#party-slot-4')?.classList.contains('party-entry-target'), true)
    assert.equal(document.activeElement?.id, 'party-species-4')
  } finally { await mounted.cleanup() }
})

test('slot focus scrolls the editing input into view instead of centering a tall card', () => {
  assert.match(source, /if \(input\) input\.scrollIntoView\?\.\(\{ block: 'center' \}\)/)
  assert.doesNotMatch(source, /target\?\.scrollIntoView\?\.\(\{ block: 'center' \}\)/)
})

test('shared speed renderer distinguishes base stat badge from effective comparison', () => {
  assert.match(source, /className="quick-speed-base-badge"/)
  assert.match(source, /\{lt\('스피드 종족값'\)\} \{row\.speed\}/)
  assert.match(css, /\.quick-speed-base-badge\s*\{/)
})
