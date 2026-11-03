import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url),'utf8')
const single = readFileSync(new URL('../src/features/single/SingleEntryComparison.tsx', import.meta.url), 'utf8')
test('single and quick mount the same comparison panel, with independent persistence', () => {
 assert.match(readFileSync(new URL('../src/features/damage/QuickDamagePanel.tsx', import.meta.url),'utf8'), /initialSides\?:[^\n]*comparisonMode\?:/)
 assert.match(app, /mainSection === 'quickDamage' \? <QuickDamagePanel/)
 assert.match(app, /mainSection === 'single' \? <SingleEntryComparison/)
 assert.match(single, /className="unified-single-pair"[^]*?<QuickDamagePanel language=/)
 assert.match(single, /comparisonSlots=\{\[selectedMy, selectedOpp\]\}/)
 assert.doesNotMatch(app, /<QuickDamagePanel key=\{/)
 assert.match(readFileSync(new URL('../src/features/damage/useQuickDamageState.ts', import.meta.url),'utf8'), /previousSeeds\.current\[index\] === fingerprint/)
 assert.match(readFileSync(new URL('../src/features/damage/useQuickDamageState.ts', import.meta.url),'utf8'), /if \(!comparisonMode\) writeQuickStandalone\(localStorage/)
})
