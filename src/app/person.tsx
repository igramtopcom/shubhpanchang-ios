// One family date: when it falls this time and in the years after, by the
// tithi, the calendar date or both (or the one day, for an event that happens
// once); how it repeats; its reminder; adding it to the iPhone Calendar;
// removing it.
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { Avatar } from '@/components/avatar';
import { BandCard, BandEyebrow, BandPill, BandTitle, Head, WHITE2, useBand } from '@/components/band';
import { Button, Card, Cell, Group, Loading, Screen, Segmented, T, useColors } from '@/components/ui';
import { addAllDayEvent, calendarSupported } from '@/lib/calendar';
import { clock, shortDate } from '@/lib/format';
import { longDate, lunarLabel, t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import { daysBetween, hhmm } from '@/lib/time';
import { civilYears, familyOccurrences, familyTitle, firstFrom, isPast, needsTithi, repeatOf, REPEATS } from '@/lib/upcoming';
import type { TithiOccurrence } from '@/lib/types';
import { useApp } from '@/state/app';
import { useNow } from '@/state/data';


export default function PersonScreen() {
  const { prefs, update, api } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const now = useNow(prefs.place!.timezone);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const person = prefs.family.find(f => f.id === id) ?? null;
  const [dates, setDates] = useState<TithiOccurrence[] | null>(null);
  const band = useBand(person?.kind === 'shraddh' ? 'fair' : 'brand');
  const tithiToo = !!person && needsTithi(person);

  useEffect(() => {
    if (!person || !tithiToo) return;
    let live = true;
    api.tithiDates(prefs.place!, person.lunar, person.kind === 'shraddh' ? 'aparahna' : 'sunrise', firstFrom(person, now.date), 4)
      .then(r => { if (live) setDates(r.data); })
      .catch(() => { if (live) setDates([]); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id, person?.lunar.month, person?.lunar.tithi, tithiToo, now.date]);

  if (!person) return <Screen header><T kind="small">{s.notFound}</T></Screen>;
  const repeat = repeatOf(person);
  const tithiDates = tithiToo ? dates : [];
  const occ = familyOccurrences(person, now.date, tithiDates?.[0] ?? null);
  const nextOcc = occ[0] ?? null;
  const past = isPast(person, now.date);
  const reminding = prefs.notify.family.on && person.remind !== false;
  const edit = (patch: Partial<typeof person>) => update({ family: prefs.family.map(f => (f.id === person.id ? { ...f, ...patch } : f)) });
  const setRemind = async (on: boolean) => {
    if (on && notificationsSupported && !(await notificationPermission(true))) return;
    update({
      family: prefs.family.map(f => (f.id === person.id ? { ...f, remind: on } : f)),
      ...(on ? { notify: { ...prefs.notify, family: { ...prefs.notify.family, on: true } } } : {}),
    });
  };
  const remove = () => Alert.alert(s.removeQ(person.name), s.removeBody, [
    { text: s.cancel, style: 'cancel' },
    { text: s.remove, style: 'destructive', onPress: () => { update({ family: prefs.family.filter(f => f.id !== person.id) }); router.back(); } },
  ]);
  const byLabel = (by: string) => (by === 'tithi' ? s.byTithi : s.byDate);
  // The years after this one: the tithi's days, or the calendar date's.
  const later: { year: string; date: string; also?: string }[] = repeat === 'date'
    ? civilYears(person.origin!.date, now.date, 4).slice(1).map(d => ({ year: d.slice(0, 4), date: d }))
    : (tithiDates ?? []).slice(1).map(d => ({
      year: d.date.slice(0, 4),
      date: d.date,
      ...(repeat === 'both' ? { also: civilYears(person.origin!.date, `${d.date.slice(0, 4)}-01-01`, 1)[0] } : {}),
    }));
  const title = familyTitle(person, lang);

  return (
    <Screen header gap={18} bottom={60}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={person.name} kind={person.kind} size={64} />
        <View style={{ flex: 1 }}>
          <T kind="display" style={{ fontSize: 28, lineHeight: 36 }}>{person.name}</T>
          <T kind="small">{[person.origin ? `${person.kind === 'shraddh' ? s.diedOn : person.kind === 'anniversary' ? s.marriedOn : s.bornOn} ${shortDate(person.origin.date, lang)} ${person.origin.date.slice(0, 4)}` : null, lunarLabel(person.lunar, lang)].filter(Boolean).join(' · ')}</T>
        </View>
      </View>

      {tithiToo && dates === null ? <Loading /> : null}
      {nextOcc ? (
        <BandCard band={band} id="person-next">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <BandEyebrow>{title}{occ.length > 1 ? ` · ${byLabel(nextOcc.by)}` : ''}</BandEyebrow>
            <BandPill text={nextOcc.date === now.date ? s.today : s.relDays(daysBetween(now.date, nextOcc.date))} />
          </View>
          <BandTitle size={28}>{longDate(nextOcc.date, lang)}</BandTitle>
          {nextOcc.aparahna ? <T style={{ color: WHITE2, fontSize: 14.5 }}>{s.aparahna} {clock(nextOcc.aparahna.start, lang, prefs.clock24)} – {clock(nextOcc.aparahna.end, lang, prefs.clock24)}</T> : null}
          {occ.slice(1).map(o => <T key={o.date} style={{ color: WHITE2, fontSize: 14.5 }}>{byLabel(o.by)}: {longDate(o.date, lang)}</T>)}
        </BandCard>
      ) : null}
      {past ? (
        <Card style={{ gap: 4 }}>
          <T kind="eyebrow" style={{ fontSize: 13 }}>{s.dayPassed}</T>
          <T style={{ fontSize: 18, fontWeight: '600' }}>{longDate(person.origin!.date, lang)}</T>
        </Card>
      ) : null}

      {later.length ? (
        <View style={{ gap: 7 }}>
          <Head title={s.comingYears} />
          <Card style={{ paddingVertical: 4, gap: 0 }}>
            {later.map((d, i) => (
              <View key={d.date} style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 }, i > 0 && { borderTopWidth: 0.5, borderTopColor: c.line }]}>
                <T style={{ fontSize: 15 }}>{d.year}</T>
                <View style={{ alignItems: 'flex-end' }}>
                  <T kind="value" style={{ fontSize: 15 }}>{shortDate(d.date, lang, true)}</T>
                  {d.also && d.also !== d.date ? <T kind="caption">{s.byDate}: {shortDate(d.also, lang, true)}</T> : null}
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {person.origin ? (
        <View style={{ gap: 7 }}>
          <Head title={s.repeat} />
          <Segmented values={[s.repeatTithi, s.repeatDate, s.repeatBoth, s.repeatOnce]} index={REPEATS.indexOf(repeat)}
            onChange={i => { setDates(null); edit({ repeat: REPEATS[i] === 'tithi' ? undefined : REPEATS[i] }); }} />
          <T kind="caption" style={{ marginHorizontal: 6, fontSize: 12.5 }}>{s[`repeatNote_${repeat}`]}</T>
        </View>
      ) : null}

      {!past ? (
        <Group>
          <Cell first icon="bell" tint={c.brand} label={s.remindEve} sub={clock(hhmm(prefs.notify.family.minutes), lang, prefs.clock24, true)} toggle={reminding} onToggle={setRemind} disabled={!notificationsSupported} />
          {calendarSupported ? occ.map(o => (
            <Cell key={o.by} icon="calendar.badge.plus" tint={c.good} label={s.addToIphoneCalendar}
              sub={o.by === 'tithi' ? s.calNextTithi : o.by === 'date' ? s.calYearly : undefined}
              onPress={() => addAllDayEvent({ date: o.date, title, notes: o.by === 'tithi' ? lunarLabel(person.lunar, lang) : undefined, yearly: o.by === 'date' })} />
          )) : null}
        </Group>
      ) : null}

      <Button kind="destructive" icon="trash" label={s.remove} onPress={remove} />
    </Screen>
  );
}
