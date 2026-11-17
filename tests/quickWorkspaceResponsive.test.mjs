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
const storage = readFileSync(new URL('../src/adapters/persistence/quickDamage.ts', import.meta.url), 'utf8')

test('paired cards and merged Speed lanes stack before controls become cramped', () => {
  assert.match(sharedCss, /@media \(max-width: 760px\)[^]*?\.quick-speed-lanes\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)[^]*?\.quick-sides\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(sharedCss, /@media \(max-width: 390px\)[^]*?\.quick-compact-stat-editor \.stat-preview-list\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  assert.match(sharedCss, /\.move-slots-editor\s*\{[^}]*container:\s*move-editor\s*\/\s*inline-size/)
  assert.match(sharedCss, /\.move-slots-editor-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(sharedCss, /@container move-editor \(min-width: 480px\)[^]*?\.move-slots-editor-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
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
  assert.match(sharedCss, /\.move-slots-editor-slot > input,\s*\.move-slots-editor-slot > \.pokemon-search-field input\s*\{[^}]*height:\s*40px[^}]*min-height:\s*40px/)
  assert.doesNotMatch(sharedCss, /\.move-slots-editor-slot\s+:is\(input/)
  assert.match(sharedCss, /\.quick-move-condition-check input\[type="checkbox"\]\s*\{[^}]*width:\s*16px[^}]*min-width:\s*16px[^}]*height:\s*16px[^}]*min-height:\s*16px/)
})

test('populated desktop cards share identity, stat, and move rows without affecting empty or mobile cards', () => {
  const populatedPair = String.raw`\.quick-sides:has\(> \.quick-side-card\[data-side='attacker'\]\[data-has-entry='true'\]\):has\(> \.quick-side-card\[data-side='defender'\]\[data-has-entry='true'\]\)`
  assert.match(sharedCss, new RegExp(String.raw`@supports \(grid-template-rows: subgrid\)[^]*?@media \(min-width: 761px\)[^]*?${populatedPair}\s*\{[^}]*grid-template-rows:\s*repeat\(3, auto\)[^}]*row-gap:\s*var\(--quick-card-gap\)`))
  assert.match(sharedCss, new RegExp(String.raw`${populatedPair} > \.quick-side-card\[data-has-entry='true'\]\s*\{[^}]*grid-row:\s*span 3[^}]*grid-template-rows:\s*subgrid`))
  assert.match(sharedCss, /\.quick-side-card\[data-has-entry='false'\]\s*\{[^}]*align-self:\s*start/)
  assert.doesNotMatch(sharedCss, /\.quick-side-card\[data-has-entry='false'\][^{]*\{[^}]*grid-template-rows:\s*subgrid/)
})

test('both modes retain independent state owners and condition controls after layout change', () => {
  assert.match(hook, /if \(comparisonMode \|\| standaloneWriteBlocked\.current\) return[\s\S]*writeQuickStandalone\(\(\) => window\.localStorage/)
  assert.match(hook, /if \(!comparisonMode \|\| !initialSides \|\| !comparisonSlots\) return/)
  assert.match(panel, /\{entrySelectors\?\.\(speciesSearch\('defender'/)
  assert.match(cardOwner, /\{comparisonMode \? null : searchField/)
  assert.match(conditionsOwner, /\{sideBattleControls\('attacker'\)\}\{sideBattleControls\('defender'\)\}/)
  assert.doesNotMatch(panel, /QuickDamageResult|quick-result|quick-comparison-results/)
  assert.match(cardOwner, /quick-move-preview[^]*?<DamageRangeMeter[^>]*damage=\{preview\.damage\}/)
})

test('one merged Speed comparison owns both lanes without base stat or scarf editors', () => {
  const card = cardOwner.slice(cardOwner.indexOf('const sideCard ='), cardOwner.indexOf('const statCard ='))
  const results = panel.slice(panel.indexOf('<QuickSpeedPresentation'), panel.indexOf('className="quick-sides"'))
  assert.doesNotMatch(card, /speedCard\(/)
  assert.match(speedOwner, /className="quick-speed-comparison-card"/)
  assert.match(speedOwner, /className="quick-speed-lanes"[^]*?speedLane\('attacker', attacker, attackingRow\)[^]*?speedLane\('defender', defender, defendingRow\)/)
  assert.match(speedOwner, /className=\{`quick-speed-lane quick-speed-lane-\$\{side\}`\}/)
  assert.doesNotMatch(speedOwner, /quick-speed-chips|quick-speed-assumptions|quick-speed-base-badge|스피드 종족값|speedScarfOverride/)
  assert.match(speedOwner, /전제 조건 미충족/)
  assert.match(results, /<QuickSpeedPresentation/)
  assert.doesNotMatch(results, /QuickDamageResult/)
  assert.match(cardOwner, /<QuickStatEditor/)
  assert.match(cardOwner, /<MoveSlotsEditor/)
})
