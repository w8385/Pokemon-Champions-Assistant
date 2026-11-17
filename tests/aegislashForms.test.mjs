import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { comparisonSides } from '../src/domain/party/unifiedComparisonAdapter.ts'

const server = await createServer({ server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
test.after(async () => server.close())
{
  const [{ prepareQuickDamageInput, formStats }, { quickBlank, quickSide }, { indexByKey }, { attackingFormRow }] = await Promise.all([
    server.ssrLoadModule('/src/features/damage/prepareQuickDamageInput.ts'), server.ssrLoadModule('/src/features/damage/quickModel.ts'), server.ssrLoadModule('/src/adapters/catalog/roster.ts'), server.ssrLoadModule('/src/domain/battle/statProjection.ts'),
  ])
  const shield = indexByKey.get('aegislash')
  const conditions = { weather: 'none', terrain: 'none', critical: false, typeChangeStab: true, hits: 2 }
  const side = (key, ability = '') => ({ ...quickBlank(), key, ability })
  const [{ loadFormLearnset }, { loadMoveMetaByName }] = await Promise.all([server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts'), server.ssrLoadModule('/src/adapters/catalog/data.ts')])
  const [aegisPool, garchompPool] = await Promise.all([loadFormLearnset('aegislash'), loadFormLearnset('garchomp'), loadMoveMetaByName()])
  const pools = { aegislash: aegisPool, garchomp: garchompPool }
  const prepare = (source, target, name = '야습') => prepareQuickDamageInput({ source, target, name, conditions, pools, language: 'ko' })
  test('Quick attacks project Blade offense and complete bulk without changing canonical identity', () => {
    const attacker = side('aegislash', 'stance-change')
    const before = structuredClone(attacker)
    const result = prepare(attacker, side('aegislash', 'stance-change'))
    assert.equal(result.sourceRow.key, 'aegislash')
    assert.equal(result.sourceStats.attack, 160)
    assert.equal(result.sourceStats.defense, 70)
    assert.equal(result.targetStats.defense, 160)
    assert.equal(prepare(side('aegislash', 'stance-change'), { ...side('aegislash', 'stance-change'), hitForm: 'blade' }).targetStats.defense, 70)
    assert.deepEqual(attacker, before)
    assert.equal(shield.defense, 140)
    assert.equal(attackingFormRow(shield, 'stance-change').defense, 50)
  })
  test('raw Shield actual does not leak into Blade but HP override stays shared', () => {
    const attacker = { ...side('aegislash', 'stance-change'), actual: { hp: '137', attack: '70' } }
    const result = prepare(attacker, side('garchomp'))
    assert.equal(result.sourceStats.attack, 160)
    assert.equal(result.sourceStats.hp, 137)
    assert.equal(prepare({ ...attacker, actualForm: 'blade', actual: { attack: '211' } }, side('garchomp')).sourceStats.attack, 211)
  })
  test('unknown offensive investment blocks cross-form projection, not known shield hit', () => {
    const unknown = { ...side('aegislash', 'stance-change'), knownOffense: { attack: false, spAttack: false }, speedNatureKnown: false }
    assert.equal(prepare(unknown, side('garchomp')).sourceStats, null)
    assert.equal(prepare(side('garchomp'), unknown).targetStats.defense, 160)
    assert.equal(prepare(side('garchomp'), { ...unknown, hitForm: 'blade' }).targetStats.defense, 70)
  })
  test('actual party comparison permits known zero effort Shadow Sneak in Blade form', async () => {
    const { calculateQuickDamage } = await server.ssrLoadModule('/src/features/damage/calculateQuickDamage.ts')
    const member = { key: 'aegislash', item: '', ability: 'stance-change', config: { nature: 'hardy', speedStage: 0 }, evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 } }
    const opponent = { key: 'garchomp', item: '', ability: '', nature: 'hardy', attackEv: 0, spAttackEv: 0 }
    const [source, target] = comparisonSides([member], [opponent], 0, 0, { aegislash: ['야습'] })
    const input = prepare(source, target, source.moves[0])
    assert.equal(source.knownOffense.attack, true)
    assert.equal(source.knownOffense.spAttack, true)
    assert.equal(input.sourceForm, 'blade')
    assert.equal(input.sourceStats?.attack, 160)
    assert.ok(calculateQuickDamage(input)?.damage.min > 0)
    const [invalid] = comparisonSides([{ ...member, evs: { ...member.evs, attack: 33 } }], [opponent], 0, 0, {})
    assert.equal(invalid.knownOffense.attack, false)
    assert.equal(prepare(invalid, target).sourceStats, null)
  })
  test('partial offensive knowledge permits only the consumed move stat', async () => {
    const { calculateQuickDamage } = await server.ssrLoadModule('/src/features/damage/calculateQuickDamage.ts')
    const foe = side('garchomp')
    const own = side('aegislash', 'stance-change')
    const physical = { ...own, knownOffense: { attack: true, spAttack: false } }
    const special = { ...own, knownOffense: { attack: false, spAttack: true } }
    assert.ok(calculateQuickDamage(prepare(physical, foe, '야습'))?.damage.min > 0)
    assert.ok(calculateQuickDamage(prepare(special, foe, '섀도볼'))?.damage.min > 0)
    assert.equal(prepare(special, foe, '야습').sourceStats, null)
    assert.equal(prepare(physical, foe, '섀도볼').sourceStats, null)
    assert.equal(prepare(foe, { ...special, hitForm: 'blade' }, '속임수').targetStats, null)
    assert.equal(formStats({ ...physical, speedNatureKnown: false }, shield, 'stance-change', 'blade', 'defense'), null)
    assert.equal(formStats(physical, shield, 'stance-change', 'blade', 'defense')?.defense, 70)
  })
  test('actual Quick damage changes with both hit forms and reverse direction', async () => {
    const { calculateQuickDamage } = await server.ssrLoadModule('/src/features/damage/calculateQuickDamage.ts')
    const evaluate = (source, target, name) => calculateQuickDamage(prepareQuickDamageInput({ source, target, name, conditions, pools, language: 'ko' }))
    const own = side('aegislash', 'stance-change')
    const foe = side('garchomp')
    const forward = evaluate(own, foe, '야습')
    const reverseShield = evaluate(foe, own, '지진')
    const reverseBlade = evaluate(foe, { ...own, hitForm: 'blade' }, '지진')
    assert.ok(forward?.damage.min > 0)
    assert.equal(forward.sourceForm, 'blade')
    assert.ok(reverseShield?.damage.min > 0)
    assert.ok(reverseBlade?.damage.min > reverseShield.damage.min)
    assert.equal(reverseShield.targetForm, 'shield')
    assert.equal(reverseBlade.targetForm, 'blade')
  })
  test('sample battle hit-time form is scoped to each side and preserved on sanitization', async () => {
    const { sampleBattle, sampleConditions } = await server.ssrLoadModule('/src/domain/battle/sampleDamageProjection.ts')
    assert.equal(sampleBattle({ hitForm: 'blade' }).hitForm, 'blade')
    assert.equal(sampleBattle({ hitForm: 'other' }).hitForm, 'shield')
    const conditions = sampleConditions('aegislash', { ownerKey: 'aegislash', own: { hitForm: 'blade' }, opponent: { hitForm: 'shield' } })
    assert.equal(conditions.own.hitForm, 'blade')
    assert.equal(conditions.opponent.hitForm, 'shield')
    assert.equal(sampleConditions('other', conditions).own.hitForm, 'shield')
  })
  test('sample damage manual actual overrides stay on their recorded form', async () => {
    const { sampleBattle, sampleBattleAtForm } = await server.ssrLoadModule('/src/domain/battle/sampleDamageProjection.ts')
    const original = sampleBattle({ actual: { defense: 160 }, hitForm: 'blade' })
    assert.deepEqual(sampleBattleAtForm(original, 'blade').actual, {})
    assert.equal(sampleBattleAtForm(original, 'shield').actual.defense, 160)
    const blade = sampleBattle({ actual: { defense: 70 }, actualForm: 'blade' })
    assert.equal(sampleBattleAtForm(blade, 'blade').actual.defense, 70)
    assert.deepEqual(sampleBattleAtForm(blade, 'shield').actual, {})
    assert.equal(original.actual.defense, 160)
  })
  test('Quick side exposes two explicit hit-time forms without changing species identity', async () => {
    const React = await import('react')
    const { renderToStaticMarkup } = await import('react-dom/server')
    const { QuickSideCard } = await server.ssrLoadModule('/src/features/damage/QuickSideCard.tsx')
    const entry = side('aegislash', 'stance-change')
    const noop = () => {}
    const markup = renderToStaticMarkup(React.createElement(QuickSideCard, { side: 'defender', entry, row: shield, setEntry: noop, searchField: null, language: 'ko', comparisonMode: false, tooltipForMove: () => ({}), opponentSource: undefined, model: { pools: {}, selected: { side: 'attacker', index: 0 }, drafts: {}, activeSlot: null, dirty: { attacker: new Set(), defender: new Set() }, moveMetaReady: false, calculate: () => null }, commands: { setActiveSlot: noop, setDrafts: noop, setSelected: noop, setModalKey: noop, setModalSide: noop, markDirty: noop, opener: { current: null } } }))
    assert.match(markup, /aria-label="실수치 폼"/)
    assert.match(markup, /aria-label="피격 폼"/)
    assert.match(markup, /실드/)
    assert.match(markup, /블레이드/)
    assert.match(markup, /피격 폼은 계산 조건/)
    const bladeMarkup = renderToStaticMarkup(React.createElement(QuickSideCard, { side: 'defender', entry: { ...entry, actualForm: 'blade', actual: { defense: '73' } }, row: shield, setEntry: noop, searchField: null, language: 'ko', comparisonMode: false, tooltipForMove: () => ({}), opponentSource: undefined, model: { pools: {}, selected: { side: 'attacker', index: 0 }, drafts: {}, activeSlot: null, dirty: { attacker: new Set(), defender: new Set() }, moveMetaReady: false, calculate: () => null }, commands: { setActiveSlot: noop, setDrafts: noop, setSelected: noop, setModalKey: noop, setModalSide: noop, markDirty: noop, opener: { current: null } } }))
    assert.match(bladeMarkup, /표시 실수치: 블레이드/)
    assert.match(bladeMarkup, /73/)
  })
  test('status, wrong species, or invalid ability never transforms', () => {
    assert.equal(prepare(side('aegislash', 'stance-change'), side('garchomp'), '킹실드').sourceStats.attack, 70)
    assert.equal(prepare(side('aegislash', 'invalid'), side('garchomp')).sourceStats.attack, 70)
    assert.equal(prepare(side('garchomp', 'stance-change'), side('garchomp')).sourceStats.attack, prepare(side('garchomp'), side('garchomp')).sourceStats.attack)
    assert.equal(quickSide({ key: 'aegislash', hitForm: 'blade' }).hitForm, 'blade')
    assert.equal(prepare(side('aegislash', 'stance-change'), side('garchomp'), '미확인 기술').sourceForm, 'shield')
  })
  test('Foul Play requires known Aegislash Attack in both hit forms unless an actual of that form is given', async () => {
    const [{ loadFormLearnset }, { loadMoveMetaByName }, { calculateQuickDamage }] = await Promise.all([
      server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts'), server.ssrLoadModule('/src/adapters/catalog/data.ts'), server.ssrLoadModule('/src/features/damage/calculateQuickDamage.ts'),
    ])
    const [umbreon] = await Promise.all([loadFormLearnset('umbreon'), loadMoveMetaByName()])
    const evaluate = target => calculateQuickDamage(prepareQuickDamageInput({ source: side('umbreon'), target, name: '속임수', conditions, pools: { umbreon }, language: 'ko' }))
    for (const hitForm of ['shield', 'blade']) {
      const target = { ...side('aegislash', 'stance-change'), hitForm, knownOffense: { attack: false, spAttack: true } }
      assert.equal(evaluate(target), null, `${hitForm}: unknown consumed Attack must not become EV zero`)
      assert.ok(evaluate({ ...target, knownOffense: { attack: true, spAttack: true } })?.damage.min > 0)
      assert.ok(evaluate({ ...target, actualForm: hitForm, actual: { attack: '95' } })?.damage.min > 0)
      assert.equal(evaluate({ ...target, actualForm: hitForm === 'shield' ? 'blade' : 'shield', actual: { attack: '95' } }), null)
      assert.equal(evaluate({ ...target, knownOffense: { attack: true, spAttack: true }, speedNatureKnown: false, statNatureMultipliers: {} }), null)
    }
  })
  test('sample result rows show the applied form only when a real damage result exists', async () => {
    const { readFileSync } = await import('node:fs')
    const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
    assert.match(app, /result\?\.damage[^\n]*?sample-form-result/)
    assert.match(app, /entry\.conditions\.own\.hitForm/)
    assert.match(app, /entry\.conditions\.opponent\.hitForm/)
  })
}
