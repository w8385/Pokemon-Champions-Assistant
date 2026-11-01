# 모듈 책임 지도 — 순수 피해 코어 절편

- `src/domain/battle/damageCore.ts`: 숫자·전달받은 기술 메타/보정값만 사용해 고정소수점 위력과 16개 피해 roll, min/max 및 HP 백분율 문자열을 계산한다. `calcDamage(attacker, defender, movePower, mode, stab, effectiveness, moveMeta, modifiers)` → 결과 또는 위력 없음일 때 `null`. 상성 0은 16개 0 roll이다. `chainMods`, `engineMovePower`, `DAMAGE_MOD_SCALE`도 기존 App의 표시 결정력/수치 계산에서 직접 사용한다.
- 의존 방향: `App.tsx` → `domain/battle/damageCore.ts` → `app/types.ts` **type-only** (`CalcMode`, `MoveMeta`). 보정 규칙을 만드는 `App.tsx`의 `resolveDamageModifiers` → 코어에 값 전달. 코어에서 App/React/데이터/저장으로 가는 런타임 의존은 없다.
- App에 남은 책임: move/ability/item 유효성, 기술 메타·상성·Mold Breaker/critical 확정, 스탯과 조건 투영, modifier 조립, KO 문구, Quick/Single/Double/Sample 호출 및 React UI/저장.
- 미진행: modifier 규칙, stat/eligibility, 저장 adapter, feature/UI 재배치와 데이터·producer 이동. 이 파일은 전체 리팩터 완료 선언이 아니다.
