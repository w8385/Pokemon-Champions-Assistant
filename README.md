# pokemon-champions-assistant-demo

실전 중 빠르게 스피드/선출/대면 판단을 보조하는 포케챔스용 데모입니다.

## 포함 기능

- 내 파티 / 상대 파티 상태 저장
- 최속 / 스카프 / 스피드 랭크 기반 선공 판정
- 내/상대 선출 3마리 체크
- 전체 스피드 순서 패널
- 타입 상성 힌트
- 간단 데미지 계산
- 샘플 기술 추적기 (코어/선택/유틸/확정 기술)
- 상태 JSON 내보내기 / 불러오기 / 초기화

## 데이터 소스 정책

- 구조화 기본축: **PokeAPI**
- 사람이 읽는 검증/보강: **PokemonDB**, **Serebii**
- 경쟁 샘플 / 실사용 기술 후보: **Smogon Dex**, **Pikalytics**

현재 MVP는 위 정책을 반영한 수동 큐레이션 샘플 데이터를 사용합니다.
전체 기술도감 노출 대신 샘플 추적에 필요한 후보군만 좁혀서 보여줍니다.

## 로컬 실행

```bash
npm ci
npm run dev
```

## 프로덕션 빌드

```bash
npm run build
npm run preview
```

## Docker 실행

```bash
docker compose up --build -d
```

기본 포트: `3002`

## 배포 메모

- 정적 산출물은 `dist/`
- nginx SPA fallback 설정 포함
- 브라우저 localStorage에 상태 저장
- 다른 기기로 옮길 때는 상단의 `상태 내보내기` 사용
