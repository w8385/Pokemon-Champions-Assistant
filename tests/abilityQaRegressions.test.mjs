import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const roster = JSON.parse(readFileSync(new URL('../src/pokemon_champions_verified_data.json', import.meta.url)))
const labels = JSON.parse(readFileSync(new URL('../src/verifiedAbilityLabels.json', import.meta.url))).abilities

test('party and builder explicitly reselecting the same key retain every manually edited build field', () => {
  const callback = app.slice(app.indexOf('const selectSpecies = ('), app.indexOf('const trackedKeys ='))
  assert.match(callback, /if \(key === member\.key\) \{\s*setPartySearch\([\s\S]*?return\s*\}/)
  assert.match(callback, /if \(key === sampleForge\.key\) \{\s*setSampleSearch\([\s\S]*?return\s*\}/)
  assert.match(callback, /ability: defaultAbilityForKey\(key\)/)
  assert.match(callback, /setSampleForge\(\(prev\) => \(\{ \.\.\.prev, key, ability: defaultAbilityForKey\(key\)/)
})

test('known historic KO ability labels render in EN/JA without rewriting their saved value', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { PokemonBuildFields } = await server.ssrLoadModule('/src/PokemonBuildFields.tsx')
    for (const [key, storedKo] of [['mega-eelektross', '천정부지'], ['mega-pyroar', '불꽃의갈기']]) {
      const slug = roster.rows.find(row => row.key === key).abilities[0]
      for (const language of ['en', 'ja']) {
        const visible = labels[slug][language]
        const html = renderToStaticMarkup(React.createElement(PokemonBuildFields, {
          identity: key, ability: storedKo, abilityLabel: visible, nature: '', item: '',
          abilities: [{ value: visible, label: visible }], natures: [], itemOptions: () => [],
          onAbility: () => {}, onNature: () => {}, onItem: () => {},
          labels: { ability: 'Ability', nature: 'Nature', item: 'Item', none: 'None', itemPlaceholder: 'Item' },
          itemLabel: value => value, itemSprite: () => '/sprite.svg',
        }))
        assert.match(html, new RegExp(`<strong>${visible}</strong>`))
        assert.match(html, new RegExp(`aria-label="Ability: ${storedKo}"`))
      }
    }
    const unknown = renderToStaticMarkup(React.createElement(PokemonBuildFields, {
      identity: 'unknown', ability: 'creator-original', abilityLabel: undefined, nature: '', item: '', abilities: [], natures: [], itemOptions: () => [],
      onAbility: () => {}, onNature: () => {}, onItem: () => {},
      labels: { ability: 'Ability', nature: 'Nature', item: 'Item', none: 'None', itemPlaceholder: 'Item' }, itemLabel: value => value, itemSprite: () => '/sprite.svg',
    }))
    assert.match(unknown, /<strong>creator-original<\/strong>/)
  } finally { await server.close() }
})

test('party and builder use the same verified ability resolver for chips, retaining original storage', () => {
  assert.match(app, /function selectedAbilityDisplayName\(row: Row, storedAbility: string, language: SiteLanguage\)/)
  assert.match(app, /resolveSelectedAbility\(row, storedAbility, language\)/)
  assert.match(app, /abilityLabel=\{selectedAbilityDisplayName\(row, member\.ability, siteLanguage\)\}/)
  assert.match(app, /abilityLabel=\{selectedAbilityDisplayName\(sampleRow, sampleForge\.ability, siteLanguage\)\}/)
  assert.match(app, /ability=\{member\.ability\}/)
  assert.match(app, /ability=\{sampleForge\.ability\}/)
})

test('actual row resolver maps only known persisted ability values in each locale', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { selectedAbilityDisplayName } = await server.ssrLoadModule('/src/App.tsx')
    for (const [key, stored] of [['mega-eelektross', '천정부지'], ['mega-pyroar', '불꽃의갈기']]) {
      const row = roster.rows.find(entry => entry.key === key)
      for (const language of ['ko', 'en', 'ja']) {
        assert.equal(selectedAbilityDisplayName(row, stored, language), labels[row.abilities[0]][language])
        assert.equal(selectedAbilityDisplayName(row, row.abilities[0], language), labels[row.abilities[0]][language])
      }
      assert.equal(selectedAbilityDisplayName(row, '', 'ja'), undefined)
      assert.equal(selectedAbilityDisplayName(row, 'creator-original', 'ja'), undefined)
      assert.equal(selectedAbilityDisplayName(roster.rows.find(entry => entry.key === (key === 'mega-pyroar' ? 'mega-eelektross' : 'mega-pyroar')), stored, 'en'), undefined)
    }
  } finally { await server.close() }
})
