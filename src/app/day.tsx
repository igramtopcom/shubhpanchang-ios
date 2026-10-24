// A day picked in the calendar, as a sheet, in the Today style: the date with
// its kairi mark, the tithi in the serif with the moon in its abhla ring, what
// falls on the day, then the sun, Rahu Kaal and nakshatra in one card with
// hairlines; "see the whole day" opens Today on that date.
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { DateLine } from '@/components/band';
import { dayTithi } from '@/components/day-step';
import { MoonRing } from '@/components/sky';
import { Button, Card, List, ListRow, Loading, Notice, T, useColors } from '@/components/ui';
import { clock, clockRange, wallTime } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { t, tithiName } from '@/lib/i18n';
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
    ...(fest.data ?? []).filter(f => f.date === date).map(f => ({ key: f.slug, title: lang === 'gu' ? f.nameGu : f.nameEn, detail: f.about ? f.about[lang] : undefined, tone: c.brand, href: `/festival?slug=${encodeURIComponent(f.slug)}` })),
    ...(obs.data ?? []).filter(o => o.date === date && prefs.notify.kinds.includes(o.kind)).map(o => ({ key: `${o.kind}${o.date}`, title: lang === 'gu' ? o.nameGu : o.nameEn, detail: o.parana ? `${s.parana} ${o.parana.end ? clockRange(o.parana.start, o.parana.end, lang, prefs.clock24) : s.paranaAfter(clock(o.parana.start, lang, prefs.clock24))}` : undefined, tone: c.good, href: `/observance?kind=${o.kind}&date=${o.date}` })),
  ];
  const open = (href: string) => { router.back(); setTimeout(() => router.push(href as never), 250); };
  const cells: [string, string, string | null][] = day ? [
    [s.sunrise, clock(day.sunrise, lang, prefs.clock24), null],
    [s.sunset, clock(day.sunset, lang, prefs.clock24), null],
    [s.rahuKaal, clockRange(day.rahuKaal.start, day.rahuKaal.end, lang, prefs.clock24), c.bad],
    [s.nakshatra, lang === 'gu' ? day.nakshatra.nameGu : day.nakshatra.name, null],
  ] : [];

  return (
    <View style={{ flex: 1, backgroundColor: c.background, paddingHorizontal: 20, paddingTop: 22, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}><DateLine date={date} lang={lang} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel={s.close} onPress={() => router.back()} hitSlop={8}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
          <SymbolView name="xmark" size={12} weight="bold" tintColor={c.textSecondary} />
        </Pressable>
      </View>
      {day ? (
        <View style={{ gap: 2, marginTop: -6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <T kind="serif" style={{ flex: 1, fontSize: lang === 'gu' ? 26 : 24, lineHeight: lang === 'gu' ? 37 : 30 }}>{dayTithi(day, lang)}</T>
            <MoonRing tithi={day.tithi.index} size={50} />
          </View>
          <T kind="small">{s.tithiThen(clock(wallTime(day.tithi.endTime), lang, prefs.clock24, true), tithiName((day.tithi.index + 1) % 30, lang), !!day.tithi.endDayOffset || day.tithi.endTime >= '24:00')}</T>
        </View>
      ) : null}
      {error && !day ? <Notice text={s.loadError} onRetry={reload} retryLabel={s.retry} /> : null}
      {loading && !day ? <Loading /> : null}
      {items.length ? (
        <List>
          {items.map((it, i) => (
            <ListRow key={it.key} first={i === 0} lead={<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: it.tone, marginLeft: 4 }} />}
              title={it.title} detail={it.detail} trailing="chevron" onPress={() => open(it.href)} />
          ))}
        </List>
      ) : null}
      {day ? (
        <>
          <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cells.map(([label, value, dot], i) => (
                <View key={label} style={[{ width: '50%', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 11 }, i % 2 === 0 && { borderRightWidth: 0.5, borderRightColor: c.line }, i >= 2 && { borderTopWidth: 0.5, borderTopColor: c.line }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} /> : null}
                    <T kind="caption">{label}</T>
                  </View>
                  <T kind="value" style={{ fontSize: 15.5, marginTop: 2 }} numberOfLines={1}>{value}</T>
                </View>
              ))}
            </View>
          </Card>
          <Button kind="quiet" label={s.seeWholeDay} icon="sun.max" onPress={() => { tick(); router.back(); setTimeout(() => router.navigate(`/?date=${date}` as never), 250); }} />
        </>
      ) : null}
    </View>
  );
}
