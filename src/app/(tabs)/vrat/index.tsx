// Vrat & Festivals: the coming fasts at the place, each with when it may be
// broken; and the coming festivals (/api/v1/festivals). ?seg=festivals opens the
// festivals (links, the screenshot tour).
import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { FestivalCard } from '@/components/festival-card';
import { LiveCountdownButton } from '@/components/live-countdown';
import { Button, Card, Loading, Notice, Screen, Section, Segmented, T, useColors } from '@/components/ui';
import { feedUrl } from '@/lib/api';
import { addAllDayEvent, calendarSupported, subscribe } from '@/lib/calendar';
import { longDate, t } from '@/lib/i18n';
import { shiftDate, zonedTimeToUtc } from '@/lib/time';
import { vratCountdown } from '@/lib/widget-feed';
import type { Observance } from '@/lib/types';
import { useApp } from '@/state/app';
import { useFestivals, useNow, useObservances } from '@/state/data';

/** The India lists end with 2030; the API refuses ranges past them. */
const LIST_TO = '2030-12-31';

export default function VratScreen() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const place = prefs.place!;
  const now = useNow(place.timezone);
  const to = shiftDate(now.date, 150) < LIST_TO ? shiftDate(now.date, 150) : LIST_TO;
  const obs = useObservances(now.date, to);
  const list = (obs.data ?? []).filter(o => prefs.notify.kinds.includes(o.kind));
  // A year of festivals ahead (the API takes up to 400 days).
  const festTo = shiftDate(now.date, 365) < LIST_TO ? shiftDate(now.date, 365) : LIST_TO;
  const fest = useFestivals(now.date, festTo);
  const params = useLocalSearchParams<{ seg?: string }>();
  const [seg, setSeg] = useState(params.seg === 'festivals' ? 1 : 0);
  // A link or Today's festival card opens the festivals even when this tab is
  // already open: follow the parameter when it changes (React's "adjust state on
  // a prop change" pattern, no effect).
  const [seenSeg, setSeenSeg] = useState(params.seg);
  if (params.seg !== seenSeg) {
    setSeenSeg(params.seg);
    if (params.seg === 'festivals') setSeg(1);
  }
  const current = seg === 0 ? obs : fest;

  return (
    <Screen header onRefresh={current.reload} refreshing={current.loading && !!current.data}>
      <Segmented values={[s.segVrat, s.segFestivals]} index={seg} onChange={setSeg} />
      <Card>
        <T kind="small">{s.feedNote}</T>
        <Button kind="quiet" icon="calendar.badge.plus" label={s.subscribeFeed} onPress={() => subscribe(feedUrl(place, lang, 'webcal', prefs.sampradaya))} />
      </Card>
      {current.stale ? <Notice text={s.offline} /> : null}
      {current.error && !current.data ? <Notice text={s.loadError} onRetry={current.reload} retryLabel={s.retry} /> : null}
      {current.loading && !current.data ? <Loading /> : null}
      {seg === 0 ? (
        <>
          {obs.data && !list.length ? <T kind="small">{s.noVratSoon}</T> : null}
          <Section title={s.upcomingVrat}>
            {list.map(o => <VratCard key={`${o.kind}${o.date}`} o={o} nowMs={zonedTimeToUtc(now.date, now.minutes, place.timezone).getTime()} />)}
          </Section>
        </>
      ) : (
        <>
          {fest.data && !fest.data.length ? <T kind="small">{s.noFestSoon}</T> : null}
          <Section title={s.upcomingFestivals}>
            {(fest.data ?? []).map(f => <FestivalCard key={f.slug} f={f} today={now.date} />)}
          </Section>
        </>
      )}
    </Screen>
  );
}

function VratCard({ o, nowMs }: { o: Observance; nowMs: number }) {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const name = lang === 'gu' ? o.nameGu : o.nameEn;
  const moved = o.indiaDate && o.indiaDate !== o.date;
  // A sampradaya's Ekadashi: its own day, and the Parana its mandir prints.
  const sect = o.kind === 'ekadashi' && prefs.sampradaya !== 'smarta' ? s[`sampradaya_${prefs.sampradaya}` as const] : null;
  const paranaText = o.parana
    ? `${longDate(o.parana.date, lang, false)} ${o.parana.end ? `${o.parana.start}–${o.parana.end}` : s.paranaAfter(o.parana.start)}`
    : null;
  return (
    <Card>
      <T kind="label">{longDate(o.date, lang)}</T>
      <T kind="heading">{name}</T>
      {o.popular ? <T kind="small">{o.popular[lang]}</T> : null}
      {moved ? <T kind="small">{sect ? s.keptBySampradaya(sect, longDate(o.indiaDate!, lang, false)) : s.keptHere(longDate(o.indiaDate!, lang, false))}</T> : null}
      {/* Abroad only: festival dates are not localised yet (the website says the same beside the row). */}
      {o.reason === 'festival-bound' ? <T kind="small">{s.festivalIndiaDate}</T> : null}
      {paranaText ? <T kind="value" color={c.good}>{s.parana}: {paranaText}</T> : null}
      {sect && !o.parana ? <T kind="small">{s.paranaMandir}</T> : null}
      {o.moonrise ? <T kind="value" color={c.good}>{s.moonrise}: {o.moonrise.time}</T> : null}
      {o.window ? <T kind="value" color={c.good}>{o.kind === 'pradosh' ? s.pradoshKaal : s.nishita}: {o.window.start}–{o.window.end}</T> : null}
      {/* Parana or moonrise within eight hours: the Lock Screen countdown. */}
      <LiveCountdownButton countdown={vratCountdown(o, lang, prefs.place!.timezone)} nowMs={nowMs} />
      {calendarSupported ? (
        <View style={{ alignSelf: 'flex-start' }}>
          <Button
            kind="quiet"
            compact
            icon="calendar.badge.plus"
            label={s.addToCalendar}
            onPress={() => addAllDayEvent({
              date: o.date,
              title: paranaText ? `${name} · ${s.parana} ${paranaText}` : name,
              notes: paranaText ? `${s.parana}: ${paranaText}` : undefined,
            })}
          />
        </View>
      ) : null}
    </Card>
  );
}
