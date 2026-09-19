// VYNKÆR design tokens — dark, restrained, copper-accented.
// One source of truth for color/spacing/typography across the app.
// Palette calibrated against the VYNKÆR Apparel Brand Bible (Collection 001
// — Forged Soul): Obsidian/Charcoal dominate 80-90% of any frame, Oxide
// Copper is the premium/UI accent, Blood Oath red is reserved for the rare
// "energy" mark (danger/critical states only — see DESIGN.md).
export const colors = {
  background: '#0a0a0b', // Obsidian #0A0A0B
  backgroundElevated: '#111114',
  panel: '#141417',
  panelElevated: '#191a1e',
  panel2: '#1c1c21', // Charcoal #202023 register
  border: '#26262c',
  borderSubtle: '#1e1e23',

  textPrimary: '#efe9e2', // Ash #B8B1A7 register, lifted for body-copy contrast
  textSecondary: '#9a948d',
  textTertiary: '#6c6a68',

  accent: '#975a36', // Oxide Copper #975A36
  accentStrong: '#b97140',
  accentSoft: '#d9a578',
  accentSurface: '#1d1614',
  accentBorder: '#3b302d',

  success: '#7ea583',
  successSurface: '#182420',
  warning: '#c98a4b',
  warningSurface: '#241d15',

  // Blood Oath red — the brand's primary accent, rationed to danger/critical
  // states and the odd campaign-style mark. Never a second competing "warm"
  // fill alongside Oxide Copper on the same screen.
  danger: '#b23c42',
  dangerSurface: '#241414',
  bloodOath: '#98181d',
  bloodOathSurface: '#1e1112',
  bloodOathBorder: '#3d2224',

  overlay: 'rgba(5,5,6,0.72)',
  white: '#ffffff',
} as const;

// Three-typeface system (DESIGN.md "The Measured-Value Rule" + brand-bible
// typography system): Cinzel for display/collection moments (wide tracking,
// uppercase, gothic-performance register), system sans for every other
// human-authored word, IBM Plex Mono for every standalone measured numeral
// (weights, reps, timers, deltas, counts). Never mixed within a single
// sentence — Cinzel and mono are both reserved for isolated display use.
export const fontFamily = {
  display: 'Cinzel_600SemiBold',
  displayBold: 'Cinzel_700Bold',
  editorial: 'EBGaramond_500Medium',
  editorialBold: 'EBGaramond_700Bold',
  editorialItalic: 'EBGaramond_500Medium_Italic',
  mono: 'IBMPlexMono_500Medium',
  monoBold: 'IBMPlexMono_700Bold',
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
  // Brand-bible "Display / collection" role: Cinzel, wide tracking, uppercase.
  // Reserved for the brand micro-label register — eyebrows, tab-adjacent
  // section marks — never for full sentences.
  eyebrow: {
    fontFamily: fontFamily.display,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: colors.accentSoft,
  },
  // Brand-bible "Editorial / manifesto" role: EB Garamond, sentence case.
  // Used for the screen-level taglines ("Train what comes next.") that read
  // as doctrine fragments, not UI chrome.
  title: {
    fontFamily: fontFamily.editorialBold,
    fontSize: 32,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  heroTitle: {
    fontFamily: fontFamily.editorialBold,
    fontSize: 40,
    letterSpacing: -0.3,
    color: colors.textPrimary,
    lineHeight: 44,
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
  // Restrained italic for manifesto/doctrine quotes ("FORGED, NOT BORN.").
  doctrine: {
    fontFamily: fontFamily.editorialItalic,
    fontSize: 17,
    letterSpacing: 0.2,
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
