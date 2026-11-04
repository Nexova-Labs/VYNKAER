import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Card, EmptyState, Pill, ScreenContainer, SectionHeader, StatTile } from '../../src/components';
import { useAppState } from '../../src/state';
import { colors, spacing, typography } from '../../src/theme';
import { formatDate, formatRepRange, formatWeight, movementPatternLabel } from '../../src/utils/format';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import type { ProgressionDecisionType, SetLog, WorkoutExercise } from '../../src/types';

interface Occurrence {
  sessionId: string;
  date: string;
  workoutNumber: number;
  entry: WorkoutExercise;
  completedSets: SetLog[];
}

function muscleGroupLabel(group: string): string {
  return group.charAt(0) + group.slice(1).toLowerCase().replace(/_/g, ' ');
}

function trendCopy(trend: ProgressionDecisionType): { label: string; tone: 'success' | 'neutral' | 'warning' } {
  switch (trend) {
    case 'INCREASE':
      return { label: 'Ready to progress', tone: 'success' };
    case 'MAINTAIN':
      return { label: 'Maintain load', tone: 'neutral' };
    case 'REDUCE':
      return { label: 'Reduce load', tone: 'warning' };
    case 'DELOAD':
      return { label: 'Deload', tone: 'warning' };
    case 'SUBSTITUTE':
      return { label: 'Substitute movement', tone: 'warning' };
  }
}

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history, trainingState } = useAppState();

  const exercise = useMemo(() => EXERCISE_LIBRARY.find((e) => e.id === id), [id]);

  const occurrences = useMemo<Occurrence[]>(() => {
    if (!id) return [];
    return [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .flatMap((session) => {
        const entry = session.exercises.find((ex) => ex.exerciseId === id);
        if (!entry) return [];
        const completedSets = entry.sets.filter((s) => s.completed);
        if (completedSets.length === 0) return [];
        return [
          {
            sessionId: session.id,
            date: session.date,
            workoutNumber: session.workoutNumber,
            entry,
            completedSets,
          },
        ];
      });
  }, [history, id]);

  const best = useMemo(() => {
    let bestSet: { set: SetLog; date: string } | null = null;
    for (const occurrence of occurrences) {
      for (const set of occurrence.completedSets) {
        if (!bestSet || set.weight * set.reps > bestSet.set.weight * bestSet.set.reps) {
          bestSet = { set, date: occurrence.date };
        }
      }
    }
    return bestSet;
  }, [occurrences]);

  const progression = id ? trainingState.exerciseProgression[id] : undefined;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>Exercise</Text>
        <Text style={styles.title}>{exercise?.name ?? 'Unknown exercise'}</Text>

        {exercise ? (
          <View style={styles.pillRow}>
            <Pill label={movementPatternLabel(exercise.movementPattern)} />
            {exercise.muscleGroups.map((group) => (
              <Pill key={group} label={muscleGroupLabel(group)} tone="neutral" />
            ))}
          </View>
        ) : null}
      </View>

      {occurrences.length === 0 ? (
        <EmptyState
          title="No history yet."
          body="Once this movement is logged, previous loads and recommendations appear here."
        />
      ) : (
        <>
          <View style={styles.statRow}>
            <StatTile value={String(occurrences.length)} label="Sessions logged" />
            {best ? (
              <StatTile
                value={`${formatWeight(best.set.weight)} × ${best.set.reps}`}
                label="Best performance"
              />
            ) : null}
          </View>
          {best ? <Text style={styles.bestCaption}>Best set recorded {formatDate(best.date)}.</Text> : null}

          {progression ? (
            <>
              <SectionHeader title="Recent recommendation" />
              <Card>
                <View style={styles.recommendationRow}>
                  <Pill label={trendCopy(progression.trend).label} tone={trendCopy(progression.trend).tone} />
                  <Text style={styles.recommendationLoad}>{formatWeight(progression.lastLoad)}</Text>
                </View>
                <Text style={styles.recommendationCaption}>
                  Last completed {formatDate(progression.lastCompletedAt)} ·{' '}
                  {progression.lastRepsPerSet.join(', ')} reps
                </Text>
              </Card>
            </>
          ) : null}

          <SectionHeader title="Previous sessions" caption="Oldest first" />
          <Card>
            {occurrences.map((occurrence, index) => (
              <View key={occurrence.sessionId} style={[styles.row, index > 0 && styles.rowDivided]}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowDate}>{formatDate(occurrence.date)}</Text>
                  <Text style={styles.rowTarget}>
                    {formatRepRange(occurrence.entry.targetRepMin, occurrence.entry.targetRepMax)}
                  </Text>
                </View>
                <Text style={styles.rowSets}>
                  {formatWeight(occurrence.completedSets[0].weight)} ×{' '}
                  {occurrence.completedSets.map((s) => s.reps).join(', ')}
                </Text>
                {occurrence.entry.recommendationReason ? (
                  <Text style={styles.rowReason}>{occurrence.entry.recommendationReason}</Text>
                ) : null}
              </View>
            ))}
          </Card>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    alignSelf: 'flex-start',
    paddingRight: spacing.md,
    gap: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  backLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  eyebrow: {
    ...typography.eyebrow,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bestCaption: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendationLoad: {
    ...typography.h2,
  },
  recommendationCaption: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  row: {
    paddingVertical: spacing.md,
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowDate: {
    ...typography.body,
    fontWeight: '700',
  },
  rowTarget: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  rowSets: {
    ...typography.bodyMuted,
    marginTop: 2,
  },
  rowReason: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
