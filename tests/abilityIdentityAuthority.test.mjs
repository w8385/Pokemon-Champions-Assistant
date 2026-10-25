import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const roster = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url)))
const labels = JSON.parse(readFileSync(new URL('../src/verifiedAbilityLabels.json', import.meta.url))).abilities
const descriptions = JSON.parse(readFileSync(new URL('../src/dexDescriptions.json', import.meta.url))).abilities

async function withAuthority(run) {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try { return await run(await server.ssrLoadModule('/src/abilityIdentity.ts')) }
  finally { await server.close() }
}

test('every roster form recognizes its own slug and localized labels without altering recorded text', async () => withAuthority(({ resolveFormAbility, localizedAbilityLabel }) => {
  for (const row of roster.rows) for (const slug of row.abilities) {
    for (const lang of ['ko', 'en', 'ja']) {
      const shown = localizedAbilityLabel(row, slug, lang)
      const result = resolveFormAbility(row, shown)
      assert.equal(result.status, 'allowed', `${row.key} ${slug} ${lang}: ${shown}`)
      assert.equal(result.slug, slug)
      assert.equal(result.raw, shown)
      assert.equal(result.display, shown)
    }
    assert.equal(resolveFormAbility(row, slug).slug, slug)
  }
}))

test('same raw has unavailable, unknown, or explicit-empty state rather than a sole-form fallback', async () => withAuthority(({ resolveFormAbility, isCalculableAbility, abilityForSpeciesSelection }) => {
  const mega = roster.rows.find(row => row.key === 'mega-starmie')
  const base = roster.rows.find(row => row.key === 'starmie')
  const wrong = base.abilities.find(slug => !mega.abilities.includes(slug))
  assert.ok(wrong)
  assert.deepEqual(resolveFormAbility(mega, wrong, undefined, roster.rows).status, 'unavailable')
  assert.equal(resolveFormAbility(mega, wrong).raw, wrong)
  assert.equal(isCalculableAbility(mega, wrong), false)
  assert.equal(resolveFormAbility(mega, 'creator-original').status, 'unknown')
  assert.equal(resolveFormAbility(mega, 'creator-original').display, 'creator-original')
  assert.equal(isCalculableAbility(mega, 'creator-original'), false)
  assert.equal(resolveFormAbility(mega, '').status, 'empty')
  assert.equal(isCalculableAbility(mega, ''), true)
  assert.equal(abilityForSpeciesSelection(mega, mega.key, mega.key, ''), '')
  assert.equal(abilityForSpeciesSelection(mega, base.key, mega.key, 'creator-original'), mega.abilities[0])
}))

test('verified lazy description aliases are recognized only for abilities actually owned by the form', async () => withAuthority(({ resolveFormAbility, abilityIndex }) => {
  const row = roster.rows.find(row => row.abilities.some(slug => descriptions[slug]?.nameJa))
  const slug = row.abilities.find(slug => descriptions[slug]?.nameJa)
  const localized = descriptions[slug].nameJa
  assert.equal(resolveFormAbility(row, localized, key => descriptions[key]).slug, slug)
  const index = abilityIndex(roster.rows, key => descriptions[key])
  assert.equal(index.byNormalized.get(localized.toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g, ''))?.key, slug)
  const other = roster.rows.find(candidate => !candidate.abilities.includes(slug))
  assert.equal(resolveFormAbility(other, localized, key => descriptions[key], roster.rows).status, 'unavailable')
  assert.equal(resolveFormAbility(row, 'unproven', key => descriptions[key]).status, 'unknown')
}))

test('colliding localized aliases have no global authority and resolve only on a uniquely owning form', async () => withAuthority(({ abilityIndex, resolveFormAbility, isCalculableAbility }) => {
  const first = { key: 'first', abilities: ['alpha'], abilities_ko: ['동음'] }
  const second = { key: 'second', abilities: ['beta'], abilities_ko: ['동음'] }
  for (const order of [[first, second], [second, first]]) {
    const index = abilityIndex(order)
    assert.equal(index.byNormalized.get('동음'), undefined)
    assert.equal(resolveFormAbility(first, '동음', undefined, order).slug, 'alpha')
    assert.equal(resolveFormAbility(second, '동음', undefined, order).slug, 'beta')
    assert.equal(resolveFormAbility(first, 'beta', undefined, order).status, 'unavailable')
  }
  const conflictingForm = { key: 'conflict', abilities: ['alpha', 'beta'], abilities_ko: ['동음', '동음'] }
  assert.equal(resolveFormAbility(conflictingForm, '동음').status, 'unknown')
  assert.equal(isCalculableAbility(conflictingForm, '동음'), false)
  assert.equal(resolveFormAbility(conflictingForm, 'alpha').slug, 'alpha')
}))

test('late description load makes Japanese alias resolvable without converting missing metadata into an invalid slug', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { classifyAbilityForKey, selectedAbilityDisplayName } = await server.ssrLoadModule('/src/App.tsx')
    const { loadDexDescriptions, abilityDescriptionFor } = await server.ssrLoadModule('/src/dex/data.ts')
    const { abilityIndex } = await server.ssrLoadModule('/src/abilityIdentity.ts')
    const row = roster.rows.find(entry => entry.key === 'mega-alakazam')
    assert.ok(row.abilities.includes('trace'))
    assert.equal(classifyAbilityForKey(row.key, 'trace').status, 'allowed')
    assert.equal(abilityDescriptionFor('trace'), null)
    assert.equal(classifyAbilityForKey(row.key, 'トレース').status, 'unknown')
    assert.equal(abilityIndex(roster.rows, abilityDescriptionFor).byNormalized.get('トレス'), undefined)
    await loadDexDescriptions()
    assert.equal(abilityDescriptionFor('trace').nameJa, 'トレース')
    assert.equal(classifyAbilityForKey(row.key, 'トレース').slug, 'trace')
    assert.equal(selectedAbilityDisplayName(row, 'トレース', 'ja'), 'トレース')
    assert.equal(abilityIndex(roster.rows, abilityDescriptionFor).byNormalized.get('トレス')?.key, 'trace')
  } finally { await server.close() }
})

test('App read boundary preserves raw evidence and distinguishes blocked calculations from explicit blank', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { classifyAbilityForKey, selectedAbilityDisplayName } = await server.ssrLoadModule('/src/App.tsx')
    const row = roster.rows.find(entry => entry.key === 'mega-starmie')
    assert.equal(classifyAbilityForKey(row.key, 'creator-original').raw, 'creator-original')
    assert.equal(classifyAbilityForKey(row.key, 'creator-original').status, 'unknown')
    assert.equal(classifyAbilityForKey(row.key, '').status, 'empty')
    assert.equal(selectedAbilityDisplayName(row, 'creator-original', 'ja'), undefined)
    assert.equal(selectedAbilityDisplayName(row, row.abilities[0], 'ja'), labels[row.abilities[0]]?.ja ?? row.abilities[0].split('-').map(x => x[0].toUpperCase() + x.slice(1)).join(' '))
  } finally { await server.close() }
})

test('shared ability field warns without substituting the sole-form label', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { PokemonBuildFields } = await server.ssrLoadModule('/src/PokemonBuildFields.tsx')
    const html = renderToStaticMarkup(React.createElement(PokemonBuildFields, {
      identity: 'mega-starmie', ability: 'creator-original', abilityError: 'Unknown ability; choose or clear', nature: '', item: '',
      abilities: [{ value: 'huge-power', label: 'Huge Power' }], natures: [], itemOptions: () => [],
      onAbility: () => {}, onNature: () => {}, onItem: () => {},
      labels: { ability: 'Ability', nature: 'Nature', item: 'Item', none: 'None', itemPlaceholder: 'Item' },
      itemLabel: value => value, itemSprite: () => '/item-generic.svg',
    }))
    assert.match(html, /creator-original/)
    assert.match(html, /Unknown ability; choose or clear/)
    assert.doesNotMatch(html, /<strong>Huge Power<\/strong>/)
  } finally { await server.close() }
})

test('actual Party and Quick hydration retain unknown and explicit blank', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { sanitizeParty, quickSide } = await server.ssrLoadModule('/src/App.tsx')
    for (const raw of ['creator-original', '']) {
      const saved = { key: 'mega-starmie', ability: raw, item: '' }
      assert.equal(sanitizeParty(JSON.parse(JSON.stringify([saved])))[0].ability, raw)
      assert.equal(quickSide(JSON.parse(JSON.stringify(saved))).ability, raw)
    }
  } finally { await server.close() }
})

test('actual Quick entry shows invalid ability and an explicit repair path', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  const before = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null } })
  try {
    const { QuickDamagePanel, quickSide } = await server.ssrLoadModule('/src/App.tsx')
    const defender = quickSide({ key: 'starmie', ability: '', item: '' })
    const invalid = quickSide({ key: 'mega-starmie', ability: 'creator-original', item: '' })
    const html = renderToStaticMarkup(React.createElement(QuickDamagePanel, { language: 'en', tooltipForMove: () => ({}), initialSides: [invalid, defender] }))
    assert.match(html, /Unrecognized or unavailable ability/)
    assert.match(html, /creator-original/)
    assert.match(html, /Open Ability to select one or explicitly clear it/)
  } finally { if (before) Object.defineProperty(globalThis, 'localStorage', before); else delete globalThis.localStorage; await server.close() }
})
