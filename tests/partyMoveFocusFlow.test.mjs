import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const browser = new Window({ url: 'http://localhost/#/party' })
Object.assign(globalThis, {
  window: browser,
  document: browser.document,
  HTMLElement: browser.HTMLElement,
  HTMLInputElement: browser.HTMLInputElement,
  Element: browser.Element,
  Node: browser.Node,
  IS_REACT_ACT_ENVIRONMENT: true,
})
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: browser.navigator })
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const { PartyMemberCard } = await server.ssrLoadModule('/src/features/party/PartyMemberCard.tsx')
const { loadFormLearnset } = await server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts')
const { loadUsageTopMovesByKey } = await server.ssrLoadModule('/src/adapters/catalog/data.ts')
const pool = await loadFormLearnset('starmie')
await loadUsageTopMovesByKey()

test.after(async () => {
  await server.close()
  await browser.happyDOM.abort()
})

const member = {
  key: 'starmie',
  config: { nature: 'timid', scarf: false, speedStage: 0 },
  picked: false,
  evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
  tuning: { magicNumber: 0, maxValue: 0 },
  item: '',
  ability: '',
}
const labels = { slot: '번', category: value => value ?? '미확인', power: '위력', accuracy: '명중', pp: 'PP', unknown: '미확인' }
const typeInto = (input, value) => {
  Object.getOwnPropertyDescriptor(browser.HTMLInputElement.prototype, 'value').set.call(input, value)
  input.dispatchEvent(new browser.Event('input', { bubbles: true }))
}

async function mount(initialMoves) {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const state = { activeMoveField: null, moveInputDraft: null }
  function Harness() {
    const [confirmed, setConfirmed] = React.useState({ starmie: initialMoves })
    const [activeMoveField, setActiveMoveField] = React.useState(null)
    const [moveInputDraft, setMoveInputDraft] = React.useState(null)
    const [moveCommitNotice, setMoveCommitNotice] = React.useState(null)
    state.activeMoveField = activeMoveField
    state.moveInputDraft = moveInputDraft
    const setSlot = (slot, name) => setConfirmed(previous => {
      const next = Array.from({ length: 4 }, (_, index) => previous.starmie[index] ?? '')
      next[slot] = name
      return { starmie: next }
    })
    const movePort = {
      activeMoveField,
      moveInputDraft,
      moveCommitNotice,
      setActiveMoveField,
      setMoveInputDraft,
      setMoveCommitNotice,
      selectMoveOption: (_key, slot, name) => { setSlot(slot, name); setMoveInputDraft(null); setActiveMoveField(null) },
      commitEditorMove: (raw, previous, _pool, _key, slot) => {
        const next = raw.trim()
        if (next !== previous) setSlot(slot, next)
        setMoveInputDraft(null)
      },
      applyMoveToSlot: (_key, name, preferredSlot) => setConfirmed(previous => {
        const next = Array.from({ length: 4 }, (_, index) => previous.starmie[index] ?? '')
        const target = preferredSlot ?? next.findIndex(value => !value.trim())
        next[target >= 0 ? target : 3] = name
        return { starmie: next }
      }),
    }
    return React.createElement(PartyMemberCard, {
      member,
      idx: 2,
      editorIdentity: 'fixture',
      siteLanguage: 'ko',
      mainSection: 'party',
      editor: { partySearch: [''], setPartySearch() {}, clearPartySlot() {}, selectPartySpecies() {} },
      setParty() {},
      confirmedMovesByKey: confirmed,
      movePoolByKey: { starmie: pool },
      moveSlotLabels: labels,
      moves: movePort,
      tooltip: { bindTooltip: () => ({}), abilityTooltipData: () => null, itemTooltipData: () => null, moveTooltipData: () => null },
    })
  }
  await act(async () => root.render(React.createElement(Harness)))
  return { host, state, close: async () => { await act(async () => root.unmount()); host.remove() } }
}

test('party move picker skips occupied gaps and keeps focus in the clicked card', async () => {
  const view = await mount(['파도타기', '냉동빔', '', '10만볼트'])
  try {
    const first = view.host.querySelector('#party-2-starmie-move-0')
    await act(async () => first.focus())
    const option = view.host.querySelector('#party-2-starmie-move-0-options [role="option"]')
    assert.ok(option)
    await act(async () => {
      option.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(document.activeElement?.id, 'party-2-starmie-move-2')
    assert.equal(document.activeElement?.getAttribute('aria-expanded'), 'true')
  } finally { await view.close() }
})

test('party usage suggestion preserves the focused target and retires its draft before advancing', async () => {
  const view = await mount(['냉동빔', '', '10만볼트', ''])
  try {
    const target = view.host.querySelector('#party-2-starmie-move-1')
    assert.ok(target)
    await act(async () => {
      target.focus()
      typeInto(target, '아쿠아제트')
    })
    const suggestion = [...view.host.querySelectorAll('.move-usage-suggestion')].find(button => button.getAttribute('aria-pressed') !== 'true' && !button.disabled)
    assert.ok(suggestion)
    const selectedName = suggestion.textContent.trim()
    await act(async () => {
      assert.equal(suggestion.dispatchEvent(new browser.PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch' })), false, 'usage touch keeps the slot input focused through click')
      assert.equal(suggestion.dispatchEvent(new browser.MouseEvent('mousedown', { bubbles: true, cancelable: true })), false, 'usage pointer keeps the slot input focused through click')
      suggestion.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(view.host.querySelector('#party-2-starmie-move-1')?.value, selectedName)
    assert.equal(document.activeElement?.id, 'party-2-starmie-move-3')
  } finally { await view.close() }
})

test('party usage suggestion preserves the intended slot through keyboard focus', async () => {
  const view = await mount(['냉동빔', '', '10만볼트', ''])
  try {
    const target = view.host.querySelector('#party-2-starmie-move-1')
    const suggestion = [...view.host.querySelectorAll('.move-usage-suggestion')].find(button => button.getAttribute('aria-pressed') !== 'true' && !button.disabled)
    assert.ok(target && suggestion)
    const selectedName = suggestion.textContent.trim()
    await act(async () => target.focus())
    await act(async () => suggestion.focus())
    assert.deepEqual({ ...view.state.activeMoveField }, { key: 'starmie', slotIdx: 1, scope: 'party' })
    await act(async () => {
      suggestion.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(view.host.querySelector('#party-2-starmie-move-1')?.value, selectedName)
    assert.equal(document.activeElement?.id, 'party-2-starmie-move-3')
  } finally { await view.close() }
})

test('leaving the party usage rail commits its pending draft and clears the target', async () => {
  const view = await mount(['냉동빔', '', '10만볼트', ''])
  try {
    const target = view.host.querySelector('#party-2-starmie-move-1')
    const suggestion = [...view.host.querySelectorAll('.move-usage-suggestion')].find(button => !button.disabled)
    const outside = view.host.querySelector('.entry-card-clear-button')
    assert.ok(target && suggestion && outside)
    await act(async () => {
      target.focus()
      typeInto(target, '아쿠아제트')
    })
    assert.equal(view.state.moveInputDraft, '아쿠아제트')
    await act(async () => suggestion.focus())
    assert.equal(view.state.activeMoveField?.slotIdx, 1)
    await act(async () => outside.focus())
    assert.equal(view.host.querySelector('#party-2-starmie-move-1')?.value, '아쿠아제트')
    assert.equal(view.state.activeMoveField, null)
    assert.equal(view.state.moveInputDraft, null)
  } finally { await view.close() }
})
