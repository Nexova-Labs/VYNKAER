# Architecture

## Layering

```
UI (app/, src/components, src/features)
        │  useAppState()
        ▼
State (src/state/AppStateContext.tsx)
        │             │
        ▼             ▼
Persistence      Training Engine
(src/services/    (src/engine — pure functions,
 storage)          no React, no storage, no AI)
        │
        ▼
   AsyncStorage
```

The engine never imports React, AsyncStorage, or anything from `src/services`/`src/state`. It takes a `WorkoutGenerationContext` (or the smaller inputs `decideProgression`/`getNextModality`/`isExerciseSafe` need) and returns plain data. This is what makes it unit-testable without mocking a single thing (see `src/engine/__tests__`) and what makes the product promise — "the app keeps working with no AI API" — actually true rather than aspirational.

## Domain model

`src/types/index.ts` is the one file every other layer imports from. Notable shapes:

- **`AthleteProfile`** — long-term configuration (goal, styles, rep range, rotation sequence, limitations, preferences, milestones). Edited from Profile, read by the generator.
- **`TrainingState`** — the athlete's current position: last/next modality, sessions completed, last cardio duration, recent session RPEs, active limitations, and `exerciseProgression: Record<exerciseId, ExerciseProgressionState>` — the engine's memory of what happened last time for every movement.
- **`WorkoutSession` / `WorkoutExercise` / `SetLog`** — both the generated plan shape and the logged/completed shape (a `GeneratedWorkout` becomes a `WorkoutSession` the moment "Start Workout" is pressed, via `buildSessionFromGeneratedWorkout` in `src/state/sessionBuilder.ts`).
- **`WorkoutAdaptation`** — a proposed, structured change (shorten duration, remove a movement pattern, increase cardio, substitute an exercise, flag a limitation, ease/harden today) that the Coach can suggest but never apply on its own.

## Training engine

| File | Responsibility |
|---|---|
| `rotationEngine.ts` | Given the last modality (and an optional custom sequence), returns the next one. Pure lookup table, no state. |
| `progressionEngine.ts` | `decideProgression(...)` — the load/rep decision for one exercise from its logged sets. Encodes the "top of range → increase; in range → maintain; below range or high effort → maintain/reduce" rules, and always returns a human-readable `reason`. |
| `safetyEngine.ts` | `isExerciseSafe`, `getSafeAlternative`, `shouldUseConservativeSelection` — the limitation-aware guardrails the generator consults before assigning or progressing an exercise. |
| `workoutGenerator.ts` | `generateWorkout(context)` — the orchestrator. Picks modality (via rotationEngine), selects exercises per movement pattern for that modality (substituting/dropping unsafe ones via safetyEngine), assigns load/reps per exercise (via progressionEngine against `TrainingState.exerciseProgression`), adapts to the requested duration (compounds are never dropped — accessories go first), progresses cardio gradually, and returns a `generationExplanation: string[]` describing every decision in plain language. |

`generateWorkout` is deterministic for a given input, plus an optional `variantSeed` used only to vary *which* compatible exercise fills a slot when more than one qualifies — it never affects load/rep recommendations.

## State layer

`AppStateContext` (`src/state/AppStateContext.tsx`) is the only React context in the app. On mount it loads profile/history/trainingState/settings/activeWorkout from the repositories, then computes an initial `currentPlan` via `generateWorkout` if there's no workout already in progress. It exposes everything screens need — see the "core loop" section of the root `CLAUDE.md` for how a Coach adaptation, a logged set, or a finished workout flows through it.

Every mutation persists immediately (`WorkoutRepository.saveActiveWorkout` on every set edit, `TrainingStateRepository.save`/`AthleteRepository.save`/`WorkoutRepository.appendCompletedSession` on finish) — there is no separate "save" step the athlete can forget, and an in-progress workout surviving an app restart falls out of this for free rather than needing special-cased recovery logic.

## Persistence

`src/services/storage/*Repository.ts` are the only files that touch `AsyncStorage`. Each repository defensively parses what it reads (falling back to seed data if the stored shape doesn't look right) so a corrupted or outdated persisted blob can't crash the app on launch. Storage keys are centralized in `StorageKeys` (`src/services/storage/storage.ts`).

## Coach

`DemoCoachProvider` (`src/services/coach/DemoCoachProvider.ts`) implements the `CoachProvider` interface with keyword matching against the *actual* current context (profile, training state, active workout/draft plan) rather than canned strings — e.g. asking to "substitute this exercise" looks up the first non-cardio exercise in the current plan and proposes substituting that specific one. It never mutates state directly; it returns a `CoachResponse` with an optional `proposedAdaptation`, and the UI is what calls `applyCoachAdaptation` — and only when the athlete taps **APPLY CHANGE**. A production Coach would implement the same interface behind a network call (see `docs/SUPABASE_MIGRATION.md`); no UI code would need to change.
