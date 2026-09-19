import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { SetLog } from '../../types';
import { colors, fontFamily, radius, spacing, typography } from '../../theme';

interface SetRowProps {
  set: SetLog;
  onChange: (patch: Partial<SetLog>) => void;
  onToggleComplete: () => void;
  onRemove?: () => void;
  mode?: 'strength' | 'cardio';
}

export function SetRow({ set, onChange, onToggleComplete, onRemove, mode = 'strength' }: SetRowProps) {
  const [weightText, setWeightText] = useState(String(set.weight));
  const [repsText, setRepsText] = useState(String(set.reps));
  const isCardio = mode === 'cardio';

  return (
    <View style={styles.row}>
      <Text style={styles.setLabel}>{isCardio ? 'SESSION' : `SET ${set.setNumber}`}</Text>

      {isCardio ? null : (
        <View style={styles.field}>
          <TextInput
            value={weightText}
            onChangeText={(t) => {
              setWeightText(t);
              const num = parseFloat(t);
              if (!Number.isNaN(num)) onChange({ weight: num });
            }}
            keyboardType="decimal-pad"
            style={styles.input}
            accessibilityLabel={`Set ${set.setNumber} weight in kilograms`}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
      )}

      <View style={styles.field}>
        <TextInput
          value={repsText}
          onChangeText={(t) => {
            setRepsText(t);
            const num = parseInt(t, 10);
            if (!Number.isNaN(num)) onChange({ reps: num });
          }}
          keyboardType="number-pad"
          style={styles.input}
          accessibilityLabel={isCardio ? 'Minutes completed' : `Set ${set.setNumber} reps`}
        />
        <Text style={styles.unit}>{isCardio ? 'min' : 'reps'}</Text>
      </View>

      <Pressable
        onPress={onToggleComplete}
        style={[styles.check, set.completed && styles.checkDone]}
        accessibilityRole="button"
        accessibilityLabel={set.completed ? `Set ${set.setNumber} completed, tap to undo` : `Mark set ${set.setNumber} complete`}
        accessibilityState={{ selected: set.completed }}
      >
        <Ionicons name="checkmark" size={18} color={set.completed ? colors.success : colors.textTertiary} />
      </Pressable>

      {onRemove ? (
        <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove set ${set.setNumber}`} style={styles.remove}>
          <Ionicons name="close" size={16} color={colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  setLabel: {
    ...typography.caption,
    width: 52,
    fontWeight: '800',
  },
  field: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamily.monoBold,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: 10,
    minHeight: 44,
  },
  unit: {
    ...typography.caption,
    fontSize: 10,
    flexShrink: 0,
  },
  check: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.successSurface,
    borderColor: colors.success,
  },
  remove: {
    width: 44,
    height: 44,
    marginLeft: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
