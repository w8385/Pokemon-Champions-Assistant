export type EffortValues = {
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
}

export type ChampionsSample = {
  id: string
  label: string
  evs: EffortValues
  natureBoostStat?: 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed'
  scarf?: boolean
  note?: string
}

export const defaultEvs: EffortValues = {
  hp: 0,
  attack: 0,
  defense: 0,
  spAttack: 0,
  spDefense: 0,
  speed: 0,
}

export const championsSamplesByKey: Record<string, ChampionsSample[]> = {
  'mega-lopunny': [
    { id: 'fast-attacker', label: '최속 공격형', evs: { hp: 0, attack: 252, defense: 0, spAttack: 0, spDefense: 4, speed: 252 }, natureBoostStat: 'speed', note: '기본 최속 어태커' },
  ],
  'mega-delphox': [
    { id: 'fast-special', label: '최속 특수형', evs: { hp: 0, attack: 0, defense: 0, spAttack: 252, spDefense: 4, speed: 252 }, natureBoostStat: 'speed', note: '최속 특수 압박형' },
    { id: 'bulky-special', label: '내구 조정형', evs: { hp: 156, attack: 0, defense: 0, spAttack: 116, spDefense: 4, speed: 228 }, natureBoostStat: 'speed', note: '속도/내구 조정형' },
  ],
  garchomp: [
    { id: 'fast-sd', label: '최속 칼춤형', evs: { hp: 0, attack: 252, defense: 0, spAttack: 0, spDefense: 4, speed: 252 }, natureBoostStat: 'speed', note: '최속 에이스' },
    { id: 'bulky-rocker', label: '록커 조정형', evs: { hp: 252, attack: 76, defense: 4, spAttack: 0, spDefense: 4, speed: 172 }, note: '전개형' },
  ],
  toxapex: [
    { id: 'physdef', label: '물리내구형', evs: { hp: 252, attack: 0, defense: 252, spAttack: 0, spDefense: 4, speed: 0 }, natureBoostStat: 'defense', note: '기본 물리내구형' },
  ],
  corviknight: [
    { id: 'physdef-pivot', label: '물리피벗형', evs: { hp: 252, attack: 0, defense: 168, spAttack: 0, spDefense: 88, speed: 0 }, note: '피벗/받이형' },
  ],
  kingambit: [
    { id: 'bulky-sd', label: '벌크 칼춤형', evs: { hp: 236, attack: 252, defense: 20, spAttack: 0, spDefense: 0, speed: 0 }, natureBoostStat: 'attack', note: '막판 스위퍼' },
  ],
}
