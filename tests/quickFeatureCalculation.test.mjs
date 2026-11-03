import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'silent' })
test.after(async () => server.close())
test('pure Quick calculation preserves independent side direction and four-slot gap with real metadata and rules', async () => {
  const [{ calculateQuickDamage }, { prepareQuickDamageInput }, { quickSide }, { loadFormLearnset }, { loadMoveMetaByName }] = await Promise.all([
    server.ssrLoadModule('/src/features/damage/calculateQuickDamage.ts'), server.ssrLoadModule('/src/features/damage/prepareQuickDamageInput.ts'), server.ssrLoadModule('/src/features/damage/quickModel.ts'), server.ssrLoadModule('/src/domain/champions/sharedLearnsets.ts'), server.ssrLoadModule('/src/adapters/catalog/data.ts'),
  ])
  const [ownPool, foePool] = await Promise.all([loadFormLearnset('cinderace'), loadFormLearnset('garchomp'), loadMoveMetaByName()]).then(([a,b]) => [a,b])
  const own = quickSide({ key: 'cinderace', ability: 'libero', moves: ['', '', '무릎차기', ''] })
  const foe = quickSide({ key: 'garchomp', moves: ['', '지진', '', ''] })
  const conditions = { weather: 'none', terrain: 'none', critical: false, typeChangeStab: false, hits: 2 }
  const pools = { cinderace: ownPool, garchomp: foePool }
  const evaluate = (source, target, name) => calculateQuickDamage(prepareQuickDamageInput({ source, target, name, conditions, pools, language: 'ko' }))
  const forward = evaluate(own, foe, own.moves[2])
  const reverse = evaluate(foe, own, foe.moves[1])
  assert.equal(own.moves[0], '')
  assert.equal(foe.moves[0], '')
  assert.ok(forward?.damage.min > 0, 'forward real calculation')
  assert.ok(reverse?.damage.min > 0, 'reverse real calculation')
  assert.notDeepEqual(forward, reverse)
  assert.deepEqual(calculateQuickDamage(prepareQuickDamageInput({ source: own, target: foe, name: '없는기술', conditions, pools, language: 'ko' })), null)
  assert.deepEqual(evaluate({ ...own, ability: 'unknown-ability' }, foe, own.moves[2]), null)
  assert.deepEqual(evaluate(own, { ...foe, key: 'unknown-form' }, own.moves[2]), null)
  assert.ok(evaluate({ ...own, ability: '' }, foe, own.moves[2])?.damage.min > 0, 'blank ability is neutral and calculable')
  const [drillPool, rotomPool] = await Promise.all([loadFormLearnset('excadrill'), loadFormLearnset('rotom')])
  pools.excadrill = drillPool; pools.rotom = rotomPool
  const drill = quickSide({ key: 'excadrill', ability: 'mold-breaker', moves: ['지진','','',''] })
  const rotom = quickSide({ key: 'rotom', ability: 'levitate' })
  const bypass = evaluate(drill, rotom, '지진')
  const immune = evaluate({ ...drill, ability: '' }, rotom, '지진')
  assert.ok(bypass?.damage.min > 0, 'Mold Breaker passes real Levitate immunity through final resolver')
  assert.equal(immune?.effectiveness, 0, 'without Mold Breaker Levitate remains immune')
  assert.deepEqual(evaluate({ ...drill, ability: 'not-canonical' }, rotom, '지진'), null)
})
