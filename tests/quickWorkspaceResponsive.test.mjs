import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/matchupWorkspace.css', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8').split('function QuickDamagePanel(')[1].split('function LanguageIcon(')[0]

test('paired 390px cards retain two columns, but 320px cards stack for readable move editors', () => {
  assert.match(css, /@media\s*\(max-width:\s*600px\)[^]*?\.quick-damage \.quick-sides\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(css, /@media\s*\(max-width:\s*360px\)[^]*?\.quick-damage \.quick-sides\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
  assert.match(css, /@media\s*\(min-width:\s*361px\) and \(max-width:\s*600px\)[^]*?\.quick-damage \.quick-side-card \.stat-preview-list\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(css, /\.quick-damage \.quick-side-card \.stat-preview-topline\s*\{[^}]*flex-direction:\s*column/)
  assert.match(css, /\.quick-damage \.quick-side-card \.stat-preview-row\s*\{[^}]*padding:/)
  for (const selector of ['.quick-build-fields', '.stat-preview-list', '.quick-registered-moves']) {
    assert.match(css, new RegExp(`\\.quick-damage \\.quick-side-card \\${selector}\\s*\\{[^}]*grid-template-columns:\\s*minmax\\(0,\\s*1fr\\)`))
  }
  assert.match(css, /\.quick-damage \.quick-side-card \.registered-move-slot \.pokemon-search-field \.move-autocomplete-menu/)
  assert.match(panel, /<RegisteredMoveSlot[^]*?<button type="button" className=\{`quick-move-preview/)
  assert.match(panel, /Array\.from\(\{ length: 4 \}, \(_, index\) => \{/)
  assert.match(panel, /<EffortTuningModal/)
})

test('both modes retain independent state owners and condition controls after layout change', () => {
  assert.match(panel, /if \(!comparisonMode\) localStorage\.setItem\(QUICK_KEY/)
  assert.match(panel, /if \(!comparisonMode \|\| !initialSides \|\| !comparisonSlots\) return/)
  assert.match(panel, /\{entrySelectors\?\.\(speciesSearch\('defender'/)
  assert.match(panel, /\{comparisonMode \? null : speciesSearch\(side/)
  assert.match(panel, /\{sideBattleControls\('attacker'\)\}\{sideBattleControls\('defender'\)\}/)
  assert.match(panel, /result\.damage\.rolls\.join\(', '\)/)
})

test('speed scenario editors live once per owner adjacent to the shared results, without redundant chips', () => {
  const card = panel.split('const sideCard =')[1].split('const statCard =')[0]
  const speed = panel.split('const speedCard =')[1].split('const sideCard =')[0]
  const results = panel.split('className="quick-comparison-results"')[1].split('className="quick-conditions"')[0]
  assert.doesNotMatch(card, /speedCard\(/)
  assert.doesNotMatch(speed, /quick-speed-chips/)
  assert.match(speed, /quick-speed-assumptions/)
  assert.match(speed, /스피드 종족값/)
  assert.match(speed, /전제 조건 미충족/)
  assert.match(results, /speedCard\('attacker', attacker, attackingRow\)[\s\S]*speedCard\('defender', defender, defendingRow\)[\s\S]*\{speedStrip\}[\s\S]*quick-result\$\{selectedVerdict/)
  assert.match(panel, /<PokemonStatGrid showEffort/)
  assert.match(panel, /<RegisteredMoveSlot/)
})