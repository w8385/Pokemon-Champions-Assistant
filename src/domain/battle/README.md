# Battle damage core

`damageCore.ts`가 App에서 이동한 고정소수점·정수 반올림·16-roll 피해 수식의 단일 구현이다. 전투 스탯, 기술 메타와 이미 확정된 보정값을 입력받으며 계산 불가 위력은 `null`, 면역은 0 roll을 반환한다. `BattleStatBlock`/`DamageCalcModifiers`의 타입 소유자이기도 하다. `CalcMode`/`MoveMeta`는 기존 canonical 타입을 type-only로 참조한다.

이 모듈은 보정값의 자격·출처, 치명타 확정, 타입/특성/아이템 규칙, 스탯 투영, 게임 데이터, KO 해석, UI 또는 저장의 권위가 아니다. 이것들은 현재 App 및 기존 모듈에 남아 있다. 독립 pinned reference fixture는 이 코어의 복제본이나 게임 자체 검증이 아니다.
