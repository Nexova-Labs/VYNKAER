import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, fontFamily, radius, spacing, typography } from '../../theme';

const DEFAULT_SECONDS = 90;

export function RestTimer({ onDismiss }: { onDismiss: () => void }) {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.label}>Rest</Text>
        <Text style={styles.time}>
          {minutes}:{secs.toString().padStart(2, '0')}
        </Text>
      </View>
      <Pressable onPress={onDismiss} style={styles.skip} accessibilityRole="button" accessibilityLabel="Skip rest">
        <Text style={styles.skipLabel}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accentSurface,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.accentSoft,
    textTransform: 'uppercase',
  },
  time: {
    fontFamily: fontFamily.monoBold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  skip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  skipLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accentSoft,
  },
});
