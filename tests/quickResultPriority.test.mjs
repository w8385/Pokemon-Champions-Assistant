import test from 'node:test'
import assert from 'node:assert/strict'
import React, { act } from 'react'
import { Window } from 'happy-dom'
import { createServer } from 'vite'

const browser = new Window({ url: 'http://localhost/#/damage?my=4&opp=0' })
Object.assign(globalThis, { window: browser, document: browser.document, localStorage: browser.localStorage, HTMLElement: browser.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
const { createRoot } = await import('react-dom/client')
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
const { QuickDamagePanel, quickSide } = await server.ssrLoadModule('/src/App.tsx')
const { loadFormLearnset } = await server.ssrLoadModule('/src/sharedLearnsets.ts')
const { loadMoveMetaByName } = await server.ssrLoadModule('/src/dex/data.ts')
test.before(async () => { await Promise.all([loadFormLearnset('starmie'), loadFormLearnset('pelipper'), loadFormLearnset('garchomp'), loadMoveMetaByName()]) })
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

const fixture = (hp, ownKey = 'starmie', foeKey = 'pelipper', ownMove = '파도타기') => {
  const own = quickSide({ key: ownKey, ability: '', moves: [ownMove, '', '', ''] })
  const foe = quickSide({ key: foeKey, ability: '', moves: ['파도타기', '', '', ''] })
  if (hp !== undefined) foe.actual.hp = String(hp)
  return [own, foe]
}
async function mount({ hp, comparisonMode = false, language = 'ko', ownKey, foeKey, ownMove } = {}) {
  localStorage.clear()
  const sides = fixture(hp, ownKey, foeKey, ownMove)
  if (!comparisonMode) localStorage.setItem('pokemon-champions-quick-damage:v1', JSON.stringify({ attacker: sides[0], defender: sides[1] }))
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  try {
    await act(async () => root.render(React.createElement(QuickDamagePanel, { language, tooltipForMove: () => ({}), ...(comparisonMode ? { comparisonMode, comparisonSlots: [4, 0], initialSides: sides } : {}) })))
    return { host, close: async () => { await act(async () => root.unmount()); host.remove(); localStorage.clear() } }
  } catch (error) { await act(async () => root.unmount()); host.remove(); localStorage.clear(); throw error }
}

for (const comparisonMode of [false, true]) {
  test(`${comparisonMode ? 'entry comparison' : 'standalone damage'} mounts the real Speed and selected damage before the existing cards`, async () => {
    const view = await mount({ comparisonMode })
    try {
      const section = view.host.querySelector('.quick-damage')
      const children = [...section.children]
      const results = section.querySelector('.quick-comparison-results')
      const cards = section.querySelector('.quick-sides')
      assert.ok(results && cards)
      assert.ok(children.indexOf(results) < children.indexOf(cards), 'results must precede both actual card editors')
      const settings = results.querySelector('.quick-speed-settings')
      const summary = results.querySelector('.quick-speed-summary')
      assert.ok(settings?.nextElementSibling === summary, 'both Speed setting cards must be immediately followed by the shared comparison')
      assert.equal(settings?.children.length, 2)
      assert.match(summary?.textContent ?? '', /스피드 비교/)
      assert.match(results.querySelector('.quick-result h3')?.textContent ?? '', /\d+–\d+/)
      assert.equal(section.querySelectorAll('.quick-result').length, 1)
      assert.equal(section.querySelectorAll('.quick-sides').length, 1)
      assert.equal(cards.querySelectorAll('.quick-move-preview').length, 8)
    } finally { await view.close() }
  })
}

test('a one-hit verdict uses inclusive min/max versus actual target HP in both selected and move preview', async () => {
  const baseline = await mount()
  let min, max
  try {
    const range = baseline.host.querySelector('.quick-result h3')?.textContent.match(/^(\d+)–(\d+)/)
    assert.ok(range, 'supported numeric fixture')
    ;[, min, max] = range.map(Number)
    assert.ok(min > 1 && max > min, `fixture must straddle an integer HP: ${min}–${max}`)
  } finally { await baseline.close() }
  for (const [hp, verdict, tone] of [[min, '확정 1타', 'certain'], [max, '난수 1타', 'possible'], [max + 1, '', '']]) {
    const view = await mount({ hp })
    try {
      const result = view.host.querySelector('.quick-result')
      const preview = view.host.querySelector('.quick-side-card .quick-move-preview')
      for (const element of [result, preview]) {
        assert.equal(element.classList.contains(`quick-ko-${tone}`), Boolean(tone), `HP ${hp} tone`)
        assert.equal(element.querySelector('.quick-ko-verdict')?.textContent ?? '', verdict, `HP ${hp} label`)
      }
    } finally { await view.close() }
  }
})

test('KO labels are localized in selected results and move previews', async () => {
  for (const [language, label] of [['ko', '확정 1타'], ['en', 'Guaranteed OHKO'], ['ja', '確定1発']]) {
    const view = await mount({ hp: 1, language })
    try {
      assert.equal(view.host.querySelector('.quick-result .quick-ko-verdict')?.textContent, label)
      assert.equal(view.host.querySelector('.quick-side-card .quick-move-preview .quick-ko-verdict')?.textContent, label)
      assert.equal(view.host.querySelectorAll('.quick-ko-verdict').length, 2, 'blank moves and unknown inputs have no verdict')
    } finally { await view.close() }
  }
})

test('an immune move, unsupported move, and multihit move do not claim a one-hit KO', async () => {
  for (const [options, numeric] of [
    [{ hp: 1, foeKey: 'garchomp', ownMove: '10만볼트' }, false],
    [{ hp: 1, ownMove: 'unknown move' }, false],
    [{ hp: 1, ownKey: 'garchomp', ownMove: '스케일샷' }, true],
  ]) {
    const view = await mount(options)
    try {
      if (numeric) assert.match(view.host.querySelector('.quick-result h3')?.textContent ?? '', /\d+–\d+/, 'multi-hit fixture is calculable')
      for (const element of [view.host.querySelector('.quick-result'), view.host.querySelector('.quick-side-card .quick-move-preview')]) {
        assert.equal(element.querySelector('.quick-ko-verdict'), null, JSON.stringify(options))
        assert.equal(element.classList.contains('quick-ko-certain'), false)
        assert.equal(element.classList.contains('quick-ko-possible'), false)
      }
    } finally { await view.close() }
  }
})
