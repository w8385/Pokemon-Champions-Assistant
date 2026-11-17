import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { natureAxes, natureIdAfterAxisClick, natureIdForAxes } from '../src/domain/champions/natureProjection.ts'
import { NATURES } from '../src/domain/champions/natures.ts'

const compact = readFileSync(new URL('../src/shared/display/CompactStatEditor.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

test('nature axes resolve to the canonical persisted NatureId', () => {
  assert.deepEqual(natureAxes('bold'), { up: 'defense', down: 'attack' })
  assert.equal(natureIdForAxes('defense', 'attack'), 'bold')
  assert.equal(natureIdForAxes('speed', 'spAttack'), 'jolly')
  assert.equal(natureIdForAxes(null, null), 'hardy')
  assert.equal(natureIdForAxes('defense', 'defense'), null)
  assert.equal(natureIdForAxes('defense', null), null)
})

test('each nature arrow click applies the requested axis immediately', () => {
  assert.equal(natureIdAfterAxisClick('hardy', 'up', 'attack'), 'adamant')
  assert.equal(natureIdAfterAxisClick('hardy', 'up', 'speed'), 'jolly')
  assert.equal(natureIdAfterAxisClick('hardy', 'down', 'defense'), 'mild')
  assert.equal(natureIdAfterAxisClick('jolly', 'up', 'defense'), 'impish')
  assert.equal(natureIdAfterAxisClick('jolly', 'up', 'spAttack'), 'quiet')
  assert.equal(natureIdAfterAxisClick('jolly', 'down', 'speed'), 'quiet')
  assert.equal(natureIdAfterAxisClick('jolly', 'up', 'speed'), 'jolly')
  assert.equal(natureIdAfterAxisClick('jolly', 'down', 'spAttack'), 'jolly')
})

test('every direct nature arrow transition preserves the clicked intent', () => {
  const stats = ['attack', 'defense', 'spAttack', 'spDefense', 'speed']
  for (const nature of NATURES) for (const axis of ['up', 'down']) for (const stat of stats) {
    const next = natureIdAfterAxisClick(nature.id, axis, stat)
    const axes = natureAxes(next)
    assert.equal(axes[axis], stat, `${nature.id} ${axis} ${stat}`)
    assert.notEqual(axes.up, axes.down, `${nature.id} ${axis} ${stat}`)
  }
})

test('every stat tile keeps both direct nature arrows available without an expanded editor', () => {
  assert.match(compact, /const renderNatureControls = \(stat: StatKey, name: string\)/)
  assert.match(compact, /renderNatureControls\(stat\.key as StatKey, name\)/)
  assert.ok(compact.indexOf('className="nature-up"') < compact.indexOf('className="nature-down"'), 'boosting nature precedes lowering nature in visual and reading order')
  assert.match(compact, /className="nature-down"/)
  assert.match(compact, /className="nature-down"[^>]*aria-label=\{`\$\{name\} · \$\{text\.lowerNature\}`\}/)
  assert.match(compact, /<span aria-hidden="true">↓<\/span>/)
  assert.match(compact, /className="nature-up"/)
  assert.match(compact, /className="nature-up"[^>]*aria-label=\{`\$\{name\} · \$\{text\.raiseNature\}`\}/)
  assert.match(compact, /<span aria-hidden="true">↑<\/span>/)
  assert.doesNotMatch(compact, />↓ \.9<\/button>|>↑ 1\.1<\/button>/)
  assert.doesNotMatch(compact, /nature-impossible|>—<\/span>/)
  assert.match(compact, /natureIdAfterAxisClick\(nature, axis, stat\)/)
  assert.match(compact, /aria-pressed=\{actualDown\}/)
  assert.match(compact, /aria-pressed=\{actualUp\}/)
  assert.doesNotMatch(compact, /pendingNature|setPendingNature|data-pending/)
  assert.doesNotMatch(compact, /nature-neutral|quick-compact-tile-partner|quick-compact-preview-open|tuneContent|EffortNumberInput/)
})

test('compact tile renders only actual stat, nature arrows, slider, and current effort number', () => {
  assert.match(compact, /className="quick-compact-tile-value"/)
  assert.match(compact, /className="quick-compact-effort-row"/)
  assert.match(compact, /className="quick-compact-effort-value"/)
  assert.doesNotMatch(compact, /quick-compact-tile-base|quick-compact-preview-footer|UiIcon name="chevron"|aria-controls=/)
})

test('compact effort slider distinguishes the 32 cap from quiet magic ticks without a nearest target', () => {
  const effortSlider = compact.slice(compact.indexOf('function EffortSlider'), compact.indexOf('export function CompactStatEditor'))
  const effortDescription = compact.slice(compact.indexOf('const effortDescription'), compact.indexOf('const renderPreview'))
  const effortOutput = compact.slice(compact.indexOf('className="quick-compact-effort-value"'), compact.indexOf('</output>', compact.indexOf('className="quick-compact-effort-value"')))

  assert.match(effortSlider, /magicScale\?\.points\.map\(point => <i/)
  assert.match(effortSlider, /magic-reached/)
  assert.doesNotMatch(effortSlider, /quick-compact-effort-guide|recommendation\.direction|target === point\.effort|\bmagic-(?:up|down)\b/)
  assert.doesNotMatch(effortDescription, /kind === 'apply'|targetUp|targetDown|blocked/)
  assert.match(effortOutput, /\{effort\}/)
  assert.match(effortOutput, /\{CHAMPIONS_EFFORT_PER_STAT_CAP\}/)

  assert.doesNotMatch(css, /\.quick-compact-effort-guide|\.quick-compact-effort-scale i\.target/)
  const tickRule = css.match(/\.quick-compact-effort-scale i\s*\{([^}]*)\}/)?.[1] ?? ''
  const rangeRule = css.match(/\.quick-compact-effort-bounds > input\[type='range'\]\s*\{([^}]*)\}/)?.[1] ?? ''
  assert.match(tickRule, /width:\s*2px/)
  assert.doesNotMatch(tickRule, /rotate\(/)
  assert.match(rangeRule, /width:\s*calc\(100% \+ var\(--effort-thumb-size\)\)/)
})
