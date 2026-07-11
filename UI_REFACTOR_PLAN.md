# UI Refactor Plan

## Goal

Pokemon Champions Assistant를 단기 미봉이 아니라, 반복적으로 덜 시끄럽고 더 명확한 도구로 개편한다.

핵심 기준은 `killaislop.com`이 지적하는 문제를 반대로 적용하는 것이다.

- 한 화면에 모든 걸 올리지 않는다.
- 기본 상태에서 가장 중요한 흐름만 먼저 보여 준다.
- 장식보다 위계, 색보다 구조, 카드보다 정보 흐름을 우선한다.
- secondary 정보는 접거나 뒤로 미룬다.
- "있어 보이는 UI"보다 "바로 쓰이는 UI"를 만든다.

---

## Working Principles

1. **default path first**
   - 사용자가 가장 자주 하는 작업을 첫 화면/첫 상태에서 바로 시작할 수 있어야 한다.

2. **one screen, one job**
   - 한 화면은 한 가지 핵심 작업만 강하게 드러낸다.
   - 나머지는 접기, 탭 안쪽, 상세 패널로 보낸다.

3. **quiet chrome**
   - pill, glow, gradient, 과한 shadow, 과한 accent를 줄인다.
   - 탭/버튼/패널은 배경이 아니라 기능을 설명해야 한다.

4. **hierarchy by spacing**
   - 강조는 색 남발이 아니라 크기/간격/배치로 만든다.

5. **evidence over instinct**
   - 매 리뷰마다 실제 화면 하나 이상을 기준으로 본다.
   - `build`, screenshot, 또는 DOM inspection 없이 "좋아 보인다"로 끝내지 않는다.

---

## Current Read

### Already improved
- 홈을 전시형 카드 벽에서 라우팅 중심 구조로 정리함.
- 진입 경로를 배틀 준비 / 샘플 조정 / 도감 확인으로 분리함.
- 링크 영역을 장식형 버튼보다 텍스트 중심으로 정리함.
- 공용 크롬의 과한 gradient / pill 느낌을 일부 줄임.

### Still likely slop-heavy
- 내부 탭 크롬이 아직 많고 시선 경쟁이 큼.
- density 높은 계산 패널에서 카드/보더/배지의 수가 많음.
- 정보 우선순위보다 "모든 조절 가능성"이 먼저 드러나는 구간이 있음.
- 싱글/더블/샘플 각각의 화면 철학이 아직 완전히 통일되지 않았음.
- action / state / reference 정보가 한 덩어리로 붙는 구간이 남아 있음.

---

## Refactor Phases

## Phase 1 — Home and top-level navigation
**status:** in progress

### Done
- home hero 단순화
- workflow grouping 적용
- quieter top chrome 1차 적용

### Next
- header copy 더 짧게 줄이기
- 상단 탭 active/inactive 대비 더 절제하기
- home footer/reference 영역의 시각 weight 추가 축소

---

## Phase 2 — Single / Double workflow shells
**status:** in progress

### Review targets
- 싱글배틀 메뉴
- 더블배틀 메뉴
- section tabs / chips / flow navigation

### Done
- 싱글/더블 상단 탭을 단순 칩 나열 대신 **workflow step shell**로 변경함.
- 각 단계에 짧은 설명을 붙여 "무엇을 먼저 해야 하는지"를 바로 보이게 함.
- speed / damage 화면 상단에 짧은 usage summary를 추가해 계산 화면의 진입 문장을 정리함.
- damage calc에 input order / current context 박스를 추가해 계산 기준을 위쪽에서 먼저 읽게 함.

### Questions
- 첫 진입 시 사용자가 어디서 시작해야 하는지 명확한가?
- 탭이 "도구 분류"인지 "사용 순서"인지 섞여 있지 않은가?
- 지금 열려 있지 않은 기능이 시각적으로 너무 시끄럽지 않은가?

### Desired direction
- workflow 순서를 더 분명히 드러낸다.
- 상위 navigation과 하위 navigation의 시각 톤을 분리한다.
- 선택되지 않은 칩/탭은 더 조용하게 만든다.
- speed / damage 내부에서도 결과와 설정의 위계를 더 벌린다.

---

## Phase 3 — Dense calculator panels
**status:** pending

### Review targets
- speed calc
- damage calc
- opponent entry
- effort/stat editors

### Questions
- primary input / derived result / optional condition이 명확히 나뉘는가?
- 모든 control이 같은 무게로 보여서 피로하지 않은가?
- 수치 조절 UI가 실제 사용 빈도 대비 과하게 전면에 있지 않은가?

### Desired direction
- 계산 입력과 결과를 시각적으로 더 분리한다.
- 자주 안 쓰는 세부 조건은 접는다.
- badge/chip/button의 종류 수를 줄인다.
- "읽는 블록"과 "조작하는 블록"을 분리한다.

---

## Phase 4 — Visual system unification
**status:** pending

### Review targets
- color usage
- panel surfaces
- border radius
- shadow usage
- badge/chip/button taxonomy

### Desired direction
- accent color 역할을 축소한다.
- surface 단계를 2~3개 안으로 제한한다.
- radius 체계를 통일한다.
- component마다 다른 성격을 갖는 장식을 줄인다.

---

## Repeat Review Loop

매 리뷰 때 아래 순서로 본다.

1. **한 화면 선택**
   - 홈 / 싱글 / 더블 / 샘플 / 도감 중 하나

2. **핵심 작업 1개 정의**
   - 예: "상대 엔트리 넣고 speed 비교까지 가기"

3. **시선 경쟁 요소 기록**
   - 불필요하게 눈에 띄는 카드
   - active가 아닌데 존재감이 큰 탭
   - 접혀 있어야 할 옵션
   - 같은 weight로 보이는 primary/secondary 정보

4. **small diff 제안**
   - 한번에 갈아엎지 말고 1~3개 수정만 제안

5. **검증**
   - build
   - 가능하면 screenshot 또는 DOM 기준 확인

6. **문서 갱신**
   - 이 파일에 done / next를 갱신

---

## Review Rubric

각 화면 리뷰 시 아래 5점 척도로 메모한다.

- **clarity** — 지금 어디서 무엇을 해야 하는지 보이는가
- **focus** — 핵심 작업 외 요소가 덜 보이는가
- **density** — 정보가 과밀하지 않은가
- **consistency** — 다른 화면과 규칙이 맞는가
- **restraint** — 과장된 시각 장식이 줄었는가

짧게라도 점수를 남긴다.

Example:

- home: clarity 4 / focus 4 / density 3 / consistency 3 / restraint 4
- single speed calc: clarity 2 / focus 2 / density 1 / consistency 3 / restraint 2

---

## Immediate Next Pass Recommendation

다음 반복 리뷰는 **single damage calc 내부 control density**를 보는 게 좋다.

이유:
- 현재 가장 복잡하고 시선 경쟁이 심한 구간이다.
- workflow shell은 정리됐지만, 실제 입력 패널 안쪽은 아직 과밀하다.
- 여기서 정리된 규칙이 double planner / sample damage에도 재사용된다.
