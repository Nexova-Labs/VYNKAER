import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, EmptyState, ScreenContainer, SectionHeader, StatTile } from '../../src/components';
import { useAppState } from '../../src/state';
import { colors, fontFamily, radius, spacing, typography } from '../../src/theme';
import { formatDate, modalityLabel } from '../../src/utils/format';
import { EXERCISE_LIBRARY } from '../../src/data/exercises';
import type { Milestone, WorkoutSession } from '../../src/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_POINTS = 8;

// Anchor lifts the athlete reads progress against. Matched by name keyword so
// the trend survives library edits without hard-coding exercise ids here.
const ANCHORS: { label: string; keyword: string }[] = [
  { label: 'Bench Press', keyword: 'bench' },
  { label: 'Chest Press', keyword: 'chest press' },
  { label: 'Lat Pulldown', keyword: 'pulldown' },
  { label: 'Row', keyword: 'row' },
  { label: 'Shoulder Press', keyword: 'shoulder press' },
  { label: 'Farmer Carry', keyword: 'farmer' },
];

interface TrendPoint {
  sessionId: string;
  date: string;
  topWeight: number;
}

interface TrendSeries {
  exerciseId: string;
  name: string;
  points: TrendPoint[];
  deltaPercent: number | null;
}

function sessionTopWeight(session: WorkoutSession, exerciseId: string): number | null {
  const entry = session.exercises.find((ex) => ex.exerciseId === exerciseId);
  if (!entry) return null;
  const completed = entry.sets.filter((s) => s.completed && s.weight > 0);
  if (completed.length === 0) return null;
  return Math.max(...completed.map((s) => s.weight));
}

function buildTrend(exerciseId: string, name: string, ordered: WorkoutSession[]): TrendSeries | null {
  const points: TrendPoint[] = [];
  for (const session of ordered) {
    const topWeight = sessionTopWeight(session, exerciseId);
    if (topWeight === null) continue;
    points.push({ sessionId: session.id, date: session.date, topWeight });
  }
  if (points.length === 0) return null;
  const plotted = points.slice(-TREND_POINTS);
  const first = plotted[0].topWeight;
  const last = plotted[plotted.length - 1].topWeight;
  const deltaPercent = plotted.length > 1 && first > 0 ? Math.round(((last - first) / first) * 100) : null;
  return { exerciseId, name, points: plotted, deltaPercent };
}

function formatVolume(kg: number): string {
  const rounded = Math.round(kg);
  return `${rounded.toLocaleString('en-US')} kg`;
}

function milestoneEyebrow(name: string): string {
  const stripped = name.replace(/^\d+\s*/, '').trim();
  return `${stripped} journey`;
}

export default function ProgressScreen() {
  const router = useRouter();
  const { history, profile } = useAppState();

  const ordered = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history]
  );

  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    const inLastDays = (days: number) =>
      ordered.filter((s) => now - new Date(s.date).getTime() <= days * DAY_MS).length;

    const rpes = ordered.map((s) => s.feedback?.sessionRPE).filter((v): v is number => typeof v === 'number');
    const averageRPE = rpes.length > 0 ? rpes.reduce((a, b) => a + b, 0) / rpes.length : null;

    let volume = 0;
    for (const session of ordered) {
      for (const ex of session.exercises) {
        for (const set of ex.sets) {
          if (set.completed) volume += set.weight * set.reps;
        }
      }
    }

    const cardioMinutes = ordered.reduce((sum, s) => sum + (s.feedback?.cardioMinutes ?? 0), 0);

    const expectedFortnight = Math.max(1, profile.sessionsPerWeek * 2);
    const adherence = Math.round((inLastDays(14) / expectedFortnight) * 100);

    return {
      completed: ordered.length,
      lastSevenDays: inLastDays(7),
      averageRPE,
      volume,
      cardioMinutes,
      adherence,
    };
  }, [ordered, profile.sessionsPerWeek, now]);

  const trends = useMemo(() => {
    const series: TrendSeries[] = [];
    const seen = new Set<string>();
    for (const anchor of ANCHORS) {
      const matches = EXERCISE_LIBRARY.filter((e) => e.name.toLowerCase().includes(anchor.keyword));
      for (const match of matches) {
        if (seen.has(match.id)) continue;
        const trend = buildTrend(match.id, match.name, ordered);
        if (!trend) continue;
        seen.add(match.id);
        series.push(trend);
      }
    }
    return series;
  }, [ordered]);

  const recent = useMemo(() => [...ordered].reverse().slice(0, 5), [ordered]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Progress</Text>
        <Text style={styles.title}>Performance, not noise.</Text>
        <Text style={styles.subtitle}>A compact view of consistency, strength and conditioning.</Text>
      </View>

      <View style={styles.statGrid}>
        <StatTile value={String(stats.completed)} label="Workouts completed" />
        <StatTile value={`${stats.lastSevenDays}/wk`} label={`Frequency · target ${profile.sessionsPerWeek}`} />
        <StatTile value={stats.averageRPE ? stats.averageRPE.toFixed(1) : '—'} label="Average session effort" />
        <StatTile value={formatVolume(stats.volume)} label="Total training volume" />
        <StatTile value={`${stats.cardioMinutes} min`} label="Conditioning logged" />
        <StatTile value={`${stats.adherence}%`} label="Adherence · 14 days" />
      </View>

      {ordered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="No sessions yet."
            body="Complete a workout and progress will be built from your previous work."
          />
        </View>
      ) : (
        <>
          {trends.length > 0 ? (
            <>
              <SectionHeader title="Strength trend" caption={`Last ${TREND_POINTS} sessions`} />
              {trends.map((trend) => (
                <TrendCard
                  key={trend.exerciseId}
                  trend={trend}
                  onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: trend.exerciseId } })}
                />
              ))}
            </>
          ) : null}

          {profile.currentMilestones.length > 0 ? (
            <>
              <SectionHeader title="Milestones" caption="Progress when earned" />
              {profile.currentMilestones.map((milestone) => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </>
          ) : null}

          <SectionHeader title="Recent sessions" caption="Last five" />
          <Card>
            {recent.map((session, index) => (
              <View
                key={session.id}
                style={[styles.sessionRow, index > 0 && styles.sessionRowDivided]}
                accessibilityLabel={`Workout ${session.workoutNumber}, ${modalityLabel(session.modality)}, ${formatDate(
                  session.date
                )}`}
              >
                <View style={styles.sessionMeta}>
                  <Text style={styles.sessionTitle}>
                    Workout {session.workoutNumber} · {modalityLabel(session.modality)}
                  </Text>
                  <Text style={styles.sessionCaption}>
                    {formatDate(session.date)} · {session.focus}
                  </Text>
                </View>
                {session.feedback ? (
                  <Text style={styles.sessionRpe}>RPE {session.feedback.sessionRPE.toFixed(1)}</Text>
                ) : null}
              </View>
            ))}
          </Card>
        </>
      )}
    </ScreenContainer>
  );
}

function TrendCard({ trend, onPress }: { trend: TrendSeries; onPress: () => void }) {
  const max = Math.max(...trend.points.map((p) => p.topWeight));
  const latest = trend.points[trend.points.length - 1].topWeight;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${trend.name} strength trend, open exercise detail`}
      style={({ pressed }) => [styles.trendCard, pressed && styles.pressed]}
    >
      <View style={styles.barRow}>
        {trend.points.map((point, index) => {
          const ratio = max > 0 ? point.topWeight / max : 0;
          const heightPercent = `${Math.max(12, Math.round(ratio * 100))}%` as const;
          const isLast = index === trend.points.length - 1;
          return (
            <View key={`${point.sessionId}-${index}`} style={styles.barSlot}>
              <View
                style={[styles.bar, { height: heightPercent }, isLast && styles.barCurrent]}
                accessibilityLabel={`${formatDate(point.date)}: ${point.topWeight} kilograms`}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.trendFooter}>
        <View style={styles.trendLabels}>
          <Text style={styles.trendName}>{trend.name}</Text>
          <Text style={styles.trendCaption}>Top set {latest} kg</Text>
        </View>
        {trend.deltaPercent !== null ? (
          <Text style={[styles.trendDelta, trend.deltaPercent > 0 && styles.trendDeltaPositive]}>
            {trend.deltaPercent > 0 ? '+' : ''}
            {trend.deltaPercent}%
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const total = Math.max(1, milestone.stages.length);
  const cleared = Math.min(total, milestone.currentStageIndex + 1);
  const percent = Math.round((cleared / total) * 100);
  const currentStage = milestone.stages[milestone.currentStageIndex] ?? milestone.stages[0];
  const nextStage = milestone.stages[milestone.currentStageIndex + 1];

  return (
    <Card style={styles.milestoneCard}>
      <Text style={styles.milestoneEyebrow}>{milestoneEyebrow(milestone.name)}</Text>
      <Text style={styles.milestoneName}>{milestone.name}</Text>
      <Text style={styles.milestoneStage}>Current stage · {currentStage}</Text>
      <View
        style={styles.progressTrack}
        accessibilityLabel={`${milestone.name}: stage ${cleared} of ${total}`}
      >
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.milestoneCaption}>
        {nextStage ? `Next · ${nextStage}` : 'Final stage reached.'} · {cleared} of {total}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    ...typography.eyebrow,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMuted,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emptyWrap: {
    marginTop: spacing.xxl,
  },
  trendCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 96,
    gap: spacing.xs,
  },
  barSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    maxWidth: 30,
    alignSelf: 'center',
    backgroundColor: colors.accentBorder,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  barCurrent: {
    backgroundColor: colors.accent,
  },
  trendFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  trendLabels: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  trendName: {
    ...typography.body,
    fontWeight: '700',
  },
  trendCaption: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  trendDelta: {
    ...typography.caption,
    fontFamily: fontFamily.monoBold,
    color: colors.textSecondary,
  },
  trendDeltaPositive: {
    color: colors.success,
  },
  milestoneCard: {
    marginBottom: spacing.sm,
  },
  milestoneEyebrow: {
    ...typography.microLabel,
    color: colors.accentSoft,
    marginBottom: spacing.sm,
  },
  milestoneName: {
    ...typography.h2,
  },
  milestoneStage: {
    ...typography.bodyMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.panel2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  milestoneCaption: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  sessionRowDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  sessionMeta: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  sessionTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  sessionCaption: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  sessionRpe: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
