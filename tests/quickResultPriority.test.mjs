import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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

test('both modes keep selected move and range primary, with concise HP and KO status', async () => {
  for (const comparisonMode of [false, true]) {
    const baseline = await mount({ comparisonMode })
    let min, max
    try {
      const selected = baseline.host.querySelector('.quick-result')
      const range = selected.querySelector('h3')?.textContent.match(/^(\d+)–(\d+) \([\d.]+–[\d.]+%\)/)
      assert.ok(range, 'supported numeric range and percentage')
      ;[, min, max] = range.map(Number)
      assert.ok(max > min)
      assert.match(selected.querySelector('.quick-result-head strong')?.textContent ?? '', /파도타기/)
      assert.doesNotMatch(selected.querySelector('.quick-result-head')?.textContent ?? '', /대미지 결과/)
      assert.match(selected.querySelector('.quick-result-head')?.textContent ?? '', /→/)
    } finally { await baseline.close() }
    for (const [hp, verdict] of [[max + 1, '1타 불가'], [max, '난수 1타'], [min, '확정 1타']]) {
      const view = await mount({ comparisonMode, hp })
      try {
        const selected = view.host.querySelector('.quick-result')
        assert.match(selected.textContent, new RegExp(`상대 체력 ${hp}`))
        assert.doesNotMatch(selected.textContent, /상성 ×1(?:\D|$)|0\/16|16\/16|16개 난수 피해/)
        assert.equal(selected.querySelector('.quick-rolls'), null)
        assert.match(selected.textContent, new RegExp(verdict))
        if (hp === max) assert.match(selected.querySelector('.quick-ko-chance')?.textContent ?? '', /\d+(?:\.\d+)?%/)
        else assert.equal(selected.querySelector('.quick-ko-chance'), null)
      } finally { await view.close() }
    }
  }
})

test('localized non-KO and uncertain cases do not claim a certain one-hit result', async () => {
  for (const [language, label] of [['ko', '1타 불가'], ['en', 'No OHKO'], ['ja', '1発不可']]) {
    const baseline = await mount({ language })
    let max
    try { max = Number(baseline.host.querySelector('.quick-result h3')?.textContent.match(/^\d+–(\d+)/)?.[1]); assert.ok(max) } finally { await baseline.close() }
    const view = await mount({ language, hp: max + 1 })
    try { assert.match(view.host.querySelector('.quick-result')?.textContent ?? '', new RegExp(label)) } finally { await view.close() }
  }
  for (const options of [{ hp: 1, ownMove: 'unknown move' }, { hp: 1, ownKey: 'garchomp', ownMove: '스케일샷' }]) {
    const view = await mount(options)
    try {
      const selected = view.host.querySelector('.quick-result')
      assert.doesNotMatch(selected.textContent, /1타 불가|1타 확률|0\/16|16\/16/)
      if (options.ownMove === '스케일샷') assert.match(selected.textContent, /연속기는 기절 확률 계산 제외/)
      else assert.match(selected.querySelector('[role="status"]')?.textContent ?? '', /미확인|지원되지/)
    } finally { await view.close() }
  }
})

test('Speed controls use field labels rather than assumption/scenario prose in KO/EN/JA', async () => {
  for (const comparisonMode of [false, true]) for (const [language, nature, scarf, inactive, active] of [
    ['ko', '성격 보정', '구애스카프', '미적용', '적용'],
    ['en', 'Nature modifier', 'Choice Scarf', 'Off', 'On'],
    ['ja', '性格補正', 'こだわりスカーフ', '未適用', '適用'],
  ]) {
    const view = await mount({ comparisonMode, language })
    try {
      const controls = view.host.querySelector('.quick-speed-settings')?.textContent ?? ''
      for (const value of [nature, scarf, inactive, active]) assert.match(controls, new RegExp(value))
      assert.doesNotMatch(controls, /가정|시나리오|assumption|scenario|想定/)
    } finally { await view.close() }
  }
})

test('legacy Speed and reverse lab labels omit assumption wording without changing source ownership', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const speed = app.slice(app.indexOf('className="speed-compare-head-grid"'), app.indexOf('className="single-speed-result"'))
  for (const old of ["lt('스카프 가정')", "lt('내 스카프 가정')", "lt('상대 도구 가정')", "lt('상대 성격 가정')", "lt('상대 특성 발동 가정')", "lt('발동 가정')", "lt('화면 가정 · 파티 도구 변경 없음')", "lt('상대 가정 · 엔트리 변경 없음')"]) assert.doesNotMatch(speed, new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.doesNotMatch(app.slice(app.indexOf('className="speed-context-card single-speed-result"'), app.indexOf('className="speed-context-card single-speed-result"') + 1500), /lt\('상대 가정 스피드'\)/)
  assert.doesNotMatch(app, /가정 시나리오 \(확정 빌드 아님\)/)
  assert.doesNotMatch(app, /lt\('전투 가정'\)/)
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
