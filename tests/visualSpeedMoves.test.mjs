import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compareSpeedVisual } from '../src/speedVisual.ts'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
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
  assert.match(app, /compareSpeedVisual\(mySpeedResult\?\.value, oppSpeedResult\?\.value\)/)
  assert.match(app, /className="quick-speed-track"/)
  assert.match(app, /role="img"[^>]*aria-label=/)
  assert.match(app, /speedVisual\.valid/)
})
test('each shared speed lane can edit its own Speed stage', () => {
  const panel = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('function LanguageIcon('))
  assert.match(panel, /<select value=\{entry\.speedStage\} onChange=\{event => setSide\(side, prev => \(\{ \.\.\.prev, speedStage: Number\(event\.target\.value\) \}\)\)\}/)
})
test('four shared registered slots use a 2x2 grid and vertical preview without left-border shift', () => {
  assert.match(app, /className="registered-move-grid quick-registered-moves"/)
  assert.match(app, /<RegisteredMoveSlot number=\{index \+ 1\}/)
  assert.match(css, /\.quick-registered-moves\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(css, /\.quick-move-row\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
  assert.doesNotMatch(css, /\.quick-move-row\.selected\s*\{[^}]*border-inline-start/)
})
