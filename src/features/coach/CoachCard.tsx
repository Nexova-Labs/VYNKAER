import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '../../components';
import { Text } from '../../components/Text';
import { spacing, typography } from '../../theme';
import { CoachComposer } from './CoachComposer';
import { useCoachConversation } from './CoachConversation';
import { CoachThread } from './CoachThread';

// The Coach, embedded in Today: "How are you feeling today?" is the prompt, and the thread (with
// reviewable proposals) appears below it once the athlete has said something.
export function CoachCard() {
  const { transcript, pending } = useCoachConversation();
  const hasThread = transcript.length > 1 || pending;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <Text style={styles.subtitle}>Tell the Coach. Nothing changes until you approve it.</Text>
      <CoachComposer onCard />
      {hasThread ? (
        <View style={styles.thread}>
          <CoachThread onCard hideOpening />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.caption,
    marginTop: -spacing.sm,
  },
  thread: {
    marginTop: spacing.xs,
  },
});
