# Single speed UX QA (2026-10-07)

- Scope: single-battle Speed screen, not the separate speed-line list.
- Opponent nature and item assumptions are editable without changing saved party/opponent records.
- Primary outcome: faster/tie/slower and strict-pass minimum effort, with predecessor checks.
- Both own/opponent Mega+Scarf are unavailable; no verdict/inverse/graph fallback.
- Ability activation is an explicit off-by-default opponent assumption with prerequisites; own ability activation is explicitly excluded from this baseline comparison.
- Mounted parent checks: own Mega+Scarf blocks verdict/graph; Qwilfish activated normal 300 and Scarf 450 agree with graph; 390px page width matches scroll width; all six controls stay inside viewport.
- Mounted parent A→B→A and screen exit/re-entry reset fast/normal/inactive; native Enter activates Scarf with focus emulation and CR text.
- Mounted English/Japanese text has no Korean fallback; final Japanese ability label verified すいすい. Runtime label test covers six ability slugs in all three languages, observed RED then GREEN.
- Final parent tests: 157/157; typecheck/build/diff-check PASS. Existing large-chunk warning remains.
- Evidence: /home/w8385/.hermes/artifacts/pokemon-champions/2026-10-07/single-speed-ux/.
- Limits: existing app/reference calculator consistency, not actual game-engine verification. Browser lacks Korean font; layout bounds and text verified, Korean glyph appearance unverified.
