import React, { useCallback, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '../../src/components';
import { Text } from '../../src/components/Text';
import { CoachComposer, CoachThread, useCoachConversation } from '../../src/features/coach';
import { useAppState } from '../../src/state';
import { colors, spacing, typography } from '../../src/theme';
import { modalityLabel } from '../../src/utils/format';

// Full-screen Coach, reachable from every tab header. It shows the same conversation as the card
// embedded in Today (shared in CoachConversationProvider), so nothing is lost moving between them.
export default function CoachScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/today');
  }, [router]);
  const { profile, activeWorkout, currentPlan } = useAppState();
  const { transcript, pending } = useCoachConversation();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [transcript.length, pending]);

  const contextLine = activeWorkout
    ? `Session in progress · ${modalityLabel(activeWorkout.modality)} · ${activeWorkout.focus}`
    : currentPlan
      ? `Next session · ${modalityLabel(currentPlan.modality)} · ${currentPlan.focus}`
      : 'No session planned.';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
          <CoachThread />
        </ScrollView>

        <View style={styles.composerWrap}>
          <CoachComposer />
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
  },
  composerWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.lg,
  },
});
