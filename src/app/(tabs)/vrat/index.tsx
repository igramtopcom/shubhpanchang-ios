// Vrat: the coming fasts at the place, each with when it may be broken.
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { Button, Card, Loading, Notice, Screen, Section, T, useColors } from '@/components/ui';
import { feedUrl } from '@/lib/api';
import { addAllDayEvent, calendarSupported, subscribe } from '@/lib/calendar';
import { longDate, t } from '@/lib/i18n';
import { success } from '@/lib/haptics';
import { shiftDate, zonedTimeToUtc } from '@/lib/time';
import { PARANA_OFFER_MS, paranaActivity } from '@/lib/widget-feed';
import type { Observance } from '@/lib/types';
import { useApp } from '@/state/app';
import { useNow, useObservances } from '@/state/data';
import ParanaActivity from '@/widgets/parana-activity';

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

  return (
    <Screen header onRefresh={obs.reload} refreshing={obs.loading && !!obs.data}>
      <Card>
        <T kind="small">{s.feedNote}</T>
        <Button kind="quiet" label={s.subscribeFeed} onPress={() => subscribe(feedUrl(place, lang))} />
      </Card>
      {obs.stale ? <Notice text={s.offline} /> : null}
      {obs.error && !obs.data ? <Notice text={s.loadError} onRetry={obs.reload} retryLabel={s.retry} /> : null}
      {obs.loading && !obs.data ? <Loading /> : null}
      {obs.data && !list.length ? <T kind="small">{s.noVratSoon}</T> : null}
      <Section title={s.upcomingVrat}>
        {list.map(o => <VratCard key={`${o.kind}${o.date}`} o={o} nowMs={zonedTimeToUtc(now.date, now.minutes, place.timezone).getTime()} />)}
      </Section>
    </Screen>
  );
}

function VratCard({ o, nowMs }: { o: Observance; nowMs: number }) {
  const { prefs } = useApp();
  const [tracking, setTracking] = useState(false);
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const name = lang === 'gu' ? o.nameGu : o.nameEn;
  const moved = o.indiaDate && o.indiaDate !== o.date;
  const paranaText = o.parana
    ? `${longDate(o.parana.date, lang, false)} ${o.parana.end ? `${o.parana.start}–${o.parana.end}` : s.paranaAfter(o.parana.start)}`
    : null;
  // Within eight hours of the Parana (a Live Activity's limit), offer the Lock Screen countdown.
  const live = Platform.OS === 'ios' ? paranaActivity(o, lang, prefs.place!.timezone) : null;
  const offerLive = !!live && nowMs < live.endMs && live.startMs - nowMs <= PARANA_OFFER_MS;
  const startLive = () => {
    if (!live) return;
    try {
      for (const a of ParanaActivity.getInstances()) a.end('immediate').catch(() => {});
      ParanaActivity.start(live, live.url, new Date(live.endMs));
      setTracking(true);
      success();
    } catch { /* Live Activities switched off in Settings */ }
  };
  return (
    <Card>
      <T kind="label">{longDate(o.date, lang)}</T>
      <T kind="heading">{name}</T>
      {o.popular ? <T kind="small">{o.popular[lang]}</T> : null}
      {moved ? <T kind="small">{s.keptHere(longDate(o.indiaDate!, lang, false))}</T> : null}
      {/* Abroad only: festival dates are not localised yet (the website says the same beside the row). */}
      {o.reason === 'festival-bound' ? <T kind="small">{s.festivalIndiaDate}</T> : null}
      {paranaText ? <T kind="value" color={c.good}>{s.parana}: {paranaText}</T> : null}
      {o.moonrise ? <T kind="value" color={c.good}>{s.moonrise}: {o.moonrise.time}</T> : null}
      {o.window ? <T kind="value" color={c.good}>{o.kind === 'pradosh' ? s.pradoshKaal : s.nishita}: {o.window.start}–{o.window.end}</T> : null}
      {offerLive ? (
        tracking
          ? <T kind="small" color={c.good}>{s.paranaTracking}</T>
          : <Button label={s.trackParana} onPress={startLive} />
      ) : null}
      {calendarSupported ? (
        <View style={{ alignSelf: 'flex-start' }}>
          <Button
            kind="quiet"
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
