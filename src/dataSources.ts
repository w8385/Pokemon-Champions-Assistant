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
  moveMeta: {
    sourceOfTruth: 'src/championsLearnedMoveMeta.json',
    report: 'reports/championsMoveMetaReport.json',
    primary: '포챔스 move pool에 등장하는 기술명을 PokeAPI move detail과 매칭해 생성한 계산기용 메타',
    supplements: ['src/championsMovePools.json', 'src/championsMoveNameOverrides.json', 'src/championsMoveMetaNameAliases.json', 'src/championsMoveMetaOverrides.json', 'reports/pokeapiMoveDetailsCache.json'],
    caveat: '기본 타입/분류/위력/명중은 PokeAPI 기반 자동 생성이고, 다단히트·가변위력·예외 계산은 overrides로 보정한다.',
  },
  itemWhitelist: {
    sourceOfTruth: 'src/championsItems.ts',
    report: 'reports/championsItemWhitelistReport.json',
    primary: '포챔스 종별 사용률 페이지의 도구 통계를 시즌 단위로 집계한 일반 도구 화이트리스트',
    supplements: ['https://champs.pokedb.tokyo/pokemon/list', 'https://champs.pokedb.tokyo/guide/opendata', '메가스톤 제외 목록', '일부 아이템 sprite slug'],
    caveat: '현재는 종별 사용률 페이지(top slice) 집계 + 공개 opendata 보강의 합집합이다. 메가스톤은 종 고정 도구로 앱에서 별도 처리하며, `持ち物なし`는 빈 값으로 처리한다.',
  },
} as const
