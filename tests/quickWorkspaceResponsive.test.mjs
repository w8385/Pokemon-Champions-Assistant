import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/features/single/matchupWorkspace.css', import.meta.url), 'utf8')
const sharedCss = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const cardOwner = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const speedOwner = readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx', import.meta.url), 'utf8')
const conditionsOwner = readFileSync(new URL('../src/features/damage/QuickConditions.tsx', import.meta.url), 'utf8')
const statEditor = readFileSync(new URL('../src/features/damage/QuickStatEditor.tsx', import.meta.url), 'utf8')
const compactEditor = readFileSync(new URL('../src/shared/display/CompactStatEditor.tsx', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const hook = readFileSync(new URL('../src/features/damage/useQuickDamageState.ts', import.meta.url), 'utf8')
const result = readFileSync(new URL('../src/features/damage/QuickDamageResult.tsx', import.meta.url), 'utf8')
const storage = readFileSync(new URL('../src/adapters/persistence/quickDamage.ts', import.meta.url), 'utf8')

test('paired cards and merged Speed lanes stack before controls become cramped', () => {
  assert.match(sharedCss, /@media \(max-width: 760px\)[^]*?\.quick-speed-lanes\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^]*?\.quick-sides\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(sharedCss, /@media \(max-width: 390px\)[^]*?\.quick-compact-stat-editor \.stat-preview-list\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(sharedCss, /\.quick-side-card \.move-slots-editor-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(sharedCss, /@container \(min-width: 480px\)[^]*?\.quick-side-moves \.move-slots-editor-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(css, /\.single-workspace \.single-entry-toolbar/)
  assert.match(cardOwner, /<MoveSlotsEditor[^]*?preview: name \? <button type="button" className=\{`quick-move-preview[^]*?: null/)
  assert.match(cardOwner, /Array\.from\(\{ length: 4 \}, \(_, index\) => \{/)
  assert.match(statEditor, /<CompactStatEditor/)
  assert.match(statEditor, /identity=\{identity\}/)
  assert.match(panel, /const seedIdentity = seed \? JSON\.stringify/)
  assert.match(panel, /editorIdentity=\{editorIdentity\}/)
  assert.match(compactEditor, /<PokemonStatGrid stats=\{stats\} showEffort/)
  assert.match(compactEditor, /const presetIds:[^=]*= \['hb', 'hd', 'as', 'cs', 'max-speed', 'clear'\]/)
  assert.match(cardOwner, /showPresets=\{!comparisonMode \|\| side === 'defender'\}/)
})

test('both modes retain independent state owners and condition controls after layout change', () => {
  assert.match(hook, /if \(comparisonMode \|\| standaloneWriteBlocked\.current\) return[\s\S]*writeQuickStandalone\(\(\) => window\.localStorage/)
  assert.match(hook, /if \(!comparisonMode \|\| !initialSides \|\| !comparisonSlots\) return/)
  assert.match(panel, /\{entrySelectors\?\.\(speciesSearch\('defender'/)
  assert.match(cardOwner, /\{comparisonMode \? null : searchField/)
  assert.match(conditionsOwner, /\{sideBattleControls\('attacker'\)\}\{sideBattleControls\('defender'\)\}/)
  assert.doesNotMatch(panel, /result\.damage\.rolls\.join\(', '\)/)
  assert.match(result, /result\.damage\.rolls\.filter\(roll => roll >= result\.targetHp\)/)
})

test('one merged Speed comparison owns both lanes without base stat or scarf editors', () => {
  const card = cardOwner.slice(cardOwner.indexOf('const sideCard ='), cardOwner.indexOf('const statCard ='))
  const results = panel.split('className="quick-comparison-results"')[1].split('className="quick-conditions"')[0]
  assert.doesNotMatch(card, /speedCard\(/)
  assert.match(speedOwner, /className="quick-speed-comparison-card"/)
  assert.match(speedOwner, /className="quick-speed-lanes"[^]*?speedLane\('attacker', attacker, attackingRow\)[^]*?speedLane\('defender', defender, defendingRow\)/)
  assert.match(speedOwner, /className=\{`quick-speed-lane quick-speed-lane-\$\{side\}`\}/)
  assert.doesNotMatch(speedOwner, /quick-speed-chips|quick-speed-assumptions|quick-speed-base-badge|스피드 종족값|speedScarfOverride/)
  assert.match(speedOwner, /전제 조건 미충족/)
  assert.match(results, /<QuickSpeedPresentation[^]*?<QuickDamageResult/)
  assert.match(cardOwner, /<QuickStatEditor/)
  assert.match(cardOwner, /<MoveSlotsEditor/)
})
