import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'

const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
const rawCss = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')
const css = postcss.parse(rawCss)
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

const declarations = selector => {
  const result = new Map()
  css.walkRules(rule => {
    if (!rule.selectors.includes(selector)) return
    rule.walkDecls(decl => result.set(decl.prop, decl.value))
  })
  return result
}

test('the official local Pretendard variable subsets load before site styles', () => {
  const fontImport = "import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'"
  const siteImport = "import './styles.css'"

  assert.equal(packageJson.dependencies.pretendard, '1.3.9')
  assert.ok(main.indexOf(fontImport) >= 0)
  assert.ok(main.indexOf(fontImport) < main.indexOf(siteImport))
  assert.doesNotMatch(main, /https?:\/\/[^'\"]*pretendard/i)
  assert.doesNotMatch(rawCss, /@import\s+(?:url\()?['\"]?https?:\/\//i)
})

test('Pretendard leads the global stack with multilingual local fallbacks', () => {
  const rootFont = declarations(':root').get('font-family')

  assert.match(rootFont, /^'Pretendard Variable', Pretendard, system-ui/)
  for (const fallback of ["'Noto Sans KR'", "'Noto Sans JP'", "'Malgun Gothic'", "'Droid Sans Fallback Local'", 'sans-serif']) {
    assert.ok(rootFont.includes(fallback), fallback)
  }
  assert.equal(declarations('body').get('font-family'), 'inherit')
})

test('native form controls inherit the site typeface', () => {
  for (const selector of ['button', 'input', 'select', 'textarea', 'optgroup', 'option', '::file-selector-button']) {
    assert.equal(declarations(selector).get('font'), 'inherit', selector)
  }
})
