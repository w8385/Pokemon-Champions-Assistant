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
    core: ['속이다', '무릎차기'],
    options: ['유턴', '트리플악셀', '냉동펀치'],
    utility: ['앵콜', '번개펀치'],
    notes: ['포챔스 통계 프록시에서는 인파이트/유턴/트리플악셀 비중이 높음', '고스트 견제 여부 확인'],
  },
  {
    key: 'mega-delphox',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend proxy (Delphox base form)'],
      samples: ['Smogon Dex custom attacker references'],
    },
    core: ['사이코키네시스', '매지컬샤인'],
    options: ['오버히트', '사이코쇼크', '대타출동'],
    utility: ['앵콜', '명상'],
    notes: ['포챔스 통계 프록시에서는 화염방사/사이코키네시스/매지컬샤인이 상위', '앵콜 여부가 샘플 분기점'],
  },
  {
    key: 'garchomp',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend page season 1'],
      samples: ['Smogon Dex tank/SD sets', 'Pikalytics common move trends'],
    },
    core: ['지진', '역린'],
    options: ['암석봉인', '독찌르기', '스케일샷'],
    utility: ['스텔스록', '칼춤'],
    notes: ['포챔스 통계 기준 지진/역린 뒤로 스텔스록, 암석봉인 비중이 높음'],
  },
  {
    key: 'toxapex',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend page season 1'],
      samples: ['Smogon Dex defensive sets'],
    },
    core: ['열탕', '회복'],
    options: ['맹독', '토치카', '흑안개'],
    utility: ['독압정', '냉동빔'],
    notes: ['포챔스 통계 기준 맹독/토치카/흑안개 채용이 높음'],
  },
  {
    key: 'corviknight',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend page season 1'],
      samples: ['Smogon Dex bulky pivot sets'],
    },
    core: ['날개쉬기', '바디프레스'],
    options: ['철벽', '유턴', '아이언헤드'],
    utility: ['도발', '브레이브버드', '벌크업'],
    notes: ['포챔스 통계 기준 날개쉬기/바디프레스/철벽 축 비중이 높음'],
  },
  {
    key: 'kingambit',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii', 'Champions trend page season 1'],
      samples: ['Smogon Dex sweeper sets', 'Pikalytics move frequency'],
    },
    core: ['도각참', '기습'],
    options: ['아이언헤드', '로우킥'],
    utility: ['칼춤', '도발', '메탈버스트'],
    notes: ['포챔스 통계 기준 도각참 누락은 오류로 보고 바로 보강', '기습/칼춤 확인이 우선'],
  },
  {
    key: 'rotom',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii Champions move list'],
      samples: ['Smogon Dex pivot sets', 'Pikalytics utility trends'],
    },
    core: ['볼트체인지', '하이드로펌프'],
    options: ['10만볼트', '악의파동', '트릭'],
    utility: ['도깨비불', '전기자석파'],
    notes: ['트릭/상태이상기 보유 확인'],
  },
  {
    key: 'primarina',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex calm mind/offense sets'],
    },
    core: ['문포스', '하이드로펌프'],
    options: ['하이퍼보이스', '냉동빔', '에너지볼'],
    utility: ['명상', '앵콜'],
    notes: ['앵콜/명상 여부로 운영 달라짐'],
  },
  {
    key: 'dragapult',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii Champions move list'],
      samples: ['Smogon Dex offensive sets', 'Pikalytics common move usage'],
    },
    core: ['드래곤애로', '고스트다이브'],
    options: ['용성군', '불대문자', '유턴'],
    utility: ['전기자석파', '도깨비불'],
    notes: ['물리/특수/서포트 분기 추적'],
  },
  {
    key: 'mimikyu',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex setup sets'],
    },
    core: ['치근거리기', '섀도클로'],
    options: ['야습', '우드해머'],
    utility: ['칼춤', '도깨비불', '대타출동'],
    notes: ['칼춤형인지 유틸형인지 확인'],
  },
  {
    key: 'meowscarada',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex pivot sets', 'Pikalytics support usage'],
    },
    core: ['트릭플라워', '탁쳐서떨구기'],
    options: ['유턴', '로우킥', '치근거리기'],
    utility: ['도발', '압정뿌리기'],
    notes: ['유턴/압정 여부 중요'],
  },
]
