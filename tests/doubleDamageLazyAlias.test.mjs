import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'

const text = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const source = ts.createSourceFile('App.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const roster = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url))).rows
const descriptions = JSON.parse(readFileSync(new URL('../src/dexDescriptions.json', import.meta.url))).abilities
const nodes = {}
function visit(node) {
  if (ts.isVariableDeclaration(node) && ['buildDoubleDamageContext', 'doubleDamageContext', 'doubleActionCards', 'doubleCombinedDamageSummary'].includes(node.name.getText(source))) nodes[node.name.getText(source)] = node.initializer
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'heldAbilityError') nodes.heldAbilityError = node
  ts.forEachChild(node, visit)
}
visit(source)
for (const name of ['buildDoubleDamageContext', 'doubleDamageContext', 'doubleActionCards', 'doubleCombinedDamageSummary', 'heldAbilityError']) assert.ok(nodes[name])
const compile = code => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
const SLOT = ['myLeft', 'myRight', 'oppLeft', 'oppRight']

test('lazy alias refreshes actual memoized Double damage callback and individual/action/combined consumers without changing raw build', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { classifyAbilityForKey } = await server.ssrLoadModule('/src/App.tsx')
    const { isCalculableAbility } = await server.ssrLoadModule('/src/abilityIdentity.ts')
    const { abilityDescriptionFor, loadDexDescriptions } = await server.ssrLoadModule('/src/dex/data.ts')
    const attacker = roster.find(row => row.key === 'garchomp')
    const garchompRow = attacker
    const defender = roster.find(row => row.key === 'maushold')
    const alias = descriptions['friend-guard'].nameJa
    const raw = { key: defender.key, ability: alias, item: '', hpEv: 0, defenseEv: 0, spDefenseEv: 0, defenseNature: 1, spDefenseNature: 1, revealedMoves: [] }
    const my = { key: attacker.key, ability: '', item: '' }
    const doubleSlotMeta = {
      myLeft: { side: 'my', label: 'mine', option: { row: attacker, member: my } },
      myRight: { side: 'my', label: 'ally', option: null },
      oppLeft: { side: 'opp', label: 'target', option: { row: defender, entry: raw } },
      oppRight: { side: 'opp', label: 'other', option: null },
    }
    const cache = new Map()
    let sequence = 0
    const React = { useCallback(fn, deps) {
      const prev = cache.get('callback')
      if (prev && deps.length === prev.deps.length && deps.every((dep, index) => Object.is(dep, prev.deps[index]))) return prev.fn
      cache.set('callback', { fn, deps }); sequence++; return fn
    }, useMemo(fn) { return fn() } }
    const context = vm.createContext({
      React, doubleSlotMeta, doubleFriendGuardMy: false, doubleFriendGuardOpp: false, doubleProtectBySlot: { myLeft: false, myRight: false, oppLeft: false, oppRight: false },
      doubleWideGuardMy: false, doubleWideGuardOpp: false, doubleAttackerSlot: 'myLeft', doubleDefenderSlot: 'oppLeft', doubleMoveName: '테스트기', doubleSpreadMove: false,
      movePoolByKey: {}, lt: value => value, siteLanguage: 'ko', indexByKey: new Map(roster.map(row => [row.key, row])), rows: roster, abilityDescriptionFor,
      isCalculableAbility, isCalculableHeldItem: () => true, classifyAbilityForKey,
      attackingFormRow: row => row, buildPartyBattleStats: () => ({ hp: 100 }), buildOpponentBattleStats: () => ({ hp: 100 }),
      choicesForPool: () => [], resolveMoveMeta: () => ({ category: 'physical', power: 80, type: 'normal' }),
      resolveAbilityAdjustedMoveMeta: (_name, meta) => meta, resolveMoveType: () => 'normal', resolveAbilityAdjustedTypes: () => ['normal'],
      abilityAdjustedTypeEffectiveness: () => 1, protectionDamageMultiplier: () => 1,
      resolveDamageModifiers: () => ({ finalMultiplier: 1, notes: [] }),
      calcDamage: (_attacker, _defender, _power, _mode, _stab, _effectiveness, _move, modifier) => ({ min: 25 * modifier.finalMultiplier, max: 35 * modifier.finalMultiplier, minPct: 25 * modifier.finalMultiplier, maxPct: 35 * modifier.finalMultiplier }),
      DOUBLE_SPREAD_MOVE_NAMES: new Set(), normalizeSearchText: x => x, lookupMoveMeta: () => ({ type: 'normal', priority: 0 }),
      doubleActionMoveBySlot: { myLeft: '테스트기', myRight: '', oppLeft: '', oppRight: '' },
      doubleActionTargetBySlot: { myLeft: 'oppLeft' },
      doubleActionOptionsBySlot: { myLeft: ['테스트기'], myRight: [], oppLeft: [], oppRight: [] },
      doubleBoardStateCards: SLOT.map(slot => ({ slot, moves: slot === 'myLeft' ? ['테스트기'] : [] })),
      doubleTargetOptionsBySlot: { myLeft: ['oppLeft', 'oppRight'], myRight: ['oppLeft', 'oppRight'], oppLeft: ['myLeft', 'myRight'], oppRight: ['myLeft', 'myRight'] },
      doubleSlotDisplayName: slot => slot, doubleActionFocusSlot: 'myLeft',
      resolveDamageVerdictTone: () => 'neutral',
    })
    vm.runInContext(compile(nodes.heldAbilityError.getText(source)), context)
    const declarations = ['buildDoubleDamageContext', 'doubleDamageContext', 'doubleActionCards', 'doubleCombinedDamageSummary'].map(name => `const ${name} = ${nodes[name].getText(source)}; globalThis.${name} = ${name};`).join('\n')
    function render(version) {
      context.asyncDataVersion = version
      vm.runInContext(compile(`(() => { ${declarations} })()`), context)
      return {
        callback: context.buildDoubleDamageContext,
        individual: context.doubleDamageContext,
        action: context.doubleActionCards[0].moveRows[0].enemyTargets[0].previewText,
        combined: context.doubleCombinedDamageSummary.find(item => item.defenderSlot === 'oppLeft'),
      }
    }
    const before = render(0)
    assert.equal(before.individual, null)
    assert.equal(before.action, '계산 대기')
    assert.equal(before.combined.hasDamage, false)
    await loadDexDescriptions()
    assert.equal(raw.ability, alias, 'lazy load must not rewrite recorded ability')
    const after = render(1)
    assert.notEqual(after.callback, before.callback, 'memoized callback must update with lazy data version')
    assert.equal(after.individual?.damage?.min, 25)
    assert.equal(after.action, '25% ~ 35%')
    assert.equal(after.combined.hasDamage, true)
    assert.equal(after.combined.totalText, '25 ~ 35')
    // Both allied participants must be valid even when the restored effect toggle is off.
    const baseMeta = context.doubleSlotMeta
    for (const slot of ['myRight', 'oppRight']) {
      for (const ability of ['unverified-original', 'friend-guard']) {
        for (const toggle of [false, true]) {
          const ally = { key: garchompRow.key, ability, item: '', revealedMoves: [] }
          context.doubleFriendGuardOpp = toggle
          context.doubleSlotMeta = { ...baseMeta, [slot]: { side: slot === 'myRight' ? 'my' : 'opp', label: 'ally', option: { row: garchompRow, ...(slot === 'myRight' ? { member: ally } : { entry: ally }) } } }
          const blocked = render(1)
          assert.equal(blocked.individual, null, `${slot}: ${ability}, toggle=${toggle}`)
          assert.equal(blocked.action, '계산 대기')
          assert.equal(blocked.combined.hasDamage, false)
          assert.equal(ally.ability, ability, 'blocked original must not be rewritten')
        }
      }
    }
    context.doubleFriendGuardOpp = true
    context.doubleSlotMeta = { ...baseMeta, oppRight: { side: 'opp', label: 'ally', option: { row: defender, entry: { key: defender.key, ability: '', item: '', revealedMoves: [] } } } }
    assert.equal(render(1).individual.friendGuard, false, 'explicit blank permits neutral calculation')
    context.doubleSlotMeta = { ...baseMeta, oppRight: { side: 'opp', label: 'ally', option: { row: defender, entry: { key: defender.key, ability: 'friend-guard', item: '', revealedMoves: [] } } } }
    assert.equal(render(1).individual.friendGuard, true)
    context.doubleFriendGuardOpp = false
    assert.equal(render(1).individual.friendGuard, false)
    assert.ok(sequence >= 2)
    for (const name of ['doubleDamageContext', 'doubleActionCards', 'doubleCombinedDamageSummary']) {
      assert.ok(nodes[name].arguments[1].elements.some(item => item.getText(source) === 'buildDoubleDamageContext'), `${name} must depend on refreshed callback`)
    }
  } finally { await server.close() }
})
