import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/features/single/matchupWorkspace.css', import.meta.url), 'utf8')
const cardOwner = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const speedOwner = readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx', import.meta.url), 'utf8')
const conditionsOwner = readFileSync(new URL('../src/features/damage/QuickConditions.tsx', import.meta.url), 'utf8')
const modalOwner = readFileSync(new URL('../src/features/damage/QuickEffortModal.tsx', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const hook = readFileSync(new URL('../src/features/damage/useQuickDamageState.ts', import.meta.url), 'utf8')
const result = readFileSync(new URL('../src/features/damage/QuickDamageResult.tsx', import.meta.url), 'utf8')
const storage = readFileSync(new URL('../src/adapters/persistence/quickDamage.ts', import.meta.url), 'utf8')

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
  assert.match(cardOwner, /<MoveSlotsEditor[^]*?preview: <button type="button" className=\{`quick-move-preview/)
  assert.match(cardOwner, /Array\.from\(\{ length: 4 \}, \(_, index\) => \{/)
  assert.match(modalOwner, /<EffortTuningModal/)
})

test('both modes retain independent state owners and condition controls after layout change', () => {
  assert.match(hook, /if \(!comparisonMode\) writeQuickStandalone\(localStorage/)
  assert.match(hook, /if \(!comparisonMode \|\| !initialSides \|\| !comparisonSlots\) return/)
  assert.match(panel, /\{entrySelectors\?\.\(speciesSearch\('defender'/)
  assert.match(cardOwner, /\{comparisonMode \? null : searchField/)
  assert.match(conditionsOwner, /\{sideBattleControls\('attacker'\)\}\{sideBattleControls\('defender'\)\}/)
  assert.doesNotMatch(panel, /result\.damage\.rolls\.join\(', '\)/)
  assert.match(result, /result\.damage\.rolls\.filter\(roll => roll >= result\.targetHp\)/)
})

test('speed scenario editors live once per owner adjacent to the shared results, without redundant chips', () => {
  const card = cardOwner.slice(cardOwner.indexOf('const sideCard ='), cardOwner.indexOf('const statCard ='))
  const speed = speedOwner.slice(speedOwner.indexOf('const speedCard ='), speedOwner.indexOf('const speedStrip ='))
  const results = panel.split('className="quick-comparison-results"')[1].split('className="quick-conditions"')[0]
  assert.doesNotMatch(card, /speedCard\(/)
  assert.doesNotMatch(speed, /quick-speed-chips/)
  assert.match(speed, /quick-speed-assumptions/)
  assert.match(speed, /스피드 종족값/)
  assert.match(speed, /전제 조건 미충족/)
  assert.match(speedOwner, /speedCard\('attacker', attacker, attackingRow\)[\s\S]*speedCard\('defender', defender, defendingRow\)[\s\S]*\{speedStrip\}/)
  assert.match(results, /<QuickSpeedPresentation[^]*?<QuickDamageResult/)
  assert.match(cardOwner, /<PokemonStatGrid showEffort/)
  assert.match(cardOwner, /<MoveSlotsEditor/)
})