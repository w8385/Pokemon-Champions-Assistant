// Small name snapshot from dexDescriptions.json; parity is checked in
// speedAbilityBundle.test.mjs without eagerly loading the full dex in the app.
const abilityNames = {
  'swift-swim': { nameKo: '쓱쓱', nameEn: 'Swift Swim', nameJa: 'すいすい' },
  chlorophyll: { nameKo: '엽록소', nameEn: 'Chlorophyll', nameJa: 'ようりょくそ' },
  'sand-rush': { nameKo: '모래헤치기', nameEn: 'Sand Rush', nameJa: 'すなかき' },
  'slush-rush': { nameKo: '눈치우기', nameEn: 'Slush Rush', nameJa: 'ゆきかき' },
  'surge-surfer': { nameKo: '서핑테일', nameEn: 'Surge Surfer', nameJa: 'サーフテール' },
  unburden: { nameKo: '곡예', nameEn: 'Unburden', nameJa: 'かるわざ' },
  'quick-feet': { nameKo: '속보', nameEn: 'Quick Feet', nameJa: 'はやあし' },
} as const

export type SpeedAbilitySlug = 'swift-swim' | 'chlorophyll' | 'sand-rush' | 'slush-rush' | 'surge-surfer' | 'unburden' | 'quick-feet'
export type SpeedActivation = 'rain' | 'sun' | 'sand' | 'snow' | 'electric' | 'item-lost' | 'status'
export type SpeedAbilityDescriptor = {
  slug: SpeedAbilitySlug
  multiplier: 1.5 | 2
  activation: SpeedActivation
  labelKo: string
  labelEn: string
  labelJa: string
  conditionKo: string
  conditionEn: string
  conditionJa: string
}

// Names come from the existing verified dex; activation labels describe hypothetical prerequisites,
// not live weather/terrain/status detection or a claim of in-game Champions verification.
const definitions: readonly [SpeedAbilitySlug, 1.5 | 2, SpeedActivation, string, string, string][] = [
  ['swift-swim', 2, 'rain', '비가 내릴 때', 'In rain', '雨のとき'],
  ['chlorophyll', 2, 'sun', '햇살이 강할 때', 'In sun', '晴れのとき'],
  ['sand-rush', 2, 'sand', '모래바람일 때', 'In sandstorm', '砂あらしのとき'],
  ['slush-rush', 2, 'snow', '눈이 내릴 때', 'In snow', '雪のとき'],
  ['surge-surfer', 2, 'electric', '일렉트릭필드일 때', 'In Electric Terrain', 'エレキフィールドのとき'],
  ['unburden', 2, 'item-lost', '지닌 도구를 사용하거나 잃고 현재 도구가 없을 때', 'After using/losing its item while holding none', '道具を使うか失い、道具を持っていないとき'],
  ['quick-feet', 1.5, 'status', '상태 이상일 때 (마비의 스피드 저하 없음)', 'While statused (no paralysis Speed reduction)', '状態異常のとき（まひによる素早さ低下なし）'],
]

export const SPEED_ABILITIES: readonly SpeedAbilityDescriptor[] = definitions.map(([slug, multiplier, activation, conditionKo, conditionEn, conditionJa]) => {
  const names = abilityNames[slug]
  return { slug, multiplier, activation, labelKo: names.nameKo, labelEn: names.nameEn, labelJa: names.nameJa, conditionKo, conditionEn, conditionJa }
})

export function getSpeedAbility(slug: string | null | undefined): SpeedAbilityDescriptor | null {
  return SPEED_ABILITIES.find(ability => ability.slug === slug) ?? null
}

export function speedAbilitiesFor(row: { abilities?: readonly string[] }): SpeedAbilityDescriptor[] {
  return SPEED_ABILITIES.filter(ability => row.abilities?.includes(ability.slug))
}
