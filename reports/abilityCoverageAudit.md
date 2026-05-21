# Ability Coverage Audit

기준 시점: 2026-05-21
관련 커밋: `eb3162a` (`fix: apply scrappy in damage effectiveness`)

## 요약

- 대미지 계산 로직에서 직접 참조되는 특성: **55개**
- 단, 이 숫자는 `resolveDamageModifiers` / `resolveStabMultiplier` / `resolveAbilityAdjustedMoveMeta` 중심 집계라서
  실제 반영 범위를 **과소평가**합니다.
- 예: `배짱`, `기분파`, `의태`, `쓱쓱`, `엽록소` 등은 다른 경로에서 반영됩니다.

## 1) 대미지 계산에 직접 반영되는 핵심 특성

### 공격측 화력/위력/배수
- `huge-power` / `pure-power` — 천하장사 / 순수한힘
- `guts` — 근성
- `adaptability` — 적응력
- `technician` — 테크니션
- `tinted-lens` — 색안경
- `hustle` — 의욕
- `iron-fist` — 철주먹
- `reckless` — 무모함
- `sheer-force` — 우격다짐
- `strong-jaw` — 강한턱
- `mega-launcher` — 메가런처
- `sharpness` — 예리함
- `tough-claws` — 단단한발톱
- `water-bubble` — 수포
- `dragons-maw` — 용의턱
- `transistor` — 트랜지스터
- `steelworker` / `steely-spirit` — 강철술사 / 강철의마음
- `sand-force` — 모래의힘
- `solar-power` — 선파워
- `sniper` — 스나이퍼
- `neuroforce` — 브레인포스
- `analytic` — 애널라이즈
- `supreme-overlord` — 대장군
- `rivalry` — 투쟁심
- `parental-bond` — 부자유친
- `plus` / `minus` — 플러스 / 마이너스 (더블 특수 화력)
- `merciless` — 무자비

### 타입/자속/상성 관련
- `protean` / `libero` / `변환자재`
- `aerilate` / `pixilate` / `refrigerate` / `dragonize`
- `liquid-voice`
- `fairy-aura`
- `dark-aura`
- `scrappy` — 배짱 (`노말` / `격투` → `고스트` 무효 관통) ✅

### 방어측 감쇠/무효/내구 배수
- `levitate` — 부유
- `water-absorb` / `storm-drain` / `dry-skin`
- `flash-fire`
- `volt-absorb` / `lightning-rod` / `motor-drive`
- `sap-sipper`
- `earth-eater`
- `soundproof`
- `thick-fat`
- `heatproof`
- `purifying-salt`
- `filter` / `solid-rock` / `prism-armor`
- `fur-coat`
- `marvel-scale`
- `multiscale` / `shadow-shield`
- `ice-scales`
- `disguise` — 탈
- `tablets-of-ruin` / `vessel-of-ruin`
- `sword-of-ruin` / `beads-of-ruin`

## 2) UI 토글/상태 입력과 함께 반영되는 특성

아래 특성들은 계산식 자체는 들어가 있지만, 조건을 사용자가 켜줘야 정확하게 반영됩니다.

### 공격측 조건 토글
- `blaze` / `torrent` / `overgrow` / `swarm`
  - 공격측 HP 1/3 이하 토글 필요
- `merciless`
  - 상대 독/맹독 토글 필요
- `analytic`
  - 상대보다 늦게 행동 토글 필요
- `supreme-overlord`
  - 기절한 아군 수 입력 필요
- `rivalry`
  - 성별 관계 선택 필요
- `parental-bond`
  - 발동 토글 필요
- `electromorphosis`
  - 차지됨 토글 필요

### 방어측 조건 토글
- `marvel-scale`
  - 방어측 상태이상 토글 필요
- `multiscale` / `shadow-shield`
  - HP 만땅 토글 필요
- `disguise`
  - 탈 intact 토글 필요

### 더블 전용 수동 상태
- `friend-guard`
  - 더블 플래너에서 수동 체크박스로 반영
  - 특성 선택만으로 자동 ON 되는 구조는 아님

## 3) 속도 계산 / 행동순 쪽에 반영되는 특성

### 속도 배수/상승 반영
- `swift-swim`
- `sand-rush`
- `chlorophyll`
- `slush-rush`
- `surge-surfer`
- `unburden`
- `quick-feet`
- `speed-boost`
- `weak-armor`
- `motor-drive`

즉, 위 특성들은 **대미지식이 아니라 스피드/행동순 로직**에서 다뤄집니다.

## 4) 타입 변화 / 상태 변화 쪽에 별도 반영되는 특성

- `forecast` — 기분파
- `mimicry` — 의태

둘 다 `resolveAbilityAdjustedTypes(...)` 경로에서 타입 자체를 바꿉니다.
따라서 하네스 숫자만 보면 누락처럼 보이지만, 실제로는 계산에 들어갑니다.

## 5) 아직 자동 반영이 약한 / 후속 정리가 필요한 특성

### 날씨/필드 자동 전개형
현재는 전장 토글을 사용자가 직접 켜는 흐름이 중심입니다.
아래 특성은 **특성 선택만으로 날씨/필드를 자동 세팅하지는 않음**:

- `drought`
- `drizzle`
- `sand-stream`
- `snow-warning`
- `sand-spit`

### 전투 영향은 있지만 현재 계산기 자동화가 약한 후보
실전 영향이 있는 편이라 후속 검토 우선순위가 있습니다.

- `gale-wings`
  - HP 만땅일 때 비행 기술 우선도 보정
- `super-luck`
  - 급소율 관련
- `quick-draw`
  - 선공 확률 관련
- `stance-change`
  - 폼 변경 기반 스탯 반영 여부 점검 필요
- `berserk`
  - 피격 후 특공 상승 연계

## 6) 결론

### 이미 잘 반영된 쪽
- `천하장사`
- `순수한힘`
- `근성`
- `적응력`
- `테크니션`
- `색안경`
- `배짱`
- `멀티스케일`
- `부유`
- `퍼코트`
- `필터`
등 실전 핵심은 대부분 들어가 있습니다.

### 아직 부족한 쪽
- 날씨/필드 자동 전개형 특성
- 일부 더블 전용 시너지 특성
- 우선도/급소/폼변화 계열 특성

## 추천 후속 작업

1. `drought / drizzle / sand-stream / snow-warning` 자동 전장 반영
2. `gale-wings` 우선도 처리 반영
3. `super-luck` 급소율 보정 처리 여부 결정
4. 하네스를 `damage-only` / `speed-only` / `field-auto`로 분리해서 오탐 줄이기
