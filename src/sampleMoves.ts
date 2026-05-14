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
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex ORAS/ND offensive sets'],
    },
    core: ['속이다', '무릎차기'],
    options: ['은혜갚기', '몸통박치기', '냉동펀치'],
    utility: ['고양이돈받기', '번개펀치'],
    notes: ['대면 압박형', '고스트 견제 여부 확인'],
  },
  {
    key: 'mega-delphox',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex custom attacker references'],
    },
    core: ['오버히트', '사이코키네시스'],
    options: ['매지컬플레임', '섀도볼', '에너지볼'],
    utility: ['트릭', '명상'],
    notes: ['트릭 여부가 샘플 분기점'],
  },
  {
    key: 'garchomp',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex tank/SD sets', 'Pikalytics common move trends'],
    },
    core: ['지진', '역린'],
    options: ['스톤에지', '독찌르기', '불꽃엄니'],
    utility: ['스텔스록', '칼춤'],
    notes: ['록커인지 칼춤인지 먼저 확인'],
  },
  {
    key: 'toxapex',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex defensive sets'],
    },
    core: ['열탕', '회복'],
    options: ['맹독', '독압정', '검은안개'],
    utility: ['지키기', '냉동빔'],
    notes: ['독압정/검은안개 여부가 중요'],
  },
  {
    key: 'corviknight',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex bulky pivot sets'],
    },
    core: ['브레이브버드', '바디프레스'],
    options: ['유턴', '아이언헤드'],
    utility: ['날개쉬기', '벌크업', '도발'],
    notes: ['유턴 축인지 눌러앉는지 구분'],
  },
  {
    key: 'kingambit',
    source: {
      structured: 'PokeAPI species/moves baseline',
      validation: ['PokemonDB', 'Serebii'],
      samples: ['Smogon Dex sweeper sets', 'Pikalytics move frequency'],
    },
    core: ['아이언헤드', '기습'],
    options: ['깨트리다', '로우킥', '탁쳐서떨구기'],
    utility: ['칼춤', '대타출동'],
    notes: ['기습/칼춤 확인이 우선'],
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
