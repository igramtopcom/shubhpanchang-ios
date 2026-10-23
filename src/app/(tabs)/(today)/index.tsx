// Today: the answer first ("is now a good time, until when, else when next"),
// then what is coming, then the sun and the day's kaals. ?date=YYYY-MM-DD shows
// another day (from the calendar, or the ‹ › by the date); "આજે" comes back.
import { useMemo, type ReactNode } from 'react';
import { Pressable, Share, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { headerButtons } from '@/components/glass';
import { LiveCountdownButton } from '@/components/live-countdown';
import { Moon, Ribbon, RibbonKey, SunArc } from '@/components/sky';
import { DayStep, dayTithi } from '@/components/day-step';
import { Card, DateTile, Fact, Kind, List, ListRow, Loading, Notice, Screen, Section, T, useColors } from '@/components/ui';
import { clock, clockRange, shortDate, shortWeekday, wallTime } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { chogName, longDate, placeName, t, tithiName } from '@/lib/i18n';
import { shareMessage } from '@/lib/share';
import { shubhNow, timeline, type Slot, type Span } from '@/lib/shubh';
import { DAY_MIN, daysBetween, shiftDate, toMinutes, zonedTimeToUtc } from '@/lib/time';
import { upcoming, type UpcomingItem } from '@/lib/upcoming';
import { rahuCountdown } from '@/lib/widget-feed';
import type { Lang, PanchangDay } from '@/lib/types';
import { useApp } from '@/state/app';
import { useDay, useFamilyNext, useFestivals, useNow, useObservances } from '@/state/data';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
/** The API's panchang runs from 2025 to 2030. */
const FIRST = '2025-01-02', LAST = '2030-12-30';

export default function Today() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const place = prefs.place!;
  const now = useNow(place.timezone);
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date && DATE_RE.test(params.date) ? params.date : now.date;
  const isToday = date === now.date;
  const { day, next, prev, loading, error, stale, reload } = useDay(date);

  const obs = useObservances(now.date, shiftDate(now.date, 45));
  const fest = useFestivals(now.date, shiftDate(now.date, 45));
  const fam = useFamilyNext(now.date);

  const tl = useMemo(() => (day ? timeline([prev, day, next].filter(Boolean) as PanchangDay[], date) : null), [prev, day, next, date]);
  const sh = tl && isToday ? shubhNow(tl, now.minutes) : null;
  const daySlots = tl ? tl.slots.filter(x => x.period === 'day' && x.start >= 0 && x.start < DAY_MIN) : [];
  const rahuToday = tl ? tl.rahu.find(r => r.start >= 0 && r.start < DAY_MIN) ?? null : null;
  const items = upcoming(obs.data, fest.data, fam.data, prefs.notify.kinds, now.date, lang, prefs.clock24).slice(0, 4);

  const go = (d: string) => router.setParams({ date: d === now.date ? undefined : d });
  const share = () => { if (day) { tick(); Share.share({ message: shareMessage(day, place, lang) }).catch(() => {}); } };

  return (
    <Screen header onRefresh={() => { reload(); obs.reload(); fest.reload(); }} refreshing={loading && !!day}>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerLeft: () => (
            <Pressable
              onPress={() => router.push('/place')}
              accessibilityRole="button"
              accessibilityLabel={`${s.settingsPlace}: ${placeName(place, lang)}`}
              hitSlop={6}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 6, minHeight: 36 }}>
              <SymbolView name="location.fill" size={13} tintColor={c.brand} />
              <T style={{ fontWeight: '600', fontSize: 15.5 }}>{placeName(place, lang)}</T>
              <SymbolView name="chevron.down" size={10} weight="semibold" tintColor={c.textMuted} />
            </Pressable>
          ),
          ...headerButtons([
            ...(isToday ? [] : [{ icon: 'arrow.uturn.backward' as const, label: s.backToToday, text: s.today, onPress: () => go(now.date) }]),
            { icon: 'square.and.arrow.up', label: s.shareToday, onPress: share },
            { icon: 'gearshape', label: s.tabSettings, onPress: () => router.push('/settings') },
          ], c.text),
        }}
      />

      <DayStep date={date} lang={lang} onPrev={date > FIRST ? () => go(shiftDate(date, -1)) : undefined} onNext={date < LAST ? () => go(shiftDate(date, 1)) : undefined}
        sub={isToday ? (day ? `${s.samvatShort} ${day.vikramSamvat}` : '') : s.relDays(daysBetween(now.date, date))} today={isToday} />

      {stale ? <Notice text={s.offline} /> : null}
      {error && !day ? <Notice text={s.loadError} onRetry={reload} retryLabel={s.retry} /> : null}
      {loading && !day ? <Loading /> : null}

      {day ? (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Moon tithi={day.tithi.index} />
            <View style={{ flex: 1 }}>
              <T kind="serif">{dayTithi(day, lang)}</T>
              <T kind="small">{s.tithiThen(clock(wallTime(day.tithi.endTime), lang, prefs.clock24, true), tithiName((day.tithi.index + 1) % 30, lang), !!day.tithi.endDayOffset || toMinutes(day.tithi.endTime) >= DAY_MIN)}</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Fact label={s.nakshatra} value={lang === 'gu' ? day.nakshatra.nameGu : day.nakshatra.name} />
            <Fact label={s.yoga} value={lang === 'gu' ? day.yoga.nameGu : day.yoga.name} />
            {(day.vrat?.items ?? []).map(v => (
              <Fact key={v.en} tone="good" value={`${lang === 'gu' ? v.gu : v.en}${v.time ? ` ${lang === 'gu' ? v.time.value.replace(/[\s\u00a0\u202f]*[AP]M/gi, '') : v.time.value.replace(/AM/g, 'am').replace(/PM/g, 'pm')}` : ''}`} />
            ))}
          </View>
        </View>
      ) : null}

      {day && tl ? (
        <NowCard sh={sh} slots={daySlots} rahu={rahuToday} now={isToday ? now.minutes : null} day={day} lang={lang} h24={prefs.clock24}
          onAll={() => router.push(`/choghadiya?date=${date}`)} />
      ) : null}

      {isToday && items.length ? (
        <Section title={s.comingUp} action={s.all} onAction={() => router.navigate('/vrat')}>
          <List>
            {items.map((it, i) => <UpcomingRow key={`${it.kind}${it.date}${it.title}`} it={it} first={i === 0} today={now.date} lang={lang} />)}
          </List>
        </Section>
      ) : null}

      {day ? (
        <Section title={s.sunAndMoon}>
          <Card style={{ paddingVertical: 14 }}>
            <SunArc progress={isToday ? (now.minutes - toMinutes(day.sunrise)) / (toMinutes(day.sunset) - toMinutes(day.sunrise)) : -1} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TimeCol label={s.sunrise} value={clock(day.sunrise, lang, prefs.clock24)} />
              <TimeCol label={s.moonrise} value={clock(day.moonrise, lang, prefs.clock24)} center />
              <TimeCol label={s.sunset} value={clock(day.sunset, lang, prefs.clock24)} right />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <Kaal label={s.rahuKaal} value={clockRange(day.rahuKaal.start, day.rahuKaal.end, lang, prefs.clock24)} tone={c.bad} />
              <Kaal label={s.abhijit} value={clockRange(day.abhijitMuhurta.start, day.abhijitMuhurta.end, lang, prefs.clock24)} tone={c.good} />
            </View>
            {isToday ? (
              <LiveCountdownButton
                kind="quiet"
                countdown={rahuCountdown(day, placeName(place, lang), lang, place.timezone, zonedTimeToUtc(now.date, now.minutes, place.timezone).getTime())}
                nowMs={zonedTimeToUtc(now.date, now.minutes, place.timezone).getTime()}
              />
            ) : null}
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}

function NowCard({ sh, slots, rahu, now, day, lang, h24, onAll }: {
  sh: ReturnType<typeof shubhNow> | null; slots: Slot[]; rahu: Span | null; now: number | null; day: PanchangDay; lang: Lang; h24: boolean; onAll: () => void;
}) {
  const s = t(lang);
  const c = useColors();
  const fmt = (m: number) => clock(hhmmOf(m), lang, h24);
  let head: ReactNode = null;
  if (sh) {
    const nextLine = sh.next ? `${chogName(sh.next.name, lang)} ${fmt(sh.next.start)} – ${fmt(sh.next.end)}` : null;
    if (sh.good) {
      head = (
        <>
          <State tone={c.good} soft={c.goodBg} text={`${s.goodNow} · ${chogName(sh.good.name, lang)}`} until={s.until(fmt(sh.good.end))} />
          {nextLine ? <Headline lead={s.then} big={nextLine} /> : null}
        </>
      );
    } else {
      const wait = sh.next && now !== null ? Math.max(0, Math.round(sh.next.start - now)) : null;
      head = (
        <>
          {sh.rahu
            ? <State tone={c.bad} text={s.inRahu} until={s.until(fmt(sh.rahu.end))} bar />
            : <State tone={c.neutral} soft={c.neutralBg} text={sh.slot ? `${s.notGoodNow} · ${chogName(sh.slot.name, lang)}` : s.notGoodNow} until={sh.slot ? s.until(fmt(sh.slot.end)) : ''} />}
          {nextLine ? <Headline lead={wait !== null ? `${s.nextGood}, ${s.inMinutes(wait)}` : s.nextGood} big={nextLine} /> : null}
        </>
      );
    }
  } else {
    head = <State tone={c.text} text={`${s.choghadiya} · ${longDate(day.date, lang).split(',')[0]}`} until="" />;
  }
  const noon = Math.round((toMinutes(day.sunrise) + toMinutes(day.sunset)) / 2);
  return (
    <Card style={{ gap: 6 }}>
      {head}
      <Ribbon slots={slots} rahu={rahu} now={now} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T kind="caption">{clock(day.sunrise, lang, h24)}</T>
        <T kind="caption">{lang === 'gu' ? s.noon : clock(hhmmOf(noon), lang, h24).replace(/:\d\d/, '')}</T>
        <T kind="caption">{clock(day.sunset, lang, h24)}</T>
      </View>
      <View style={{ height: 1, backgroundColor: c.line, marginVertical: 6 }} />
      <RibbonKey labels={{ good: s.keyGood, fair: s.keyFair, bad: s.keyBad, rahu: s.rahuKaal }} />
      <Pressable accessibilityRole="button" onPress={onAll} hitSlop={6} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
        <T style={{ color: c.brand, fontWeight: '600', fontSize: 14.5 }}>{s.allChoghadiya}</T>
        <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={c.brand} />
      </Pressable>
    </Card>
  );
}

const hhmmOf = (m: number) => {
  const x = ((Math.round(m) % DAY_MIN) + DAY_MIN) % DAY_MIN;
  return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
};

function State({ tone, soft, text, until, bar }: { tone: string; soft?: string; text: string; until: string; bar?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
        {bar
          ? <View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: tone }} />
          : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tone, borderWidth: soft ? 3 : 0, borderColor: soft, padding: 4 }} />}
        <T style={{ color: tone, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>{text}</T>
      </View>
      {until ? <T kind="small" style={{ fontVariant: ['tabular-nums'] }}>{until}</T> : null}
    </View>
  );
}

function Headline({ lead, big }: { lead: string; big: string }) {
  return (
    <View style={{ marginTop: 4 }}>
      <T kind="small" style={{ fontSize: 15 }}>{lead}</T>
      <T kind="big">{big}</T>
    </View>
  );
}

function UpcomingRow({ it, first, today, lang }: { it: UpcomingItem; first: boolean; today: string; lang: Lang }) {
  const s = t(lang);
  const near = daysBetween(today, it.date) < 7;
  const kind = it.kind === 'festival' ? <Kind label={s.kindFestival} tone="brand" /> : it.kind === 'vrat' ? <Kind label={s.kindVrat} tone="good" /> : <Kind label={s.kindFamily} tone="fair" />;
  return (
    <ListRow
      first={first}
      lead={<DateTile day={String(Number(it.date.slice(8)))} sub={near ? shortWeekday(it.date, lang) : shortDate(it.date, lang).split(' ')[1]} />}
      title={it.title}
      detail={it.detail}
      trailing={kind}
      onPress={() => router.push(it.href as never)}
      a11y={`${it.title}, ${longDate(it.date, lang)}`}
    />
  );
}

function TimeCol({ label, value, center, right }: { label: string; value: string; center?: boolean; right?: boolean }) {
  return (
    <View style={{ alignItems: center ? 'center' : right ? 'flex-end' : 'flex-start' }}>
      <T kind="value" style={{ fontSize: 16 }}>{value}</T>
      <T kind="caption">{label}</T>
    </View>
  );
}

function Kaal({ label, value, tone }: { label: string; value: string; tone: string }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, borderRadius: 14, backgroundColor: c.backgroundElement, paddingVertical: 9, paddingLeft: 13, paddingRight: 10, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 2, backgroundColor: tone }} />
      <T kind="caption">{label}</T>
      <T kind="value" style={{ fontSize: 15.5 }}>{value}</T>
    </View>
  );
}
