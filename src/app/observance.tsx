// One vrat (?kind=ekadashi&date=2026-11-05): which day to fast at the place,
// and when it may be broken. For Ekadashi a timeline from the tithi's start to
// Dwadashi's end with the Parana window in green; the reader's tradition set
// beside the others when it keeps the fast on another day; reminders for this
// vrat alone; and the katha and rules when the website has them.
import { useMemo } from 'react';
import { Share, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { BandCard, BandEyebrow, BandFigure, BandPill, BandTitle, CardTitle, WHITE2, useBand } from '@/components/band';
import { ActionBar, headerButtons } from '@/components/glass';
import { LiveCountdownButton } from '@/components/live-countdown';
import { Card, Cell, Group, Loading, Notice, Screen, T, useColors } from '@/components/ui';
import { addAllDayEvent, calendarSupported } from '@/lib/calendar';
import { clock, clockRange, shortDate, wallTime } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { longDate, placeName, t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import { DAY_MIN, daysBetween, hhmm, shiftDate, toMinutes, zonedTimeToUtc } from '@/lib/time';
import { vratCountdown } from '@/lib/widget-feed';
import { isVaishnava, type Lang, type Observance, type ObservanceKind, type PanchangDay } from '@/lib/types';
import { useApp } from '@/state/app';
import { useDays, useFestivalDetail, useNow, useObservances, useObservancesAs } from '@/state/data';

const TRADITIONS = ['smarta', 'swaminarayan', 'baps', 'pushtimarg'] as const;

export default function ObservanceScreen() {
  const { prefs, update } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const band = useBand('good');
  const place = prefs.place!;
  const now = useNow(place.timezone);
  const params = useLocalSearchParams<{ kind?: string; date?: string }>();
  const kind = (params.kind ?? 'ekadashi') as ObservanceKind;
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : now.date;
  const obs = useObservances(shiftDate(date, -1), shiftDate(date, 1));
  const o = obs.data?.find(x => x.kind === kind && x.date === date) ?? obs.data?.find(x => x.kind === kind) ?? null;
  const days = useDays(shiftDate(date, -2), 5);
  const slug = o ? `${o.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${date.slice(0, 4)}` : null;
  const write = useFestivalDetail(slug);
  const content = write.data?.content ?? null;

  const vaishnava = isVaishnava(prefs.sampradaya);
  const compare = kind === 'ekadashi';
  const sm = useObservancesAs(shiftDate(date, -3), shiftDate(date, 3), compare ? 'smarta' : null);
  const sw = useObservancesAs(shiftDate(date, -3), shiftDate(date, 3), compare ? 'swaminarayan' : null);
  const bp = useObservancesAs(shiftDate(date, -3), shiftDate(date, 3), compare ? 'baps' : null);
  const pm = useObservancesAs(shiftDate(date, -3), shiftDate(date, 3), compare ? 'pushtimarg' : null);
  const byTradition = useMemo(() => {
    if (!o) return [];
    const all = { smarta: sm.data, swaminarayan: sw.data, baps: bp.data, pushtimarg: pm.data };
    return TRADITIONS.map(tr => ({ tr, day: (all[tr] ?? []).find(x => x.kind === 'ekadashi' && x.nameEn === o.nameEn)?.date ?? null }));
  }, [o, sm.data, sw.data, bp.data, pm.data]);
  const smartaDay = byTradition.find(x => x.tr === 'smarta')?.day ?? null;
  const differs = byTradition.some(x => x.day && x.day !== byTradition[0]?.day);

  const eveId = `eve:${kind}:${date}`, paranaId = `parana:${date}`;
  const muted = new Set(prefs.notify.muted ?? []);
  const eveOn = prefs.notify.vratEve.on && !muted.has(eveId);
  const paranaOn = prefs.notify.parana && !muted.has(paranaId);
  const setReminder = async (id: string, on: boolean, which: 'eve' | 'parana') => {
    if (on) {
      if (notificationsSupported && !(await notificationPermission(true))) return;
      update({ notify: {
        ...prefs.notify,
        ...(which === 'eve' ? { vratEve: { ...prefs.notify.vratEve, on: true } } : { parana: true }),
        muted: [...muted].filter(x => x !== id),
      } });
    } else {
      update({ notify: { ...prefs.notify, muted: [...muted, id] } });
    }
  };

  if (!o) {
    return <Screen header>{obs.loading ? <Loading /> : <Notice text={s.loadError} onRetry={obs.reload} retryLabel={s.retry} />}</Screen>;
  }
  const name = lang === 'gu' ? o.nameGu : o.nameEn;
  const paranaText = o.parana ? (o.parana.end ? clockRange(o.parana.start, o.parana.end, lang, prefs.clock24) : s.paranaAfter(clock(o.parana.start, lang, prefs.clock24))) : null;
  const share = () => {
    tick();
    Share.share({ message: `${name} · ${longDate(o.date, lang)}${paranaText ? `\n${s.parana}: ${shortDate(o.parana!.date, lang, true)}, ${paranaText}` : ''}${o.moonrise ? `\n${s.moonrise}: ${clock(o.moonrise.time, lang)}` : ''}\n(${placeName(place, lang)})` }).catch(() => {});
  };
  const nowMs = zonedTimeToUtc(now.date, now.minutes, place.timezone).getTime();
  const soon = o.date >= now.date ? daysBetween(now.date, o.date) : null;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Stack.Screen options={headerButtons([{ icon: 'square.and.arrow.up', label: s.share, onPress: share }], c.text)} />
      <Screen header bottom={130} gap={16}>
        <BandCard band={band} id="obs">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <BandEyebrow>{s[`kind_${kind}` as 'kind_ekadashi']} · {longDate(o.date, lang)}</BandEyebrow>
            {soon !== null ? <BandPill text={soon === 0 ? s.today : s.relDays(soon)} /> : null}
          </View>
          <BandTitle size={32}>{name}</BandTitle>
          {o.popular ? <T style={{ color: WHITE2, fontSize: 14.5 }}>{o.popular[lang]}</T> : null}
          {o.parana ? <BandFigure label={`${s.parana} · ${shortDate(o.parana.date, lang, true)}`} value={paranaText!} />
            : o.moonrise ? <BandFigure label={`${s.moonrise} · ${shortDate(o.moonrise.date, lang, true)}`} value={clock(o.moonrise.time, lang, prefs.clock24, true)} />
              : o.window ? <BandFigure label={o.kind === 'pradosh' ? s.pradoshKaal : s.nishita} value={clockRange(o.window.start, o.window.end, lang, prefs.clock24, true)} /> : null}
        </BandCard>
        {content?.calendarContext ? <T kind="small" style={{ fontSize: 14.5, lineHeight: 21, marginHorizontal: 4 }}>{content.calendarContext[lang]}</T> : null}

        {compare && vaishnava && smartaDay && smartaDay !== o.date ? (
          <Notice tone="brand" icon="sparkles" text={s.traditionLater(s[`sampradayaShort_${prefs.sampradaya}` as 'sampradayaShort_baps'])} />
        ) : null}

        {kind === 'ekadashi' ? (
          <ParanaTimeline o={o} days={days.data ?? []} lang={lang} h24={prefs.clock24} city={placeName(place, lang)} countdown={<LiveCountdownButton kind="quiet" countdown={vratCountdown(o, lang, place.timezone)} nowMs={nowMs} />} />
        ) : (
          <KeyTimes o={o} days={days.data ?? []} lang={lang} h24={prefs.clock24} countdown={<LiveCountdownButton kind="quiet" countdown={vratCountdown(o, lang, place.timezone)} nowMs={nowMs} />} />
        )}

        {compare && differs ? (
          <Card style={{ paddingVertical: 4, gap: 0 }}>
            {byTradition.filter(x => x.day).map((x, i) => (
              <View key={x.tr} style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 }, i > 0 && { borderTopWidth: 0.5, borderTopColor: c.line }]}>
                <T style={{ fontSize: 15, color: x.tr === prefs.sampradaya ? c.brand : c.text, fontWeight: x.tr === prefs.sampradaya ? '600' : '400' }}>
                  {s[`sampradayaShort_${x.tr}` as 'sampradayaShort_baps']}{x.tr === prefs.sampradaya ? ` (${s.you})` : ''}
                </T>
                <T kind="value" style={{ fontSize: 15 }}>{shortDate(x.day!, lang, true)}</T>
              </View>
            ))}
          </Card>
        ) : null}

        {kind === 'ekadashi' && !vaishnava ? (
          <Notice tone="good" text={s.byTradition(s.sampradayaShort_smarta)} action={s.changeTradition} onAction={() => router.push('/settings')} />
        ) : null}

        <Group title={s.remindThis}>
          <Cell first icon="bell" tint={c.brand} label={s.eveBefore} sub={`${shortDate(shiftDate(o.date, -1), lang, true)} · ${clock(hhmm(prefs.notify.vratEve.minutes), lang, prefs.clock24, true)}`}
            toggle={eveOn} onToggle={v => setReminder(eveId, v, 'eve')} disabled={!notificationsSupported} />
          {o.parana ? (
            <Cell icon="clock" tint={c.good} label={s.whenParanaBegins} sub={`${shortDate(o.parana.date, lang, true)} · ${clock(o.parana.start, lang, prefs.clock24)}`}
              toggle={paranaOn} onToggle={v => setReminder(paranaId, v, 'parana')} disabled={!notificationsSupported} />
          ) : null}
        </Group>

        {content?.story ? (
          <Card style={{ gap: 8 }}>
            <CardTitle>{content.story.heading[lang]}</CardTitle>
            {content.story.paragraphs.map((p, i) => <T key={i} style={{ fontSize: 15, lineHeight: 24 }}>{p[lang]}</T>)}
          </Card>
        ) : null}
        {content?.fasting?.rules.length ? (
          <Card style={{ gap: 8 }}>
            <CardTitle>{content.fasting.heading?.[lang] ?? s.fastingRules}</CardTitle>
            {content.fasting.rules.map((r, i) => <T key={i} style={{ fontSize: 15, lineHeight: 22 }}>• {r[lang]}</T>)}
          </Card>
        ) : null}
        {kind === 'ekadashi' || kind === 'sankashti' ? <T kind="caption" style={{ marginHorizontal: 6 }}>{s.fastingHealth}</T> : null}
      </Screen>
      <ActionBar actions={[
        ...(calendarSupported ? [{ icon: 'calendar.badge.plus' as const, label: s.addToCalendar, primary: true, onPress: () => addAllDayEvent({ date: o.date, title: paranaText ? `${name} · ${s.parana} ${paranaText}` : name, notes: paranaText ? `${s.parana}: ${shortDate(o.parana!.date, lang)}, ${paranaText}` : undefined }) }] : []),
        { icon: eveOn || paranaOn ? 'bell.fill' : 'bell', label: eveOn || paranaOn ? s.reminderOn : s.remindMe, on: eveOn || paranaOn,
          onPress: () => { const on = !(eveOn || paranaOn); setReminder(eveId, on, 'eve'); if (o.parana) setTimeout(() => setReminder(paranaId, on, 'parana'), 0); } },
        { icon: 'square.and.arrow.up', label: s.share, onPress: share },
      ]} />
    </View>
  );
}

/** Where a tithi ends: the day it ends on, from the sunrise day that holds it. */
function tithiEnd(day: PanchangDay): { date: string; time: string } {
  // "24:00" is midnight: the start of the next day.
  const over = toMinutes(day.tithi.endTime) >= DAY_MIN;
  return { date: shiftDate(day.date, day.tithi.endDayOffset + (over ? 1 : 0)), time: over ? hhmm(toMinutes(day.tithi.endTime) - DAY_MIN) : day.tithi.endTime };
}

function ParanaTimeline({ o, days, lang, h24, city, countdown }: { o: Observance; days: PanchangDay[]; lang: Lang; h24: boolean; city: string; countdown: React.ReactNode }) {
  const s = t(lang);
  const c = useColors();
  const fast = days.find(d => d.date === o.date) ?? null;
  // The Ekadashi tithi (10 or 25), from the fast day or the day before (a Vaishnava fast falls on Dwadashi's sunrise).
  const ekIdx: number | null = fast && (fast.tithi.index === 10 || fast.tithi.index === 25) ? fast.tithi.index
    : days.find(d => d.tithi.index === 10 || d.tithi.index === 25)?.tithi.index ?? null;
  const dashami = ekIdx !== null ? days.find(d => d.tithi.index === ekIdx - 1) : undefined;
  const ekDay = ekIdx !== null ? days.find(d => d.tithi.index === ekIdx) : undefined;
  const dwDay = ekIdx !== null ? days.find(d => d.tithi.index === ekIdx + 1) : undefined;
  const ekStart = dashami ? tithiEnd(dashami) : null;
  const ekEnd = ekDay ? tithiEnd(ekDay) : null;
  const dwEnd = dwDay ? tithiEnd(dwDay) : null;
  // Hari Vasara: the first quarter of Dwadashi.
  const minutesOf = (x: { date: string; time: string }, base: string) => (Date.parse(`${x.date}T00:00:00Z`) - Date.parse(`${base}T00:00:00Z`)) / 60000 + toMinutes(x.time);
  const hariEnd = ekEnd && dwEnd ? (() => {
    const a = minutesOf(ekEnd, ekEnd.date), b = minutesOf(dwEnd, ekEnd.date);
    const m = a + (b - a) / 4;
    return { date: shiftDate(ekEnd.date, Math.floor(m / DAY_MIN)), time: hhmm(m) };
  })() : null;
  const at = (x: { date: string; time: string }) => `${shortDate(x.date, lang, true)} · ${clock(x.time, lang, h24, true)}`;
  const steps: { label: string; when: string; kind?: 'fast' | 'on'; big?: string }[] = [
    ...(ekStart ? [{ label: s.ekadashiBegins, when: at(ekStart) }] : []),
    { label: s.fastDay, when: `${shortDate(o.date, lang, true)}${fast ? ` · ${s.sunrise} ${clock(fast.sunrise, lang, h24)}` : ''}`, kind: 'fast' as const },
    ...(hariEnd && o.parana ? [{ label: s.hariVasaraEnds, when: at(hariEnd) }] : []),
    ...(o.parana ? [{ label: s.parana, when: shortDate(o.parana.date, lang, true), kind: 'on' as const, big: o.parana.end ? clockRange(o.parana.start, o.parana.end, lang, h24) : s.paranaAfter(clock(o.parana.start, lang, h24)) }] : []),
    ...(dwEnd ? [{ label: s.dwadashiEnds, when: at(dwEnd) }] : []),
  ];
  return (
    <Card style={{ gap: 12 }}>
      <CardTitle sub={city}>{s.fastAndParana}</CardTitle>
      <View style={{ paddingLeft: 22 }}>
        <View style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, backgroundColor: c.line }} />
        {steps.map((st, i) => (
          <View key={st.label} style={{ paddingBottom: i < steps.length - 1 ? 14 : 0 }}>
            <View style={{ position: 'absolute', left: -22, top: 4, width: 12, height: 12, borderRadius: 6,
              backgroundColor: st.kind === 'fast' ? c.brand : st.kind === 'on' ? c.good : c.card,
              borderWidth: st.kind ? 0 : 2, borderColor: c.textMuted }} />
            <T style={{ fontWeight: '600', fontSize: 15 }}>{st.label}</T>
            <T kind="small" style={{ fontVariant: ['tabular-nums'] }}>{st.when}</T>
            {st.big ? (
              <View style={{ backgroundColor: c.goodBg, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, marginTop: 6 }}>
                <T style={{ fontSize: 22, fontWeight: '600', color: c.good, fontVariant: ['tabular-nums'] }}>{st.big}</T>
              </View>
            ) : null}
          </View>
        ))}
      </View>
      {!o.parana ? <T kind="small">{s.paranaMandir}</T> : null}
      {countdown}
    </Card>
  );
}

function KeyTimes({ o, days, lang, h24, countdown }: { o: Observance; days: PanchangDay[]; lang: Lang; h24: boolean; countdown: React.ReactNode }) {
  const s = t(lang);
  const c = useColors();
  const day = days.find(d => d.date === o.date) ?? null;
  const rows: [string, string][] = [];
  if (day) rows.push([s.sunrise, clock(day.sunrise, lang, h24)]);
  if (o.moonrise) rows.push([s.moonrise, `${shortDate(o.moonrise.date, lang)} · ${clock(o.moonrise.time, lang, h24, true)}`]);
  if (o.window) rows.push([o.kind === 'pradosh' ? s.pradoshKaal : s.nishita, clockRange(o.window.start, o.window.end, lang, h24)]);
  if (day) rows.push([s.tithiWord, `${lang === 'gu' ? day.tithi.nameGu : day.tithi.name} · ${s.until(clock(wallTime(day.tithi.endTime), lang, h24, true))}`]);
  return (
    <Card style={{ gap: 0 }}>
      {rows.map(([a, b], i) => (
        <View key={a} style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: 12 }, i > 0 && { borderTopWidth: 0.5, borderTopColor: c.line }]}>
          <T kind="small">{a}</T>
          <T kind="value" style={{ fontSize: 15, flexShrink: 1, textAlign: 'right' }}>{b}</T>
        </View>
      ))}
      {o.moonrise ? <T kind="small" style={{ paddingTop: 8 }}>{s.moonriseNote}</T> : null}
      {countdown}
    </Card>
  );
}
