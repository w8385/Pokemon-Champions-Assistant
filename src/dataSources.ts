export const dataSourcePolicy = {
  structured: {
    primary: 'PokeAPI',
    use: '포켓몬/기술/타입/기본 구조화 데이터의 기준축',
  },
  validation: {
    primary: 'PokemonDB',
    secondary: 'Serebii',
    use: '사람이 읽는 검증 및 포켓몬 챔피언스 대응 여부 보강',
  },
  sampleSets: {
    primary: 'Smogon Dex',
    secondary: 'Pikalytics',
    use: '실전 샘플의 코어 기술/선택지/운영 분기 추적',
  },
} as const
