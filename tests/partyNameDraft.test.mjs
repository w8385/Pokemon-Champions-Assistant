import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
let createRoot
import { createServer } from 'vite'
import { Window } from 'happy-dom'

let server, App, browser
const storageKey = 'pokemon-champions-assistant-demo:v1'
test.before(async () => {
  browser = new Window({ url: 'http://localhost/#/party' })
  Object.assign(globalThis, { window: browser, document: browser.document, HTMLElement: browser.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
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
async function type(input, value) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value)
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
}
const activeLabel = () => {
  const data = JSON.parse(window.localStorage.getItem(storageKey))
  return data.savedPartyPresets.find(record => record.id === data.activePartyPresetId).label
}
test('clearing live name permits replacement without prefix but never stores a blank label', async () => {
  const mounted = await mount()
  try {
    const input = mounted.host.querySelector('.party-active-name input')
    assert.ok(input, 'selected party name input exists')
    const original = input.value
    await type(input, '')
    assert.equal(input.value, '')
    assert.equal(activeLabel(), original)
    await type(input, '새 이름')
    assert.equal(input.value, '새 이름')
    assert.equal(activeLabel(), '새 이름')
    await type(input, '  ')
    assert.equal(input.value, '  ')
    assert.equal(activeLabel(), '새 이름')
    await act(async () => { input.focus(); input.blur() })
    assert.equal(input.value, '새 이름')
  } finally { await mounted.cleanup() }
})

test('selection swaps the name draft and reload restores the selected record', async () => {
  window.localStorage.removeItem(storageKey)
  const mounted = await mount()
  let selectedName
  try {
    const input = mounted.host.querySelector('.party-active-name input')
    const original = input.value
    const newPartyButton = [...mounted.host.querySelectorAll('button')].find(button => button.textContent.trim() === '새 파티')
    assert.ok(newPartyButton)
    await act(async () => newPartyButton.click())
    assert.equal(input.value, '새 파티')
    await type(input, '새 파티 B')
    selectedName = input.value
    await type(input, '')
    const oldCard = [...mounted.host.querySelectorAll('.party-preset-card-main')].find(card => card.textContent.includes(original))
    assert.ok(oldCard)
    await act(async () => oldCard.click())
    assert.equal(input.value, original)
    const newCard = [...mounted.host.querySelectorAll('.party-preset-card-main')].find(card => card.textContent.includes(selectedName))
    await act(async () => newCard.click())
    assert.equal(input.value, selectedName)
    assert.equal(activeLabel(), selectedName)
  } finally { await mounted.cleanup() }
  const reloaded = await mount()
  try { assert.equal(reloaded.host.querySelector('.party-active-name input').value, selectedName) }
  finally { await reloaded.cleanup() }
})

test('mounted autosave reports throwing localStorage getter and retry persists latest record', async () => {
  window.localStorage.removeItem(storageKey)
  const mounted = await mount()
  const nativeStorage = window.localStorage
  try {
    const original = nativeStorage.getItem(storageKey)
    Object.defineProperty(window, 'localStorage', {configurable:true,get(){throw Error('denied')}})
    await act(async () => [...mounted.host.querySelectorAll('button')].find(button => button.textContent.trim() === '새 파티').click())
    assert.match(mounted.host.textContent,/저장 실패 · 변경은 현재 화면에만 유지/)
    assert.ok(mounted.host.querySelector('.party-preset-card.active'))
    assert.equal(nativeStorage.getItem(storageKey),original)
    Object.defineProperty(window, 'localStorage', {configurable:true,get(){return nativeStorage}})
    await act(async () => [...mounted.host.querySelectorAll('button')].find(button => button.textContent.trim() === '저장 재시도').click())
    assert.match(mounted.host.textContent,/자동 저장됨/)
    const written = JSON.parse(nativeStorage.getItem(storageKey))
    assert.equal(written.activePartyPresetId,written.savedPartyPresets[0].id)
    assert.equal(written.savedPartyPresets.length,2)
  } finally {
    Object.defineProperty(window, 'localStorage', {configurable:true,get(){return nativeStorage}})
    await mounted.cleanup()
  }
})
