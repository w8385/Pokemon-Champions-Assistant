# Speed-line MVP2 QA

Baseline: `4ace7507d5b3062aa97233a57ac15795763b4075`.
Status: implemented; independent reviews PASS; deployment pending.

## Parent-executed acceptance checks

- PASS: Garchomp31/+10% reference168; Charizard32/+10% normal167/difference+1, scarf actual167/effective250/difference-82. Reference did not inherit scarf.
- PASS: normal Charizard target shows tie30→167 and strict pass31→168; current31 already ahead, additional effort0, predecessor167.
- PASS: scarf target shows250 and cannot pass with reference maximum32→169; exact tie absent.
- PASS: switching row selection serializes target=charizard with targetItem normal/scarf independently.
- PASS: target scarf remains selected and inverse conditions unchanged while items=normal hides its row.
- PASS: fresh/versionless link shows341 forms and682 condition rows. slv1 missing items migrates to normal-only and serializes explicit slv2/itemsnormal.
- PASS: v2 hard reload restores reference, both conditions, item mode and selected target. Actual my=0/opp=1 are preserved in tested direct links.
- PASS: Japanese ルカリオ yields Lucario and Mega variants. Typing leaves Garchomp and comparison querycharizard unchanged; ArrowDown/Enter commits Lucario only.
- PASS: native touch event selects the clicked first Garchomp-family result (Mega Garchomp); shared sample-speed picker also selects its clicked Mega Garchomp result, clears draft and displays target.
- PASS: empty reference effort sets aria-invalid=true, removes comparison rows, suppresses reference number and replaces inverse results with validation notice; restoring31 restores168.
- PASS: mobile320 documentWidth320/listWidth256/listScroll256, with actual/effective and difference cell bounds inside row; mobile390 documentWidth390/listWidth326/listScroll326.
- PASS: browser back from sample-speed restores speed-line reference168 and selected scarf target250; forward restores sample-speed. Existing sample-speed caller uses the same input-owning component.
- PASS: Tab closes suggestions and moves focus to effort number input.
- PARTIAL: synthetic compositionstart/Enter(isComposing)/compositionend did not commit reference. Real OS Korean IME was not exercised.
- NOT TESTED: actual Korean glyph appearance; headless QA lacks Korean glyphs. Text content/localization and numeric layouts are checked separately.

## Defects found and corrected by parent

- Initial ArrowUp from highlight=-1 incorrectly selected second-last option. Added failing regression, exported shared nextSearchHighlight and corrected first/up/down/wrap semantics. Actual browser selects last of three options.
- Escape on native type=search cleared text, whose change handler reopened suggestions. Added actual-handler failing regression and preventDefault. Browser now shows aria-expanded=false with Lucario draft retained.
- Large-list offscreen layout adjustment initially displaced the reference marker after smooth scroll. Added failing handler/frame regression; jump now focuses immediately and recenters after two animation frames. Browser marker top335.92/bottom373.70 inside577px viewport with682 rows retained.

## Measurements and chosen optimization

- Pure engine:341 forms/682 scenario rows,300 measured iterations after30 warmups: p50=0.15414ms, p95=0.38692ms, max=0.58213ms. This is calculator time, NOT browser/UI time.
- Remote development browser: input-to-two-animation-frame samples before adjustment were52.6/655.7/74.8/876.4/58.4/897.8ms for queries charizard/empty/garchomp/empty/lucario/empty.
- Added CSS content-visibility:auto and contain-intrinsic-size:auto120px only to actual scenario rows. All rows remain in DOM; no virtual list or dependency was added. Browser reports CSS support and computed auto.
- Same six-query sequence after adjustment:52.8/240.2/44.1/211.4/38.4/238.2ms; empty queries still show682 rows. These are small dev-browser samples, NOT real-phone benchmarks or statistically robust production percentiles.
- Last row remains readable after scrolling to it; reference jump was separately corrected and verified.

## Automated gates and evidence limits

- Final parent suite108/108 PASS after all CSS/jump/keyboard additions; typecheck, build and diff check PASS.
- Initial independent scoped review PASS with104/104 tests, typecheck/build/diff. Reviewer did not independently perform browser/mobile/full-roster count QA; those checks are parent evidence above. Final parent-change scoped rereview PASS with14/14 targeted tests. Reviewer did not independently rerun parent browser samples/full suite/typecheck/build.
- Pure worker reported27 focused tests and source-consistent scarf arithmetic. Agreement with existing application and Showdown code is NOT actual Champions-game verification.
- Existing chunk-size warning remains. Concurrent SSR Vite fixtures emit HMR port24678 warning but tests complete.
- Parent recorded results directly above rather than accepting worker's103-test summary as final proof.
- No automatic reference-effort application, party mutation, point-budget redistribution or extra combat modifiers added.
- Independent review result, final suite count and exact deployed revision will be appended after they are actually received.
