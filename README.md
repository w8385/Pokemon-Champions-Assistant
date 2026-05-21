# Pokemon Champions Assistant

포켓몬 챔피언스 실전용 정적 웹앱입니다.
파티 정리, 상대 엔트리 기록, 스피드 체크, 대미지 계산, 더블 플래너, 도감/검색을 한 화면에서 빠르게 다루는 데 초점을 맞췄습니다.

## 핵심 기능

### 싱글 배틀
- 내 파티 관리
- 상대 엔트리 기록
- 스피드 계산 / 추월컷 비교
- 간단 대미지 계산
- 상대 공개 기술 / 도구 / 특성 메모

### 더블 배틀
- 4칸 기준 행동 카드 정리
- 상대별 총 기대 대미지 요약
- 타깃 선택 / 광역기 감쇠 반영
- 속도 / 전장 상태 기반 플래너

### 도감 / 검색
- 포켓몬 검색
- 기술 검색
- 특성 검색
- 도구 검색
- 타입, 종족값, 설명, 상위 기술, 배울 수 있는 포켓몬 등 빠른 조회

### 샘플 / 보조 기능
- 단일 포켓몬 샘플 빌더
- 저장 / 불러오기
- 상태 JSON 내보내기 / 가져오기
- localStorage 기반 작업 상태 유지

## 기술 스택

- React 19
- TypeScript
- Vite
- Docker + nginx
- GitHub Pages

## 로컬 실행

```bash
npm ci
npm run dev
```

기본 개발 서버는 Vite 기본 포트를 사용합니다.

## 프로덕션 빌드

```bash
npm run build
npm run preview
```

## Docker 실행

```bash
docker compose up --build -d
```

- 기본 포트: `3002`
- 로컬 확인: <http://127.0.0.1:3002>

## 배포

이 프로젝트는 `main` 브랜치에 push하면 GitHub Pages로 자동 배포됩니다.

- Workflow: `.github/workflows/deploy-pages.yml`
- Base path: `/Pokemon-Champions-Assistant/`
- 배포 URL: <https://w8385.dev/Pokemon-Champions-Assistant/>

처음 한 번만 GitHub 저장소에서 아래 설정이 필요합니다.

1. **Settings → Pages** 이동
2. **Source**를 `GitHub Actions`로 설정

## 주요 npm 스크립트

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm run build:champions-whitelist
npm run build:champions-learned-whitelist
npm run build:champions-move-meta
npm run build:champions-usage-top-moves
npm run build:champions-item-whitelist
npm run sync:item-sprites
npm run check:type-effectiveness
npm run check:damage-parity
npm run check:ability-damage
npm run check:ui-consistency
```

## 데이터 소스 / 운영 원칙

기본 데이터와 검증 소스는 다음 기준으로 운영합니다.

- 구조화 기본축: **PokeAPI**
- 사람이 읽는 검증/보강: **PokemonDB**, **Serebii**
- 경쟁 샘플 / 채용 기술 참고: **Smogon Dex**, **Pikalytics**

### 기술 풀 검색 기준

앱의 가용 기술 검색은 현재 아래 파일들을 중심으로 동작합니다.

- `src/championsMovePools.json`
- `src/championsMovePoolSources.json`
- `reports/championsMoveWhitelistCoverage.json`

화이트리스트 생성/갱신:

```bash
npm run build:champions-whitelist
```

## 프로젝트 구조

```text
src/         앱 UI / 계산 로직 / 정적 데이터
public/      정적 에셋
scripts/     데이터 생성 / 검증 스크립트
reports/     검증 리포트 산출물
dist/        빌드 결과물
```

## 운영 메모

- 정적 산출물은 `dist/`에 생성됩니다.
- nginx SPA fallback 설정이 포함되어 있습니다.
- 상태는 브라우저 localStorage에 저장됩니다.
- 다른 기기로 상태를 옮길 때는 앱 상단의 내보내기 기능을 사용하면 됩니다.
- 일부 검증 리포트/로그 파일은 배포 커밋 대상에서 제외하고 별도로 관리합니다.
