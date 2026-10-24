// Vrat & Festivals: the next one on its coloured card (the Today style), then
// the coming fasts and festivals at the place by month, each row opening its
// own screen in the app (no website). ?seg=festivals opens the festivals.
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { BandCard, BandEyebrow, BandFigure, BandPill, BandTitle, CREAM, GOLD, SOFT, WHITE2, useBand } from '@/components/band';
import { headerButtons } from '@/components/glass';
import { Diya } from '@/components/sky';
import { Chip, DateTile, List, ListRow, Loading, MonthHead, Notice, Screen, Segmented, T, Tag, useColors } from '@/components/ui';
import { clock, clockRange, shortDate, shortWeekday } from '@/lib/format';
import { longDate, t } from '@/lib/i18n';
import { daysBetween, shiftDate } from '@/lib/time';
import { isVaishnava, type Festival, type Lang, type Observance, type ObservanceKind } from '@/lib/types';
import { useApp } from '@/state/app';
import { useFestivals, useNow, useObservances, usePanchangWindow } from '@/state/data';

/** The India lists end with 2030; the API refuses ranges past them. */
const LIST_TO = '2030-12-31';
const MONTHS = {
  gu: ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઑક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
type VratFilter = 'all' | ObservanceKind;
type FestFilter = 'all' | 'major' | 'sampradaya' | 'regional';

export default function VratScreen() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const place = prefs.place!;
  const now = useNow(place.timezone);
  const to = shiftDate(now.date, 150) < LIST_TO ? shiftDate(now.date, 150) : LIST_TO;
  // From a few days back: an Ekadashi whose Parana is today still belongs on top.
  const obs = useObservances(shiftDate(now.date, -2), to);
  const festTo = shiftDate(now.date, 365) < LIST_TO ? shiftDate(now.date, 365) : LIST_TO;
  const fest = useFestivals(now.date, festTo);
  const win = usePanchangWindow();
  const params = useLocalSearchParams<{ seg?: string }>();
  const [seg, setSeg] = useState(params.seg === 'festivals' ? 1 : 0);
  const [seenSeg, setSeenSeg] = useState(params.seg);
  if (params.seg !== seenSeg) {
    setSeenSeg(params.seg);
    if (params.seg === 'festivals') setSeg(1);
  }
  const [vf, setVf] = useState<VratFilter>('all');
  const [ff, setFf] = useState<FestFilter>('all');
  const current = seg === 0 ? obs : fest;

  // Lunar months of a civil month, where the panchang window knows them ("આસો · કારતક").
  const lunarOf = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const d of win.data ?? []) {
      const key = d.date.slice(0, 7);
      const name = lang === 'gu' ? d.hinduMonth.gu : d.hinduMonth.en;
      const list = m.get(key) ?? [];
      if (!list.includes(name)) list.push(name);
      m.set(key, list);
    }
    return m;
  }, [win.data, lang]);

  const kinds = prefs.notify.kinds;
  const vrats = (obs.data ?? []).filter(o => kinds.includes(o.kind) && (vf === 'all' || o.kind === vf))
    .filter(o => o.date >= now.date || o.parana?.date === now.date);
  const fests = (fest.data ?? []).filter(f => ff === 'all' || (ff === 'major' ? f.type === 'major' : ff === 'sampradaya' ? f.reason === 'sampradaya' : f.type === 'regional'));

  const vratChips: VratFilter[] = ['all', ...(['ekadashi', 'purnima', 'amavasya', 'sankashti', 'pradosh', 'shivaratri', 'parva'] as ObservanceKind[]).filter(k => kinds.includes(k))];
  const festChips: FestFilter[] = ['all', 'major', ...(prefs.sampradaya !== 'smarta' ? ['sampradaya' as const] : []), 'regional'];

  return (
    <Screen header onRefresh={current.reload} refreshing={current.loading && !!current.data} gap={14}>
      <Stack.Screen options={headerButtons([
        { icon: 'magnifyingglass', label: s.search, onPress: () => router.push('/search') },
        { icon: 'gearshape', label: s.tabSettings, onPress: () => router.push('/settings') },
      ], c.text)} />
      <Segmented values={[s.segVrat, s.segFestivals]} index={seg} onChange={setSeg} />
      {seg === 0 && vrats[0] ? <VratHero o={vrats[0]} today={now.date} lang={lang} /> : null}
      {seg === 1 && fests[0] ? <FestHero f={fests[0]} today={now.date} lang={lang} /> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} style={{ marginHorizontal: -18 }} contentInset={{ left: 18, right: 18 }} contentOffset={{ x: -18, y: 0 }}>
        {seg === 0
          ? vratChips.map(k => <Chip key={k} label={k === 'all' ? s.all : s[`chip_${k}` as 'chip_ekadashi']} selected={vf === k} onPress={() => setVf(k)} />)
          : festChips.map(k => <Chip key={k} label={k === 'all' ? s.all : k === 'major' ? s.festMain : k === 'regional' ? s.festGujarat : s[`sampradayaShort_${prefs.sampradaya}` as 'sampradayaShort_baps']} selected={ff === k} onPress={() => setFf(k)} />)}
      </ScrollView>

      {current.stale ? <Notice text={s.offline} /> : null}
      {current.error && !current.data ? <Notice text={s.loadError} onRetry={current.reload} retryLabel={s.retry} /> : null}
      {current.loading && !current.data ? <Loading /> : null}

      {seg === 0 ? (
        <>
          {obs.data && !vrats.length ? <T kind="small">{s.noVratSoon}</T> : null}
          {byMonth(vrats.map(o => ({ date: o.parana?.date === now.date && o.date < now.date ? now.date : o.date, item: o }))).map(([month, rows]) => (
            <View key={month} style={{ gap: 8 }}>
              <MonthHead title={monthTitle(month, lang)} sub={(lunarOf.get(month) ?? []).join(' · ')} />
              <List>
                {rows.map((r, i) => <VratRow key={`${r.item.kind}${r.item.date}`} o={r.item} first={i === 0} today={now.date} lang={lang} />)}
              </List>
            </View>
          ))}
        </>
      ) : (
        <>
          {fest.data && !fests.length ? <T kind="small">{s.noFestSoon}</T> : null}
          {byMonth(fests.map(f => ({ date: f.date, item: f }))).map(([month, rows]) => (
            <View key={month} style={{ gap: 8 }}>
              <MonthHead title={monthTitle(month, lang)} sub={(lunarOf.get(month) ?? []).join(' · ')} />
              <List>
                {rows.map((r, i) => <FestRow key={r.item.slug} f={r.item} first={i === 0} today={now.date} lang={lang} />)}
              </List>
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

function byMonth<T>(rows: { date: string; item: T }[]): [string, { date: string; item: T }[]][] {
  const m = new Map<string, { date: string; item: T }[]>();
  for (const r of rows) m.set(r.date.slice(0, 7), [...(m.get(r.date.slice(0, 7)) ?? []), r]);
  return [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
}

const monthTitle = (month: string, lang: Lang) => `${MONTHS[lang][Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`;

function VratRow({ o, first, today, lang }: { o: Observance; first: boolean; today: string; lang: Lang }) {
  const { prefs } = useApp();
  const s = t(lang);
  const h24 = prefs.clock24;
  const name = lang === 'gu' ? o.nameGu : o.nameEn;
  const paranaToday = o.parana?.date === today && o.date < today;
  const paranaText = o.parana ? (o.parana.end ? clockRange(o.parana.start, o.parana.end, lang, h24) : s.paranaAfter(clock(o.parana.start, lang, h24))) : null;
  const detail = paranaToday
    ? `${name} · ${paranaText}`
    : [
        o.popular ? o.popular[lang] : null,
        paranaText ? `${s.parana} ${shortDate(o.parana!.date, lang)}, ${paranaText}` : null,
        o.moonrise ? `${s.moonrise} ${clock(o.moonrise.time, lang, h24, true)}` : null,
        o.window ? `${o.kind === 'pradosh' ? s.pradoshKaal : s.nishita} ${clockRange(o.window.start, o.window.end, lang, h24)}` : null,
        o.kind === 'ekadashi' && !o.parana && isVaishnava(prefs.sampradaya) ? s.paranaMandir : null,
      ].filter(Boolean).join(' · ');
  const day = paranaToday ? today : o.date;
  return (
    <ListRow
      first={first}
      lead={<DateTile day={String(Number(day.slice(8)))} sub={day === today ? s.today : shortWeekday(day, lang)} highlight={day === today} />}
      title={paranaToday ? s.parana : name}
      detail={detail}
      trailing="chevron"
      onPress={() => router.push(`/observance?kind=${o.kind}&date=${o.date}`)}
      a11y={`${paranaToday ? s.parana : name}, ${longDate(day, lang)}, ${detail}`}
    />
  );
}

function FestRow({ f, first, today, lang }: { f: Festival; first: boolean; today: string; lang: Lang }) {
  const s = t(lang);
  const name = lang === 'gu' ? f.nameGu : f.nameEn;
  const detail = [
    f.about ? f.about[lang] : null,
    f.reason === 'india-date' ? s.festIndiaShort(shortDate(f.indiaDate, lang)) : null,
    f.reason === 'local-day' ? s.festLocalShort(shortDate(f.indiaDate, lang)) : null,
  ].filter(Boolean).join(' · ');
  return (
    <ListRow
      first={first}
      lead={<DateTile day={String(Number(f.date.slice(8)))} sub={f.date === today ? s.today : shortWeekday(f.date, lang)} highlight={f.date === today} />}
      title={name}
      badge={f.reason === 'sampradaya' && f.sampradaya ? <Tag label={s[`sampradayaShort_${f.sampradaya}` as 'sampradayaShort_baps']} /> : undefined}
      detail={detail}
      trailing="chevron"
      onPress={() => router.push(`/festival?slug=${encodeURIComponent(f.slug)}`)}
      a11y={`${name}, ${longDate(f.date, lang)}`}
    />
  );
}

/** The next vrat on the sage card: its name, how soon, and the one time that matters (Parana, moonrise, the kaal). */
function VratHero({ o, today, lang }: { o: Observance; today: string; lang: Lang }) {
  const { prefs } = useApp();
  const s = t(lang);
  const h24 = prefs.clock24;
  const band = useBand('good');
  const name = lang === 'gu' ? o.nameGu : o.nameEn;
  const paranaToday = o.parana?.date === today && o.date < today;
  const days = daysBetween(today, o.date);
  const when = paranaToday ? s.today : days === 0 ? s.today : s.relDays(days);
  const fig = o.parana
    ? { label: `${s.parana} · ${shortDate(o.parana.date, lang, true)}`, value: o.parana.end ? clockRange(o.parana.start, o.parana.end, lang, h24, true) : s.paranaAfter(clock(o.parana.start, lang, h24, true)) }
    : o.moonrise ? { label: `${s.moonrise} · ${shortDate(o.moonrise.date, lang, true)}`, value: clock(o.moonrise.time, lang, h24, true) }
      : o.window ? { label: o.kind === 'pradosh' ? s.pradoshKaal : s.nishita, value: clockRange(o.window.start, o.window.end, lang, h24, true) } : null;
  return (
    <BandCard band={band} id="vrat-next" onPress={() => router.push(`/observance?kind=${o.kind}&date=${o.date}`)} a11y={`${name}, ${longDate(o.date, lang)}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <BandEyebrow>{s.nextUp} · {longDate(o.date, lang)}</BandEyebrow>
        <BandPill text={when} />
      </View>
      <BandTitle size={30}>{paranaToday ? `${s.parana}: ${name}` : name}</BandTitle>
      {o.popular ? <T style={{ color: WHITE2, fontSize: 14.5 }}>{o.popular[lang]}</T> : null}
      {fig ? <BandFigure label={fig.label} value={fig.value} /> : null}
    </BandCard>
  );
}

/** The next festival on the plum card, with a diya for a big one. */
function FestHero({ f, today, lang }: { f: Festival; today: string; lang: Lang }) {
  const s = t(lang);
  const band = useBand('fest');
  const name = lang === 'gu' ? f.nameGu : f.nameEn;
  const days = daysBetween(today, f.date);
  return (
    <BandCard band={band} id="fest-next" onPress={() => router.push(`/festival?slug=${encodeURIComponent(f.slug)}`)} a11y={`${name}, ${longDate(f.date, lang)}`}>
      {f.type === 'major' ? <View style={{ position: 'absolute', right: 6, top: 8 }}><Diya size={64} /></View> : null}
      <BandEyebrow color={GOLD}>{s.nextUp} · {days === 0 ? s.today : s.relDays(days)}</BandEyebrow>
      <BandTitle size={32} color={CREAM} right={f.type === 'major' ? 64 : 0}>{name}</BandTitle>
      <T style={{ color: SOFT, fontSize: 14.5 }}>{longDate(f.date, lang)}</T>
      {f.about ? <T style={{ color: SOFT, fontSize: 14, marginTop: 6, paddingRight: 8 }} numberOfLines={2}>{f.about[lang]}</T> : null}
    </BandCard>
  );
}
