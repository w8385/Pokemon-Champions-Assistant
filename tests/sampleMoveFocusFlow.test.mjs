import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const browser = new Window({ url: 'http://localhost/#/sample-builder?sampleTab=damage' })
Object.assign(globalThis, {
  window: browser,
  document: browser.document,
  localStorage: browser.localStorage,
  HTMLElement: browser.HTMLElement,
  HTMLInputElement: browser.HTMLInputElement,
  Element: browser.Element,
  Node: browser.Node,
  IS_REACT_ACT_ENVIRONMENT: true,
})
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: browser.navigator })

const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const App = (await server.ssrLoadModule('/src/App.tsx')).default
const { loadFormLearnset } = await server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts')
const { loadMoveMetaByName, loadUsageTopMovesByKey } = await server.ssrLoadModule('/src/adapters/catalog/data.ts')

test.after(async () => {
  await server.close()
  await browser.happyDOM.abort()
})

const storageKey = 'pokemon-champions-assistant-demo:v1'
const sample = {
  key: 'starmie', item: '', ability: '', picked: false,
  evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
  config: { nature: 'hardy', scarf: false, speedStage: 0 },
  tuning: { magicNumber: 0, maxValue: 0 },
}
const target = {
  key: 'garchomp', item: '', ability: '', opponentMoves: ['지진', '', '역린', ''], moveName: '', opponentMoveName: '',
  attackEv: 0, defenseEv: 0, spAttackEv: 0, spDefenseEv: 0, hpEv: 0, speedEv: 0,
  attackNature: 1, defenseNature: 1, spAttackNature: 1, spDefenseNature: 1,
  reverseAttackStage: 0, reverseDefenseStage: 0, reverseBurned: false, reverseReflect: false,
  reverseLightScreen: false, reverseAuroraVeil: false, reverseDefenderFullHp: true,
}

const typeInto = (input, value) => {
  Object.getOwnPropertyDescriptor(browser.HTMLInputElement.prototype, 'value').set.call(input, value)
  input.dispatchEvent(new browser.Event('input', { bubbles: true }))
}
const slotInput = (owner, slot) => {
  const input = owner.querySelector(`.move-slots-editor-cell[data-slot="${slot}"] input`)
  assert.ok(input, `missing slot ${slot}`)
  return input
}
const availableSuggestion = owner => {
  const button = [...owner.querySelectorAll('.move-usage-suggestion')].find(candidate => !candidate.disabled && candidate.getAttribute('aria-pressed') !== 'true')
  assert.ok(button, 'missing unselected usage suggestion')
  return button
}

test('sample and sample-opponent usage rails preserve keyboard targets and commit drafts only on rail exit', async () => {
  localStorage.clear()
  localStorage.setItem(storageKey, JSON.stringify({
    mainSection: 'sample',
    sampleWorkbenchTab: 'damage',
    sampleForge: sample,
    sampleLockedMoves: ['냉동빔', '', '10만볼트', ''],
    sampleDamageTargets: [target],
  }))
  const host = document.createElement('div')
  const outside = document.createElement('button')
  document.body.append(host, outside)
  const root = createRoot(host)
  try {
    await act(async () => root.render(React.createElement(App)))
    await act(async () => {
      await Promise.all([loadFormLearnset('starmie'), loadFormLearnset('garchomp'), loadMoveMetaByName(), loadUsageTopMovesByKey()])
      await new Promise(resolve => browser.setTimeout(resolve, 80))
    })

    const own = host.querySelector('[data-owner="sample-starmie"]')
    const opponent = host.querySelector('[data-owner="sample-opponent-garchomp-0"]')
    assert.ok(own && opponent, `sample editors missing: ${host.textContent.slice(0, 500)}`)

    const ownTarget = slotInput(own, 2)
    let suggestion = availableSuggestion(own)
    const ownSuggestion = suggestion.textContent.trim()
    await act(async () => {
      ownTarget.focus()
      typeInto(ownTarget, '파도타기')
    })
    await act(async () => suggestion.focus())
    assert.equal(slotInput(own, 2).value, '파도타기', 'keyboard entry into the rail must retain the sample draft')
    await act(async () => {
      suggestion.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(slotInput(own, 2).value, ownSuggestion, 'sample suggestion must replace the focused slot')
    assert.equal(slotInput(own, 4).value, '', 'sample suggestion must not fall back to the next empty slot')
    assert.equal(document.activeElement?.id, 'sample-move-starmie-3', 'sample suggestion must advance to the next empty slot')

    const ownExitDraft = slotInput(own, 4)
    await act(async () => {
      ownExitDraft.focus()
      typeInto(ownExitDraft, '사이코키네시스')
    })
    suggestion = own.querySelector('.move-usage-suggestion:not(:disabled)')
    assert.ok(suggestion)
    await act(async () => suggestion.focus())
    assert.equal(slotInput(own, 4).value, '사이코키네시스')
    await act(async () => outside.focus())
    assert.equal(slotInput(own, 4).value, '사이코키네시스', 'leaving the sample rail must commit its pending draft')

    const opponentTarget = slotInput(opponent, 4)
    suggestion = availableSuggestion(opponent)
    const opponentSuggestion = suggestion.textContent.trim()
    await act(async () => {
      opponentTarget.focus()
      typeInto(opponentTarget, '드래곤크루')
    })
    await act(async () => suggestion.focus())
    assert.equal(slotInput(opponent, 4).value, '드래곤크루', 'keyboard entry into the rail must retain the opponent draft')
    await act(async () => {
      suggestion.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(slotInput(opponent, 4).value, opponentSuggestion, 'opponent suggestion must replace the focused slot')
    assert.equal(slotInput(opponent, 2).value, '', 'opponent suggestion must not fall back to the first empty slot')
    assert.equal(document.activeElement?.id, 'sample-opponent-move-garchomp-0-1', 'opponent suggestion must advance to the next empty slot')

    const opponentExitDraft = slotInput(opponent, 2)
    await act(async () => {
      opponentExitDraft.focus()
      typeInto(opponentExitDraft, '화염방사')
    })
    suggestion = opponent.querySelector('.move-usage-suggestion:not(:disabled)')
    assert.ok(suggestion)
    await act(async () => suggestion.focus())
    assert.equal(slotInput(opponent, 2).value, '화염방사')
    await act(async () => outside.focus())
    assert.equal(slotInput(opponent, 2).value, '화염방사', 'leaving the opponent rail must commit its pending draft')

    const saved = JSON.parse(localStorage.getItem(storageKey))
    assert.deepEqual(saved.sampleLockedMoves, ['냉동빔', ownSuggestion, '10만볼트', '사이코키네시스'])
    assert.deepEqual(saved.sampleDamageTargets[0].opponentMoves, ['지진', '화염방사', '역린', opponentSuggestion])
  } finally {
    await act(async () => root.unmount())
    outside.remove()
    host.remove()
    localStorage.clear()
  }
})
