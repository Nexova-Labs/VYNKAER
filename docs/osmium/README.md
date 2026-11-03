# OSMIUM — Phase 0 documentation set

**Product:** OSMIUM — Private Human Performance Intelligence
**Internal codename:** REBORN
**Company:** Nexova Labs
**Source repository:** `Nexova-Labs/VYNKAER` (this repo; not renamed)
**Branch:** `feature/osmium-foundation-2026-11-03`, cut from `nexova/main` @ `8a81ce5`
**Prepared:** 3 November 2026

This folder is the hand-off between Phase 0 (audit and preparation, tonight) and Phase 1 (implementation, from 4 November). Nothing here changes runtime behavior. The app on this branch still boots as VYNKÆR Training with the copper theme. The only code added is a parallel token module that nothing imports (`src/theme/osmium.ts`), plus the three approved logo PNGs stored as reference files.

## Read in this order

| # | Document | What it answers |
|---|---|---|
| 1 | [TOMORROW_START_HERE.md](TOMORROW_START_HERE.md) | The first five tasks, with files, acceptance criteria and how to verify each one |
| 2 | [CODEBASE_AUDIT.md](CODEBASE_AUDIT.md) | What the repo actually contains, check results, verified bugs, security, technical debt |
| 3 | [VYNKAER_TO_OSMIUM_GAP_ANALYSIS.md](VYNKAER_TO_OSMIUM_GAP_ANALYSIS.md) | A Retain / Refactor / Extend / Replace / Build new verdict for each area |
| 4 | [DESIGN_SYSTEM_V2.md](DESIGN_SYSTEM_V2.md) | The OSMIUM token spec, the legacy→OSMIUM mapping, typography plan, component patterns |
| 5 | [BRAND_ASSET_MANIFEST.md](BRAND_ASSET_MANIFEST.md) | Every current icon/splash asset and its OSMIUM replacement, plus the import checklist |
| 6 | [PRODUCT_VISION.md](PRODUCT_VISION.md) | Positioning, the four destinations, trust rules |
| 7 | [TARGET_ARCHITECTURE.md](TARGET_ARCHITECTURE.md) | End-state architecture and how today's layers map onto it |
| 8 | [DATA_AND_AI_STRATEGY.md](DATA_AND_AI_STRATEGY.md) | Data provenance classes, athlete memory model, AI Coach contract |
| 9 | [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) | The 12-step sequence with dependencies, risks and acceptance criteria |

## Relationship to existing documentation

These documents **extend** the existing docs. They do not replace them. The originals still describe the VYNKÆR build accurately, except where [CODEBASE_AUDIT.md §8](CODEBASE_AUDIT.md#8-documentation-accuracy) lists a drift:

- [`/CLAUDE.md`](../../CLAUDE.md): working conventions and the architecture summary (still accurate)
- [`/DESIGN.md`](../../DESIGN.md): VYNKÆR design system. **Superseded for colors and type** by DESIGN_SYSTEM_V2.md once Phase 1 lands. Its structural rules (Recessed/Raised Rule, Measured-Value Rule) carry forward.
- [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md): layering and engine description (accurate)
- [`docs/PRODUCT.md`](../PRODUCT.md): VYNKÆR positioning (superseded by PRODUCT_VISION.md)
- [`docs/SUPABASE_MIGRATION.md`](../SUPABASE_MIGRATION.md): the cloud path. Still the starting point; TARGET_ARCHITECTURE.md lists the changes it needs.
- [`docs/BUILD_STATUS.md`](../BUILD_STATUS.md): the V1 build log (historical)

## Source material

The design hand-off archive (`OSMIUM_Complete_Design_and_Project_Handoff_2026-11-03.zip`) was reviewed in full. These decisions were taken from it:

- **OSMIUM Brand Identity & Design System v2** (PDF/DOCX). This is the governing design document. It takes precedence over REBORN Design System v1.
- **Product & Engineering Roadmap** (phases 0–5). It is consistent with IMPLEMENTATION_ROADMAP.md, which adds engineering detail.
- **Three approved logo PNGs**, copied to `assets/brand/osmium/reference/`.
- **UI concept boards** (12) and **reference photos** (5). These are visual exploration only and are **not committed**. The v2 doc says so explicitly, and some boards show a warm gold that is *not* part of the palette.

## Unresolved decisions (need an owner)

These items are listed again in the relevant documents. None of them were decided in Phase 0:

1. **Production typefaces and licences.** v2 names Canela and Neue Haas Grotesk only as stylistic references. Open-licence stand-ins are proposed in DESIGN_SYSTEM_V2.md §4.
2. **Vector logo masters.** v2 requires clean SVG/PDF masters and says the PNGs must not be traced. Until a designer delivers them, no app icon can be replaced.
3. **App identifiers.** Should `com.nexovalabs.vynkaertraining`, the `vynkaer` URL scheme and the `vynkaer-training` slug change? See CODEBASE_AUDIT.md §9.
4. **Trademark clearance** for the OSMIUM name and mark. v2 states that the creative approval is not legal clearance.
5. **The fifth tab.** v2 allows at most four primary destinations. Profile has to move somewhere; see the options in TARGET_ARCHITECTURE.md §3.
6. **Persisted storage keys** (`vynkaer.*`). Keep them or migrate them. Recommendation: keep them, see DATA_AND_AI_STRATEGY.md §6.
