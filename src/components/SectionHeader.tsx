import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';

export function SectionHeader({ title, caption }: { title: string; caption?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
  },
  caption: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
