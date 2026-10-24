// Today (docs/design/11-today-v5, from what the website's readers search for):
// the day's tithi, then one coloured card that answers "which choghadiya is it,
// is it good, until when, and what comes next", by the choghadiya's own name.
// On a big festival the festival leads that card; after sunset tomorrow's good
// times follow it. Then what is coming, and the day at a glance.
// ?date=YYYY-MM-DD shows another day (from the calendar, or the ‹ › by the
// date): its good times stand where "now" would; "આજે" comes back.
import { useMemo, type ReactNode } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { BandCard, CREAM, DateLine, GOLD, Head, MoreRow, SOFT, WHITE, WHITE2, useBand, type Band } from '@/components/band';
import { headerButtons } from '@/components/glass';
import { LiveCountdownButton } from '@/components/live-countdown';
import { Diya, MoonRing, SunArc } from '@/components/sky';
import { dayTithi } from '@/components/day-step';
import { Card, Fact, Loading, Notice, Screen, T, shadow, useColors } from '@/components/ui';
import { TitleFont } from '@/constants/theme';
import { clock, clockRange, shortDate, shortWeekday, wallTime } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { chogName, longDate, placeName, t, tithiName } from '@/lib/i18n';
import { goodRuns, nowView, type GoodRun, type NowView } from '@/lib/now-view';
import { shareMessage } from '@/lib/share';
import { timeline } from '@/lib/shubh';
import { DAY_MIN, daysBetween, hhmm, shiftDate, toMinutes, zonedTimeToUtc } from '@/lib/time';
import { upcoming, type UpcomingItem } from '@/lib/upcoming';
import { rahuCountdown, type CountdownProps } from '@/lib/widget-feed';
import type { Festival, FestivalDetail, Lang, PanchangDay, TimeRange } from '@/lib/types';
import { useApp } from '@/state/app';
import { useDay, useFamilyNext, useFestivalDetail, useFestivals, useNow, useObservances } from '@/state/data';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
/** The API's panchang runs from 2025 to 2030. */
const FIRST = '2025-01-02', LAST = '2030-12-30';
/** The page's side padding (ui.tsx Screen), for the strip that runs to the edges. */
const EDGE = 18;

export default function Today() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const h24 = prefs.clock24;
  const s = t(lang);
  const c = useColors();
  const bands = { good: useBand('good'), rahu: useBand('rahu'), fair: useBand('fair'), fest: useBand('fest') };
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
  const view = tl && isToday ? nowView(tl, now.minutes) : null;
  const dayRuns = useMemo(() => (day && tl ? goodRuns(tl, toMinutes(day.sunrise), toMinutes(day.sunset)) : []), [day, tl]);
  const tomorrowRuns = useMemo(() => (next ? goodRuns(timeline([next], next.date), toMinutes(next.sunrise), toMinutes(next.sunset)) : []), [next]);
  const evening = isToday && !!day && !!next && now.minutes >= toMinutes(day.sunset);
  // A big festival on the day leads the card (Diwali, with its puja muhurat).
  const lead = (fest.data ?? []).filter(f => f.date === date && f.type === 'major');
  const leadDetail = useFestivalDetail(lead[0]?.slug ?? null);
  const items = upcoming(obs.data, fest.data, fam.data, prefs.notify.kinds, now.date, lang, h24).slice(0, 6);
  const nowMs = zonedTimeToUtc(now.date, now.minutes, place.timezone).getTime();
  const countdown = day && isToday ? rahuCountdown(day, placeName(place, lang), lang, place.timezone, nowMs) : null;

  const go = (d: string) => router.setParams({ date: d === now.date ? undefined : d });
  const share = () => { if (day) { tick(); Share.share({ message: shareMessage(day, place, lang) }).catch(() => {}); } };
  const allChog = () => router.push(`/choghadiya?date=${date}`);

  return (
    <Screen header onRefresh={() => { reload(); obs.reload(); fest.reload(); }} refreshing={loading && !!day} gap={22}>
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

      <Masthead date={date} day={day} lang={lang} h24={h24} rel={isToday ? '' : s.relDays(daysBetween(now.date, date))}
        onPrev={date > FIRST ? () => go(shiftDate(date, -1)) : undefined} onNext={date < LAST ? () => go(shiftDate(date, 1)) : undefined} />

      {stale ? <Notice text={s.offline} /> : null}
      {error && !day ? <Notice text={s.loadError} onRetry={reload} retryLabel={s.retry} /> : null}
      {loading && !day ? <Loading /> : null}

      {day && lead.length ? (
        <FestivalCard fests={lead} detail={leadDetail.data?.festival.slug === lead[0].slug ? leadDetail.data : null} band={bands.fest}
          nowMin={isToday ? now.minutes : null} view={view} lang={lang} h24={h24} onAll={allChog} />
      ) : view ? (
        <NowCard v={view} nowMin={now.minutes} band={view.kind === 'good' ? bands.good : view.kind === 'rahu' ? bands.rahu : bands.fair}
          lang={lang} h24={h24} onAll={allChog} countdown={view.kind === 'rahu' ? countdown : null} nowMs={nowMs} />
      ) : day ? (
        <GoodTimes title={s.goodTimes} sub={longDate(date, lang)} runs={dayRuns} rahu={day.rahuKaal} lang={lang} h24={h24} onAll={allChog} />
      ) : null}
      {day && lead.length && !isToday ? (
        <GoodTimes title={s.goodTimes} sub={longDate(date, lang)} runs={dayRuns} rahu={day.rahuKaal} lang={lang} h24={h24} onAll={allChog} />
      ) : null}

      {evening && next ? (
        <GoodTimes title={s.goodTomorrow} sub={`${shortWeekday(next.date, lang)}, ${shortDate(next.date, lang)}`} runs={tomorrowRuns} rahu={next.rahuKaal} lang={lang} h24={h24}
          onAll={() => router.push(`/choghadiya?date=${next.date}`)} />
      ) : null}

      {isToday && items.length ? (
        <View style={{ gap: 10 }}>
          <Head title={s.comingUp} action={s.all} onAction={() => router.navigate('/vrat')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -EDGE }}
            contentContainerStyle={{ paddingHorizontal: EDGE, paddingBottom: 6, gap: 10 }}>
            {items.map(it => <UpcomingCard key={`${it.kind}${it.date}${it.title}`} it={it} today={now.date} lang={lang} />)}
          </ScrollView>
        </View>
      ) : null}

      {day ? (
        <View style={{ gap: 10 }}>
          <Head title={isToday ? s.dayToday : s.dayOther} />
          <DayCard day={day} lang={lang} h24={h24}
            progress={isToday ? (now.minutes - toMinutes(day.sunrise)) / (toMinutes(day.sunset) - toMinutes(day.sunrise)) : -1}
            countdown={isToday && view?.kind !== 'rahu' ? countdown : null} nowMs={nowMs} />
        </View>
      ) : null}
    </Screen>
  );
}

/** The day: its date with ‹ ›, the tithi in the serif with the moon, when the tithi turns, and the day's vrats. */
function Masthead({ date, day, lang, h24, rel, onPrev, onNext }: {
  date: string; day: PanchangDay | null; lang: Lang; h24: boolean; rel: string; onPrev?: () => void; onNext?: () => void;
}) {
  const s = t(lang);
  const turns = day ? s.tithiThen(clock(wallTime(day.tithi.endTime), lang, h24, true), tithiName((day.tithi.index + 1) % 30, lang), !!day.tithi.endDayOffset || toMinutes(day.tithi.endTime) >= DAY_MIN) : '';
  const vrats = day?.vrat?.items ?? [];
  return (
    <View style={{ gap: 2 }}>
      <DateLine date={date} lang={lang} rel={rel} onPrev={onPrev} onNext={onNext} />
      {day ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <T kind="serif" style={{ flex: 1, fontSize: lang === 'gu' ? 30 : 27, lineHeight: lang === 'gu' ? 42 : 33 }}>{dayTithi(day, lang)}</T>
            <MoonRing tithi={day.tithi.index} />
          </View>
          <T kind="small" style={{ fontSize: 14.5 }}>{turns} · {s.samvatShort} {day.vikramSamvat}</T>
          {vrats.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {vrats.map(v => (
                <Fact key={v.en} tone="good" value={`${lang === 'gu' ? v.gu : v.en}${v.time ? ` ${lang === 'gu' ? v.time.value.replace(/[\s  ]*[AP]M/gi, '') : v.time.value.replace(/AM/g, 'am').replace(/PM/g, 'pm')}` : ''}`} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}


/** Which choghadiya it is now, by name, whether it is good, until when; then the three after it. */
function NowCard({ v, nowMin, band, lang, h24, onAll, countdown, nowMs }: {
  v: NowView; nowMin: number; band: Band; lang: Lang; h24: boolean; onAll: () => void; countdown: CountdownProps | null; nowMs: number;
}) {
  const s = t(lang);
  const name = v.kind === 'rahu' ? s.rahuKaal : chogName(v.slot!.name, lang);
  const verdict = v.kind === 'good' ? s.verdict_good : v.kind === 'fair' ? s.verdict_fair : s.verdict_avoid;
  const use = v.kind === 'rahu'
    ? (v.slot ? s.chogOf(chogName(v.slot.name, lang)) : '')
    : v.kind === 'avoid' ? s.chogUseLater : s[`chogUse_${v.slot!.name}` as 'chogUse_Amrit'];
  const at = clock(hhmm(nowMin), lang, h24, true);
  const progress = Math.max(0, Math.min(1, (nowMin - v.start) / Math.max(1, v.end - v.start)));
  return (
    <BandCard band={band} id="now" below={(
      <>
        {v.next.length ? (
          <View style={{ paddingTop: 10, paddingBottom: 2 }}>
            <T kind="caption" style={{ paddingHorizontal: 18, paddingBottom: 2 }}>{s.then}</T>
            {v.next.map((x, i) => <NextRow key={x.start} name={x.name} start={x.start} end={x.end} first={i === 0} lang={lang} h24={h24} />)}
          </View>
        ) : null}
        <MoreRow label={s.allChoghadiya} onPress={onAll} />
      </>
    )}>
      <T style={{ color: WHITE2, fontSize: 13.5, fontWeight: '500' }}>{v.kind === 'rahu' ? s.nowLabel : s.chogNow} · {at}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }} accessible accessibilityLabel={`${name}, ${verdict}`}>
        <T style={{ fontFamily: TitleFont[lang], fontSize: 36, lineHeight: lang === 'gu' ? 50 : 44, color: WHITE }}>{name}</T>
        <View style={{ borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 10, paddingVertical: 2 }}>
          <T style={{ color: WHITE, fontSize: 14, fontWeight: '600' }}>{verdict}</T>
        </View>
      </View>
      {use ? <T style={{ color: WHITE2, fontSize: 14.5 }}>{use}</T> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12, gap: 8 }}>
        <T style={{ color: WHITE, fontSize: 15.5, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{s.until(clock(hhmm(v.end), lang, h24, true))}</T>
        <T style={{ color: WHITE2, fontSize: 13.5, fontVariant: ['tabular-nums'] }}>{s.minLeft(Math.max(0, Math.round(v.end - nowMin)))}</T>
      </View>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.26)', marginTop: 8, overflow: 'hidden' }}>
        <View style={{ width: `${progress * 100}%`, height: 4, borderRadius: 2, backgroundColor: WHITE }} />
      </View>
      {countdown ? <View style={{ marginTop: 13 }}><LiveCountdownButton kind="onColor" countdown={countdown} nowMs={nowMs} /></View> : null}
    </BandCard>
  );
}

/** One choghadiya to come: a dot in its tone, its name, its time, and good / neutral / avoid. */
function NextRow({ name, start, end, first, lang, h24 }: { name: string; start: number; end: number; first: boolean; lang: Lang; h24: boolean }) {
  const s = t(lang);
  const c = useColors();
  const tier = name === 'Amrit' || name === 'Shubh' || name === 'Labh' ? 'good' : name === 'Char' ? 'fair' : 'avoid';
  const tone = tier === 'good' ? c.good : tier === 'fair' ? c.neutral : c.bad;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, paddingHorizontal: 18 }, !first && { borderTopWidth: 0.5, borderTopColor: c.line }]}
      accessible accessibilityLabel={`${chogName(name, lang)}, ${clockRange(hhmm(start), hhmm(end), lang, h24)}, ${s[`verdict_${tier}`]}`}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tier === 'fair' ? c.fair : tone, borderWidth: tier === 'fair' ? 1.5 : 0, borderColor: c.neutral }} />
      <T style={{ fontSize: 16, fontWeight: '600', minWidth: 62 }}>{chogName(name, lang)}</T>
      <T style={{ flex: 1, fontSize: 15, fontVariant: ['tabular-nums'] }} numberOfLines={1}>{clockRange(hhmm(start), hhmm(end), lang, h24)}</T>
      <T style={{ fontSize: 13, fontWeight: '600', color: tone }}>{s[`verdict_${tier}`]}</T>
    </View>
  );
}


/** A big festival leads: its name, a diya, the puja muhurat when it has one; now shrinks to two lines under it. */
function FestivalCard({ fests, detail, band, nowMin, view, lang, h24, onAll }: {
  fests: Festival[]; detail: FestivalDetail | null; band: Band; nowMin: number | null; view: NowView | null; lang: Lang; h24: boolean; onAll: () => void;
}) {
  const s = t(lang);
  const f = fests[0];
  const pick = (x: { nameGu: string; nameEn: string }) => (lang === 'gu' ? x.nameGu : x.nameEn);
  const m = detail?.muhurat ?? null;
  const ms = m ? toMinutes(m.start) : -1, me = m ? toMinutes(m.end) : -1;
  const when = m && nowMin !== null ? (nowMin < ms ? ` · ${s.inMinutes(ms - nowMin)}` : nowMin < me || me < ms ? ` · ${s.nowLabel}` : '') : '';
  const gold = GOLD, cream = CREAM, soft = SOFT;
  return (
    <BandCard band={band} id="fest" below={(
      <>
        {view ? <NowLines v={view} nowMin={nowMin!} lang={lang} h24={h24} /> : null}
        <MoreRow label={s.allChoghadiya} onPress={onAll} />
      </>
    )}>
      <Pressable accessibilityRole="button" accessibilityLabel={pick(f)} onPress={() => router.push(`/festival?slug=${encodeURIComponent(f.slug)}`)}>
        <View style={{ position: 'absolute', right: -4, top: -4 }}><Diya size={72} /></View>
        <T style={{ color: gold, fontSize: 13.5, fontWeight: '500' }}>{nowMin !== null ? s.festivalToday : s.festivalOn}</T>
        <T style={{ fontFamily: TitleFont[lang], fontSize: 38, lineHeight: lang === 'gu' ? 54 : 46, color: cream, paddingRight: 70 }}>{pick(f)}</T>
        {!m && f.about ? <T style={{ color: soft, fontSize: 14.5, paddingRight: 60 }} numberOfLines={2}>{f.about[lang]}</T> : null}
        {fests.length > 1 ? <T style={{ color: soft, fontSize: 14, marginTop: 2 }}>+ {fests.slice(1).map(pick).join(' · ')}</T> : null}
        {m ? (
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(239,199,122,0.28)' }}>
            <T style={{ color: gold, fontSize: 13, fontWeight: '500' }}>{m.label[lang]}{when}</T>
            <T style={{ color: cream, fontSize: 23, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{clockRange(m.start, m.end, lang, h24, true)}</T>
            {m.vrishabha ? <T style={{ color: soft, fontSize: 13 }}>{s.muhuratWhy}</T> : null}
          </View>
        ) : null}
      </Pressable>
    </BandCard>
  );
}

/** "Now" in two lines, under a festival: what runs and until when, then the next good time. */
function NowLines({ v, nowMin, lang, h24 }: { v: NowView; nowMin: number; lang: Lang; h24: boolean }) {
  const s = t(lang);
  const c = useColors();
  const until = s.until(clock(hhmm(v.end), lang, h24, true));
  const line = (mark: ReactNode, text: string, tone: string, right: string, first: boolean) => (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 12 }, !first && { borderTopWidth: 0.5, borderTopColor: c.line }]}>
      {mark}
      <T style={{ fontSize: 14.5, fontWeight: '600', color: tone, flexShrink: 1 }} numberOfLines={1}>{text}</T>
      <T kind="small" style={{ marginLeft: 'auto', fontSize: 14, fontVariant: ['tabular-nums'] }}>{right}</T>
    </View>
  );
  const dot = (bg: string) => <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: bg }} />;
  const first = v.kind === 'rahu'
    ? line(<View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: c.bad }} />, s.inRahu, c.bad, until, true)
    : line(dot(v.kind === 'good' ? c.good : v.kind === 'fair' ? c.neutral : c.bad), `${s.nowLabel} ${chogName(v.slot!.name, lang)} · ${v.kind === 'good' ? s.verdict_good : v.kind === 'fair' ? s.verdict_fair : s.verdict_avoid}`, v.kind === 'good' ? c.good : v.kind === 'fair' ? c.text : c.bad, until, true);
  const ng = v.nextGood && v.nextGood.start > nowMin ? v.nextGood : null;
  return (
    <View>
      {first}
      {ng ? line(dot(c.good), `${s.then} ${chogName(ng.name, lang)}`, c.text, clockRange(hhmm(ng.start), hhmm(ng.end), lang, h24), false) : null}
    </View>
  );
}

/** A day's good choghadiya as a few runs of time, and its Rahu Kaal: tomorrow in the evening, or another day. */
function GoodTimes({ title, sub, runs, rahu, lang, h24, onAll }: { title: string; sub: string; runs: GoodRun[]; rahu: TimeRange; lang: Lang; h24: boolean; onAll: () => void }) {
  const s = t(lang);
  const c = useColors();
  return (
    <Card style={{ padding: 0, gap: 0 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <T style={{ fontFamily: TitleFont[lang], fontSize: 17, lineHeight: lang === 'gu' ? 26 : 22, flexShrink: 1 }}>{title}</T>
          <T kind="caption">{sub}</T>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {runs.map(r => (
            <View key={r.start} style={{ borderRadius: 14, backgroundColor: c.goodBg, paddingHorizontal: 12, paddingTop: 7, paddingBottom: 8 }}>
              <T style={{ fontSize: 12.5, fontWeight: '600', color: c.good }}>{r.names.map(n => chogName(n, lang)).join(', ')}</T>
              <T style={{ fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{clockRange(hhmm(r.start), hhmm(r.end), lang, h24, true)}</T>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 12, height: 3, borderRadius: 2, backgroundColor: c.bad }} />
          <T kind="small" style={{ fontVariant: ['tabular-nums'] }}>{s.rahuKaal} {clockRange(rahu.start, rahu.end, lang, h24, true)}</T>
        </View>
      </View>
      <MoreRow label={s.allChoghadiya} onPress={onAll} />
    </Card>
  );
}


/** A day to come: the date large, a dot for its kind, its name, how soon. */
function UpcomingCard({ it, today, lang }: { it: UpcomingItem; today: string; lang: Lang }) {
  const c = useColors();
  const dot = it.kind === 'festival' ? c.brand : it.kind === 'vrat' ? c.good : c.neutral;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${it.title}, ${longDate(it.date, lang)}, ${it.detail}`} onPress={() => router.push(it.href as never)}
      style={({ pressed }) => [{ width: 140, borderRadius: 18, backgroundColor: c.card, paddingHorizontal: 13, paddingTop: 12, paddingBottom: 13, opacity: pressed ? 0.75 : 1 }, shadow(c)]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <T style={{ fontSize: 24, lineHeight: 28, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{Number(it.date.slice(8))}</T>
          <T kind="caption">{shortDate(it.date, lang).split(' ')[1]} · {shortWeekday(it.date, lang)}{it.date.slice(0, 4) !== today.slice(0, 4) ? ` ${it.date.slice(0, 4)}` : ''}</T>
        </View>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot, marginTop: 6 }} />
      </View>
      <T style={{ fontSize: 15, fontWeight: '600', lineHeight: 20, marginTop: 12, minHeight: 40 }} numberOfLines={2}>{it.title}</T>
      <T kind="caption" style={{ marginTop: 3 }} numberOfLines={2}>{it.detail}</T>
    </Pressable>
  );
}

/** The day at a glance: the sun's arc with sunrise, moonrise and sunset; Rahu Kaal, Abhijit, nakshatra, yoga. */
function DayCard({ day, progress, lang, h24, countdown, nowMs }: { day: PanchangDay; progress: number; lang: Lang; h24: boolean; countdown: CountdownProps | null; nowMs: number }) {
  const s = t(lang);
  const c = useColors();
  const cells: [string, string, string | null][] = [
    [s.rahuKaal, clockRange(day.rahuKaal.start, day.rahuKaal.end, lang, h24), c.bad],
    [s.abhijit, clockRange(day.abhijitMuhurta.start, day.abhijitMuhurta.end, lang, h24), c.good],
    [s.nakshatra, lang === 'gu' ? day.nakshatra.nameGu : day.nakshatra.name, null],
    [s.yoga, lang === 'gu' ? day.yoga.nameGu : day.yoga.name, null],
  ];
  const time = (label: string, value: string, align: 'flex-start' | 'center' | 'flex-end') => (
    <View style={{ alignItems: align }}>
      <T kind="caption">{label}</T>
      <T kind="value" style={{ fontSize: 15.5 }}>{value}</T>
    </View>
  );
  return (
    <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
        <SunArc progress={progress} height={56} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          {time(s.sunrise, clock(day.sunrise, lang, h24), 'flex-start')}
          {time(s.moonrise, clock(day.moonrise, lang, h24), 'center')}
          {time(s.sunset, clock(day.sunset, lang, h24), 'flex-end')}
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 0.5, borderTopColor: c.line }}>
        {cells.map(([label, value, dot], i) => (
          <View key={label} style={[{ width: '50%', paddingHorizontal: 16, paddingTop: 11, paddingBottom: 12 }, i % 2 === 0 && { borderRightWidth: 0.5, borderRightColor: c.line }, i >= 2 && { borderTopWidth: 0.5, borderTopColor: c.line }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} /> : null}
              <T kind="caption">{label}</T>
            </View>
            <T kind="value" style={{ fontSize: 15.5, marginTop: 2 }} numberOfLines={1}>{value}</T>
          </View>
        ))}
      </View>
      {countdown ? <View style={{ padding: 12, borderTopWidth: 0.5, borderTopColor: c.line }}><LiveCountdownButton kind="quiet" countdown={countdown} nowMs={nowMs} /></View> : null}
    </Card>
  );
}
