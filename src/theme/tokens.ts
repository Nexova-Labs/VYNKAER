// VYNKÆR design tokens — dark, restrained, copper-accented.
// One source of truth for color/spacing/typography across the app.

export const colors = {
  background: '#0a0a0b',
  backgroundElevated: '#111114',
  panel: '#141417',
  panelElevated: '#191a1e',
  panel2: '#1c1c21',
  border: '#26262c',
  borderSubtle: '#1e1e23',

  textPrimary: '#f5f4f1',
  textSecondary: '#9a9aa3',
  textTertiary: '#6c6c74',

  accent: '#b75a37',
  accentStrong: '#d4713f',
  accentSoft: '#e6b08e',
  accentSurface: '#1d1614',
  accentBorder: '#3b302d',

  success: '#7ea583',
  successSurface: '#182420',
  warning: '#c98a4b',
  warningSurface: '#241d15',
  danger: '#c15c5c',
  dangerSurface: '#241717',

  overlay: 'rgba(5,5,6,0.72)',
  white: '#ffffff',
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
  eyebrow: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.accentSoft,
  },
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
    color: colors.textPrimary,
    lineHeight: 40,
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
  numeral: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
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
