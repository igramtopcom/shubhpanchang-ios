// One festival at the place (/api/v1/festivals): its day, what it is, and
// where to read more (the festival's page on the site, in an in-app browser).
import { View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { addAllDayEvent, calendarSupported } from '@/lib/calendar';
import { longDate, t } from '@/lib/i18n';
import type { Festival } from '@/lib/types';
import { useApp } from '@/state/app';

import { Button, Card, T, Tag, useColors } from './ui';

export function FestivalCard({ f, today }: { f: Festival; today: string }) {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const gu = lang === 'gu';
  const name = gu ? f.nameGu : f.nameEn;
  const about = f.about ? (gu ? f.about.gu : f.about.en) : null;
  const kind = f.type === 'major' ? s.festMajor : f.type === 'regional' ? s.festRegional : s.festVrat;
  const url = f.url ? `${f.url}${gu ? '' : '?lang=en'}` : null;
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <T kind="label" color={f.date === today ? c.brand : undefined}>{f.date === today ? s.festToday : longDate(f.date, lang)}</T>
        <Tag label={kind} tone={f.type === 'major' ? 'brand' : 'good'} />
      </View>
      <T kind="heading">{name}</T>
      {about ? <T kind="small">{about}</T> : null}
      {f.reason === 'india-date' ? <T kind="small">{s.festIndiaDate(longDate(f.indiaDate, lang, false))}</T> : null}
      {f.reason === 'local-day' ? <T kind="small">{s.festLocalDay(longDate(f.indiaDate, lang, false))}</T> : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {calendarSupported ? (
          <Button
            kind="quiet"
            compact
            icon="calendar.badge.plus"
            label={s.addToCalendar}
            onPress={() => addAllDayEvent({ date: f.date, title: name, notes: [about, url].filter(Boolean).join('\n\n') })}
          />
        ) : null}
        {url ? <Button kind="plain" compact icon="book" label={s.readMore} onPress={() => { WebBrowser.openBrowserAsync(url).catch(() => {}); }} /> : null}
      </View>
    </Card>
  );
}
