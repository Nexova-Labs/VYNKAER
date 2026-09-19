# VYNKÆR Training

*by Nexova Labs*

A training system that remembers every set. VYNKÆR doesn't ask "what workout should I do?" — it answers "what should this athlete do next, given everything they've already done?" Modality rotation, load progression, session duration, and conditioning are all decided by a deterministic TypeScript engine that reads the athlete's real history — not an LLM guessing fresh each time.

This is the V1 prototype: a working iOS/Android app (via Expo), seeded with one athlete (Athlete 001) and thirteen sessions of realistic history, that runs the full loop — history → generate → train → log → progress → next workout — with no backend and no API key required.

## Screenshots

_placeholder — add screenshots of Home, Train, Progress, Coach and Profile here once captured on-device._

## Running it

Requires Node 18+ and the Expo CLI (`npx` handles it, nothing to install globally).

```bash
npm install
npm run start       # then press i (iOS sim), a (Android emulator), or w (web)
```

Or target a platform directly:

```bash
npm run ios
npm run android
npm run web
```

No environment variables, accounts, or API keys are needed. All data lives in `AsyncStorage` on-device.

### Checks

```bash
npm run typecheck
npm run lint
npm run test         # 42 unit tests covering the training engine
```

### Resetting the seeded demo data

Open **Profile → Data → Reset demo data**. This restores Athlete 001, the 13-session seed history, and the seeded training state, and clears any in-progress workout.

## The demo flow

1. Launch → onboarding (skippable) → Home.
2. Home shows Workout 14, already generated from the seeded history, with a plain-English explanation of why (modality rotation, which lifts are progressing, why cardio moved from 18 to 20 minutes, the current push-up milestone).
3. **Start Workout** → Train: log sets, adjust weight/reps, use the rest timer, skip or substitute an exercise.
4. **Finish & Save** → rate session effort, knee/limitation before and after, cardio minutes → **Session Logged**.
5. Back on Home, the workout number has advanced, modality has rotated, and load recommendations reflect what was just logged.
6. Progress reflects the new session immediately (strength trend chart, volume, adherence).
7. Coach can propose a change (e.g. "I only have 40 minutes") — nothing is modified until **APPLY CHANGE** is tapped.
8. Close and reopen the app — an in-progress workout, or the freshly generated next one, is exactly where you left it.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full breakdown. In short: a pure-TypeScript training engine (`src/engine`) with no UI or storage dependencies, a single state layer (`src/state/AppStateContext.tsx`) that repositories and screens go through, and Expo Router screens under `app/` that only ever call `useAppState()`.

## Product direction

See [docs/PRODUCT.md](docs/PRODUCT.md) for the positioning, philosophy, and what V1 deliberately does not do.

## Future integrations

VYNKÆR V1 has no backend and no AI provider dependency by design. The upgrade paths are documented but not required to run the app:

- **Supabase** (auth, cross-device sync, hosted history) — [docs/SUPABASE_MIGRATION.md](docs/SUPABASE_MIGRATION.md), with draft schema under [supabase/migrations](supabase/migrations).
- **Claude-backed Coach** — the `CoachProvider` interface (`src/types/index.ts`) is already what a real provider would implement; `DemoCoachProvider` (`src/services/coach`) is the only piece that would be swapped. A Claude API key must never ship inside the mobile bundle — see the Edge Function stub at [supabase/functions/coach-proxy](supabase/functions/coach-proxy) for the intended server-side shape.
