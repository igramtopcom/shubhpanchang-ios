// Each tab is a native stack with one screen, so it gets the iOS navigation
// bar: a large title that folds into the bar as the page scrolls, on Liquid
// Glass (iOS 26 makes the bar transparent by default). Screens render their
// content in <Screen header>, whose ScrollView adjusts its insets for the bar.
import { Stack } from 'expo-router';

import { t, type Strings } from '@/lib/i18n';
import { useApp } from '@/state/app';

import { useColors } from './ui';

export function TabStack({ title }: { title: (s: Strings) => string }) {
  const c = useColors();
  const s = t(useApp().prefs.lang);
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerTintColor: c.brand,
        headerTitleStyle: { color: c.text },
        headerLargeTitleStyle: { color: c.text },
        contentStyle: { backgroundColor: c.background },
      }}>
      <Stack.Screen name="index" options={{ title: title(s) }} />
    </Stack>
  );
}
