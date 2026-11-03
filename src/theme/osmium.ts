// OSMIUM design tokens — Phase 0, parallel module. NOT yet wired into the app.
//
// The running app still reads `./tokens` (VYNKÆR copper). This file is the
// approved OSMIUM palette (Brand Identity & Design System v2, 3 Nov 2026)
// shaped so the Phase 1 swap is mechanical: `osmiumColors` carries exactly the
// same keys as the legacy `colors` object (enforced by `satisfies` below), so
// every existing `colors.x` call site keeps compiling when tokens.ts switches
// over. Spec, rationale and contrast measurements: docs/osmium/DESIGN_SYSTEM_V2.md.
//
// Provenance markers used in comments:
//   [approved] — a locked brand value from the v2 design system.
//   [derived]  — chosen during Phase 0 to fill a role the brand doc does not
//                name; needs design sign-off before it is treated as locked.
//
// Deliberately not exported from `src/theme/index.ts` so nothing in the app can
// pick it up by accident before the Phase 1 migration.

import type { colors as legacyColors } from './tokens';

/** The six approved brand colors plus the logo-silver fallback. */
export const osmiumPalette = {
  obsidian: '#000000', // [approved] primary background, true OLED black
  graphite: '#0E1116', // [approved] elevated surface
  gunmetal: '#242D36', // [approved] dividers, secondary panels, structural borders
  titanium: '#C5CBD0', // [approved] secondary text, refined edges
  instrumentBlue: '#6E9FC9', // [approved] focus, selection, significant trends — never a dominant fill
  silverWhite: '#F1F3F5', // [approved] primary text and highlights
  logoSilver: '#E2E5E8', // [approved] monochrome logo fallback only — not a UI text color
} as const;

// Same key set as the legacy `colors` so Phase 1 is a one-line swap.
// Measured WCAG contrast ratios are recorded in DESIGN_SYSTEM_V2.md §3.
export const osmiumColors = {
  background: osmiumPalette.obsidian,
  backgroundElevated: '#07090C', // [derived] recessed well inside a Card (badges, tracks) and the tab bar
  panel: osmiumPalette.graphite,
  panelElevated: '#12161C', // [derived]
  panel2: osmiumPalette.graphite, // Card surface
  controlBg: '#1A2129', // [derived] raised control on a Card — between graphite and gunmetal
  border: osmiumPalette.gunmetal,
  borderSubtle: '#181E25', // [derived]

  textPrimary: osmiumPalette.silverWhite,
  textSecondary: osmiumPalette.titanium,
  textTertiary: '#8B949C', // [derived] 6.1:1 on graphite — still AA for body text

  accent: osmiumPalette.instrumentBlue,
  accentStrong: '#8DB5D8', // [derived] pressed/emphasis state of instrument blue
  // Legacy screens use accentSoft for eyebrows and tinted labels. Under OSMIUM
  // those roles move to titanium (see DESIGN_SYSTEM_V2.md §3.3), so the mapped
  // value is deliberately neutral rather than another blue.
  accentSoft: osmiumPalette.titanium,
  accentSurface: '#0D1620', // [derived] instrument-blue tinted well for explanation/notice blocks
  accentBorder: '#22374A', // [derived]

  // Semantic colors are independent of the brand accent and exist for safety
  // and usability only.
  success: '#7FAE8C', // [derived]
  successSurface: '#0F1A14', // [derived]
  warning: '#D1A55A', // [derived] amber, semantic only — never a brand accent
  warningSurface: '#1C160C', // [derived]
  danger: '#DB6F6B', // [derived]
  dangerSurface: '#1E0F0F', // [derived]

  // VYNKÆR-only roles. Kept so legacy call sites compile; mapped onto the
  // danger family. Remove once no screen references them.
  bloodOath: '#DB6F6B',
  bloodOathSurface: '#1E0F0F',
  bloodOathBorder: '#3A1C1C',

  overlay: 'rgba(0,0,0,0.72)',
  white: '#ffffff',
} as const satisfies Record<keyof typeof legacyColors, string>;

/**
 * Typography roles. Font families are PROPOSED open-licence stand-ins for the
 * Canela-like display serif and Neue Haas Grotesk-like UI sans; none of them is
 * installed yet, so these names would not resolve if used today. The decision
 * is open — see DESIGN_SYSTEM_V2.md §4 and TOMORROW_START_HERE.md.
 */
export const osmiumFontRoles = {
  display: { proposed: 'InstrumentSerif_400Regular', legacy: 'EBGaramond_500Medium' },
  ui: { proposed: 'Inter_400Regular', legacy: 'System' },
  uiMedium: { proposed: 'Inter_500Medium', legacy: 'System' },
  uiSemiBold: { proposed: 'Inter_600SemiBold', legacy: 'System' },
  data: { proposed: 'IBMPlexMono_500Medium', legacy: 'IBMPlexMono_500Medium' },
} as const;

/** Type scale in points, from the v2 spec (display 36-44, headings 22-26, body 15-17, labels 12-13, micro 11+). */
export const osmiumTypeScale = {
  display: { fontSize: 40, lineHeight: 44, letterSpacing: -0.4 },
  heading: { fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  subheading: { fontSize: 18, lineHeight: 24, letterSpacing: 0 },
  body: { fontSize: 16, lineHeight: 23, letterSpacing: 0 },
  bodySmall: { fontSize: 15, lineHeight: 21, letterSpacing: 0 },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 1.2 },
  micro: { fontSize: 11, lineHeight: 14, letterSpacing: 1.4 },
  metric: { fontSize: 28, lineHeight: 32, letterSpacing: 0 },
} as const;

/** Apply to every measured value (load, reps, time) so digits do not jitter as they change. */
export const tabularNumerals = { fontVariant: ['tabular-nums'] as const };

/** 8-point rhythm. `xs` is the only sub-8 step, for hairline gaps inside controls. */
export const osmiumSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  screenGutter: 20, // within the 16-24pt mobile margin band
} as const;

/** Restrained radii — architectural, not toy-like. */
export const osmiumRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999, // reserved for status capsules only
} as const;

export const osmiumBorder = {
  hairline: 1,
  focus: 2, // focus ring width, drawn in instrument blue
} as const;

/** One shadow at most; on true black, separation comes from surface steps and 1px rules. */
export const osmiumElevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  raised: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

/** 120-220ms per the v2 spec. Honour the OS reduced-motion setting (drop to 0). */
export const osmiumMotion = {
  fast: 120,
  base: 180,
  slow: 220,
} as const;

/** v2 floor is 44pt; the app already uses 48 and keeps it. */
export const osmiumTouchTarget = {
  minHeight: 48,
  minWidth: 48,
  hitSlop: 8,
} as const;
