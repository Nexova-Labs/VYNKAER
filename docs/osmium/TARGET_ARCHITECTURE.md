# OSMIUM target architecture

**Principle:** evolve the existing layers. Do not add new ones until a requirement forces it. Every box below is either *exists* (verified in CODEBASE_AUDIT.md), *extend*, or *new*, and each new piece has a named trigger.

## 1. End state

```
┌──────────────────────────── Mobile / Web client (Expo SDK 57, RN 0.86, Expo Router) ───────────────────────────┐
│ app/            Routes: (tabs)/today · training · progress · recovery  + settings, exercise/[id], workout/complete │
│ src/components  Token-driven primitives + brand/ (EclipseMark, OsmiumWordmark)                     [exists/extend]│
│ src/theme       tokens.ts → OSMIUM values (osmium.ts prepared)                                     [refactor]     │
│ src/state       Split contexts: Session · Athlete · History · Coach  (useAppState kept as facade) [refactor]     │
│ src/engine      Deterministic engine — unchanged API, new pure inputs (equipment, recovery)       [exists/extend]│
│ src/services                                                                                                     │
│   storage/      Repositories (AsyncStorage) + schemaVersion + migration runner                    [extend]       │
│   sync/         Outbox + pull; reconciles local repositories with Supabase                        [new: step 10] │
│   coach/        CoachProvider: DemoCoachProvider (offline) · RemoteCoachProvider (HTTPS)          [extend: step 8]│
│   auth/         Supabase Auth client; session in SecureStore                                      [new: step 11] │
│   entitlements/ Read-only entitlement check                                                       [new: step 12] │
└──────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                                       │ HTTPS + user JWT (never an AI key)
┌──────────────────────────── Supabase ────────────────┴──────────────────────────────────────────────────────────┐
│ Auth (email / Apple / Google)                                                                         [step 11] │
│ Postgres + RLS: athletes · workout_sessions · training_state · recovery_checkins · adaptation_records          │
│                 · coach_messages · entitlements                                    [draft exists → step 10/11] │
│ Edge Functions: coach-proxy (JWT verify → context assembly → Claude → schema-validate → proposal)  [stub → 8]  │
│                 subscription-webhook (store/billing provider → entitlements)                         [step 12] │
│                 account-export / account-delete                                                      [step 11] │
│ Secrets: AI provider key, billing webhook secret — server only                                                   │
└──────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                                       │
                                            Claude API (server-to-server only)
```

## 2. Invariants (do not break)

1. **`src/engine` imports only `src/types`.** No React, storage, network or AI. This is enforced by convention today; add an ESLint `no-restricted-imports` rule in step 2.
2. **Screens only talk to state.** Screens never import repositories, the engine or providers. (True today.)
3. **The engine decides, the coach proposes.** An AI response becomes a `WorkoutAdaptation` (closed union), validated twice (server and client), and applied only through `applyStructuralAdaptation` after APPLY CHANGE.
4. **Local-first for training.** A session can be started, logged and finished with no network. Sync is additive.
5. **No AI key in the bundle.** Nothing under `EXPO_PUBLIC_*` may hold a secret.
6. **Append-only history.** A completed `WorkoutSession` is immutable. Corrections are new records that reference the original.

## 3. Navigation

### Current (updated 4 Nov 2026: **implemented**)

The four-destination shell below is built: `(tabs)/` has today, training, progress, recovery; `coach/` (modal) and `settings/` are stack routes; `TabHeader` gives Coach and Settings access from every tab. The paragraph that follows describes the pre-change five-tab layout.
`app/(tabs)/_layout.tsx` has 5 tabs: home, train, progress, coach, profile. Stack routes: onboarding, workout/complete, exercise/[id]. Typed routes are on.

### Target
```
app/
  _layout.tsx                  (fonts, providers — unchanged shape)
  index.tsx                    (redirect → onboarding | (tabs)/today)
  onboarding/index.tsx         (rewritten copy)
  (tabs)/_layout.tsx           4 tabs: Today · Training · Progress · Recovery
  (tabs)/today.tsx             ← home.tsx, with a "How are you feeling today?" prompt that opens the coach modal (coach.tsx became the modal)
  (tabs)/training.tsx          ← train.tsx
  (tabs)/progress.tsx          (kept)
  (tabs)/recovery.tsx          new
  settings/index.tsx           ← profile.tsx (header entry from Today)
  coach/index.tsx              optional full-screen conversation (modal) — "persistent access"
  workout/complete.tsx, exercise/[id].tsx  (kept)
```

**Decided (4 Nov 2026): option (a).** *Original framing:* where the Coach lives. v2 asks for "persistent access to the coach". The options are:
- **(a)** A coach composer embedded at the bottom of Today, plus a `coach` modal route reachable from any tab header. *Recommended.* It keeps 4 tabs and puts the coach one tap from anywhere.
- **(b)** Coach as the Today tab itself, with Home's plan card at the top of the conversation.
- **(c)** A floating action button on every tab. Rejected because it adds chrome and clutter.

**Migration safety:** rename the files in one commit. `tsc` (typed routes) fails on every stale `href`, so the checker finds every broken link. Keep a `home.tsx` → `today` redirect only if deep links have shipped (they haven't), so no redirect is needed.

## 4. State layer evolution

Today: one `AppStateContext` (501 lines) holds everything.

Target (step 3 onward, incrementally):

| Context | Owns | Persisted via |
|---|---|---|
| `SessionContext` | `activeWorkout`, set mutations, rest, finish | WorkoutRepository |
| `AthleteContext` | profile, settings, limitations | AthleteRepository, SettingsRepository |
| `HistoryContext` | history, trainingState, `currentPlan` derivation | WorkoutRepository, TrainingStateRepository |
| `CoachContext` | transcript, pending proposals, `AdaptationRecord`s | new CoachRepository |
| `RecoveryContext` | check-ins | new RecoveryRepository |

`useAppState()` stays as a facade composing these, so screens migrate one at a time. **Trigger:** adding Recovery and Coach memory to the single context would push it past ~800 lines and re-render the Training screen on every keystroke in the coach composer.

## 5. Offline-first sync (step 10, design sketch, not decided)

- **Source of truth:** the device, for the in-progress session. The server, for completed history once synced.
- **Write path:** each repository write also enqueues an outbox entry `{entity, id, op, payload, clientUpdatedAt}`. A sync worker drains the outbox when online.
- **Conflict policy:**
  - `workout_sessions`: immutable after completion → no conflicts (append only; the id is client-generated).
  - `athlete profile`, `settings`: last-writer-wins per field with `updatedAt`.
  - `training_state`: **derived**. Recompute it from history on the server or the client instead of merging it. This removes the hardest conflict class.
- **IDs:** switch `generateId` to UUID v4 (`expo-crypto` `randomUUID`) **before** any record is synced, so the schema stays `uuid`. Existing local seed IDs are migrated once.
- **Open questions:** multi-device with an active session on two devices at once (proposal: the server rejects a second `IN_PROGRESS` session for the same athlete); a sync library vs hand-rolled (evaluate PowerSync / WatermelonDB vs a small outbox; recommend hand-rolled until it is shown to be insufficient, because the data volume is tiny).

## 6. Coach integration (step 8)

```
Client RemoteCoachProvider.sendMessage(text, context)
  → POST /functions/v1/coach-proxy   { message, contextSummary }   Authorization: Bearer <user JWT>
Edge Function
  1. Verify JWT, resolve athlete_id (RLS-scoped client)
  2. Rate-limit per user
  3. Assemble context FROM THE DATABASE (not trusting client-sent history), tagged by provenance class
  4. Call Claude with a system prompt that: may only output {message, proposedAdaptation?} JSON;
     must choose adaptation.type from the closed union; must not output loads
  5. Validate against the schema; on failure → return message only, no proposal
  6. Persist coach_messages + a PENDING adaptation_record
  7. Return CoachResponse
Client shows the proposal → APPLY / DISMISS → adaptation_record status updated → applyStructuralAdaptation
```

`DemoCoachProvider` remains the fallback when offline, unauthenticated or on error. The selection happens in one place (a provider factory in `src/services/coach/index.ts`).

## 7. Auth and security (step 11)

- Supabase Auth. Sign in with Apple is required on iOS if any other social login is offered.
- Session tokens go in `expo-secure-store`, not AsyncStorage.
- RLS on every table, with **explicit** `USING` and `WITH CHECK`. `athletes.user_id` gets `unique`.
- Account deletion: an Edge Function that cascades and removes the auth user (required by the App Store).
- Export: an Edge Function that returns a JSON bundle of all athlete rows.
- The `scheme` (deep link / OAuth redirect) must be final before auth is configured. See CODEBASE_AUDIT.md §9.

## 8. Subscriptions (step 12, provider undecided)

- An `entitlements` table (athlete_id, product, status, expires_at, source). Clients get **read-only** access via RLS.
- Writes come only from a server webhook (store server notifications or a billing aggregator).
- The client gates features on entitlements but **never gates access to the athlete's own history or its export**. Holding user data hostage conflicts with the trust model and with store policy.

## 9. What we explicitly will not add yet

GraphQL, a state library (Redux/Zustand: the context split is enough), a monorepo, a separate API server, analytics SDKs, or feature-flag services. Each needs a concrete requirement first.
