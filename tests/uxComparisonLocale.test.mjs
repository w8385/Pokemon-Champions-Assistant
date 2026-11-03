import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const dictionary = ast.statements.find(node => ts.isVariableStatement(node) && node.declarationList.declarations.some(declaration => declaration.name.getText(ast) === 'UI_TRANSLATIONS'))
const translator = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'translateText')
assert.ok(dictionary && translator, 'App retains its actual UI dictionary and translator')
const code = ts.transpileModule(`${dictionary.getText(ast)}\n${translator.getText(ast)}`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
const context = vm.createContext({})
vm.runInContext(`${code}\nthis.translate = translateText`, context)

test('new comparison disclosures use the actual English and Japanese dictionary', () => {
  assert.equal(context.translate('en', '선택 기술 상세'), 'Selected move details')
  assert.equal(context.translate('ja', '선택 기술 상세'), '選択した技の詳細')
  assert.equal(context.translate('en', '속도 가정 조정'), 'Adjust Speed assumptions')
  assert.equal(context.translate('ja', '속도 가정 조정'), '素早さの計算条件')
  for (const text of ['내 속도 조정', '상대 속도 조정', '속도 보정 기준', '양쪽 상태·랭크·장막 없음']) {
    assert.notEqual(context.translate('en', text), text)
    assert.notEqual(context.translate('ja', text), text)
  }
})
