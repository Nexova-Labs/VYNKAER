import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

type StatusTagTone = 'done' | 'current' | 'queued';

// Small state badge for ledger-style rows (a workout set, a session log)
// where DONE / NOW / QUEUED needs to read at a glance — distinct from Pill,
// which is used for standalone labels rather than row-state.
export function StatusTag({ label, tone }: { label: string; tone: StatusTagTone }) {
  const palette = tones[tone];
  return (
    <View style={[styles.tag, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const tones: Record<StatusTagTone, { bg: string; text: string }> = {
  done: { bg: colors.controlBg, text: colors.textSecondary },
  current: { bg: colors.accent, text: colors.onAccent },
  queued: { bg: colors.backgroundElevated, text: colors.textTertiary },
};

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
