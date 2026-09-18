import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

export function SessionProgress({
  exercisesDone,
  exercisesTotal,
  setsDone,
  setsTotal,
}: {
  exercisesDone: number;
  exercisesTotal: number;
  setsDone: number;
  setsTotal: number;
}) {
  const pct = setsTotal > 0 ? setsDone / setsTotal : 0;
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.label}>
          {exercisesDone} / {exercisesTotal} exercises
        </Text>
        <Text style={styles.label}>
          {setsDone} / {setsTotal} sets
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.panel2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
});
