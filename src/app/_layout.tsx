import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { ScreenshotTour } from '@/components/screenshot-tour';
import { Colors } from '@/constants/theme';
import { SCREENSHOT_BUILD } from '@/lib/tour';
import { AppProvider, useApp } from '@/state/app';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProvider>
      <Gate />
    </AppProvider>
  );
}

function Gate() {
  const { ready, prefs } = useApp();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = Colors[scheme];

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);
  if (!ready) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, background: c.background, card: c.card, text: c.text, primary: c.brand, border: c.cardBorder } };

  return (
    <ThemeProvider value={theme}>
      {SCREENSHOT_BUILD ? <ScreenshotTour /> : null}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={prefs.onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="family-add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="place" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!prefs.onboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
