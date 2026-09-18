import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Exercise, ExerciseProgressionState, SetLog, WorkoutExercise } from '../../types';
import { Button, Card, Pill } from '../../components';
import { colors, spacing, typography } from '../../theme';
import { formatRepRange, formatWeight, movementPatternLabel } from '../../utils/format';
import { SetRow } from './SetRow';

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
  definition: Exercise;
  previous?: ExerciseProgressionState;
  index: number;
  total: number;
  onSetChange: (setNumber: number, patch: Partial<SetLog>) => void;
  onToggleComplete: (setNumber: number) => void;
  onAddSet: () => void;
  onRemoveSet: (setNumber: number) => void;
  onSkip: () => void;
  onSubstitute: () => void;
}

export function ExerciseCard({
  workoutExercise,
  definition,
  previous,
  index,
  total,
  onSetChange,
  onToggleComplete,
  onAddSet,
  onRemoveSet,
  onSkip,
  onSubstitute,
}: ExerciseCardProps) {
  return (
    <Card elevated>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>
            EXERCISE {index + 1} / {total} · {movementPatternLabel(definition.movementPattern)}
          </Text>
          <Text style={styles.name}>{definition.name}</Text>
          <Text style={styles.target}>
            {workoutExercise.targetSets} sets × {formatRepRange(workoutExercise.targetRepMin, workoutExercise.targetRepMax)}
            {'  ·  '}
            {formatWeight(workoutExercise.recommendedLoad)}
          </Text>
        </View>
        {workoutExercise.substitutedFromExerciseId ? <Pill label="Substituted" tone="warning" /> : null}
      </View>

      {previous ? (
        <Text style={styles.previous}>
          Last performance: {formatWeight(previous.lastLoad)} · {previous.lastRepsPerSet.join('/')} reps
        </Text>
      ) : (
        <Text style={styles.previous}>First time logging this movement.</Text>
      )}

      <View style={styles.reasonBox}>
        <Text style={styles.reasonText}>{workoutExercise.recommendationReason}</Text>
      </View>

      <View style={styles.sets}>
        {workoutExercise.sets.map((set) => (
          <SetRow
            key={set.setNumber}
            set={set}
            onChange={(patch) => onSetChange(set.setNumber, patch)}
            onToggleComplete={() => onToggleComplete(set.setNumber)}
            onRemove={workoutExercise.sets.length > 1 ? () => onRemoveSet(set.setNumber) : undefined}
          />
        ))}
      </View>

      {workoutExercise.notes ? <Text style={styles.notes}>{workoutExercise.notes}</Text> : null}

      <View style={styles.actions}>
        <Button label="Add set" onPress={onAddSet} variant="ghost" style={styles.actionBtn} />
        <Button label="Substitute" onPress={onSubstitute} variant="ghost" style={styles.actionBtn} />
        <Button
          label={workoutExercise.skipped ? 'Unskip' : 'Skip'}
          onPress={onSkip}
          variant="ghost"
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  name: {
    ...typography.h2,
    fontSize: 20,
  },
  target: {
    ...typography.bodyMuted,
    marginTop: 2,
  },
  previous: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  reasonBox: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  reasonText: {
    ...typography.caption,
    color: colors.accentSoft,
    lineHeight: 17,
  },
  sets: {
    marginBottom: spacing.sm,
  },
  notes: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
});
