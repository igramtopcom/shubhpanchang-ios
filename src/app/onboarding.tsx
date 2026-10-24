// First run, three steps: what the app is (and its language), the place, the
// tradition with one question about reminders. Permission for notifications is
// asked only when the reader says yes to that question. On an iPhone with the
// widgets, a last screen shows where to add them.
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { PlacePicker } from '@/components/place-picker';
import { Button, Card, Cell, Group, Segmented, T, useColors, type Symbol } from '@/components/ui';
import { WIDGETS } from '@/lib/features';
import { tick } from '@/lib/haptics';
import { t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import { SAMPRADAYAS, type Lang, type ObservanceKind, type Place, type Sampradaya } from '@/lib/types';
import { useApp } from '@/state/app';

/** Choosing Jain turns the parva tithis on; leaving it turns them off. */
const withParva = (kinds: ObservanceKind[], s: Sampradaya): ObservanceKind[] =>
  s === 'jain' ? (kinds.includes('parva') ? kinds : ['parva', ...kinds]) : kinds.filter(k => k !== 'parva');

export default function Onboarding() {
  const { prefs, update } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const [step, setStep] = useState(0);
  const [place, setPlace] = useState<Place | null>(prefs.place);
  const [sampradaya, setSampradaya] = useState<Sampradaya>(prefs.sampradaya);
  const [remind, setRemind] = useState(true);
  const tip = Platform.OS === 'ios' && WIDGETS;

  const finish = async () => {
    const granted = remind && notificationsSupported ? await notificationPermission(true) : false;
    update({
      place,
      sampradaya,
      onboarded: !tip,
      notify: {
        ...prefs.notify,
        kinds: withParva(prefs.notify.kinds, sampradaya),
        morning: { ...prefs.notify.morning, on: granted && prefs.notify.morning.on },
        vratEve: { ...prefs.notify.vratEve, on: granted },
        parana: granted,
        family: { ...prefs.notify.family, on: granted },
        festivals: { ...prefs.notify.festivals, on: granted },
      },
    });
    if (tip) setStep(3);
  };

  const dots = (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
      {[0, 1, 2].map(i => <View key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, backgroundColor: i === step ? c.brand : c.line }} />)}
    </View>
  );
  const back = (
    <Pressable onPress={() => { tick(); setStep(step - 1); }} accessibilityRole="button" accessibilityLabel={s.back} hitSlop={8}
      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
      <SymbolView name="chevron.left" size={14} weight="semibold" tintColor={c.text} />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {step === 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 8 }}>
          <View style={{ alignSelf: 'flex-end', width: 210 }}>
            <Segmented values={['ગુજરાતી', 'English']} index={lang === 'gu' ? 0 : 1} onChange={i => update({ lang: (i ? 'en' : 'gu') as Lang })} />
          </View>
          <View style={{ width: 76, height: 76, borderRadius: 20, backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 20 }}>
            <SymbolView name="sun.horizon.fill" size={36} tintColor="#FFF4E6" />
          </View>
          <T kind="display" style={{ fontSize: 32, lineHeight: 42 }}>{s.appName}</T>
          <T kind="small" style={{ fontSize: 16, lineHeight: 23, marginTop: 6 }}>{s.welcomeBody}</T>
          <Arc />
          <View style={{ gap: 16 }}>
            {([['clock', s.onbNow, s.onbNowSub], ['moon.stars', s.onbVrat, s.onbVratSub], ['person.2', s.onbFamily, s.onbFamilySub]] as [Symbol, string, string][]).map(([icon, title, sub]) => (
              <View key={title} style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <SymbolView name={icon} size={18} tintColor={c.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <T style={{ fontWeight: '600', fontSize: 15.5 }}>{title}</T>
                  <T kind="small">{sub}</T>
                </View>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 'auto', gap: 12, paddingBottom: 12 }}>
            {dots}
            <Button label={s.next} onPress={() => setStep(1)} />
            <T kind="caption" center>{s.noAccount}</T>
          </View>
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6 }}>{back}{dots}<View style={{ width: 40 }} /></View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 120, gap: 6 }} keyboardShouldPersistTaps="handled">
            <T kind="display">{s.choosePlace}</T>
            <T kind="small" style={{ fontSize: 15, marginBottom: 12 }}>{s.placeWhy}</T>
            <PlacePicker value={place} onChange={setPlace} />
          </ScrollView>
          <View style={{ position: 'absolute', left: 18, right: 18, bottom: 24 }}>
            <Button label={s.next} onPress={() => setStep(2)} disabled={!place} />
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6 }}>{back}{dots}<View style={{ width: 40 }} /></View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 120, gap: 14 }}>
            <View style={{ gap: 6 }}>
              <T kind="display">{s.yourTradition}</T>
              <T kind="small" style={{ fontSize: 15 }}>{s.sampradayaHint}</T>
            </View>
            <Group>
              {SAMPRADAYAS.map((x, i) => (
                <Cell key={x} first={i === 0} label={s[`sampradayaShort_${x}` as 'sampradayaShort_baps']} sub={s[`sampradayaSub_${x}` as 'sampradayaSub_baps']} radio={sampradaya === x} onPress={() => setSampradaya(x)} />
              ))}
            </Group>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
                <SymbolView name="bell" size={20} tintColor={c.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <T style={{ fontSize: 15, fontWeight: '600' }}>{s.remindQ}</T>
                <T kind="caption">{notificationsSupported ? s.permissionNote : s.notificationsWeb}</T>
              </View>
              <Switch value={remind} onValueChange={v => { tick(); setRemind(v); }} trackColor={{ true: c.good }} accessibilityLabel={s.remindQ} />
            </Card>
            <T kind="caption" style={{ marginHorizontal: 6 }}>{s.changeLater}</T>
          </ScrollView>
          <View style={{ position: 'absolute', left: 18, right: 18, bottom: 24 }}>
            <Button label={s.start} onPress={finish} />
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 24, paddingBottom: 40, gap: 16 }}>
          <T kind="display">{s.widgetTipTitle}</T>
          <T kind="small" style={{ fontSize: 15.5, lineHeight: 22 }}>{s.widgetTipBody}</T>
          <View accessible accessibilityLabel={`${s.widgetSample}: ${s.goodNow}`}
            style={{ alignSelf: 'center', width: 158, height: 158, borderRadius: 26, padding: 14, backgroundColor: c.card, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
            <T kind="caption">{s.widgetSample}</T>
            <View style={{ flex: 1 }} />
            <T kind="caption" color={c.good} style={{ fontWeight: '600' }}>{s.goodNow}</T>
            <T style={{ fontSize: 22, lineHeight: 31, fontWeight: '600' }}>{lang === 'gu' ? 'લાભ' : 'Labh'}</T>
            <T kind="caption">{lang === 'gu' ? '10:51 સુધી' : 'until 10:51 am'}</T>
          </View>
          <Card style={{ gap: 6 }}>
            <T kind="small">{s.widgetTipHome}</T>
            <T kind="small">{s.widgetTipLock}</T>
          </Card>
          <Button label={s.done} onPress={() => update({ onboarded: true })} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

/** The sun on its way across the sky, as on Today. */
function Arc() {
  const c = useColors();
  return (
    <View style={{ height: 120, marginVertical: 10 }} accessibilityElementsHidden>
      <Svg width="100%" height={120} viewBox="0 0 350 120" preserveAspectRatio="xMidYMid meet">
        <Path d="M20 108 Q175 -20 330 108" stroke={c.line} strokeWidth={2} strokeDasharray="3 5" fill="none" />
        <Path d="M20 108 Q120 18 190 34" stroke={c.brand} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <Circle cx={190} cy={34} r={19} fill={c.brand} fillOpacity={0.14} />
        <Circle cx={190} cy={34} r={11} fill={c.brand} />
        <Line x1={8} y1={108} x2={342} y2={108} stroke={c.line} strokeWidth={2} />
      </Svg>
    </View>
  );
}
