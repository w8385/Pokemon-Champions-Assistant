export type SampleMoveEntry = {
  key: string
  source: {
    structured: string
    validation: string[]
    samples: string[]
  }
  core: string[]
  options?: string[]
  utility?: string[]
  notes?: string[]
}

export const sampleMoves: SampleMoveEntry[] = [
  {
    key: 'mega-lopunny',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend proxy (Lopunny base form)'],
      samples: ['Smogon Dex ORAS/ND offensive sets'],
    },
    core: ['속이다', '인파이트'],
    options: ['트리플악셀', '무릎차기'],
    utility: ['유턴', '칼춤'],
    notes: ['시즌 usage 상위축을 기준으로 인파이트/트리플악셀 우선순위를 상향', '마하펀치/냉동펀치는 저우선 커버 분기로 제외'],
  },
  {
    key: 'mega-delphox',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend proxy (Delphox base form)'],
      samples: ['Smogon Dex custom attacker references'],
    },
    core: ['화염방사', '사이코쇼크'],
    options: ['앵콜', '나쁜음모'],
    utility: ['사이코키네시스', '매지컬샤인'],
    notes: ['시즌 usage 기준 화염방사/사이코쇼크 축을 코어로 승격', '대타출동/도깨비불은 저우선 분기로 제외'],
  },
  {
    key: 'garchomp',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend page season 1'],
      samples: ['Smogon Dex tank/SD sets', 'Pikalytics common move trends'],
    },
    core: ['지진', '스텔스록'],
    options: ['역린', '암석봉인'],
    utility: ['스케일샷'],
    notes: ['시즌 usage 기준 스텔스록 채용률을 코어 축으로 상향', '스톤샤워/독찌르기/드래곤테일은 저우선 분기로 제외'],
  },
  {
    key: 'toxapex',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend page season 1'],
      samples: ['Smogon Dex defensive sets'],
    },
    core: ['HP회복', '맹독'],
    options: ['흑안개', '엉겨붙기'],
    utility: ['독압정'],
    notes: ['시즌 usage 기준 독/흑안개/회복 축으로 재정렬', '토치카/찬물끼얹기/보복은 저우선 후보로 제외'],
  },
  {
    key: 'corviknight',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend page season 1'],
      samples: ['Smogon Dex bulky pivot sets'],
    },
    core: ['날개쉬기', '바디프레스'],
    options: ['철벽', '유턴'],
    utility: ['브레이브버드'],
    notes: ['시즌 usage 기준 날개쉬기/바디프레스/철벽/유턴 4축 유지', '아이언헤드/도발/벌크업은 저우선 분기로 제외'],
  },
  {
    key: 'kingambit',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend page season 1'],
      samples: ['Smogon Dex sweeper sets', 'Pikalytics move frequency'],
    },
    core: ['기습', '도각참'],
    options: ['아이언헤드', '칼춤'],
    utility: ['안다리걸기'],
    notes: ['시즌 usage 기준 칼춤과 안다리걸기 채용률을 반영', '가위자르기/깨트리다/메탈버스트는 추적 우선도 낮아 제외'],
  },
  {
    key: 'rotom',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii Champions move list'],
      samples: ['Smogon Dex pivot sets', 'Pikalytics utility trends'],
    },
    core: ['볼트체인지', '도깨비불'],
    options: ['트릭', '10만볼트'],
    utility: ['병상첨병'],
    notes: ['시즌 usage 기준 볼체/도깨비불/트릭/10만볼트 4축을 우선 유지', '섀도볼/전기자석파/방전은 저우선 분기로 제외'],
  },
  {
    key: 'primarina',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex calm mind/offense sets'],
    },
    core: ['문포스', '물거품아리아'],
    options: ['아쿠아제트', '앵콜'],
    utility: ['명상', '퀵턴'],
    notes: ['시즌 usage 기준 하이드로펌프보다 물거품아리아/아쿠아제트 축을 우선', '파도타기/미스트필드는 저우선 분기로 제외'],
  },
  {
    key: 'dragapult',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii Champions move list'],
      samples: ['Smogon Dex offensive sets', 'Pikalytics common move usage'],
    },
    core: ['드래곤애로', '유턴'],
    options: ['고스트다이브', '도깨비불'],
    utility: ['기습', '용성군'],
    notes: ['시즌 usage 기준 유턴 축을 코어로 승격', '섀도볼/용의춤은 저우선 분기로 제외'],
  },
  {
    key: 'mimikyu',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex setup sets'],
    },
    core: ['야습', '치근거리기'],
    options: ['칼춤', '섀도크루'],
    utility: ['드레인펀치'],
    notes: ['시즌 usage 기준 야습/칼춤 우선순위를 상향', '트릭룸/아픔나누기/저주는 저우선 분기로 제외'],
  },
  {
    key: 'meowscarada',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex pivot sets', 'Pikalytics support usage'],
    },
    core: ['트릭플라워', '트리플악셀'],
    options: ['유턴', '탁쳐서떨구기'],
    utility: ['기습'],
    notes: ['시즌 usage 상위 4축을 우선 남기고 치근거리기는 보조 후보에서 제외', '번개펀치/안다리걸기는 저우선 분기로 제외'],
  },
]
