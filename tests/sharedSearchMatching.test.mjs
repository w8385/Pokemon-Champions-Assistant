import test from 'node:test'
import assert from 'node:assert/strict'
import { searchPokemon } from '../src/pokemonSearch.ts'
import { quickMoveSuggestions } from '../src/quickDamageState.ts'
import { searchMoves } from '../src/moveSearch.ts'

const roster = [
  { key: 'mega-garchomp', name_ko: '메가한카리아스', name_en: 'Mega Garchomp', speed: 92 },
  { key: 'garchomp', name_ko: '한카리아스', name_en: 'Garchomp', speed: 102 },
  { key: 'dragonite', name_ko: '망나뇽', name_en: 'Dragonite', speed: 80 },
  { key: 'rotom-wash', name_ko: '워시로토무', name_en: 'Rotom Wash', speed: 86 },
  { key: 'landorus-therian', name_ko: '랜드로스 영물폼', name_en: 'Landorus Therian', speed: 91 },
  { key: 'landorus-incarnate', name_ko: '랜드로스 화신폼', name_en: 'Landorus Incarnate', speed: 101 },
]
const keys = (rows) => rows.map(row => row.key)

test('Korean initials, curated short names and exact base outrank form aliases', () => {
  assert.equal(searchPokemon(roster, '한카리아스')[0].key, 'garchomp')
  assert.equal(searchPokemon(roster, '메가한카')[0].key, 'mega-garchomp')
  assert.equal(searchPokemon(roster, 'ㅎㅋㄹㅇㅅ')[0].key, 'garchomp')
  assert.equal(searchPokemon(roster, 'ㅁㄴㄴ')[0].key, 'dragonite')
  assert.equal(searchPokemon(roster, '워시')[0].key, 'rotom-wash')
  assert.deepEqual(keys(searchPokemon(roster, '랜드')), ['landorus-therian', 'landorus-incarnate'])
  assert.deepEqual(keys(searchPokemon(roster, 'ㅁㄱㅎㅋ', { includeMega: false })), [])
})

test('query normalization keeps initials, handles punctuation and does not match punctuation-only', () => {
  assert.equal(searchPokemon(roster, '  Ｍｅｇａ - GARCHOMP ')[0].key, 'mega-garchomp')
  assert.equal(searchPokemon(roster, 'ㅎ-ㅋ-ㄹ-ㅇ-ㅅ')[0].key, 'garchomp')
  assert.deepEqual(searchPokemon(roster, '!!!'), [])
  assert.deepEqual(keys(searchPokemon(roster, '')), keys(roster))
})

test('move matching accepts caller-provided multilingual labels without expanding its pool', () => {
  const pool = [{ name: '화염볼' }, { name: '볼트체인지' }, { name: '하이퍼보이스' }]
  const names = (move) => move.name === '화염볼' ? { nameEn: 'Pyro Ball', nameJa: 'かえんボール' } : undefined
  assert.deepEqual(searchMoves(pool, 'Ｐｙｒｏ－Ｂａｌｌ', { names }).map(move => move.name), ['화염볼'])
  assert.deepEqual(searchMoves(pool, 'かえんボール', { names }).map(move => move.name), ['화염볼'])
  assert.deepEqual(searchMoves(pool, '볼체', { names }).map(move => move.name), ['볼트체인지'])
  assert.deepEqual(searchMoves(pool.slice(1), 'Pyro Ball', { names }), [])
  assert.deepEqual(searchMoves(pool, 'ㅂ', { names, limit: 1 }).map(move => move.name), ['볼트체인지'])
})

test('quick move suggestions abbreviate within caller-provided legal pool only', () => {
  const pool = ['냉동펀치', '불꽃펀치', '번개펀치', '스텔스록', '볼트체인지', '하이퍼보이스', '치근거리기', '화염볼'].map(name => ({ name }))
  for (const [query, expected] of [['냉펀', '냉동펀치'], ['불펀', '불꽃펀치'], ['번펀', '번개펀치'], ['스록', '스텔스록'], ['볼체', '볼트체인지'], ['하보', '하이퍼보이스'], ['치근', '치근거리기'], ['ㅎㅇㅂ', '화염볼']]) {
    assert.equal(quickMoveSuggestions(query, pool)[0]?.name, expected, query)
  }
  assert.deepEqual(quickMoveSuggestions('냉펀', pool.slice(1)), [])
  assert.deepEqual(quickMoveSuggestions('!!!', pool), [])
  assert.deepEqual(quickMoveSuggestions('', pool).length, 8)
})

test('an exact Korean-initial match precedes longer names with the same initial prefix', () => {
  const pool = ['화염방사', '화염바퀴', '화염볼'].map(name => ({ name }))
  assert.equal(searchMoves(pool, 'ㅎㅇㅂ')[0].name, '화염볼')
  assert.equal(quickMoveSuggestions('ㅎㅇㅂ', pool)[0].name, '화염볼')
  assert.equal(searchMoves(pool, '화염방사')[0].name, '화염방사')
  assert.deepEqual(new Set(searchMoves(pool, 'ㅎㅇㅂ').map(move => move.name)), new Set(pool.map(move => move.name)))
})
