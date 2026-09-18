import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Button } from '../../src/components';
import { useAppState } from '../../src/state';
import { colors, spacing, typography } from '../../src/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'brand',
    eyebrow: 'VYNKÆR',
    title: 'Discipline becomes data.',
    body: '',
  },
  {
    key: 'continuity',
    eyebrow: '',
    title: 'Every set becomes context.',
    body: 'Your previous training informs what comes next.',
  },
  {
    key: 'forward',
    eyebrow: '',
    title: 'Train forward.',
    body: '',
  },
] as const;

export default function OnboardingScreen() {
  const { completeOnboarding } = useAppState();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  const next = () => {
    if (index >= SLIDES.length - 1) {
      void finish();
      return;
    }
    const nextIndex = index + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setIndex(nextIndex);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.skipRow}>
        <Text style={styles.skip} onPress={finish} accessibilityRole="button" accessibilityLabel="Skip onboarding">
          Skip
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {item.eyebrow ? <Text style={styles.brandmark}>{item.eyebrow}</Text> : null}
            <Text style={styles.title}>{item.title}</Text>
            {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
          </View>
        )}
      />

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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    color: colors.accentSoft,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heroTitle,
    fontSize: 40,
  },
  body: {
    ...typography.bodyMuted,
    marginTop: spacing.md,
    fontSize: 16,
    lineHeight: 24,
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
