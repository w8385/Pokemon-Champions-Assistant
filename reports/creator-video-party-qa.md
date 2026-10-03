# Creator cards, original video parties and navigation QA

Checked on 2026-10-03. Final independent review: release pass; item-display blocker resolved, all 52 tests passed.

## Implemented

- RegisteredMoveSlot is shared between editable party/builder slots and read-only creator cards. Canonical move metadata supplies type/category/power/accuracy/PP.
- Mega cards switch source-recorded pre-Mega stats versus calculated Mega stats and source-backed pre-Mega abilities versus canonical Mega abilities.
- Fixed the proven incorrect Mega Floette base-stat row using Pokémon Showdown data and an independent Serebii check. Added numerical effective-roster calculation regressions.
- Grouped navigation: Home, Battle, Samples, Tools; explicit library/ranker destinations retained. Navigation uses hash history with normalized routes.
- Source-party import prepares all six members before setters, saves a preset, and requires existing confirmation before applying over the current party.
- Mono blog 224319761655 now includes six source-backed members, not two.
- Original Mono video Ix8nrNnmTUk is a separate six-member party. Build evidence is at 02:52 and stat/nature-arrow evidence at 02:55. All six importable.
- Original Chemie video HQDEZg-Zgv8 has six partial member cards, not title-only leads. At 10:42 the rental card shows item/ability/moves but not nature or effort. No invented nature/effort, no full preset import.
- Empty pending-source section is hidden; missing nature/effort is distinguished from unsupported species.

## Actual verification

- node --test tests/*.test.mjs: 52 passed, 0 failed, including the source-item alias regression.
- node scripts/check-creator-card.mjs: PASS.
- npm run typecheck: PASS.
- npm run build: PASS, existing large-chunk warning remains.
- git diff --check: PASS.
- Browser: three party cards, each with six members. Mono video and blog import enabled, Chemie full import unavailable. All visible move slots resolved metadata after async initialization; zero unknown slots in these three cards.
- Browser: Mono Gyarados base toggle displays source HP175/A194/B109/C72/D120/S120 and Intimidate; Mega form has its own calculations/ability.
- Browser: importing Mono video created a saved preset with hydreigon, mega-gyarados, archaludon, mega-lopunny, hippowdon and gholdengo, and retained four moves per slot.
- Browser: mobile viewport390/document390, no horizontal overflow.
- Earlier review browser evidence: reload/back/forward preserved correct route, no observed loop; canceled apply kept active party and saved preset unchanged after reload.

## Disclosed limits

- Mono video singles classification is an explicit contextual inference, not a mode label shown on its rental card.
- Rental codes are source publication codes, not proof of present validity.
- Source screen spelling 자몽열매 is retained. An explicit supported-item alias maps it to Sitrus Berry / 자뭉열매 using the source icon; the source details disclose the mapping. Browser-applied party stores supported オボンのみ and displays the item, rather than silently hiding it.
- Original extraction report and six evidence frames archived outside the pruning scratch directory at /home/w8385/.hermes/artifacts/pokemon-champions/2026-10-03/video-evidence/.
- No verified-ranker status inferred from video title or creator's claim.
- Browser environment lacks Korean glyph fonts; textual verification used DOM, not screenshot glyphs.
- No cron or automatic recurring collection enabled.

## Source diagnostics

The browser stayed unstarted despite playable video metadata and no active advertisement. An isolated yt-dlp/FFmpeg extraction of the relevant original-video ranges produced readable1080p frames. The extraction report and source evidence were saved locally. Browser failure alone was not treated as proof the original source was unavailable.
