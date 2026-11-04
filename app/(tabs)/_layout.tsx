import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import { colors, fontFamily } from '../../src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon(name: IconName, focusedName: IconName) {
  function Icon({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) {
    return <Ionicons name={focused ? focusedName : name} size={size} color={color as string} />;
  }
  Icon.displayName = `TabIcon(${name})`;
  return Icon;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.uiBold,
          fontSize: 11,
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{ title: 'TODAY', tabBarIcon: TabIcon('sunny-outline', 'sunny') }}
      />
      <Tabs.Screen
        name="training"
        options={{ title: 'TRAINING', tabBarIcon: TabIcon('barbell-outline', 'barbell') }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'PROGRESS', tabBarIcon: TabIcon('trending-up-outline', 'trending-up') }}
      />
      <Tabs.Screen
        name="recovery"
        options={{ title: 'RECOVERY', tabBarIcon: TabIcon('moon-outline', 'moon') }}
      />
    </Tabs>
  );
}
