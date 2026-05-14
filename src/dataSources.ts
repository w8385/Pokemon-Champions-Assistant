export const dataSourcePolicy = {
  structured: {
    primary: 'PokeAPI',
    use: '포켓몬/기술/타입/기본 구조화 데이터의 기준축',
  },
  movePools: {
    sourceOfTruth: 'src/pokemonMovePools.json',
    primary: 'PokeAPI 기반 본가 기술풀 임베드',
    supplements: ['포켓몬 챔피언스 기준 수동 보정', '폼/메가 예외 병합'],
    validation: ['champs.pokedb.tokyo', 'PokemonDB', 'Serebii'],
    caveat: '현재는 포켓몬 챔피언스 전용 화이트리스트가 아니라, PokeAPI 기반 기술풀에 챔피언스 누락/예외를 수동 보정한 상태입니다.',
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
