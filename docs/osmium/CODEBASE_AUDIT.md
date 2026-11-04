# VYNKÆR codebase audit (Phase 0)

**Audited:** 3 November 2026, branch `feature/osmium-foundation-2026-11-03` at base `8a81ce5` (`nexova/main`).
**Method:** I read the source, not just the README. Every claim below was checked against the files named. Where something is inferred and not executed, it says so.

> **Post-audit changes (4 Nov 2026):** the findings below describe the code as audited. Since then, `app.json` identifiers, launcher/splash/favicon images and docs changed; **no defect (D1-D10) has been fixed yet** and the `src/` runtime code is untouched. Typecheck/lint/tests were re-run after each commit with the same results.

---

## 0. Repository state at audit time

| Item | Value |
|---|---|
| Repository | `https://github.com/Nexova-Labs/VYNKAER` (git remote `nexova`) |
| Default branch | `main` @ `8a81ce5` "Add design critique notes and AI Studio UI reference; ignore local logs" |
| Other remote | `origin` = `yovneeshkhadun/VYNKAER`, a personal fork, **one commit behind** (`680637a`). The local `master` tracks it. The Phase 0 branch was cut from `nexova/main` because that is the named repository and has the newer commit. |
| Other branches | `ai-studio-reference` @ `6ac6a88` (both remotes). Not inspected in depth; it holds the AI Studio reference UI |
| Working tree before branching | Clean. No stashes, no untracked files |
| Tracked files | 109 |

## 1. Verification results (exact)

Run on Windows 11, Node v24.18.0, npm 11.16.0, after a clean `npm ci`:

| Command | Result |
|---|---|
| `npm ci` | **Success.** 1056 packages added in 4m. `package-lock.json` unchanged afterwards. Warnings: deprecated `glob@7`, `eslint@9.39.5` (end of support), `uuid@7`; `unrs-resolver` postinstall not covered by `allowScripts` |
| `npm run typecheck` (`tsc --noEmit`) | **Pass**, exit 0, no output. Includes the new `src/theme/osmium.ts` |
| `npm run lint` (`expo lint`) | **Pass**, exit 0, no warnings |
| `npm run test -- --runInBand` | **Pass.** 3 suites, **42/42 tests**, 14.7s (`rotationEngine`, `progressionEngine`, `workoutGenerator`) |
| `npx expo-doctor` | **3 checks failed** (pre-existing; see §1.1) |
| `npm audit` (all deps) | 57 advisories: 5 low, 44 moderate, 7 high, 1 critical |
| `npm audit --omit=dev` | 29 advisories: 1 low, 20 moderate, 7 high, 1 critical (see §7.3) |

No failures were introduced by Phase 0. All failures above already exist on `main`.

### 1.1 `expo-doctor` findings (pre-existing)

1. **`app.json` schema:** `newArchEnabled` is no longer an allowed property in SDK 57. The New Architecture is the default, so the key is dead config. *Fix:* remove the key. Low risk.
2. **Missing peer dependency `react-native-worklets`**, required by `react-native-reanimated@4.5.1`. It is present transitively in `node_modules` but not declared directly. Doctor warns the app "may crash outside of Expo Go". Reanimated is used in `home.tsx`, `onboarding/index.tsx`, `Button.tsx`, `RestTimer.tsx` and `SetRow.tsx`. *Fix:* `npx expo install react-native-worklets`. **Do this before any EAS dev build.**
3. **8 patch-version mismatches** against SDK 57 expectations (`expo` 57.0.24→57.0.31, `expo-router` 57.0.22→57.0.29, etc.). *Fix:* `npx expo install --check`. The `expo-router` bump also clears its direct high-severity advisory (§7.3), but npm's fix path points to `58.0.30`, which is SDK 58. Use the `expo install` path instead.

### 1.2 What was *not* verified

- **No native build or device run** in this environment, neither iOS nor Android. The prior build log (`docs/BUILD_STATUS.md`) says the same about V1. Everything native (haptics, safe areas, `Switch`, `Alert`, splash) is verified only by reading code.
- **The web target was not launched in Phase 0.** No UI changed, so a browser run would prove nothing new.
- **EAS builds** were not attempted (`eas.json` exists with development/preview/production profiles).

## 2. Structure and stack

| Layer | Path | Size | Notes |
|---|---|---|---|
| Routes | `app/` | 10 files | Expo Router. `index.tsx` redirects to onboarding or `(tabs)/home`. 5 tabs. `workout/complete`, `exercise/[id]`, `onboarding` |
| Types | `src/types/index.ts` | 273 lines | Single domain contract, dependency-free |
| Engine | `src/engine/` | 4 modules + 3 test files | Pure TypeScript, no React or storage imports (**verified**) |
| Data | `src/data/` | `exercises.ts` (24 exercises), `seed.ts` (Athlete 001, 13 sessions) | `seed.ts` imports from engine to derive state, which is allowed by the documented one-way rule |
| Services | `src/services/storage/*`, `src/services/coach/*` | | AsyncStorage repositories; `DemoCoachProvider` |
| State | `src/state/` | `AppStateContext.tsx` (501 lines), `adaptation.ts`, `sessionBuilder.ts` | One context for the whole app |
| UI | `src/components/` (11), `src/features/workout/` (4) | | Token-driven primitives |
| Theme | `src/theme/tokens.ts` | | Copper palette, 3 typefaces, spacing, radius, motion |
| Backend sketch | `supabase/` | 1 SQL migration, 1 Edge Function stub (all commented out) | Not deployed, not imported |
| Reference | `reference/` | 2.1 MB | Brand-bible PDF, HTML V1 demo, `hotlink-ui-builder/` (AI Studio Vite app). Excluded from `tsconfig` |

**Stack (from `package.json`):** Expo SDK 57.0.24, React Native 0.86.3, React 19.2.3, Expo Router 57, TypeScript 6.0.3 (`strict`), Reanimated 4.5.1, react-native-svg 15, AsyncStorage 2.2.0, Jest 29 + jest-expo. Typed routes are enabled. Web uses the Metro bundler.

## 3. Training engine

**Verdict: the most valuable asset in the repo. Retain it unchanged.**

- `generateWorkout(context)` (`workoutGenerator.ts`) is deterministic. Variety comes only from an explicit `variantSeed`. The pipeline is: modality rotation → limitation notice → slot selection (fixed `SLOTS` with patterns, tags, compound flags) → per-exercise progression → safety cap → duration fitting (compounds never trimmed below 2 sets) → conditioning minutes (8–28, step 1/2/3 based on last RPE) → target RPE (6 if recent average ≥ 8 or limitations are active, else 7) → `generationExplanation[]`.
- `decideProgression` (`progressionEngine.ts`) returns INCREASE / MAINTAIN / REDUCE with a plain-English `reason`. It never increases above set RPE 8.5 or session RPE ≥ 9.
- `rotationEngine.ts`: FREE_WEIGHT → MACHINE_CABLE → MIXED, with a custom sequence supported.
- `safetyEngine.ts`: limitation → exercise-flag checks (KNEE, LOWER_BACK, SHOULDER are real checks; **HIP, ELBOW, WRIST, OTHER always return "safe"**, so flagging them has no selection effect).
- Types `DELOAD` and `SUBSTITUTE` exist in `ProgressionDecisionType` but no engine path produces them.

**Tests:** 42, all passing. They cover rotation, the progression rules and the generator against the seed (determinism, limitation safety, load caps). **Untested:** `src/state/*` (including `finishWorkout`, `applyStructuralAdaptation`, `computeAdaptationMetaPatch`), `DemoCoachProvider`, the repositories and every UI component.

## 4. State, persistence and coach

- **AppStateContext** owns profile, history, training state, settings, `activeWorkout` (persisted on every mutation) and `currentPlan` (in-memory draft). Screens never touch the engine or storage directly (**verified** by grep: only the context imports repositories).
- **Persistence:** 5 keys in `StorageKeys` (`vynkaer.athleteProfile`, `.workoutHistory`, `.activeWorkout`, `.trainingState`, `.settings`). `readJSON` and `writeJSON` swallow every error.
- **Interrupted sessions:** `activeWorkout` is reloaded on boot, so a killed app resumes mid-session. This works today and the Training requirement depends on it.
- **Coach:** `DemoCoachProvider` matches keywords with regex against 7 intents and returns `CoachResponse { message, proposedAdaptation? }`. The UI shows the proposal, and only the APPLY CHANGE tap calls `applyCoachAdaptation`. **The approval gate is real.** The transcript is not persisted (a documented V1 decision).
- **Supabase:** draft schema with three tables storing JSONB documents and RLS enabled. The Edge Function is a fully commented stub describing JWT verification → Claude → validate → return a proposal without applying it.

## 5. Verified defects

These were found by reading the code. None were fixed in Phase 0 (the scope was documentation). Each is a candidate task, ordered by severity.

| # | Severity | Defect | Evidence | Consequence |
|---|---|---|---|---|
| D1 | **High: data loss** | A failed or corrupt read of stored history is treated as "first launch" and **overwrites real history with the seed** | `storage.ts:6-14` returns `null` on any error; `workoutRepository.ts:9-12` then writes `SEED_WORKOUT_HISTORY`. The same pattern is in `athleteRepository.ts:13-16` and `trainingStateRepository.ts:7-10`. `appendCompletedSession` re-reads storage before appending | One transient AsyncStorage failure or partial write permanently replaces a real athlete's log with demo data. This directly violates "historical training information must never be silently overwritten" |
| D2 | **High: progression correctness** | After a session, `lastLoad` is stored as the **next recommended** load, but the generator treats it as the load **last used** and runs progression again | `AppStateContext.tsx:330` sets `lastLoad: decision.recommendedLoad`. `workoutGenerator.ts` `planProgression` calls `decideProgression(state.lastRepsPerSet, state.lastLoad, …)`. The seed (`seed.ts` `buildExerciseProgression`) stores the load *used* | After a clean top-of-range session the next plan adds the increment **twice** (load + 2×inc), because the generator re-decides INCREASE on an already-increased load. *Inferred from code paths. Confirm with a failing test before fixing (TOMORROW_START_HERE task 1)* |
| D3 | Medium: progression fidelity | Progression uses `ex.recommendedLoad` as the load performed, not the weights actually logged per set. Per-set RPE is dropped from `ExerciseProgressionState` | `AppStateContext.tsx:318-325`; the `lastRepsPerSet` type has no weight or RPE | If the athlete edits the weight in `SetRow`, progression ignores it. The RPE gating in the generator can only see session RPE |
| D4 | Medium | Pain-worsened auto-flag is a no-op | `AppStateContext.tsx:347-350`: `autoFlagged` is a subset of `derivedFromProfile`, so the union equals `derivedFromProfile` | Reporting worse pain after a session changes nothing. The UI implies it does |
| D5 | Medium | A Coach `FLAG_LIMITATION` updates the profile and training state but **does not regenerate** `currentPlan` | `AppStateContext.tsx:236-258` returns before any `refreshPlan` | After approving "flag knee", today's draft can still contain knee-dominant work until something else regenerates it |
| D6 | Medium: coach logic | "too easy" maps to **EASIER** (reduce load). `light` matches "slightly", "lightly" | `DemoCoachProvider.ts:79` `/(too easy\|make.*easier\|light)/` | Inverted intent. Still gated by approval, so the impact is limited |
| D7 | Low | The `hapticsEnabled` setting is persisted but never read. Haptics fire unconditionally | `settingsRepository.ts:6`; calls in `AppStateContext.tsx:132,166,372`, `Button.tsx:43`, `RestTimer.tsx:37` | The setting is dead. There is no UI toggle |
| D8 | Low | Adaptations applied to the **draft** plan are in memory only and are discarded by Regenerate or a restart | `applyCoachAdaptation` → `setCurrentPlan` with no persistence | An approved change can vanish silently, which conflicts with the approval-history goal |
| D9 | Low: web only | Reset demo data uses `Alert.alert` with buttons, which react-native-web does not implement | `profile.tsx:88-97` | Reset probably does nothing on web. *Not executed. Verify in the browser* |
| D10 | Info | Flagging HIP/ELBOW/WRIST/OTHER has no effect on selection | `safetyEngine.ts` `LIMITATION_FLAGS` | The athlete believes a constraint is active when it isn't |

## 6. UI, theme and components

- **Token discipline is strong.** The only hard-coded colour outside `tokens.ts` is the copper hero glow `rgba(183,90,55,…)` in `home.tsx:166`. 25 files read `colors.*`; 7 read `fontFamily.*`.
- **Accent usage:** `accentSoft` 16 sites, `accent` 14, `accentBorder` 6, `accentSurface` 5, `accentStrong` 4. This drives the mapping choice in DESIGN_SYSTEM_V2.md §3.3.
- **Reusable primitives (retain the API, restyle):** Button (haptic, variants, uppercase primary), Card, CardHeader, Pill, StatusTag, StatTile, SectionHeader, EmptyState, ScreenContainer. Workout features: SetRow (DONE/NOW/QUEUE, cardio mode, 44×44 controls), ExerciseCard, RestTimer, SessionProgress.
- **VYNKÆR-specific (retire):** Crest, GrainTexture, the Cinzel eyebrow, doctrine italics, LinearGradient glows.
- **Accessibility:** 38 `accessibilityLabel`s. SetRow complete/remove controls are now 44×44 (the critique on 2026-09-18 measured 40/28, since fixed). There is still no undo for remove-set, skip or substitute.
- **Navigation:** 5 tabs. v2 allows at most 4.
- **Copy:** "VYNKÆR" appears as literal text in 5 places (DESIGN_SYSTEM_V2.md §8).

## 7. Security and privacy

### 7.1 Secrets

- No secrets in tracked files. I searched for `api_key|secret|sk-ant|password|token` assignments. The only hit is `reference/hotlink-ui-builder/.env.example` with the placeholder `GEMINI_API_KEY="MY_GEMINI_API_KEY"`. It is not a secret, but it belongs to an unrelated Gemini prototype. Consider removing it from the repo.
- No AI key exists in the mobile bundle. The coach is local and the stub keeps the key server-side. **Keep it that way.**
- `.gitignore` covers `.env*.local`, `*.key`, `*.p8`, `*.p12`, `*.jks`, `*.pem`, `*.mobileprovision`. It does **not** ignore plain `.env`. Add `.env` before any backend work.

### 7.2 Data

- All athlete data is plaintext AsyncStorage on the device. That is acceptable for local demo data. **Before real health-adjacent data** (pain, sleep, fatigue): decide on device-at-rest protection (at minimum rely on OS file protection and document it; consider `expo-secure-store` only for tokens, since it is not designed for large blobs).
- Seed data is synthetic ("Athlete 001"). No real personal data is committed.
- **Supabase draft gaps:** `athletes.user_id` is not unique, so one user could own many athlete rows. There are no `updated_at` triggers. Policies use `FOR ALL USING` with no explicit `WITH CHECK`, which Postgres then applies to writes as well; that is acceptable, but should be made explicit. App IDs are `prefix-base36-random` strings (`src/utils/id.ts`), but the schema columns are `uuid`, so **inserts of existing local records would fail**. There are no deletion or export functions.

### 7.3 Dependencies

Production-path advisories: 7 high, 1 critical. Almost all sit in **build and CLI tooling** that is not shipped in the app bundle: `shell-quote` (critical, via `@expo/cli`), `node-forge`, `source-map-js`, `zod`. The direct one is `expo-router` (via `query-string`/`decode-uri-component`). Recommended action: run `npx expo install --check` within SDK 57 and re-audit. Do not use `npm audit fix --force`; it proposes `expo@51` and SDK 58 jumps.

## 8. Documentation accuracy

| Doc | Drift found |
|---|---|
| `docs/BUILD_STATUS.md` | Says the icon and splash "are still the default Expo template assets". **Stale.** Commit `680637a` replaced them with VYNKÆR crest artwork. It also says `reference/hotlink-ui-builder/` is "kept locally, untracked", but it **is tracked** (`8a81ce5`) |
| `docs/BUILD_STATUS.md` | "23-exercise library". `src/data/exercises.ts` defines **24** `id:` entries |
| `CLAUDE.md` | "`currentPlan` … recomputed by `generateWorkout` whenever training state changes". Not quite: it is recomputed at specific call sites, and `FLAG_LIMITATION` is one that does not (D5) |
| `README.md` | Screenshots section is a placeholder |
| Others | `ARCHITECTURE.md`, `SUPABASE_MIGRATION.md` and `DESIGN.md` match the code |

These were **not** edited in Phase 0, to keep the diff to OSMIUM preparation. Fix them in the Phase 1 docs pass.

## 9. Identifiers and rename implications

| Identifier | Current | Changing it means |
|---|---|---|
| `expo.name` | `VYNKÆR Training` | Display name only. Safe |
| `expo.slug` | `vynkaer-training` | Changes the EAS project link. Re-run `eas init` or set `extra.eas.projectId`. Medium |
| `expo.scheme` | `vynkaer` | Breaks existing deep links and future OAuth redirect URIs. Decide **before** auth is configured |
| `ios.bundleIdentifier` / `android.package` | `com.nexovalabs.vynkaertraining` | A **different app** to the stores, with no upgrade path from installed builds. Nothing is published yet, so this is the cheapest moment to decide. **Needs an owner decision** |
| `package.json` `name` | `vynkaer-training` | Cosmetic |
| AsyncStorage keys | `vynkaer.*` | Renaming orphans existing on-device data unless migrated. Recommendation: keep them (DATA_AND_AI_STRATEGY.md §6) |

**None changed in Phase 0.** *Update 4 Nov 2026:* the owner decided to change `name`, `slug`, `scheme`, `ios.bundleIdentifier` and `android.package` to OSMIUM values now (nothing is published, so there is nothing to migrate); see README.md "Decisions taken". `package.json` `name` and the `vynkaer.*` storage keys are intentionally unchanged.

## 10. Technical debt (prioritised)

1. D1/D2 above. Correctness of history and progression comes before any visual work ships to real users.
2. No tests for `src/state` and the coach. The approval gate and finish-workout path are the product's core promises and are untested.
3. A single 501-line context re-renders every consumer on each set edit. Fine at today's scale. Split by concern (session vs profile vs history) before adding Recovery and the Coach memory.
4. Silent persistence failures (`writeJSON` swallows errors). The user is never told a set failed to save.
5. Doctor findings (worklets peer, patch drift, dead `newArchEnabled`).
6. `ProgressionDecisionType` has `DELOAD`/`SUBSTITUTE` with no producer. `LIMITATION_FLAGS` has no-op areas.
7. `reference/` (2.1 MB) is tracked in the app repo. Consider moving it out once OSMIUM supersedes it.
