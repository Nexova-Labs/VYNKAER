# OSMIUM — project status (overall résumé)

**As of:** 4 November 2026 · **Phase:** 0 complete; Phase 1: colours, typography, four-destination navigation and the Today/Coach merge done
**Branch:** `feature/osmium-foundation-2026-11-03` on [`Nexova-Labs/VYNKAER`](https://github.com/Nexova-Labs/VYNKAER) (git remote `nexova`) · base `8a81ce5` (`nexova/main`) · `main` untouched, no PR open.
**Remote trap:** locally `origin` is the personal fork `yovneeshkhadun/VYNKAER`, one commit behind. Always fetch, push and PR against `nexova`.

## 1. What this project is

OSMIUM — *Private Human Performance Intelligence*, by Nexova Labs — is the rebrand and evolution of the existing **VYNKÆR Training** app (Expo SDK 57, React Native 0.86, Expo Router, TypeScript). It is an evolution, not a rebuild: the deterministic training engine, local-first logging and the approval-gated Coach are the foundation and are preserved.

## 2. What Phase 0 delivered

| Area | Delivered | Where |
|---|---|---|
| Audit | Verified structure, engine, state, storage, coach, security, debt; 10 defects (D1–D10); doc-drift list | [CODEBASE_AUDIT.md](CODEBASE_AUDIT.md) |
| Gap analysis | Retain / Refactor / Extend / Replace / Build-new verdict for 13 areas | [VYNKAER_TO_OSMIUM_GAP_ANALYSIS.md](VYNKAER_TO_OSMIUM_GAP_ANALYSIS.md) |
| Design system | Approved palette, legacy→OSMIUM key mapping, measured WCAG contrast, type plan, component inventory, retire list | [DESIGN_SYSTEM_V2.md](DESIGN_SYSTEM_V2.md), `src/theme/osmium.ts` |
| Brand | Approved PNGs stored as reference; draft SVG masters (eclipse ×3, wordmark, signature); asset mapping and import checklist | [BRAND_ASSET_MANIFEST.md](BRAND_ASSET_MANIFEST.md), `assets/brand/osmium/` |
| Architecture | Target layers, 4-destination navigation, state split, sync sketch, coach flow, auth, subscriptions | [TARGET_ARCHITECTURE.md](TARGET_ARCHITECTURE.md) |
| Data and AI | Four provenance classes, memory model, coach contract and limits, privacy | [DATA_AND_AI_STRATEGY.md](DATA_AND_AI_STRATEGY.md) |
| Roadmap | 12 steps plus step 0 with dependencies, risks, acceptance | [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) |
| Next-day plan | First five tasks with files, criteria, verification | [TOMORROW_START_HERE.md](TOMORROW_START_HERE.md) |
| Product | Positioning, four destinations, trust rules | [PRODUCT_VISION.md](PRODUCT_VISION.md) |

## 3. Changes made to the repo (beyond docs)

| Commit | Change |
|---|---|
| `f113353` | docs set, `src/theme/osmium.ts`, approved logo PNGs (reference) |
| `894c6e9` | `app.json` identifiers → OSMIUM (name, slug, scheme `osmium`; bundle/package `com.nexovalabs.osmium`); draft SVG masters |
| `a4a09a0` | Launcher icon, splash, adaptive-icon layers, monochrome layer and favicon regenerated from the SVGs; `app.json` backgrounds → `#000000` |
| `f8536d7` | Documentation refresh (all `.md` files) plus this résumé |
| `8459da0` | **Phase 1 task 3, colours:** `tokens.ts` exports `osmiumColors`; copper hero glow removed from `home.tsx`; tab tint → instrument blue; new `onAccent` token so text on blue fills passes AA; docs updated |
| `00b6b77` | **Phase 1 task 4, typography:** Inter + Instrument Serif installed and loaded; Cinzel/EB Garamond removed; `src/components/Text.tsx` (`Text`/`TextInput` wrappers) adopted in 20 files with an ESLint guard; `title`/`heroTitle`/`doctrine`/`eyebrow` retuned; four sub-11px text styles raised to 11; docs updated |
| `3994e79` | **Phase 1 task 5, four-destination navigation:** `(tabs)` is today / training / progress / recovery; `coach` is a modal and `settings` a stack route, both one tap from every tab via `TabHeader`; Recovery shell (logged values only, no scores); Today gains a "How are you feeling today?" prompt that opens the Coach; stale links and copy updated; docs updated |
| `4dde46d` | **Pre-flight: D1 and D2 fixed, test-first:** new `loadOrSeed` / quarantine / `StorageReadError` in storage, retry screen on a failed load, inline error on a failed save; progression update extracted to `src/state/progression.ts` and fixed to store the performed load; 21 new tests (63 total); docs updated |
| `046dc52` | **Toolchain hygiene:** removed dead `newArchEnabled`; `react-native-worklets` declared (0.10.1); SDK 57 patch bumps (`expo-doctor` 21/21); non-breaking `npm audit fix` clears the critical advisory; `.env` ignored; app re-verified on web |
| *this commit* | **Phase 1 step 4, Today / Coach merge:** new `src/features/coach/` (shared in-memory conversation provider, `resolveProposal` approval logic, thread with APPLY CHANGE / Dismiss, composer with four quick phrases, `CoachCard`); Today leads with the plan and the Coach card, with "Why this session" as its own card; the Coach modal reuses the same conversation (replaces the old 400-line screen); 8 new tests (71 total) |

**Not touched:** `src/engine/`, `package.json` (apart from the font packages, worklets and the SDK 57 patch bumps), and the existing `vynkaer.*` storage keys (one new key prefix, `vynkaer.quarantine.`, was added). `src/state/` and `src/services/` changed only for the D1/D2 fixes. The running UI now uses OSMIUM **colours and fonts**, four-destination navigation and a merged Today/Coach, but is otherwise still VYNKÆR: old radii and spacing, grain texture, Crest, "VYNKÆR" copy. (Task 4 also touched `app/`, `src/components/`, `src/features/`, `src/state/AppStateContext.tsx` only for the `Text` import, plus `package.json`, the lockfile and `eslint.config.js`.)

## 4. Verification (latest runs)

| Check | Result |
|---|---|
| `npm ci` | Success (1056 packages; lockfile unchanged) |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test -- --runInBand` | Pass, **71/71** (6 suites: engine 42, storage 15, progression 6, coach conversation 8) |
| `npx expo config --type public` | Pass (shows OSMIUM identifiers) |
| Web run (Metro, 375×812) | Pass for the colour change: app renders as "OSMIUM"; DOM audit of Home, Train (active workout), Progress, Coach, Profile found no warm hues (except the red danger border) and no text below 4.5:1. `workout/complete` and `exercise/[id]` not opened |
| `npx expo-doctor` | **21/21 pass** (was 3 failures: dead `newArchEnabled`, missing `react-native-worklets` peer, 8 patch versions behind; all fixed 4 Nov) |
| `npm audit --omit=dev` | 24 advisories (1 low, 18 moderate, **5 high, 0 critical**), down from 29 with 1 critical. Remaining highs need the SDK 58 major upgrade (`expo-router@58`); `audit fix --force` deliberately not used |
| Native build / device / web run | **Not performed** |

## 5. Known defects (open, none fixed yet)

Full table in [CODEBASE_AUDIT.md §5](CODEBASE_AUDIT.md). **D1 and D2 were fixed on 4 Nov 2026** (test-first). Still open: D3–D10.
- ~~**D1 (data loss):** an unreadable AsyncStorage value is treated as first launch and **overwritten with demo seed data**.~~ **Fixed.** Unreadable data is quarantined and never replaced; a storage failure shows a retry screen.
- ~~**D2 (progression):** after a session, the next recommended load is stored as the load *performed*, so the generator adds the increment twice. *Inferred from code; confirm with a failing test first.*~~ **Fixed.** `lastLoad` now stores the performed load, so a clean session adds exactly one increment.

## 6. Decisions

| Decision | Outcome | Date |
|---|---|---|
| Typefaces | Open stand-ins now (Instrument Serif + Inter, keep IBM Plex Mono); license Canela / Neue Haas later | 4 Nov |
| Logo masters | Redrawn in-house as SVG drafts; need designer sign-off | 4 Nov |
| App identifiers | Changed to OSMIUM now | 4 Nov |
| Coach placement | Inside Today plus a coach modal reachable from every tab header; 4 tabs | 4 Nov |
| Icon / splash replacement | Done with draft art | 4 Nov |

## 7. Still open

1. Designer sign-off on the SVG masters (wordmark letterforms; stroke→outline; glow in react-native-svg). Then replace the draft icons with the final ones.
2. Trademark/name clearance; confirm the open-licence fonts are acceptable for launch (Inter and Instrument Serif are OFL; licensing Canela / Neue Haas is deferred); whether the app display name should carry a suffix.
3. Native/device verification of the new icon, splash and identifiers (EAS dev build; the `react-native-worklets` prerequisite is now met).
4. Readiness indicator: whether to have one at all (default: none). Transcript storage and retention. Subscription provider.
5. Remaining VYNKÆR leftovers: `Crest`, "VYNKÆR" copy in 5 places, `package.json` name, `.claude/launch.json` server name, `reference/` folder, README screenshots.

## 8. Next plan

Order from [TOMORROW_START_HERE.md](TOMORROW_START_HERE.md): (1) ~~fix D1/D2 test-first~~ **done 4 Nov**; (2) ~~toolchain hygiene to a clean `expo-doctor`~~ **done 4 Nov**; (3) ~~switch runtime colours~~ **done 4 Nov**; (4) ~~install fonts and switch type roles~~ **done 4 Nov**; (5) ~~four-tab shell~~ **done 4 Nov**. Next: finish pre-flight (D4/D5; D3 if wanted), then roadmap step 5 (Training) onward.

## 9. Standing rules

Never modify `src/engine/` except additive types with tests first · keep `vynkaer.*` keys · no AI key in the bundle · every consequential coach change needs explicit approval · no fabricated recovery, readiness or performance data · no medical claims · demo data stays labelled · do not merge to `main` without approval · no Batman or Wayne Enterprises assets or names.
