import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, shadow, spacing } from '../theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ style, elevated = false, children, ...rest }: CardProps) {
  return (
    <View style={[styles.card, elevated && shadow.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
