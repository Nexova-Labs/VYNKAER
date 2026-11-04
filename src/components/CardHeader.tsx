import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

import { colors, fontFamily, spacing, typography } from '../theme';

// Reusable card-opening row (brand-bible "measured value" register): a
// Inter eyebrow label on the left, an optional mono meta readout on the
// right — the pattern every card in the reference direction opens with
// ("PRIMARY COMPOUND ... PLATE 1 OF 5").
export function CardHeader({ label, meta }: { label: string; meta?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.eyebrow,
    fontSize: 11,
  },
  meta: {
    fontFamily: fontFamily.mono,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
});
