import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

/** Evaluate the real translation function and its bounded AST dictionary, not incidental `en:` text. */
export function appTranslate() {
  const source = readFileSync(new URL('../src/shared/display/translation.ts', import.meta.url), 'utf8')
  const ast = ts.createSourceFile('translation.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  let dictionary, translator
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'UI_TRANSLATIONS') dictionary = node
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'translateText') translator = node
    ts.forEachChild(node, visit)
  }
  visit(ast)
  assert.ok(dictionary && translator)
  const context = {}
  const code = `const ${dictionary.getText(ast)}; ${translator.getText(ast).replace(/^export /, '')}; globalThis.translate = translateText`
  vm.runInNewContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context)
  return context.translate
}
