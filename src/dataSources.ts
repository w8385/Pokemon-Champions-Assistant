export const dataSourcePolicy = {
  structured: {
    primary: 'PokeAPI',
    use: '포켓몬/기술/타입/기본 구조화 데이터의 기준축',
  },
  movePools: {
    sourceOfTruth: 'src/championsMovePools.json',
    seedBaseline: 'src/pokemonMovePools.json',
    sourceMeta: 'src/championsMovePoolSources.json',
    coverageReport: 'reports/championsMoveWhitelistCoverage.json',
    primary: '포챔스 전용 화이트리스트 파일 (현재는 PokeAPI baseline에서 시드 생성)',
    supplements: ['포켓몬 챔피언스 기준 수동 보정', '폼/메가 예외 병합', '종별 검증 메타데이터'],
    validation: ['champs.pokedb.tokyo', 'PokemonDB', 'Serebii'],
    caveat: '현재 src/championsMovePools.json은 포챔스 전용 화이트리스트 파일이지만, 내용은 아직 PokeAPI baseline에서 시드 생성된 단계입니다. 종별로 Champions-specific 검증을 거쳐야 확정본으로 승격됩니다.',
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
