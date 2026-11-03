# OSMIUM design system — v2 implementation spec

**Governing source:** *OSMIUM Brand Identity & Design System v2* (approved 3 Nov 2026). It supersedes *REBORN Design System v1* and, for color and typography, the VYNKÆR system in [`/DESIGN.md`](../../DESIGN.md).
**Code:** [`src/theme/osmium.ts`](../../src/theme/osmium.ts). This is a parallel module and **is not imported by the app yet**.
**Status:** Values marked *approved* are locked. Values marked *derived* were chosen in Phase 0 to fill roles that v2 doesn't name, and need design sign-off.

---

## 1. Principles (from v2, made actionable)

| Principle | What it means in code review |
|---|---|
| Pure black canvas | Screen background is `#000000`. Graphite panels appear only where hierarchy needs them, not as a default card behind everything. |
| Instrument blue is a signal | It marks focus, selection, the current set, significant trends and the single primary action. It is never a background fill larger than a button, and it never decorates. |
| Silver and titanium carry contrast | Hierarchy comes from silver-white vs titanium vs tertiary text, not from color. |
| Micrographics must be true | Calibration ticks, axes, section numbers, session IDs and load scales may appear only if they encode real state. Decorative ticks are rejected. |
| No generic gradients | `expo-linear-gradient` is used today for the Home hero glow and the Progress chart fill. Both must be removed or justified (see §8). |
| Measured motion | 120–220 ms, low intensity, and honour reduced motion. |
| Designed states | Default, focus, active, loading, disabled, error, success and **insufficient data** are designed per component, not improvised. |

## 2. Approved palette

| Token | Hex | Role |
|---|---|---|
| Obsidian | `#000000` | Primary background (true OLED black) |
| Graphite | `#0E1116` | Elevated surface |
| Gunmetal | `#242D36` | Dividers, structural borders, secondary panels |
| Titanium | `#C5CBD0` | Secondary text, refined edges |
| Instrument Blue | `#6E9FC9` | Focus, selection, significant trends. Never dominant |
| Silver White | `#F1F3F5` | Primary text and highlights |
| Logo Silver | `#E2E5E8` | Monochrome logo fallback only |

**Gold, copper and rust are retired as accents.** The v2 doc says the warm gold on the latest concept board is "an exploratory deviation, not a locked brand token".

## 3. Semantic tokens and the legacy mapping

`osmiumColors` has **exactly the same keys** as the legacy `colors` in `src/theme/tokens.ts`, and `satisfies Record<keyof typeof legacyColors, string>` enforces that at compile time. Phase 1 step 1 is therefore a value swap. The 25 legacy files that read `colors.*` keep compiling unchanged.

### 3.1 Surfaces and text

| Legacy key | VYNKÆR | OSMIUM | Provenance | Notes |
|---|---|---|---|---|
| `background` | `#0a0a0b` | `#000000` | approved (Obsidian) | |
| `backgroundElevated` | `#111114` | `#07090C` | derived | Recessed well *inside* a card, and the tab bar |
| `panel` | `#141417` | `#0E1116` | approved (Graphite) | |
| `panelElevated` | `#191a1e` | `#12161C` | derived | |
| `panel2` (Card) | `#1c1c21` | `#0E1116` | approved (Graphite) | Card = graphite on black |
| `controlBg` | `#2a2a2b` | `#1A2129` | derived | Raised control on a card |
| `border` | `#26262c` | `#242D36` | approved (Gunmetal) | |
| `borderSubtle` | `#1e1e23` | `#181E25` | derived | |
| `textPrimary` | `#efe9e2` | `#F1F3F5` | approved (Silver White) | |
| `textSecondary` | `#9a948d` | `#C5CBD0` | approved (Titanium) | |
| `textTertiary` | `#6c6a68` | `#8B949C` | derived | Lifted so it still passes AA |

The Recessed/Raised Rule from `/DESIGN.md` carries forward unchanged. Inside a Card (`panel2`), nested elements use `backgroundElevated` when recessed and `controlBg` when raised, never `panel2`. On OSMIUM, "recessed" is darker than graphite (`#07090C`) and "raised" is lighter (`#1A2129`).

### 3.2 Accent

| Legacy key | VYNKÆR | OSMIUM | Notes |
|---|---|---|---|
| `accent` | `#975a36` copper | `#6E9FC9` | approved Instrument Blue |
| `accentStrong` | `#b97140` | `#8DB5D8` | derived. Pressed/emphasis |
| `accentSoft` | `#d9a578` | `#C5CBD0` | **Intentionally titanium.** See §3.3 |
| `accentSurface` | `#1d1614` | `#0D1620` | derived. Explanation/notice wells |
| `accentBorder` | `#3b302d` | `#22374A` | derived |

### 3.3 Why `accentSoft` maps to titanium, not blue

`accentSoft` has 16 call sites. Most are eyebrows, tinted labels, the tab-bar active tint, the loading spinner and doctrine quotes. Mapping it to a blue would make instrument blue the most common colour on screen, which breaks the "calibrated signal" rule. Mapping it to titanium keeps the swap safe. During component migration (roadmap step 2), each call site is then reviewed and promoted to `accent` only where it really is focus or selection, for example the tab-bar active tint.

### 3.4 Semantic (independent of brand)

| Key | OSMIUM | Contrast on graphite | Rule |
|---|---|---|---|
| `success` | `#7FAE8C` | 7.51:1 | Completed sets, PRs that are real |
| `warning` | `#D1A55A` | 8.32:1 | Amber, semantic only. **Never** used as a brand accent (it must not let gold back in) |
| `danger` | `#DB6F6B` | 5.85:1 | Destructive actions, pain worsening |
| `bloodOath*` | → danger family | | VYNKÆR-only; one call site (`colors.bloodOath`). Delete once unused |

### 3.5 Measured contrast (WCAG 2.x relative luminance, computed in Phase 0)

| Foreground | on Obsidian | on Graphite | on controlBg `#1A2129` | on Gunmetal |
|---|---|---|---|---|
| Silver White `#F1F3F5` | 18.88 | 17.00 | 14.60 | 12.56 |
| Titanium `#C5CBD0` | 12.83 | 11.55 | 9.92 | 8.53 |
| Tertiary `#8B949C` | 6.81 | 6.14 | 5.27 | 4.53 |
| Instrument Blue `#6E9FC9` | 7.47 | 6.72 | 5.77 | 4.97 |
| Danger `#DB6F6B` | 6.50 | 5.85 | 5.02 | — |
| *Legacy copper `#975a36`* | *3.83* | *3.45* | *2.96* | *2.55* |

Every OSMIUM text pair is **≥ 4.5:1 (AA body)** on the surfaces it is allowed on. The legacy copper accent fails AA as text on every surface. The migration therefore fixes an existing accessibility defect.

**Non-text contrast (WCAG 1.4.11):** Gunmetal on graphite is only 1.35:1. A hairline border must therefore **never be the only thing** that identifies an interactive control. Controls need a fill step (`controlBg`) and a label. Focus rings use instrument blue (6.72:1 on graphite).

## 4. Typography

### 4.1 Current (VYNKÆR) — audited

Loaded in `app/_layout.tsx` via `@expo-google-fonts/*`, all SIL OFL:

| Role today | Family | Used for |
|---|---|---|
| `display`, `displayBold` | Cinzel 600/700 | Eyebrows, collection marks |
| `editorial*` | EB Garamond 500/700/500 Italic | Screen titles, hero title, doctrine quotes |
| `mono*` | IBM Plex Mono 500/700 | Every standalone measured numeral |
| (unset) | System sans | All other UI text |

`fontFamily.*` is read in 7 files. The fonts gate the splash screen, so the app renders nothing until they load or error.

### 4.2 OSMIUM roles → proposed open-licence stand-ins

| v2 role | v2 reference | Proposed stand-in | Licence | Replaces |
|---|---|---|---|---|
| **Display**: human-facing prompts, occasional editorial lines, 36–44pt | Canela-like high-contrast editorial serif | **Instrument Serif** (alt: Newsreader) | OFL | EB Garamond (title/hero/doctrine) |
| **UI**: navigation, workouts, body, labels, controls | Neue Haas Grotesk-like neo-grotesk | **Inter** (alt: Inter Tight for headings) | OFL | System sans + Cinzel eyebrows |
| **Data**: loads, reps, time, dates, set numbers | Tabular numerals, restrained mono labels | **IBM Plex Mono** (retain) *or* Inter with `fontVariant: ['tabular-nums']` | OFL | Unchanged |
| **Wordmark** | Custom-drawn geometric capitals | **Not a font.** Use the vector wordmark asset | — | Text "VYNKÆR" in 3 places |

**Cinzel is retired.** Its wide-tracked uppercase register belonged to VYNKÆR's gothic identity. OSMIUM eyebrows become Inter 500/600, uppercase, letter-spacing ~1.2.

**Undecided:** whether to buy licences for Canela and Neue Haas for production. The stand-ins can ship. Before installing any package, check that it exists for Expo SDK 57 (e.g. `@expo-google-fonts/inter`, `@expo-google-fonts/instrument-serif`).

### 4.3 Migration plan (non-breaking)

1. Install the new families **alongside** the existing ones and add them to `useFonts` in `app/_layout.tsx`. Nothing switches yet.
2. Add the new role names (`fontFamily.ui`, `fontFamily.display` re-pointed, etc.) in one commit, together with the colour swap.
3. Migrate the 7 `fontFamily.*` call sites screen by screen.
4. Remove Cinzel and EB Garamond from `package.json` and `useFonts` only after a `grep` shows no references.
5. Verify in the browser at 375px. The type scale is larger than today's, so wrapping must be rechecked (the old Home hero already wrapped to 4 lines, see `.impeccable/critique`).

### 4.4 Type scale (`osmiumTypeScale`)

| Role | Size / line height | Tracking | Family |
|---|---|---|---|
| display | 40 / 44 | −0.4 | Display serif |
| heading | 24 / 30 | −0.2 | UI 600 |
| subheading | 18 / 24 | 0 | UI 600 |
| body | 16 / 23 | 0 | UI 400 |
| bodySmall | 15 / 21 | 0 | UI 400 |
| label | 12 / 16 | +1.2, uppercase | UI 500 |
| micro | 11 / 14 | +1.4, uppercase | UI 500. **11pt floor** |
| metric | 28 / 32 | 0, tabular | Data |

Dynamic Type / font scaling must stay enabled. Never set `allowFontScaling={false}` on body text.

## 5. Space, shape, line, depth, motion, touch

| Token group | Values | Rule |
|---|---|---|
| Spacing | 4, 8, 12, 16, 24, 32, 48; `screenGutter` 20 | 8-pt rhythm (v2). 4 only for hairline gaps inside controls. The legacy scale has 20/28/40, which drift off-grid |
| Radius | 0, 4, 8, 12, pill | **Restrained.** The legacy cards use 18–22, which reads soft and toy-like against v2. Cards → 12, controls → 8, tags → 4, pill only for status capsules |
| Border | hairline 1, focus 2 | 1px rules for structure; 2px instrument-blue focus ring |
| Elevation | none, raised | On true black, separation comes from surface steps and rules. At most one shadow (the legacy "One Shadow Rule" carries forward) |
| Motion | fast 120, base 180, slow 220 | Legacy `slow: 340` is outside the v2 band. Use `AccessibilityInfo.isReduceMotionEnabled()` → 0ms |
| Touch | 48×48 min, hitSlop 8 | v2 floor is 44pt. The app already standardises on 48 and keeps that |

## 6. Accessibility rules

1. Functional text must reach WCAG AA: 4.5:1 for body, 3:1 for ≥ 18pt or bold 14pt. §3.5 has the measurements.
2. Status is never conveyed by colour alone. DONE/NOW/QUEUE set states already carry a text label; keep that.
3. Every icon-only control has an `accessibilityLabel`. There are 38 today; the critique found 0 unlabeled ones. Keep the bar.
4. Focus is visible: a 2px instrument-blue ring on web and keyboard navigation.
5. Honour reduced motion and OS font scaling.
6. Every touch target is ≥ 48pt, and a destructive control sits ≥ 8pt away from a primary control.

## 7. Core component patterns

The v2 inventory is mapped onto existing primitives. "Existing" means the file is already in the repo.

| v2 component | Implementation | Status |
|---|---|---|
| `EclipseMark` | New `src/components/brand/EclipseMark.tsx` rendering the approved **vector** master via `react-native-svg` | **Blocked** on the vector master (see BRAND_ASSET_MANIFEST.md) |
| `OsmiumWordmark` | New `src/components/brand/OsmiumWordmark.tsx` (SVG) | **Blocked** on the vector master |
| `CoachPrompt` | Evolve `coach.tsx` composer plus Home's "why this session" notice | Refactor |
| `SessionSummary` | Evolve Home's plan card and `workout/complete.tsx` | Refactor |
| `ExerciseSetRow` | Existing `src/features/workout/SetRow.tsx` (DONE/NOW/QUEUE) | Retain + restyle |
| `SubstitutionDrawer` | New bottom sheet over the existing `applyStructuralAdaptation('SUBSTITUTE_EXERCISE')` | Build new (UI only) |
| `ProgressTrace` | Existing SVG line chart in `progress.tsx`. Remove the gradient fill and use an instrument-blue stroke on gunmetal axes | Refactor |
| `RecoveryInput` | New. Self-report scales with explicit "not logged" state | Build new |
| `TechnicalLabel` | Replaces Cinzel `eyebrow`. Inter 500 uppercase, titanium | Refactor `SectionHeader`/`CardHeader` |
| `InstrumentDivider` | New: 1px gunmetal rule, optional real tick marks | Build new |
| `ConsentControl` | New (Phase 3, privacy/consent) | Build new later |
| Card, Button, Pill, StatusTag, StatTile, EmptyState, ScreenContainer | Existing `src/components/*` | Retain API, restyle via tokens |
| `Crest` | VYNKÆR crest mark | **Remove** once EclipseMark exists |
| `GrainTexture` | VYNKÆR film-grain overlay | **Remove.** Not part of the v2 language |

Every component must ship the full state set (§1) including **insufficient data**: an `EmptyState` variant with a reason line ("Log two sessions of this lift to see a trend").

## 8. Retire list (VYNKÆR-specific treatments)

| Treatment | Where | Action |
|---|---|---|
| Copper hero glow (`rgba(183,90,55,…)` LinearGradient) | `app/(tabs)/home.tsx:166` (the only hard-coded colour outside tokens) | Remove |
| Gradient under trend line | `app/(tabs)/progress.tsx` | Replace with flat stroke + real gridlines |
| Grain texture | `src/components/GrainTexture.tsx` via `ScreenContainer` | Remove |
| Crest mark | `src/components/Crest.tsx` (Home, onboarding) | Replace with EclipseMark |
| Doctrine italics ("FORGED, NOT BORN.") | `typography.doctrine`, onboarding copy | Rewrite copy in OSMIUM voice |
| Cinzel eyebrows | `typography.eyebrow` | → TechnicalLabel |
| "VYNKÆR" literal | `home.tsx:43`, `onboarding/index.tsx:14,88`, `AppStateContext.tsx:472`, `DemoCoachProvider.ts:74` | → OSMIUM (wordmark asset where it is a logo; text where it is prose) |
