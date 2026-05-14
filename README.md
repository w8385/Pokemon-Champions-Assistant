# Pokemon-Champions-Assistant

실전 중 빠르게 스피드/상대 엔트리/대면 판단을 보조하는 포켓몬 챔피언스용 정적 웹앱입니다.

## 포함 기능

- 내 파티 관리
- 상대 엔트리 관리
- 스피드 & 결정력 계산
- 단일 포켓몬 샘플 깎기
- 성격 25종 / 도구 / 능력 포인트(66) 관리
- 샘플 기술 추적
- 상태 JSON 내보내기 / 불러오기 / 초기화

## 데이터 소스 정책

- 구조화 기본축: **PokeAPI**
- 사람이 읽는 검증/보강: **PokemonDB**, **Serebii**
- 경쟁 샘플 / 실사용 기술 후보: **Smogon Dex**, **Pikalytics**

### 현재 전체 가용기술 검색의 실제 출처

- 앱이 기술 검색에 직접 쓰는 소스 오브 트루스는 **`src/pokemonMovePools.json`** 입니다.
- 이 파일은 현재 **PokeAPI 기반 본가 기술풀을 로컬에 임베드한 데이터**입니다.
- 여기에 포켓몬 챔피언스 기준으로 확인된 누락/예외를 **수동 보정**하고 있습니다.
  - 예: 메가/폼 병합, 명백한 누락 기술 추가
- 검증에 참고하는 소스:
  - **champs.pokedb.tokyo**
  - **PokemonDB**
  - **Serebii**

즉, 현재의 `가용 기술` 검색은 **포켓몬 챔피언스 전용 확정 화이트리스트 100% 완료본이 아니라**,
**PokeAPI 기반 기술풀 + 챔피언스 수동 검증/보정 레이어**라고 보는 것이 정확합니다.

향후 목표는 `championsMovePools.json` 같은 별도 전용 화이트리스트 레이어로 분리하는 것입니다.

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

## GitHub Pages 배포

- GitHub Actions workflow: `.github/workflows/deploy-pages.yml`
- `main` 브랜치 push 시 자동 배포
- 저장소 경로 기준 base: `/Pokemon-Champions-Assistant/`

GitHub에서 한 번만 켜야 하는 설정:

1. Repository Settings → Pages
2. Source를 `GitHub Actions`로 선택

그 다음부터는 `main`에 push하면 자동으로 정적 페이지가 갱신됩니다.

## Docker 실행

```bash
docker compose up --build -d
```

기본 포트: `3002`

## 배포 메모

- 정적 산출물은 `dist/`
- nginx SPA fallback 설정 포함
- GitHub Actions 배포 시 Vite base 경로 자동 조정
- 브라우저 localStorage에 상태 저장
- 다른 기기로 옮길 때는 상단의 `상태 내보내기` 사용
