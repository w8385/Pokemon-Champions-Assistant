import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { PokemonCardHeading, PokemonStatGrid, ReadonlyPokemonCard, createReadonlyCardStats } = await server.ssrLoadModule('/src/PokemonCardOverview.tsx')
  const stats = ['hp', 'spAttack', 'attack', 'spDefense', 'defense', 'speed'].map((key, i) => ({ key, label: key, theme: `stat-theme-${key}`, value: i === 0 ? 140 : null, ev: i === 0 ? 19 : null }))
  const render = element => renderToStaticMarkup(element)
  const shared = render(React.createElement(PokemonStatGrid, { stats }))
  assert.equal((shared.match(/stat-preview-row/g) || []).length, 6)
  assert.match(shared, /140/)
  assert.match(shared, /EV \+19/)
  assert.match(shared, /미확인/)
  assert.doesNotMatch(shared, /EV \+0/)
  assert.doesNotMatch(shared, /stat-preview-button/)
  const editable = render(React.createElement(PokemonStatGrid, { stats, onTune: () => {} }))
  assert.equal((editable.match(/stat-preview-button/g) || []).length, 6)
  const heading = render(React.createElement(PokemonCardHeading, { name: React.createElement('input', { value: '메가이어롭', readOnly: true }), sprite: '/sprite.png', types: ['normal', 'fighting'] }))
  assert.match(heading, /party-card-header/)
  assert.match(heading, /entry-sprite/)
  assert.equal((heading.match(/type-badge-image/g) || []).length, 2)
  const card = render(React.createElement(ReadonlyPokemonCard, { name: '워시로토무', ability: '부유', item: '구애스카프', itemSprite: '/item.png', stats, labels: { ability: '특성', nature: '성격', item: '도구', unknown: '미확인' } }))
  assert.match(card, /entry-card/)
  assert.match(card, /워시로토무/)
  assert.match(card, /부유/)
  assert.match(card, /구애스카프/)
  assert.match(card, /item-sprite/)
  assert.match(card, /성격<\/span><strong>미확인/)
  assert.equal((card.match(/stat-preview-row/g) || []).length, 6)
  assert.doesNotMatch(card, /stat-preview-button|메가이어롭|EV \+0/)
  const unsupported = render(React.createElement(ReadonlyPokemonCard, { name: '워시로토무', ability: '부유', item: '구애스카프', itemSprite: '/item.png', stats, calculationNote: '지원되지 않는 종: 실수치 계산 불가', labels: { ability: '특성', nature: '성격', item: '도구', unknown: '미확인' } }))
  assert.match(unsupported, /지원되지 않는 종: 실수치 계산 불가/)
  const statLabels = ['hp', 'spAttack', 'attack', 'spDefense', 'defense', 'speed'].map(key => ({ key, label: key, theme: `stat-theme-${key}` }))
  const sourceBuild = { evs: { hp: 6, spAttack: 32, attack: 0, spDefense: 0, defense: 0, speed: 28 }, moves: ['하이드로펌프', '10만볼트', '볼트체인지', '트릭'] }
  const sourceStats = createReadonlyCardStats(statLabels, sourceBuild) // Neither nature nor a supported roster row.
  const sourceCard = render(React.createElement(ReadonlyPokemonCard, { name: '워시로토무', stats: sourceStats, labels: { ability: '특성', nature: '성격', item: '도구', unknown: '미확인' } }, React.createElement('div', { className: 'creator-library-moves' }, sourceBuild.moves.map(move => React.createElement('span', { key: move }, move)))))
  assert.equal((sourceCard.match(/stat-preview-row/g) || []).length, 6)
  for (const ev of [6, 32, 0, 0, 0, 28]) assert.match(sourceCard, new RegExp(`EV \\+${ev}`))
  for (const move of sourceBuild.moves) assert.match(sourceCard, new RegExp(move))
  assert.match(sourceCard, /성격<\/span><strong>미확인/)
  const annotatedCard = render(React.createElement(ReadonlyPokemonCard, { name: '메가핫삼', stats: sourceStats, statsLabel: '원본 핫삼(메가진화 전) 실수치', statsUnknown: '실수치 미기록', labels: { ability: '특성', nature: '성격', item: '도구', unknown: '미확인' } }))
  assert.match(annotatedCard, /원본 핫삼\(메가진화 전\) 실수치/)
  assert.match(annotatedCard, /실수치 미기록/)
  const recorded = createReadonlyCardStats(statLabels, { ...sourceBuild, actualStats: { hp: 131, spAttack: 157, attack: 76, spDefense: 127, defense: 127, speed: 147 } })
  assert.deepEqual(recorded.map(s => s.value), [131, 157, 76, 127, 127, 147])
  assert.deepEqual(recorded.map(s => s.ev), [6, 32, 0, 0, 0, 28])
  console.log('creator shared card: six EVs and four moves survive missing nature/roster; source actual stats PASS')
} finally {
  await server.close()
}
