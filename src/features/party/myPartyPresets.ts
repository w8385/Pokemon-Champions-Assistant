export type MyPartyPreset = {
  id: string
  label: string
  config: {
    natureBoost: boolean
    scarf: boolean
    speedStage: number
  }
  confirmedMoves: string[]
  note?: string
}

export const myPartyPresetsByKey: Record<string, MyPartyPreset[]> = {
  'mega-lopunny': [
    {
      id: 'standard-cleaner',
      label: '기본 대면형',
      config: { natureBoost: true, scarf: false, speedStage: 0 },
      confirmedMoves: ['속이다', '무릎차기', '은혜갚기'],
      note: '막판 스윕/대면 압박 기본형',
    },
  ],
  'mega-delphox': [
    {
      id: 'trick-attacker',
      label: '트릭 특수형',
      config: { natureBoost: true, scarf: false, speedStage: 0 },
      confirmedMoves: ['오버히트', '사이코키네시스', '트릭'],
      note: '트릭으로 수비 파괴',
    },
    {
      id: 'cm-attacker',
      label: '명상 전개형',
      config: { natureBoost: true, scarf: false, speedStage: 0 },
      confirmedMoves: ['매지컬플레임', '사이코키네시스', '명상'],
      note: '명상 축 운영형',
    },
  ],
  garchomp: [
    {
      id: 'sd-sweeper',
      label: '칼춤 에이스',
      config: { natureBoost: true, scarf: false, speedStage: 0 },
      confirmedMoves: ['지진', '역린', '칼춤'],
      note: '칼춤 후 마무리형',
    },
    {
      id: 'rocker',
      label: '스텔스록 전개형',
      config: { natureBoost: false, scarf: false, speedStage: 0 },
      confirmedMoves: ['지진', '스텔스록', '스톤에지'],
      note: '초반 전개 지원형',
    },
  ],
  toxapex: [
    {
      id: 'haze-pivot',
      label: '검은안개 수비형',
      config: { natureBoost: false, scarf: false, speedStage: 0 },
      confirmedMoves: ['열탕', '회복', '검은안개'],
      note: '기점 차단형',
    },
  ],
  corviknight: [
    {
      id: 'pivot',
      label: '유턴 피벗형',
      config: { natureBoost: false, scarf: false, speedStage: 0 },
      confirmedMoves: ['브레이브버드', '유턴', '날개쉬기'],
      note: '사이클 피벗형',
    },
    {
      id: 'bulk-up',
      label: '벌크업 눌러앉기',
      config: { natureBoost: false, scarf: false, speedStage: 0 },
      confirmedMoves: ['바디프레스', '벌크업', '날개쉬기'],
      note: '장기전 전개형',
    },
  ],
  kingambit: [
    {
      id: 'sd-sucker',
      label: '칼춤 기습형',
      config: { natureBoost: false, scarf: false, speedStage: 0 },
      confirmedMoves: ['기습', '아이언헤드', '칼춤'],
      note: '막판 기습 마무리형',
    },
  ],
}
