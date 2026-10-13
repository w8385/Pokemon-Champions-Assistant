# 간단 대미지 화면 QA

## 범위
- 독립 경로 `#/damage`, 홈 바로가기 및 도구/자료 메뉴.
- 기존 PokemonSearchField, PokemonCardHeading, PokemonStatGrid와 calcDamage 재사용.
- 파티·상대 엔트리와 분리된 `pokemon-champions-quick-damage:v1` 저장값.
- 공수 선택, 기술 선택, 성격·노력·실수치·도구·특성·전장 조건, 공수 교체.

## 실제 확인
- 전체 테스트 166개 통과, TypeScript·production build·diff check 통과.
- 독립 리뷰 최종 승인. 복원 null, 메가폼 도구, 공수 교체 후 숨겨진 잘못된 능력치, 지원 연속기 및 조건부 기술 필터 결함 수정 후 재검증.
- 빈 파티/상대 상태에서도 공수 포켓몬 선택 및 계산 가능, 기존 엔트리 변경 없음.
- 에이스번 공격184 → 한카리아스 HP201/방어161 무릎차기: 리베로 OFF56–67, ON84–100.
- 타입 무효0–0, HP0 검증 메시지, 교체 후 HP값 복구 시 계산 재개.
- 바디프레스: 공격측 방어150 입력 시28–34에서34–41로 변경.
- 스케일샷2타120–144 →5타300–360. 연속기 기절 확률은 표시하지 않음.
- 병상첨병·객기는 미지원 조건부 위력으로 제외, 섀도볼은 정상 선택 가능.
- 모바일390/320px 입력/결과 bounds 및 문서 가로 넘침 확인.
- 직접 링크·새로고침·홈 진입·같은 경로 메뉴 닫힘·키보드 Enter 확인.

## 근거 파일
`/home/w8385/.hermes/artifacts/pokemon-champions/quick-damage/`
- functional.json, parent-functional.json, review-fix-qa.json
- parent-final-mounted.json, variable-hits-qa.json, conditional-exclusion-qa.json
- parent-final-tests.log, quick-damage-desktop.png

## 제한
- 실제 게임 엔진 대조가 아닌 기존 계산 엔진 및 기존 교차 검증값과의 일치 확인.
- 조건부 위력 규칙이 미연결된 기술은 제외. 명중률/회복을 포함한 승률 계산은 아님.
- 연속기 대미지는 기존 엔진의 동일 난수 합산이며 실제 확률 분포로 주장하지 않음.
- 영어·일본어 기술명 메타데이터가 없는 항목은 원래 한국어 이름으로 표시.
- 기존 large-chunk 경고 및 concurrent Vite WebSocket 경고 잔존.
