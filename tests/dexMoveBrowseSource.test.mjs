import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createServer } from 'vite'
import { byDisplayName } from '../src/displayOrder.ts'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const source = ts.createSourceFile('App.tsx', app, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
function actualFunction(name) {
  const node = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name)
  assert.ok(node, `actual App function ${name}`)
  return node.getText(source)
}
const legacy = JSON.parse(readFileSync(new URL('../src/championsLearnedMoveMeta.json', import.meta.url), 'utf8'))

// Execute App's actual shared filter against its real source index, metadata and matcher.
async function browse() {
  const server = await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent'})
  try {
    const [{searchMoves},{dexDisplayMoveMeta,getDexGameMove,getDexGameMoveNames}] = await Promise.all([
      server.ssrLoadModule('/src/moveSearch.ts'), server.ssrLoadModule('/src/dexGameMoveIndex.ts'),
    ])
    const context = {
      MOVE_META_BY_NAME:legacy, dexDisplayMoveMeta, getDexGameMove, getDexGameMoveNames,
      moveNameCandidates:name=>[name], normalizeSearchText:text=>text.toLowerCase().replace(/[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+/g,''),
      searchMoves, byDisplayName, moveDescriptionFor:()=>null,
    }
    const code = ts.transpileModule(`${actualFunction('moveSearchCandidates')}\n${actualFunction('dexMoveIndex')}\n${actualFunction('filterDexMoveOptions')}\nglobalThis.filter = filterDexMoveOptions`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
    vm.runInNewContext(code,context)
    return context.filter
  } finally { await server.close() }
}

test('shared Dex blank and queried options prefer source type without changing legacy metadata', async () => {
  const filter = await browse()
  const examples = [['성장','grass'],['집게덫','steel']]
  for (const query of ['', ...examples.map(([name])=>name)]) {
    const options = filter(query,{allowLoose:false})
    for (const [name,type] of examples.filter(([name])=>!query || name===query)) {
      assert.equal(options.find(option=>option.name===name)?.meta.type,type,`${query || 'blank'}: ${name}`)
    }
  }
  assert.equal(legacy['성장'].type,'normal')
  assert.equal(legacy['집게덫'].type,'grass')
})

test('ID 747 is in actual blank and unified search results with unknown non-type metadata', async () => {
  const filter = await browse()
  for (const query of ['', '볼가득넣기']) {
    const option = filter(query,{allowLoose:false}).find(option=>option.name==='볼가득넣기')
    assert.equal(option?.key,'볼가득넣기')
    assert.equal(option.meta.type,'normal')
    for (const field of ['category','power','accuracy','pp']) assert.equal(option.meta[field],null)
  }
  assert.equal(legacy['볼가득넣기'],undefined)
})

test('historical legacy-only Dex move stays searchable', async () => {
  const filter = await browse()
  const source = JSON.parse(readFileSync(new URL('../src/dexGameMoveIndex.json',import.meta.url),'utf8'))
  const historical = Object.keys(legacy).find(name=>!Object.hasOwn(source,name))
  assert.ok(historical)
  const option = filter(historical,{allowLoose:false}).find(entry=>entry.name===historical)
  assert.equal(option?.meta.type,legacy[historical].type)
})

test('actual Dex card projection labels missing category as unconfirmed rather than none', () => {
  let project
  function find(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'dexBrowseCards') project = node.initializer.arguments[0]
    ts.forEachChild(node,find)
  }
  find(source)
  assert.ok(project)
  const context = {
    dexBrowseResults:[{id:'move:볼가득넣기',kind:'move',key:'볼가득넣기',name:'볼가득넣기',meta:{type:'normal',category:null,power:null,pp:null}}],
    siteLanguage:'ko', dexDetailHref:()=> '#/dex?dexTab=move', lt:text=>text,
    displayTypeName:()=> '노말', translateText:(_language,text)=>text,
  }
  const code = ts.transpileModule(`${actualFunction('displayMoveCategoryName')}\nglobalThis.project = ${project.getText(source)}`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
  vm.runInNewContext(code,context)
  const [card] = context.project()
  assert.match(card.metaText,/미확인/)
  assert.doesNotMatch(card.metaText,/없음/)
})
