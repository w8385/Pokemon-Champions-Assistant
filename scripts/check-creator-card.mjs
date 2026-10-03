import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { PokemonCardHeading, PokemonStatGrid, ReadonlyPokemonCard } = await server.ssrLoadModule('/src/PokemonCardOverview.tsx')
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
  console.log('creator shared card: 6 stats, unknown state, icons, readonly/editable PASS')
} finally {
  await server.close()
}
