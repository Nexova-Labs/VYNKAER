---
name: VYNKÆR Training
description: A disciplined, copper-accented dark training log — restraint over ornamentation.
colors:
  background: "#0a0a0b"
  background-elevated: "#111114"
  panel: "#141417"
  panel-2: "#1c1c21"
  control-bg: "#2a2a2b"
  border: "#26262c"
  border-subtle: "#1e1e23"
  text-primary: "#f5f4f1"
  text-secondary: "#9a9aa3"
  text-tertiary: "#6c6c74"
  worn-copper: "#b75a37"
  live-rust: "#d4713f"
  faded-copper-glow: "#e6b08e"
  copper-surface: "#1d1614"
  copper-border: "#3b302d"
  success: "#7ea583"
  success-surface: "#182420"
  warning: "#c98a4b"
  warning-surface: "#241d15"
  danger: "#c15c5c"
  danger-surface: "#241717"
typography:
  hero:
    fontFamily: "System (San Francisco on iOS, Roboto on Android)"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: "40px"
    letterSpacing: "-0.8px"
  title:
    fontFamily: "System (San Francisco on iOS, Roboto on Android)"
    fontSize: "30px"
    fontWeight: 800
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "System (San Francisco on iOS, Roboto on Android)"
    fontSize: "18px"
    fontWeight: 700
  body:
    fontFamily: "System (San Francisco on iOS, Roboto on Android)"
    fontSize: "15px"
    fontWeight: 400
  numeral:
    fontFamily: "System (San Francisco on iOS, Roboto on Android)"
    fontSize: "26px"
    fontWeight: 800
    letterSpacing: "-0.5px"
  label:
    fontFamily: "System (San Francisco on iOS, Roboto on Android)"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "1.2px"
rounded:
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "28px"
  xxxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.worn-copper}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.control-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 16px"
  button-danger:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 16px"
  card:
    backgroundColor: "{colors.panel-2}"
    rounded: "{rounded.xl}"
    padding: "16px"
  pill-accent:
    backgroundColor: "{colors.copper-surface}"
    textColor: "{colors.faded-copper-glow}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  stat-tile:
    backgroundColor: "{colors.background-elevated}"
    rounded: "{rounded.md}"
    padding: "12px"
  status-tag:
    doneBackgroundColor: "{colors.control-bg}"
    currentBackgroundColor: "{colors.worn-copper}"
    queuedBackgroundColor: "{colors.background-elevated}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: VYNKÆR Training

> **Superseded for colour and typography** by [docs/osmium/DESIGN_SYSTEM_V2.md](docs/osmium/DESIGN_SYSTEM_V2.md) (OSMIUM, approved 3 Nov 2026). This document still describes the code that is running today. Its structural rules (Recessed/Raised Rule, Measured-Value Rule, Single Fill / One Shadow rules) carry forward; the copper/rust palette, Cinzel/Garamond type and the grain/glow treatments are being retired in Phase 1.

## Overview

**Creative North Star: "The Quiet Gym"**

Premium through restraint, not ornamentation — closer to a well-made watch than a fitness app. VYNKÆR's interface sits in near-total darkness with one warm light source: the copper accent, spent on exactly one focal element per screen (a primary button, a progress fill, a rest-timer readout) and never repeated as decoration. Everything else — panels, borders, secondary text — stays quiet enough that the one warm element is never in competition.

Confirmed visual rejections (from `docs/PRODUCT.md` and the current implementation): no badges, streaks, or gamified point systems; no neon gradients or cartoon "AI fitness" imagery; no generic SaaS dashboard clichés (gradient hero, hero-metric-plus-sparkline card template); no exclamation-point copy.

**Key Characteristics:**
- Near-black ground with warm-tinted (never pure-grey) neutrals
- One accent color, spent on one element per screen
- Flat surfaces at rest; shadow appears only on the one card the user acts on next
- Haptic feedback on every primary interaction — the "click" is felt, not just seen
- Two typefaces, strict roles: system sans for every human-authored word, IBM Plex Mono for every standalone measured numeral
- One hero glow (radial copper, top-right corner) — the system's signature flourish, never repeated elsewhere on a screen

## Colors

Calibrated directly against the **VYNKÆR Apparel Brand Bible** (Collection 001 — Forged Soul) palette: Obsidian and Charcoal dominate 80–90% of any frame, Oxide Copper is the premium/UI accent, Blood Oath red is the brand's primary accent but is rationed in this UI to danger/critical states only — so the app keeps exactly one warm "UI light source" (copper) at a time, per the brand rule that a garment/frame reads as controlled, not busy.

### Primary
- **Oxide Copper / Worn Copper** (`#975a36`, brand bible's Oxide Copper): the single primary-action fill — used only on the primary `Button` variant. Nowhere else in the app is this value used as a solid fill.
- **Live Rust** (`#b97140`): primary button's border, and the "hot" end of the accent gradient seen in the current Home/Train concept renders.
- **Faded Copper Glow** (`#d9a578`): the accent's soft, tinted register — eyebrow labels, active tab icon/label, accent-toned pill text, coach adaptation copy. This is where the accent shows up *most often*, always as tinted text over a tinted surface, never as a solid fill.

### Neutral
- **Void / Obsidian** (`#0a0a0b`, brand bible's Obsidian): app background.
- **Raised Void** (`#111114`): `backgroundElevated` — stat tiles, empty states, progress-bar tracks, and every *recessed* surface nested inside a `Card` (a numbered badge, a "queued" status tag, an inset input well). One step brighter than page background, so it reads as instrumentation sitting *on* a card rather than another card.
- **Panel** (`#141417`): legacy default surface, now scoped to a single remaining consumer (the Coach message composer's text input). Not used for `Card`.
- **Panel 2 / Charcoal** (`#1c1c21`, brand bible's Charcoal register): the default `Card` background — meaningfully lighter than page background so a card reads with real depth rather than blending into it.
- **Control Surface** (`#2a2a2b`, `controlBg`): *raised* interior surfaces that must read as interactive when they sit on top of a `Card` — secondary button fill, stepper buttons, unselected chips, a "done" status tag, the current/active `SetRow`. This is the inverse of `backgroundElevated`: recessed = informational, raised = actionable. Never used as a page-level or `Card` background itself.
- **Border** (`#26262c`): the one hairline used between any two interactive/panel surfaces.
- **Border Subtle** (`#1e1e23`): internal dividers *within* a single card (e.g. `SetRow` bottom rule) — never between two separate panels.
- **Text Primary** (`#efe9e2`, warm Ash-register off-white), **Text Secondary** (`#9a948d`), **Text Tertiary** (`#6c6a68`): the three-step reading hierarchy — body copy, muted supporting copy, and disabled/caption-adjacent copy respectively. Warm-tinted per the brand bible's Ash (`#B8B1A7`), not a cool/pure grey.

### Semantic (separate from the brand accent)
- **Success** (`#7ea583` on `#182420`): completed sets, positive trend deltas. Never substitute the copper accent for "done" — the code keeps these strictly separate (`SetRow`'s completed check, `Pill` `success` tone).
- **Warning** (`#c98a4b` on `#241d15`): reserved, defined but not yet wired to a screen.
- **Danger / Blood Oath** (`#b23c42` on `#241414`, tinted toward the brand bible's Blood Oath `#98181D`): destructive actions only — the `Reset demo data` button is the only current consumer. `colors.bloodOath` (`#98181d`) is the raw brand value, held for the rare campaign-style mark; it is not yet wired to any screen and must stay rare if it is.

### Named Rules
**The Single Fill Rule.** Solid copper fill is reserved for the primary `Button` variant, plus one narrow, named exception: the `current` tone on a `StatusTag`, which marks the single ledger row the athlete is meant to act on right now (Train's `NOW` set, Progress's `PR` badge). Every other accent-toned element — pills, eyebrows, the rest-timer label — uses a *tinted surface* (`copper-surface` / `copper-border`) with *tinted text* (`faded-copper-glow`), never a solid fill. Because a `StatusTag` only ever appears attached to one row at a time within its list, this exception doesn't reintroduce a second competing "warm" focal point — it is the same "one warm light source" spent on a list row instead of a screen corner. Any *new* solid-copper-fill treatment beyond these two is a DESIGN.md-level decision, not a one-screen experiment. Blood Oath red follows the same discipline from the other end: it is the brand's actual primary accent per the bible, but in this UI it is scoped to danger/critical states only, so it never competes with copper as a second "warm" signal on the same screen.

**The Recessed/Raised Rule.** Every neutral surface nested inside a `Card` picks a direction relative to the card, never the card's own tone. Recessed (`background-elevated`, one step darker than the card) marks something informational — a badge, a queued row, an inset readout. Raised (`control-bg`, one step lighter than the card) marks something actionable — a button, a stepper, a chip, the one `SetRow` currently being logged. A new component nested in a card should never reuse `panel-2` for its own fill; that is the collision this rule exists to prevent.

## Typography

**Typeface:** Three strict roles, mapped directly onto the VYNKÆR Apparel Brand Bible's typography system, never mixed within one sentence.
- **Cinzel** (`Cinzel_600SemiBold` / `Cinzel_700Bold`, via `@expo-google-fonts/cinzel`) — the brand bible's "Display / collection" role. Wide tracking, uppercase. Reserved for the brand micro-label register only (`typography.eyebrow`, the onboarding brandmark) — never a full sentence.
- **EB Garamond** (`EBGaramond_500Medium` / `EBGaramond_700Bold` / `EBGaramond_500Medium_Italic`, via `@expo-google-fonts/eb-garamond`) — the brand bible's "Editorial / manifesto" role. Sentence case, serif. Carries every screen-level tagline (`typography.title`, `typography.heroTitle` — "Train what comes next.", "Performance, not noise.") and, in italic, standalone doctrine quotes (`typography.doctrine` — "FORGED, NOT BORN.").
- **System default** (San Francisco on iOS, Roboto on Android) — the brand bible's "Functional / product" role. Carries every other human-authored word: body copy, card/section headlines (`h2`), captions, button labels.
- **IBM Plex Mono** (`IBMPlexMono_500Medium` / `IBMPlexMono_700Bold`, via `@expo-google-fonts/ibm-plex-mono`) — every standalone measured numeral: stat-tile values, set-log weight/reps inputs, the Rest Timer countdown, Home's "WORKOUT N" number, the numbered exercise badges, and Progress's trend delta.

**Character:** Hierarchy is built from typeface role first, then size/weight/tracking within it. The system sans stays quiet everywhere prose appears; Cinzel and the mono face are the two deliberate register shifts, each reserved to isolated, non-sentence display use; EB Garamond is the one serif voice, reserved for taglines and doctrine, never body copy.

### Hierarchy
- **Hero** (EB Garamond Bold, 40px, line-height 44px, tracking -0.3px): the Home screen's primary headline only ("Train what comes next.").
- **Title** (EB Garamond Bold, 32px, tracking -0.2px): screen-level titles ("Performance, not noise.", "The rules behind the workouts.").
- **Headline** (700, 18px, system sans): card and section titles (exercise name, milestone name).
- **Body** (400, 15px, system sans): default reading copy.
- **Body Muted** (400, 14px, `text-secondary`): supporting/secondary copy directly under a headline.
- **Doctrine** (EB Garamond Medium Italic, 17px, `faded-copper-glow`): standalone manifesto/doctrine quotes only ("FORGED, NOT BORN.", "TRAIN. ENDURE. ADAPT. ASCEND.") — currently the onboarding flow.
- **Numeral** (`IBMPlexMono_700Bold`, 26px, no tracking): stat-tile values and other single standalone measurements.
- **Label / Eyebrow** (Cinzel SemiBold, 12px, tracking 2px, uppercase, `faded-copper-glow`): section eyebrows and micro-labels only.
- **Caption** (500, 12px, `text-secondary`): timestamps, metadata rows, tab labels.

### Named Rules
**The Measured-Value Rule.** Every human-authored word renders in the system sans (or EB Garamond for a tagline/doctrine line, or Cinzel for an eyebrow); every standalone measured numeral renders in IBM Plex Mono Bold. Never mixed within one sentence, never applied to a label or unit word next to a number (e.g. "kg", "reps" stay system sans; only the digits before them switch faces). Extending any of these treatments to a new element is a DESIGN.md-level decision, not a one-screen experiment.

## Layout

Single-column, full-bleed-to-gutter mobile layout. `ScreenContainer` sets the universal rhythm: 16px horizontal gutter, 40px bottom padding, vertical scroll by default. `SectionHeader` establishes inter-section rhythm at 20px above / 12px below, always title (headline) + optional right-aligned caption.

Stat grids (`Home`, `Progress`) use `flexWrap` with each tile at `flexBasis: 47%` and an 8px gap — a fluid 2-up grid at phone width rather than a fixed-column CSS grid. Cards never nest inside cards; a card's internal sections are separated by `border-subtle` dividers instead (see `SetRow`, `ExerciseCard`'s reason box).

Bottom tab bar is fixed, 84px tall, `background-elevated` fill, 1px `border` top rule, 8px top / 24px bottom internal padding (accounts for the home-indicator safe area).

## Elevation & Depth

Flat by default. `Card` carries no shadow unless explicitly passed `elevated`, which applies a single ambient shadow token (`0 10px 24px rgba(0,0,0,0.35)`, blur 24, Android elevation 6). Depth is **structural, not decorative** — it marks the one card the user is meant to act on next (the Home hero card, the active `ExerciseCard`), and is never applied to a whole screen's worth of cards at once.

### Shadow Vocabulary
- **`shadow.card`** (`0 10px 24px rgba(0,0,0,0.35)`): the only shadow token in the system. Used exactly where `elevated` is passed.

### Named Rules
**The One Shadow Rule.** There is exactly one shadow value in the system. If a screen seems to need a second, heavier shadow, that is a signal the layout has too many competing focal points — fix the layout, not the shadow scale.

## Shapes

Four radius steps plus a pill, each tied to a size class rather than a component type: `sm` (10px — inputs, small icon buttons, inline chips), `md` (14px — buttons, stat tiles), `lg` (18px — empty states), `xl` (22px — cards, the hero), `pill` (999px — pills, tab-style chips, progress-bar tracks/fills). Every interactive and panel surface carries a 1px border in `border` or `border-subtle`; there is no borderless "ghost" surface in the system except the `ghost` button variant, which stays transparent in both fill and border.

## Components

### Buttons
- **Shape:** 14px radius (`rounded.md`), 48px minimum height (the enforced touch-target floor), 1px border on every variant including ghost (ghost's border is transparent, not absent, so the layout never shifts between variants).
- **Primary:** `worn-copper` fill / `live-rust` border / white label, uppercase with 1px letter-spacing baked into the variant (not hand-set per screen), plus `shadow.card` for extra weight on the one action the screen wants tapped — reserved for exactly one primary action per screen. Still `shadow.card`, the system's only shadow value (see The One Shadow Rule) — the "heavier" read comes from pairing it with the copper fill, not a second shadow token.
- **Secondary:** `control-bg` fill / `border` border / `text-primary` label — a *raised* surface so it stays legible as a tappable control when it sits on a `Card` (see The Recessed/Raised Rule).
- **Ghost:** transparent fill and border, `text-primary` label — used for tertiary actions row (`Add set` / `Substitute` / `Skip`).
- **Danger:** `danger-surface` fill / `danger` border and label — destructive actions only.
- **Press / disabled:** pressed state drops opacity to 0.85 (not a scale or color change); disabled drops to 0.45. Every press additionally fires `Haptics.impactAsync(Light)` by default — this is a felt, not just visual, state change, and is the clearest expression of the "tactile and precise" component philosophy.

### Pills
- **Style:** 999px radius, 1px border, tinted surface + tinted text per tone (`accent` uses `copper-surface`/`copper-border`/`faded-copper-glow`; `neutral` uses `background-elevated`/`border`/`text-secondary` — a *recessed* tone, since a `Pill` is informational, not a control; `success`/`warning`/`danger` each pair a surface, border, and text color from the same semantic family). Label is always 11px/800/uppercase with 0.8px tracking.
- **Never solid-filled** — this is what separates a `Pill` from the primary `Button` (see The Single Fill Rule).

### Cards
- **Corner:** 22px radius (`rounded.xl`).
- **Background:** `panel-2` — meaningfully lighter than page background (see The Recessed/Raised Rule for what goes inside it).
- **Shadow:** none at rest; `shadow.card` only when `elevated` is passed (see Elevation & Depth).
- **Border:** 1px `border`.
- **Internal padding:** 16px (`spacing.lg`).
- **Header slot (`CardHeader`, optional):** a left-aligned Cinzel eyebrow label with an optional right-aligned mono meta value ("Athlete State" / "Workout 14") — the opening row a card reaches for when it needs to name itself and surface one small fact, in place of hand-rolled per-card eyebrow text. Skip it where a `SectionHeader` directly above the card already states the same title; stacking the identical label twice (once as a section title, once as a card header) is a duplication bug, not a feature — give the `CardHeader`, or the `SectionHeader`'s own `caption`, a genuinely different value instead.

### Status Tags
Small row-state badges (`done` / `current` / `queued`) for ledger-style lists where a glance needs to distinguish "already happened," "happening now," and "hasn't happened yet" — currently the Train screen's set ledger (`DONE` / `NOW` / `QUEUE`) and Progress's recent-session PR badge (reusing the `current` tone). Distinct from `Pill`: a `Pill` is a standalone label, a `StatusTag` is always attached to a specific row and follows The Recessed/Raised Rule — `done` and `queued` are informational (raised/recessed neutral tones), `current` is the one state allowed a solid copper fill outside of a primary `Button`, because it is marking the single row the athlete is meant to act on right now — the same "one warm light source, spent deliberately" logic as the Hero Glow, applied to a list row instead of a screen corner.

### Hero Glow (signature flourish)
A single soft copper radial glow, positioned top-right inside Home's hero `Card` only (`overflow: hidden` on the card clips it to the rounded corner). Implemented as a 220×220 circular `expo-linear-gradient` (`rgba(183,90,55,0.32)` → transparent, diagonal from the top-right corner), `pointerEvents: 'none'`, rendered first so content stacks above it. This is the system's one deliberate visual risk — it never appears twice on the same screen, and it never appears on any screen but Home's hero.

### Stat Tiles
- **Corner:** 14px radius.
- **Background:** `background-elevated` (one step brighter than a default `Card`, so a stat grid reads as instrumentation sitting *on* a card, not as another card).
- **Content:** numeral value + uppercase caption label, no border color variation by value (no red/green stat tiles today).

### Set Rows (signature component)
The Train screen's core interaction unit — a single logging row with a weight field, a reps field, and a completion check. Each row carries one of three states, tagged with a `StatusTag` next to its set number:
- **Queued** (not yet reached): no background fill, sits flush against the card, separated from the next row by a `border-subtle` rule (not a full card boundary) — the system's default, quietest state.
- **Current** (the next unlogged set): lifts off the card onto `control-bg`, gets a 1px `worn-copper` border, and a 3px copper accent bar down its left edge — the one row on the whole screen the athlete's eye should land on first.
- **Done** (logged): same flush layout as queued, opacity dropped to 0.55 — present but visually settled, not competing with the current row.

Fields are `background-elevated` boxes with 10px radius and a 44px-minimum-height input, recessed relative to whichever row state they sit inside (including the raised `current` row — see The Recessed/Raised Rule). The completion check is a 40×40 button that goes from `background-elevated`/`border` to `success-surface`/`success` on tap — no intermediate animation state today, a direct state swap.

### Rest Timer (signature component)
Appears inline on Train immediately after a set is marked complete. Copper-tinted throughout (`copper-surface` fill, `copper-border` border) — the one place besides the primary button where the accent registers as a full panel rather than just text. Fires a success-type haptic notification when the countdown reaches zero. This is the system's clearest "ambient warmth, not decoration" moment: the copper surface appears exactly when the athlete is meant to notice it, and nowhere else on the same screen.

### Progress Bars
- **Style:** 6px track height, `pill` radius, `background-elevated` track (recessed, per The Recessed/Raised Rule) / `worn-copper` fill. Used identically for session-completion progress (Train) and milestone-stage progress (Progress) — one progress-bar language across the app, no per-screen variants.

### Navigation
- **Style:** fixed bottom tab bar, 5 destinations (Home, Train, Progress, Coach, Profile), `background-elevated` fill, 1px `border` top rule. Active icon + label in `faded-copper-glow`; inactive in `text-tertiary`. Icons swap between an outline glyph (inactive) and a filled glyph (active) rather than changing color alone — a second, redundant signal for the active tab beyond color.

## Do's and Don'ts

### Do:
- **Do** reserve solid copper fill for the primary `Button` and the `StatusTag` `current` tone only — nothing else (The Single Fill Rule).
- **Do** treat completed/success states as their own color family (`success`/`success-surface`) — never reuse the brand accent to mean "done."
- **Do** pair every primary interaction with a light haptic impact, and every "timer reaches zero" moment with a success-type haptic notification.
- **Do** keep card-internal separation to `border-subtle` dividers rather than nesting a second card.
- **Do** pick `background-elevated` (recessed) or `control-bg` (raised) for anything nested inside a `Card`, based on whether it's informational or actionable (The Recessed/Raised Rule) — never `panel-2`, which is the card's own tone.
- **Do** reuse `CardHeader`/`StatusTag` for a new card-opening label or row-state badge rather than hand-rolling another one-off `Text` + `StyleSheet` pair.

### Don't:
- **Don't** add `shadow.card` to a `Card` unless it is deliberately the one focal card on the screen (The One Shadow Rule).
- **Don't** introduce a second typeface (e.g. a monospace face for numerals) without recording the decision here first — it has been discussed but is not yet implemented.
- **Don't** use badges, streak counters, confetti, or other gamified point systems anywhere in the product (binding per `docs/PRODUCT.md`). `StatusTag` is a row-state indicator reflecting real logged state, not a gamification device — it never awards anything.
- **Don't** apply the eyebrow/label uppercase-and-tracked treatment to body copy — it is reserved for section eyebrows and micro-labels only.
- **Don't** stack a `CardHeader` label on top of an identical `SectionHeader` title directly above the same card — fold the extra fact into the `SectionHeader`'s own `caption` instead (see Cards).
