import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BATTLE_STAT_STAGE_OPTIONS, battleStatStageLabel } from '../src/domain/battle/statStages.ts'

const quickSpeed = readFileSync(new URL('../src/features/damage/QuickSpeedPresentation.tsx', import.meta.url), 'utf8')
const quickConditions = readFileSync(new URL('../src/features/damage/QuickConditions.tsx', import.meta.url), 'utf8')
const speedLine = readFileSync(new URL('../src/features/speedline/SpeedLinePanel.tsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const opponentInputPolicy = readFileSync(new URL('../src/shared/input/opponentInputPolicy.ts', import.meta.url), 'utf8')

test('full battle ranks put boosts above neutral and drops below it', () => {
  assert.deepEqual([...BATTLE_STAT_STAGE_OPTIONS], [6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6])
  const zero = BATTLE_STAT_STAGE_OPTIONS.indexOf(0)
  assert.equal(BATTLE_STAT_STAGE_OPTIONS[zero - 1], 1)
  assert.equal(BATTLE_STAT_STAGE_OPTIONS[zero + 1], -1)
  assert.equal(battleStatStageLabel(1), '+1')
  assert.equal(battleStatStageLabel(0), '0')
  assert.equal(battleStatStageLabel(-1), '-1')
})

test('every full-rank selector consumes the shared ordered authority', () => {
  for (const source of [quickSpeed, quickConditions, speedLine, app]) {
    assert.match(source, /BATTLE_STAT_STAGE_OPTIONS/)
  }
  for (const source of [quickSpeed, quickConditions, speedLine]) {
    assert.doesNotMatch(source, /Array\.from\(\{ length: 13 \}/)
  }
  assert.doesNotMatch(app, /\[6,\s*5,\s*4,\s*3,\s*2,\s*1,\s*0,\s*-1,\s*-2,\s*-3,\s*-4,\s*-5,\s*-6\]/)
  assert.match(app, /SPEED_STAGE_OPTIONS\.map\(\(stage\) => <option key=\{`sample-speed-self-stage-/)
  assert.match(app, /SPEED_STAGE_OPTIONS\.map\(\(stage\) => <option key=\{`sample-speed-stage-/)
  assert.match(opponentInputPolicy, /BATTLE_STAT_STAGE_OPTIONS\.filter/)
  assert.doesNotMatch(opponentInputPolicy, /\[-2,\s*-1,\s*0,\s*1,\s*2\]/)
})
