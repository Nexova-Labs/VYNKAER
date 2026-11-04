import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../src/components/Text';
import { router } from 'expo-router';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

import { Button, Card, CardHeader, Crest, EmptyState, Pill, ScreenContainer, SectionHeader, StatTile } from '../../src/components';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import { useAppState } from '../../src/state';
import { colors, fontFamily, radius, spacing, typography } from '../../src/theme';
import {
  formatExerciseLoad,
  formatExerciseTarget,
  formatRepRange,
  modalityLabel,
  movementPatternLabel,
} from '../../src/utils/format';

export default function TodayScreen() {
  const { profile, trainingState, history, activeWorkout, currentPlan, startWorkout, regeneratePlan } = useAppState();

  const lastSession = history[history.length - 1];
  const lastLimitation = lastSession?.feedback?.limitationAfter ?? 0;

  const handleStart = () => {
    if (!activeWorkout) startWorkout();
    router.push('/(tabs)/training');
  };

  return (
    <ScreenContainer tabTitle="Today">
      <View style={styles.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>VYNKÆR Training / {profile.displayName}</Text>
          <Text style={styles.title}>Train what comes next.</Text>
          <Text style={styles.subtitle}>Built from your previous work, not random generation.</Text>
        </View>
      </View>

      {activeWorkout ? (
        <Animated.View entering={FadeInUp.duration(420).easing(Easing.out(Easing.cubic))}>
          <Card elevated style={styles.hero}>
            <View style={styles.heroCrest}>
              <Crest size={40} tone="copper" />
            </View>
            <Pill label={`In progress · ${modalityLabel(activeWorkout.modality)}`} />
            <Text style={styles.heroNumber}>WORKOUT {activeWorkout.workoutNumber}</Text>
            <Text style={styles.heroFocus}>{activeWorkout.focus}</Text>
            <Text style={styles.heroBody}>You have a session already underway. Pick up where you left off.</Text>
            <Button label="RESUME WORKOUT" onPress={handleStart} fullWidth style={{ marginTop: spacing.lg }} />
          </Card>
        </Animated.View>
      ) : currentPlan ? (
        <Animated.View entering={FadeInUp.duration(420).easing(Easing.out(Easing.cubic))}>
          <Card elevated style={styles.hero}>
            <View style={styles.heroCrest}>
              <Crest size={40} tone="copper" />
            </View>
            <Pill label={`Next session · ${modalityLabel(currentPlan.modality)}`} />
            <Text style={styles.heroNumber}>WORKOUT {trainingState.currentWorkoutNumber}</Text>
            <Text style={styles.heroFocus}>{currentPlan.focus}</Text>
            <View style={styles.metaRow}>
              <MetaChip label={`Target ${formatRepRange(profile.primaryRepRange[0], profile.primaryRepRange[1])}`} />
              <MetaChip label={`Effort ${currentPlan.targetRPE}/10`} />
              <MetaChip label={`~${currentPlan.estimatedDurationMinutes} min`} />
              {trainingState.activeLimitations.length > 0 ? <MetaChip label="Conservative" /> : null}
            </View>
            <View style={styles.actionsRow}>
              <Button label="START WORKOUT" onPress={handleStart} style={{ flex: 1 }} />
              <Button label="Regenerate" onPress={regeneratePlan} variant="secondary" style={{ flex: 1 }} />
            </View>
          </Card>
        </Animated.View>
      ) : (
        <EmptyState title="Preparing your session" body="Loading your training context." />
      )}

      <Pressable
        onPress={() => router.push('/coach')}
        accessibilityRole="button"
        accessibilityLabel="Open Coach. How are you feeling today?"
        style={({ pressed }) => [styles.coachPrompt, pressed && styles.coachPromptPressed]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.coachPromptTitle}>How are you feeling today?</Text>
          <Text style={styles.coachPromptBody}>Tell the Coach. Nothing changes until you approve it.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </Pressable>

      <Card style={styles.stateCard}>
        <CardHeader label="Athlete State" meta={`Workout ${trainingState.currentWorkoutNumber}`} />
        <View style={styles.statGrid}>
          <StatTile value={String(trainingState.sessionsCompleted)} label="Sessions" />
          <StatTile value={formatRepRange(profile.primaryRepRange[0], profile.primaryRepRange[1])} label="Rep target" />
          <StatTile value={`${lastLimitation}/10`} label="Last limitation" />
          <StatTile value={`${trainingState.lastCardioMinutes}m`} label="Last cardio" />
        </View>
        {currentPlan && currentPlan.generationExplanation.length > 0 ? (
          <View style={styles.notice}>
            {currentPlan.generationExplanation.map((line, i) => (
              <Text key={i} style={styles.noticeLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}
      </Card>

      <SectionHeader title="Generated session" caption="Based on previous performance + rotation rules" />
      <View style={{ gap: spacing.sm }}>
        {(currentPlan?.exercises ?? activeWorkout?.exercises ?? [])
          .filter((ex) => !ex.skipped)
          .map((ex, i) => {
            const def = EXERCISE_LIBRARY.find((e) => e.id === ex.exerciseId);
            if (!def) return null;
            return (
              <Animated.View key={ex.exerciseId} entering={FadeInDown.duration(320).delay(i * 55)}>
                <Card style={styles.exerciseRow}>
                  <View style={styles.exerciseNum}>
                    <Text style={styles.exerciseNumLabel}>{String(i + 1).padStart(2, '0')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{def.name}</Text>
                    <Text style={styles.exerciseMeta}>
                      {ex.targetSets} × {formatExerciseTarget(def.movementPattern, ex.targetRepMin, ex.targetRepMax)}
                      {formatExerciseLoad(def.movementPattern, ex.recommendedLoad)
                        ? ` · ${formatExerciseLoad(def.movementPattern, ex.recommendedLoad)}`
                        : ''}
                    </Text>
                  </View>
                  <Pill label={movementPatternLabel(def.movementPattern)} tone="neutral" />
                </Card>
              </Animated.View>
            );
          })}
      </View>
    </ScreenContainer>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coachPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel2,
  },
  coachPromptPressed: {
    backgroundColor: colors.controlBg,
  },
  coachPromptTitle: {
    ...typography.h2,
    marginBottom: 2,
  },
  coachPromptBody: {
    ...typography.caption,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.eyebrow,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodyMuted,
    marginTop: 4,
  },
  hero: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroCrest: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    opacity: 0.85,
  },
  heroNumber: {
    fontFamily: fontFamily.monoBold,
    fontSize: 26,
    letterSpacing: 0,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: 2,
  },
  heroFocus: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  heroBody: {
    ...typography.bodyMuted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  metaChipLabel: {
    ...typography.caption,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  stateCard: {
    marginBottom: spacing.lg,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  notice: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  noticeLine: {
    ...typography.caption,
    color: colors.accentSoft,
    lineHeight: 18,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  exerciseNum: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumLabel: {
    fontFamily: fontFamily.monoBold,
    color: colors.accentSoft,
  },
  exerciseName: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  exerciseMeta: {
    ...typography.caption,
  },
});
