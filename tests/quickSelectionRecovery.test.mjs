import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const browser = new Window({ url: 'http://localhost/#/damage' })
Object.assign(globalThis, {
  window: browser,
  document: browser.document,
  localStorage: browser.localStorage,
  HTMLElement: browser.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
})
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const modules = await Promise.all([
  '/src/App.tsx',
  '/src/features/damage/QuickDamagePanel.tsx',
  '/src/features/damage/quickModel.ts',
  '/src/features/damage/useQuickDamageState.ts',
].map(path => server.ssrLoadModule(path)))
const { QuickDamagePanel, quickSide, quickDefaultConditions, firstQuickMoveSelection } = Object.assign({}, ...modules)
const { loadFormLearnset } = await server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts')
const { loadMoveMetaByName } = await server.ssrLoadModule('/src/adapters/catalog/data.ts')

test.before(async () => {
  await Promise.all([loadFormLearnset('starmie'), loadFormLearnset('pelipper'), loadMoveMetaByName()])
})
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

const side = (key, moves) => quickSide({ key, moves })
const selectedPreview = host => host.querySelector('.quick-move-preview[aria-pressed="true"]')

async function mount(props) {
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
    async render(next) {
      await act(async () => root.render(React.createElement(QuickDamagePanel, {
        language: 'ko',
        tooltipForMove: () => ({}),
        ...next,
      })))
    },
    async close() {
      await act(async () => root.unmount())
      host.remove()
      localStorage.clear()
    },
  }
}

test('first move selection prefers the requested side, falls back across sides, and has a stable empty state', () => {
  assert.deepEqual(firstQuickMoveSelection(['', '', 'A', ''], ['', 'B', '', '']), { side: 'attacker', index: 2 })
  assert.deepEqual(firstQuickMoveSelection(['', '', 'A', ''], ['', 'B', '', ''], 'defender'), { side: 'defender', index: 1 })
  assert.deepEqual(firstQuickMoveSelection(['', '', 'A', ''], ['', '', '', ''], 'defender'), { side: 'attacker', index: 2 })
  assert.deepEqual(firstQuickMoveSelection(['', '', '', ''], ['', '', '', ''], 'defender'), { side: 'attacker', index: 0 })
})

test('slot-local moveHits are the only hit-count condition authority', () => {
  assert.equal(Object.hasOwn(quickDefaultConditions(), 'hits'), false)
  assert.deepEqual(quickDefaultConditions().moveHits, {})
})

test('standalone restore selects the first actual saved move instead of an empty slot zero', async () => {
  localStorage.clear()
  const attacker = side('starmie', ['', '', '파도타기', ''])
  const defender = side('pelipper', ['폭풍', '', '', ''])
  const moveHits = { 'attacker:2:파도타기': 3 }
  localStorage.setItem('pokemon-champions-quick-damage:v1', JSON.stringify({ attacker, defender, conditions: { hits: 9, moveHits } }))
  const view = await mount({})
  try {
    assert.match(selectedPreview(view.host)?.getAttribute('aria-label') ?? '', /포켓몬 1 3 기술 · 파도타기/)
    assert.equal(view.host.querySelectorAll('.quick-move-preview[aria-live="polite"]').length, 1)
    const rewritten = JSON.parse(localStorage.getItem('pokemon-champions-quick-damage:v1'))
    assert.equal(Object.hasOwn(rewritten.conditions, 'hits'), false, 'legacy global hits is ignored and not persisted again')
    assert.deepEqual(rewritten.conditions.moveHits, moveHits, 'slot-local hit counts survive restore')
  } finally { await view.close() }
})

test('a selected slot removed by a comparison seed update recovers to the first filled move', async () => {
  localStorage.clear()
  const initial = [side('starmie', ['파도타기', '', '', '']), side('pelipper', ['', '폭풍', '', ''])]
  const props = { comparisonMode: true, comparisonSlots: [0, 0], initialSides: initial }
  const view = await mount(props)
  try {
    const defenderPreview = view.host.querySelector('.quick-side-card[data-side="defender"] .quick-move-preview')
    assert.ok(defenderPreview)
    await act(async () => defenderPreview.click())
    assert.match(selectedPreview(view.host)?.getAttribute('aria-label') ?? '', /상대 포켓몬 2 기술 · 폭풍/)

    const next = [side('starmie', ['', '', '파도타기', '']), side('pelipper', ['', '', '', ''])]
    await view.render({ ...props, initialSides: next })
    assert.match(selectedPreview(view.host)?.getAttribute('aria-label') ?? '', /내 포켓몬 3 기술 · 파도타기/)
    assert.equal(view.host.querySelectorAll('.quick-move-preview[aria-live="polite"]').length, 1)
  } finally { await view.close() }
})
