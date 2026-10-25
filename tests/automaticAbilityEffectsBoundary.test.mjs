import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { createServer } from 'vite'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const roster = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url))).rows
const descriptions = JSON.parse(readFileSync(new URL('../src/dexDescriptions.json', import.meta.url))).abilities
const row = key => roster.find(entry => entry.key === key)
function declaration(name, kind, after = -1) {
  let found
  function visit(node) {
    if (kind === 'function' && ts.isFunctionDeclaration(node) && node.name?.text === name) found = node
    if (kind === 'variable' && ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name && (after >= 0 ? node.pos > after : (!['defenderAbilityValue', 'ability'].includes(name) || (node.pos > source.indexOf(name === 'ability' ? '  const partyAnalysis = React.useMemo(' : '  const myCalcAbility =') && node.pos < source.indexOf(name === 'ability' ? '  const pickedOpponents =' : '  const sampleAttackerAbilityValue ='))))) {
      if (!found || node.pos < found.pos || after < 0) found = node
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(found, `actual App ${kind} ${name} exists`)
  return found
}
function evaluate(code, context) {
  const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None, jsx: ts.JsxEmit.React } }).outputText
  return Function(...Object.keys(context), js)(...Object.values(context))
}
function actualFunction(name, context) {
  return evaluate(`${declaration(name, 'function').getText(ast)}; return ${name}`, context)
}
function actualVariable(name, context, after = -1) {
  return evaluate(`return ${declaration(name, 'variable', after).initializer.getText(ast)}`, context)
}
function actualAutoEffect(marker, context) {
  let callback
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'React.useEffect' && node.arguments[0]?.getText(ast).includes(marker)) callback = node.arguments[0]
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(callback, `actual auto effect ${marker}`)
  return evaluate(`return ${callback.getText(ast)}`, context)
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
try {
  const { resolveFormAbility, localizedAbilityLabel, isCalculableAbility } = await server.ssrLoadModule('/src/abilityIdentity.ts')
  const abilityDescriptionFor = slug => descriptions[slug] ?? null
  const resolveSelectedAbility = actualFunction('resolveSelectedAbility', { resolveFormAbility, localizedAbilityLabel, abilityDescriptionFor, rows: roster })
  const weatherFromAbility = actualFunction('weatherFromAbility', {})
  const terrainFromAbility = actualFunction('terrainFromAbility', {})
  const deriveAutoWeatherFromAbilities = actualFunction('deriveAutoWeatherFromAbilities', { weatherFromAbility })
  const deriveAutoTerrainFromAbilities = actualFunction('deriveAutoTerrainFromAbilities', { terrainFromAbility })
  const resolve = (key, raw, lang = 'ko') => resolveSelectedAbility(row(key), raw, lang)
  const single = (myKey, myAbility, oppKey, oppAbility, calcSwapSides = false) => {
    const myRow = row(myKey), oppRow = row(oppKey), myMember = { key: myKey, ability: myAbility }, oppMember = { key: oppKey, ability: oppAbility }
    const ctx = { myRow, oppRow, myMember, oppMember, calcSwapSides, calcMyKey: myKey, calcOppKey: oppKey, siteLanguage: 'ko', defaultAbilityForKey: () => '', resolveSelectedAbility,
      sanitizeAbilityForKey: (_key, value) => value }
    for (const name of ['myCalcAbility', 'oppCalcAbility', 'selectedMyAbility', 'selectedOppAbility', 'attackFromOpponent', 'attackerRow', 'defenderRow', 'attackerAbilityValue', 'defenderAbilityValue']) { try { ctx[name] = actualVariable(name, ctx) } catch (error) { throw new Error(`evaluating ${name}: ${declaration(name, 'variable').initializer.getText(ast)}`, { cause: error }) } }
    return { attacker: ctx.attackerAbilityValue, defender: ctx.defenderAbilityValue, weather: deriveAutoWeatherFromAbilities(ctx.attackerAbilityValue, ctx.defenderAbilityValue), terrain: deriveAutoTerrainFromAbilities(ctx.attackerAbilityValue, ctx.defenderAbilityValue), raw: [myMember.ability, oppMember.ability] }
  }
  const builder = (key, ability) => {
    const sampleForge = { key, ability }, sampleRow = row(key), siteLanguage = 'ko'
    const sampleAttackerAbilityValue = actualVariable('sampleAttackerAbilityValue', { sampleForge, sampleRow, siteLanguage, resolveSelectedAbility, sanitizeAbilityForKey: (_key, value) => value })
    return { ability: sampleAttackerAbilityValue, weather: actualVariable('sampleBaselineWeather', { sampleAttackerAbilityValue, deriveAutoWeatherFromAbilities }), terrain: actualVariable('sampleBaselineTerrain', { sampleAttackerAbilityValue, deriveAutoTerrainFromAbilities }), raw: sampleForge.ability }
  }
  test('unverified Mega Starmie Drizzle cannot set automatic rain on either Single direction or Builder baseline', () => {
    for (const reversed of [false, true]) {
      const actual = single('mega-starmie', 'drizzle', 'starmie', '', reversed)
      assert.deepEqual(actual.raw, ['drizzle', ''])
      assert.equal(actual.weather, 'none')
      assert.equal(actual.attacker, reversed ? '' : '')
      assert.equal(actual.defender, '')
    }
    assert.deepEqual(builder('mega-starmie', 'drizzle'), { ability: '', weather: 'none', terrain: 'none', raw: 'drizzle' })
  })
  test('wrong-form terrain and contextual defender effects do not escape the canonical boundary', () => {
    const surge = roster.find(entry => entry.abilities.includes('electric-surge'))
    const wrong = roster.find(entry => entry.key !== surge.key && !entry.abilities.includes('electric-surge'))
    assert.equal(single(wrong.key, 'electric-surge', 'starmie', '').terrain, 'none')
    assert.equal(builder(wrong.key, 'electric-surge').terrain, 'none')
    const target = { key: wrong.key, ability: 'disguise' }
    const sampleDamageTargets = [target], indexByKey = new Map(roster.map(entry => [entry.key, entry])), siteLanguage = 'ko'
    assert.deepEqual(actualVariable('sampleDamageDefenderAbilitySlugs', { sampleDamageTargets, indexByKey, siteLanguage, resolveSelectedAbility }), [''])
    const selectedAbility = resolve(wrong.key, 'disguise')
    assert.equal(selectedAbility, null)
    assert.equal(actualVariable('ability', { selectedAbility, member: target }), '')
  })
  test('only verified form aliases drive effects, blanks remain neutral, and explicit repair restores effects', () => {
    const pelipper = row('pelipper')
    assert.ok(pelipper?.abilities.includes('drizzle'))
    const alias = pelipper.abilities_ko[pelipper.abilities.indexOf('drizzle')]
    assert.equal(resolve(pelipper.key, alias)?.slug, 'drizzle')
    assert.equal(single(pelipper.key, alias, 'starmie', '').weather, 'rain')
    assert.equal(builder(pelipper.key, alias).weather, 'rain')
    for (const reversed of [false, true]) {
      assert.equal(single('mega-starmie', 'drizzle', pelipper.key, '', reversed).weather, 'none')
      assert.equal(single('mega-starmie', 'huge-power', pelipper.key, 'drizzle', reversed).weather, 'rain')
    }
    assert.equal(single('mega-starmie', '', pelipper.key, '').weather, 'none')
    assert.equal(builder('mega-starmie', 'huge-power').weather, 'none')
    assert.equal(builder('mega-starmie', 'huge-power').terrain, 'none')
  })
  test('unknown inputs still block Single and Builder damage rather than becoming confirmed neutral', () => {
    const indexByKey = new Map(roster.map(entry => [entry.key, entry]))
    const heldAbilityError = actualFunction('heldAbilityError', { isCalculableAbility, indexByKey, abilityDescriptionFor, rows: roster })
    const raw = 'drizzle', key = 'mega-starmie', siteLanguage = 'ko'
    assert.ok(heldAbilityError(key, raw, siteLanguage))
    assert.equal(heldAbilityError(key, '', siteLanguage), null)
    const myMember = { key, ability: raw, item: '' }, oppMember = { key: 'starmie', ability: '', item: '' }
    assert.ok(actualVariable('singleItemError', { myMember, oppMember, heldAbilityError, heldItemError: () => null, siteLanguage }))
    const sampleForge = myMember, member = oppMember
    assert.equal(actualVariable('itemMismatch', { sampleForge, member, isCalculableHeldItem: () => true, heldAbilityError, siteLanguage }), true)
    const target = { key, ability: 'disguise' }, targetRow = row(key)
    assert.equal(actualVariable('defenderAbilityValue', { row: targetRow, member: target, siteLanguage, resolveSelectedAbility }, source.indexOf('  const sampleDamageCalcs =')), '')
  })
  test('Builder sample effectiveness consumes the Builder attacker identity, not the unrelated Single attacker', () => {
    const input = { moveType: 'water', effectiveDefenderTypes: ['fire'], defenderAbilityValue: '', sampleAttackerAbilityValue: '', attackerAbilityValue: 'drizzle', abilityAdjustedTypeEffectiveness: (_move, _types, _defender, attacker) => attacker }
    assert.equal(actualVariable('effectivenessValue', input, source.indexOf('  const sampleDamageCalcs =')), '')
  })
  test('actual auto field effects clear a previous automatic field without overwriting a manual field', () => {
    for (const [marker, previous, setter] of [['const previousAutoWeather', 'rain', 'setCalcWeather'], ['const previousAutoTerrain', 'electric', 'setCalcTerrain']]) {
      for (const [current, expected] of [[previous, 'none'], ['sun', null]]) {
        const ref = { current: previous }, changes = []
        const ctx = { autoWeatherRef: ref, autoTerrainRef: ref, autoWeatherFromAbilities: 'none', autoTerrainFromAbilities: 'none', calcWeather: current, calcTerrain: current, setCalcWeather: value => changes.push(value), setCalcTerrain: value => changes.push(value) }
        actualAutoEffect(marker, ctx)()
        assert.deepEqual(changes, expected === null ? [] : [expected], `${marker} ${current}`)
        assert.equal(ref.current, 'none')
      }
    }
  })
} finally { await server.close() }
