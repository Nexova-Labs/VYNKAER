import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../src/components/Text';
import { router } from 'expo-router';

import { Button, EmptyState, ScreenContainer } from '../../src/components';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import { ExerciseCard, RestTimer, SessionProgress } from '../../src/features/workout';
import { useAppState } from '../../src/state';
import { colors, spacing, typography } from '../../src/theme';
import { modalityLabel } from '../../src/utils/format';

export default function TrainScreen() {
  const {
    activeWorkout,
    trainingState,
    updateSetLog,
    toggleSetCompleted,
    addSet,
    removeSet,
    skipExercise,
    substituteExercise,
  } = useAppState();

  const [index, setIndex] = useState(0);
  const [showRest, setShowRest] = useState(false);

  if (!activeWorkout) {
    return (
      <ScreenContainer scroll={false} contentStyle={styles.emptyRoot}>
        <EmptyState
          title="No active session"
          body="Start today's workout from Home. The next session is generated from your training history."
        />
        <Button label="Go to Home" onPress={() => router.push('/(tabs)/home')} style={{ marginTop: spacing.lg }} />
      </ScreenContainer>
    );
  }

  const exercises = activeWorkout.exercises;
  const clampedIndex = Math.min(index, exercises.length - 1);
  const current = exercises[clampedIndex];
  const definition = EXERCISE_LIBRARY.find((e) => e.id === current.exerciseId);

  const setsTotal = exercises.reduce((sum, ex) => sum + (ex.skipped ? 0 : ex.sets.length), 0);
  const setsDone = exercises.reduce((sum, ex) => sum + (ex.skipped ? 0 : ex.sets.filter((s) => s.completed).length), 0);
  const exercisesDone = exercises.filter((ex) => ex.skipped || ex.sets.every((s) => s.completed)).length;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(exercises.length - 1, i + 1));

  const handleToggleComplete = (setNumber: number) => {
    const wasCompleted = current.sets.find((s) => s.setNumber === setNumber)?.completed;
    toggleSetCompleted(current.exerciseId, setNumber);
    if (!wasCompleted) setShowRest(true);
  };

  return (
    <ScreenContainer contentStyle={{ paddingTop: spacing.md }}>
      <View style={styles.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Live Session</Text>
          <Text style={styles.title}>
            Workout {activeWorkout.workoutNumber} · {modalityLabel(activeWorkout.modality)}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/home')}
          accessibilityRole="button"
          accessibilityLabel="Exit session"
          style={styles.exitBtn}
        >
          <Text style={styles.exitLabel}>Exit</Text>
        </Pressable>
      </View>

      <SessionProgress
        exercisesDone={exercisesDone}
        exercisesTotal={exercises.length}
        setsDone={setsDone}
        setsTotal={setsTotal}
      />

      {showRest ? <RestTimer onDismiss={() => setShowRest(false)} /> : null}

      {definition ? (
        <ExerciseCard
          workoutExercise={current}
          definition={definition}
          previous={trainingState.exerciseProgression[current.exerciseId]}
          index={clampedIndex}
          total={exercises.length}
          onSetChange={(setNumber, patch) => updateSetLog(current.exerciseId, setNumber, patch)}
          onToggleComplete={handleToggleComplete}
          onAddSet={() => addSet(current.exerciseId)}
          onRemoveSet={(setNumber) => removeSet(current.exerciseId, setNumber)}
          onSkip={() => skipExercise(current.exerciseId)}
          onSubstitute={() => substituteExercise(current.exerciseId)}
        />
      ) : null}

      <View style={styles.navRow}>
        <Button label="Previous" onPress={goPrev} variant="secondary" disabled={clampedIndex === 0} style={{ flex: 1 }} />
        <Button
          label="Next"
          onPress={goNext}
          variant="secondary"
          disabled={clampedIndex === exercises.length - 1}
          style={{ flex: 1 }}
        />
      </View>

      <Button
        label="FINISH & SAVE"
        onPress={() => router.push('/workout/complete')}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 0,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  eyebrow: {
    ...typography.eyebrow,
    marginBottom: 4,
  },
  title: {
    ...typography.h2,
    fontSize: 20,
  },
  exitBtn: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  exitLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
