import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
test('every editable owner and library mount the actual four-slot shell, not separate grids', () => {
  for (const marker of ['quick-${side}-move-${index}', 'sample-move-${sampleForge.key}-${moveIdx}', 'party-move-${member.key}-${moveIdx}', 'sample-opponent-move-${entry.member.key}-${slot}', 'creator-library-moves']) {
    const owner = marker.startsWith('quick-') ? readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8') : app
    const region = owner.slice(Math.max(0, owner.indexOf(marker) - 4500), owner.indexOf(marker) + 4500)
    assert.ok(region.includes('<MoveSlotsEditor'), marker)
  }
  assert.match(app, /renderSampleMoveEditor\([^)]*\)/)
  assert.doesNotMatch(app, /<div className="registered-move-grid (?:quick|sample)/)
})
test('one grid policy and outer shell for all parent widths and fixed upper editor geometry', () => {
  assert.match(css, /\.move-slots-editor\s*\{/)
  assert.match(css, /\.move-slots-editor-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2/)
  assert.match(css, /@media\s*\(max-width:\s*600px\)[^{]*\{\s*\.move-slots-editor-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
  assert.match(css, /\.move-slots-editor-slot\.registered-move-slot\s*\{[^}]*min-height:/)
  assert.match(css, /\.move-slots-editor-preview\s*\{[^}]*min-height:/)
})
test('mounted shell retains four positional blanks, owner state, selection, readOnly, tooltip and IME', async () => {
  const window = new Window({ url: 'http://localhost/' })
  Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
  const { createRoot } = await import('react-dom/client')
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { MoveSlotsEditor } = await vite.ssrLoadModule('/src/shared/display/PokemonCardOverview.tsx')
    assert.ok(MoveSlotsEditor)
    const host = document.createElement('div'); document.body.append(host)
    const root = createRoot(host), picked = [], tip = [], values = ['Ice Fang', '', '', 'Thunderbolt']
    const labels = { slot: ' · Move', category: x => x, power: 'Power', accuracy: 'Accuracy', pp: 'PP', unknown: 'Unknown' }
    const render = (readOnly = false, selectedIndex = 3) => React.createElement(MoveSlotsEditor, { label: 'Moves', labels, ownerId: 'fixture', role: readOnly ? 'readonly' : 'editable', selectedIndex, slots: values.map((name, index) => ({ id: String(index), name, type: index === 0 ? 'ice' : null, meta: null, inputProps: { readOnly, onChange: e => { values[index] = e.target.value }, onFocus: () => tip.push('input-focus') }, tooltipProps: { onFocus: () => tip.push('tip-focus'), onMouseEnter: () => tip.push('tip-hover') }, search: { id: `move-${index}`, options: [{ key: 'Thunderbolt', label: 'Thunderbolt' }], onSelect: option => picked.push([index, option.key]), showAllOnEmpty: true }, preview: index === 3 ? 'preview' : null })) })
    await act(async () => root.render(render()))
    assert.equal(host.querySelectorAll('.move-slots-editor-slot').length, 4)
    assert.deepEqual([...host.querySelectorAll('.move-slots-editor-slot input')].map(x => x.value), values)
    assert.equal(host.querySelectorAll('.move-slots-editor-slot[data-selected="true"]').length, 1)
    assert.equal(host.querySelector('.move-slots-editor-slot[data-selected="true"] input').value, 'Thunderbolt')
    assert.equal(host.querySelectorAll('.move-slots-editor-preview').length, 4)
    assert.ok([...host.querySelectorAll('.move-slots-editor-slot')].every(slot => slot.querySelector('.registered-move-slot-head') && slot.querySelector('input') && slot.querySelector('.registered-move-meta')))
    const input = host.querySelectorAll('input')[0]
    await act(async () => input.focus())
    assert.deepEqual(tip.slice(-2), ['tip-focus', 'input-focus'])
    await act(async () => input.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles: true })))
    await act(async () => input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, bubbles: true, cancelable: true })))
    assert.deepEqual(picked, [])
    await act(async () => input.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles: true })))
    await act(async () => input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true, cancelable: true })))
    assert.deepEqual(picked, [[0, 'Thunderbolt']])
    values[1] = 'Ice Fang'
    await act(async () => root.render(render(false, 1)))
    assert.deepEqual([...host.querySelectorAll('.move-slots-editor-slot input')].map(x => x.value), values)
    assert.equal(host.querySelector('.move-slots-editor-slot[data-selected="true"] input').value, 'Ice Fang')
    await act(async () => root.render(render(true, null)))
    assert.equal(host.querySelectorAll('input[readonly]').length, 4)
    assert.equal(host.querySelectorAll('[data-selected="true"]').length, 0)
    assert.equal(host.querySelectorAll('[role="option"]').length, 0)
    assert.deepEqual(values, ['Ice Fang', 'Ice Fang', '', 'Thunderbolt'])
    assert.equal(host.querySelector('.move-slots-editor-preview').textContent, '')
    await act(async () => root.unmount()); host.remove()
  } finally { await vite.close(); await window.happyDOM.abort() }
})
