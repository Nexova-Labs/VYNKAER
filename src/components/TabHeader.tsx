import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, spacing, typography } from '../theme';
import { IconButton } from './IconButton';
import { Text } from './Text';

// Persistent top bar for the four primary destinations: the destination name on the left,
// and one-tap access to the Coach (modal) and Settings from every tab on the right.
export function TabHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.actions}>
        <IconButton name="chatbubble-ellipses-outline" label="Open Coach" onPress={() => router.push('/coach')} />
        <IconButton name="settings-outline" label="Open Settings" onPress={() => router.push('/settings')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.eyebrow,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
  },
});
