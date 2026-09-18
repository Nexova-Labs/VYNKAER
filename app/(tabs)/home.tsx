import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Card, EmptyState, Pill, ScreenContainer, SectionHeader, StatTile } from '../../src/components';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import { useAppState } from '../../src/state';
import { colors, radius, spacing, typography } from '../../src/theme';
import { formatRepRange, formatWeight, modalityLabel, movementPatternLabel } from '../../src/utils/format';

export default function HomeScreen() {
  const { profile, trainingState, history, activeWorkout, currentPlan, startWorkout, regeneratePlan } = useAppState();

  const lastSession = history[history.length - 1];
  const lastLimitation = lastSession?.feedback?.limitationAfter ?? 0;

  const handleStart = () => {
    if (!activeWorkout) startWorkout();
    router.push('/(tabs)/train');
  };

  return (
    <ScreenContainer>
      <View style={styles.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>VYNKÆR Training / {profile.displayName}</Text>
          <Text style={styles.title}>Train what comes next.</Text>
          <Text style={styles.subtitle}>Built from your previous work, not random generation.</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{initials(profile.displayName)}</Text>
        </View>
      </View>

      {activeWorkout ? (
        <Card elevated style={styles.hero}>
          <Pill label={`In progress · ${modalityLabel(activeWorkout.modality)}`} />
          <Text style={styles.heroTitle}>
            WORKOUT {activeWorkout.workoutNumber}
            {'\n'}
            {activeWorkout.focus}
          </Text>
          <Text style={styles.heroBody}>You have a session already underway. Pick up where you left off.</Text>
          <Button label="RESUME WORKOUT" onPress={handleStart} fullWidth style={{ marginTop: spacing.lg }} />
        </Card>
      ) : currentPlan ? (
        <Card elevated style={styles.hero}>
          <Pill label={`Next session · ${modalityLabel(currentPlan.modality)}`} />
          <Text style={styles.heroTitle}>
            WORKOUT {trainingState.currentWorkoutNumber}
            {'\n'}
            {currentPlan.focus}
          </Text>
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
      ) : (
        <EmptyState title="Preparing your session" body="Loading your training context." />
      )}

      <Card style={styles.stateCard}>
        <Text style={styles.eyebrowSmall}>Athlete State</Text>
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
              <Card key={ex.exerciseId} style={styles.exerciseRow}>
                <View style={styles.exerciseNum}>
                  <Text style={styles.exerciseNumLabel}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{def.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.targetSets} × {formatRepRange(ex.targetRepMin, ex.targetRepMax)} ·{' '}
                    {formatWeight(ex.recommendedLoad)}
                  </Text>
                </View>
                <Pill label={movementPatternLabel(def.movementPattern)} tone="neutral" />
              </Card>
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

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
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
  eyebrowSmall: {
    ...typography.eyebrow,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodyMuted,
    marginTop: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontWeight: '800',
    color: colors.textPrimary,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.heroTitle,
    fontSize: 30,
    marginTop: spacing.md,
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
    backgroundColor: colors.panel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumLabel: {
    color: colors.accentSoft,
    fontWeight: '800',
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
