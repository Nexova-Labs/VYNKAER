# VYNKÆR Training — Build Status

## Phase checklist

- [x] Phase 0 — Inspect repo & existing HTML prototype (`reference/vynkaer-training-v1-demo.html`)
- [x] Phase 1 — Foundation (Expo Router + TS, theme tokens, bottom nav, persistence architecture)
- [x] Phase 2 — Domain model (types, 23-exercise library, Athlete 001 seed, 13-session history, training state)
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

## Known gaps / deliberately deferred (not blockers for V1)

- App icon/splash are still the default Expo template assets — no VYNKÆR-branded icon has been designed.
- No physical iOS/Android device or simulator was available in this environment; verification was done via `expo start --web` (react-native-web) plus static review of native-specific code (haptics, safe-area, `Switch`). Recommend a simulator/device pass before shipping.
- Coach transcript is not persisted across app restarts (by design for V1 — see `docs/PRODUCT.md`/`CLAUDE.md`, this was an explicit scope decision, not an oversight).
- Rotation sequence (`profile.rotationSequence`) is read-only in Profile UI — editable in the data model, no UI control yet (avoided building a control with no real effect path in the time available).
