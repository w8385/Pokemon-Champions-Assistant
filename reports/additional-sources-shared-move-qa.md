# Additional creator sources and actual shared move input QA

Checked: 2026-10-03.

## Shared move field acceptance

RegisteredMoveSlot owns the input element and its common layout. Party, sample builder and library callers pass typed inputProps rather than rendering separate input children. Autocomplete remains caller-specific children. Library input is readOnly, not disabled; the same moveTooltipData/bindTooltip path is used for all three.

- Failing regression reproduced the missing library input/tooltip before the initial fix.
- Executable ReactDOM tests cover editable and read-only shared inputs, metadata and no duplicate inputs.
- Worker browser checks: party editing succeeds, attempted library edit does not change its value, idle computed input styles match between party and library, Ice Fang focus handler displays its effect.
- Parent browser check after final extraction: new Charizard Y's Flamethrower input is INPUT/readOnly=true/disabled=false; pointer hover shows type, category, power, accuracy and original effect text.

## New source evidence

1. Mono original video ZWp7MKpjp1M, published2026-09-27: focused Mega Lucario Z sample, six source-backed rental members. Displayed ability/stat evidence is tied to pre-Mega forms, not relabelled post-Mega source evidence.
2. Chemie original video y2c5sLKYr7s, published2026-08-06: party introduction, six species evidenced. Only Mega Kangaskhan item/ability/four moves confirmed; five other species have no invented build fields.
3. Noon original blog224428783481, published2026-10-01: timid Mega Charizard Y, item/ability/four moves confirmed, only H2/C32/S32 printed. Other efforts stay unknown, not zero.

Catalog now has32 records,7 primary source documents and32 individual rows:13 new recorded members, not13 complete importable builds. Unknown singles/doubles format remains unknown for all three new sources; no rank verification from titles, no full-build import enabled for new entries.

## Parent actual browser verification

- Individual list returned32 rows and the13 newly recorded member titles.
- New Charizard detail has a stable source-derived route, canonical source link and one shared card.
- Charizard displays base stats labelled 종족값, EV+2/+32/+32 only where evidenced, and unknown markers on A/B/D. No actual-stat calculation using incomplete effort evidence.
- Shared Flamethrower hover tooltip displays its burn-effect description.

## Commands

- node --test tests/*.test.mjs:67 passed,0 failed, including the regression that first reproduced missing editor focus tooltips.
- Parent fixed the independent review blocker: tooltipProps and editor inputProps are separate; RegisteredMoveSlot composes focus and blur callbacks so autocomplete does not overwrite tooltip handlers.
- Parent browser after fix: native focus via focus emulation shows Ice Fang tooltip in the builder and Fake Out tooltip in the party; party autocomplete still opens and normal text editing changes the value. Library focus handler shows Ice Fang. Initial scroll-induced closing was avoided by settling scrolling before focus.
- Independent broader party-image-import harness FAIL is pre-existing: HEAD and current reports both miss archaludon/gyarados, with only generatedAt changed. This harness is not certified by this release.
- check:ui-consistency was not run by the reviewer after that pre-existing harness failure.
- Independent focused rereview PASS after the callback fix:5/5 related tests, all three tooltipProps paths and composed focus/blur confirmed. The rereview did not rerun the parent full suite.
- node scripts/check-creator-card.mjs:PASS.
- npm run typecheck:PASS.
- npm run build:PASS. Existing large-chunk warning remains.
- git diff --check:PASS.

## Evidence preservation

Original structured extraction JSON and image evidence copied outside pruning scratch to /home/w8385/.hermes/artifacts/pokemon-champions/2026-10-03/new-source-evidence/.111 evidence files preserved. No paid API, recurring collector, posting or cron enabled.
