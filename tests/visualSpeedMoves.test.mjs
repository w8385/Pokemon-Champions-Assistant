import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compareSpeedVisual } from '../src/domain/battle/speedVisual.ts'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const panel = readFileSync(new URL('../src/features/damage/QuickSideCard.tsx', import.meta.url), 'utf8')
const quickView = readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx', import.meta.url), 'utf8')
const quickState = readFileSync(new URL('../src/features/damage/useQuickDamageState.ts', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

test('paired bars share a zero-based maximum and signed delta', () => {
  assert.deepEqual(compareSpeedVisual(139, 138), { valid: true, maximum: 139, delta: 1, ownFraction: 1, opponentFraction: 138 / 139 })
  assert.deepEqual(compareSpeedVisual(139, 207), { valid: true, maximum: 207, delta: -68, ownFraction: 139 / 207, opponentFraction: 1 })
})
test('ties are equal-length and invalid speeds have neither bars nor verdict', () => {
  assert.deepEqual(compareSpeedVisual(139, 139), { valid: true, maximum: 139, delta: 0, ownFraction: 1, opponentFraction: 1 })
  for (const value of [null, undefined, NaN]) {
    assert.deepEqual(compareSpeedVisual(value, 139), { valid: false, maximum: null, delta: null, ownFraction: null, opponentFraction: null })
  }
})
test('shared panel renders numeric lanes from existing speed results with accessible labels', () => {
  assert.match(quickState, /compareSpeedVisual\(mySpeedResult\?\.value, oppSpeedResult\?\.value\)/)
  assert.match(quickView, /className="quick-speed-track"/)
  assert.match(quickView, /role="img"[^>]*aria-label=/)
  assert.match(quickView, /speedVisual\.valid/)
})
test('each shared speed lane can edit its own Speed stage', () => {
  assert.match(quickView, /<select value=\{entry\.speedStage\} onChange=\{event => setSide\(side, prev => \(\{ \.\.\.prev, speedStage: Number\(event\.target\.value\) \}\)\)\}/)
})
test('four shared registered slots use a 2x2 grid and vertical preview without left-border shift', () => {
  assert.match(panel, /<MoveSlotsEditor label=\{lt\('기술 배치'\)\}/)
  assert.match(panel, /slots=\{Array\.from\(\{ length: 4 \}, \(_, index\) => \{/)
  assert.match(css, /\.move-slots-editor-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(css, /\.move-slots-editor-cell\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
  assert.doesNotMatch(css, /\.quick-move-row\.selected\s*\{[^}]*border-inline-start/)
})
