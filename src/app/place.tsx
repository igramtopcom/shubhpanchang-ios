// Changing the place later (from Settings or the place on Today), as a sheet.
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { PlacePicker } from '@/components/place-picker';
import { T, useColors } from '@/components/ui';
import { t } from '@/lib/i18n';
import { useApp } from '@/state/app';

export default function PlaceScreen() {
  const { prefs, update } = useApp();
  const s = t(prefs.lang);
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 12 }}>
        <T kind="display">{s.choosePlace}</T>
        <Pressable accessibilityRole="button" accessibilityLabel={s.close} onPress={() => router.back()} hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
          <SymbolView name="xmark" size={14} weight="bold" tintColor={c.textSecondary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <PlacePicker value={prefs.place} onChange={p => { update({ place: p }); router.back(); }} />
      </ScrollView>
    </View>
  );
}
