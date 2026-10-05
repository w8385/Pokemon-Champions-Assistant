import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
test('party ability marker combines Scarf and active ability once from stage-adjusted Speed', () => {
  const marker = app.slice(app.indexOf('function mySpeedAbilityMarker('), app.indexOf('function speedAbilityCandidate('))
  assert.match(marker, /applySpeedModifiers\(applySpeedStage\(baseSpeed, totalStage\),\s*\{ scarf: isChoiceScarfItem\(member\.item\), abilityMultiplier:/)
  assert.doesNotMatch(marker, /Math\.floor\(speed \* 1\.5\)|Math\.floor\(speed \* effect\.value\)/)
  assert.match(marker, /ability\.slug === 'unburden' && isChoiceScarfItem\(member\.item\)/)
})
