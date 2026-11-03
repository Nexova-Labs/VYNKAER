# VYNKÆR → OSMIUM gap analysis

Verdicts: **Retain** = keep as is · **Refactor** = same capability, restructured or restyled · **Extend** = keep and add to · **Replace** = remove and substitute · **Build new** = does not exist.

The evidence for every "exists today" claim is in [CODEBASE_AUDIT.md](CODEBASE_AUDIT.md).

## Summary

| Area | Verdict | One-line rationale |
|---|---|---|
| Brand identity | **Replace** | Name, mark, voice and copper identity are all VYNKÆR-specific |
| Design tokens | **Refactor** | The token architecture is sound; values change. A same-key swap is already prepared |
| Typography | **Replace** (display/UI) · **Retain** (data) | Cinzel and Garamond don't match v2. Plex Mono fits the tabular-data role |
| Navigation | **Refactor** | 5 tabs → 4 destinations; Home and Coach merge |
| Main screens | **Refactor** ×3 · **Build new** ×1 | Today, Training and Progress evolve from existing screens. Recovery is new |
| Workout experience | **Retain + Extend** | Logging, rest timer, resume and substitute all work. Add instructions, undo and a substitution drawer |
| Training engine | **Retain** | Deterministic, explained, tested. Fix two state-layer bugs around it |
| Coaching intelligence | **Extend** | Keep the `CoachProvider` contract and approval gate; add a server-side LLM provider |
| Personalisation | **Extend** | The profile model covers about half the target. Add recovery, equipment, schedule, provenance |
| Persistence | **Refactor** (now) · **Extend** (later) | Fix the destructive fallback, add schema versioning, then an offline-first sync |
| Security | **Build new** | No auth, no server, no data-rights flows yet. A clean slate with a good stub |
| Testing | **Extend** | Engine is well tested; state, coach and UI are untested |
| SaaS readiness | **Build new** | No accounts, entitlements, billing or telemetry |

---

## 1. Brand identity: **Replace**

| Element | VYNKÆR today | OSMIUM target | Notes |
|---|---|---|---|
| Name | "VYNKÆR Training" (`app.json`, 5 literals in code) | "OSMIUM" | Display strings are safe to change. For identifiers see CODEBASE_AUDIT.md §9 |
| Mark | `Crest.tsx` + crest-based icon/splash PNGs | Eclipse symbol, wordmark, combined signature | Blocked on the vector masters |
| Voice | Doctrine fragments ("FORGED, NOT BORN.") | Discreet, engineered, calm, humane | Onboarding and Home copy must be rewritten |
| Texture | Grain overlay, copper glows | None; true black, 1px rules | Remove |
| Tagline | "Train what comes next." | "A trainer that evolves with you." | |

**Rationale:** v2 locks the name, the three logo treatments and the restrained black/blue/silver language. Nothing from the VYNKÆR identity layer carries over, apart from structural design rules that are brand-neutral.

## 2. Design tokens: **Refactor**

The token *architecture* works: one module, semantic keys, and zero hard-coded colours outside it bar one. That is exactly what makes a rebrand cheap. `src/theme/osmium.ts` provides the same key set with OSMIUM values. Phase 1 swaps `tokens.ts` to re-export them.

**Changes beyond colour:** radius shrinks (18–22 → 12 for cards), motion tightens (`slow` 340 → 220), and spacing moves onto the 8-pt grid (20/28/40 → 24/32/48). These change layout, so they need a browser pass per screen, not just the token swap. **Roadmap step 1 swaps colours only.** Radius, spacing and motion ship with step 2 (component migration).

## 3. Typography: **Replace** display/UI, **Retain** data

| Role | Today | OSMIUM | Verdict |
|---|---|---|---|
| Display | Cinzel (eyebrows), EB Garamond (titles) | Canela-like serif → proposed Instrument Serif | Replace |
| UI | System sans | Neo-grotesk → proposed Inter | Replace (add) |
| Data | IBM Plex Mono | Tabular numerals | **Retain** |

**Rationale:** the Measured-Value Rule (every standalone number in mono) is already what v2 asks for. Keeping Plex Mono removes one font migration. The display and UI roles have no close match today. See DESIGN_SYSTEM_V2.md §4 for the non-breaking install-then-switch sequence.

## 4. Navigation: **Refactor**

| Today (5 tabs) | OSMIUM (4) |
|---|---|
| Home | **Today** (merged with Coach) |
| Coach | → merged into Today, plus persistent access (e.g. composer or sheet) |
| Train | **Training** |
| Progress | **Progress** |
| Profile | → header entry point (settings, profile, limitations editor moves partly to Recovery) |
| — | **Recovery** (new) |

**Rationale:** v2 sets "four primary destinations at most, with persistent access to the coach". Expo Router file routes make this mostly a matter of moving files. The risk is in **typed routes** (`experiments.typedRoutes`): every `href="/(tabs)/home"` must be updated, and `tsc` will catch the misses. Details in TARGET_ARCHITECTURE.md §3.

## 5. Main screens

| Screen | Verdict | Keep | Change / add |
|---|---|---|---|
| **Today/Coach** | Refactor | Plan card, `generationExplanation` "why" block, Start CTA, Coach proposals with APPLY CHANGE, struck-through current vs proposed values | Merge the screens. Make "How are you feeling today?" the primary prompt. Add a readiness check-in (self-report only). Cap quick chips at 4 (critique P2). Shorten the hero title (critique P1). Add a dismiss action for proposals |
| **Training** | Refactor | `train.tsx`, SetRow, ExerciseCard, RestTimer, SessionProgress, skip/substitute, resume-on-boot | Exercise instructions (new data field). Substitution drawer. Undo for remove/skip. Effort/limitation feedback during the session, not only at the end |
| **Progress** | Refactor | Real-history trend chart, PR badges from logged data, exercise drill-down, milestones | Volume and adherence views. "Insufficient data" states. Remove the gradient fill. Explanation lines grounded in logs |
| **Recovery** | **Build new** | Limitation model + safety engine as the constraint backend | Self-report inputs (fatigue, energy, soreness, sleep, pain) stored with their provenance. No scores without a method |

## 6. Workout experience: **Retain + Extend**

**Works today (by code reading):** start session (freezes the plan), set logging with weight/reps/RPE, add/remove set, toggle complete with haptic, load override, skip, one-tap substitute (first library alternative), rest timer, session progress, finish with feedback (session RPE, limitation before/after, cardio minutes, strongest/weakest, notes), resume an interrupted session after an app kill, offline (no network calls at all).

**Gaps:** instructions/cues per exercise (`Exercise` has no such field), choosing *which* substitute, undo, warm-up sets, per-set RPE feeding progression (D3), plate math (the AI Studio reference had a plate calculator).

## 7. Training engine: **Retain**

**Rationale:** it is deterministic, explainable, tested (42 passing) and isolated from React, storage and AI. It is the architectural embodiment of "a trainer that evolves with you". It needs no change for OSMIUM.

**Adjacent fixes (state layer, not engine):** D2 (double increment) and D3 (logged weights and RPE) sit in `AppStateContext.finishWorkout`. The fix is to store the load *performed* and let the generator decide. That matches what the seed already does, so the engine stays as it is.

**Later extensions (engine, with tests first):** equipment availability (home vs gym) as a selection filter; a real effect for HIP/ELBOW/WRIST limitations; recovery-aware target RPE using only self-reported inputs; producers for `DELOAD`.

## 8. Coaching intelligence: **Extend**

| Keep | Add |
|---|---|
| `CoachProvider.sendMessage(message, context) → CoachResponse` | `RemoteCoachProvider` that calls the Supabase Edge Function |
| `WorkoutAdaptation` closed union of 7 types | Validation of model output against that union server-side and client-side |
| APPLY CHANGE gate | Approval *history* (proposal, decision, time, provenance) persisted |
| `DemoCoachProvider` as an offline fallback and test double | Fix D6. Keep it as the no-network path |

**Rationale:** the contract was designed for exactly this swap. Never let the LLM produce loads directly; it may only propose one of the typed adaptations, and the engine computes the consequences. Detail in DATA_AND_AI_STRATEGY.md.

## 9. Personalisation: **Extend**

| Target dimension | Today | Gap |
|---|---|---|
| Profile, goals | `AthleteProfile.trainingGoal`, `trainingStyles`, `sessionsPerWeek` | — |
| Exercise / modality preferences | `preferences: PreferenceTag[]`, `rotationSequence`, `varietyEnabled` | Dislikes / never-program list |
| Sessions, per-exercise performance, overload history | `WorkoutSession[]`, `exerciseProgression` | Per-set weight/RPE into progression (D3) |
| Perceived exertion | Set RPE, session RPE | — |
| Energy, fatigue, sleep, soreness | — | **New** `RecoveryCheckIn` |
| Pain / limitations | `AthleteLimitation[]` with conservative mode; before/after pain at finish | Time series; effect for all areas (D10) |
| Equipment, gym vs home | Implicit in modality | **New** `TrainingContext` (location, equipment set) |
| Schedule / time | `preferredDurationMinutes`, per-session shorten | Weekly availability |
| Milestones | `Milestone` with stages | — |
| Coach proposals + approvals | Transient | **New** persisted `AdaptationRecord` |
| Provenance (fact / self-report / derived / AI) | Not modelled | **New**, see DATA_AND_AI_STRATEGY.md §2 |

## 10. Persistence: **Refactor** now, **Extend** later

- **Now:** fix D1 so a failed read never seeds over data. Add a `schemaVersion` key plus a migration runner. Surface write failures.
- **Later:** an offline-first sync (local remains the source of truth for in-progress sessions; append-only session log; server reconciles). The current repository interfaces are the seam; `docs/SUPABASE_MIGRATION.md` is already the plan.

## 11. Security: **Build new**

There is no auth, no server and no data export or deletion. That is correct for a local demo. The design hooks already exist (the Edge Function stub with JWT verification, RLS policies). Gaps to close before any real user data: auth, an explicit `WITH CHECK` on RLS, a unique `athletes.user_id`, uuid/ID alignment, export/delete, a consent record, at-rest posture, `.env` in `.gitignore`, rate limiting on the coach proxy, and prompt-injection-safe context assembly.

## 12. Testing: **Extend**

| Layer | Today | Add |
|---|---|---|
| Engine | 42 tests | Equipment and recovery cases as they are added |
| State | 0 | `finishWorkout` progression (D2/D3/D4), `applyStructuralAdaptation` per type, approval cannot be bypassed |
| Storage | 0 | Read-failure must not seed (D1); schema migration |
| Coach | 0 | Intent mapping (D6); proposals are always typed |
| UI | 0 | At minimum, smoke-render each route with jest-expo; browser verification per the CLAUDE.md rule |

## 13. SaaS readiness: **Build new**

This needs accounts (Supabase Auth), an entitlements table, a subscription lifecycle (store billing via a provider; **the provider is undecided**), consent-gated analytics, crash reporting, store metadata, a privacy policy and terms. **None of this should start until the core loop and sync are trustworthy** (roadmap steps 10–12).
