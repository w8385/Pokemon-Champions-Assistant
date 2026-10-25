import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import * as registration from '../src/singleOpponentRegistration.ts'


const root = new URL('../', import.meta.url)
const roster = JSON.parse(readFileSync(new URL('src/pokemon_champions_verified_data.json', root)))
const app = readFileSync(new URL('src/App.tsx', root), 'utf8')
const generator = readFileSync(new URL('scripts/sync-champions-verified-data.mjs', root), 'utf8')
const verified = JSON.parse(readFileSync(new URL('src/verifiedAbilityLabels.json', root)))
const row = key => roster.rows.find(entry => entry.key === key)

// Game text IDs TOKUSEI_313 and TOKUSEI_316 at pinned champout 50e7233b78c3b81df29563f9695386c28e77fc95.
test('new Mega ability names use game-text Korean labels and survive roster regeneration', () => {
  assert.deepEqual(row('mega-eelektross').abilities_ko, ['천정부지'])
  assert.deepEqual(row('mega-pyroar').abilities_ko, ['불꽃의갈기'])
  assert.match(generator, /VERIFIED_CHAMPIONS_ABILITY_KO\[name\]/)
  assert.doesNotMatch(app, /'eelevate': '일렉트리베이트'/)
})

test('explicit new Mega form selection resolves one canonical ability, not a base-form or multi-ability guess', () => {
  assert.equal(typeof registration.soleAbilityForSelectedSpecies, 'function')
  assert.equal(registration.soleAbilityForSelectedSpecies(row('mega-starmie')), 'huge-power')
  assert.equal(registration.soleAbilityForSelectedSpecies(row('mega-eelektross')), 'eelevate')
  assert.equal(registration.soleAbilityForSelectedSpecies(row('mega-pyroar')), 'fire-mane')
  assert.equal(registration.soleAbilityForSelectedSpecies(row('charizard')), '')
  assert.equal(registration.soleAbilityForSelectedSpecies(undefined), '')
  assert.equal(registration.soleAbilityForSelectedSpecies(row('mega-charizard-x')), 'tough-claws')
})

test('actual Single registration and both Quick search callbacks use the form-specific selection only at explicit commit', () => {
  assert.match(app, /const next = \{ \.\.\.quickBlank\(\), key, ability: soleAbilityForSelectedSpecies\(indexByKey\.get\(key\)\), item: megaStoneForKey\(key\)/)
  assert.match(app, /registerOpponentSpecies\(opponents, current, key, \(\) => \(\{ \.\.\.blankOpponent\(\), ability: soleAbilityForSelectedSpecies\(indexByKey\.get\(key\)\), item: normalizeItemForKey\(key, ''\) \}\)\)/)
  const input = [{ key: 'charizard', ability: '', item: '', revealedMoves: ['파괴광선'] }, { key: '', ability: '', item: '', revealedMoves: [] }]
  const blank = () => ({ key: '', ability: '', item: 'starmienite', revealedMoves: [] })
  const selected = registration.registerOpponentSpecies(input, 0, 'mega-starmie', () => ({ ...blank(), ability: registration.soleAbilityForSelectedSpecies(row('mega-starmie')) }))
  assert.deepEqual(selected.slots[0], { key: 'mega-starmie', ability: 'huge-power', item: 'starmienite', revealedMoves: [] })
  assert.equal(selected.nextIndex, 1)
  assert.equal(registration.registerOpponentSpecies([{ ...selected.slots[0], ability: '', revealedMoves: ['아쿠아제트'] }, selected.slots[1]], 0, 'mega-starmie', blank).slots[0].ability, '')
  assert.equal(input[0].ability, '')
})

test('verified labels resolve in the shared form authority and actual saved-field boundary without inventing descriptions', async () => {
  assert.deepEqual(verified.abilities.eelevate, { ko: '천정부지', en: 'Eelevate', ja: 'うなぎのぼり' })
  assert.deepEqual(verified.abilities['fire-mane'], { ko: '불꽃의갈기', en: 'Fire Mane', ja: 'ほのおのたてがみ' })
  assert.match(app, /displayAbilities\(dexSelectedRow, siteLanguage\)/)
  assert.match(app, /ability=\{member\.ability\} abilityLabel=\{selectedAbilityDisplayName\(row, member\.ability, siteLanguage\)\}/)
  assert.match(app, /dexSelectedAbilityText\?\.detail \|\| dexSelectedAbilityText\?\.summary \|\| lt\('설명 데이터 없음'\)/)
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { abilityIndex, localizedAbilityLabel } = await server.ssrLoadModule('/src/abilityIdentity.ts')
    const { selectedAbilityDisplayName, classifyAbilityForKey } = await server.ssrLoadModule('/src/App.tsx')
    for (const slug of ['eelevate', 'fire-mane']) {
      const owner = roster.rows.find(entry => entry.abilities.includes(slug))
      assert.ok(owner, slug)
      const indexEntry = abilityIndex(roster.rows).byKey.get(slug)
      assert.equal(indexEntry.koLabel, verified.abilities[slug].ko)
      for (const language of ['ko', 'en', 'ja']) {
        assert.equal(localizedAbilityLabel(owner, slug, language), verified.abilities[slug][language])
        assert.equal(selectedAbilityDisplayName(owner, slug, language), verified.abilities[slug][language])
      }
      assert.equal(selectedAbilityDisplayName(owner, verified.abilities[slug].ko, 'ja'), verified.abilities[slug].ja)
      assert.equal(classifyAbilityForKey(owner.key, verified.abilities[slug].ja).slug, slug)
    }
  } finally { await server.close() }
})
