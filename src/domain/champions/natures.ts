// Nature definitions are the single source for build validation, display, and OCR labels.
export type StatKey = 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed'
type NatureRecord = { id: string; label: string; up?: StatKey; down?: StatKey }
const defineNatures = <const T extends readonly NatureRecord[]>(values: T): readonly (NatureRecord & { id: T[number]['id'] })[] => values
export const NATURES = defineNatures([
  { id: 'hardy', label: '노력' },
  { id: 'lonely', label: '외로움', up: 'attack', down: 'defense' },
  { id: 'brave', label: '용감', up: 'attack', down: 'speed' },
  { id: 'adamant', label: '고집', up: 'attack', down: 'spAttack' },
  { id: 'naughty', label: '개구쟁이', up: 'attack', down: 'spDefense' },
  { id: 'bold', label: '대담', up: 'defense', down: 'attack' },
  { id: 'docile', label: '온순' },
  { id: 'relaxed', label: '무사태평', up: 'defense', down: 'speed' },
  { id: 'impish', label: '장난꾸러기', up: 'defense', down: 'spAttack' },
  { id: 'lax', label: '촐랑', up: 'defense', down: 'spDefense' },
  { id: 'timid', label: '겁쟁이', up: 'speed', down: 'attack' },
  { id: 'hasty', label: '성급', up: 'speed', down: 'defense' },
  { id: 'serious', label: '성실' },
  { id: 'jolly', label: '명랑', up: 'speed', down: 'spAttack' },
  { id: 'naive', label: '천진난만', up: 'speed', down: 'spDefense' },
  { id: 'modest', label: '조심', up: 'spAttack', down: 'attack' },
  { id: 'mild', label: '의젓', up: 'spAttack', down: 'defense' },
  { id: 'quiet', label: '냉정', up: 'spAttack', down: 'speed' },
  { id: 'bashful', label: '수줍음' },
  { id: 'rash', label: '덜렁', up: 'spAttack', down: 'spDefense' },
  { id: 'calm', label: '차분', up: 'spDefense', down: 'attack' },
  { id: 'gentle', label: '얌전', up: 'spDefense', down: 'defense' },
  { id: 'sassy', label: '건방', up: 'spDefense', down: 'speed' },
  { id: 'careful', label: '신중', up: 'spDefense', down: 'spAttack' },
  { id: 'quirky', label: '변덕' },
] as const)
export type NatureId = (typeof NATURES)[number]['id']
