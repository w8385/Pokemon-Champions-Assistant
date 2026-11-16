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
const { loadMoveMetaByName } = await server.ssrLoadModule('/src/adapters/catalog/data.ts')
test.before(async () => { await Promise.all([
  loadFormLearnset('starmie'),
  loadFormLearnset('pelipper'),
  loadFormLearnset('garchomp'),
  loadFormLearnset('farigiraf'),
  loadFormLearnset('toucannon'),
  loadFormLearnset('weavile'),
  loadFormLearnset('furfrou'),
  loadFormLearnset('persian-alolan'),
  loadMoveMetaByName(),
]) })
test.after(async () => { await server.close(); await browser.happyDOM.abort() })

const fixture = (ownKey = 'starmie', foeKey = 'pelipper', ownMove = '파도타기', ownAbility = '', foeAbility = '') => {
  const own = quickSide({ key: ownKey, ability: ownAbility, moves: [ownMove, '', '', ''] })
  const foe = quickSide({ key: foeKey, ability: foeAbility, moves: ['파도타기', '', '', ''] })
  return [own, foe]
}
async function mount({ comparisonMode = false, language = 'ko', ownKey, foeKey, ownMove, ownAbility, foeAbility } = {}) {
  localStorage.clear()
  const sides = fixture(ownKey, foeKey, ownMove, ownAbility, foeAbility)
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
      const speed = results.querySelector('.quick-speed-comparison-card')
      assert.ok(speed, 'one merged Speed comparison card must own both sides')
      assert.equal(speed.querySelectorAll('.quick-speed-lane').length, 2)
      assert.match(speed.textContent ?? '', /스피드 비교/)
      assert.equal(results.querySelector('.quick-speed-settings'), null)
      assert.equal(results.querySelector('.quick-speed-summary'), null)
      assert.equal(results.querySelector('.quick-speed-base-badge'), null)
      assert.match(results.querySelector('.quick-result h3')?.textContent ?? '', /\d+–\d+/)
      assert.equal(section.querySelectorAll('.quick-result').length, 1)
      assert.equal(section.querySelectorAll('.quick-sides').length, 1)
      assert.equal(cards.querySelectorAll('.quick-move-preview').length, 2, 'blank move slots do not render fake result surfaces')
    } finally { await view.close() }
  })
}

test('a one-hit verdict keeps inclusive min/max boundaries and both real result surfaces agree', async () => {
  const result = hp => ({ damage: { min: 33, max: 40 }, targetHp: hp, hits: 1, effectiveness: .5 })
  assert.equal(quickKoVerdict(result(33)), 'certain')
  assert.equal(quickKoVerdict(result(40)), 'possible')
  assert.equal(quickKoVerdict(result(41)), null)

  const view = await mount()
  try {
    const selected = view.host.querySelector('.quick-result')
    const preview = view.host.querySelector('.quick-side-card .quick-move-preview')
    assert.equal(selected.querySelector('.quick-ko-verdict')?.textContent ?? '', preview.querySelector('.quick-ko-verdict')?.textContent ?? '')
    for (const tone of ['certain', 'possible']) assert.equal(selected.classList.contains(`quick-ko-${tone}`), preview.classList.contains(`quick-ko-${tone}`))
  } finally { await view.close() }
})

test('both modes keep selected move and range primary, with concise HP and KO status', async () => {
  for (const comparisonMode of [false, true]) {
    const baseline = await mount({ comparisonMode })
    try {
      const selected = baseline.host.querySelector('.quick-result')
      const range = selected.querySelector('h3')?.textContent.match(/^(\d+)–(\d+) \([\d.]+–[\d.]+%\)/)
      assert.ok(range, 'supported numeric range and percentage')
      const [, min, max] = range.map(Number)
      assert.ok(max > min)
      assert.match(selected.querySelector('.quick-result-head strong')?.textContent ?? '', /파도타기/)
      assert.doesNotMatch(selected.querySelector('.quick-result-head')?.textContent ?? '', /대미지 결과/)
      assert.match(selected.querySelector('.quick-result-head')?.textContent ?? '', /→/)
      const targetHp = Number(selected.textContent.match(/대상 체력 (\d+)/)?.[1])
      assert.ok(targetHp > max)
      assert.doesNotMatch(selected.textContent, /상성 ×1(?:\D|$)|0\/16|16\/16|16개 난수 피해/)
      assert.equal(selected.querySelector('.quick-rolls'), null)
      assert.match(selected.textContent, /1타 불가/)
      assert.equal(selected.querySelector('.quick-ko-chance'), null)
    } finally { await baseline.close() }
  }
})

test('localized non-KO and uncertain cases do not claim a certain one-hit result', async () => {
  for (const [language, label] of [['ko', '1타 불가'], ['en', 'No OHKO'], ['ja', '1発不可']]) {
    const view = await mount({ language })
    try { assert.match(view.host.querySelector('.quick-result')?.textContent ?? '', new RegExp(label)) } finally { await view.close() }
  }
  for (const options of [{ ownMove: 'unknown move' }, { ownKey: 'garchomp', ownMove: '스케일샷' }]) {
    const view = await mount(options)
    try {
      const selected = view.host.querySelector('.quick-result')
      assert.doesNotMatch(selected.textContent, /1타 불가|1타 확률|0\/16|16\/16/)
      if (options.ownMove === '스케일샷') assert.match(selected.textContent, /연속기는 기절 확률 계산 제외/)
      else assert.match(selected.querySelector('[role="status"]')?.textContent ?? '', /미확인|지원되지/)
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
    assert.match(view.host.querySelector('.quick-result-head')?.textContent ?? '', /패리퍼 → 아쿠스타/)
    assert.match(view.host.querySelector('.quick-result')?.textContent ?? '', /대상 체력/)
    assert.doesNotMatch(view.host.querySelector('.quick-result')?.textContent ?? '', /상대 체력/)
    assert.ok(view.host.querySelector('.quick-result .damage-range-meter'))
  } finally { await view.close() }
})

test('merged Speed controls expose nature and rank without a duplicate scarf selector in KO/EN/JA', async () => {
  for (const comparisonMode of [false, true]) for (const [language, nature, rank, scarf] of [
    ['ko', '성격 보정', '스피드 랭크', '구애스카프'],
    ['en', 'Nature modifier', 'Speed stage', 'Choice Scarf'],
    ['ja', '性格補正', '素早さランク', 'こだわりスカーフ'],
  ]) {
    const view = await mount({ comparisonMode, language })
    try {
      const card = view.host.querySelector('.quick-speed-comparison-card')
      const controls = card?.textContent ?? ''
      for (const value of [nature, rank]) assert.match(controls, new RegExp(value))
      assert.doesNotMatch(controls, new RegExp(scarf))
      assert.equal(card?.querySelectorAll('select').length, 4, 'each lane has only nature and Speed stage')
      assert.doesNotMatch(controls, /가정|시나리오|assumption|scenario|想定/)
    } finally { await view.close() }
  }
})

test('Speed comparison nature is isolated from the build card nature and actual stat', async () => {
  const view = await mount()
  try {
    const tile = view.host.querySelector('.quick-side-card[data-side="attacker"] [data-stat-code="S"]')?.closest('.stat-preview-row')
    const select = view.host.querySelector('.quick-speed-lane-attacker .quick-speed-lane-controls select')
    const output = view.host.querySelector('.quick-speed-lane-attacker output')
    assert.ok(tile && select && output)
    const buildText = tile.textContent
    const buildNature = [...tile.querySelectorAll('.quick-compact-tile-nature button')].map(button => button.getAttribute('aria-pressed'))
    const before = output.textContent
    await act(async () => {
      select.value = '0.9'
      select.dispatchEvent(new browser.Event('change', { bubbles: true }))
    })
    assert.notEqual(output.textContent, before, 'comparison-only nature changes the compared Speed')
    assert.equal(tile.textContent, buildText, 'build Speed remains sourced from the saved nature')
    assert.deepEqual([...tile.querySelectorAll('.quick-compact-tile-nature button')].map(button => button.getAttribute('aria-pressed')), buildNature)
  } finally { await view.close() }
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
    const before = view.host.querySelector('.quick-result h3')?.textContent
    await act(async () => buttons[2].click())
    assert.equal(buttons[2].getAttribute('aria-pressed'), 'true')
    const fourHitDecisionPower = Number(power.textContent.replace(/\D/g, ''))
    assert.ok(fourHitDecisionPower > initialDecisionPower)
    assert.notEqual(view.host.querySelector('.quick-result h3')?.textContent, before, 'direct hit selection updates damage')
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
        damage: view.host.querySelector('.quick-result h3')?.textContent,
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
    const buttons = [...(group?.querySelectorAll('.quick-hit-count-option') ?? [])]
    assert.deepEqual(buttons.map(button => Number(button.textContent)), [1, 2, 3])
    assert.match(power?.textContent ?? '', /결정력\s*[\d,]+/)
    const oneHitDecisionPower = Number(power.textContent.replace(/\D/g, ''))
    await act(async () => buttons[2].click())
    assert.ok(Number(power.textContent.replace(/\D/g, '')) > oneHitDecisionPower)
  } finally { await view.close() }
})

test('choosing a move opens the next slot for continuous entry and stops after slot four', async () => {
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
    assert.notEqual(document.activeElement?.id, 'quick-defender-move-0', 'slot four does not jump to the other card')
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

test('KO labels are localized in selected results and move previews', async () => {
  for (const [language, label] of [['ko', '확정 1타'], ['en', 'Guaranteed OHKO'], ['ja', '確定1発']]) {
    const view = await mount({ foeKey: 'camerupt', language })
    try {
      assert.equal(view.host.querySelector('.quick-result .quick-ko-verdict')?.textContent, label)
      assert.equal(view.host.querySelector('.quick-side-card .quick-move-preview .quick-ko-verdict')?.textContent, label)
      assert.equal(view.host.querySelectorAll('.quick-ko-verdict').length, 2, 'blank moves and unknown inputs have no verdict')
    } finally { await view.close() }
  }
})

test('an immune move, unsupported move, and multihit move do not claim a one-hit KO', async () => {
  for (const [options, numeric] of [
    [{ foeKey: 'garchomp', ownMove: '10만볼트' }, false],
    [{ ownMove: 'unknown move' }, false],
    [{ ownKey: 'garchomp', ownMove: '스케일샷' }, true],
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
