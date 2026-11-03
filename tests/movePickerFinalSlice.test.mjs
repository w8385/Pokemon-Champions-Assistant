import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { createServer } from 'vite'
import { Window } from 'happy-dom'
import ts from 'typescript'
import vm from 'node:vm'
import { localizedChampionsItemLabel } from '../src/domain/champions/championsItems.ts'
import { canonicalHeldItem } from '../src/domain/champions/itemIdentity.ts'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const cardSource = readFileSync(new URL('../src/shared/display/PokemonCardOverview.tsx', import.meta.url), 'utf8')
test('all editable callers use shared candidate row, including sample damage and both legacy adders', () => {
  assert.match(cardSource, /export function MoveCandidateRow/)
  for (const id of ['quick-${side}-move-${index}', 'sample-move-${sampleForge.key}-${moveIdx}', 'party-move-${member.key}-${moveIdx}', 'sample-opponent-move-${entry.member.key}-${slot}']) {
    const index = source.indexOf('id: `'+id+'`')
    assert.ok(index > 0, `missing ${id}`)
    assert.match(source.slice(index, index + 1400), /MoveCandidateRow/)
  }
  for (const id of ['opp-entry-move-${selectedOpp}', 'calc-opp-move-${selectedOpp}']) {
    assert.match(source, new RegExp('<SearchCombobox id={`'+id.replace(/[${}]/g, m => '\\'+m)+'`'))
  }
  assert.doesNotMatch(source, /moveAutocompleteMenuHighlight\(`(?:opp-entry-move|calc-opp-move)/)
})

test('shared candidate renders type, known and unknown metadata; hover/focus and IME guards remain mounted', async () => {
  const window = new Window({ url: 'http://localhost/' })
  Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
  const { createRoot } = await import('react-dom/client')
  const { act } = await import('react')
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { RegisteredMoveSlot, MoveCandidateRow } = await vite.ssrLoadModule('/src/shared/display/PokemonCardOverview.tsx')
    const host = document.createElement('div'); document.body.append(host)
    const picked = [], calls = []
    const options = [{ key: '얼음엄니', label: '얼음엄니' }, { key: '미확인기술', label: '미확인기술' }]
    const labels = { slot: '번', category: x => x, power: '위력', accuracy: '명중', pp: 'PP', unknown: '미확인' }
    const root = createRoot(host)
    await act(async () => root.render(React.createElement(RegisteredMoveSlot, { number: 4, name: '얼음', labels, inputProps: { onChange(){}, onFocus: () => calls.push('editor-focus'), onBlur: () => calls.push('editor-blur') }, tooltipProps: { onFocus: () => calls.push('tip-focus'), onBlur: () => calls.push('tip-blur') }, search: { id: 'mounted-move', options, onSelect: o => picked.push(o.key), renderOption: o => React.createElement(MoveCandidateRow, { name: o.label, type: o.key === '얼음엄니' ? 'ice' : null, meta: o.key === '얼음엄니' ? { category: 'physical', power: 65, accuracy: 95, pp: 15 } : null, labels }) } })))
    const input = host.querySelector('input'); await act(async () => input.focus())
    assert.deepEqual(calls, ['tip-focus', 'editor-focus'])
    assert.equal(host.querySelectorAll('[role="option"]').length, 2)
    assert.ok(host.querySelector('[role="option"] img'))
    assert.match(host.textContent, /위력 65.*명중 95%.*PP 15/)
    assert.match(host.textContent, /미확인/)
    const key = (name, code = 13) => act(async () => input.dispatchEvent(new window.KeyboardEvent('keydown', { key: name, keyCode: code, bubbles: true, cancelable: true })))
    await act(async () => input.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles: true })))
    await key('Enter'); await key('Enter', 229); assert.deepEqual(picked, [])
    await act(async () => input.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles: true })))
    await key('ArrowDown'); await key('ArrowDown'); await key('Enter'); assert.deepEqual(picked, ['미확인기술'])
    await key('Enter'); assert.equal(picked.length, 1)
    await act(async () => input.blur()); assert.deepEqual(calls.slice(-2), ['tip-blur', 'editor-blur'])
    await act(async () => root.unmount()); host.remove()
  } finally { await vite.close(); await window.happyDOM.abort() }
})

test('item label uses loaded localized source name only as registry fallback', () => {
  assert.match(source, /function displayItemLabel\([^]*?resolveItemInfo\(/)
  assert.match(source, /asyncDataVersion, deferredDexSearch, siteLanguage/)
})

test('actual lazy source names localize both canonical and raw alias without changing identity', async () => {
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const { loadDexDescriptions, resolveItemInfo } = await vite.ssrLoadModule('/src/adapters/catalog/data.ts')
    const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    let func
    function visit(node) { if (ts.isFunctionDeclaration(node) && node.name?.text === 'displayItemLabel') func = node; ts.forEachChild(node, visit) }
    visit(ast)
    assert.ok(func)
    const context = vm.createContext({ localizedChampionsItemLabel, canonicalChampionsItemName: canonicalHeldItem, resolveItemInfo, translateText: (_language, raw) => raw })
    vm.runInContext(ts.transpileModule(`${func.getText(ast)};globalThis.label=displayItemLabel`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
    await loadDexDescriptions()
    for (const raw of ['후딘나이트', '후디나이트']) {
      assert.equal(resolveItemInfo(raw)?.key, '후딘나이트')
      assert.equal(context.label(raw, 'ko'), '후디나이트')
      assert.equal(context.label(raw, 'en'), 'Alakazite')
      assert.equal(context.label(raw, 'ja'), 'フーディナイト')

    }
  } finally { await vite.close() }
})
