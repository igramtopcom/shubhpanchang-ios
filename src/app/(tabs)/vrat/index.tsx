// Vrat: the coming fasts at the place, each with when it may be broken.
import { View } from 'react-native';

import { LiveCountdownButton } from '@/components/live-countdown';
import { Button, Card, Loading, Notice, Screen, Section, T, useColors } from '@/components/ui';
import { feedUrl } from '@/lib/api';
import { addAllDayEvent, calendarSupported, subscribe } from '@/lib/calendar';
import { longDate, t } from '@/lib/i18n';
import { shiftDate, zonedTimeToUtc } from '@/lib/time';
import { vratCountdown } from '@/lib/widget-feed';
import type { Observance } from '@/lib/types';
import { useApp } from '@/state/app';
import { useNow, useObservances } from '@/state/data';

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
        <Button kind="quiet" icon="calendar.badge.plus" label={s.subscribeFeed} onPress={() => subscribe(feedUrl(place, lang))} />
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
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const name = lang === 'gu' ? o.nameGu : o.nameEn;
  const moved = o.indiaDate && o.indiaDate !== o.date;
  const paranaText = o.parana
    ? `${longDate(o.parana.date, lang, false)} ${o.parana.end ? `${o.parana.start}–${o.parana.end}` : s.paranaAfter(o.parana.start)}`
    : null;
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
