import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
test('party, quick, sample and sample target use the input-owning shared editor', () => {
  assert.equal((app.match(/<PokemonBuildFields\b/g) ?? []).length, 4)
  const party = app.slice(app.indexOf('className="entry-grid manage-entry-grid"'), app.indexOf('className="move-card inline-move-card"'))
  const quick = app.slice(app.indexOf('const sideCard ='), app.indexOf('const toggle ='))
  const sample = app.slice(app.indexOf('className="sample-meta-grid"') - 200, app.indexOf('sampleRegisteredMoves.map('))
  for (const section of [party, quick, sample]) assert.match(section, /<PokemonBuildFields\b/)
  assert.doesNotMatch(party, /party-meta-chip-button/)
  assert.doesNotMatch(quick, /<select[^>]*value=\{entry\.ability\}/)
})

test('shared fields render original values and three labeled buttons', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { PokemonBuildFields } = await server.ssrLoadModule('/src/PokemonBuildFields.tsx')
    const html = renderToStaticMarkup(React.createElement(PokemonBuildFields, {
      identity: 'foo', ability: 'unknown original', nature: 'unknown nature', item: 'unknown item',
      abilities: [{ value: 'known', label: 'Known' }], natures: [{ value: 'neutral', label: 'Neutral' }],
      itemOptions: () => [{ value: 'item', label: 'Item' }], onAbility: () => {}, onNature: () => {}, onItem: () => {},
      labels: { ability: 'Ability', nature: 'Nature', item: 'Item', none: 'None', itemPlaceholder: 'Search items' },
      itemLabel: value => value, itemSprite: () => '/sprite.svg',
    }))
    for (const value of ['unknown original', 'unknown nature', 'unknown item']) assert.match(html, new RegExp(value))
    assert.equal((html.match(/party-meta-chip-button/g) ?? []).length, 3)
  } finally { await server.close() }
})

test('shared popover keyboard navigation focuses options and ignores composition', () => {
  const source = readFileSync(new URL('../src/PokemonBuildFields.tsx', import.meta.url), 'utf8')
  assert.match(source, /optionRefs\.current\[next\]\?\.focus\(\)/)
  assert.match(source, /event\.nativeEvent\.isComposing \|\| event\.nativeEvent\.keyCode === 229/)
})

test('shared popover closes on outside pointer without relying on blur', () => {
  const source = readFileSync(new URL('../src/PokemonBuildFields.tsx', import.meta.url), 'utf8')
  assert.match(source, /document\.addEventListener\('pointerdown', onOutside\)/)
})

test('ability option focus composes highlight and tooltip callbacks', () => {
  const source = readFileSync(new URL('../src/PokemonBuildFields.tsx', import.meta.url), 'utf8')
  assert.match(source, /onFocus=\{event => \{ setHighlight\(index\); optionTooltip\?\.onFocus\?\.\(event\) \}\}/)
})

test('escape restores focus without a background-tab animation frame', () => {
  const source = readFileSync(new URL('../src/PokemonBuildFields.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /requestAnimationFrame\(\(\) => trigger\.current\[field\]\?\.focus\(\)\)/)
})

test('recorded unknown item takes display precedence over required mega item', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { PokemonBuildFields } = await server.ssrLoadModule('/src/PokemonBuildFields.tsx')
    const html = renderToStaticMarkup(React.createElement(PokemonBuildFields, {
      identity: 'mega', ability: '', nature: 'jolly', item: 'recorded scarf', fixedItem: 'mandatory stone',
      abilities: [], natures: [], itemOptions: () => [], onAbility: () => {}, onNature: () => {}, onItem: () => {},
      labels: { ability: 'Ability', nature: 'Nature', item: 'Item', none: 'None', itemPlaceholder: 'Search items' },
      itemLabel: value => value, itemSprite: () => '/sprite.svg',
    }))
    assert.match(html, /recorded scarf/)
    assert.doesNotMatch(html, /mandatory stone/)
  } finally { await server.close() }
})
