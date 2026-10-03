import championsData from './pokemon_champions_verified_data.json' with { type: 'json' }
export { championsData }

// Shared effective roster: App renders these forms and backup validation accepts the same keys.
export const additionalFormSpecs = [
  { id: 10008, key: 'rotom-heat', name_ko: '히트로토무', name_en: 'Rotom Heat', name_ja: 'ヒートロトム', types: ['electric', 'fire'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10008 },
  { id: 10009, key: 'rotom-wash', name_ko: '워시로토무', name_en: 'Rotom Wash', name_ja: 'ウォッシュロトム', types: ['electric', 'water'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10009 },
  { id: 10010, key: 'rotom-frost', name_ko: '프로스트로토무', name_en: 'Rotom Frost', name_ja: 'フロストロトム', types: ['electric', 'ice'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10010 },
  { id: 10011, key: 'rotom-fan', name_ko: '스핀로토무', name_en: 'Rotom Fan', name_ja: 'スピンロトム', types: ['electric', 'flying'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10011 },
  { id: 10012, key: 'rotom-mow', name_ko: '커트로토무', name_en: 'Rotom Mow', name_ja: 'カットロトム', types: ['electric', 'grass'], hp: 50, attack: 65, defense: 107, spAttack: 105, spDefense: 107, speed: 86, spriteId: 10012 },
  { id: 10030, key: 'gourgeist-small', name_ko: '소형 호바귀', name_en: 'Gourgeist Small', name_ja: 'パンプジン(スモール)', types: ['ghost', 'grass'], hp: 55, attack: 85, defense: 122, spAttack: 58, spDefense: 75, speed: 99, spriteId: 10030 },
  { id: 711, key: 'gourgeist-average', name_ko: '보통 호바귀', name_en: 'Gourgeist Average', name_ja: 'パンプジン', types: ['ghost', 'grass'], hp: 65, attack: 90, defense: 122, spAttack: 58, spDefense: 75, speed: 84, spriteId: 711 },
  { id: 10031, key: 'gourgeist-large', name_ko: '대형 호바귀', name_en: 'Gourgeist Large', name_ja: 'パンプジン(ラージ)', types: ['ghost', 'grass'], hp: 75, attack: 95, defense: 122, spAttack: 58, spDefense: 75, speed: 69, spriteId: 10031 },
  { id: 10032, key: 'gourgeist-super', name_ko: '특대형 호바귀', name_en: 'Gourgeist Super', name_ja: 'パンプジン(スーパー)', types: ['ghost', 'grass'], hp: 85, attack: 100, defense: 122, spAttack: 58, spDefense: 75, speed: 54, spriteId: 10032 },
]

export const supportedSpeciesKeys = new Set<string>([
  ...championsData.rows.filter(row => typeof row?.key === 'string' && !!row.key).map(row => row.key),
  ...additionalFormSpecs.map(form => form.key),
])
