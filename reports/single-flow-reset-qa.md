# 싱글 대면비교 흐름 재배치 QA

기준: `c103298a0417cead14bf9aa87c2117344e852c30`.
범위: `QuickDamagePanel`과 싱글 선택기, 공용 계산 화면의 표시 순서.
계산 엔진, 저장 엔트리 형식, 파티 분석표는 변경하지 않음.

## 변경
- 분리된 네 개 텍스트 링크 줄을 제거하고, 기록 편집은 각 선택기에 버튼형 네이티브 링크로 배치함.
- 상세 속도/대미지는 관련 결과에 배치하고 현재 `my`/`opp` 슬롯을 URL에 명시함.
- 선택 기술의 방향, 피해, HP, 기절 확률/미지원 이유를 기본 노출함. 16개 난수만 보조 접기로 유지함.
- 현재 피해 조건과 속도 성격·노력·랭크·스카프·활성 특성, 무효 이유를 접기 바깥에 표시함.
- 양측 실제 4기술 입력·피해 미리보기를 메타/능력치 편집기보다 먼저 배치함.
- 실제 `PokemonBuildFields`, `RegisteredMoveSlot`, 능력치 타일과 `EffortTuningModal`을 유지함.

## 실제 검증
- 전체 249/249 테스트, typecheck, production build, diff 검사 통과함.
- 같은 6대6 저장 fixture에서 스피드 139/138, 무릎차기 84–100, HP 201 확인함.
- 화상 42–50, 리베로 해제 56–67, 속도 +1랭크 208을 실제 조작으로 확인함.
- 조건을 닫아도 화상·속도 랭크가 보이고, A→B→A에서 조건/가정이 초기화됨.
- 공유 노력치 모달 Escape 닫기와 원래 능력치 타일로 초점 복귀 확인함.
- 슬롯 1/2 선택 시 상세 링크가 `my=1&opp=2`를 유지함.
- 독립 계산기에서 실제 검색 Enter 선택, 공수 교체, 새로고침 저장 복원을 확인함.
- 비교/독립 조작 뒤 저장 파티·상대·기술 원본이 동일함을 확인함.
- 1280/390/320px에서 양측 2×2 기술 입력, 8개 슬롯, 페이지 가로 넘침 없음 확인함.

## 동일 fixture의 첫 기술 위치 (문서 상단 기준 px)
- 1280px: 양쪽 793 → 750.
- 390px: 내 1170 → 1042, 상대 2284 → 1520.
- 320px: 내 1268 → 1221, 상대 2432 → 1749.
- 결과 요약은 기술 목록보다 먼저 노출됨. 양측 전체 기술이 한 뷰포트에 모두 들어간다는 의미는 아님.

## 근거
`/home/w8385/.hermes/artifacts/pokemon-champions/2026-10-17/single-flow-reset/`
- `final-tests.log`, `security-scan.json`
- `parent/public-baseline.json`, `parent/qa-fixture.json`
- `parent/local-layout.json`, `parent/local-interactions.json`
- `parent/shared-editor.json`, `parent/standalone.json`, `parent/local-{1280,390,320}.png`

## 한계
한글 폰트가 없는 headless 환경이므로 한글 글리프 품질은 인증하지 않음.
기존 bundle-size 경고는 남아 있음. 이 보고서의 로컬 검증은 배포 성공과 구분함.
