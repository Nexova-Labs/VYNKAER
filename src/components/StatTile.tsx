import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

import { colors, radius, spacing, typography } from '../theme';

export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.tile} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: '47%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.md,
  },
  value: {
    ...typography.numeral,
    marginBottom: 2,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
});
