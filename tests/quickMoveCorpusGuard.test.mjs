import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { quickMoveSupported } from '../src/domain/battle/quickDamageState.ts'
import { MOVE_DAMAGE_EXCEPTIONS, QUICK_DAMAGE_UNSUPPORTED_REASONS, moveDynamicTypeRule, moveEffectivenessRule, moveIgnoresDefensiveStage, quickDamageContextUnavailableReason, quickDamageUnsupportedReason } from '../src/domain/battle/moveDamageSupport.ts'

const read = relative => JSON.parse(readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8'))
const learnsets = read('src/canonical-data/champions/dexGameLearnsets.json')
const metadata = read('src/canonical-data/champions/championsLearnedMoveMeta.json')
const index = read('src/canonical-data/champions/dexGameMoveIndex.json')
const activeNames = [...new Set(Object.values(learnsets.moves).map(move => move.appName))]
const fixtureText = readFileSync(new URL('./fixtures/champions-reviewed-scalars/base-moves.ts', import.meta.url), 'utf8')
const fixtureStarts = [...fixtureText.matchAll(/^\t([a-z0-9]+): \{/gm)]
const fixtureByNum = new Map(fixtureStarts.flatMap((start, index) => {
  const block = fixtureText.slice(start.index, fixtureStarts[index + 1]?.index ?? fixtureText.length)
  const num = block.match(/^\s*num:\s*(-?\d+),/m)?.[1]
  return num ? [[Number(num), block]] : []
}))

const expectedUnsupported = {
  '가위자르기': 'one-hit-ko',
  '뿔드릴': 'one-hit-ko',
  '땅가르기': 'one-hit-ko',
  '절대영도': 'one-hit-ko',
  '카운터': 'counter-damage',
  '미러코트': 'counter-damage',
  '메탈버스트': 'counter-damage',
  '앙갚음': 'counter-damage',
  '지구던지기': 'level-fixed-damage',
  '나이트헤드': 'level-fixed-damage',
  '분노의앞니': 'target-current-hp',
  '죽기살기': 'hp-difference',
  '목숨걸기': 'user-current-hp',
  '집단구타': 'party-dependent',
  '내던지기': 'held-item-dependent',
  '오라휠': 'form-dependent-type',
}

test('all 510 active Champions moves have a category after the source-only status correction', () => {
  assert.equal(activeNames.length, 510)
  assert.deepEqual(activeNames.filter(name => !metadata[name]), [])
  assert.deepEqual(activeNames.filter(name => !['physical', 'special', 'status'].includes(metadata[name].category)), [])
  assert.equal(metadata['볼가득넣기'].category, 'status')
})

test('every active damaging move passes the calculation gate or has one exact reviewed unsupported reason', () => {
  const damaging = activeNames.filter(name => ['physical', 'special'].includes(metadata[name].category))
  const unsupported = damaging.filter(name => !quickMoveSupported(name, metadata[name])).sort()
  assert.equal(damaging.length, 333)
  assert.deepEqual(unsupported, Object.keys(expectedUnsupported).sort())
  assert.deepEqual(QUICK_DAMAGE_UNSUPPORTED_REASONS, expectedUnsupported)
  for (const name of unsupported) assert.equal(quickDamageUnsupportedReason(name), expectedUnsupported[name], name)
  for (const name of damaging.filter(name => !unsupported.includes(name))) assert.equal(quickDamageUnsupportedReason(name), null, name)
})

test('fixture callback capabilities are implemented or reason-blocked by the same registry', () => {
  const damaging = activeNames.filter(name => ['physical', 'special'].includes(metadata[name].category))
  const withMarker = marker => damaging.filter(name => fixtureByNum.get(index[name].id)?.includes(marker)).sort()
  const damageCallbacks = ['메탈버스트', '목숨걸기', '미러코트', '분노의앞니', '앙갚음', '죽기살기', '카운터'].sort()
  assert.deepEqual(withMarker('damageCallback'), damageCallbacks)
  for (const name of damageCallbacks) assert.ok(quickDamageUnsupportedReason(name), name)
  assert.deepEqual(withMarker('onEffectiveness'), ['프리즈드라이', '플라잉프레스'].sort())
  for (const name of withMarker('onEffectiveness')) assert.ok(moveEffectivenessRule(name), name)
  assert.deepEqual(withMarker('ignoreDefensive: true'), ['DD래리어트', '성스러운칼'].sort())
  for (const name of withMarker('ignoreDefensive: true')) assert.equal(moveIgnoresDefensiveStage(name), true, name)
  assert.deepEqual(withMarker('onModifyType'), ['대지의파동', '레이징불', '오라휠', '웨더볼'].sort())
  assert.equal(moveDynamicTypeRule('레이징불'), 'raging-bull')
  assert.equal(MOVE_DAMAGE_EXCEPTIONS['오라휠'].kind, 'unsupported')
})

test('implemented active move exceptions remain calculable while form-ambiguous Aura Wheel is blocked', () => {
  for (const name of ['프리즈드라이', '플라잉프레스', 'DD래리어트', '성스러운칼', '셸암즈', '레이징불']) {
    assert.equal(quickMoveSupported(name, metadata[name]), true, name)
  }
  assert.equal(quickMoveSupported('오라휠', metadata['오라휠']), false)
  assert.equal(quickDamageUnsupportedReason('오라휠'), 'form-dependent-type')
})

test('all active damaging moves blocked by Gravity share one contextual reason', () => {
  const expected = ['공중날기', '무릎차기', '뛰어오르기', '플라잉프레스'].sort()
  const fixtureGravityMoves = activeNames.filter(name => ['physical', 'special'].includes(metadata[name].category) && fixtureByNum.get(index[name].id)?.includes('gravity: 1')).sort()
  assert.deepEqual(fixtureGravityMoves, expected)
  for (const name of expected) {
    assert.ok(activeNames.includes(name), name)
    assert.equal(quickDamageContextUnavailableReason(name, { gravity: false }), null, name)
    assert.equal(quickDamageContextUnavailableReason(name, { gravity: true }), 'gravity-blocked', name)
  }
  assert.equal(quickDamageContextUnavailableReason('지진', { gravity: true }), null)
})
