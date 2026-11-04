import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

import { colors, radius, spacing, typography } from '../theme';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMuted,
    textAlign: 'center',
  },
});
