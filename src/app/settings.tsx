// Settings, as a sheet from the gear on every tab: place, tradition, language
// and clock, which vrats, reminders, the iPhone Calendar feed, and how the
// app works. Everything is read here; nothing opens the website.
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { SymbolView } from 'expo-symbols';

import { CardTitle } from '@/components/band';
import { Card, Cell, Chip, Group, Segmented, T, useColors } from '@/components/ui';
import { feedUrl } from '@/lib/api';
import { subscribe } from '@/lib/calendar';
import { clock } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { placeName, t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import type { NotifySettings } from '@/lib/notify-plan';
import { hhmm } from '@/lib/time';
import { SAMPRADAYAS, type Lang, type ObservanceKind, type Sampradaya } from '@/lib/types';
import { useApp } from '@/state/app';

const KINDS: ObservanceKind[] = ['ekadashi', 'purnima', 'amavasya', 'sankashti', 'pradosh', 'shivaratri'];
const THEMES = ['auto', 'light', 'dark'] as const;
/** The vrats offered: a Jain reader also gets the parva tithis. */
const kindsFor = (s: Sampradaya): ObservanceKind[] => (s === 'jain' ? ['parva', ...KINDS] : KINDS);
/** Choosing Jain turns the parva tithis on; leaving it turns them off. */
const withParva = (kinds: ObservanceKind[], s: Sampradaya): ObservanceKind[] =>
  s === 'jain' ? (kinds.includes('parva') ? kinds : ['parva', ...kinds]) : kinds.filter(k => k !== 'parva');

export default function SettingsScreen() {
  const { prefs, update } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const place = prefs.place!;

  const setNotify = async (patch: Partial<NotifySettings>) => {
    // Turning anything on asks for permission at that moment, if not yet given.
    const turningOn = Object.values(patch).some(v => v === true || (typeof v === 'object' && v && 'on' in v && v.on));
    if (turningOn && notificationsSupported && !(await notificationPermission(true))) return;
    update({ notify: { ...prefs.notify, ...patch } });
  };
  const at = (m: number) => clock(hhmm(m), lang, prefs.clock24, true);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8 }}>
        <T kind="display">{s.tabSettings}</T>
        <Pressable accessibilityRole="button" accessibilityLabel={s.close} onPress={() => router.back()} hitSlop={8}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
          <SymbolView name="xmark" size={14} weight="bold" tintColor={c.textSecondary} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 48, gap: 22 }}>
        <Group>
          <Cell first icon="location.fill" tint={c.brand} label={s.settingsPlace} value={placeName(place, lang)} onPress={() => router.push('/place')} />
          <Cell icon="clock" tint="#9A8A7C" label={s.clock24} toggle={prefs.clock24} onToggle={v => update({ clock24: v })} />
        </Group>

        <View style={{ gap: 7 }}>
          <T kind="label" style={{ marginLeft: 6 }}>{s.settingsLanguage}</T>
          <Segmented values={['ગુજરાતી', 'English']} index={lang === 'gu' ? 0 : 1} onChange={i => update({ lang: (i ? 'en' : 'gu') as Lang })} />
        </View>

        <View style={{ gap: 7 }}>
          <T kind="label" style={{ marginLeft: 6 }}>{s.appearance}</T>
          <Segmented values={[s.themeAuto, s.themeLight, s.themeDark]} index={THEMES.indexOf(prefs.theme ?? 'auto')} onChange={i => update({ theme: THEMES[i] })} />
          <T kind="caption" style={{ marginHorizontal: 6, fontSize: 12.5 }}>{s.themeNote}</T>
        </View>

        <Group title={s.yourTradition} note={s.sampradayaHint}>
          {SAMPRADAYAS.map((x, i) => (
            <Cell key={x} first={i === 0} label={s[`sampradayaShort_${x}` as 'sampradayaShort_baps']} sub={s[`sampradayaSub_${x}` as 'sampradayaSub_baps']} radio={prefs.sampradaya === x}
              onPress={() => update({ sampradaya: x, notify: { ...prefs.notify, kinds: withParva(prefs.notify.kinds, x) } })} />
          ))}
        </Group>

        <View style={{ gap: 7 }}>
          <T kind="label" style={{ marginLeft: 6 }}>{s.whichVrat}</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {kindsFor(prefs.sampradaya).map(k => (
              <Chip key={k} label={s[`kind_${k}` as const]} selected={prefs.notify.kinds.includes(k)}
                onPress={() => update({ notify: { ...prefs.notify, kinds: prefs.notify.kinds.includes(k) ? prefs.notify.kinds.filter(x => x !== k) : [...prefs.notify.kinds, k] } })} />
            ))}
          </View>
        </View>

        <Group title={s.settingsNotifications} note={!notificationsSupported ? s.notificationsWeb : undefined}>
          <Cell first icon="sunrise" tint={c.brand} label={s.morningDigest} sub={at(prefs.notify.morning.minutes)} toggle={prefs.notify.morning.on} disabled={!notificationsSupported} onToggle={v => setNotify({ morning: { ...prefs.notify.morning, on: v } })} />
          <Cell icon="moon.stars" tint={c.good} label={s.vratEve} sub={at(prefs.notify.vratEve.minutes)} toggle={prefs.notify.vratEve.on} disabled={!notificationsSupported} onToggle={v => setNotify({ vratEve: { ...prefs.notify.vratEve, on: v } })} />
          <Cell icon="clock" tint={c.good} label={s.paranaAlert} toggle={prefs.notify.parana} disabled={!notificationsSupported} onToggle={v => setNotify({ parana: v })} />
          <Cell icon="person.2" tint="#7A6A5E" label={s.familyAlert} toggle={prefs.notify.family.on} disabled={!notificationsSupported} onToggle={v => setNotify({ family: { ...prefs.notify.family, on: v } })} />
          <Cell icon="sparkles" tint="#B5793A" label={s.festivalAlert} toggle={prefs.notify.festivals.on} disabled={!notificationsSupported} onToggle={v => setNotify({ festivals: { ...prefs.notify.festivals, on: v } })} />
        </Group>

        <Group title={s.iphoneCalendar} note={s.feedNote}>
          <Cell first icon="calendar.badge.plus" tint={c.good} label={s.subscribeFeedShort} onPress={() => { tick(); subscribe(feedUrl(place, lang, 'webcal', prefs.sampradaya)); }} />
        </Group>

        <Card style={{ gap: 10 }}>
          <CardTitle>{s.aboutTitle}</CardTitle>
          <T kind="small" style={{ fontSize: 14.5, lineHeight: 21 }}>{s.aboutBody}</T>
          <View style={{ marginTop: 6 }}><CardTitle>{s.privacyTitle}</CardTitle></View>
          <T kind="small" style={{ fontSize: 14.5, lineHeight: 21 }}>{s.privacyBody}</T>
          <T kind="small" style={{ fontSize: 14.5, lineHeight: 21 }}>{s.notAffiliated}</T>
        </Card>
        <T kind="caption" center>{s.appName} {Constants.expoConfig?.version ?? '1.0.0'} · {s.byWebsite}</T>
      </ScrollView>
    </View>
  );
}
