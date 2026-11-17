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
const { QuickDamagePanel, quickSide, quickKoVerdict } = await (async () => Object.assign({}, ...await Promise.all(["/src/App.tsx", "/src/features/damage/QuickDamagePanel.tsx", "/src/features/damage/quickModel.ts", "/src/features/damage/quickPresentation.ts"].map(path => server.ssrLoadModule(path)))))()
const { loadFormLearnset } = await server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts')
const { loadMoveMetaByName, loadUsageTopMovesByKey } = await server.ssrLoadModule('/src/adapters/catalog/data.ts')
test.before(async () => { await Promise.all([
  loadFormLearnset('starmie'),
  loadFormLearnset('pelipper'),
  loadFormLearnset('garchomp'),
  loadFormLearnset('farigiraf'),
  loadFormLearnset('toucannon'),
  loadFormLearnset('weavile'),
  loadFormLearnset('maushold'),
  loadFormLearnset('furfrou'),
  loadFormLearnset('persian-alolan'),
  loadMoveMetaByName(),
  loadUsageTopMovesByKey(),
]) })
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

const fixture = (ownKey = 'starmie', foeKey = 'pelipper', ownMove = '파도타기', ownAbility = '', foeAbility = '', ownMoves) => {
  const own = quickSide({ key: ownKey, ability: ownAbility, moves: ownMoves ?? [ownMove, '', '', ''] })
  const foe = quickSide({ key: foeKey, ability: foeAbility, moves: ['파도타기', '', '', ''] })
  return [own, foe]
}
async function mount({ comparisonMode = false, language = 'ko', ownKey, foeKey, ownMove, ownAbility, foeAbility, ownMoves } = {}) {
  localStorage.clear()
  const sides = fixture(ownKey, foeKey, ownMove, ownAbility, foeAbility, ownMoves)
  if (!comparisonMode) localStorage.setItem('pokemon-champions-quick-damage:v1', JSON.stringify({ attacker: sides[0], defender: sides[1] }))
  const host = document.createElement('div'); document.body.append(host)
  const root = createRoot(host)
  try {
    await act(async () => root.render(React.createElement(QuickDamagePanel, { language, tooltipForMove: () => ({}), ...(comparisonMode ? { comparisonMode, comparisonSlots: [4, 0], initialSides: sides } : {}) })))
    return { host, close: async () => { await act(async () => root.unmount()); host.remove(); localStorage.clear() } }
  } catch (error) { await act(async () => root.unmount()); host.remove(); localStorage.clear(); throw error }
}

for (const comparisonMode of [false, true]) {
  test(`${comparisonMode ? 'entry comparison' : 'standalone damage'} keeps Speed before the cards and damage inside each filled move`, async () => {
    const view = await mount({ comparisonMode })
    try {
      const section = view.host.querySelector('.quick-damage')
      const children = [...section.children]
      const speed = section.querySelector('.quick-speed-comparison-card')
      const cards = section.querySelector('.quick-sides')
      assert.ok(speed && cards)
      assert.ok(children.indexOf(speed) < children.indexOf(cards), 'Speed must precede both actual card editors')
      assert.ok(speed, 'one merged Speed comparison card must own both sides')
      assert.equal(speed.querySelectorAll('.quick-speed-lane').length, 2)
      assert.match(speed.textContent ?? '', /스피드 비교/)
      assert.equal(speed.querySelector('.quick-speed-settings'), null)
      assert.equal(speed.querySelector('.quick-speed-summary'), null)
      assert.equal(speed.querySelector('.quick-speed-base-badge'), null)
      assert.equal(section.querySelector('.quick-comparison-results'), null)
      assert.equal(section.querySelectorAll('.quick-result').length, 0)
      assert.equal(section.querySelectorAll('.quick-sides').length, 1)
      const previews = [...cards.querySelectorAll('.quick-move-preview')]
      assert.equal(previews.length, 2, 'blank move slots do not render fake result surfaces')
      assert.ok(previews.every(preview => preview.querySelector('.damage-range-meter')), 'each calculable filled move owns its damage meter')
      const livePreviews = previews.filter(preview => preview.getAttribute('aria-live') === 'polite')
      assert.equal(livePreviews.length, 1, 'only the selected move announces changed damage')
      assert.equal(livePreviews[0].getAttribute('aria-pressed'), 'true')
      assert.equal(livePreviews[0].getAttribute('aria-atomic'), 'true')
    } finally { await view.close() }
  })
}

test('a one-hit verdict keeps inclusive min/max boundaries and the move preview is the only result surface', async () => {
  const result = hp => ({ damage: { min: 33, max: 40 }, targetHp: hp, hits: 1, effectiveness: .5 })
  assert.equal(quickKoVerdict(result(33)), 'certain')
  assert.equal(quickKoVerdict(result(40)), 'possible')
  assert.equal(quickKoVerdict(result(41)), null)

  const view = await mount()
  try {
    const preview = view.host.querySelector('.quick-side-card .quick-move-preview')
    assert.ok(preview?.querySelector('.damage-range-meter'))
    assert.equal(view.host.querySelector('.quick-result'), null)
  } finally { await view.close() }
})

test('both modes keep each move range primary with concise target HP context', async () => {
  for (const comparisonMode of [false, true]) {
    const baseline = await mount({ comparisonMode })
    try {
      const preview = baseline.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview')
      const meter = preview?.querySelector('.damage-range-meter')
      const range = meter?.querySelector('.damage-range-values')?.textContent.match(/^(\d+)–(\d+) \([\d.]+–[\d.]+%\)/)
      assert.ok(range, 'supported numeric range and percentage')
      const [, min, max] = range.map(Number)
      assert.ok(max > min)
      assert.match(preview?.getAttribute('aria-label') ?? '', /파도타기/)
      const meterLabel = meter?.getAttribute('aria-label') ?? ''
      assert.ok(preview?.getAttribute('aria-label')?.includes(meterLabel), 'the button announces the same live range shown by its meter')
      const targetHp = Number(meterLabel.match(/대상 HP (\d+)/)?.[1])
      assert.ok(targetHp > max)
      assert.doesNotMatch(preview?.textContent ?? '', /상성 ×1(?:\D|$)|0\/16|16\/16|16개 난수 피해|1타 불가/)
      assert.equal(preview?.querySelector('.quick-rolls'), null)
      assert.equal(preview?.querySelector('.quick-ko-chance'), null)
      assert.equal(baseline.host.querySelector('.quick-result'), null)
    } finally { await baseline.close() }
  }
})

test('non-KO, unsupported, and multihit moves stay concise without a false one-hit verdict', async () => {
  for (const language of ['ko', 'en', 'ja']) {
    const view = await mount({ language })
    try {
      const preview = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview')
      assert.ok(preview?.querySelector('.damage-range-meter'))
      assert.equal(preview?.querySelector('.quick-ko-verdict'), null)
      assert.equal(view.host.querySelector('.quick-result'), null)
    } finally { await view.close() }
  }
  for (const options of [{ ownMove: 'unknown move' }, { ownKey: 'garchomp', ownMove: '스케일샷' }]) {
    const view = await mount(options)
    try {
      const preview = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview')
      assert.doesNotMatch(preview?.textContent ?? '', /1타 불가|1타 확률|0\/16|16\/16/)
      assert.equal(preview?.querySelector('.quick-ko-verdict'), null)
      if (options.ownMove === '스케일샷') assert.ok(preview?.querySelector('.damage-range-meter'))
      else assert.match(preview?.textContent ?? '', /미확인|지원되지/)
    } finally { await view.close() }
  }
})

test('meter-equipped move preview still selects the opposite direction through the real callback', async () => {
  const view = await mount()
  try {
    const target = view.host.querySelector('.quick-side-card[data-side="defender"] .quick-move-preview')
    assert.ok(target && !target.disabled)
    await act(async () => target.click())
    assert.equal(target.getAttribute('aria-pressed'), 'true')
    assert.match(target.getAttribute('aria-label') ?? '', /포켓몬 2.*파도타기/)
    assert.ok(target.querySelector('.damage-range-meter'))
    assert.equal(view.host.querySelector('.quick-result'), null)
  } finally { await view.close() }
})

test('merged Speed controls expose only rank while nature stays in the shared stat editor', async () => {
  for (const comparisonMode of [false, true]) for (const [language, nature, rank, scarf] of [
    ['ko', '비교 보정', '스피드 랭크', '구애스카프'],
    ['en', 'Comparison modifier', 'Speed stage', 'Choice Scarf'],
    ['ja', '比較補正', '素早さランク', 'こだわりスカーフ'],
  ]) {
    const view = await mount({ comparisonMode, language })
    try {
      const card = view.host.querySelector('.quick-speed-comparison-card')
      const controls = card?.textContent ?? ''
      assert.match(controls, new RegExp(rank))
      for (const value of [nature, scarf]) assert.doesNotMatch(controls, new RegExp(value))
      assert.equal(card?.querySelectorAll('select').length, 2, 'each lane owns only its Speed stage')
      assert.doesNotMatch(controls, /가정|시나리오|assumption|scenario|想定/)
    } finally { await view.close() }
  }
})

test('shared Speed nature arrow immediately drives both the build tile and comparison result', async () => {
  const view = await mount()
  try {
    const tile = view.host.querySelector('.quick-side-card[data-side="attacker"] [data-stat-code="S"]')?.closest('.stat-preview-row')
    const natureUp = tile?.querySelector('.quick-compact-tile-nature .nature-up')
    const output = view.host.querySelector('.quick-speed-lane-attacker output')
    assert.ok(tile && natureUp && output)
    assert.equal(natureUp.getAttribute('aria-pressed'), 'false')
    const before = output.textContent
    await act(async () => natureUp.click())
    assert.equal(natureUp.getAttribute('aria-pressed'), 'true')
    assert.notEqual(output.textContent, before, 'the compared Speed consumes the same named nature')
  } finally { await view.close() }
})

test('shared build chip keeps the compact nature name instead of repeating its stat axes', async () => {
  const view = await mount()
  try {
    const nature = view.host.querySelector('.quick-side-card[data-side="attacker"] .pokemon-build-fields .party-meta-chip:nth-child(2) strong')
    assert.ok(nature?.textContent?.trim(), 'the compact nature name stays visible')
    assert.doesNotMatch(nature?.textContent ?? '', /[()↑↓]/)
  } finally { await view.close() }
})

test('legacy comparison-only nature overrides are discarded during hydration', () => {
  const restored = quickSide({ key: 'starmie', nature: 'hardy', speedNatureOverride: 1.1 })
  assert.equal(Object.hasOwn(restored, 'speedNatureOverride'), false)
})

test('standalone calculator keeps 1/2 card identity but uses species names in shared summaries', async () => {
  for (const [comparisonMode, expected] of [
    [false, ['포켓몬 1', '포켓몬 2']],
    [true, ['내 포켓몬', '상대 포켓몬']],
  ]) {
    const view = await mount({ comparisonMode })
    try {
      const identities = [...view.host.querySelectorAll('.quick-side-identity > strong')].map(node => node.textContent)
      assert.deepEqual(identities, expected)
      const speedLabels = [...view.host.querySelectorAll('.quick-speed-lane output')].map(node => node.getAttribute('aria-label'))
      assert.ok(speedLabels[0]?.startsWith(expected[0]))
      assert.ok(speedLabels[1]?.startsWith(expected[1]))
      const visibleExpected = comparisonMode ? expected : ['아쿠스타', '패리퍼']
      const speedLegends = [...view.host.querySelectorAll('.quick-speed-lane legend')].map(node => node.textContent)
      assert.deepEqual(speedLegends, comparisonMode ? ['내 포켓몬 · 아쿠스타', '상대 포켓몬 · 패리퍼'] : visibleExpected)
      const battleLabels = [...view.host.querySelectorAll('.quick-side-battle legend')].map(node => node.textContent)
      assert.ok(battleLabels[0]?.startsWith(visibleExpected[0]))
      assert.ok(battleLabels[1]?.startsWith(visibleExpected[1]))
      assert.equal(view.host.querySelector('.quick-heading-actions button'), null)
    } finally { await view.close() }
  }
})

test('multi-hit decision power stays visible and every legal hit count is a direct horizontal choice', async () => {
  const view = await mount({ ownKey: 'garchomp', ownMove: '스케일샷' })
  try {
    const group = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-local-condition')
    assert.ok(group)
    assert.equal(group.getAttribute('role'), 'group')
    assert.match(group.getAttribute('aria-label') ?? '', /스케일샷 결정력 및 계산 조건/)
    const power = group.querySelector('.quick-move-condition-power')
    assert.match(power?.textContent ?? '', /결정력\s*[\d,]+/)
    const initialDecisionPower = Number(power.textContent.replace(/\D/g, ''))
    assert.ok(initialDecisionPower > 0)
    const hitControl = group.querySelector('.quick-hit-count')
    assert.ok(hitControl)
    assert.equal(hitControl.getAttribute('role'), 'group')
    assert.equal(hitControl.getAttribute('aria-label'), '타수')
    const buttons = [...hitControl.querySelectorAll('.quick-hit-count-option')]
    assert.deepEqual(buttons.map(button => Number(button.textContent)), [2, 3, 4, 5])
    assert.deepEqual(buttons.map(button => button.getAttribute('aria-pressed')), ['true', 'false', 'false', 'false'])
    assert.equal(group.querySelector('select'), null, 'hit count does not require opening a select')
    const damage = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview .damage-range-values')
    const preview = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview')
    const before = damage?.textContent
    const beforeLabel = preview?.getAttribute('aria-label')
    await act(async () => buttons[2].click())
    assert.equal(buttons[2].getAttribute('aria-pressed'), 'true')
    const fourHitDecisionPower = Number(power.textContent.replace(/\D/g, ''))
    assert.ok(fourHitDecisionPower > initialDecisionPower)
    assert.notEqual(damage?.textContent, before, 'direct hit selection updates the move preview damage')
    assert.notEqual(preview?.getAttribute('aria-label'), beforeLabel, 'the selected live result announces the updated range')
    const cell = group.closest('.move-slots-editor-cell')
    const input = cell.querySelector('input')
    await act(async () => input.focus())
    assert.equal(cell.getAttribute('data-empty'), 'false', 'search draft does not erase persisted slot occupancy')
    assert.ok(cell.querySelector('.quick-move-local-condition'), 'focusing a filled move keeps its hit-count control visible')
  } finally { await view.close() }
})

test('ordinary damaging moves show decision power without needing an extra condition', async () => {
  const view = await mount({ ownKey: 'garchomp', ownMove: '지진' })
  try {
    const cell = view.host.querySelector('.quick-side-card[data-side="attacker"] .move-slots-editor-cell')
    const group = cell?.querySelector('.quick-move-local-condition')
    assert.ok(group)
    assert.equal(group.getAttribute('aria-label'), '지진 결정력 및 계산 조건')
    assert.match(group.querySelector('.quick-move-condition-power')?.textContent ?? '', /결정력\s*[\d,]+/)
    assert.equal(group.querySelector('.quick-hit-count'), null)
    assert.equal(group.querySelector('.quick-move-auto-condition'), null)
  } finally { await view.close() }
})

test('decision power excludes target bulk modifiers while actual damage still applies them', async () => {
  const results = []
  for (const foeAbility of ['', 'fur-coat']) {
    const view = await mount({ ownKey: 'garchomp', foeKey: 'furfrou', ownMove: '지진', foeAbility })
    try {
      const powerText = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-condition-power')?.textContent ?? ''
      results.push({
        power: Number(powerText.replace(/\D/g, '')),
        damage: view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview .damage-range-values')?.textContent,
      })
    } finally { await view.close() }
  }
  assert.ok(results[0].power > 0)
  assert.equal(results[1].power, results[0].power, 'Fur Coat is target bulk, not attacker decision power')
  assert.notEqual(results[1].damage, results[0].damage, 'Fur Coat still changes real damage')
})

test('Foul Play decision power uses the target Attack stat without importing target bulk', async () => {
  const powers = []
  for (const foeKey of ['furfrou', 'garchomp']) {
    const view = await mount({ ownKey: 'persian-alolan', foeKey, ownMove: '속임수' })
    try {
      const text = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-condition-power')?.textContent ?? ''
      powers.push(Number(text.replace(/\D/g, '')))
    } finally { await view.close() }
  }
  assert.ok(powers[0] > 0)
  assert.ok(powers[1] > powers[0], 'the higher-Attack target raises Foul Play decision power')
})

test('fixed and Skill Link hit counts stay read-only beside the visible decision power', async () => {
  for (const options of [
    { ownKey: 'farigiraf', ownMove: '트윈빔', label: /타수\s*2/ },
    { ownKey: 'toucannon', ownMove: '록블라스트', ownAbility: 'skill-link', label: /스킬링크\s*5/ },
  ]) {
    const view = await mount(options)
    try {
      const group = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-local-condition')
      assert.ok(group)
      assert.match(group.querySelector('.quick-move-condition-power')?.textContent ?? '', /결정력\s*[\d,]+/)
      assert.match(group.querySelector('.quick-hit-count-static')?.textContent ?? '', options.label)
      assert.equal(group.querySelector('.quick-hit-count-option'), null)
      assert.equal(group.querySelector('select'), null)
    } finally { await view.close() }
  }
})

test('Triple Axel decision power follows its escalating per-hit powers', async () => {
  const view = await mount({ ownKey: 'weavile', ownMove: '트리플악셀' })
  try {
    const group = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-local-condition')
    const power = group?.querySelector('.quick-move-condition-power')
    const preview = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview')
    const buttons = [...(group?.querySelectorAll('.quick-hit-count-option') ?? [])]
    assert.deepEqual(buttons.map(button => Number(button.textContent)), [1, 2, 3])
    assert.equal(buttons[0].getAttribute('aria-pressed'), 'true')
    assert.match(power?.textContent ?? '', /결정력\s*4,200/)
    assert.match(preview?.textContent ?? '', /15–18 \(11\.1–13\.3%\)/)
    const initialPower = power.textContent
    const initialDamage = preview.textContent
    await act(async () => buttons[0].click())
    assert.equal(power.textContent, initialPower, 'clicking the visibly selected default cannot change the calculation')
    assert.equal(preview.textContent, initialDamage, 'one-hit preview and one-hit control share one default')
    await act(async () => buttons[2].click())
    assert.match(power.textContent, /결정력\s*25,200/)
    assert.match(preview.textContent, /82–99 \(60\.7–73\.3%\)/)
  } finally { await view.close() }
})

test('Population Bomb starts at the visible one-hit choice instead of the legacy global two-hit default', async () => {
  const view = await mount({ ownKey: 'maushold', ownMove: '찍찍베기' })
  try {
    const group = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-local-condition')
    const power = group?.querySelector('.quick-move-condition-power')
    const preview = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview')
    const buttons = [...(group?.querySelectorAll('.quick-hit-count-option') ?? [])]
    assert.deepEqual(buttons.map(button => Number(button.textContent)), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    assert.equal(buttons[0].getAttribute('aria-pressed'), 'true')
    assert.match(power?.textContent ?? '', /결정력\s*2,850/)
    assert.match(preview?.textContent ?? '', /9–12 \(6\.7–8\.9%\)/)
    const initialPower = power.textContent
    const initialDamage = preview.textContent
    await act(async () => buttons[0].click())
    assert.equal(power.textContent, initialPower)
    assert.equal(preview.textContent, initialDamage)
  } finally { await view.close() }
})

test('choosing a move opens the next empty slot inside the same card, including gaps and wraparound', async () => {
  const view = await mount()
  try {
    const first = view.host.querySelector('#quick-attacker-move-0')
    assert.ok(first)
    await act(async () => first.focus())
    const option = view.host.querySelector('#quick-attacker-move-0-options [role="option"]')
    assert.ok(option, 'focus opens the ranked move pool')
    await act(async () => {
      option.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(document.activeElement?.id, 'quick-attacker-move-1')
    assert.equal(document.activeElement?.getAttribute('aria-expanded'), 'true')

    const fourth = view.host.querySelector('#quick-attacker-move-3')
    await act(async () => fourth.focus())
    const finalOption = view.host.querySelector('#quick-attacker-move-3-options [role="option"]')
    assert.ok(finalOption)
    await act(async () => {
      finalOption.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(document.activeElement?.id, 'quick-attacker-move-1', 'slot four wraps to the first remaining empty slot in the same card')
  } finally { await view.close() }

  const gap = await mount({ ownMoves: ['파도타기', '냉동빔', '', '10만볼트'] })
  try {
    const first = gap.host.querySelector('#quick-attacker-move-0')
    await act(async () => first.focus())
    const option = gap.host.querySelector('#quick-attacker-move-0-options [role="option"]')
    assert.ok(option)
    await act(async () => {
      option.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(document.activeElement?.id, 'quick-attacker-move-2', 'a filled adjacent slot is skipped')
  } finally { await gap.close() }
})

test('quick usage suggestion preserves the intended slot through keyboard focus', async () => {
  const view = await mount({ ownMoves: ['파도타기', '냉동빔', '', '10만볼트'] })
  try {
    const card = view.host.querySelector('.quick-side-card[data-side="attacker"]')
    const target = card?.querySelector('#quick-attacker-move-1')
    const suggestion = [...(card?.querySelectorAll('.move-usage-suggestion') ?? [])].find(button => button.getAttribute('aria-pressed') !== 'true' && !button.disabled)
    assert.ok(target && suggestion)
    const selectedName = suggestion.textContent.trim()
    await act(async () => target.focus())
    await act(async () => suggestion.focus())
    assert.equal(suggestion.disabled, false, 'the keyboard transition retains its replacement target')
    await act(async () => {
      suggestion.click()
      await new Promise(resolve => browser.setTimeout(resolve, 5))
    })
    assert.equal(card.querySelector('#quick-attacker-move-1')?.value, selectedName)
    assert.equal(document.activeElement?.id, 'quick-attacker-move-2')
  } finally { await view.close() }
})

test('legacy Speed and reverse lab labels omit assumption wording without changing source ownership', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const speed = app.slice(app.indexOf('className="speed-compare-head-grid"'), app.indexOf('className="single-speed-result"'))
  for (const old of ["lt('스카프 가정')", "lt('내 스카프 가정')", "lt('상대 도구 가정')", "lt('상대 성격 가정')", "lt('상대 특성 발동 가정')", "lt('발동 가정')", "lt('화면 가정 · 파티 도구 변경 없음')", "lt('상대 가정 · 엔트리 변경 없음')"]) assert.doesNotMatch(speed, new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.doesNotMatch(app.slice(app.indexOf('className="speed-context-card single-speed-result"'), app.indexOf('className="speed-context-card single-speed-result"') + 1500), /lt\('상대 가정 스피드'\)/)
  assert.doesNotMatch(app, /가정 시나리오 \(확정 빌드 아님\)/)
  assert.doesNotMatch(app, /lt\('전투 가정'\)/)
})

test('KO labels are localized once in the owning move preview', async () => {
  for (const [language, label] of [['ko', '확정 1타'], ['en', 'Guaranteed OHKO'], ['ja', '確定1発']]) {
    const view = await mount({ foeKey: 'camerupt', language })
    try {
      assert.equal(view.host.querySelector('.quick-side-card .quick-move-preview .quick-ko-verdict')?.textContent, label)
      assert.equal(view.host.querySelectorAll('.quick-ko-verdict').length, 1, 'blank moves and unknown inputs have no verdict')
      assert.equal(view.host.querySelector('.quick-result'), null)
    } finally { await view.close() }
  }
})

test('an immune move, unsupported move, and multihit move do not claim a one-hit KO', async () => {
  for (const [options, numeric] of [
    [{ ownMove: 'unknown move' }, false],
    [{ ownKey: 'garchomp', ownMove: '스케일샷' }, true],
  ]) {
    const view = await mount(options)
    try {
      const preview = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview')
      if (numeric) assert.match(preview?.querySelector('.damage-range-values')?.textContent ?? '', /\d+–\d+/, 'multi-hit fixture is calculable')
      assert.equal(preview?.querySelector('.quick-ko-verdict'), null, JSON.stringify(options))
      assert.equal(preview?.classList.contains('quick-ko-certain'), false)
      assert.equal(preview?.classList.contains('quick-ko-possible'), false)
      assert.equal(view.host.querySelector('.quick-result'), null)
    } finally { await view.close() }
  }
})

test('immunity is visible and announced with the same zero range in KO/EN/JA', async () => {
  for (const [language, label, range] of [
    ['ko', '무효', /대미지 0–0, 대상 HP \d+의 0(?:\.0)?–0(?:\.0)?%/],
    ['en', 'No effect', /Damage 0–0, 0(?:\.0)?–0(?:\.0)?% of target HP \d+/],
    ['ja', '無効', /ダメージ 0–0、対象HP \d+ の 0(?:\.0)?–0(?:\.0)?%/],
  ]) {
    const view = await mount({ foeKey: 'garchomp', ownMove: '10만볼트', language })
    try {
      const preview = view.host.querySelector('.quick-side-card[data-side="attacker"] .quick-move-preview')
      assert.equal(preview?.querySelector('.quick-effectiveness-immune')?.textContent, label)
      assert.match(preview?.getAttribute('aria-label') ?? '', range)
      assert.match(preview?.getAttribute('aria-label') ?? '', new RegExp(`${label}$`))
      assert.equal(preview?.querySelector('.quick-ko-verdict'), null)
      assert.equal(preview?.classList.contains('quick-ko-certain'), false)
      assert.equal(preview?.classList.contains('quick-ko-possible'), false)
      assert.equal(view.host.querySelector('.quick-result'), null)
    } finally { await view.close() }
  }
})
