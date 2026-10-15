import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const sheet = postcss.parse(readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8'))
const declarations = selector => {
  const result = {}
  sheet.walkRules(rule => {
    if (rule.selector.split(',').map(part => part.trim()).includes(selector)) {
      rule.walkDecls(decl => { result[decl.prop] = decl.value })
    }
  })
  return result
}
const tokens = declarations(':root')
const resolve = value => {
  assert.ok(value, 'missing authored color')
  let color = value
  for (let i = 0; i < 5 && color.startsWith('var('); i++) {
    const match = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/.exec(color)
    assert.ok(match, `unsupported CSS variable: ${color}`)
    color = tokens[match[1]] ?? match[2]
    assert.ok(color, `undefined ${match[1]}`)
  }
  assert.match(color, /^#[0-9a-f]{6}$/i, `expected opaque palette color, got ${color}`)
  return [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16))
}
const luminance = rgb => rgb.map(v => {
  const c = v / 255
  return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4
}).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
const ratio = (a, b) => {
  const [light, dark] = [luminance(resolve(a)), luminance(resolve(b))].sort((x, y) => y - x)
  return (light + .05) / (dark + .05)
}
const legible = (fg, bg, label) => assert.ok(ratio(fg, bg) >= 4.5, `${label}: ${ratio(fg, bg)}:1 (${fg} / ${bg})`)

test('entry picker uses a dark surface token and selected control keeps an outline', () => {
  const picker = declarations('.unified-pair-buttons button')
  legible(picker.color === 'inherit' ? tokens.color : picker.color, picker.background, 'entry label')
  assert.match(declarations('.unified-pair-buttons button[aria-pressed="true"]').outline, /solid/)
})

test('library detail back and provenance links have readable normal and visited states', () => {
  for (const selector of ['.creator-library-detail a', '.creator-library-detail a:visited']) {
    legible(declarations(selector).color, '#121923', `${selector} (back and provenance)`)
  }
  assert.ok(declarations('.creator-library-detail a:focus-visible').outline, 'keyboard focus indicator')
})

test('speed-line informative secondary text and badges meet normal-text contrast', () => {
  legible(declarations('.speed-line-species small').color, '#121923', 'species')
  legible(declarations('.speed-line-item-badge').color ?? declarations('.speed-line-species small').color, '#121923', 'item badge')
})

test('empty input and textarea placeholders including sample override are readable', () => {
  for (const selector of ['input::placeholder', 'textarea::placeholder', '.sample-label-input::placeholder']) {
    const color = declarations(selector).color
    for (const background of ['#0e1521', '#101d2c', '#0b1220']) legible(color, background, `${selector} on ${background}`)
    assert.equal(declarations(selector).opacity, '1', `${selector} opacity must not dilute the foreground`)
  }
})
