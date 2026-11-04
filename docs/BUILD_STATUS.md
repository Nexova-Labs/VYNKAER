# VYNKÆR Training — Build Status

## Phase checklist

- [x] Phase 0 — Inspect repo & existing HTML prototype (`reference/vynkaer-training-v1-demo.html`)
- [x] Phase 1 — Foundation (Expo Router + TS, theme tokens, bottom nav, persistence architecture)
- [x] Phase 2 — Domain model (types, 24-exercise library, Athlete 001 seed, 13-session history, training state)
- [x] Phase 3 — Training engine (rotation, progression, safety, generator) — 42 passing unit tests
- [x] Phase 4 — Home
- [x] Phase 5 — Active workout (Train) — logging, rest timer, skip/substitute, session completion
- [x] Phase 6 — Progress (trends, milestones, exercise detail, recent sessions)
- [x] Phase 7 — Coach (DemoCoachProvider, explicit APPLY CHANGE flow)
- [x] Phase 8 — Profile (editable identity, preferences, limitations, conditioning, goals, reset)
- [x] Phase 9 — Polish pass (cardio display formatting, onboarding carousel fix, feedback-screen guard-order fix — see "Bugs found and fixed" below)
- [x] Phase 10 — Verification: `npm run typecheck`, `npm run lint`, `npm run test` all clean; full loop manually verified in-browser (web target)
- [x] Phase 11 — Documentation (README, ARCHITECTURE, PRODUCT, SUPABASE_MIGRATION, Edge Function stub, migration SQL)

**V1 is functionally complete against the acceptance criteria in the original brief.**

## What's seeded

Athlete 001, 13 completed sessions (2026-08-15 → 2026-09-14, rotating Free Weight → Machine/Cable → Mixed), a knee limitation in conservative mode, and a "6 Strict Push-Ups" milestone at the High Incline stage.

## Bugs found and fixed during in-browser verification (web target)

These were caught by actually clicking through the app, not just typechecking/testing — recorded here since they're the kind of thing that would resurface if UI code is touched again without re-running the app:

1. **Onboarding carousel never advanced visually.** `FlatList.scrollToIndex` doesn't reliably move a `horizontal`/`pagingEnabled`/`scrollEnabled={false}` list on react-native-web without `getItemLayout`. Fixed by dropping the FlatList entirely — button-only navigation just conditionally renders the current slide (`app/onboarding/index.tsx`).
2. **Cardio exercises displayed "20 reps · Bodyweight" instead of "20 min".** `WorkoutExercise.targetRepMin/Max` is reused to carry minutes for `CONDITIONING`-pattern exercises; Home and the Train exercise card were formatting it through the generic rep/weight formatters. Added `formatExerciseTarget`/`formatExerciseLoad` (`src/utils/format.ts`) that branch on `movementPattern`, and gave `SetRow` a `mode="cardio"` variant that labels its second field "min" and hides the weight field.
3. **Session-complete confirmation ("SESSION LOGGED") never showed — silently fell back to "No session to finish".** `workout/complete.tsx` checked `!activeWorkout` before checking the local `saved` flag; `finishWorkout` clears `activeWorkout` before the `saved` state update lands, so the empty-state guard won this race. Fixed by checking `saved` first and capturing the sets-logged count into that state instead of reading it off `activeWorkout` after the fact.

## Post-V1: UI polish pass against an external reference (2026-09-19)

The user shared a Google AI Studio–generated web prototype as a visual-direction reference (tracked under `reference/hotlink-ui-builder/` since `8a81ce5` (originally kept untracked) — not part of the app). Audit finding: the reference uses the same accent hex, three-typeface system, and dark-obsidian/copper palette `src/theme/tokens.ts` already encodes — it is not a different brand, so this was a polish/consistency pass on existing screens using existing tokens, not a redesign. See `DESIGN.md` for the resulting system-level changes (now current); summary of what changed in the app:

- `Card` moved to a lighter, more distinct surface (`colors.panel2`) for real depth against the page background; added `colors.controlBg` for raised interactive surfaces nested in a card (see DESIGN.md's "Recessed/Raised Rule"), and fixed every place that collided with the new `Card` tone (`Button` secondary, `Pill` neutral, `StatusTag` done, Home's exercise-index chip, Profile's chips/stepper/switch track, Progress's milestone progress track).
- Added `CardHeader` and `StatusTag` shared primitives (`src/components`).
- Train's set ledger now shows DONE / NOW / QUEUE row states, with the current set lifted onto `control-bg` with a copper left accent bar.
- Progress's strength trend went from a bar chart to an interactive SVG line+gradient chart (`react-native-svg`) with a tappable point callout, and recent sessions now carry a real PR badge derived from actual logged history (not a fabricated category).
- Coach's proposed adaptations now show a struck-through current vs. bold proposed value when the adaptation carries a clean numeric comparison (`SHORTEN_DURATION`, `INCREASE_CARDIO`); other adaptation types still fall back to just the label rather than fabricating a "current" value.
- `Button`'s primary variant now bakes in uppercase/tracked labels and `shadow.card`, instead of screens hand-setting uppercase copy per call site.

Verification: `npx tsc --noEmit` and `npx expo lint` clean, `npx jest src/engine` (42 tests) passing, full loop re-verified in-browser (web target) across all five tabs — including a bug caught and fixed during that pass: `TrendCard`'s outer `Pressable` had a nested `Pressable` per chart point, which is an invalid DOM nesting (`<button>` inside `<button>`) on web; fixed by making only the card's footer row navigable and leaving the chart's point dots as sibling `Pressable`s.

`reference/hotlink-ui-builder/` is excluded from `tsconfig.json`'s project so its own (unrelated, Vite/web) TypeScript errors don't pollute `npm run typecheck` output for this app.

## Known gaps / deliberately deferred (not blockers for V1)

- ~~App icon/splash are still the default Expo template assets~~ Resolved: VYNKÆR crest icons were added in `680637a`, then replaced by draft OSMIUM eclipse icons on 2026-11-04 (see the Phase 0 section below).
- No physical iOS/Android device or simulator was available in this environment; verification was done via `expo start --web` (react-native-web) plus static review of native-specific code (haptics, safe-area, `Switch`). Recommend a simulator/device pass before shipping.
- Coach transcript is not persisted across app restarts (by design for V1 — see `docs/PRODUCT.md`/`CLAUDE.md`, this was an explicit scope decision, not an oversight).
- Rotation sequence (`profile.rotationSequence`) is read-only in Profile UI — editable in the data model, no UI control yet (avoided building a control with no real effect path in the time available).

## OSMIUM migration, Phase 0 (2026-11-03 / 04)

V1 is unchanged functionally. Phase 0 added the OSMIUM audit, design system spec, architecture and roadmap under [`osmium/`](osmium/), a parallel token module (`src/theme/osmium.ts`, not yet imported), draft SVG logo masters, OSMIUM app identifiers and launcher/splash/favicon images. Checks after Phase 0: typecheck ✅, lint ✅, 42/42 tests ✅, `expo-doctor` 3 pre-existing failures. On 2026-11-04 the runtime colours were switched to the OSMIUM palette (Phase 1 task 3; copper hero glow removed, `onAccent` token added), verified on the web target. Later the same day the fonts moved to Inter (UI) / Instrument Serif (display) / IBM Plex Mono (data), replacing Cinzel and EB Garamond, and the five tabs became four destinations (Today, Training, Progress, Recovery) with Coach as a modal and Settings as a stack screen. Sections above that say Home/Train/Coach/Profile describe the earlier five-tab build. Toolchain hygiene (2026-11-04): `expo-doctor` now passes (21/21), `react-native-worklets` is a direct dependency, SDK 57 patch versions aligned, `.env` ignored. Pre-flight fixes (2026-11-04): D1 (unreadable storage no longer overwritten by the demo seed) and D2 (progression stored the next load as the performed one), test-first; 63 tests now. See [osmium/PROJECT_STATUS.md](osmium/PROJECT_STATUS.md).

Phase 1 so far (2026-11-04): colours, fonts, four-destination navigation (Today / Training / Progress / Recovery, Coach modal, Settings route) and the Today/Coach merge are done; 71 tests pass. Earlier sections of this file describe the five-tab V1 build.
