import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../../src/components/Text';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, IconButton, Pill } from '../../src/components';
import { useAppState } from '../../src/state';
import { colors, fontFamily, radius, spacing, typography } from '../../src/theme';
import { modalityLabel } from '../../src/utils/format';
import type { AthleteProfile, CoachMessage, GeneratedWorkout, WorkoutAdaptation } from '../../src/types';

// Local transcript shape: the Coach conversation is a live layer, not part of
// the persisted domain state, so `applied` lives here rather than in CoachMessage.
interface TranscriptMessage extends CoachMessage {
  applied?: boolean;
}

// Phrases chosen to match DemoCoachProvider's keyword routing, so every chip
// produces a real proposed adaptation rather than the generic fallback.
const QUICK_ACTIONS = [
  'I only have 40 minutes',
  'My shoulders feel tired',
  'I want more cardio',
  'Something hurts',
  'Make today easier',
  'Make today harder',
  'Substitute this exercise',
];

const OPENING_MESSAGE: TranscriptMessage = {
  id: 'coach-opening',
  role: 'coach',
  text: 'I have your training history, progression state, modality rotation and current session context. What needs changing?',
  createdAt: new Date(0).toISOString(),
};

let messageCounter = 0;
function nextId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${Date.now()}-${messageCounter}`;
}

// Only build a before/after diff where the adaptation actually carries a
// clean numeric comparison — everything else (substitution, limitation
// flags, EASIER/HARDER) falls back to just the label, rather than
// fabricating a "current" value that isn't backed by real state.
function buildAdaptationDiff(
  adaptation: WorkoutAdaptation,
  currentPlan: GeneratedWorkout | null,
  profile: AthleteProfile
): { current: string; proposed: string } | null {
  if (adaptation.type === 'SHORTEN_DURATION' && adaptation.targetDurationMinutes != null) {
    const currentMinutes = currentPlan?.estimatedDurationMinutes ?? profile.preferredDurationMinutes;
    return { current: `${currentMinutes} min session`, proposed: `${adaptation.targetDurationMinutes} min session` };
  }
  if (adaptation.type === 'INCREASE_CARDIO' && adaptation.cardioDeltaMinutes != null) {
    return { current: 'No change', proposed: `+${adaptation.cardioDeltaMinutes} min conditioning` };
  }
  return null;
}

export default function CoachScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/today');
  }, [router]);
  const { profile, activeWorkout, currentPlan, sendCoachMessage, applyCoachAdaptation } = useAppState();
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([OPENING_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [transcript.length, pending]);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;

      setDraft('');
      setTranscript((prev) => [
        ...prev,
        { id: nextId('user'), role: 'user', text: trimmed, createdAt: new Date().toISOString() },
      ]);
      setPending(true);

      try {
        const response = await sendCoachMessage(trimmed);
        setTranscript((prev) => [
          ...prev,
          {
            id: nextId('coach'),
            role: 'coach',
            text: response.message,
            adaptation: response.proposedAdaptation,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch {
        setTranscript((prev) => [
          ...prev,
          {
            id: nextId('coach'),
            role: 'coach',
            text: 'That did not go through. Try again.',
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setPending(false);
      }
    },
    [pending, sendCoachMessage]
  );

  const handleApply = useCallback(
    (message: TranscriptMessage) => {
      if (!message.adaptation) return;
      applyCoachAdaptation(message.adaptation);
      setTranscript((prev) => prev.map((m) => (m.id === message.id ? { ...m, applied: true } : m)));
    },
    [applyCoachAdaptation]
  );

  const contextLine = activeWorkout
    ? `Session in progress · ${modalityLabel(activeWorkout.modality)} · ${activeWorkout.focus}`
    : currentPlan
      ? `Next session · ${modalityLabel(currentPlan.modality)} · ${currentPlan.focus}`
      : 'No session planned.';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <View style={styles.closeRow}>
            <IconButton name="close" label="Close Coach" onPress={goBack} />
          </View>
          <Text style={styles.eyebrow}>Coach</Text>
          <Text style={styles.title}>Adapt without losing the plan.</Text>
          <Text style={styles.subtitle}>
            {contextLine} · {profile.preferredDurationMinutes} min target
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.transcript}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {transcript.map((message) => (
            <View key={message.id} style={message.role === 'user' ? styles.userAlign : styles.coachAlign}>
              <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.coachBubble]}>
                <Text style={styles.bubbleText}>{message.text}</Text>
              </View>

              {message.adaptation ? (
                <View style={styles.adaptationCard}>
                  <Text style={styles.adaptationEyebrow}>Proposed change</Text>
                  <Text style={styles.adaptationLabel}>{message.adaptation.label}</Text>
                  {(() => {
                    const diff = buildAdaptationDiff(message.adaptation, currentPlan, profile);
                    if (!diff) return null;
                    return (
                      <View style={styles.diffRow}>
                        <View style={styles.diffCol}>
                          <Text style={styles.diffColLabel}>Current</Text>
                          <Text style={styles.diffCurrent}>{diff.current}</Text>
                        </View>
                        <View style={styles.diffCol}>
                          <Text style={[styles.diffColLabel, styles.diffColLabelProposed]}>Proposed</Text>
                          <Text style={styles.diffProposed}>{diff.proposed}</Text>
                        </View>
                      </View>
                    );
                  })()}
                  {message.applied ? (
                    <View style={styles.appliedRow}>
                      <Pill label="Applied" tone="success" />
                    </View>
                  ) : (
                    <Button
                      label="APPLY CHANGE"
                      onPress={() => handleApply(message)}
                      accessibilityLabel={`Apply change: ${message.adaptation.label}`}
                      style={styles.applyButton}
                      fullWidth
                    />
                  )}
                </View>
              ) : null}
            </View>
          ))}

          {pending ? (
            <View style={styles.coachAlign}>
              <View style={[styles.bubble, styles.coachBubble, styles.typingBubble]}>
                <ActivityIndicator color={colors.textTertiary} size="small" />
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.composerWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            keyboardShouldPersistTaps="handled"
          >
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action}
                onPress={() => void handleSend(action)}
                disabled={pending}
                accessibilityRole="button"
                accessibilityLabel={action}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed, pending && styles.chipDisabled]}
              >
                <Text style={styles.chipLabel}>{action}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Tell the Coach what needs changing"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              multiline
              accessibilityLabel="Message the Coach"
              onSubmitEditing={() => void handleSend(draft)}
              returnKeyType="send"
            />
            <Button
              label="Send"
              onPress={() => void handleSend(draft)}
              disabled={pending || draft.trim().length === 0}
              accessibilityLabel="Send message to Coach"
              style={styles.sendButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  closeRow: {
    alignItems: 'flex-end',
    marginRight: -spacing.sm,
    marginBottom: -spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
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
    ...typography.caption,
    color: colors.textTertiary,
  },
  transcript: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  coachAlign: {
    alignItems: 'flex-start',
    maxWidth: '86%',
  },
  userAlign: {
    alignItems: 'flex-end',
    maxWidth: '86%',
    alignSelf: 'flex-end',
  },
  bubble: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  coachBubble: {
    backgroundColor: colors.panel2,
    borderColor: colors.border,
    borderTopLeftRadius: radius.sm / 2,
  },
  userBubble: {
    backgroundColor: colors.accentSurface,
    borderColor: colors.accentBorder,
    borderTopRightRadius: radius.sm / 2,
  },
  bubbleText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 21,
  },
  typingBubble: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  adaptationCard: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  adaptationEyebrow: {
    ...typography.microLabel,
    color: colors.accentSoft,
    marginBottom: spacing.xs,
  },
  adaptationLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  diffRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  diffCol: {
    flex: 1,
  },
  diffColLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textTertiary,
    marginBottom: 3,
  },
  diffColLabelProposed: {
    color: colors.accentSoft,
  },
  diffCurrent: {
    fontFamily: fontFamily.mono,
    fontSize: 13,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  diffProposed: {
    fontFamily: fontFamily.monoBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  applyButton: {
    minHeight: 44,
  },
  appliedRow: {
    flexDirection: 'row',
  },
  composerWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  chipRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel2,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.panel,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  sendButton: {
    paddingHorizontal: spacing.xl,
  },
});
