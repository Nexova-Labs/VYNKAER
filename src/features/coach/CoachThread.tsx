import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Pill } from '../../components';
import { Text } from '../../components/Text';
import { useAppState } from '../../state';
import { colors, fontFamily, radius, spacing, typography } from '../../theme';
import { useCoachConversation } from './CoachConversation';
import { buildAdaptationDiff, type TranscriptMessage } from './conversation';

interface CoachThreadProps {
  /** Rendered on a Card: nested surfaces step lighter so they do not vanish into it (DESIGN.md Recessed/Raised Rule). */
  onCard?: boolean;
  /** Skip the standing opening line (used where the surrounding UI already asks the question). */
  hideOpening?: boolean;
}

export function CoachThread({ onCard = false, hideOpening = false }: CoachThreadProps) {
  const { profile, currentPlan } = useAppState();
  const { transcript, pending, apply, dismiss } = useCoachConversation();
  const messages = hideOpening ? transcript.filter((m) => m.id !== 'coach-opening') : transcript;

  return (
    <View style={styles.list}>
      {messages.map((message: TranscriptMessage) => {
        const isUser = message.role === 'user';
        const diff = message.adaptation ? buildAdaptationDiff(message.adaptation, currentPlan, profile) : null;
        return (
          <View key={message.id} style={isUser ? styles.userAlign : styles.coachAlign}>
            <View
              style={[
                styles.bubble,
                isUser ? styles.userBubble : onCard ? styles.coachBubbleOnCard : styles.coachBubble,
              ]}
            >
              <Text style={styles.bubbleText}>{message.text}</Text>
            </View>

            {message.adaptation ? (
              <View style={styles.adaptationCard}>
                <Text style={styles.adaptationEyebrow}>Proposed change</Text>
                <Text style={styles.adaptationLabel}>{message.adaptation.label}</Text>
                {diff ? (
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
                ) : null}
                {message.status === 'applied' ? (
                  <View style={styles.statusRow}>
                    <Pill label="Applied" tone="success" />
                  </View>
                ) : message.status === 'dismissed' ? (
                  <View style={styles.statusRow}>
                    <Pill label="Dismissed" tone="neutral" />
                  </View>
                ) : (
                  <View style={styles.actions}>
                    <Button
                      label="APPLY CHANGE"
                      onPress={() => apply(message.id)}
                      accessibilityLabel={`Apply change: ${message.adaptation.label}`}
                      style={styles.applyButton}
                      fullWidth
                    />
                    <Button
                      label="Dismiss"
                      variant="secondary"
                      onPress={() => dismiss(message.id)}
                      accessibilityLabel={`Dismiss proposal: ${message.adaptation.label}`}
                      style={styles.applyButton}
                      fullWidth
                    />
                  </View>
                )}
              </View>
            ) : null}
          </View>
        );
      })}

      {pending ? (
        <View style={styles.coachAlign}>
          <View style={[styles.bubble, onCard ? styles.coachBubbleOnCard : styles.coachBubble, styles.typingBubble]}>
            <ActivityIndicator color={colors.textTertiary} size="small" />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  coachAlign: {
    alignItems: 'flex-start',
    maxWidth: '92%',
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
  coachBubbleOnCard: {
    backgroundColor: colors.controlBg,
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
    color: colors.textSecondary,
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
    color: colors.accent,
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
  actions: {
    gap: spacing.sm,
  },
  applyButton: {
    minHeight: 44,
  },
  statusRow: {
    flexDirection: 'row',
  },
});
