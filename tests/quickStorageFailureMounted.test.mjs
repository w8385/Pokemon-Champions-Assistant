import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const browser = new Window({ url: 'http://localhost/' })
Object.assign(globalThis, {
  window: browser,
  document: browser.document,
  HTMLElement: browser.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
})
const { createRoot } = await import('react-dom/client')
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
  logLevel: 'silent',
})
const [{ QuickDamagePanel }, { quickBlank }] = await Promise.all([
  server.ssrLoadModule('/src/features/damage/QuickDamagePanel.tsx'),
  server.ssrLoadModule('/src/features/damage/quickModel.ts'),
])

test.after(async () => {
  await server.close()
  await browser.happyDOM.abort()
})

function installStorage(storage) {
  Object.defineProperty(browser, 'localStorage', { configurable: true, value: storage })
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
}

async function renderPanel(props = {}) {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(React.createElement(QuickDamagePanel, {
    language: 'ko',
    tooltipForMove: () => ({}),
    ...props,
  })))
  return {
    host,
    cleanup: async () => {
      await act(async () => root.unmount())
      host.remove()
    },
  }
}

test('blocked standalone storage degrades to in-memory state without overwriting', async () => {
  let writes = 0
  installStorage({
    getItem() { throw new Error('blocked read') },
    setItem() { writes += 1; throw new Error('blocked write') },
    removeItem() { throw new Error('blocked remove') },
  })
  const view = await renderPanel()
  try {
    assert.ok(view.host.querySelector('.quick-damage'))
    assert.match(view.host.textContent, /저장 실패 · 변경은 현재 화면에만 유지/)
    assert.equal(writes, 0, 'a failed read must block the initial overwrite')
  } finally {
    await view.cleanup()
  }
})

test('comparison mode never reads the standalone quick key', async () => {
  const keys = []
  installStorage({
    getItem(key) { keys.push(key); throw new Error('blocked draft read') },
    setItem() { throw new Error('blocked draft write') },
    removeItem() { throw new Error('blocked draft remove') },
  })
  const own = quickBlank()
  const foe = quickBlank()
  const view = await renderPanel({
    comparisonMode: true,
    comparisonSlots: [0, 0],
    initialSides: [own, foe],
  })
  try {
    assert.ok(view.host.querySelector('.quick-damage'))
    assert.equal(keys.includes('pokemon-champions-quick-damage:v1'), false)
  } finally {
    await view.cleanup()
  }
})
