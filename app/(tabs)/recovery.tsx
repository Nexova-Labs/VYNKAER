import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, CardHeader, EmptyState, Pill, ScreenContainer, SectionHeader } from '../../src/components';
import { Text } from '../../src/components/Text';
import { useAppState } from '../../src/state';
import { colors, spacing, typography } from '../../src/theme';
import { formatDate } from '../../src/utils/format';

function humanize(value: string): string {
  const lower = value.replace(/_/g, ' ').toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Recovery destination (shell). Deliberately shows only what the athlete has actually logged:
// limitations they set and the self-reported values from their last session. There is no
// readiness score and no estimate of anything; daily check-ins arrive in a later build
// (docs/osmium/DATA_AND_AI_STRATEGY.md §5). Not medical advice.
export default function RecoveryScreen() {
  const router = useRouter();
  const { profile, history } = useAppState();

  const last = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const feedback = last?.feedback;
  const isDemo = profile.id === 'athlete-001';

  return (
    <ScreenContainer tabTitle="Recovery">
      <View style={styles.header}>
        <Text style={styles.title}>What you have told us.</Text>
        <Text style={styles.subtitle}>Only logged values appear here. Nothing is estimated or scored.</Text>
      </View>

      <SectionHeader title="Daily check-in" caption="Not available yet" />
      <EmptyState
        title="Check-ins arrive in a later build"
        body="Sleep, energy, fatigue and soreness check-ins are planned. Until then, no recovery figures are shown."
      />

      <SectionHeader
        title="Limitations"
        caption={`${profile.limitations.filter((l) => l.active).length} active`}
      />
      {profile.limitations.length === 0 ? (
        <EmptyState title="No limitations set" body="Add one in Settings and workouts will select around it." />
      ) : (
        <Card>
          {profile.limitations.map((l, i) => (
            <View key={l.area} style={[styles.row, i > 0 && styles.rowDivider]}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowValue}>{humanize(l.area)}</Text>
                {l.note ? <Text style={styles.rowCaption}>{l.note}</Text> : null}
              </View>
              <Pill
                label={l.active ? (l.conservativeMode ? 'Active · conservative' : 'Active') : 'Inactive'}
                tone={l.active ? 'warning' : 'neutral'}
              />
            </View>
          ))}
          <Button
            label="Manage in Settings"
            variant="secondary"
            onPress={() => router.push('/settings')}
            style={{ marginTop: spacing.lg }}
          />
        </Card>
      )}

      <SectionHeader title="From your last session" caption={last ? `Reported by you · ${formatDate(last.date)}` : undefined} />
      {feedback ? (
        <Card>
          <CardHeader label="Self-reported" meta={isDemo ? 'DEMO DATA' : undefined} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Session effort</Text>
            <Text style={styles.rowNumber}>{feedback.sessionRPE} / 10</Text>
          </View>
          <View style={[styles.row, styles.rowDivider]}>
            <Text style={styles.rowLabel}>Limitation, before → after</Text>
            <Text style={styles.rowNumber}>
              {feedback.limitationBefore} → {feedback.limitationAfter} / 10
            </Text>
          </View>
        </Card>
      ) : (
        <EmptyState title="No session logged yet" body="Finish a session and your own effort and limitation ratings appear here." />
      )}

      <Text style={styles.disclaimer}>
        Not medical advice. Persistent or worsening pain should be assessed by a qualified professional.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    ...typography.bodyMuted,
    flex: 1,
  },
  rowValue: {
    ...typography.body,
    fontWeight: '600',
  },
  rowCaption: {
    ...typography.caption,
    marginTop: 2,
  },
  rowNumber: {
    ...typography.body,
    fontWeight: '700',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
});
