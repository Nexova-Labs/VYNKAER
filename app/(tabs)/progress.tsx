import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Card, CardHeader, EmptyState, ScreenContainer, SectionHeader, StatTile, StatusTag } from '../../src/components';
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

// A session "PRs" if any exercise in it beat every completed top set logged
// for that same exercise in every prior session — no fabricated categories,
// just what the log actually shows.
function sessionHasPR(session: WorkoutSession, priorSessions: WorkoutSession[]): boolean {
  return session.exercises.some((ex) => {
    const top = Math.max(0, ...ex.sets.filter((s) => s.completed).map((s) => s.weight));
    if (top <= 0) return false;
    const priorTop = Math.max(
      0,
      ...priorSessions.flatMap((s) =>
        s.exercises
          .filter((e) => e.exerciseId === ex.exerciseId)
          .flatMap((e) => e.sets.filter((set) => set.completed).map((set) => set.weight))
      )
    );
    return top > priorTop;
  });
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
            <CardHeader label="Session Log" meta={`${recent.length} SESSIONS`} />
            {recent.map((session, index) => {
              const orderedIndex = ordered.findIndex((s) => s.id === session.id);
              const isPR = orderedIndex >= 0 && sessionHasPR(session, ordered.slice(0, orderedIndex));
              return (
                <View
                  key={session.id}
                  style={[styles.sessionRow, index > 0 && styles.sessionRowDivided]}
                  accessibilityLabel={`Workout ${session.workoutNumber}, ${modalityLabel(session.modality)}, ${formatDate(
                    session.date
                  )}${isPR ? ', new personal record' : ''}`}
                >
                  <View style={styles.sessionMeta}>
                    <View style={styles.sessionTitleRow}>
                      <Text style={styles.sessionTitle}>
                        Workout {session.workoutNumber} · {modalityLabel(session.modality)}
                      </Text>
                      {isPR ? <StatusTag label="PR" tone="current" /> : null}
                    </View>
                    <Text style={styles.sessionCaption}>
                      {formatDate(session.date)} · {session.focus}
                    </Text>
                  </View>
                  {session.feedback ? (
                    <Text style={styles.sessionRpe}>RPE {session.feedback.sessionRPE.toFixed(1)}</Text>
                  ) : null}
                </View>
              );
            })}
          </Card>
        </>
      )}
    </ScreenContainer>
  );
}

const CHART_W = 300;
const CHART_H = 96;
const CHART_PAD = 10;

function TrendCard({ trend, onPress }: { trend: TrendSeries; onPress: () => void }) {
  const [selected, setSelected] = useState(trend.points.length - 1);
  const latest = trend.points[trend.points.length - 1].topWeight;
  const values = trend.points.map((p) => p.topWeight);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const stepX = trend.points.length > 1 ? CHART_W / (trend.points.length - 1) : 0;

  const coords = trend.points.map((point, index) => ({
    x: trend.points.length > 1 ? index * stepX : CHART_W / 2,
    y: CHART_H - CHART_PAD - ((point.topWeight - min) / span) * (CHART_H - CHART_PAD * 2),
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${CHART_H} L ${coords[0].x.toFixed(1)} ${CHART_H} Z`;
  const activePoint = trend.points[selected] ?? trend.points[trend.points.length - 1];
  const gradientId = `trend-gradient-${trend.exerciseId}`;

  return (
    <View style={styles.trendCard}>
      <View style={styles.trendCallout}>
        <Text style={styles.trendCalloutLabel}>{formatDate(activePoint.date)}</Text>
        <Text style={styles.trendCalloutValue}>{activePoint.topWeight} kg</Text>
      </View>

      <View style={styles.chartWrap}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.35} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill={`url(#${gradientId})`} />
          <Path d={linePath} stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
        {coords.map((c, index) => (
          <Pressable
            key={`${trend.points[index].sessionId}-${index}`}
            onPress={(e) => {
              e.stopPropagation();
              setSelected(index);
            }}
            hitSlop={10}
            style={[
              styles.point,
              { left: `${(c.x / CHART_W) * 100}%`, top: `${(c.y / CHART_H) * 100}%` },
              index === selected && styles.pointActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${formatDate(trend.points[index].date)}: ${trend.points[index].topWeight} kilograms`}
          />
        ))}
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${trend.name} exercise detail`}
        style={({ pressed }) => [styles.trendFooter, pressed && styles.pressed]}
      >
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
      </Pressable>
    </View>
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
    backgroundColor: colors.panel2,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  trendCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  trendCalloutLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  trendCalloutValue: {
    fontFamily: fontFamily.monoBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  chartWrap: {
    height: 96,
    position: 'relative',
  },
  point: {
    position: 'absolute',
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.backgroundElevated,
  },
  pointActive: {
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
    backgroundColor: colors.backgroundElevated,
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
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    fontFamily: fontFamily.monoBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
