import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  IBMPlexMono_500Medium,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono';
import { Cinzel_600SemiBold, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import {
  EBGaramond_500Medium,
  EBGaramond_700Bold,
  EBGaramond_500Medium_Italic,
} from '@expo-google-fonts/eb-garamond';

import { AppStateProvider } from '../src/state';
import { colors } from '../src/theme';

// Held so the brand's three-typeface system (DESIGN.md "The Measured-Value
// Rule" + brand-bible typography system — Cinzel display, EB Garamond
// editorial, IBM Plex Mono numerals) is guaranteed loaded before any screen
// renders.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexMono_500Medium,
    IBMPlexMono_700Bold,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    EBGaramond_500Medium,
    EBGaramond_700Bold,
    EBGaramond_500Medium_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="workout/complete" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="exercise/[id]" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
