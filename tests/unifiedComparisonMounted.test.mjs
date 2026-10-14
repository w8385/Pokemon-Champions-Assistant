import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url),'utf8')
test('single and quick mount the same comparison panel, with independent persistence', () => {
 assert.match(app, /function QuickDamagePanel\(\{ language, tooltipForMove, initialSides, comparisonMode/)
 assert.match(app, /mainSection === 'quickDamage' \? <QuickDamagePanel/)
 assert.match(app, /mainSection === 'single' && activeTab === 'party' \? <div className="unified-single-pair">[^]*?<QuickDamagePanel key=/)
 assert.match(app, /if \(!comparisonMode\) localStorage\.setItem\(QUICK_KEY/)
})
