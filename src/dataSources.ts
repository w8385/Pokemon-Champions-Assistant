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
    recommendationAuditReport: 'reports/championsRecommendationAudit.json',
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
  learnedMoveWhitelist: {
    sourceOfTruth: 'src/championsLearnedMoveWhitelist.json',
    report: 'reports/championsLearnedMoveWhitelistReport.json',
    primary: '현재 사이트가 실제로 학습한 종별 추천기술 화이트리스트',
    supplements: ['src/sampleMoves.ts', 'src/championsMovePools.json', 'src/championsRecommendationAuditOverrides.json'],
    caveat: '전체 기술풀이 아니라 현재 사이트가 학습/추천 중인 기술만 포함한다.',
  },
  itemWhitelist: {
    sourceOfTruth: 'src/championsItems.ts',
    primary: '포켓몬 챔피언스에서 현재 UI가 허용하는 도구 목록만 분리한 파일',
    supplements: ['별칭', '아이템 스프라이트 slug'],
    caveat: '현재는 앱 내부 허용 목록 추출본이며, 향후 포챔스 실데이터 기준 검증이 필요할 수 있다.',
  },
} as const
