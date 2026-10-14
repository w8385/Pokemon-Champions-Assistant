# 통합 싱글 UX QA

## 범위
- 싱글 기본 경로에서 내/상대 6슬롯 선택, 스피드와 양방향 4기술 비교 동시 표시.
- 독립 대미지와 같은 QuickDamagePanel, RegisteredMoveSlot, EffortTuningModal 사용.
- 전체 엔트리 편집은 접힌 상태. 기존 speed/power/pick 경로 유지.
- 상단 직접 링크, 공용 검색 Enter, 샘플 검색/직접 링크/현지화 결함 수정 포함.

## 부모 검증
- 최종 전체 테스트 199/199, typecheck, production build, diff check 통과.
- 실제 저장 fixture: 한국어 리베로를 canonical libero로 선택, 원본 표기 유지.
- 에이스번 공격184, 한카리아스HP201·방어161: 리베로 ON 무릎차기84–100, OFF56–67. 16개 난수 확인.
- 상대 특방 성격1.1의 특방115 표시, 모달 전체 성격을 용감으로 변경하면 속도138→124 및 내구·피해가 함께 재계산. 원래 엔트리는 그대로 유지.
- 속도−10% 가정: stat tile와 노력 모달의 실수치125 일치, −1랭크의 최종 속도83, 선택기·설명·비교 일치. 저장된 속도 단계/가정/부분 성격 보정은 새로고침 뒤 유지.
- 두 포켓몬만 등록한 상태에서도 계산됨. 빈 슬롯은 정상 결과를 남기지 않음. 슬롯 복귀 시 등록 기술 피해 복구.
- 내 슬롯 전환 시 상대 유지, 비교 수정 전후 파티·상대 기록 및 독립 quick 저장소 불변 확인.
- 12개 엔트리 버튼, 양쪽 기술 입력·결과, 상단 링크의390/320px 경계 확인. 기존 speed/power/pick 직접 링크 실제 내용 확인.

## 추가 마운트 QA
- 물리/특수 공격 및 물리/특수 내구 랭크 각각 독립 적용 확인.
- 바디프레스와 속임수의 참조 능력/랭크 확인.
- 화상·맹화 저체력·멀티스케일 만피·장막은 소유 쪽과 해당 방향에만 영향. 공수 교체·새로고침 후 조건 소유 유지.
- 쓱쓱98→196(비), 속보150→225(독), 발동 전제 미충족 안내 및 양쪽 발동 가정 교체 확인.
- 원래 파티 노력 모달의6스탯/매직넘버 목표·게이지/±1/최소·최대/키보드·포인터/총66 제한 확인.
- 공유 모달의 포커스 진입/Tab 양방향 순환/Escape/복귀, 기술 입력의 포커스·플로팅 툴팁·계산 스타일 확인.
- 샘플 정확한 이름·폼·Enter와 저장탭builder 상태의 상세 직접 URL·새로고침 확인.

## 근거
`/home/w8385/.hermes/artifacts/pokemon-champions/2026-10-14/unified-single/`
- parent-final-tests.log
- parent-entry-core.json
- parent-final-nature-qa.json
- parent-final-core-qa.json
- parent-final-restore-qa.json
- parent-final-speed-consistency.json
- new-fixes/actual-mounted.json, conditional-mounted.json, swap-activation.json, mobile-bounds.json
- baseline-mounted/live-observations.json
- reports/unified-single/advanced-qa/expected-actual.json (추가 QA 기록)

## 한계
- 실제 게임 엔진 대조가 아닌 기존 검증된 앱 계산 함수와 저장 fixture 기준 검증.
- 미지원 조건부 위력은 계산하지 않음. 연속기 동일 난수 합산은 실제 기절 확률로 표시하지 않음.
- 일부 언어 기술·도구명 메타데이터가 없으면 원본 표기를 유지. 번역을 임의 생성하지 않음.
- 헤드리스 스크린샷의 CJK glyph boxes로 한국어/일본어 글꼴의 실제 가독성은 미확인. DOM 내용과 경계는 확인.
- 콘솔 초기 이력 및 모든 브라우저/모든 포켓몬 조합을 전수 검증하지 않음.
- 기존 large-chunk 빌드 경고 유지. 기능 완료를 성능 최적화 완료로 주장하지 않음.

최종 독립 검토와 공개 배포 검증은 별도 릴리스 기록으로 보존함.
