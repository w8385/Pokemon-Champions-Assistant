import { jaNameByKey } from './jaNames'

const typeJaByKey: Record<string, string> = {
  normal: 'ノーマル',
  fire: 'ほのお',
  water: 'みず',
  electric: 'でんき',
  grass: 'くさ',
  ice: 'こおり',
  fighting: 'かくとう',
  poison: 'どく',
  ground: 'じめん',
  flying: 'ひこう',
  psychic: 'エスパー',
  bug: 'むし',
  rock: 'いわ',
  ghost: 'ゴースト',
  dragon: 'ドラゴン',
  dark: 'あく',
  steel: 'はがね',
  fairy: 'フェアリー',
}

export function getJaName(key: string, fallbackKo: string, fallbackEn: string) {
  if (jaNameByKey[key as keyof typeof jaNameByKey]) return jaNameByKey[key as keyof typeof jaNameByKey]
  if (key.startsWith('mega-')) {
    const baseKey = key.replace(/^mega-/, '')
    const baseJa = jaNameByKey[baseKey as keyof typeof jaNameByKey]
    if (baseJa) return `メガ${baseJa}`
    if (fallbackEn.startsWith('Mega ')) return `メガ${fallbackEn.replace(/^Mega /, '')}`
  }
  return fallbackKo || fallbackEn
}

export function getJaTypes(types: string[]) {
  return types.map((type) => typeJaByKey[type] ?? type)
}
