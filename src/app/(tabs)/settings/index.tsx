// Settings: place, language, reminders, the calendar feed, how it is calculated.
import { Pressable, Switch, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';

import { Button, Card, Chip, Screen, Section, T, useColors } from '@/components/ui';
import { feedUrl } from '@/lib/api';
import { subscribe } from '@/lib/calendar';
import { tick } from '@/lib/haptics';
import { placeName, t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import type { NotifySettings } from '@/lib/notify-plan';
import type { Lang, ObservanceKind } from '@/lib/types';
import { useApp } from '@/state/app';

const KINDS: ObservanceKind[] = ['ekadashi', 'purnima', 'amavasya', 'sankashti', 'pradosh', 'shivaratri'];

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

  const toggle = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
      <T style={{ flex: 1 }}>{label}</T>
      <Switch value={value} onValueChange={v => { tick(); onChange(v); }} trackColor={{ true: c.brand }} disabled={!notificationsSupported} accessibilityLabel={label} />
    </View>
  );

  return (
    <Screen header>

      <Section title={s.settingsPlace}>
        <Pressable onPress={() => router.push('/place')} accessibilityRole="button">
          <Card>
            <T kind="heading">{placeName(place, lang)}  ›</T>
            {/* The zone matters abroad (whose clock the times are on); in India it is always IST. */}
            {place.timezone !== 'Asia/Kolkata' ? <T kind="small">{place.timezone.replace(/_/g, ' ')}</T> : null}
          </Card>
        </Pressable>
      </Section>

      <Section title={s.settingsLanguage}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['gu', 'en'] as Lang[]).map(l => (
            <Chip key={l} label={l === 'gu' ? 'ગુજરાતી' : 'English'} selected={lang === l} onPress={() => update({ lang: l })} />
          ))}
        </View>
      </Section>

      <Section title={s.whichVrat}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {KINDS.map(k => (
            <Chip
              key={k}
              label={s[`kind_${k}` as const]}
              selected={prefs.notify.kinds.includes(k)}
              onPress={() => update({ notify: { ...prefs.notify, kinds: prefs.notify.kinds.includes(k) ? prefs.notify.kinds.filter(x => x !== k) : [...prefs.notify.kinds, k] } })}
            />
          ))}
        </View>
      </Section>

      <Section title={s.settingsNotifications}>
        <Card>
          {!notificationsSupported ? <T kind="small">{s.notificationsWeb}</T> : null}
          {toggle(s.vratEve, prefs.notify.vratEve.on, v => setNotify({ vratEve: { ...prefs.notify.vratEve, on: v } }))}
          {toggle(s.paranaAlert, prefs.notify.parana, v => setNotify({ parana: v }))}
          {toggle(s.familyAlert, prefs.notify.family.on, v => setNotify({ family: { ...prefs.notify.family, on: v } }))}
          {toggle(s.morningDigest, prefs.notify.morning.on, v => setNotify({ morning: { ...prefs.notify.morning, on: v } }))}
        </Card>
      </Section>

      <Card>
        <T kind="small">{s.feedNote}</T>
        <Button kind="quiet" label={s.subscribeFeed} onPress={() => subscribe(feedUrl(place, lang))} />
      </Card>

      <Section title={s.aboutTitle}>
        <T kind="small">{s.aboutBody}</T>
        <T kind="small">v{Constants.expoConfig?.version ?? '1.0.0'}</T>
      </Section>
    </Screen>
  );
}
