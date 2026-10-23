// The day's and the night's eight choghadiya, each with what it is good for:
// the one running now on sage with "અત્યારે", those gone faded, Rahu Kaal named
// on the slot it falls in. ‹ › step the day; Today links here.
import { useMemo, useState } from 'react';
import { Share, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { DayStep } from '@/components/day-step';
import { headerButtons } from '@/components/glass';
import { Card, Loading, Notice, Screen, Segmented, T, useColors } from '@/components/ui';
import { clock } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { chogName, longDate, placeName, t } from '@/lib/i18n';
import { chogTier, timeline } from '@/lib/shubh';
import { DAY_MIN, hhmm, shiftDate } from '@/lib/time';
import type { PanchangDay } from '@/lib/types';
import { useApp } from '@/state/app';
import { useDay, useNow } from '@/state/data';


const FIRST = '2025-01-02', LAST = '2030-12-30';

export default function ChoghadiyaScreen() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const place = prefs.place!;
  const now = useNow(place.timezone);
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : now.date;
  const { day, next, prev, loading, error, reload } = useDay(date);
  // After sunset, open on the night.
  const [period, setPeriod] = useState<'day' | 'night'>(() => (date === now.date && day && now.minutes >= toMin(day.sunset) ? 'night' : 'day'));

  const tl = useMemo(() => (day ? timeline([prev, day, next].filter(Boolean) as PanchangDay[], date) : null), [prev, day, next, date]);
  const nowAt = date === now.date ? now.minutes : date === shiftDate(now.date, -1) ? now.minutes + DAY_MIN : null;
  // Day: sunrise to sunset of `date`; night: its sunset to the next sunrise (past midnight on the timeline).
  const rows = tl ? tl.slots.filter(x => x.period === period && (period === 'day' ? x.start >= 0 && x.start < DAY_MIN : x.start >= 12 * 60 && x.start < DAY_MIN + 12 * 60)) : [];
  const rahu = tl ? tl.rahu.find(r => r.start >= 0 && r.start < DAY_MIN) ?? null : null;

  const share = () => {
    if (!rows.length) return;
    tick();
    const lines = rows.map(r => `${chogName(r.name, lang)}  ${clock(hhmm(r.start), lang, prefs.clock24)} – ${clock(hhmm(r.end), lang, prefs.clock24)}`);
    Share.share({ message: `${s.choghadiya} · ${placeName(place, lang)} · ${longDate(date, lang)}\n${lines.join('\n')}\n\nhttps://shubhpanchang.in/choghadiya` }).catch(() => {});
  };

  return (
    <Screen header bottom={60} gap={16}>
      <Stack.Screen options={{ headerTitle: s.choghadiya, ...headerButtons([{ icon: 'square.and.arrow.up', label: s.share, onPress: share }], c.text) }} />
      <DayStep date={date} lang={lang} sub={day ? `${placeName(place, lang)} · ${period === 'day' ? `${s.sunrise} ${clock(day.sunrise, lang, prefs.clock24)}` : `${s.sunset} ${clock(day.sunset, lang, prefs.clock24)}`}` : ''}
        onPrev={date > FIRST ? () => router.setParams({ date: shiftDate(date, -1) }) : undefined}
        onNext={date < LAST ? () => router.setParams({ date: shiftDate(date, 1) }) : undefined} today />
      <Segmented values={[s.dayPeriod, s.nightPeriod]} index={period === 'day' ? 0 : 1} onChange={i => setPeriod(i ? 'night' : 'day')} />
      {error && !day ? <Notice text={s.loadError} onRetry={reload} retryLabel={s.retry} /> : null}
      {loading && !day ? <Loading /> : null}
      {rows.length ? (
        <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          {rows.map((r, i) => {
            const tier = chogTier(r.name);
            const isNow = nowAt !== null && nowAt >= r.start && nowAt < r.end;
            const past = nowAt !== null && nowAt >= r.end;
            const inRahu = rahu && rahu.start < r.end && rahu.end > r.start;
            const tone = tier === 'best' ? c.good : tier === 'avoid' ? c.bad : c.fair;
            const hint = tier === 'best' ? s[`chogUse_${r.name}` as 'chogUse_Amrit'] ?? s.keyGood : tier === 'ok' ? s.chogUse_Char : s.keyBad;
            return (
              <View key={`${r.period}${i}`} accessible accessibilityLabel={`${chogName(r.name, lang)}, ${clock(hhmm(r.start), lang)} – ${clock(hhmm(r.end), lang)}, ${hint}${isNow ? `, ${s.nowWord}` : ''}${inRahu ? `, ${s.rahuKaal}` : ''}`}
                style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingLeft: 14, paddingRight: 16 },
                  i > 0 && { borderTopWidth: 0.5, borderTopColor: c.line }, isNow && { backgroundColor: c.goodBg }, past && { opacity: 0.55 }]}>
                <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: tone }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <T kind="heading" style={{ fontSize: 16 }}>{chogName(r.name, lang)}</T>
                    {isNow ? <Pill text={s.nowWord} bg={c.good} fg={c.background === '#15100C' ? c.background : '#FFFFFF'} /> : null}
                    {inRahu ? <Pill text={s.rahuKaal} bg={c.badBg} fg={c.bad} /> : null}
                  </View>
                  <T kind="small">{tier === 'avoid' ? tierWord(tier, s) : `${tierWord(tier, s)} · ${hint}`}</T>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <T kind="value" style={{ fontSize: 15 }}>{clock(hhmm(r.start), lang, prefs.clock24)}</T>
                  <T kind="value" style={{ fontSize: 15 }}>{clock(hhmm(r.end), lang, prefs.clock24)}</T>
                </View>
              </View>
            );
          })}
        </Card>
      ) : null}
      <T kind="caption" style={{ marginHorizontal: 6 }}>{s.chogNote}</T>
    </Screen>
  );
}

const toMin = (x: string) => { const [h, m] = x.split(':').map(Number); return h * 60 + m; };
const tierWord = (tier: string, s: ReturnType<typeof t>) => (tier === 'best' ? s.keyGood : tier === 'avoid' ? s.keyBad : s.keyFair);

function Pill({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
      <T style={{ color: fg, fontSize: 11.5, fontWeight: '600' }}>{text}</T>
    </View>
  );
}
