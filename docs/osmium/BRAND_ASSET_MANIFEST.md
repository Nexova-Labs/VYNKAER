# OSMIUM brand asset manifest

**Rule:** no existing VYNKÆR asset is overwritten until a **production** OSMIUM replacement exists. v2 §03: *"Create a clean vector master … Do not trace screenshot pixels into final production assets."* The approved PNGs are **creative approvals**, not production masters.

## 1. Approved references (committed in Phase 0)

Copied unchanged from the hand-off archive `01_Approved_Brand_Assets/` to [`assets/brand/osmium/reference/`](../../assets/brand/osmium/reference/). **Nothing references them at runtime.**

| File | Role (v2) | Pixels | Format | Bytes | Suitability |
|---|---|---|---|---|---|
| `OSMIUM_Eclipse_Symbol.png` | **A.** Standalone eclipse. App icon, favicon, compact nav | 1536×1024 | PNG, RGB, **no alpha** | 576,304 | Reference only. Not square, no transparency, raster rim glow |
| `OSMIUM_Wordmark.png` | **B.** Wordmark. Headers, documents | 2172×724 | PNG, RGB, no alpha | 286,964 | Reference only. Black background baked in |
| `OSMIUM_Combined_Signature.png` | **C.** Signature. Launch, splash, presentations (sparingly) | 1080×603 | PNG, RGB, no alpha | 331,480 | Reference only. Lowest resolution of the three; appears to be a screen capture (faint top edge line) |

**Visual check (Phase 0):** each file matches its role description. The eclipse has a black disc, an asymmetric silver rim brightest at the upper right with a secondary glint at the lower left, and no text. The wordmark is widely tracked geometric `OSMIUM` in silver. The signature has the wordmark horizontally across the eclipse. The source-to-role mapping in the archive's `README_ASSET_MANIFEST.md` agrees.

**Not committed:** `03_UI_Concepts/` (12 generated boards, ~20 MB) and `04_Reference_Images/` (5 photos). They are exploration only, some show the non-approved gold, and they are too large for the app repo. They remain in the hand-off archive.

## 1b. Redrawn SVG masters (draft, 4 Nov 2026)

On 4 Nov the owner asked for the masters to be redrawn in-house. Five SVGs now live in [`assets/brand/osmium/source/`](../../assets/brand/osmium/source/). They were drawn from the approved references (the pixels were **not traced**) and rendered and compared visually with the references before commit.

| File | Role | Notes |
|---|---|---|
| `eclipse-master.svg` | A. Symbol, luminous | True circle r=300 on a 1024 canvas, transparent. Asymmetric illumination: tapering crescent plus bloom toward the upper-right, a dim lower-left glint, and a dim shadowed arc. Uses gradients, masks and blur filters (allowed for the luminous master; v2 reserves "luminous finish" for large hero uses) |
| `eclipse-mono.svg` | A. Symbol, monochrome, no glow | Flat `#E2E5E8`, no gradients or filters (mask only). Thin ring plus a flat tapering crescent. For Android themed icons |
| `eclipse-small.svg` | A. Symbol, 16–64 px | Flat thicker outline on black, per v2 section 03. Legible at 32 px in the render check |
| `wordmark.svg` | B. Wordmark | Extended geometric capitals, stroke-built (stroke 9, cap height 72), silver vertical gradient. **Strokes are not expanded to outlines** |
| `signature.svg` | C. Combined signature | Wordmark across the eclipse, wordmark = 1.7× symbol diameter, on black |

**Status: DRAFT, not production.** Open items for a human designer before these are final:
1. Sign off on the geometry against the approved art (especially the wordmark letterforms: the reference has slightly different S terminals and a lower M vertex).
2. Expand wordmark strokes to outlines (v2: "outlined vector artwork") and optimise paths.
3. Confirm the luminous master's filters render the same in the native pipeline (react-native-svg supports masks and gradients but not all filters; the app-side component may need a pre-rasterised bloom or a simplified variant).
4. Test the small variant on device at 16/24/32/64/128 px.

**Applied 4 Nov 2026 (owner approved "replace"):** the six launcher/splash PNGs in `assets/` were regenerated from these draft SVGs (same filenames, so `app.json` paths are unchanged) and the `app.json` background colours are now `#000000`. The VYNKÆR crest versions remain in git history (commit `680637a`). Specs used: `icon.png` 1024² RGB (no alpha, symbol 75% of canvas); `splash-icon.png` 1024² transparent; `android-icon-foreground.png` 1024² transparent, symbol inside the 66% safe zone; `android-icon-background.png` flat `#000000`; `android-icon-monochrome.png` flat mono; `favicon.png` 256² from the small variant. These are **draft** icons: swap in the signed-off masters when ready. Not yet checked on a device or in an EAS build. The in-app `Crest` component and the "VYNKÆR" text are still VYNKÆR.

## 2. Current VYNKÆR assets → OSMIUM replacements

| Slot | Config key (`app.json`) | Current file | Current content | OSMIUM replacement | Spec for the replacement |
|---|---|---|---|---|---|
| App icon (iOS + fallback) | `expo.icon` | `assets/icon.png` 1024² RGBA | VYNKÆR crest on obsidian/copper (`680637a`) | **Eclipse symbol (A)** | 1024×1024, **no alpha** for iOS (App Store rejects transparency), `#000000` background, symbol ≈ 75% of canvas (12.5% clear space each side per v2), sRGB |
| Android adaptive foreground | `android.adaptiveIcon.foregroundImage` | `assets/android-icon-foreground.png` 1024² | Crest | Eclipse symbol (A) | 1024², transparent, symbol inside the central **66% safe zone** (≈ 676px circle) because launchers mask the outer area |
| Android adaptive background | `android.adaptiveIcon.backgroundImage` | `assets/android-icon-background.png` 1024² | Obsidian texture | Flat `#000000` | Can drop the file and use `backgroundColor: "#000000"` alone |
| Android monochrome (themed icons) | `android.adaptiveIcon.monochromeImage` | `assets/android-icon-monochrome.png` 1024² | Crest silhouette | Eclipse **no-glow monochrome** variant | Single-colour on transparent. v2 calls for a "no-glow monochrome variant" in the vector master set |
| Adaptive bg colour | `android.adaptiveIcon.backgroundColor` | `#0a0a0b` | — | `#000000` | Config only |
| Splash image | `plugins.expo-splash-screen.image` | `assets/splash-icon.png` 1024² | Crest | **Eclipse symbol (A)** recommended; Signature (C) optional | Transparent PNG. The signature's wide aspect at `imageWidth: 220` would render the wordmark very small. Prefer the symbol, with the wordmark on the first in-app screen |
| Splash bg | `…backgroundColor` | `#0a0a0b` | — | `#000000` | Config only |
| App bg | `expo.backgroundColor` | `#0a0a0b` | — | `#000000` | Config only |
| Web favicon | `web.favicon` | `assets/favicon.png` 256² | Crest | Eclipse symbol, **small-size variant** | v2: test at 16/24/32/64/128px and "replace delicate rim effects with a thicker, flat outline" at small sizes |
| In-app mark | `src/components/Crest.tsx` | SVG crest component | Home header, onboarding | `EclipseMark` component (SVG from vector master) | |
| In-app wordmark | text "VYNKÆR" | 5 literals | | `OsmiumWordmark` component (SVG) | Must not be set in a font. v2 says the wordmark is custom-drawn, outlined vector |
| App name | `expo.name` | `VYNKÆR Training` | | `OSMIUM` | Owner decision on suffix (e.g. "OSMIUM" vs "OSMIUM Training") |
| Store metadata | — | **None exists** (no store listing, screenshots or descriptions in repo) | | Build new in Phase 4 | |

## 3. What has to come from design before any swap

| # | Deliverable | Format | Owner | Blocks |
|---|---|---|---|---|
| 1 | Eclipse symbol vector master: true circular path, illumination map | SVG + PDF | **Draft done** (§1b); needs design sign-off | Icon, adaptive icon, splash, favicon, `EclipseMark` |
| 2 | Eclipse **no-glow monochrome** variant | SVG | Design | Android themed icon, small sizes |
| 3 | Eclipse small-size variant (flat thicker outline) | SVG, verified at 16–128px | Design | Favicon, notification icon |
| 4 | Wordmark outlined vector | SVG + PDF | Design | `OsmiumWordmark`, headers |
| 5 | Combined signature vector lockup | SVG + PDF | Design | Launch material, optional splash |
| 6 | Trademark / name clearance | Legal memo | Legal | **Public** use (store listing, marketing). Not needed for internal builds |

## 4. Import checklist (for when the vector masters arrive)

1. [ ] Put the masters in `assets/brand/osmium/source/` (SVG + PDF) with a `LICENSE`/ownership note.
2. [ ] Confirm each file visually against the reference PNGs and the v2 description. **Do not alter the geometry.**
3. [ ] Export the raster set into `assets/brand/osmium/` (do **not** overwrite `assets/*.png` yet): `icon.png` 1024² opaque · `adaptive-foreground.png` 1024² transparent, safe zone · `adaptive-monochrome.png` · `splash.png` · `favicon.png` 256² from the small-size variant.
4. [ ] Check icon legibility on device home screens (light and dark wallpaper) and at 16/24/32/64/128px for the favicon.
5. [ ] In one commit, repoint `app.json` to `assets/brand/osmium/*` and change the bg colours to `#000000`. The old files stay in place, so the change reverts in one line.
6. [ ] `npx expo prebuild --clean` dry-run or an EAS dev build to confirm the native icon/splash pipeline accepts the files (iOS rejects alpha in the 1024 icon).
7. [ ] Add `src/components/brand/EclipseMark.tsx` and `OsmiumWordmark.tsx` rendering the SVGs via `react-native-svg` (already a dependency), with `accessibilityLabel="OSMIUM"` and `accessibilityRole="image"`.
8. [ ] Replace `Crest` usages, then delete `Crest.tsx`.
9. [ ] Once nothing references them, move the VYNKÆR PNGs to `reference/vynkaer-brand/` (or delete them in a separate, clearly named commit).

## 5. Interim option (if a branded build is needed before the vector masters)

If someone explicitly asks for it, a **clearly temporary** icon can be produced by cropping `OSMIUM_Eclipse_Symbol.png` to a centred square on black. Mark it in the filename (`icon.interim.png`) and in this manifest. It must never be described as the production asset, and it must be replaced when item 1 lands. **Not done in Phase 0.**
