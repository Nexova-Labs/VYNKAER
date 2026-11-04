import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Card, EmptyState, ScreenContainer } from '../../src/components';
import { useAppState } from '../../src/state';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function WorkoutCompleteScreen() {
  const { activeWorkout, finishWorkout, trainingState } = useAppState();
  const [sessionRPE, setSessionRPE] = useState(7);
  const [limitationBefore, setLimitationBefore] = useState('0');
  const [limitationAfter, setLimitationAfter] = useState('1');
  const [cardioMinutes, setCardioMinutes] = useState(String(trainingState.lastCardioMinutes));
  const [strongest, setStrongest] = useState('');
  const [weakest, setWeakest] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (saved != null) {
    return (
      <ScreenContainer scroll={false} contentStyle={styles.centerFill}>
        <Text style={styles.savedEyebrow}>SESSION LOGGED</Text>
        <Text style={styles.savedTitle}>The next session starts here.</Text>
        <Text style={styles.savedBody}>
          {saved} sets recorded. Progression and modality have been recalculated for your next workout.
        </Text>
        <Button label="Return Home" onPress={() => router.replace('/(tabs)/home')} fullWidth style={{ marginTop: spacing.xxl }} />
      </ScreenContainer>
    );
  }

  if (!activeWorkout) {
    return (
      <ScreenContainer scroll={false} contentStyle={styles.centerFill}>
        <EmptyState title="No session to finish" body="There is no active workout right now." />
        <Button label="Back to Home" onPress={() => router.replace('/(tabs)/home')} style={{ marginTop: spacing.lg }} />
      </ScreenContainer>
    );
  }

  const setsLogged = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0);

  const handleSave = async () => {
    setSaving(true);
    await finishWorkout({
      sessionRPE,
      limitationBefore: clampInt(limitationBefore),
      limitationAfter: clampInt(limitationAfter),
      cardioMinutes: clampInt(cardioMinutes, 0, 120),
      strongestMovement: strongest.trim() || undefined,
      weakestMovement: weakest.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSaving(false);
    setSaved(setsLogged);
  };

  return (
    <ScreenContainer contentStyle={{ paddingTop: spacing.lg }}>
      <Text style={styles.eyebrow}>Session Feedback</Text>
      <Text style={styles.title}>How did that go?</Text>
      <Text style={styles.subtitle}>This informs what comes next — there is no wrong answer.</Text>

      <Card style={styles.card}>
        <Text style={styles.label}>Session effort · {sessionRPE}/10</Text>
        <View style={styles.rpeRow}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <Pressable
              key={n}
              onPress={() => setSessionRPE(n)}
              accessibilityRole="button"
              accessibilityLabel={`Session effort ${n} of 10`}
              accessibilityState={{ selected: sessionRPE === n }}
              style={[styles.rpeDot, sessionRPE === n && styles.rpeDotActive]}
            >
              <Text style={[styles.rpeDotLabel, sessionRPE === n && styles.rpeDotLabelActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Limitation before</Text>
            <TextInput
              value={limitationBefore}
              onChangeText={setLimitationBefore}
              keyboardType="number-pad"
              style={styles.numberInput}
              accessibilityLabel="Limitation level before session, 0 to 10"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Limitation after</Text>
            <TextInput
              value={limitationAfter}
              onChangeText={setLimitationAfter}
              keyboardType="number-pad"
              style={styles.numberInput}
              accessibilityLabel="Limitation level after session, 0 to 10"
            />
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Cardio minutes</Text>
        <TextInput
          value={cardioMinutes}
          onChangeText={setCardioMinutes}
          keyboardType="number-pad"
          style={styles.numberInput}
          accessibilityLabel="Cardio minutes completed"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>What felt strongest? (optional)</Text>
        <TextInput
          value={strongest}
          onChangeText={setStrongest}
          style={styles.textInput}
          placeholder="e.g. Pulldown"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="What felt strongest, optional"
        />
        <Text style={[styles.label, { marginTop: spacing.md }]}>What felt weakest? (optional)</Text>
        <TextInput
          value={weakest}
          onChangeText={setWeakest}
          style={styles.textInput}
          placeholder="e.g. Shoulder press"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="What felt weakest, optional"
        />
        <Text style={[styles.label, { marginTop: spacing.md }]}>Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={[styles.textInput, { height: 80 }]}
          multiline
          placeholder="Anything worth remembering next time"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Session notes, optional"
        />
      </Card>

      <Button label="FINISH & SAVE" onPress={handleSave} loading={saving} fullWidth style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

function clampInt(text: string, min = 0, max = 10): number {
  const n = parseInt(text, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

const styles = StyleSheet.create({
  centerFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    ...typography.eyebrow,
    marginBottom: 4,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodyMuted,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  numberInput: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.textPrimary,
    padding: spacing.sm,
    fontSize: 16,
    fontWeight: '700',
    minHeight: 44,
  },
  textInput: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.textPrimary,
    padding: spacing.sm,
    fontSize: 14,
    minHeight: 44,
  },
  rpeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  rpeDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeDotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accentStrong,
  },
  rpeDotLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  rpeDotLabelActive: {
    color: colors.onAccent,
  },
  savedEyebrow: {
    ...typography.eyebrow,
    marginBottom: spacing.sm,
  },
  savedTitle: {
    ...typography.title,
    textAlign: 'center',
  },
  savedBody: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
