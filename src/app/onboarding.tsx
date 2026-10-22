// First run, four steps: language, place, which vrats, reminders. Permission
// for notifications is asked only at the step that says what it is for.
import { useState } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { PlacePicker } from '@/components/place-picker';
import { Button, Card, Chip, Screen, T, useColors, type Symbol } from '@/components/ui';
import { WIDGETS } from '@/lib/features';
import { t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import type { Lang, ObservanceKind, Place, Sampradaya } from '@/lib/types';
import { useApp } from '@/state/app';

const KINDS: ObservanceKind[] = ['ekadashi', 'purnima', 'amavasya', 'sankashti', 'pradosh', 'shivaratri'];
const SAMPRADAYAS: Sampradaya[] = ['smarta', 'swaminarayan', 'pushtimarg'];

export default function Onboarding() {
  const { prefs, update } = useApp();
  const s = t(prefs.lang);
  const c = useColors();
  const [step, setStep] = useState(0);
  const [place, setPlace] = useState<Place | null>(prefs.place);
  const [kinds, setKinds] = useState<ObservanceKind[]>(prefs.notify.kinds);
  const [sampradaya, setSampradaya] = useState<Sampradaya>(prefs.sampradaya);

  const finish = async (remind: boolean) => {
    const granted = remind && notificationsSupported ? await notificationPermission(true) : false;
    // The widget tip comes last on iPhones that have the widgets; elsewhere this ends onboarding.
    const tip = Platform.OS === 'ios' && WIDGETS;
    update({
      place,
      sampradaya,
      onboarded: !tip,
      notify: {
        ...prefs.notify,
        kinds,
        morning: { ...prefs.notify.morning, on: granted && prefs.notify.morning.on },
        vratEve: { ...prefs.notify.vratEve, on: granted },
        parana: granted,
        family: { ...prefs.notify.family, on: granted },
      },
    });
    if (tip) setStep(4);
  };

  return (
    <Screen>
      {step === 0 ? (
        // First screen: who this is for and what it does, before any question.
        <View style={{ gap: 14, paddingTop: 12 }}>
          <Image
            source={require('../../assets/images/icon-light.png')}
            accessibilityIgnoresInvertColors
            style={{ width: 84, height: 84, borderRadius: 19 }}
          />
          <T kind="title" style={{ fontSize: 34 }}>{s.welcome}</T>
          <T>{s.welcomeBody}</T>
          <View style={{ gap: 12, paddingVertical: 4 }}>
            {([['moon.stars.fill', s.onbVrat], ['person.2.fill', s.onbFamily], ['lock.iphone', s.onbLock]] as [Symbol, string][]).map(([icon, text]) => (
              <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <SymbolView name={icon} size={18} tintColor={c.brand} />
                </View>
                <T style={{ flex: 1 }}>{text}</T>
              </View>
            ))}
          </View>
        </View>
      ) : (
        // Later steps: back, and where the reader is in the few steps there are.
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={() => setStep(step - 1)} accessibilityRole="button" hitSlop={12} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <SymbolView name="chevron.left" size={15} weight="semibold" tintColor={c.brand} />
            <T style={{ color: c.brand, fontWeight: '600' }}>{s.back}</T>
          </Pressable>
          <T kind="small">{s.stepOf(step + 1, Platform.OS === 'ios' && WIDGETS ? 5 : 4)}</T>
        </View>
      )}

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
          {kinds.includes('ekadashi') ? (
            <View style={{ gap: 8, paddingTop: 8 }}>
              <T kind="heading">{s.sampradayaQ}</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SAMPRADAYAS.map(x => (
                  <Chip key={x} label={s[`sampradaya_${x}` as const]} selected={sampradaya === x} onPress={() => setSampradaya(x)} />
                ))}
              </View>
              <T kind="small">{s.sampradayaHint}</T>
            </View>
          ) : null}
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
          <Button kind="plain" label={s.notNow} onPress={() => finish(false)} />
        </View>
      ) : null}

      {step === 4 ? (
        <View style={{ gap: 14 }}>
          <T kind="heading">{s.widgetTipTitle}</T>
          <T kind="small">{s.widgetTipBody}</T>
          {/* A drawn sample of the small widget, so the reader knows what to look for. */}
          <View
            accessible
            accessibilityLabel={`${s.widgetSample}: ${s.notGoodNow}, ${s.nextGood} 12:24`}
            style={{
              alignSelf: 'center', width: 158, height: 158, borderRadius: 26, padding: 14, gap: 3,
              backgroundColor: c.background, borderWidth: 1, borderColor: c.cardBorder,
              shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
            }}>
            <T kind="small" style={{ fontSize: 11 }}>{s.widgetSample}</T>
            <View style={{ flex: 1 }} />
            <T kind="small" color={c.neutral} style={{ fontSize: 12, fontWeight: '600' }}>{s.nextGood}</T>
            <T kind="heading" color={c.neutral} style={{ fontSize: 20 }}>{prefs.lang === 'gu' ? 'લાભ · 12:24' : 'Labh · 12:24'}</T>
            <View style={{ flex: 1 }} />
            <T kind="small" style={{ fontSize: 12 }}>{prefs.lang === 'gu' ? 'આસો સુદ દશમ' : 'Ashwin Shukla Dashami'}</T>
          </View>
          <Card>
            <T kind="small">{s.widgetTipHome}</T>
            <T kind="small">{s.widgetTipLock}</T>
          </Card>
          <Button label={s.done} onPress={() => update({ onboarded: true })} />
        </View>
      ) : null}
    </Screen>
  );
}
