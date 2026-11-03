import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const browser = new Window({ url: 'http://localhost/#/dex?dexTab=pokemon&sel=pokemon%3Agardevoir' })
Object.assign(globalThis, { window: browser, document: browser.document, localStorage: browser.localStorage, HTMLElement: browser.HTMLElement, Element: browser.Element, IS_REACT_ACT_ENVIRONMENT: true })
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const App = (await server.ssrLoadModule('/src/App.tsx')).default
const { LEARNSET_SOURCE } = await server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts')
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

async function mount(hash = '#/dex?dexTab=pokemon&sel=pokemon%3Agardevoir') {
  localStorage.clear()
  window.location.hash = hash
  const quick = JSON.stringify({ attacker: { key: 'unresolved-form', ability: 'raw unknown' }, defender: { key: '' } })
  localStorage.setItem('pokemon-champions-quick-damage:v1', quick)
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(React.createElement(App)))
  return { host, quick, async close() { await act(async () => root.unmount()); host.remove(); localStorage.clear() } }
}
async function click(element) { assert.ok(element); await act(async () => element.click()) }

test('a direct Dex detail omits the rejected global snapshot banner without changing source metadata', async () => {
  const view = await mount()
  try {
    assert.ok(!view.host.querySelector('.app-data-notice'), 'remove the rejected global snapshot banner')
    assert.doesNotMatch(view.host.textContent, /최신판과 다를 수 있음/)
    assert.equal(LEARNSET_SOURCE.date, '2026-09-09')
    assert.equal(LEARNSET_SOURCE.commit, '50e7233b78c3b81df29563f9695386c28e77fc95')
  } finally { await view.close() }
})

test('Home project information is an ordinary visible section with its original links and copyright', async () => {
  const view = await mount('#/')
  try {
    const project = view.host.querySelector('section.home-footer-text-block')
    assert.ok(project)
    assert.equal(project.closest('details'), null)
    assert.match(project.querySelector('h3').textContent, /프로젝트 정보/)
    assert.equal(project.querySelectorAll('a').length, 3)
    assert.match(project.textContent, /비공식 팬메이드/)
    assert.match(project.textContent, /PokéAPI/)
    assert.ok(!view.host.querySelector('.app-data-notice'), 'remove the rejected global snapshot banner')
  } finally { await view.close() }
})

test('global reset cancellation preserves all raw storage and keeps the settings menu open', async () => {
  const view = await mount(); const originalConfirm = window.confirm; const calls = []
  try {
    await click(view.host.querySelector('button[aria-label="설정"]'))
    const before = Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)]))
    window.confirm = message => { calls.push(message); return false }
    await click(view.host.querySelector('.settings-action-item.danger'))
    assert.equal(calls.length, 1)
    assert.match(calls[0], /저장 파티·상대·샘플·저장 링크/)
    assert.match(calls[0], /독립 계산기 데이터는 유지/)
    assert.deepEqual(Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])), before)
    assert.ok(view.host.querySelector('.settings-action-item.danger'))
  } finally { window.confirm = originalConfirm; await view.close() }
})

test('confirmed global reset clears the stated records but preserves standalone calculator data', async () => {
  const view = await mount(); const originalConfirm = window.confirm
  try {
    const before = JSON.parse(localStorage.getItem('pokemon-champions-assistant-demo:v1'))
    assert.ok(before.party.some(member => member.key))
    await click(view.host.querySelector('button[aria-label="설정"]'))
    window.confirm = () => true
    await click(view.host.querySelector('.settings-action-item.danger'))
    const after = JSON.parse(localStorage.getItem('pokemon-champions-assistant-demo:v1'))
    assert.ok(after.party.every(member => !member.key))
    assert.ok(after.opponents.every(member => !member.key))
    assert.equal(after.savedPartyPresets.length, 1)
    assert.deepEqual(after.savedSamples, [])
    assert.deepEqual(after.creatorLinkDrafts, [])
    assert.equal(localStorage.getItem('pokemon-champions-quick-damage:v1'), view.quick)
    assert.equal(view.host.querySelector('.settings-action-item.danger'), null)
  } finally { window.confirm = originalConfirm; await view.close() }
})
