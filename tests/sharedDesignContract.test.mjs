import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const partyStart = source.indexOf('const partySpeciesOptions = filterSpeciesOptions(')
const party = source.slice(partyStart, source.indexOf('{row ? <><PokemonBuildFields', partyStart))
const builderStart = source.indexOf('id="sample-builder-section"')
const builder = source.slice(builderStart, source.indexOf('<PokemonBuildFields key={`sample-', builderStart))
const modalStart = source.indexOf("{sampleTuningModalOpen && mainSection === 'sample'")
const modal = source.slice(modalStart, source.indexOf('<main className="grid">', modalStart))

test('Party and Builder mount the input-owning shared species picker and keep their select callbacks', () => {
  assert.match(party, /<PokemonSearchField\s+id=\{`party-species-\$\{idx\}`\}/)
  assert.match(party, /onSelect=\{key => selectSpecies\('party', idx, key\)\}/)
  assert.match(builder, /<PokemonSearchField\s+id="sample-species-0"/)
  assert.match(builder, /onSelect=\{key => selectSpecies\('sample', 0, key\)\}/)
  assert.doesNotMatch(party, /<input\b|<div className="autocomplete-menu/)
  assert.doesNotMatch(builder, /<input\b|<div className="autocomplete-menu/)
})

test('Research Lab mounts real effort modal in its editing screen on matching species', () => {
  assert.match(modal, /<EffortTuningModal/)
  assert.match(modal, /mainSection === 'sample' && sampleWorkbenchTab !== 'library'/)
  assert.match(modal, /sampleTuningIdentity === sampleForge\.key/)
  assert.match(modal, /onEffort=\{\(key, value\) => setSampleForge/)
  assert.match(modal, /applyChampionsEffort/)
  assert.match(modal, /opener=\{sampleTuningOpener\.current\}/)
  assert.match(modal, /magicCandidate=\{sampleMagicCandidate\}/)
  assert.doesNotMatch(modal, /<div className="modal-backdrop"/)
  assert.match(source, /setSampleTuningModalOpen\(false\)/)
})

test('selected preset owns a live editable name; copy/overwrite controls are absent', () => {
  const preset = source.slice(source.indexOf('<div className="party-preset-controls">'), source.indexOf('party-preset-grid', source.indexOf('<div className="party-preset-controls">')))
  assert.match(preset, /createNewParty/)
  assert.doesNotMatch(preset, /overwriteActivePartyPreset|saveNewPartyPreset/)
})

test('Common semantic tokens are consumed by actual navigation, actions, search and panels', () => {
  for (const token of ['--border', '--focus-ring', '--control-bg', '--control-hover', '--control-height', '--space-panel', '--radius-panel']) assert.match(css, new RegExp(`${token}:`))
  for (const selector of ['.header-primary-tab', '.action-button', '.pick-chip', '.panel', '.pokemon-search-field input']) assert.match(css, new RegExp(selector.replaceAll('.', '\\.') + '[^{}]*\\{[^}]*var\\(--'))
  assert.match(css, /:focus-visible/)
  assert.match(css, /:disabled/)
})

test('quick calculation and Sample do not render a redundant workflow shell or sample tabs', () => {
  const shell = source.slice(source.indexOf("{mainSection === 'double' ? <section className=\"panel wide workflow-shell-panel\">"), source.indexOf("{mainSection === 'speedLine' ? <SpeedLinePanel"))
  assert.match(shell, /mainSection === 'double'/)
  assert.doesNotMatch(shell, /mainSection === 'sample'|sample-workbench-tab-/)
})

let server, Field, Modal
test.before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
  Field = (await server.ssrLoadModule('/src/PokemonSearchField.tsx')).default
  Modal = (await server.ssrLoadModule('/src/EffortTuningModal.tsx')).EffortTuningModal
})
test.after(async () => { await server?.close() })
test('reused widgets retain combobox semantics and a dialog with nature, effort budget and gauge', () => {
  const picker = renderToStaticMarkup(React.createElement(Field, { id: 'party-species-0', value: 'Gar', onChange(){}, onSelect(){}, options: [{ key: 'garchomp', label: 'Garchomp' }] }))
  assert.match(picker, /role="combobox"/)
  assert.match(picker, /aria-controls="party-species-0-options"/)
  const modal = renderToStaticMarkup(React.createElement(Modal, { evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }, nature: 'hardy', natureOptions: [{id:'hardy',label:'Hardy'}], actualValue: () => 100, onEffort(){}, onNature(){}, onClose(){}, translate: text => text, statTheme: () => '' }))
  assert.match(modal, /role="dialog" aria-modal="true"/)
  assert.match(modal, /0\/66/)
  assert.match(modal, /role="slider"/)
})
