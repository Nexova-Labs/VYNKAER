import React, { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Text } from '../../src/components/Text';

import { Button, Card, Pill, ScreenContainer, SectionHeader } from '../../src/components';
import { useAppState } from '../../src/state';
import { colors, radius, spacing, typography } from '../../src/theme';
import { formatRepRange, modalityLabel } from '../../src/utils/format';
import type { AthleteLimitation, PreferenceTag, TrainingGoal } from '../../src/types';

const DURATION_OPTIONS = [30, 40, 45, 60, 75, 90];

const ALL_PREFERENCES: PreferenceTag[] = [
  'FARMER_CARRIES',
  'CABLE_PULL_THROUGHS',
  'ROWS',
  'PRESSES',
  'FUNCTIONAL_PATTERNS',
  'VARIETY',
];

const ALL_GOALS: TrainingGoal[] = [
  'STRENGTH',
  'MUSCLE',
  'CONDITIONING',
  'MOVEMENT_QUALITY',
  'PUSH_UP_MILESTONE',
];

function humanize(value: string): string {
  const lower = value.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function Chip({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.chipPressed]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { profile, trainingState, updateProfile, resetDemoData } = useAppState();

  const setSessionsPerWeek = useCallback(
    (delta: number) => {
      const next = Math.min(7, Math.max(1, profile.sessionsPerWeek + delta));
      if (next === profile.sessionsPerWeek) return;
      void updateProfile({ sessionsPerWeek: next });
    },
    [profile.sessionsPerWeek, updateProfile]
  );

  const togglePreference = useCallback(
    (tag: PreferenceTag) => {
      const next = profile.preferences.includes(tag)
        ? profile.preferences.filter((p) => p !== tag)
        : [...profile.preferences, tag];
      void updateProfile({ preferences: next });
    },
    [profile.preferences, updateProfile]
  );

  const toggleLimitation = useCallback(
    (limitation: AthleteLimitation, active: boolean) => {
      const next = profile.limitations.map((l) => (l.area === limitation.area ? { ...l, active } : l));
      void updateProfile({ limitations: next });
    },
    [profile.limitations, updateProfile]
  );

  const confirmReset = useCallback(() => {
    Alert.alert(
      'Reset demo data',
      'This clears your on-device history, progression state and profile, and restores the seeded demo athlete. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => void resetDemoData() },
      ]
    );
  }, [resetDemoData]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Athlete profile</Text>
        <Text style={styles.title}>The rules behind the workouts.</Text>
        <Text style={styles.subtitle}>These preferences shape generation and progression.</Text>
      </View>

      <SectionHeader title="Training identity" caption={`${profile.sessionsPerWeek}x / week`} />
      <Card>
        <View style={styles.readRow}>
          <Text style={styles.readLabel}>Primary goal</Text>
          <Text style={styles.readValue}>{humanize(profile.trainingGoal)}</Text>
        </View>
        <View style={styles.readRow}>
          <Text style={styles.readLabel}>Styles</Text>
          <Text style={styles.readValue}>{profile.trainingStyles.map(humanize).join(' · ')}</Text>
        </View>
        <View style={styles.readRow}>
          <Text style={styles.readLabel}>Rep range</Text>
          <Text style={styles.readValue}>
            {formatRepRange(profile.primaryRepRange[0], profile.primaryRepRange[1])}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.fieldLabel}>Sessions per week</Text>
        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => setSessionsPerWeek(-1)}
            accessibilityRole="button"
            accessibilityLabel="Decrease sessions per week"
            disabled={profile.sessionsPerWeek <= 1}
            style={({ pressed }) => [
              styles.stepperButton,
              pressed && styles.chipPressed,
              profile.sessionsPerWeek <= 1 && styles.stepperDisabled,
            ]}
          >
            <Text style={styles.stepperGlyph}>−</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{profile.sessionsPerWeek}</Text>
          <Pressable
            onPress={() => setSessionsPerWeek(1)}
            accessibilityRole="button"
            accessibilityLabel="Increase sessions per week"
            disabled={profile.sessionsPerWeek >= 7}
            style={({ pressed }) => [
              styles.stepperButton,
              pressed && styles.chipPressed,
              profile.sessionsPerWeek >= 7 && styles.stepperDisabled,
            ]}
          >
            <Text style={styles.stepperGlyph}>+</Text>
          </Pressable>
        </View>

        <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>Preferred session length</Text>
        <View style={styles.chipRow}>
          {DURATION_OPTIONS.map((minutes) => (
            <Chip
              key={minutes}
              label={`${minutes} min`}
              selected={profile.preferredDurationMinutes === minutes}
              onPress={() => void updateProfile({ preferredDurationMinutes: minutes })}
              accessibilityLabel={`Set preferred session length to ${minutes} minutes`}
            />
          ))}
        </View>
      </Card>

      <SectionHeader title="Rotation" caption="Display only" />
      <Card>
        <Text style={styles.rotationChain}>
          {profile.rotationSequence.map(modalityLabel).join('  →  ')}  →  repeat
        </Text>
        <View style={styles.rotationPill}>
          <Pill label={`Next · ${modalityLabel(trainingState.nextModality)}`} />
        </View>
      </Card>

      <SectionHeader title="Preferences" caption="Shapes exercise selection" />
      <Card>
        <View style={styles.chipRow}>
          {ALL_PREFERENCES.map((tag) => {
            const selected = profile.preferences.includes(tag);
            return (
              <Chip
                key={tag}
                label={humanize(tag)}
                selected={selected}
                onPress={() => togglePreference(tag)}
                accessibilityLabel={`${selected ? 'Remove' : 'Add'} preference ${humanize(tag)}`}
              />
            );
          })}
        </View>
      </Card>

      <SectionHeader title="Conditioning" caption={profile.conditioningEnabled ? 'Enabled' : 'Disabled'} />
      <Card>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.readValue}>Conditioning finisher</Text>
            <Text style={styles.readCaption}>Adds a short cardio block to generated sessions.</Text>
          </View>
          <Switch
            value={profile.conditioningEnabled}
            onValueChange={(value) => void updateProfile({ conditioningEnabled: value })}
            accessibilityLabel="Toggle conditioning finisher"
            trackColor={{ false: colors.controlBg, true: colors.accent }}
            thumbColor={colors.textPrimary}
            ios_backgroundColor={colors.controlBg}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.readRow}>
          <Text style={styles.readLabel}>Preferred modality</Text>
          <Text style={styles.readValue}>{profile.preferredCardio}</Text>
        </View>
      </Card>

      <SectionHeader
        title="Limitations"
        caption={`Safety constraints · ${profile.limitations.filter((l) => l.active).length} active`}
      />
      <Card>
        {profile.limitations.length === 0 ? (
          <Text style={styles.readCaption}>No limitations recorded.</Text>
        ) : (
          profile.limitations.map((limitation, index) => (
            <View key={limitation.area} style={[styles.switchRow, index > 0 && styles.switchRowDivided]}>
              <View style={styles.switchCopy}>
                <Text style={styles.readValue}>{humanize(limitation.area)}</Text>
                <Text style={styles.readCaption}>
                  {limitation.note ??
                    (limitation.conservativeMode
                      ? 'Conservative selection while active.'
                      : 'Standard selection.')}
                </Text>
              </View>
              <Switch
                value={limitation.active}
                onValueChange={(value) => toggleLimitation(limitation, value)}
                accessibilityLabel={`Toggle active limitation ${humanize(limitation.area)}`}
                trackColor={{ false: colors.controlBg, true: colors.accent }}
                thumbColor={colors.textPrimary}
                ios_backgroundColor={colors.controlBg}
              />
            </View>
          ))
        )}
      </Card>
      <Card style={styles.disclaimerCard}>
        <Text style={styles.disclaimer}>
          Training suggestions are not medical advice. If pain persists or worsens, have it assessed by a
          qualified professional.
        </Text>
      </Card>

      <SectionHeader title="Goals" />
      <Card>
        <View style={styles.chipRow}>
          {ALL_GOALS.map((goal) => (
            <Chip
              key={goal}
              label={humanize(goal)}
              selected={profile.trainingGoal === goal}
              onPress={() => void updateProfile({ trainingGoal: goal })}
              accessibilityLabel={`Set primary goal to ${humanize(goal)}`}
            />
          ))}
        </View>
      </Card>

      <SectionHeader title="Data" />
      <Card>
        <Text style={styles.readCaption}>
          This is a local-first prototype. Your profile, history and progression state live on this device
          only — nothing is uploaded.
        </Text>
        <Button
          label="Reset demo data"
          variant="danger"
          onPress={confirmReset}
          accessibilityLabel="Reset demo data"
          style={styles.resetButton}
          fullWidth
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.sm,
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
  readRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  readLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  readValue: {
    ...typography.body,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  readCaption: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
    textAlign: 'left',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.lg,
  },
  fieldLabel: {
    ...typography.microLabel,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  fieldLabelSpaced: {
    marginTop: spacing.xl,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.controlBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisabled: {
    opacity: 0.4,
  },
  stepperGlyph: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepperValue: {
    ...typography.numeral,
    minWidth: 32,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.controlBg,
  },
  chipSelected: {
    backgroundColor: colors.accentSurface,
    borderColor: colors.accentStrong,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.accentSoft,
  },
  rotationChain: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  rotationPill: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switchRowDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
  },
  switchCopy: {
    flex: 1,
  },
  disclaimerCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundElevated,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  resetButton: {
    marginTop: spacing.lg,
  },
});
