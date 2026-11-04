import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, touchTarget } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface IconButtonProps {
  name: IconName;
  /** Spoken label. Icon-only controls must always carry one. */
  label: string;
  onPress: () => void;
  size?: number;
}

// Icon-only control with a 48pt hit area (touchTarget) and a visible pressed state.
export function IconButton({ name, label, onPress, size = 22 }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <Ionicons name={name} size={size} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: touchTarget.minHeight,
    height: touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: touchTarget.minHeight / 2,
  },
  pressed: {
    backgroundColor: colors.controlBg,
  },
});
