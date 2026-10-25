import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { classifyHeldItem, requiredMegaStone, itemForSpeciesSelection, isCalculableHeldItem } from '../src/itemIdentity.ts'
import { CHAMPIONS_ITEM_OPTIONS } from '../src/championsItems.ts'
import { quickItem } from '../src/quickDamageState.ts'
import { championsData } from '../src/effectiveRoster.ts'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('original held item is classified before Mega stone normalization', () => {
  assert.deepEqual(classifyHeldItem('mega-gyarados', 'こだわりスカーフ'), { status: 'incompatible', raw: 'こだわりスカーフ', canonical: 'こだわりスカーフ', requiredStone: '갸라도스나이트' })
  assert.equal(classifyHeldItem('mega-gyarados', '').status, 'incompatible')
  assert.equal(classifyHeldItem('mega-gyarados', '갸라도스나이트').status, 'required-stone')
  assert.equal(classifyHeldItem('garchomp', '갸라도스나이트').status, 'incompatible')
  assert.deepEqual(classifyHeldItem('garchomp', 'original-unknown'), { status: 'unknown', raw: 'original-unknown', canonical: null, requiredStone: null })
  assert.equal(classifyHeldItem('garchomp', '').status, 'none')
  assert.equal(classifyHeldItem('garchomp', '구애스카프').canonical, 'こだわりスカーフ')
})

test('all ordinary options stay valid independently of missing description metadata', () => {
  assert.equal(CHAMPIONS_ITEM_OPTIONS.length, 82)
  for (const item of CHAMPIONS_ITEM_OPTIONS) assert.equal(classifyHeldItem('garchomp', item).status, 'allowed', item)
})

test('Mega X/Y/Z and Starmie exact forms resolve their own stones', () => {
  for (const row of championsData.rows.filter(row => /^mega-/.test(row.key))) {
    const base = row.name_ko.replace(/^메가/, '').trim()
    const suffix = base.match(/\s*([XYZ])$/i)
    const expected = suffix ? `${base.replace(/\s*[XYZ]$/i, '').trim()}나이트${suffix[1].toUpperCase()}` : `${base}나이트`
    assert.equal(requiredMegaStone(row.key), expected, row.key)
  }
  assert.equal(requiredMegaStone('mega-starmie'), '아쿠스타나이트')
  assert.equal(requiredMegaStone('starmie'), null)
})

test('Quick restoration keeps incompatible and unknown raw; explicit selection repairs', () => {
  assert.equal(quickItem('こだわりスカーフ', '갸라도스나이트', CHAMPIONS_ITEM_OPTIONS), 'こだわりスカーフ')
  assert.equal(quickItem('original-unknown', null, CHAMPIONS_ITEM_OPTIONS), 'original-unknown')
  assert.equal(quickItem('', '갸라도스나이트', CHAMPIONS_ITEM_OPTIONS), '')
  assert.equal(itemForSpeciesSelection('mega-garchomp', 'original-unknown'), '한카리아스나이트')
  assert.equal(itemForSpeciesSelection('garchomp', '갸라도스나이트'), '')
  assert.equal(itemForSpeciesSelection('garchomp', 'こだわりスカーフ'), 'こだわりスカーフ')
})

test('source-evidenced Japanese Mega Stones remain valid without rewriting raw spelling', () => {
  for (const [key, raw] of [
    ['mega-lucario-z', 'ルカリオナイトZ'], ['mega-metagross', 'メタグロスナイト'],
    ['mega-dragonite', 'カイリュナイト'], ['mega-lucario', 'ルカリオナイト'],
    ['mega-floette', 'フラエッテナイト'], ['mega-garchomp-z', 'ガブリアスナイトZ'],
    ['mega-gyarados', 'ギャラドスナイト'],
  ]) {
    assert.equal(classifyHeldItem(key, raw).status, 'required-stone', raw)
    assert.equal(classifyHeldItem(key, raw).raw, raw)
    assert.equal(isCalculableHeldItem(key, raw), true)
  }
  assert.equal(classifyHeldItem('garchomp', 'ギャラドスナイト').status, 'incompatible')
})

test('every live App damage caller blocks bad raw before modifiers or calcDamage', () => {
  const single = app.slice(app.indexOf('const damageMovePreviews ='), app.indexOf('const damageMovePreviewByName ='))
  assert.match(single, /isCalculableHeldItem\(myMember\.key, myMember\.item\)/)
  assert.match(single, /isCalculableHeldItem\(oppMember\.key, oppMember\.item\)/)
  assert.match(app, /const damageModifiers = singleItemError \? null : resolveDamageModifiers\(/)
  const sample = app.slice(app.indexOf('const sampleDamageCalcs ='), app.indexOf('const addSampleSpeedTarget ='))
  assert.match(sample, /isCalculableHeldItem\(sampleForge\.key, sampleForge\.item\)/)
  assert.match(sample, /isCalculableHeldItem\(member\.key, member\.item\)/)
  const double = app.slice(app.indexOf('const buildDoubleDamageContext ='), app.indexOf('const doubleDamageContext ='))
  assert.match(double, /isCalculableHeldItem\(attackerKey, attackerItem\)/)
  assert.match(double, /isCalculableHeldItem\(defenderKey, defenderItem\)/)
  const doubleSpeed = app.slice(app.indexOf('const doubleSpeedOrder ='), app.indexOf('const doubleSpeedBySlot ='))
  assert.match(doubleSpeed, /isCalculableHeldItem\(entry\.option\.row\.key, entry\.side === 'my' \? entry\.option\.member\.item : entry\.option\.entry\.item\)/)
})

test('single and Builder speed outcomes do not report numbers for bad restored items', () => {
  const single = app.slice(app.indexOf('const singleItemError ='), app.indexOf('const speedAxisMin ='))
  assert.match(single, /heldItemError\(myMember\.key, myMember\.item, siteLanguage\)/)
  assert.match(single, /heldItemError\(oppMember\.key, oppMember\.item, siteLanguage\)/)
  const sample = app.slice(app.indexOf('const sampleSpeedCalcs ='), app.indexOf('const sampleDamageMoveChoices ='))
  assert.match(sample, /isCalculableHeldItem\(sampleForge\.key, sampleForge\.item\)/)
})

test('App and Quick consume raw authority at restoration and before calculation', () => {
  assert.match(app, /item: typeof raw\.item === 'string' \? raw\.item : ''/)
  assert.match(app, /classifyHeldItem\(source\.key, source\.item\)/)
  assert.match(app, /classifyHeldItem\(target\.key, target\.item\)/)
  assert.match(app, /heldItemError\(myMember\.key, myMember\.item, siteLanguage\)/)
  assert.match(app, /heldItemError\(oppMember\.key, oppMember\.item, siteLanguage\)/)
  assert.match(app, /fixedItem=\{requiredMegaStone\(row\.key\)\}/)
  const editor = readFileSync(new URL('../src/PokemonBuildFields.tsx', import.meta.url), 'utf8')
  assert.match(editor, /onClick=\{\(\) => \{ onItem\(fixedItem\); close\(true\) \}\}/)
  assert.match(editor, /role="alert"/)
})
