# Start here: next session

> **Status (end of 4 Nov 2026):** all five tasks below are **done** (D1/D2 fixes, toolchain hygiene, OSMIUM colours, typography, four-destination navigation), plus roadmap step 4 (Today/Coach merge). 71 tests pass; `expo-doctor` 21/21. The task write-ups below are kept as the record of what was done and how it was verified.
>
> **Suggested next, in order:**
> 1. D4 and D5 (roadmap step 0 leftovers): make a worse-pain report actually flag the limitation, and regenerate the draft plan after a Coach `FLAG_LIMITATION`. Test-first, as with D1/D2. D3 (use the weights actually logged) if wanted.
> 2. Roadmap step 5, Training: substitution drawer, undo for remove/skip/substitute, exercise instructions, in-session limitation feedback.
> 3. Roadmap step 2 leftovers: radii, spacing, motion, remove GrainTexture and Crest, reduced-motion, designed state variants.
> 4. Roadmap step 6, Progress, then step 7, Recovery inputs.
> 5. Designer sign-off on the draft SVG logos, then swap in the final icon set.

## Where things stand

- **Branch:** `feature/osmium-foundation-2026-11-03` on `Nexova-Labs/VYNKAER` (remote `nexova`). Base `8a81ce5` = `nexova/main`. `main` is untouched.
- **App state:** in-app **colours and fonts are OSMIUM** (tasks 3 and 4 done), navigation is four destinations and the Coach is merged into Today; spacing/radii, the grain texture, the crest mark and "VYNKÆR" copy are still VYNKÆR. typecheck ✅, lint ✅, 71/71 tests ✅; `expo-doctor` 21/21. See `git log` for the latest commit.
- **Added so far:** `docs/osmium/*`, `src/theme/osmium.ts` (now live via `tokens.ts`), approved logo PNGs (reference), draft SVG masters (`assets/brand/osmium/source/`), OSMIUM `app.json` identifiers, and OSMIUM launcher icon / splash / favicon (draft artwork regenerated from the SVGs; not verified on a device).
- **Remote naming trap:** locally, `origin` is the personal fork `yovneeshkhadun/VYNKAER`, which is **one commit behind**. Push and PR against `nexova`. Run `git fetch nexova` before starting.

## Before writing code

```bash
git fetch nexova
git switch feature/osmium-foundation-2026-11-03
npm ci
npm run typecheck && npm run lint && npm run test -- --runInBand
```

**Update (4 Nov): the four decisions below are now taken** (fonts → open stand-ins; logos → drafted in-house, pending sign-off; app IDs → already changed to OSMIUM; coach → inside Today + modal). See README.md "Decisions taken". The original list is kept for context:
1. Fonts: Instrument Serif + Inter stand-ins, or licence Canela / Neue Haas? (blocks task 4)
2. Who delivers the vector logo masters, and when? (blocks icon/splash; BRAND_ASSET_MANIFEST.md §3)
3. Bundle ID / scheme: keep `com.nexovalabs.vynkaertraining` + `vynkaer`, or change to OSMIUM before auth? (blocks step 11)
4. Where the coach lives in 4-tab navigation (TARGET_ARCHITECTURE.md §3, option (a) recommended). (blocks task 5)

---

## Task 1: Fix history overwrite and double progression (D1, D2), test-first: **DONE 4 Nov 2026**

> Done test-first. Progression update extracted to `src/state/progression.ts` (behaviour-preserving) and 21 tests written; 12 failed on the old code (3 D2, 9 D1), then passed after the fixes. D1: `loadOrSeed`, quarantine, `StorageReadError`, retry screen on load, inline error on Finish & Save. D2: `lastLoad` stores the performed load. Live-checked in the browser: a corrupt history value was preserved under `vynkaer.quarantine.*` and the app booted. Not exercised live: the storage-read-failure retry screen (covered by unit tests only) and an in-app full session through the D2 path (covered by the generator-backed tests). `src/engine/` untouched; deviation: the stored value is the prescribed load (`ex.recommendedLoad`), so D3 (use the weights actually logged) is still open.

**Why first:** both defects corrupt the athlete's record, which is the asset the whole product is built on. Neither is visual, so they don't conflict with design work.

- **Files likely to change**
  - `src/services/storage/storage.ts`: split `readJSON` into a result that distinguishes `missing` from `unreadable`
  - `src/services/storage/workoutRepository.ts`, `athleteRepository.ts`, `trainingStateRepository.ts`: seed only on `missing`. On `unreadable`, keep the raw value under a quarantine key and throw or return an error state
  - `src/state/AppStateContext.tsx` `finishWorkout`: store the **performed** load (`ex.recommendedLoad`, or better, the working weight from completed sets) as `lastLoad`, matching `seed.ts`
  - New: `src/services/storage/__tests__/repositories.test.ts`, `src/state/__tests__/finishWorkout.test.ts` (extract the progression-update block into a pure function in `src/state/` so it can be tested without rendering)
  - `jest` setup: use `@react-native-async-storage/async-storage/jest/async-storage-mock`
- **Intended behavior:** a corrupt or unreadable key never replaces data with the seed. After a clean top-of-range session at load L, the next plan recommends L + increment, not L + 2×increment.
- **Dependencies:** none. **Do not modify `src/engine/`.**
- **Acceptance criteria:** the new tests fail on the current code and pass after the fix; the 42 existing engine tests pass unchanged; `git diff --stat src/engine` is empty.
- **Verify:** `npx jest src/state src/services`; `npm run test -- --runInBand`; then in the browser (`preview_start vynkaer-web`) log a session with all sets at the top of the range, finish, and confirm on Home that the new load is exactly +1 increment.

## Task 2: Toolchain hygiene (expo-doctor to green): **DONE 4 Nov 2026**

> `npx expo-doctor` 21/21. Removed `newArchEnabled`; `npx expo install react-native-worklets` (0.10.1); `npx expo install --fix` (8 SDK 57 patch bumps); added `.env`, `.env.*` (keeping `.env.example`) to `.gitignore`. Deviation: also ran a **non-breaking** `npm audit fix` (not `--force`) after inspecting its dry run: it moves `shell-quote` 1.10 to 1.12 (the one critical advisory) and patch-bumps typescript-eslint. Production advisories 29 to 24 (0 critical, 5 high); the rest need `expo-router@58` (SDK 58), left for a planned upgrade. `package-lock.json` churned heavily (about 1,500 lines) from those updates. Re-verified: typecheck, lint, 63/63 tests, and the app on web (all tabs, Coach modal, Settings, animations visible, no console or server errors). Not done: a native build.

- **Files likely to change:** `package.json`, `package-lock.json`, `app.json` (remove `newArchEnabled`), `.gitignore` (add `.env`).
- **Intended behavior:** dependencies aligned to SDK 57 patch versions; `react-native-worklets` declared; no dead config.
- **Commands:** `npx expo install --check` (accept the SDK 57 patch bumps only), `npx expo install react-native-worklets`. **Do not** run `npm audit fix --force` (it proposes Expo 51 / SDK 58).
- **Dependencies:** none (can run in parallel with task 1; it touches different files).
- **Acceptance criteria:** `npx expo-doctor` reports 0 failed checks; typecheck, lint and tests are clean; `npm audit --omit=dev` re-run and the delta recorded in CODEBASE_AUDIT.md §7.3.
- **Verify:** the commands above, plus `npm run web` boots and Home renders (Reanimated `FadeInUp` still animates).

## Task 3: Activate OSMIUM colour tokens: **DONE 4 Nov 2026**

> Implemented as written, plus a new `onAccent` token (text on blue fills was white at ~2.9:1). Browser-audited at 375×812 on Home, Train (active workout), Progress, Coach and Profile: no warm hues except the intentional red danger border, and no text below 4.5:1. Not re-checked: `workout/complete`, `exercise/[id]` (covered by typecheck and the `onAccent` fix only).

- **Files likely to change**
  - `src/theme/tokens.ts`: `export const colors = osmiumColors` (import from `./osmium`), and update the header comment
  - `app/(tabs)/home.tsx`: remove the copper `LinearGradient` hero glow (line ~166, the only hard-coded colour)
  - `app/(tabs)/_layout.tsx`: `tabBarActiveTintColor` → `colors.accent` (instrument blue = selection)
  - `app.json`: background colours are **already** `#000000` (done 4 Nov with the icon swap)
  - `src/state/AppStateContext.tsx`: loading spinner colour stays on `accentSoft` (now titanium). Nothing to do unless it reads poorly
- **Intended behavior:** the whole app renders black/graphite/titanium/silver with instrument blue only on focus, selection and the primary action. No copper anywhere.
- **Dependencies:** task 1 merged first is preferred (so screenshots show correct loads), but not required.
- **Acceptance criteria:** `git grep -n "975a36\|b97140\|d9a578\|183,90,55"` → no hits in `src/` or `app/`; typecheck clean (proves key parity); each of the 5 screens plus onboarding, complete and exercise/[id] screenshotted at 375×812 with no clipped text and no invisible nested surfaces (the Recessed/Raised Rule).
- **Verify:** `preview_start vynkaer-web` → walk onboarding → Home → Start → log a set → Finish → Progress → exercise detail → Coach (apply a proposal) → Profile; check the console for errors; take screenshots.

## Task 4: Typography foundation (install alongside, then switch): **DONE 4 Nov 2026**

> Done differently: the fonts were installed and switched in one step, Cinzel/EB Garamond were removed (no references remained), and `src/components/Text.tsx` maps `fontWeight` to static Inter files, enforced by an ESLint rule. Browser-checked at 375×812 on Home, Train, Progress, Coach, Profile and onboarding: only Inter / Instrument Serif / IBM Plex Mono / icon fonts render, no text under 11px, no horizontal overflow. Not opened: `workout/complete`, `exercise/[id]`. The criterion "Home hero ≤ 2 lines" holds (the serif title is one line).

- **Files likely to change:** `package.json` (add `@expo-google-fonts/inter` and `@expo-google-fonts/instrument-serif`, after confirming both exist and work with SDK 57), `app/_layout.tsx` (`useFonts` adds the new faces; keep the old ones for now), `src/theme/tokens.ts` (`fontFamily` gains `ui`, `uiMedium`, `uiSemiBold`; `typography.eyebrow` → Inter 500 uppercase titanium; `title`/`heroTitle` → Instrument Serif; `numeral` keeps Plex Mono and adds `fontVariant: ['tabular-nums']`), plus the 7 files reading `fontFamily.*`.
- **Intended behavior:** v2 hierarchy, with a display serif for human prompts, a neo-grotesk for everything else and tabular data numerals. No Cinzel visible.
- **Dependencies:** task 3; decision 1 above (stand-ins vs licensed faces).
- **Acceptance criteria:** `git grep -n "Cinzel" app src` shows only `_layout.tsx` imports (removal comes in a follow-up once confirmed); the micro size is never below 11pt; Home's hero fits in ≤ 2 lines at 375px; splash hides only after the fonts load (existing behavior).
- **Verify:** browser pass as in task 3; check the network panel for font loads; spot-check Dynamic Type / browser zoom at 200%.

## Task 5: Four-destination navigation shell: **DONE 4 Nov 2026**

> Built as specified, option (a): `today`/`training`/`progress`/`recovery` tabs, `app/coach` modal, `app/settings` stack screen, `TabHeader` (Coach + Settings icons on every tab), `IconButton`, and a Today prompt card that opens the Coach. Recovery shows only logged values (limitations, last-session self-report, demo-labelled) with an honest "check-ins arrive later" state and no scores. `tsc` with regenerated typed routes is clean and rejects the old `/(tabs)/home`. Browser-verified at 375×812: every tab, both header actions, both Coach entry points, back/close, proposal + APPLY gate in the modal, plus deep links to `/settings`, `/workout/complete` and `/exercise/[id]`. Not changed: Today and Coach content are not merged into one screen (roadmap step 4).

- **Files likely to change:** `app/(tabs)/_layout.tsx` (4 tabs), rename `home.tsx` → `today.tsx` and `train.tsx` → `training.tsx`, new `app/(tabs)/recovery.tsx` (honest empty state: "Recovery check-ins arrive in a later build. Limitations are managed in Settings for now." No fake data), move `profile.tsx` → `app/settings/index.tsx` with a header entry button, coach as a `coach` modal route plus an entry point on Today (option (a)); update every `href`/`router.push` (`grep -rn "(tabs)/" app src`); `app/index.tsx` redirect target.
- **Intended behavior:** Today · Training · Progress · Recovery tabs; Settings and Coach one tap away from Today; all existing functionality still reachable.
- **Dependencies:** task 3 (so the shell is built in OSMIUM colours); decision 4.
- **Acceptance criteria:** `npm run typecheck` clean (typed routes catch stale links); every previous capability reachable (start, log, finish, progress drill-down, coach apply, profile edit, reset demo data); no route 404s on web.
- **Verify:** browser walk-through of every route; `read_console_messages` free of router warnings; screenshots of the 4 tabs.

---

## Do not do tomorrow

- The launcher icon, splash and favicon are **draft** OSMIUM art. Swap in designer-approved masters later (BRAND_ASSET_MANIFEST.md §4); do not redraw them again.
- `bundleIdentifier`, `package`, `scheme` and `slug` are already OSMIUM. Do **not** rename the `vynkaer.*` storage keys.
- Do not touch `src/engine/` except for additive types in step 5+, with tests first.
- Do not add an AI provider key or deploy Supabase.
- Do not merge to `main` without approval.
