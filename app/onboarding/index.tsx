import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Button } from '../../src/components';
import { useAppState } from '../../src/state';
import { colors, fontFamily, spacing, typography } from '../../src/theme';

const SLIDES = [
  {
    key: 'brand',
    eyebrow: 'VYNKÆR',
    title: 'Discipline becomes data.',
    body: 'FORGED, NOT BORN.',
    doctrine: true,
  },
  {
    key: 'continuity',
    eyebrow: '',
    title: 'Every set becomes context.',
    body: 'Your previous training informs what comes next.',
    doctrine: false,
  },
  {
    key: 'forward',
    eyebrow: '',
    title: 'Train forward.',
    body: 'TRAIN. ENDURE. ADAPT. ASCEND.',
    doctrine: true,
  },
] as const;

export default function OnboardingScreen() {
  const { completeOnboarding } = useAppState();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const finish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  const next = () => {
    if (index >= SLIDES.length - 1) {
      void finish();
      return;
    }
    setIndex(index + 1);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.skipRow}>
        <Text style={styles.skip} onPress={finish} accessibilityRole="button" accessibilityLabel="Skip onboarding">
          Skip
        </Text>
      </View>

      <View style={styles.slide}>
        {slide.eyebrow ? <Text style={styles.brandmark}>{slide.eyebrow}</Text> : null}
        <Text style={styles.title}>{slide.title}</Text>
        {slide.body ? <Text style={slide.doctrine ? styles.doctrine : styles.body}>{slide.body}</Text> : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View key={slide.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={index === SLIDES.length - 1 ? 'ENTER VYNKÆR' : 'Continue'}
          onPress={next}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skip: {
    ...typography.caption,
    padding: spacing.sm,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  brandmark: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    letterSpacing: 5,
    color: colors.accentSoft,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heroTitle,
  },
  body: {
    ...typography.bodyMuted,
    marginTop: spacing.md,
    fontSize: 16,
    lineHeight: 24,
  },
  doctrine: {
    ...typography.doctrine,
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accentSoft,
    width: 20,
  },
});
