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
const { LEARNSET_SOURCE } = await server.ssrLoadModule('/src/sharedLearnsets.ts')
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

async function mount() {
  localStorage.clear()
  window.location.hash = '#/dex?dexTab=pokemon&sel=pokemon%3Agardevoir'
  const quick = JSON.stringify({ attacker: { key: 'unresolved-form', ability: 'raw unknown' }, defender: { key: '' } })
  localStorage.setItem('pokemon-champions-quick-damage:v1', quick)
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(React.createElement(App)))
  return { host, quick, async close() { await act(async () => root.unmount()); host.remove(); localStorage.clear() } }
}
async function click(element) { assert.ok(element); await act(async () => element.click()) }

test('a fresh direct Dex detail has one visible source/date/current-version notice outside home', async () => {
  const view = await mount()
  try {
    const notices = view.host.querySelectorAll('footer.app-data-notice')
    assert.equal(notices.length, 1)
    const notice = notices[0]
    assert.equal(notice.closest('main'), null, 'the notice is not inside a home-only branch')
    assert.match(notice.textContent, /2026-09-09/)
    assert.match(notice.textContent, /최신판과 다를 수 있음/)
    assert.equal(notice.querySelector('a').getAttribute('href'), `https://github.com/projectpokemon/champout/tree/${LEARNSET_SOURCE.commit}`)
    assert.equal(notice.querySelector('a').getAttribute('aria-label'), '기술 데이터 원본')
    assert.equal(notice.hidden, false)
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
