// First run, four steps: language, place, which vrats, reminders. Permission
// for notifications is asked only at the step that says what it is for.
import { useState } from 'react';
import { View } from 'react-native';

import { PlacePicker } from '@/components/place-picker';
import { Button, Card, Chip, Screen, T } from '@/components/ui';
import { t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import type { Lang, ObservanceKind, Place } from '@/lib/types';
import { useApp } from '@/state/app';

const KINDS: ObservanceKind[] = ['ekadashi', 'purnima', 'amavasya', 'sankashti', 'pradosh', 'shivaratri'];

export default function Onboarding() {
  const { prefs, update } = useApp();
  const s = t(prefs.lang);
  const [step, setStep] = useState(0);
  const [place, setPlace] = useState<Place | null>(prefs.place);
  const [kinds, setKinds] = useState<ObservanceKind[]>(prefs.notify.kinds);

  const finish = async (remind: boolean) => {
    const granted = remind && notificationsSupported ? await notificationPermission(true) : false;
    update({
      place,
      onboarded: true,
      notify: {
        ...prefs.notify,
        kinds,
        morning: { ...prefs.notify.morning, on: granted && prefs.notify.morning.on },
        vratEve: { ...prefs.notify.vratEve, on: granted },
        parana: granted,
        family: { ...prefs.notify.family, on: granted },
      },
    });
  };

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <T kind="title">{s.welcome}</T>
        <T kind="small">{s.welcomeBody}</T>
      </View>

      {step === 0 ? (
        <View style={{ gap: 12 }}>
          <T kind="heading">{s.chooseLanguage}</T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['gu', 'en'] as Lang[]).map(l => (
              <Chip key={l} label={l === 'gu' ? 'ગુજરાતી' : 'English'} selected={prefs.lang === l} onPress={() => update({ lang: l })} />
            ))}
          </View>
          <Button label={s.next} onPress={() => setStep(1)} />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ gap: 12 }}>
          <T kind="heading">{s.choosePlace}</T>
          <Button label={s.next} onPress={() => setStep(2)} disabled={!place} />
          <PlacePicker value={place} onChange={setPlace} />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ gap: 12 }}>
          <T kind="heading">{s.whichVrat}</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {KINDS.map(k => (
              <Chip
                key={k}
                label={s[`kind_${k}` as const]}
                selected={kinds.includes(k)}
                onPress={() => setKinds(kinds.includes(k) ? kinds.filter(x => x !== k) : [...kinds, k])}
              />
            ))}
          </View>
          <Button label={s.next} onPress={() => setStep(3)} />
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ gap: 12 }}>
          <Card>
            <T kind="heading">{s.remindQ}</T>
            {!notificationsSupported ? <T kind="small">{s.notificationsWeb}</T> : null}
          </Card>
          <Button label={s.allowNotifications} onPress={() => finish(true)} />
          <Button kind="quiet" label={s.notNow} onPress={() => finish(false)} />
        </View>
      ) : null}
    </Screen>
  );
}
