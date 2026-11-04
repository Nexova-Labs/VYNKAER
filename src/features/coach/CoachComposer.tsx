import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '../../components';
import { Text, TextInput } from '../../components/Text';
import { colors, radius, spacing, typography } from '../../theme';
import { useCoachConversation } from './CoachConversation';
import { QUICK_ACTIONS } from './conversation';

interface CoachComposerProps {
  /** Rendered on a Card: input recessed, chips raised (DESIGN.md Recessed/Raised Rule). */
  onCard?: boolean;
  placeholder?: string;
}

// Free-text entry plus up to four quick phrases. Sending only ever asks the Coach for a proposal.
export function CoachComposer({ onCard = false, placeholder = 'Tell the Coach what needs changing' }: CoachComposerProps) {
  const { pending, send } = useCoachConversation();
  const [draft, setDraft] = useState('');

  const submit = (text: string) => {
    if (!text.trim() || pending) return;
    setDraft('');
    void send(text);
  };

  return (
    <View style={styles.root}>
      <View style={styles.chipRow}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action}
            onPress={() => submit(action)}
            disabled={pending}
            accessibilityRole="button"
            accessibilityLabel={action}
            style={({ pressed }) => [
              styles.chip,
              onCard ? styles.chipOnCard : styles.chipOnPage,
              pressed && styles.chipPressed,
              pending && styles.chipDisabled,
            ]}
          >
            <Text style={styles.chipLabel}>{action}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, onCard ? styles.inputOnCard : styles.inputOnPage]}
          multiline
          accessibilityLabel="Message the Coach"
          onSubmitEditing={() => submit(draft)}
          returnKeyType="send"
        />
        <Button
          label="Send"
          onPress={() => submit(draft)}
          disabled={pending || draft.trim().length === 0}
          accessibilityLabel="Send message to Coach"
          style={styles.sendButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
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
  },
  chipOnCard: {
    backgroundColor: colors.controlBg,
  },
  chipOnPage: {
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
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputOnCard: {
    backgroundColor: colors.backgroundElevated,
  },
  inputOnPage: {
    backgroundColor: colors.panel,
  },
  sendButton: {
    paddingHorizontal: spacing.xl,
  },
});
