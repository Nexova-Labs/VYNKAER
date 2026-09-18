import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

export function Pill({ label, tone = 'accent' }: { label: string; tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger' }) {
  const palette = tones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const tones = {
  accent: { bg: colors.accentSurface, border: colors.accentBorder, text: colors.accentSoft },
  neutral: { bg: colors.panel2, border: colors.border, text: colors.textSecondary },
  success: { bg: colors.successSurface, border: colors.success, text: colors.success },
  warning: { bg: colors.warningSurface, border: colors.warning, text: colors.warning },
  danger: { bg: colors.dangerSurface, border: colors.danger, text: colors.danger },
} as const;

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
