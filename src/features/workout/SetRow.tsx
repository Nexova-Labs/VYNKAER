import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../../components/Text';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import type { SetLog } from '../../types';
import { StatusTag } from '../../components';
import { colors, fontFamily, radius, spacing, typography } from '../../theme';

interface SetRowProps {
  set: SetLog;
  onChange: (patch: Partial<SetLog>) => void;
  onToggleComplete: () => void;
  onRemove?: () => void;
  mode?: 'strength' | 'cardio';
  isCurrent?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SetRow({ set, onChange, onToggleComplete, onRemove, mode = 'strength', isCurrent = false }: SetRowProps) {
  const [weightText, setWeightText] = useState(String(set.weight));
  const [repsText, setRepsText] = useState(String(set.reps));
  const isCardio = mode === 'cardio';
  const rowState = set.completed ? 'done' : isCurrent ? 'current' : 'queued';

  const scale = useSharedValue(1);
  useEffect(() => {
    if (set.completed) {
      scale.value = withSequence(withSpring(1.18, { damping: 9, stiffness: 420 }), withSpring(1, { damping: 10, stiffness: 260 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `scale` is a stable Reanimated shared-value ref.
  }, [set.completed]);
  const checkAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={[styles.row, rowState === 'current' && styles.rowCurrent, rowState === 'done' && styles.rowDone]}>
      {rowState === 'current' ? <View style={styles.currentBar} /> : null}

      <View style={styles.labelStack}>
        <Text style={styles.setLabel}>{isCardio ? 'SESSION' : `SET ${set.setNumber}`}</Text>
        <StatusTag
          label={rowState === 'done' ? 'DONE' : rowState === 'current' ? 'NOW' : 'QUEUE'}
          tone={rowState}
        />
      </View>

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

      <AnimatedPressable
        onPress={onToggleComplete}
        style={[styles.check, set.completed && styles.checkDone, checkAnimatedStyle]}
        accessibilityRole="button"
        accessibilityLabel={set.completed ? `Set ${set.setNumber} completed, tap to undo` : `Mark set ${set.setNumber} complete`}
        accessibilityState={{ selected: set.completed }}
      >
        <Ionicons name="checkmark" size={18} color={set.completed ? colors.success : colors.textTertiary} />
      </AnimatedPressable>

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
  rowCurrent: {
    position: 'relative',
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.controlBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingLeft: spacing.md,
    marginVertical: 2,
  },
  rowDone: {
    opacity: 0.55,
  },
  currentBar: {
    position: 'absolute',
    left: 0,
    top: spacing.xs,
    bottom: spacing.xs,
    width: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  labelStack: {
    width: 52,
    alignItems: 'flex-start',
    gap: 3,
  },
  setLabel: {
    ...typography.caption,
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
    fontSize: 11,
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
