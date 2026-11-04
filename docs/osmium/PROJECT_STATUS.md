# OSMIUM — project status (overall résumé)

**As of:** 4 November 2026 · **Phase:** 0 complete, Phase 1 not started
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
| `f113353` | docs set, `src/theme/osmium.ts` (not imported), approved logo PNGs (reference) |
| `894c6e9` | `app.json` identifiers → OSMIUM (name, slug, scheme `osmium`; bundle/package `com.nexovalabs.osmium`); draft SVG masters |
| `a4a09a0` | Launcher icon, splash, adaptive-icon layers, monochrome layer and favicon regenerated from the SVGs; `app.json` backgrounds → `#000000` |
| this commit | Documentation refresh (all `.md` files) plus this résumé |

**Not touched:** `src/engine/`, `src/state/`, `src/services/`, `app/`, `src/components/`, `package.json`, the lockfile, and all `vynkaer.*` storage keys. The running UI is still VYNKÆR (copper theme, "VYNKÆR" copy, Crest, 5 tabs).

## 4. Verification (latest runs)

| Check | Result |
|---|---|
| `npm ci` | Success (1056 packages; lockfile unchanged) |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test -- --runInBand` | Pass, 42/42 (3 suites, engine only) |
| `npx expo config --type public` | Pass (shows OSMIUM identifiers) |
| `npx expo-doctor` | **3 failures, all pre-existing:** `newArchEnabled` not in schema; `react-native-worklets` peer missing; 8 patch versions behind SDK 57 |
| `npm audit --omit=dev` | 29 advisories (1 critical, 7 high), mostly build tooling; fix via `expo install --check`, not `audit fix --force` |
| Native build / device / web run | **Not performed** |

## 5. Known defects (open, none fixed yet)

Full table in [CODEBASE_AUDIT.md §5](CODEBASE_AUDIT.md). The two that matter first:
- **D1 (data loss):** an unreadable AsyncStorage value is treated as first launch and **overwritten with demo seed data**.
- **D2 (progression):** after a session, the next recommended load is stored as the load *performed*, so the generator adds the increment twice. *Inferred from code; confirm with a failing test first.*

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
2. Install the new fonts (not done); trademark/name clearance; whether the app display name should carry a suffix.
3. Native/device verification of the new icon, splash and identifiers (EAS dev build; needs the `react-native-worklets` fix first).
4. Readiness indicator: whether to have one at all (default: none). Transcript storage and retention. Subscription provider.
5. Remaining VYNKÆR leftovers: `Crest`, "VYNKÆR" copy in 5 places, `package.json` name, `.claude/launch.json` server name, `reference/` folder, README screenshots.

## 8. Next plan (not started)

Order from [TOMORROW_START_HERE.md](TOMORROW_START_HERE.md): (1) fix D1/D2 test-first; (2) toolchain hygiene to a clean `expo-doctor`; (3) switch runtime colours to `osmiumColors` and remove the copper glow; (4) install fonts and switch type roles; (5) four-tab shell with a Recovery empty state, Settings and Coach modal. Then roadmap steps 4–12.

## 9. Standing rules

Never modify `src/engine/` except additive types with tests first · keep `vynkaer.*` keys · no AI key in the bundle · every consequential coach change needs explicit approval · no fabricated recovery, readiness or performance data · no medical claims · demo data stays labelled · do not merge to `main` without approval · no Batman or Wayne Enterprises assets or names.
