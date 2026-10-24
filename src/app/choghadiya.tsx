// The day's and the night's eight choghadiya, each with what it is good for.
// In the Today style: the one running now is the screen's coloured row (sage,
// sand or brick by its tier, on bandhani), those gone faded, Rahu Kaal named on
// the slot it falls in. ‹ › step the day; Today links here.
import { useMemo, useState } from 'react';
import { Share, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { DateLine, WHITE, WHITE2, useBand } from '@/components/band';
import { headerButtons } from '@/components/glass';
import { Bandhani } from '@/components/sky';
import { Card, Loading, Notice, Screen, Segmented, T, useColors } from '@/components/ui';
import { clock } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { chogName, longDate, placeName, t } from '@/lib/i18n';
import { chogTier, timeline, type Slot } from '@/lib/shubh';
import { DAY_MIN, hhmm, shiftDate } from '@/lib/time';
import type { Lang, PanchangDay } from '@/lib/types';
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
      <View style={{ gap: 2 }}>
        <DateLine date={date} lang={lang}
          onPrev={date > FIRST ? () => router.setParams({ date: shiftDate(date, -1) }) : undefined}
          onNext={date < LAST ? () => router.setParams({ date: shiftDate(date, 1) }) : undefined} />
        {day ? <T kind="small" style={{ fontSize: 14.5, marginLeft: 20 }}>{placeName(place, lang)} · {period === 'day' ? `${s.sunrise} ${clock(day.sunrise, lang, prefs.clock24)}` : `${s.sunset} ${clock(day.sunset, lang, prefs.clock24)}`}</T> : null}
      </View>
      <Segmented values={[s.dayPeriod, s.nightPeriod]} index={period === 'day' ? 0 : 1} onChange={i => setPeriod(i ? 'night' : 'day')} />
      {error && !day ? <Notice text={s.loadError} onRetry={reload} retryLabel={s.retry} /> : null}
      {loading && !day ? <Loading /> : null}
      {rows.length ? (
        <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <ChogRow key={`${r.period}${i}`} r={r} first={i === 0} lang={lang} h24={prefs.clock24}
              isNow={nowAt !== null && nowAt >= r.start && nowAt < r.end} past={nowAt !== null && nowAt >= r.end}
              inRahu={!!rahu && rahu.start < r.end && rahu.end > r.start} />
          ))}
        </Card>
      ) : null}
      <T kind="caption" style={{ marginHorizontal: 6 }}>{s.chogNote}</T>
    </Screen>
  );
}

const toMin = (x: string) => { const [h, m] = x.split(':').map(Number); return h * 60 + m; };

/** One choghadiya: a dot in its tone, its name and what it is for, its times; the one running now on its coloured band. */
function ChogRow({ r, first, isNow, past, inRahu, lang, h24 }: { r: Slot; first: boolean; isNow: boolean; past: boolean; inRahu: boolean; lang: Lang; h24: boolean }) {
  const s = t(lang);
  const c = useColors();
  const tier = chogTier(r.name);
  const band = useBand(tier === 'best' ? 'good' : tier === 'avoid' ? 'rahu' : 'fair');
  const tone = tier === 'best' ? c.good : tier === 'avoid' ? c.bad : c.neutral;
  const verdict = tier === 'best' ? s.verdict_good : tier === 'avoid' ? s.verdict_avoid : s.verdict_fair;
  const use = tier === 'best' ? s[`chogUse_${r.name}` as 'chogUse_Amrit'] : tier === 'ok' ? s.chogUse_Char : '';
  const fg = isNow ? WHITE : c.text;
  const fg2 = isNow ? WHITE2 : c.textSecondary;
  return (
    <View accessible accessibilityLabel={`${chogName(r.name, lang)}, ${clock(hhmm(r.start), lang)} – ${clock(hhmm(r.end), lang)}, ${verdict}${use ? `, ${use}` : ''}${isNow ? `, ${s.nowWord}` : ''}${inRahu ? `, ${s.rahuKaal}` : ''}`}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: isNow ? 15 : 11, paddingHorizontal: 16 },
        !first && !isNow && { borderTopWidth: 0.5, borderTopColor: c.line }, past && { opacity: 0.5 }]}>
      {isNow ? <Bandhani from={band[0]} to={band[1]} id={`chog-${r.start}`} /> : null}
      {isNow ? null : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tier === 'ok' ? c.fair : tone, borderWidth: tier === 'ok' ? 1.5 : 0, borderColor: c.neutral }} />}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <T style={{ fontSize: isNow ? 19 : 16, fontWeight: '600', color: fg }}>{chogName(r.name, lang)}</T>
          {isNow ? <Pill text={s.nowWord} border={WHITE} fg={WHITE} /> : <T style={{ fontSize: 13, fontWeight: '600', color: tone }}>{verdict}</T>}
          {inRahu ? <Pill text={s.rahuKaal} border={isNow ? WHITE : c.bad} fg={isNow ? WHITE : c.bad} /> : null}
        </View>
        {use || isNow ? <T style={{ fontSize: 13.5, color: fg2 }}>{isNow ? [verdict, use].filter(Boolean).join(' · ') : use}</T> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <T style={{ fontSize: 15, fontWeight: '600', color: fg, fontVariant: ['tabular-nums'] }}>{clock(hhmm(r.start), lang, h24)}</T>
        <T style={{ fontSize: 15, fontWeight: '600', color: isNow ? WHITE2 : c.textSecondary, fontVariant: ['tabular-nums'] }}>{clock(hhmm(r.end), lang, h24)}</T>
      </View>
    </View>
  );
}

function Pill({ text, border, fg }: { text: string; border: string; fg: string }) {
  return (
    <View style={{ borderColor: border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
      <T style={{ color: fg, fontSize: 11.5, fontWeight: '600' }}>{text}</T>
    </View>
  );
}
