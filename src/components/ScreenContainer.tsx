import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';
import { GrainTexture } from './GrainTexture';
import { TabHeader } from './TabHeader';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** Primary destinations pass their name to get the persistent header (Coach + Settings access). */
  tabTitle?: string;
}

export function ScreenContainer({ children, scroll = true, style, contentStyle, tabTitle }: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.root, style]} edges={['top', 'left', 'right']}>
      <GrainTexture />
      {tabTitle ? <TabHeader title={tabTitle} /> : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
