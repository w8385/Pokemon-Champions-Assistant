import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const start = source.indexOf('const UI_TRANSLATIONS')
const end = source.indexOf('\nfunction titleCaseSlug', start)
assert.ok(start >= 0 && end > start)
const code = ts.transpileModule(source.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
const context = vm.createContext({})
vm.runInContext(`${code}\nthis.translate = translateText`, context)

test('new comparison disclosures use the actual English and Japanese dictionary', () => {
  assert.equal(context.translate('en', '선택 기술 상세'), 'Selected move details')
  assert.equal(context.translate('ja', '선택 기술 상세'), '選択した技の詳細')
  assert.equal(context.translate('en', '속도 가정 조정'), 'Adjust Speed assumptions')
  assert.equal(context.translate('ja', '속도 가정 조정'), '素早さの計算条件')
})
