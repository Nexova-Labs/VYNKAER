# Supabase migration path (future — not required for V1)

V1 is intentionally local-first: one athlete, `AsyncStorage`, no network dependency. This document describes how the same domain model would move to Supabase for cross-device sync and multi-athlete support, without changing the training engine or the state-layer contract screens already depend on.

## Why the migration is low-risk

`src/state/AppStateContext.tsx` only ever calls the repository interfaces in `src/services/storage` (`AthleteRepository.load/save`, `WorkoutRepository.loadHistory/appendCompletedSession/loadActiveWorkout/saveActiveWorkout`, `TrainingStateRepository.load/save`, `SettingsRepository.load/save`). None of it awaits anything AsyncStorage-specific. Swapping each repository's implementation to call Supabase instead — same method signatures, same return types (`src/types`) — requires zero changes to the engine or to any screen.

## Draft schema

```sql
-- see supabase/migrations/0001_initial_schema.sql for the runnable version

create table athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  display_name text not null,
  profile jsonb not null,          -- AthleteProfile minus id/displayName, versioned as a document
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references athletes not null,
  workout_number int not null,
  date timestamptz not null,
  session jsonb not null,          -- WorkoutSession, stored as a document rather than fully normalized
  created_at timestamptz not null default now()
);

create table training_state (
  athlete_id uuid primary key references athletes,
  state jsonb not null,            -- TrainingState
  updated_at timestamptz not null default now()
);
```

`profile`/`session`/`state` are stored as `jsonb` documents matching the existing TypeScript types rather than being fully normalized relationally — this keeps the migration mechanical (serialize the same object, no ORM mapping layer) and defers normalization (e.g. a proper `sets` table for cross-athlete analytics) to when there's an actual multi-athlete analytics need.

## Row Level Security

Every table above would ship with RLS restricting `athlete_id`/`user_id` to `auth.uid()`, so a signed-in athlete can only ever read or write their own rows:

```sql
alter table athletes enable row level security;
create policy "Athletes manage their own row" on athletes
  for all using (user_id = auth.uid());

alter table workout_sessions enable row level security;
create policy "Athletes manage their own sessions" on workout_sessions
  for all using (athlete_id in (select id from athletes where user_id = auth.uid()));
```

## What changes, what doesn't

| Layer | Change required |
|---|---|
| `src/types` | None — the same shapes serialize to `jsonb` as they do to `AsyncStorage`. |
| `src/engine` | None — still pure functions, still takes the same context shape. |
| `src/services/storage/*Repository.ts` | Reimplemented against `@supabase/supabase-js` instead of `AsyncStorage`, same exported method names/signatures. |
| `src/state/AppStateContext.tsx` | None, or minimal — it calls the repository interface, not AsyncStorage. |
| `app/**` screens | None. |

## Auth

Supabase Auth (email/magic-link to start) would gate the app before the existing onboarding flow, replacing the current "always Athlete 001" seed with "load or create the signed-in user's athlete row." Onboarding's copy and screens stay the same; only what happens after "ENTER VYNKÆR" changes.
