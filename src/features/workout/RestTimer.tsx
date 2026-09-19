import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, fontFamily, radius, spacing, typography } from '../../theme';

const DEFAULT_SECONDS = 90;
const RING_SIZE = 56;
const STROKE = 3.5;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RestTimer({ onDismiss }: { onDismiss: () => void }) {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    // Countdown ring sweeps from full to empty in one continuous animation —
    // the numeral ticks in step via the JS interval below, driven off the
    // same DEFAULT_SECONDS duration.
    progress.value = withTiming(1, { duration: DEFAULT_SECONDS * 1000, easing: Easing.linear });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `progress` is a stable Reanimated shared-value ref.
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * progress.value,
  }));

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <View style={styles.root}>
      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringRotate}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={colors.accentBorder}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={colors.accentStrong}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
          />
        </Svg>
        <Text style={styles.ringLabel}>{seconds}</Text>
      </View>

      <View style={styles.copy}>
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
    gap: spacing.md,
    backgroundColor: colors.accentSurface,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  ringLabel: {
    position: 'absolute',
    fontFamily: fontFamily.mono,
    fontSize: 12,
    color: colors.accentSoft,
  },
  copy: {
    flex: 1,
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
