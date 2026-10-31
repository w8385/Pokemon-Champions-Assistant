import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import { routeGroups } from '../src/navigation.ts'

const browser = new Window({ url: 'http://localhost/#/' })
Object.assign(globalThis, { window: browser, document: browser.document, localStorage: browser.localStorage, HTMLElement: browser.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const App = (await server.ssrLoadModule('/src/App.tsx')).default
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

test('mounted home and header share seven native destinations, visible labels and decorative icons', async () => {
  localStorage.clear()
  const quickKey = 'pokemon-champions-quick-damage:v1'
  const unknownQuick = JSON.stringify({ attacker: { key: 'unresolved-form', ability: '미확인', moves: ['unresolved-move', '', '', ''] }, defender: { key: '', ability: '' } })
  localStorage.setItem(quickKey, unknownQuick)
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  try {
    await act(async () => { root.render(React.createElement(App)) })
    const links = routeGroups.flatMap(group => group.links)
    const header = [...host.querySelectorAll('#primary-navigation a')]
    const home = [...host.querySelectorAll('.home-route-card')]
    assert.equal(header.length, 8)
    assert.equal(home.length, 7)
    assert.equal(header[0].getAttribute('href'), '#/')
    assert.equal(header[0].getAttribute('aria-current'), 'page')
    for (const [index, link] of links.entries()) {
      const nav = header[index + 1], card = home[index]
      assert.equal(nav.getAttribute('href'), link.href)
      assert.equal(card.getAttribute('href'), link.href)
      assert.equal(nav.querySelector('span')?.textContent, link.label)
      assert.equal(card.querySelector('strong')?.textContent, link.label)
      assert.equal(nav.querySelectorAll('svg[aria-hidden="true"]').length, 1)
      assert.equal(card.querySelectorAll('svg[aria-hidden="true"]').length, 2)
      assert.equal(nav.hasAttribute('aria-current'), false)
    }
    assert.equal(host.querySelectorAll('.page-heading h2').length, 1)
    assert.equal(host.querySelector('.page-heading h2')?.textContent, '홈')
    assert.ok(host.querySelector('.page-heading svg[aria-hidden="true"]'))
    for (const label of ['언어 선택', '설정']) {
      const button = host.querySelector(`button[aria-label="${label}"]`)
      assert.ok(button, label)
      assert.ok(button.querySelector('svg[aria-hidden="true"]'))
    }
    assert.equal(localStorage.getItem(quickKey), unknownQuick, 'home navigation must not hydrate or rewrite independent unknown Quick records')
  } finally {
    await act(async () => root.unmount())
    host.remove()
    localStorage.clear()
  }
})
