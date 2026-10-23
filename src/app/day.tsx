// A day picked in the calendar, as a sheet: its tithi, what falls on it, the
// sun and Rahu Kaal; "see the whole day" opens Today on that date.
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { dayTithi } from '@/components/day-step';
import { Button, DateTile, Fact, List, ListRow, Loading, Notice, T, useColors } from '@/components/ui';
import { clock, clockRange } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { longDate, t, tithiName } from '@/lib/i18n';
import { useApp } from '@/state/app';
import { useDay, useFestivals, useObservances } from '@/state/data';

export default function DaySheet() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const { date = '' } = useLocalSearchParams<{ date?: string }>();
  const { day, loading, error, reload } = useDay(date);
  const listed = date >= '2026-01-01';
  const obs = useObservances(listed ? date : '2026-01-01', listed ? date : '2026-01-01');
  const fest = useFestivals(listed ? date : '2026-01-01', listed ? date : '2026-01-01');
  const items = [
    ...(fest.data ?? []).filter(f => f.date === date).map(f => ({ key: f.slug, title: lang === 'gu' ? f.nameGu : f.nameEn, detail: f.about ? f.about[lang] : undefined, icon: 'sparkles' as const, href: `/festival?slug=${encodeURIComponent(f.slug)}` })),
    ...(obs.data ?? []).filter(o => o.date === date && prefs.notify.kinds.includes(o.kind)).map(o => ({ key: `${o.kind}${o.date}`, title: lang === 'gu' ? o.nameGu : o.nameEn, detail: o.parana ? `${s.parana} ${o.parana.end ? clockRange(o.parana.start, o.parana.end, lang, prefs.clock24) : s.paranaAfter(clock(o.parana.start, lang, prefs.clock24))}` : undefined, icon: 'moon.stars' as const, href: `/observance?kind=${o.kind}&date=${o.date}` })),
  ];
  const open = (href: string) => { router.back(); setTimeout(() => router.push(href as never), 250); };

  return (
    <View style={{ flex: 1, backgroundColor: c.background, paddingHorizontal: 20, paddingTop: 22, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <T kind="title">{longDate(date, lang)}</T>
          {day ? <T kind="small">{dayTithi(day, lang)}; {s.tithiThen(clock(day.tithi.endTime, lang, prefs.clock24, true), tithiName((day.tithi.index + 1) % 30, lang), !!day.tithi.endDayOffset)}</T> : null}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={s.close} onPress={() => router.back()} hitSlop={8}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
          <SymbolView name="xmark" size={13} weight="bold" tintColor={c.textSecondary} />
        </Pressable>
      </View>
      {error && !day ? <Notice text={s.loadError} onRetry={reload} retryLabel={s.retry} /> : null}
      {loading && !day ? <Loading /> : null}
      {items.length ? (
        <List>
          {items.map((it, i) => (
            <ListRow key={it.key} first={i === 0} lead={<DateTile><SymbolView name={it.icon} size={18} tintColor={c.brand} /></DateTile>}
              title={it.title} detail={it.detail} trailing="chevron" onPress={() => open(it.href)} />
          ))}
        </List>
      ) : null}
      {day ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Fact label={s.nakshatra} value={lang === 'gu' ? day.nakshatra.nameGu : day.nakshatra.name} />
            <Fact label={s.yoga} value={lang === 'gu' ? day.yoga.nameGu : day.yoga.name} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Mini label={s.sunrise} value={clock(day.sunrise, lang, prefs.clock24)} />
            <Mini label={s.sunset} value={clock(day.sunset, lang, prefs.clock24)} />
            <Mini label={s.rahuKaal} value={clockRange(day.rahuKaal.start, day.rahuKaal.end, lang, prefs.clock24)} bad wide />
          </View>
          <Button kind="quiet" label={s.seeWholeDay} icon="sun.max" onPress={() => { tick(); router.back(); setTimeout(() => router.navigate(`/?date=${date}` as never), 250); }} />
        </>
      ) : null}
    </View>
  );
}

function Mini({ label, value, bad, wide }: { label: string; value: string; bad?: boolean; wide?: boolean }) {
  const c = useColors();
  return (
    <View style={{ flex: wide ? 1.5 : 1, borderRadius: 14, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: bad ? c.badBg : c.backgroundElement }}>
      <T style={{ fontSize: 16, fontWeight: '600', color: bad ? c.bad : c.text, fontVariant: ['tabular-nums'] }} shrink>{value}</T>
      <T kind="caption">{label}</T>
    </View>
  );
}
