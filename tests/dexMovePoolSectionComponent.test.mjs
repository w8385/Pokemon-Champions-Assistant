import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'

test('ready form pool renders every canonical move with distinct total/display counts and unverified warning', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { DexMovePoolSection } = await server.ssrLoadModule('/src/DexMovePoolSection.tsx')
    const moves = [{name:'섀도볼',type:'ghost'}, {name:'도깨비불',type:'fire'}, ...Array.from({length:24}, (_,i)=>({name:`기술${i}`,type:null}))]
    const html = renderToStaticMarkup(React.createElement(DexMovePoolSection, {
      recordKey:'rotom-wash', language:'ko', status:'ready', moves,
      metaForMove:name=>name === '도깨비불' ? {type:'fire',category:'status',power:null,accuracy:85,pp:15} : null,
      displayMoveName:name=>name, renderTypeBadge:type=>React.createElement('span',{'data-type':type},type),
      detailHref:name=>`#/dex/move/${encodeURIComponent(name)}`, onNavigate(){},
    }))
    assert.match(html, /수록 기술 전체/)
    assert.match(html, /챔피언스 습득 가능 여부 미검증/)
    assert.match(html, /전체 26/)
    assert.match(html, /표시 26/)
    assert.equal((html.match(/class="dex-move-pool-link"/g) ?? []).length, 26)
    assert.match(html, /도깨비불/)
    assert.match(html, /상태/)
    assert.match(html, /—/)
  } finally { await server.close() }
})

test('pool loading, missing, error and genuine ready-empty remain distinct without fabricated zero counts', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { DexMovePoolSection } = await server.ssrLoadModule('/src/DexMovePoolSection.tsx')
    const render = (status, language='ko') => renderToStaticMarkup(React.createElement(DexMovePoolSection, {
      recordKey:'rotom-wash', language, status, moves:[], metaForMove:()=>null,
      displayMoveName:name=>name, renderTypeBadge:()=>null, detailHref:()=>'', onNavigate(){}, onRetry(){},
    }))
    for (const status of ['idle','loading','missing','error']) {
      const html = render(status)
      assert.doesNotMatch(html, /전체 0|표시 0/)
      assert.doesNotMatch(html, /<table/)
      assert.match(html, /챔피언스 습득 가능 여부 미검증/)
    }
    assert.match(render('missing'), /0개로 확인된 것은 아닙니다/)
    assert.match(render('error'), /다시 시도/)
    assert.doesNotMatch(render('loading'), /다시 시도/)
    assert.match(render('ready'), /전체 0 · 표시 0/)
    assert.match(render('ready', 'en'), /Champions learnability unverified/)
    assert.match(render('ready', 'ja'), /習得可否は未検証/)
  } finally { await server.close() }
})

test('pool and browse styles provide unbounded multi-column cards and table-local mobile scrolling', () => {
  const css = readFileSync(new URL('../src/dexBrowse.css', import.meta.url), 'utf8')
  assert.match(css, /\.dex-browse-grid\.dex-results-list\s*\{[^}]*grid-template-columns:[^}]*repeat\(auto-fill/s)
  assert.match(css, /\.dex-browse-grid\.dex-results-list\s*\{[^}]*max-height:\s*none/s)
  assert.match(css, /@media \(max-width:\s*600px\)\s*\{\s*\.dex-browse-grid\.dex-results-list\s*\{[^}]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s)
  assert.match(css, /\.dex-move-pool-table-wrap\s*\{[^}]*overflow-x:\s*auto/s)
  assert.match(css, /\.dex-move-pool-filters\s*\{/)
})

test('pinned game provenance distinguishes historical snapshot and ambiguous form from seed warning', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  try {
    const { DexMovePoolSection } = await server.ssrLoadModule('/src/DexMovePoolSection.tsx')
    const props = {
      recordKey:'mega-meowstic', language:'ko', status:'missing', moves:[], metaForMove:()=>null,
      displayMoveName:name=>name, renderTypeBadge:()=>null, detailHref:()=>'', onNavigate(){},
      provenance:{kind:'game-snapshot',date:'2026-09-09',commit:'50e7233b78c3b81df29563f9695386c28e77fc95',reason:'ambiguous-form'},
    }
    const html = renderToStaticMarkup(React.createElement(DexMovePoolSection, props))
    assert.match(html, /게임 데이터 스냅샷 · 2026-09-09/)
    assert.match(html, /현재 게임 버전과 일치 여부 미검증/)
    assert.match(html, /성별·품종을 확정할 수 없어 기술 목록을 표시하지 않습니다/)
    assert.match(html, /github.com\/projectpokemon\/champout\/tree\/50e7233b78c3b81df29563f9695386c28e77fc95/)
    assert.doesNotMatch(html, /기준 종\/별칭 시드/)
    assert.doesNotMatch(html, /전체 0/)
  } finally { await server.close() }
})
