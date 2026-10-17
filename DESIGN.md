---
version: alpha
name: Pokémon Champions existing dark UI
description: Normative shared interaction contract for the eight visible destinations.
colors:
  primary: "#9dcbff"
  background: "#101418"
  surface: "#162435"
  text: "#e5eef7"
  muted: "#a9b9cd"
  placeholder: "#a9b9cd"
  navigation: "#111821"
  navigationText: "#c2ccd8"
  navigationActive: "#1a2430"
  navigationActiveText: "#f8fbff"
  border: "#334155"
  borderSubtle: "#27323d"
  panel: "#121923"
  card: "#111827"
  control: "#0b1220"
  controlHover: "#172554"
  controlText: "#eef2f7"
  focus: "#9dcbff"
typography:
  body:
    fontFamily: "Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic, Noto Sans JP, Droid Sans Fallback Local, Inter, system-ui, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: 10px
  card: 12px
  panel: 14px
spacing:
  control: 8px
  card: 12px
  panel: 16px
components:
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
  surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
  navigation:
    backgroundColor: "{colors.navigation}"
    textColor: "{colors.navigationText}"
  navigation-active:
    backgroundColor: "{colors.navigationActive}"
    textColor: "{colors.navigationActiveText}"
  action:
    backgroundColor: "{colors.control}"
    textColor: "{colors.controlText}"
    rounded: "{rounded.control}"
    height: 40px
  action-hover:
    backgroundColor: "{colors.controlHover}"
    textColor: "{colors.controlText}"
  search:
    backgroundColor: "{colors.control}"
    textColor: "{colors.controlText}"
    rounded: "{rounded.control}"
    height: 40px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
  muted-copy:
    textColor: "{colors.muted}"
  search-placeholder:
    textColor: "{colors.placeholder}"
  focus-indicator:
    backgroundColor: "{colors.focus}"
  control-stroke:
    backgroundColor: "{colors.border}"
  panel-divider:
    backgroundColor: "{colors.borderSubtle}"
---

## Overview

**하나의 원칙: 입력과 결과를 가까이 두고, 같은 조작은 같은 실제 UI로.** Existing `src/styles.css` `:root` and `.header-primary-tab` values above are normative; this contract does not recolor, invent a brand or duplicate UI. Source implementation is mandatory; measured mounted acceptance is a separate gate.

## Colors

Use existing dark background, surface, text, muted, link, placeholder, explicit border and navigation colors above. The root CSS variables `--border`, `--border-subtle`, `--control-bg`, `--control-hover`, `--control-text`, `--focus-ring`, `--space-panel` and `--radius-panel` must be consumed by real selectors rather than defined unused. Preserve semantic stat/type themes already used by the actual components; color never replaces a number, label, selected state or invalid reason. Validate rendered contrast in both implemented themes if a second theme exists; do not claim an unimplemented light theme.

## Typography

Use the existing CSS font stack. Navigation, action, search, selectable stat tile and modal controls share visible hover/focus/disabled behavior with an at-least-40px primary target; readonly Dex/Library displays are not editable controls. Short labels and numeric feedback precede explanatory prose; unknown values say `미확인`, not a fabricated zero. Keep error reasons beside invalid output.

## Layout

1. Every visible destination exposes its main first action without a detour, and shows its result beside or immediately after the controlling input. Native direct links remain one click away on desktop/mobile. Deep links, back and reload restore the proper destination.
2. On `#/single`, selected own slot and opponent slot identify the *only* two editable Pokémon cards. The selected opponent's slot number, species search, known build and four moves are in the opponent card immediately under the opponent slot selector; an empty selected slot has the same search with an explicit `상대 엔트리 입력` label. No hidden opponent editor elsewhere and no separate species identity in the card.
3. In each comparison card, species/name and six colored stats plus the existing effort-modal trigger appear **before** the four move tiles, within the same card; ability/nature/item use the actual shared `PokemonBuildFields`, stat tiles use `PokemonStatGrid`, and effort uses `EffortTuningModal`. One click from the card opens effort editing, with keyboard focus restored on close. Keep all four `RegisteredMoveSlot` tiles in a 2×2 grid and their own live damage previews beneath the input; calculating requires only one valid move.
4. After the entry selectors and **before** the two primary cards place **one** result region containing the equal-scale, named effective-Speed comparison and the selected move's direction, damage range, percent, KO/unsupported reason and rolls, in adjacent subsections with no intervening conditions panel or second editor. On narrow screens these subsections stack consecutively. Each card keeps its six stat tiles before moves, and full conditions follow the primary comparison task; focused condition adjustments remain reachable near the affected values. No duplicate calculation engine.
5. Calculation edits update live; no `저장됨`, `엔트리 저장`, `변경 취소` trio inside either card. Comparison build drafts auto-store separately from committed party/opponent records, clearly labelled `비교 초안 · 자동 보관` when modified. One *optional* `기록에 반영` area outside the default calculation path offers a specifically named `내 파티에 반영` or `상대 엔트리에 반영` action for the selected slot, only when that side has dirty build fields. Never call a draft `저장됨`. Explicit commit uses `commitComparisonEntry` with dirty-only fields and existing shared-species move scope; temporary battle assumptions and unknown opponent defaults never commit. See persistence boundary below.
6. Across all eight destinations, entry/search controls, result labels, active states, save/apply scope, keyboard behavior and mobile tap targets follow the same real components and vocabulary; do not equate similar CSS with shared behavior. No copy wall substitutes for visible fields or a conditional reason.

## Components

Identical actions use the **input-owning** component, not a matching silhouette: `PokemonSearchField` owns combobox, ranked visible options, IME/229/Enter/Escape and blur; `PokemonBuildFields` owns ability/nature/item; `PokemonStatGrid` owns six themed tiles and tuning trigger; `RegisteredMoveSlot` owns the four inputs; `EffortTuningModal` owns the dialog, 66pt budget, nature, checkpoints and keyboard/pointer gauges. Party, Builder and comparison species search use the same real picker. Party and Builder tune through the same real modal. Builder closes it on route/tab/species change and restores the opener focus on Escape/close. Library `ReadonlyPokemonCard` keeps unknown fields unknown; Dex and SpeedLine retain category/scenario roles.

### Route acceptance (mounted gate; do not infer from source tests)

| Route | First action → nearby result | Owner/save boundary | Verify desktop and 390px |
|---|---|---|---|
| `#/` Home | One native destination link → correct active route | No save | Eight total top-level links; keyboard Enter, back/reload |
| `#/party` Party | Six selectable card species/build/stat/moves → coverage and weakness matrices **after** six cards | Master party autosaves; preset snapshot and overwrite are explicit, overwrite visible only for a selected existing preset | Empty slot picker, shared modal, reload, grid-before-analysis bounds |
| `#/single` Single | Choose own/opponent slots → same two cards and one adjacent Speed/damage region | Distinct comparison drafts; optional named record commit outside default calculation path | Empty opponent, A→B→A, one valid move, stat-before-moves, result before cards, reload/master isolation |
| `#/damage` Quick | Free-search sides/move → same adjacent comparison result | Independent quick storage, no party commit | Swap, one-move result, shared modal, reload, 390px bounds |
| `#/speed-line` SpeedLine | Choose reference/scenario → effective Speed and ranked list | URL/scenario only | Reference search/keyboard, effort/filter, accessible investment action |
| `#/sample-builder?sampleTab=library` Library | Filter/search source → compact row and known/unknown detail | Read-only source; explicit import only | Deep link/back, partial evidence and destination readback |
| `#/sample-builder?sampleTab=builder` Builder | Choose species/stat/move → live preview | Builder draft; explicit sample save or selected-party apply | Shared picker/modal Escape, route/tab/species close, focus, nature/66pt/magic; reload |
| `#/dex` Dex | Category/unified search → related read-only detail | URL-backed query/category, no party save | Cross-category nonempty query, Enter/IME, bounded results scrolling, direct link/back |


- Navigation: `routeGroups` native anchors, plus Home anchor; all eight visible destinations stay direct. Retire legacy single sub-tabs visually but normalize old `#/single?tab=...` URLs to the same workspace without losing selected slot identity.
- Pokémon search: reuse `PokemonSearchField` with ranked option/Enter/IME guards. In entry-backed comparison the search updates the selected slot draft; the picker/card identity cannot diverge. Standalone `#/damage` retains independent free search and swap.
- Registered moves: reuse input-owning `RegisteredMoveSlot`, pool suggestions, tooltip and damage preview. Shared-species own move edits disclose scope before optional record commit.
- Build and stat: reuse `PokemonBuildFields`, `PokemonStatGrid` and `EffortTuningModal` unchanged as behavioral primitives; move their *existing rendering* into the owning comparison card rather than creating a second editor. All six stat values and effort trigger remain directly visible.
- Result: `quick-speed-summary` and `quick-result` render in one `quick-comparison-results` wrapper; retain valid/invalid, equal-scale bars, direction, damage, 16 rolls and KO explanation. Retain canonical calculators, known/unknown status and temporary battle controls.

### Minimal ownership and persistence boundary

`QuickDamagePanel` owns two local editable `QuickSide` drafts and dirty sets; in single mode the parent owns selected slot IDs and committed party/opponent arrays. Persist **only** the draft build fields/dirty flags in a new, versioned comparison-draft storage record keyed by side + slot + species/form and paired with a fingerprint of its committed seed. Hydrate drafts only when slot, form and seed are compatible; reconcile *per side*, never remount both. On slot or form change, close that side's modal and reset *all* matchup assumptions even on A→B→A; leave the other side's dirty build draft alone. Save draft changes automatically on edit (including selected slot IDs if restoration is desired), never alter committed party/opponent arrays through this effect. On a stale fingerprint, reject/rebase only that side's draft explicitly rather than silently applying it to a different Pokémon. Persist no search text, focus, temporary actual-stat overrides, stages, status, weather or other battle assumptions in this record. Existing standalone `QUICK_KEY` and its independent state stay untouched. Optional record actions use existing `onSaveEntry` → `commitComparisonEntry`, clearing only that side's dirty fields after confirmed parent commit; same-species own moves continue through `confirmedMovesByKey`. Preserve explicit empty ability versus unspecified ability and known opponent nature/offense flags. Label draft-only changes as auto-kept, and distinguish an optional record action from calculation. A dedicated `초안 버리기` may live in the optional record area with clear scope; it is not a per-card default button.

## Do's and Don'ts

Do test each route's actual first action, visible feedback, deep link, reload/back, keyboard and 390px mobile reachability; do verify DOM bounding rectangles of stat trigger and paired result subsections, not merely source order. Do not say a comparison draft was saved to the party. Do not auto-commit unknown opponent effort or a temporary scenario. Do not hide meaningful values to make a screenshot shorter, duplicate editors, add dependencies or repurpose the sample-builder save semantics for the calculator.

Native links retain link colors; scope focus rings and hover to control families, never globally reset `a` or semantic Pokémon type/stat colors. Preserve existing dark-only `color-scheme`; no unimplemented light theme claim. The root stylesheet owns common presentation while `QuickDamagePanel` owns comparison composition, `App` owns Party/Builder master actions, and canonical calculation helpers own values. Automated source/unit tests and build do not certify desktop/mobile mounted contrast or interaction.
