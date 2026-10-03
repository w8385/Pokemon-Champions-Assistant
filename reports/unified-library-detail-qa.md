# Unified library list/detail and sample taxonomy QA

Date: 2026-10-03. Supersedes the earlier presentation/import classification in creator-video-party-qa.md; that report records the earlier deployment. Independent review's featured-ordering issue fixed and scoped re-review passed; the parent independently ran all 60 tests successfully.

## Contract

- No standalone ranker menu. Legacy rankers links normalize to the unified sample library.
- Source list rows contain sprites and source title only. Full cards, stats, moves and provenance belong on a separate stable URL detail page.
- Every evidenced member, including party-source members and focused-video companions, has an individual sample with canonical creator/source provenance.
- Mono Ix8nrNnmTUk is focused on Mega Gyarados, not a party introduction. Its optional supporting rental party can be viewed/imported in secondary details; it is not listed as a primary party introduction.
- A sample missing nature/effort displays species/form base stats labelled 종족값. Do not invent actual stats or zero effort.
- Confirmed samples retain source actual stats, effort, mapped moves and Mega form switching.

## Observed

- Local browser party list: exactly two compact rows, Chemie video and Mono season-two blog; each has six sprite images and no stat tiles.
- Local browser individual list: 19 rows, one per recorded member; original-video six Mono samples preserve their source titles and canonical provenance.
- Individual Greninja detail URL: #/sample-library/individual%3Ayoutube-HQDEZg-Zgv8-greninja. One shared member card, base stats HP72/A95/B67/C103/D71/S122, no EV + fields, no fabricated nature; all four moves mapped.
- Browser detail back returned to the individual list, still with 19 rows.
- Mobile viewport390/document390 on detail and list, no horizontal overflow. No visible ranker link/button.
- Worker browser checks additionally covered reload/back, unavailable IDs, Mono Mega toggle and individual builder import, plus optional supporting-party import.

## Commands

- node --test tests/*.test.mjs: 60 passed, 0 failed.
- node scripts/check-creator-card.mjs: PASS.
- npm run typecheck: PASS.
- npm run build: PASS; existing large-chunk warning remains.
- git diff --check: PASS.

## Limits

No new ranking verification or cron collection. Chemie nature/effort remain unknown. Rental codes are source publication codes, not proof of current validity. Archived original extraction evidence remains at /home/w8385/.hermes/artifacts/pokemon-champions/2026-10-03/video-evidence/.
