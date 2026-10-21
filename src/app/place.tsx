// Changing the place later (from Settings or Today's header).
import { router } from 'expo-router';

import { PlacePicker } from '@/components/place-picker';
import { Button, Screen, T } from '@/components/ui';
import { t } from '@/lib/i18n';
import { useApp } from '@/state/app';

export default function PlaceScreen() {
  const { prefs, update } = useApp();
  const s = t(prefs.lang);
  return (
    <Screen>
      <T kind="title">{s.settingsPlace}</T>
      <Button kind="quiet" label={s.cancel} onPress={() => router.back()} />
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
