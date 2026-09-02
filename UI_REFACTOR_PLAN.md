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

### Latest pass — single damage calc control density
- rubric: clarity 3 / focus 3 / density 2 / consistency 4 / restraint 4
- reviewed workflow: **내 기술 선택 → 상대 기준 확인 → 화력 조건 조정**
- changed:
  - 전장 조건을 기본 접힘 상태로 바꾸고, 현재 적용 중인 조건을 헤더 요약으로 먼저 보이게 함.
  - 공격측/방어측 카드의 비활성 상태를 더 조용하게 만들어 현재 선택된 면만 더 읽히게 함.
  - control surface의 gradient/glow를 줄이고, 화력/방어/전장 블록을 내부 section으로 나눠 읽기 순서를 더 분명히 함.
- note:
  - 아직 상대 기술 추가 / 사용률 상위 기술 strip은 같은 화면 안에서 시선 점유가 큼.

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

### Latest pass — single opponent entry move-add flow
- rubric: clarity 4 / focus 4 / density 3 / consistency 5 / restraint 4
- reviewed workflow: **상대 공개 기술 확인 → 상위 기술 참고 → 직접 추가**
- changed:
  - `공개 기술` 구간에 현재 등록 수 `0~4` 요약을 먼저 두어 현재 상태를 입력 폼보다 앞에서 읽게 함.
  - `사용률 상위 기술` 목록을 damage calc와 같은 접힘 `<details>` strip로 맞춰, 필요할 때만 펼치게 함.
  - 이미 공개 기술로 등록된 상위 기술 chip은 quieter confirmed 상태로 낮추고, 직접 추가 입력을 별도 entry block으로 분리해 다음 행동을 더 또렷하게 만듦.
- note:
  - single opponent entry와 single damage calc의 move-add 문법은 이제 거의 맞춰졌고, sample damage 쪽 비교 대상 기술 선택은 아직 별도 톤이 남아 있음.

### Latest pass — sample damage compare-target setup
- rubric: clarity 4 / focus 4 / density 4 / consistency 5 / restraint 4
- reviewed workflow: **비교 대상 추가 → 내 기술 선택 → 필요할 때만 상대 내구 미세조정**
- changed:
  - 비교 대상 추가 카드 상단에 `샘플 기술 n/4` / `비교 포켓몬 n` 요약을 먼저 두고, 등록 기술이 없을 때는 `샘플 기술로 이동` CTA를 바로 붙여 선행 작업을 숨기지 않음.
  - 비교 대상 카드의 수동 내구 EV 조절을 기본 접힘 `<details>`로 내려서, 기본 흐름에서는 기술 선택과 프리셋 확인이 먼저 읽히게 함.
  - 접힌 내구 조절 summary에 현재 프리셋과 `체력/방어/특수방어` EV 값을 같이 보여 줘서 펼치지 않아도 현재 가정을 확인할 수 있게 함.
- note:
  - sample damage의 진입 문법은 이제 single opponent entry / damage calc와 더 가까워졌지만, 결과 배지 수와 상단 조건 패널 weight는 아직 조금 큰 편임.

### Latest pass — sample damage result card metric hierarchy
- rubric: clarity 4 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **비교 대상 확인 → 선택 기술 기준 읽기 → 판정/실대미지 확인**
- changed:
  - `선택 기술 / 공격 수치 / 상대 실수치`를 pill 나열 대신 **조용한 context card**로 바꿔, 결과를 읽기 전에 기준 정보부터 한 블록으로 확인하게 함.
  - `판정 / 실대미지 / 체력비율` metric box의 gradient와 강조색을 줄여 verdict만 남기고 나머지 수치는 같은 톤으로 정리함.
  - 모바일에서도 context grid가 한 줄씩 내려가도록 맞춰, 결과 카드가 좁은 폭에서 덜 끊겨 읽히게 함.
- note:
  - sample damage 결과 카드의 상단 badge 경쟁은 많이 줄었지만, 화면 최상단 조건 요약 패널은 아직 약간 넓고 존재감이 큰 편이다.

### Latest pass — sample damage top condition summary weight
- rubric: clarity 4 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **비교 대상 추가 전 현재 가정 확인 → 필요할 때만 세부 조건 펼치기**
- changed:
  - 상단 `세부 조건` 바로 아래에 **화력 조건 / 전장 조건 요약 strip**을 추가해, 펼치지 않아도 현재 가정을 badge로 먼저 읽게 함.
  - 활성 조건이 없을 때는 각 구간을 `기본` badge 하나로 정리해 빈 박스처럼 보이지 않게 하고, 비기본 상태만 자연스럽게 드러나게 함.
  - sample damage 상단 패널과 비교 대상 추가 카드의 gradient/shadow/padding을 줄여 상단 chrome 존재감을 낮춤.
- note:
  - 상단은 훨씬 조용해졌지만, 비교 대상 카드 내부의 `기술 구성 / 내구 프리셋 / 세부 내구 조절` control 묶음은 아직 한 덩어리로 보여 다음 밀도 정리 후보로 남아 있다.

### Latest pass — sample damage compare-target control column density
- rubric: clarity 5 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **비교 대상 선택 후 내 기술 결정 → 상대 내구 가정 확인 → 필요할 때만 세부 조절**
- changed:
  - 좌측 control column 상단에 `기술 구성 / 상대 내구 프리셋` 현재값 요약 strip을 추가해, select를 읽기 전에 지금 비교 기준이 무엇인지 먼저 확인하게 함.
  - `기술 구성(+위력 조건)`과 `상대 내구 프리셋(+세부 내구 조절)`을 별도 section surface로 분리해, 순서는 유지하면서도 한 덩어리 control wall처럼 보이던 밀도를 낮춤.
  - variable-power hint를 기존 calc box보다 더 조용한 inline hint로 낮춰서, 필요한 기술에서만 보조 설명 역할을 하게 함.
- note:
  - 비교 대상 카드 내부 흐름은 많이 또렷해졌지만, 결과 영역에서 `판정 / 실대미지 / 체력비율` 아래 추가 설명이 길어질 때 카드 높이 차가 커지는 편이다.

### Latest pass — sample damage result metric card vertical rhythm
- rubric: clarity 5 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **비교 대상 확인 → 판정 읽기 → 실대미지/체력비율 비교**
- changed:
  - `판정` 문구를 `주 결과 / 보조 정보` 2줄 구조로 나눠, `난수 n타 · xx%` 같은 긴 verdict가 한 줄에서 카드 높이를 흔들지 않게 함.
  - `실대미지 / 체력비율` 카드에 조용한 helper line을 넣어 각각 `총위력(or 위력)` / `상대 체력` 기준을 같은 위치에서 읽게 하고, 값 길이가 달라도 세로 리듬이 유지되게 함.
  - verdict tone을 guaranteed / possible만 약하게 분기하고, metric box 최소 높이를 맞춰 결과 카드들 높이 차를 줄임.
- note:
  - 결과 카드 리듬은 안정됐지만, unavailable 상태와 정상 계산 상태의 레이아웃 문법은 아직 완전히 같지 않다.

### Latest pass — sample damage empty / unavailable state grammar
- rubric: clarity 5 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **비교 대상이 없을 때 현재 상태 확인 → 비교 대상 추가 → 계산 불가 상태 해석**
- changed:
  - `비교 포켓몬` empty 상태를 단순 한 줄 문구 대신 **상태 설명 + 현재 카운트 badge + 필요 시 CTA**가 있는 조용한 empty card로 바꿔, 왜 비어 있는지와 다음 행동을 같은 문법으로 읽게 함.
  - sample damage 결과의 unavailable 상태도 정상 계산과 같은 **verdict / damage / percent 3칸 구조**를 유지하도록 바꿔, 상태 전환 때 카드 높이와 정보 위치가 덜 흔들리게 함.
  - unavailable metric tone을 별도 보조 surface로 낮춰 `대미지 계산 불가`가 보이더라도 화면 전체가 과하게 경고처럼 보이지 않게 정리함.
- note:
  - sample damage의 empty/unavailable 문법은 많이 정리됐고, 남은 후보는 상단 `비교 포켓몬 추가` 블록과 아래 결과 리스트 사이의 시각 weight 차이다.

### Latest pass — sample damage compare-adder vs result list weight balance
- rubric: clarity 5 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **샘플 기술 확인 → 비교 포켓몬 추가 → 아래 결과 리스트 읽기**
- changed:
  - `비교 포켓몬 추가` 헤더를 badge wall 대신 **현재 상태 strip + 짧은 안내 문장** 구조로 바꿔, 검색창보다 앞에서 필요한 기준만 먼저 읽히게 함.
  - `샘플 기술 n/4 / 비교 포켓몬 n` count를 항상 같은 자리의 quieter badge로 고정해, 결과가 0일 때도 상태는 보이되 존재감은 낮추도록 정리함.
  - adder block의 padding / border / shadow를 한 단계 낮추고, `샘플 기술로 이동` CTA를 별도 얇은 row로 분리해 아래 결과 리스트와 시각 weight 차를 줄임.
- note:
  - compare-adder의 시작 톤은 많이 차분해졌고, 다음 후보는 비교 대상 카드 상단 hero와 결과 metric grid 사이의 대비를 조금 더 벌리는 일이다.

## Immediate Next Pass Recommendation

다음 반복 리뷰는 **sample speed result card hierarchy**를 보는 게 좋다.

이유:
- sample damage 카드 내부의 식별 영역과 결과 영역은 이번 패스로 충분히 분리됐다.
- 같은 sample workflow 안에서 speed 결과 카드는 아직 gradient와 상태 badge가 상대적으로 강해, damage 화면과 restraint 수준을 맞출 여지가 있다.
- 다음에는 speed 결과의 `상대 확인 → 선후공 판정 → 속도선 비교` 한 흐름만 보고 작은 diff를 고르는 편이 좋다.

### Latest pass — sample damage compare card hero vs metric contrast
- rubric: clarity 5 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **비교 포켓몬 식별 → 조건 확인 → 판정/대미지 결과 읽기**
- changed:
  - 비교 카드 hero 아래에 조용한 divider를 두고 sprite 크기와 drop shadow를 줄여, 포켓몬 식별부가 결과보다 먼저 튀지 않게 함.
  - metric grid 시작점에 간격과 divider를 추가해 control/context 영역에서 실제 계산 결과로 넘어가는 경계를 분명히 함.
  - 기본 verdict surface에만 약한 blue tint를 주고 guaranteed/possible 상태색은 그대로 유지해, 정상 결과에서도 첫 시선이 판정에 닿게 함.
- note:
  - sample damage 비교 카드의 내부 위계는 안정됐다. 다음 후보는 같은 workflow의 sample speed 결과 카드에서 강한 gradient/badge를 줄이는 일이다.

### Latest pass — sample speed result card hierarchy
- rubric: clarity 5 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **상대 기준 확인 → 선후공 판정 → 동속/추월 속도선 확인**
- changed:
  - 결과를 badge 나열 대신 `기준/현재 속도 → 선후공 판정 → 필요 EV` 순서로 재배치해 첫 시선이 판정에 닿게 함.
  - ahead/tie/behind 상태 badge를 텍스트 verdict로 바꾸고 카드 색은 약한 tint로 낮춰, 결과 카드 여러 개가 나란히 나와도 색 경쟁이 줄게 함.
  - `동속컷 / 추월컷`을 하단의 고정된 2열 meta row로 묶어 속도선 비교 위치를 카드마다 맞춤.
- note:
  - sample speed 결과는 damage 결과와 비슷한 restraint 수준으로 맞춰졌다. 다음 후보는 speed 화면의 `기준 빌드 / 내 스피드 랭크`가 차지하는 상단 높이와 요약 badge 밀도다.

## Immediate Next Pass Recommendation

다음 반복 리뷰는 **sample speed compare-target entry / empty state**를 보는 게 좋다.

이유:
- 상단 기준 빌드와 결과 카드의 위계는 이번 패스로 충분히 정리됐다.
- 비교 포켓몬 검색은 아직 label + input만 있고, 대상이 없을 때도 단순 한 줄 empty 문구만 보여 damage workflow와 상태 문법이 다르다.
- 다음에는 `대상 없음 → 검색 → 첫 결과 확인` 흐름만 맞추는 편이 좋다.

### Latest pass — sample speed top build summary density
- rubric: clarity 5 / focus 5 / density 5 / consistency 5 / restraint 5
- reviewed workflow: **현재 빌드 확인 → 스피드 노력치 조정 → 랭크 설정**
- changed:
  - 기준 빌드 하단의 성격/실수치/특성/도구 pill 묶음을 조용한 3열 summary row로 바꿔 상단 badge 경쟁을 줄임.
  - 노력치 카드에 이미 표시되는 `실수치 스피드` 중복 badge를 제거해 같은 값이 두 번 읽히지 않게 함.
  - 모바일에서는 summary를 한 열로 내려 긴 특성/도구명도 기준 빌드 안에서 안정적으로 읽히게 함.
- note:
  - 상단 흐름은 간결해졌고, 다음 후보는 speed 비교 대상 검색과 empty state를 damage 화면 문법에 맞추는 일이다.

### Latest pass — sample speed compare-target entry / empty state
- rubric: clarity 5 / focus 5 / density 5 / consistency 5 / restraint 5
- reviewed workflow: **비교 대상 없음 확인 → 포켓몬 검색 → 첫 결과 확인**
- changed:
  - 비교 대상 검색 블록에 현재 대상 수와 짧은 안내를 검색창 앞에 두어, 검색 후 어디에 결과가 나오는지 먼저 읽히게 함.
  - 대상이 없을 때의 단순 한 줄 문구를 **상태 제목 / 다음 행동 안내 / 0 count** 구조로 바꿔, sample damage empty state와 같은 문법으로 맞춤.
  - 기존 quiet surface와 count badge를 재사용해 새로운 장식 유형을 추가하지 않음.
- note:
  - sample speed의 entry/empty 상태는 damage workflow와 통일됐다. 다음 후보는 결과 카드 좌측의 `랭크` 조작부가 카드별로 만드는 세로 공간을 줄일지 검토하는 일이다.

## Immediate Next Pass Recommendation

다음 반복 리뷰는 **sample speed result card mobile scan order**를 보는 게 좋다.

이유:
- 상대 랭크 조작은 별도 side panel에서 hero 아래의 얇은 row로 이동해 데스크톱 가로 낭비가 줄었다.
- 모바일에서는 `상대 확인 → 랭크 → 2개 결과` 순서가 자연스러운지 실제 좁은 폭에서 한 번 더 확인할 가치가 있다.
- 다음에는 코드 변경을 전제로 하지 말고, 2열 결과가 좁은 폭에서도 비교 가능한지만 먼저 검토하는 편이 좋다.

### Latest pass — sample speed result card rank control placement
- rubric: clarity 5 / focus 5 / density 5 / consistency 5 / restraint 5
- reviewed workflow: **상대 확인 → 상대 랭크 조정 → 선후공 판정 확인**
- changed:
  - 카드 좌측에서 별도 열 전체를 차지하던 단일 `랭크` select를 포켓몬 hero 바로 아래의 얇은 inline row로 이동함.
  - 결과 본문을 전체 너비로 확장해 선후공 판정과 속도선 비교가 카드의 주 작업으로 더 크게 읽히게 함.
  - 기존 select와 quiet surface 문법을 유지해 새 badge나 장식 유형은 추가하지 않음.
- note:
  - 데스크톱의 불필요한 빈 side panel은 제거됐다. 다음 후보는 모바일에서 hero / rank / 2열 결과의 실제 스캔 순서 확인이다.

### Latest pass — sample speed result card mobile scan order
- rubric: clarity 5 / focus 5 / density 5 / consistency 5 / restraint 5
- reviewed workflow: **모바일에서 상대 확인 → 상대 랭크 조정 → 기본/조건 결과 비교**
- findings:
  - DOM 순서가 hero → rank row → result grid로 이미 작업 순서와 일치한다.
  - 960px 이하에서는 두 결과를 2열로 유지하고, 640px 이하에서는 1열로 전환해 좁은 폭에서 카드 내부 텍스트가 눌리지 않는다.
  - 각 결과 카드 안의 `기준/현재 속도 → 판정 → 동속컷/추월컷` 순서도 유지되어 별도 모바일 전용 재배치가 필요하지 않다.
- changed:
  - 코드 변경 없음. 현재 반응형 규칙이 rubric을 충족해 추가 breakpoint나 장식 유형을 만들지 않았다.
- note:
  - 다음 후보는 sample workflow를 벗어나 **single speed calc의 입력/결과 위계**를 확인해, sample speed에서 정리한 문법을 싱글 계산 화면에도 적용할지 검토하는 일이다.

## Immediate Next Pass Recommendation

다음 반복 리뷰는 **single speed calc input / result hierarchy**를 보는 게 좋다.

이유:
- sample speed의 진입, empty state, 결과 카드, 모바일 스캔 순서는 이번 검토까지 안정됐다.
- Phase 3의 핵심 질문인 primary input / derived result 분리는 single speed calc에서 다시 점검할 가치가 있다.
- 다음에는 `내 슬롯 선택 → 상대 기준 선택 → 선후공 결과 확인` 한 흐름만 보고 설정이 결과보다 강하게 보이는 지점을 찾는 편이 좋다.

### Latest pass — single damage display / input separation
- rubric: clarity 5 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **기술 선택 → 자동 계산 기준 확인 → 상황 조건 입력 → 난수 범위 확인**
- changed:
  - 수동 분류·수동 위력 fallback과 위력 프리셋을 제거하고, 기술 데이터가 없으면 임의 계산 대신 계산 불가 상태를 사용함.
  - 타입·분류·위력·특성·자속·상성을 읽기 전용 fact panel로 분리하고, 랭크·급소·화상·기술 고유 조건만 입력 영역에 남김.
  - 메가폼 선택 시 메가폼의 기본 특성을 명시적으로 다시 해석하고, 실제 적용된 특성/전장 보정을 결과 아래에 표시함.
  - 파티 포켓몬 선택 후 다음 빈 슬롯 검색창으로 자동 포커스 이동하도록 입력 흐름을 단축함.
  - 비홈 화면에서 특성 설명 데이터를 로드해 파티·상대·계산기 툴팁에 효과 문구가 빠지지 않게 함.
- verification:
  - typecheck / ability damage harness / damage parity harness / production build 통과.
  - 브라우저 기반 visual harness는 실행 환경에 Chromium이 없어 정적 반응형 규칙과 build로 우선 검증함.
- next:
  - ability damage harness가 분류한 미반영 대미지 관련 특성을 상황 입력 필요 여부에 따라 순차 보완한다.

### Latest pass — single damage four-move range comparison
- rubric: clarity 5 / focus 5 / density 4 / consistency 5 / restraint 5
- reviewed workflow: **현재 대면 확인 → 등록 기술 4개 난수 비교 → 상세 조건 조정**
- changed:
  - 현재 공격측의 등록 기술을 각각 독립 계산해 최소~최대 HP 비율, 실대미지, KO 판정을 기술 선택 카드 안에 바로 표시함.
  - 선택 카드와 기존 상세 결과가 같은 계산 조건을 공유하게 해 기술 전환 시 결과를 다시 찾는 이동을 줄임.
  - 데스크톱과 모바일 모두 2열 비교를 유지하고 긴 기술명과 수치가 카드 밖으로 넘치지 않게 컴포넌트 규칙을 추가함.
- verification:
  - typecheck / ability damage harness / damage parity harness / production build 통과.
- next:
  - 선택 결과 위에 남은 중복 상세 요약의 필요성을 줄이고, 방어측 EV·전장 조건을 하나의 접힌 세부 조건 영역으로 합친다.

### Follow-up — single damage result density and card correction
- changed:
  - 기술 카드에 기존 타입별 pill/gradient 스타일이 과하게 상속되던 문제를 제거하고, 동일한 중성 surface + 타입색 왼쪽 선 구조로 교체함.
  - 기술 카드와 같은 내용을 반복하던 상단 단일 결과 박스를 제거함.
  - 화력 조건은 바로 유지하고, 방어측 EV와 전장 조건은 하나의 `세부 조건` 토글 아래로 통합함.
  - 선택 기술의 타입·분류·위력과 실제 적용 보정은 조작부가 아닌 읽기 전용 패널에 유지함.
- next:
  - 실제 사용 피드백 기준으로 기술 카드 높이와 모바일 2열 가독성을 재확인한다.

### Data/UI correction — held item identity
- changed:
  - 랭킹 사이트의 item key를 PokéAPI ID로 오인해 70개 도구의 이름과 sprite가 서로 밀리던 생성 오류를 수정함.
  - 일본어 공식명 exact match를 기준으로 한국어·영문 표기와 sprite slug를 전수 복구함.
  - 구애스카프 판정을 표시 문자열이 아닌 canonical item key로 바꿔 스피드 1.5배가 적용되게 함.
  - 현재 실속도뿐 아니라 추월컷 역산에도 실제 장착 아이템을 전달해 스카프 기준을 통일함.
  - 모든 허용 도구에 이름과 실제 sprite 파일이 있는지 검사하는 harness를 추가함.
  - 후속 감사에서 신규 메가를 포함한 76종 중 39종의 메가스톤 아이콘 매핑이 빠진 것을 확인해 전수 보완함.
  - harness 범위를 일반 도구 70개뿐 아니라 메가스톤 76개까지 확장함.
