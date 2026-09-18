import { Redirect } from 'expo-router';

import { useAppState } from '../src/state';

export default function Index() {
  const { settings } = useAppState();
  if (!settings.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/(tabs)/home" />;
}
