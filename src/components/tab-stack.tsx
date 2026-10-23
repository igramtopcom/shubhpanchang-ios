// Each tab is a native stack with one screen, so it gets the iOS navigation
// bar: a large title that folds into the bar as the page scrolls, on Liquid
// Glass (iOS 26 makes the bar transparent by default). Screens render their
// content in <Screen header>, whose ScrollView adjusts its insets for the bar.
import { Stack } from 'expo-router';

import { TitleFont } from '@/constants/theme';
import { t, type Strings } from '@/lib/i18n';
import { useApp } from '@/state/app';

import { useColors } from './ui';

export function TabStack({ title, large = true }: { title: (s: Strings) => string; large?: boolean }) {
  const c = useColors();
  const lang = useApp().prefs.lang;
  const s = t(lang);
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: large,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerTintColor: c.brand,
        headerTitleStyle: { color: c.text, fontFamily: TitleFont[lang] },
        headerLargeTitleStyle: { color: c.text, fontFamily: TitleFont[lang] },
        contentStyle: { backgroundColor: c.background },
      }}>
      <Stack.Screen name="index" options={{ title: title(s) }} />
    </Stack>
  );
}
