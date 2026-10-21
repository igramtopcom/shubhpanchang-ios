// Changing the place later (from Settings or Today's header).
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { PlacePicker } from '@/components/place-picker';
import { Screen, T, useColors } from '@/components/ui';
import { t } from '@/lib/i18n';
import { useApp } from '@/state/app';

export default function PlaceScreen() {
  const { prefs, update } = useApp();
  const s = t(prefs.lang);
  const c = useColors();
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T kind="title">{s.settingsPlace}</T>
        <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12} style={{ minHeight: 44, justifyContent: 'center' }}>
          <T style={{ color: c.brand, fontWeight: '600' }}>{s.cancel}</T>
        </Pressable>
      </View>
      <PlacePicker
        value={prefs.place}
        onChange={p => {
          update({ place: p });
          router.back();
        }}
      />
    </Screen>
  );
}
