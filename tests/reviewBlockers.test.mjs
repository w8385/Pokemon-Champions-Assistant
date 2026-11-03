import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const modal = readFileSync(new URL('../src/shared/display/EffortTuningModal.tsx', import.meta.url), 'utf8')
const view = readFileSync(new URL('../src/features/damage/QuickDamageView.tsx', import.meta.url), 'utf8')
const quick = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const quickCalc = readFileSync(new URL('../src/features/damage/calculateQuickDamage.ts', import.meta.url), 'utf8')
const quickHook = readFileSync(new URL('../src/features/damage/useQuickDamageState.ts', import.meta.url), 'utf8')
test('party tuning passes existing magic candidate and 11-multiple points to shared modal', () => {
  assert.match(app, /magicCandidate=\{magicCandidate\}/)
  assert.match(app, /magicPoints=\{key => magicEffortPoints\(tuningRow, tuningMember, key\)\}/)
  assert.match(modal, /className=\{\['effort-gauge-cell'[^]*points\.includes\(i \+ 1\) \? 'magic'/)
  assert.match(modal, /isMagicStat \? <span className="magic-inline"/)
  assert.match(modal, /targetEffort !== null \? <span className="magic-inline"/)
})
test('quick battle statuses and screens are attached to their Pokémon and follow swaps', () => {
  assert.match(quickCalc, /quickStagePair\(source\.battle, target\.battle/)
  assert.match(quickCalc, /attackStage, defenseStage, defenderTypes/)
  assert.match(quickCalc, /source\.battle\.lowHp/)
  assert.match(quickCalc, /target\.battle\.fullHp/)
  assert.match(quickCalc, /target\.battle\.reflect/)
  assert.match(view, /setAttacker\(defender\); setDefender\(attacker\)/)
  assert.doesNotMatch(quick, /burned: conditions\.burned/)
})
test('builder Enter chooses from the same ranked visible results', () => {
  assert.match(app, /const sampleSpeciesOptions = prioritizeExactSpecies\(searchPokemon\(rows, sampleSearch \?\? '', \{ includeMega: true \}\), sampleSearch \?\? ''\)\.slice\(0, 8\)/)
  assert.match(app, /<PokemonSearchField id="sample-species-0"[^]*?onSelect=\{key => selectSpecies\('sample', 0, key\)\}[^]*?options=\{sampleSpeciesOptions\.map/)
})
test('shared modal traps focus and restores connected opener; quick uses floating tooltip', () => {
  assert.match(modal, /event\.key !== 'Tab'/)
  assert.match(modal, /\.isConnected/)
  assert.match(modal, /\.focus\(\)/)
  assert.match(quick, /tooltipProps: tooltipForMove\(name\)/)
  assert.match(app, /tooltipForMove=\{name => bindTooltip\(name \? moveTooltipData\(name, siteLanguage\) : null\)\}/)
})
