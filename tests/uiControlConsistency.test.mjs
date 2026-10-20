import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const css = postcss.parse(readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8'))
const declarations = selector => {
  const result = []
  css.walkRules(rule => {
    if (rule.selectors.includes(selector)) rule.walkDecls(decl => result.push([decl.prop, decl.value]))
  })
  return new Map(result)
}

// This is a cascade contract, not a claim about mounted geometry or touch interaction.
test('main navigation and header utilities use 44px targets on mobile and desktop', () => {
  assert.equal(declarations('.header-primary-tab').get('min-height'), '44px')
  assert.equal(declarations('.header-route-menu .header-primary-tab').get('min-height'), '44px')
  assert.equal(declarations('.icon-button').get('height'), '44px')
})

test('shared editing triggers keep a 44px clickable area even in compact Builder', () => {
  assert.equal(declarations('.party-meta-chip-button').get('min-height'), '44px')
  assert.equal(declarations('.party-meta-chip-editor').get('padding'), '0')
  assert.equal(declarations('.sample-meta-grid .party-meta-chip-button').get('min-height'), undefined)
  assert.equal(declarations('.sample-meta-grid .party-meta-chip').get('padding'), undefined)
})

test('primary actions reuse control height while compact rows and destructive hitboxes retain their own contract', () => {
  assert.equal(declarations('.action-button').get('min-height'), '44px')
  assert.equal(declarations('.action-button.danger').get('color'), '#fecaca')
  assert.equal(declarations('.speed-line-species .speed-line-name-action').get('min-height'), '44px')
  assert.equal(declarations('.entry-card-clear-button').get('min-height'), '44px')
})

test('Builder speed and damage search inputs retain the 40px control floor', () => {
  assert.equal(declarations('.sample-lab-section :is(#sample-speed-add, #sample-damage-add)').get('min-height'), 'var(--control-height)')
  assert.equal(declarations('.pokemon-search-field input').get('min-height'), 'var(--control-height)')
})

test('Builder numeric and select controls use the 40px floor without enlarging ranges or checkboxes', () => {
  for (const selector of [
    '.sample-speed-slider-field input:not([type="range"])',
    '.sample-speed-slider-field select',
    '.sample-damage-target-controls input[type="number"]',
    '.sample-damage-target-controls select',
    '.sample-speed-rank-row select',
  ]) assert.equal(declarations(selector).get('min-height'), 'var(--control-height)', selector)
  assert.equal(declarations('.sample-damage-target-controls label > input[type="checkbox"]').get('height'), '18px')
  assert.equal(declarations('.effort-gauge-range').get('min-height'), undefined)
  assert.equal(declarations('.party-meta-popover input').get('min-height'), '46px')
})

test('shared text inputs use 40px while the metadata popover retains 46px and focus/disabled rules', () => {
  assert.equal(declarations(':root').get('--control-height'), '40px')
  assert.equal(declarations('.sample-registered-move-slot .pokemon-search-field input').get('min-height'), 'var(--control-height)')
  assert.equal(declarations('.pokemon-search-field input').get('min-height'), 'var(--control-height)')
  assert.equal(declarations('.sample-label-input').get('min-height'), 'var(--control-height)')
  assert.equal(declarations('.party-meta-popover input').get('min-height'), '46px')
  assert.ok(css.nodes.some(rule => rule.type === 'rule' && rule.selector.startsWith(':where(input:not([type="checkbox"])') && rule.nodes.some(decl => decl.prop === 'min-height' && decl.value === 'var(--control-height)')))
  assert.ok(css.nodes.some(rule => rule.type === 'rule' && rule.selector.includes(':focus-visible') && rule.nodes.some(decl => decl.prop === 'outline' && decl.value === '2px solid var(--focus-ring)')))
  assert.ok(css.nodes.some(rule => rule.type === 'rule' && rule.selector.includes(':disabled') && rule.nodes.some(decl => decl.prop === 'opacity' && decl.value === '.55')))
})
