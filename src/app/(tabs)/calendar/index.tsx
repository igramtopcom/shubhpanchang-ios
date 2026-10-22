// Calendar: a month grid with each day's tithi and the vrat days marked.
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Loading, Notice, Row, Screen, T, useColors } from '@/components/ui';
import { longDate, t } from '@/lib/i18n';
import { weekday } from '@/lib/time';
import type { PanchangDay } from '@/lib/types';
import { useApp } from '@/state/app';
import { useFestivals, useMonth, useNow, useObservances } from '@/state/data';

const MIN_MONTH = '2025-01';
const MAX_MONTH = '2030-12';
/** The vrat lists start in 2026 (/api/v1/observances refuses earlier dates). */
const LIST_FROM_MONTH = '2026-01';

const WEEK = { gu: ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
const MONTHS_CIVIL = {
  gu: ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઑક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export default function CalendarScreen() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const now = useNow(prefs.place!.timezone);
  const [month, setMonth] = useState(now.date.slice(0, 7));
  const [selected, setSelected] = useState<string | null>(now.date);
  const days = useMonth(month);
  const [y, m] = month.split('-').map(Number);
  const last = `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
  const obs = useObservances(month >= LIST_FROM_MONTH ? `${month}-01` : `${LIST_FROM_MONTH}-01`, month >= LIST_FROM_MONTH ? last : `${LIST_FROM_MONTH}-01`);
  const fest = useFestivals(month >= LIST_FROM_MONTH ? `${month}-01` : `${LIST_FROM_MONTH}-01`, month >= LIST_FROM_MONTH ? last : `${LIST_FROM_MONTH}-01`);
  const festByDate = new Map<string, string[]>();
  for (const f of fest.data ?? []) {
    if (f.date.slice(0, 7) !== month) continue;
    festByDate.set(f.date, [...(festByDate.get(f.date) ?? []), lang === 'gu' ? f.nameGu : f.nameEn]);
  }
  const vratByDate = new Map<string, string[]>();
  for (const o of obs.data ?? []) {
    if (o.date.slice(0, 7) !== month) continue;
    vratByDate.set(o.date, [...(vratByDate.get(o.date) ?? []), lang === 'gu' ? o.nameGu : o.nameEn]);
  }

  const lead = weekday(`${month}-01`);
  const cells: (PanchangDay | null)[] = [...Array(lead).fill(null), ...(days.data ?? [])];
  while (cells.length % 7) cells.push(null);
  const sel = days.data?.find(d => d.date === selected) ?? null;

  return (
    <Screen header>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Button kind="quiet" compact icon="chevron.left" label="" a11yLabel={s.prevMonth} onPress={() => setMonth(addMonths(month, -1))} disabled={month <= MIN_MONTH} />
        <T kind="heading" style={{ flexShrink: 1, textAlign: 'center' }}>{MONTHS_CIVIL[lang][m - 1]} {y}</T>
        <Button kind="quiet" compact icon="chevron.right" label="" a11yLabel={s.nextMonth} onPress={() => setMonth(addMonths(month, 1))} disabled={month >= MAX_MONTH} />
      </View>

      {days.stale ? <Notice text={s.offline} /> : null}
      {days.error && !days.data ? <Notice text={s.loadError} onRetry={days.reload} retryLabel={s.retry} /> : null}
      {days.loading && !days.data ? <Loading /> : null}

      {days.data ? (
        <View>
          <View style={{ flexDirection: 'row' }}>
            {WEEK[lang].map(w => <T key={w} kind="label" style={{ flex: 1, textAlign: 'center' }}>{w}</T>)}
          </View>
          {Array.from({ length: cells.length / 7 }, (_, r) => (
            <View key={r} style={{ flexDirection: 'row' }}>
              {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
                if (!d) return <View key={i} style={{ flex: 1, aspectRatio: 0.8 }} />;
                const isToday = d.date === now.date;
                const isSel = d.date === selected;
                const vrat = vratByDate.has(d.date);
                return (
                  <Pressable
                    key={d.date}
                    onPress={() => setSelected(d.date)}
                    accessibilityRole="button"
                    accessibilityLabel={[
                      longDate(d.date, lang),
                      lang === 'gu' ? d.tithi.nameGu : d.tithi.name,
                      ...(festByDate.get(d.date) ?? []),
                      ...(vratByDate.get(d.date) ?? []),
                    ].join(', ')}
                    accessibilityState={{ selected: isSel }}
                    style={{
                      flex: 1, aspectRatio: 0.8, margin: 2, borderRadius: 10, padding: 4, alignItems: 'center',
                      backgroundColor: isSel ? c.backgroundSelected : c.card,
                      borderWidth: isToday ? 1.5 : 1, borderColor: isToday ? c.brand : c.cardBorder,
                    }}>
                    <T style={{ fontWeight: '700', fontSize: 16 }} maxScale={1.3}>{Number(d.date.slice(8))}</T>
                    <T kind="small" shrink maxScale={1.3} style={{ fontSize: 11 }}>{lang === 'gu' ? d.tithi.nameGu : d.tithi.name}</T>
                    {/* Marks by shape as well as colour: a dot for a vrat, a diamond for a festival. */}
                    <View style={{ flexDirection: 'row', gap: 3, marginTop: 2, height: 7, alignItems: 'center' }}>
                      {festByDate.has(d.date) ? <View style={{ width: 6, height: 6, backgroundColor: c.brand, transform: [{ rotate: '45deg' }] }} /> : null}
                      {vrat ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.good }} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      ) : null}

      {sel ? (
        <Card>
          <T kind="heading">{longDate(sel.date, lang)}</T>
          <T kind="small">
            {lang === 'gu'
              ? `${sel.hinduMonth.gu} ${sel.tithi.paksha === 'shukla' ? 'સુદ' : 'વદ'} ${sel.tithi.nameGu}`
              : `${sel.hinduMonth.en} ${sel.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${sel.tithi.name}`}
          </T>
          {(festByDate.get(sel.date) ?? []).map(v => <T key={`f${v}`} kind="value" color={c.brand}>{v}</T>)}
          {(vratByDate.get(sel.date) ?? []).map(v => <T key={v} kind="value" color={c.good}>{v}</T>)}
          <Row label={s.sunrise} value={sel.sunrise} />
          <Row label={s.sunset} value={sel.sunset} />
          <Row label={s.rahuKaal} value={`${sel.rahuKaal.start}–${sel.rahuKaal.end}`} color={c.bad} />
        </Card>
      ) : null}
    </Screen>
  );
}
