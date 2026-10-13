import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const screen = app.slice(app.indexOf('function QuickDamagePanel('), app.indexOf('function LanguageIcon('))

test('standalone damage reuses real picker and engine without changing party entries', () => {
  assert.match(screen, /<PokemonSearchField id=\{`quick-\$\{side\}`\}/)
  assert.match(screen, /calcDamage\(attackStats, defenseStats/)
  assert.match(screen, /localStorage\.setItem\(QUICK_KEY/)
  assert.doesNotMatch(screen, /setParty\(|setOpponents\(|updatePartyMember\(/)
})

test('both swapped cards keep every damage-relevant stat visible and repairable', () => {
  assert.match(screen, /const shownStats.*\['hp', 'attack', 'defense', 'spAttack', 'spDefense'\]/)
  assert.match(screen, /entry\.actual\[key\]/)
  assert.match(screen, /delete actual\[key\]/)
})

test('multihit summed rolls cannot be presented as exact KO probability', () => {
  assert.match(screen, /\(moveMeta\?\.hits \?\? 1\) > 1 \? <p>\{lt\('연속기는 기절 확률 계산 제외'\)\}/)
  for (const label of ['KO probability is not calculated for multihit moves', '連続技のひんし確率は計算対象外']) assert.ok(app.includes(label))
})
