// Design tokens. Colors are the approved OSMIUM palette (src/theme/osmium.ts,
// docs/osmium/DESIGN_SYSTEM_V2.md): obsidian/graphite/gunmetal surfaces, silver and
// titanium text, instrument blue as the restrained interaction signal. Type, spacing,
// radius and motion below are still the VYNKÆR values until Phase 1 step 2. Fonts: OSMIUM roles below.
import { osmiumColors } from './osmium';

export const colors = osmiumColors;

// OSMIUM type roles (docs/osmium/DESIGN_SYSTEM_V2.md §4). Open-licence stand-ins for the
// reference faces (licensing Canela / Neue Haas is deferred to before public launch):
//   display  Instrument Serif   Canela-like editorial serif: human prompts and screen titles
//   ui       Inter              neo-grotesk: navigation, body, labels, controls
//   data     IBM Plex Mono      every standalone measured numeral (loads, reps, time)
// Static fonts carry their weight in the file, so each weight is its own family name. UI text
// goes through src/components/Text, which maps `fontWeight` onto the right Inter file.
export const fontFamily = {
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemiBold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  mono: 'IBMPlexMono_500Medium',
  monoBold: 'IBMPlexMono_700Bold',
  // Legacy role names kept so existing call sites compile; remapped to the OSMIUM families.
  display: 'Inter_600SemiBold',
  displayBold: 'Inter_700Bold',
  editorial: 'InstrumentSerif_400Regular',
  editorialBold: 'InstrumentSerif_400Regular',
  editorialItalic: 'InstrumentSerif_400Regular_Italic',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  microLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  // TechnicalLabel role (v2): Inter SemiBold, small, tracked, uppercase, titanium.
  // Eyebrows and section marks only, never full sentences.
  eyebrow: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
    color: colors.accentSoft,
  },
  // Display role (v2 scale 36-44): Instrument Serif, sentence case. Screen-level
  // titles and other human-facing statements, not UI chrome.
  title: {
    fontFamily: fontFamily.serif,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  heroTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 44,
    letterSpacing: -0.4,
    color: colors.textPrimary,
    lineHeight: 48,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodyMuted: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  // Italic display serif for standalone quoted lines (onboarding). Copy is still VYNKÆR's
  // and is rewritten in the OSMIUM voice in a later step.
  doctrine: {
    fontFamily: fontFamily.serifItalic,
    fontSize: 19,
    letterSpacing: 0,
    color: colors.accentSoft,
  },
  numeral: {
    fontFamily: fontFamily.monoBold,
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const touchTarget = {
  minHeight: 48,
} as const;

export const motion = {
  fast: 140,
  base: 220,
  slow: 340,
} as const;
