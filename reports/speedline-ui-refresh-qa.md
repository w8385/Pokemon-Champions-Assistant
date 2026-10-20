# 스피드라인 UI 교정 QA

검증일: 2026-10-20. 배포 전 로컬 최종 소스 기준.

## 범위

- 실전 불가능/미검증 조합 보기 옵션 삭제, 목록에서 항상 제외.
- 과거 URL의 불가능 투자 대상은 수치를 숨기고 이유와 명시적 복구 동작 제공.
- 구애스카프 적용과 특성 효과를 독립된 주요 필터로 표현.
- 기준 속도·검색·주요 필터를 앞에 배치. 부가 설정과 계산 전제는 접을 수 있게 정리.
- 기존 엔진, URL 값, 저장 형식 변경 없음.

## 실제 검증

- 전체 400개 테스트 통과, 타입 검사·빌드·diff 검사 통과. 기존 대형 청크 경고 유지.
- 독립 검토에서 빈 refAbility=를 정상 특성 없음으로 표시하는 요약 오류를 발견해 수정함. KO/EN/JA 렌더러 회귀 및 실제 구 URL의 오류 문구·해제 후 정상 표시·URL 제거를 확인함.
- 테스트 명령은 `node --test tests/*.test.mjs`. `npm test` 스크립트는 없으며 최초 잘못된 호출 뒤 실제 명령으로 전체 실행함.
- 이상해꽃 노력32/상승 성격, 스카프3종×특성2종의 여섯 조건에서 행 식별자·정렬·수치 모두 공개 기준선과 일치.
- 기본145, 스카프217, 엽록소290, 스카프+엽록소435 유지.
- Mega리자몽X+스카프, Z메가루카리오+스카프, 루차불 곡예+스카프, 한카리아스+엽록소의 오래된 URL에서 경고·계산 차단·복구 버튼 실제 클릭 확인. 파티 JSON 불변.
- 스카프 변경이 특성 필터를 바꾸지 않으며 반대 방향도 동일함.
- 행 클릭 투자 계산 열기, 노력33 오류 시 목록과 기준 수치 숨김,32 수정 후 복구 확인.
- 최종1280/390px에서 체크박스0, 주요 필터 표시, 문서 가로 넘침 없음.
- 기본390px 목록 시작점847.42→752.16px.1280px526.94→505.64px.
- 선택 기준 이상해꽃 상태390px 목록 시작826.75px. 기본 상태와 구분함.
- 기준 카드 버튼3개는 같은 행에 높이44px. 실제 휴대폰 터치 검증은 아님.
- headless 환경에 한글 글꼴이 없어 스크린샷은 글자 사각형으로 표시됨. DOM 문구·위치·크기는 확인했으나 한글 타이포 육안 품질은 미검증.
- 각 브라우저 배치의 원본 localStorage를 동일 출처 정적 SVG에서 정확히 복구·읽기 검증 후 about:blank로 이탈함.

## 증거

`/home/w8385/.hermes/artifacts/pokemon-champions/speedline-condition-labels/`

- `baseline-numeric-combinations.json`, `layout-baseline.json`
- `browser/final-layout-and-numeric.json`
- `browser/invalid-target-repair.json`, `browser/controls-and-investment.json`
- `final/tests.log`, `final/typecheck.log`, `final/build.log`, `final/diff.log`
- `final/source-freeze.json`, `final/security-scan.json`

독립 검토·commit·push・공개 배포 확인은 별도 릴리스 증거로 기록함.
