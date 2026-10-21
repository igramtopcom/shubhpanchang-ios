// Today: the answer first ("is now a good time, until when, else when next"),
// then the day's tithi, sun and moon, Rahu Kaal and the choghadiya table.
import { useMemo } from 'react';
import { Pressable, Share, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { LiveCountdownButton } from '@/components/live-countdown';
import { Card, Loading, Notice, Row, Screen, Section, T, useColors } from '@/components/ui';
import { chogName, longDate, placeName, t } from '@/lib/i18n';
import { chogTier, shubhNow, timeline } from '@/lib/shubh';
import { DAY_MIN, hhmm, shiftDate, zonedTimeToUtc } from '@/lib/time';
import { tick } from '@/lib/haptics';
import { shareMessage } from '@/lib/share';
import { rahuCountdown } from '@/lib/widget-feed';
import type { Lang, PanchangDay } from '@/lib/types';
import { useApp } from '@/state/app';
import { useNow, useObservances, usePanchangWindow } from '@/state/data';


export default function Today() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const place = prefs.place!;
  const now = useNow(place.timezone);
  const win = usePanchangWindow();
  const obs = useObservances(now.date, shiftDate(now.date, 14));

  const day = win.data?.find(d => d.date === now.date) ?? null;
  const tl = useMemo(
    () => (win.data ? timeline(win.data.filter(d => d.date >= shiftDate(now.date, -1) && d.date <= shiftDate(now.date, 1)), now.date) : null),
    [win.data, now.date],
  );
  const sh = tl ? shubhNow(tl, now.minutes) : null;
  const nextVrat = obs.data?.find(o => prefs.notify.kinds.includes(o.kind)) ?? null;

  const until = (end: number) => `${hhmm(end)}${end >= DAY_MIN ? ` (${s.tomorrow})` : ''}`;

  return (
    <Screen header onRefresh={() => { win.reload(); obs.reload(); }} refreshing={win.loading && !!win.data}>
      {/* Send today's panchang (WhatsApp first, as on the website): the share button in the bar. */}
      <Stack.Screen
        options={{
          headerRight: () => (day ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={s.shareToday}
              hitSlop={10}
              onPress={() => { tick(); Share.share({ message: shareMessage(day, place, lang) }).catch(() => {}); }}>
              <SymbolView name="square.and.arrow.up" tintColor={c.brand} size={22} />
            </Pressable>
          ) : null),
        }}
      />
      <Pressable onPress={() => router.push('/place')} accessibilityRole="button" accessibilityHint={s.settingsPlace}>
        <T kind="heading">{longDate(now.date, lang)}</T>
        <T kind="small" color={c.brand}>{placeName(place, lang)}  ›</T>
      </Pressable>

      {win.stale ? <Notice text={s.offline} /> : null}
      {win.error && !win.data ? <Notice text={s.loadError} onRetry={win.reload} retryLabel={s.retry} /> : null}
      {win.loading && !win.data ? <Loading /> : null}

      {day && sh ? (
        <>
          <ShubhCard sh={sh} now={now.minutes} lang={lang} until={until} />
          <TithiCard day={day} lang={lang} />
        </>
      ) : null}

      {nextVrat ? (
        <Pressable onPress={() => router.navigate('/vrat')} accessibilityRole="button">
          <Card>
            <T kind="label">{nextVrat.date === now.date ? s.vratToday : s.upcomingVrat}</T>
            <T kind="heading">{lang === 'gu' ? nextVrat.nameGu : nextVrat.nameEn}</T>
            <T kind="small">{longDate(nextVrat.date, lang)}</T>
            {nextVrat.parana ? (
              <T kind="small" color={c.good}>
                {s.parana}: {longDate(nextVrat.parana.date, lang, false)} {nextVrat.parana.end ? `${nextVrat.parana.start}–${nextVrat.parana.end}` : s.paranaAfter(nextVrat.parana.start)}
              </T>
            ) : null}
            {nextVrat.moonrise ? <T kind="small" color={c.good}>{s.moonrise}: {nextVrat.moonrise.time}</T> : null}
          </Card>
        </Pressable>
      ) : null}

      {day ? (
        <Card>
          <Row label={s.sunrise} value={day.sunrise} />
          <Row label={s.sunset} value={day.sunset} />
          <Row label={s.moonrise} value={day.moonrise} />
          <Row label={s.rahuKaal} value={`${day.rahuKaal.start}–${day.rahuKaal.end}`} color={c.bad} />
          <LiveCountdownButton
            kind="quiet"
            countdown={rahuCountdown(day, placeName(place, lang), lang, place.timezone, zonedTimeToUtc(now.date, now.minutes, place.timezone).getTime())}
            nowMs={zonedTimeToUtc(now.date, now.minutes, place.timezone).getTime()}
          />
          <Row label={s.abhijit} value={`${day.abhijitMuhurta.start}–${day.abhijitMuhurta.end}`} color={c.good} />
        </Card>
      ) : null}

      {day && sh ? (
        <Section title={s.choghadiya}>
          <Card style={{ gap: 0, paddingVertical: 6 }}>
            {day.choghadiya.map((slot, i) => {
              const tier = chogTier(slot.name);
              const active = sh.slot && sh.slot.name === slot.name && sh.slot.period === slot.period
                && hhmm(sh.slot.start) === slot.start;
              const color = tier === 'best' ? c.good : tier === 'avoid' ? c.bad : c.neutral;
              const tierWord = tier === 'best' ? s.tierBest : tier === 'avoid' ? s.tierAvoid : s.tierOk;
              return (
                <View
                  key={`${slot.period}${i}`}
                  accessible
                  accessibilityLabel={`${chogName(slot.name, lang)}, ${slot.start}–${slot.end}, ${tierWord}`}
                  accessibilityState={{ selected: !!active }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8,
                    backgroundColor: active ? c.backgroundSelected : 'transparent',
                  }}>
                  {/* Shape as well as colour: filled = good, ring = fair, bar = avoid. */}
                  <View style={[
                    { width: 10, height: 10, marginRight: 10 },
                    tier === 'best' ? { borderRadius: 5, backgroundColor: color }
                      : tier === 'avoid' ? { height: 4, borderRadius: 2, backgroundColor: color }
                        : { borderRadius: 5, borderWidth: 2, borderColor: color },
                  ]} />
                  <T style={{ flex: 1, fontWeight: active ? '700' : '400' }}>{chogName(slot.name, lang)}</T>
                  <T kind="small" style={{ fontVariant: ['tabular-nums'] }}>{slot.start}–{slot.end}</T>
                </View>
              );
            })}
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}

function ShubhCard({ sh, now, lang, until }: {
  sh: ReturnType<typeof shubhNow>; now: number; lang: Lang; until: (end: number) => string;
}) {
  const s = t(lang);
  const c = useColors();
  const next = sh.next;
  const wait = next ? Math.max(0, Math.round(next.start - now)) : null;
  if (sh.good) {
    return (
      <Card tone="good">
        <T kind="label" color={c.good}>{s.goodNow}</T>
        <T kind="big" color={c.good}>{chogName(sh.good.name, lang)} · {s.until(until(sh.good.end))}</T>
        {next ? <T kind="small">{s.nextGood}: {chogName(next.name, lang)} {hhmm(next.start)}</T> : null}
      </Card>
    );
  }
  return (
    <Card tone={sh.rahu ? 'bad' : 'neutral'}>
      <T kind="label" color={sh.rahu ? c.bad : c.neutral}>
        {sh.rahu ? `${s.inRahu} · ${s.until(until(sh.rahu.end))}` : s.notGoodNow}
      </T>
      {next && wait !== null ? (
        <>
          <T kind="small">{s.nextGood}</T>
          <T kind="big">{chogName(next.name, lang)} · {hhmm(next.start)}</T>
          <T kind="small">{s.inMinutes(wait)}</T>
        </>
      ) : null}
    </Card>
  );
}

function TithiCard({ day, lang }: { day: PanchangDay; lang: Lang }) {
  const s = t(lang);
  const gu = lang === 'gu';
  const endText = `${day.tithi.endTime}${day.tithi.endDayOffset ? ` (${s.tomorrow})` : ''}`;
  return (
    <Card>
      <T kind="heading">
        {gu
          ? `${day.hinduMonth.gu}${day.isAdhikMaas ? ' (અધિક)' : ''} ${day.tithi.paksha === 'shukla' ? 'સુદ' : 'વદ'} ${day.tithi.nameGu}`
          : `${day.hinduMonth.en}${day.isAdhikMaas ? ' (Adhik)' : ''} ${day.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${day.tithi.name}`}
      </T>
      <T kind="small">{s.until(endText)} · {gu ? `વિ.સં. ${day.vikramSamvat}` : `VS ${day.vikramSamvat}`}</T>
      <T kind="small">{s.nakshatra}: {gu ? day.nakshatra.nameGu : day.nakshatra.name}</T>
      {(day.vrat?.items ?? (day.vrat ? [{ en: day.vrat.en, gu: day.vrat.guDialect ?? day.vrat.gu }] : [])).map(item => (
        <T key={item.en} kind="small">
          {gu ? item.gu : item.en}
          {'time' in item && item.time ? ` · ${gu ? item.time.label.gu : item.time.label.en} ${item.time.value}` : ''}
        </T>
      ))}
    </Card>
  );
}
