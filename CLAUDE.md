# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start          # Expo dev server (scan QR with Expo Go, or press i/a/w)
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run web             # Web (used for fast iteration/browser verification)
npm run typecheck       # tsc --noEmit
npm run lint             # expo lint (flat ESLint config, eslint-config-expo)
npm run test             # jest (engine unit tests)
npx jest src/engine      # run only the training-engine test suite
npx jest -t "8/8/8"      # run a single test by name pattern
```

There is no build step for the prototype — Metro bundles on demand. `npx expo lint` and `npx tsc --noEmit` are the two checks to run before considering any change done.

## Architecture

VYNKÆR Training is an Expo Router app with a strict separation between **UI**, **persisted state**, and a **deterministic training engine**. The engine has zero React/AI dependencies — it is plain TypeScript that could run in a test runner or a future server with no changes.

```
src/types        Shared domain model (single source of truth — engine, state and UI all import from here)
src/engine       Pure functions: rotationEngine, progressionEngine, safetyEngine, workoutGenerator.
                 generateWorkout(context) is the single entry point the rest of the app calls.
                 No imports from src/state, src/services, or React — keep it that way.
src/data         EXERCISE_LIBRARY (the exercise catalog) and SEED_* (Athlete 001's seeded profile/
                 history/training state). seed.ts is allowed to import from src/engine to derive
                 realistic seeded values, but src/engine must never import back from src/data at
                 the type level beyond src/types — the one-way dependency keeps the engine testable
                 in isolation (see src/engine/__tests__).
src/services     storage/* — AsyncStorage repositories (Athlete/Workout/TrainingState/Settings),
                 the only code allowed to call AsyncStorage directly. coach/* — DemoCoachProvider,
                 a keyword-driven CoachProvider implementation; swapping in a real Claude-backed
                 provider later means implementing the same CoachProvider interface, not touching
                 the UI (see docs/SUPABASE_MIGRATION.md for the intended server-proxy path).
src/state        AppStateContext is the one React context the whole app reads/writes through
                 (useAppState()). It owns: loading persisted data on mount, computing the current
                 draft plan via generateWorkout, starting/logging/finishing a workout, applying
                 Coach adaptations, and persisting on every mutation. Screens never call a
                 repository or the engine directly — they go through this context.
src/components   Generic, theme-driven UI primitives (Card, CardHeader, Button, Pill, StatusTag,
                 StatTile, ScreenContainer...). See DESIGN.md for the surface/color rules governing
                 how these compose (e.g. what's allowed to sit inside a Card).
src/features     Screen-specific but multi-file UI (currently just workout/: SetRow, ExerciseCard,
                 RestTimer, SessionProgress, used by app/(tabs)/train.tsx).
src/theme        Design tokens (colors, spacing, radius, typography). Screens should not hardcode
                 colors/spacing — pull from here so the dark/copper language stays consistent.
app/             Expo Router file-based routes. app/(tabs)/ is the five-tab shell (home, train,
                 progress, coach, profile). app/workout/complete.tsx is the post-session feedback
                 form. app/exercise/[id].tsx is the per-exercise history drill-down from Progress.
```

### The core loop (how a screen actually changes what happens next)

`AppStateContext` holds `currentPlan: GeneratedWorkout | null` (a draft, recomputed by `generateWorkout` whenever training state changes) and `activeWorkout: WorkoutSession | null` (frozen the moment "Start Workout" is pressed, then mutated in place as sets are logged). Coach adaptations and manual Train-screen actions (skip/substitute) both go through `applyStructuralAdaptation` (`src/state/adaptation.ts`) against whichever of the two currently exists — this is why the Coach can never silently change a workout: every adaptation is staged as a `WorkoutAdaptation` proposal in the UI and only applied when the athlete taps **APPLY CHANGE**.

`finishWorkout` is the one place progression is recalculated: it runs `decideProgression` per logged exercise, rotates modality via `getNextModality`, appends the session to history, and regenerates `currentPlan` for the next visit to Home — this is the "history → generate → train → log → progress → next workout" loop the whole product is built around.

### Conventions worth knowing

- `WorkoutExercise.targetRepMin/Max` is overloaded for conditioning entries — a `CONDITIONING`-pattern exercise stores **minutes**, not reps. Always format through `formatExerciseTarget`/`formatExerciseLoad` (`src/utils/format.ts`), never `formatRepRange`/`formatWeight` directly, when the exercise's `movementPattern` might be `CONDITIONING`.
- Screens must not render before `AppStateProvider` has finished its initial AsyncStorage load — it renders its own loading view internally and only mounts `children` (and therefore the router) once `profile`/`trainingState`/`settings` are all loaded, so `useAppState()` is safe to call unconditionally in any screen under `app/`.
- Persisted keys live in `StorageKeys` (`src/services/storage/storage.ts`) — add new persisted state there rather than inlining string keys.
- `Card`'s background is `colors.panel2`. Anything nested inside a `Card` must use `colors.backgroundElevated` (recessed — badges, wells, tracks) or `colors.controlBg` (raised — buttons, chips, the active `SetRow`), never `colors.panel2` itself, or it visually disappears into the card. See DESIGN.md's "Recessed/Raised Rule."
