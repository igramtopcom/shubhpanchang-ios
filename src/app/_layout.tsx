import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NotoSerifGujarati_600SemiBold } from '@expo-google-fonts/noto-serif-gujarati/600SemiBold';
import { SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4/600SemiBold';

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
  // The serif titles; a font that fails to load falls back to the system's.
  const [fonts, fontError] = useFonts({ NotoSerifGujarati_600SemiBold, SourceSerif4_600SemiBold });
  const go = ready && (fonts || !!fontError);

  useEffect(() => {
    if (go) SplashScreen.hide();
  }, [go]);
  if (!go) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, background: c.background, card: c.card, text: c.text, primary: c.brand, border: c.line } };
  // Pushed detail screens: a transparent bar with the back chevron alone (iOS 26
  // draws it as a glass circle) and the content running under it.
  const detail = {
    headerShown: true,
    headerTransparent: true,
    headerTitle: '',
    headerBackButtonDisplayMode: 'minimal' as const,
    headerTintColor: c.text,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: c.background },
  };
  const sheet = { presentation: 'formSheet' as const, sheetGrabberVisible: true, contentStyle: { backgroundColor: c.background } };

  return (
    <ThemeProvider value={theme}>
      {SCREENSHOT_BUILD ? <ScreenshotTour /> : null}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={prefs.onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="festival" options={detail} />
          <Stack.Screen name="observance" options={detail} />
          <Stack.Screen name="choghadiya" options={detail} />
          <Stack.Screen name="person" options={detail} />
          <Stack.Screen name="search" options={{ ...detail, headerTransparent: false, headerStyle: { backgroundColor: c.background } }} />
          <Stack.Screen name="day" options={{ ...sheet, sheetAllowedDetents: [0.62, 1] }} />
          <Stack.Screen name="settings" options={{ ...sheet, sheetAllowedDetents: [1] }} />
          <Stack.Screen name="family-add" options={{ ...sheet, sheetAllowedDetents: [1] }} />
          <Stack.Screen name="place" options={{ ...sheet, sheetAllowedDetents: [1] }} />
        </Stack.Protected>
        <Stack.Protected guard={!prefs.onboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
