import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import { createServer } from 'vite'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const tree = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const attr = (node, key) => node.openingElement?.attributes.properties.some(a => a.name?.text === key)
const classAttr = (node, value) => node.openingElement?.attributes.properties.some(a => a.name?.text === 'className' && a.initializer?.text?.split(' ').includes(value))
const find = (root, predicate) => {
  const matches = []
  const walk = node => { if (predicate(node)) matches.push(node); ts.forEachChild(node, walk) }
  walk(root)
  return matches
}
const jsx = node => ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)
const tag = node => ts.isJsxElement(node) ? node.openingElement.tagName.getText(tree) : node.tagName.getText(tree)
const builder = find(tree, node => ts.isJsxElement(node) && attr(node, 'id') && node.openingElement.attributes.properties.some(a => a.name?.text === 'id' && a.initializer?.text === 'sample-builder-section'))[0]

let server, Heading, Field
test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  Heading = (await server.ssrLoadModule('/src/PokemonCardOverview.tsx')).PokemonCardHeading
  Field = (await server.ssrLoadModule('/src/PokemonSearchField.tsx')).default
})
test.after(async () => { await server?.close() })

test('Builder calls the real shared heading with its sole existing searchable name', () => {
  assert.ok(builder)
  const card = find(builder, node => ts.isJsxElement(node) && node.openingElement.attributes.properties.some(a => a.name?.text === 'id' && a.initializer?.text === 'sample-builder-card'))[0]
  const heading = find(card, node => jsx(node) && tag(node) === 'PokemonCardHeading')
  assert.equal(heading.length, 1)
  const search = find(card, node => jsx(node) && tag(node) === 'PokemonSearchField')
  assert.equal(search.length, 1)
  const call = heading[0].getText(tree)
  assert.match(call, /sprite=\{sampleRow\.sprite\}/)
  assert.match(call, /types=\{sampleRow\.types\}/)
  assert.match(call, /spriteAlt=\{displayName\(sampleRow, siteLanguage\)\}/)
  assert.match(call, /name=\{[\s\S]*<PokemonSearchField/)
  assert.match(search[0].getText(tree), /id="sample-species-0"[\s\S]*value=\{sampleSearch\}[\s\S]*onChange=\{setSampleSearch\}[\s\S]*onSelect=\{key => selectSpecies\('sample', 0, key\)\}/)
  assert.equal(find(card, node => jsx(node) && tag(node) === 'TypeBadgeImage').length, 0)
  assert.equal(find(card, node => jsx(node) && tag(node) === 'img').length, 0)
  const html = renderToStaticMarkup(React.createElement(Heading, { name: React.createElement(Field, { id: 'sample-species-0', value: 'Pikachu', onChange(){}, onSelect(){}, options: [] }), sprite: '/pikachu.png', spriteAlt: 'Pikachu', types: ['electric'] }))
  assert.match(html, /class="entry-card-top"/)
  assert.equal((html.match(/id="sample-species-0"/g) ?? []).length, 1)
  assert.equal((html.match(/class="entry-sprite"/g) ?? []).length, 1)
  assert.equal((html.match(/class="type-line"/g) ?? []).length, 1)
})

test('Builder heading and relocated actions have scoped, narrow-safe surfaces', () => {
  assert.match(css, /#sample-builder-card > \.entry-card-top\s*\{/)
  assert.match(css, /#sample-builder-card \.entry-card-top > \.entry-sprite\s*\{[^}]*width:\s*84px/)
  assert.match(css, /#sample-builder-card \.party-card-title-block\s*\{[^}]*min-width:\s*0/)
  assert.match(css, /#sample-builder-card \.party-card-title-block \.sample-species-search\s*\{[^}]*width:\s*100%/)
  assert.match(css, /#sample-builder-section > \.sample-builder-action-card\s*\{[^}]*--sample-surface-border:[^;]+;[^}]*--sample-surface-bg:/)
})

test('the one unchanged save/apply block follows both editors before Speed, excluding library', () => {
  assert.ok(builder)
  const actions = find(tree, node => ts.isJsxElement(node) && classAttr(node, 'sample-builder-action-card'))
  assert.equal(actions.length, 1)
  const action = actions[0]
  assert.ok(action.pos > builder.pos && action.end < builder.end)
  assert.ok(action.pos > app.indexOf('id="sample-moves-card"'))
  assert.ok(action.end < app.indexOf('id="sample-speed-section"'))
  assert.ok(action.end < app.indexOf('id="sample-damage-section"'))
  const text = action.getText(tree)
  for (const pattern of [/value=\{sampleLabelDraft\}/, /onChange=\{\(e\) => setSampleLabelDraft\(e\.target\.value\)\}/, /onClick=\{saveCurrentSample\}/, /party\.map\(\(member, idx\)/, /onClick=\{\(\) => setSelectedMy\(idx\)\}/, /onClick=\{\(\) => applySampleToPartySlot\(selectedMy\)\}/, /sampleConfirmedMoves\.length/, /savedSamples\.length/]) assert.match(text, pattern)
  const libraryBranch = find(tree, node => ts.isConditionalExpression(node) && node.condition.getText(tree) === "sampleWorkbenchTab === 'library'" && node.whenFalse.pos < builder.pos && node.whenFalse.end > builder.end)
  assert.ok(libraryBranch.length > 0, 'Builder and actions must live only in the non-library branch')
  assert.ok(app.indexOf('id="sample-saved-card"') > builder.end)
  assert.match(app, /onClick=\{\(\) => confirmPartySlotReplacement\(entry\.member, selectedMy, entry\.lockedMoves\)\}/)
  assert.match(app, /onClick=\{\(\) => \{\s*setSampleForge\(/)
  assert.match(app, /onClick=\{\(\) => setSavedSamples\(\(prev\) => prev\.filter\(/)
  assert.match(app, /const confirmPartySlotReplacement =[^]*?if \(!window\.confirm\([^]*?\)\) return\s+applyMemberToPartySlot\(member, slotIdx, lockedMoves\)/)
  assert.match(app, /const applySampleToPartySlot =[^]*?confirmPartySlotReplacement\(sampleForge, slotIdx, sampleLockedMoves\.filter\(Boolean\)\.slice\(0, 4\)\)/)
  assert.match(app, /const saveCurrentSample =[^]*?setSavedSamples\(\(prev\) => \[saved, \.\.\.prev\]\)[^]*?setSampleLabelDraft\(''\)/)
})
