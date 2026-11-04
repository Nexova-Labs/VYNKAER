# OSMIUM implementation roadmap

This adds engineering detail to the hand-off *Product & Engineering Roadmap* (phases 0–5). Steps 1–7 make up **Phase 1, OSMIUM Alpha**. Steps 8–9 are Phase 2, steps 10–11 Phase 3, and step 12 Phase 4.

**Step 0 (pre-flight) is a prerequisite for everything:** fix data-integrity defects D1/D2 and the toolchain doctor findings. Visual work must not ship on top of a progression bug.

## Status (4 Nov 2026)

| Step | State |
|---|---|
| Phase 0 (audit, docs, tokens module, brand drafts, identifiers, icons) | **Done** |
| 0 Pre-flight | Not started (D1, D2, doctor findings still open) |
| 1 Colour tokens | **Done 4 Nov** (`tokens.ts` → `osmiumColors`, hero glow removed, tab tint → blue, `onAccent` fix). Verified on web at 375×812 across all tabs plus an active workout; grain texture, Crest and gradients intentionally left for step 2 |
| 2–12 | Not started |

## Dependency graph

```
0 Pre-flight (integrity + toolchain)
└─► 1 Design tokens ─► 2 Shared components ─► 3 Navigation ─┬─► 4 Today/Coach ─┐
                                                            ├─► 5 Training      ├─► 8 AI Coach ─► 9 Athlete memory
                                                            ├─► 6 Progress      │
                                                            └─► 7 Recovery ─────┘
   Brand vector masters (design) ─────────────────► 2 (EclipseMark/Wordmark), app icon/splash
9 ─► 10 Cloud sync ─► 11 Auth & security ─► 12 Subscriptions
     (11 must be designed alongside 10: sync needs auth; build order is auth-first within Phase 3)
```

---

### Step 0: Pre-flight
- **Scope:** D1 (seed-overwrite on read failure), D2 (double increment), D4 (no-op pain flag), D5 (plan not regenerated after FLAG_LIMITATION); `npx expo install --check`; add `react-native-worklets`; remove `newArchEnabled`; add `.env` to `.gitignore`.
- **Risk:** the D2 fix changes the next recommended load for anyone with logged sessions. Seeds are unaffected (the seed already stores the performed load).
- **Acceptance:** new tests reproduce D1/D2/D4/D5 and fail before the fix, then pass; the 42 engine tests are unchanged and pass; `expo-doctor` passes all checks; typecheck/lint are clean.

### Step 1: Design system integration (colours)
- **Depends on:** 0.
- **Scope:** `src/theme/tokens.ts` `colors` → `osmiumColors`. Remove the copper hero glow (`home.tsx:166`). Tab active tint → `accent`. (`app.json` bg colours and launcher/splash images were already switched on 4 Nov.)
- **Risk:** low contrast in places that relied on copper for emphasis; `accentSoft`→titanium flattens some eyebrows (intended).
- **Acceptance:** `grep -rn "#975a36\|accentSoft" src/theme/tokens.ts` shows no copper; every screen checked in the browser at 375×812 with screenshots; no text pair below 4.5:1 (DESIGN_SYSTEM_V2.md §3.5).

### Step 2: Shared component migration
- **Depends on:** 1. Brand vector masters for the brand components only.
- **Scope:** radius / spacing / motion tokens; Card, Button, Pill, StatusTag, StatTile, SectionHeader→TechnicalLabel, CardHeader, EmptyState (+ insufficient-data variant), ScreenContainer (drop GrainTexture); typography (install Inter + Instrument Serif alongside, then switch roles); reduced-motion support; an ESLint `no-restricted-imports` guard for `src/engine`.
- **Risk:** the larger type scale causes wrapping regressions; font load time at splash.
- **Acceptance:** no component reads `fontFamily.display` (Cinzel); Cinzel and EB Garamond removed from `package.json`; each primitive renders the default, pressed, disabled and focus states on web; all 5 current screens re-verified.

### Step 3: Navigation restructuring
- **Depends on:** 2.
- **Scope:** 4 tabs (Today, Training, Progress, Recovery); Profile → `settings/` route via a header button; coach access per TARGET_ARCHITECTURE.md §3 option (a).
- **Risk:** typed-route breakage (caught by `tsc`); losing Profile's limitation editor before Recovery owns it, so it stays in Settings until step 7.
- **Acceptance:** `tsc` clean; every route reachable; onboarding → Today; the deep link `/(tabs)/today` works on web.

### Step 4: Today / Coach
- **Depends on:** 3.
- **Scope:** merge the Home plan card, the "why" explanation and the coach composer; "How are you feeling today?" primary prompt; proposals with APPLY / DISMISS; chips ≤ 4; one primary action.
- **Acceptance:** a proposal can't change the plan without APPLY (test); the explanation lines shown equal `currentPlan.generationExplanation`; Start Session is above the fold at 375×812.

### Step 5: Training
- **Depends on:** 3.
- **Scope:** restyle SetRow/ExerciseCard/RestTimer/SessionProgress; substitution drawer (choose among `Exercise.substitutions`); undo for remove/skip/substitute; exercise instructions (add an optional `cues: string[]` to `Exercise`, filled for the 24 library entries); in-session limitation feedback.
- **Risk:** the `Exercise` type change touches the engine's input type. It must be additive and optional, so the engine stays untouched.
- **Acceptance:** log a full session offline (network disabled in the browser); kill and reload mid-session → resumes; undo restores the exact prior state.

### Step 6: Progress
- **Depends on:** 3; benefits from step 0's D2/D3 fix so the trends are correct.
- **Scope:** strength trend (flat stroke, real gridlines), weekly volume, adherence vs `sessionsPerWeek`, per-exercise history, milestones, insufficient-data states.
- **Acceptance:** every number on screen traces to logged sessions (a unit test for each derivation); no chart renders with fewer than 2 data points; a gradient-free chart.

### Step 7: Recovery
- **Depends on:** 3; types from DATA_AND_AI_STRATEGY.md §2.
- **Scope:** `RecoveryCheckIn` model + repository + `StorageKeys` entry; check-in UI (all fields optional; "not logged" is distinct from 0); the limitations editor moves here; recent pain trend from session before/after values plus check-ins; engine input for conservative target RPE (tests first).
- **Acceptance:** no score or percentage appears anywhere; empty state on first visit; the disclaimer is present; an engine test shows high fatigue → target RPE 6, and the existing tests are unchanged.

### Step 8: AI Coach integration
- **Depends on:** 4, 7; Supabase project (dev tier) + auth (pull forward a minimal auth slice from step 11).
- **Scope:** implement the `coach-proxy` Edge Function; `RemoteCoachProvider`; provider factory with `DemoCoachProvider` fallback; schema validation both sides; rate limit; server-side context assembly.
- **Risk:** cost, latency, prompt injection, hallucinated history. Mitigations are in DATA_AND_AI_STRATEGY.md §4.
- **Acceptance:** fixture tests where malformed or out-of-union outputs never reach APPLY; no key in the bundle (`grep` the web export for the key prefix); offline → demo coach with a visible "offline" label.

### Step 9: Structured athlete memory
- **Depends on:** 8.
- **Scope:** `AdaptationRecord` persistence + history view; transcript persistence; `TrainingContext` (gym/home/equipment); preferences/dislikes; provenance tags on every coach-visible field.
- **Acceptance:** the athlete can view and delete every memory record; coach context assembly unit-tested to include only tagged records.

### Step 10: Cloud synchronisation
- **Depends on:** 9, 11 (auth).
- **Scope:** UUID IDs + one-time local ID migration; outbox; pull; conflict policy per TARGET_ARCHITECTURE.md §5; schema v2 (unique `user_id`, explicit `WITH CHECK`, new tables).
- **Risk:** data loss during migration. Mitigation: export a local backup before the first sync, and make the migration idempotent.
- **Acceptance:** two-device test with no lost sessions; airplane-mode session syncs on reconnect; demo data is never uploaded.

### Step 11: Authentication and security
- **Scope:** Supabase Auth (+ Sign in with Apple); SecureStore tokens; RLS audit (run the `security-review` skill); account export/delete; consent screens; finalise `scheme` and bundle identifiers **before** configuring OAuth redirects.
- **Acceptance:** RLS tests (user A cannot read user B through any table); deletion removes every row; security review findings closed.

### Step 12: Subscription infrastructure
- **Depends on:** 11. **Provider undecided.**
- **Scope:** entitlements table + webhook; client gating; restore purchases; history and export never gated.
- **Acceptance:** sandbox purchase → entitlement within 1 minute; an expired entitlement still allows history view and export.

## Cross-cutting risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Vector logo masters arrive late | Medium | Blocks icon/splash/brand components only | Everything else proceeds; brand components behind one file each |
| Font licensing (if Canela/Neue Haas are chosen) | Medium | Delays the step 2 typography sub-task | Ship on open-licence stand-ins; the swap is a token change |
| Bundle-ID decision deferred too long | Medium | Expensive after store submission or OAuth setup | Decide before step 11; nothing is published today |
| No native device verification so far | High | Native-only bugs (haptics, Alert, splash) | EAS dev build after step 0 (worklets fix); device pass per phase |
| Coach LLM proposes unsafe changes | Low (gated) | Trust | Closed union + engine-computed loads + APPLY gate + tests |
