# Speed-line MVP-1 UI QA — 2026-10-05

Local Vite browser session `speed-line-mvp`, loopback `127.0.0.1:5178`; no remote deployment implied.

| Check | Expected | Observed | Status |
| --- | --- | --- | --- |
| Legacy entry | No reference, 32/+10% list, all forms, entire roster | 341 result rows; `ref` absent; URL gained versioned conditions; my/opp remained 0 | Pass |
| Independent reference | Select Garchomp without changing list | Reference Speed 169 at 32/+10%, separate marked reference row; 341 opponent rows | Pass |
| Hidden reference | Mega-only/faster list retains non-Mega reference | `ref=garchomp`, 31 opponent rows, marker remains for Garchomp | Pass |
| Invalid number draft | Blank numeric edit has invalid feedback, no stale calculated comparison | aria-invalid=true; alert visible; result rows hidden | Pass |
| URL restoration | Open explicit ref 0/neutral, list 32/boost, query/forms/comparison/sort/range; navigate dex then back | Parsed ref and effort restored; dex URL did not carry speed-line parameters | Pass |
| Empty results | Filter can produce zero opponents without clearing selected reference | Reference card remains, reset control and marker in empty panel | Pass |
| Jump | Button scrolls marker and moves keyboard focus to it | activeElement `.speed-line-reference-marker` | Pass |
| Narrow viewports | No document-level horizontal overflow, list may scroll inside | At 320px: document scrollWidth 320, list clientWidth 256/scrollWidth 540; at 390px: document scrollWidth 390 | Pass |
| Japanese-name lookup | Search maps canonical Japanese name in roster independently of site language | `ガブリアス` matches Garchomp and two Mega forms with range disabled | Pass |
| Clipboard-denied readonly fallback | Text field exposes current link on denial | Overrode clipboard write to reject; readonly field exactly equaled `location.href` | Pass |
| Direct deep-link reload | All conditions restored from URL | Ref Garchomp, ref effort 0, forms Mega, around selected after fresh navigation | Pass |

Browser screenshots: `reports/speed-line-mvp1-desktop.png` and `reports/speed-line-mvp1-mobile-390.png` (the clipboard-denial fallback and filtered empty state were visible during capture). The host browser rendered Korean glyphs as missing boxes, so Korean typography itself is not verified in this environment. Source tests, typecheck and production build are reported separately by parent.

## Parent verification and corrections

This section supersedes the worker's earlier comparison-direction and narrow-list claims.

- Reproduced wrong direction with a failing numeric test: reference Garchomp168 versus Charizard167 had -1/slower. Fixed difference to reference minus opponent; explicit labels now mean reference/my viewpoint in all three languages.
- Parent browser now displays Charizard167, +1/내가 빠름 against reference168. Same-form different effort is tested, not silently labelled tie.
- Replaced mobile 540px horizontal table with two-line grid. At320px pageWidth320 and listWidth/scrollWidth256; all five actual row cell rectangles fit inside row. At390px pageWidth390 and listWidth/scrollWidth326.
- Mega-only/search/faster/ascending/around-gap3 combined: non-Mega Garchomp reference168 remains; two Mega Charizard rows show167/+1/내가 빠름; summary correctly states ±3, not hardcoded ±10.
- Jump gives focus to the reference marker. Direct URL with refEp1.5/formsnope shows localized repair alert and safely restores32/all.
- Blank effort input sets aria-invalid, hides calculated rows and reference value; valid31 restores reference168. No new local storage or party mutation is added.
- Korean assumptions now show actual rule text, not the untranslated message key; sticky condition summary includes reference actual speed.
- Parent full suite85/85, typecheck, build and diff check pass. SSR test run emitted existing Vite HMR port24678 collision warning while local development server was active; tests completed. Existing large-chunk warning remains.
- Independent review found unknown reference picker falsely displaying No reference; a failing ReactDOM regression reproduced it. Parent added a selected unknown-key option and key-bearing heading. Actual browser now shows nonexistent selected and no calculated reference value.
- Legacy browser check confirms my=0/opp=1 retained, matching selectedMy0/selectedOpp1, no reference selected, both points32 and341 opponent rows. `myopp` is not a historical application parameter; unit fixtures now test the real my/opp indices rather than treating that synthetic name as compatibility scope.
- Final parent full suite86/86, typecheck, build and diff check pass. Scoped independent rereview PASS with23/23 targeted tests and typecheck. Reviewer did not rerun full suite/build or perform independent browser QA; those remain parent checks above. No deployment claimed at this report revision.
