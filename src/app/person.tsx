// One family date: when it falls this time and in the years after, by the
// tithi; its reminder; adding it to the iPhone Calendar; removing it.
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Avatar } from '@/components/avatar';
import { Button, Card, Cell, Group, Loading, Screen, T, useColors } from '@/components/ui';
import { addAllDayEvent, calendarSupported } from '@/lib/calendar';
import { clock, shortDate } from '@/lib/format';
import { longDate, lunarLabel, t } from '@/lib/i18n';
import { notificationPermission, notificationsSupported } from '@/lib/notify';
import { daysBetween, hhmm } from '@/lib/time';
import { familyTitle, firstFrom } from '@/lib/upcoming';
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

  useEffect(() => {
    if (!person) return;
    let live = true;
    api.tithiDates(prefs.place!, person.lunar, person.kind === 'shraddh' ? 'aparahna' : 'sunrise', firstFrom(person, now.date), 4)
      .then(r => { if (live) setDates(r.data); })
      .catch(() => { if (live) setDates([]); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id, person?.lunar.month, person?.lunar.tithi, now.date]);

  if (!person) return <Screen header><T kind="small">{s.notFound}</T></Screen>;
  const nextOcc = dates?.[0] ?? null;
  const reminding = prefs.notify.family.on && person.remind !== false;
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
  // The civil anniversary of the date entered, for those who keep that too.
  const byDate = person.origin && person.origin.date <= now.date ? nextCivil(person.origin.date, now.date) : null;

  return (
    <Screen header gap={18} bottom={60}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={person.name} kind={person.kind} size={64} />
        <View style={{ flex: 1 }}>
          <T kind="display" style={{ fontSize: 28, lineHeight: 36 }}>{person.name}</T>
          <T kind="small">{[person.origin ? `${person.kind === 'shraddh' ? s.diedOn : person.kind === 'anniversary' ? s.marriedOn : s.bornOn} ${shortDate(person.origin.date, lang)} ${person.origin.date.slice(0, 4)}` : null, lunarLabel(person.lunar, lang)].filter(Boolean).join(' · ')}</T>
        </View>
      </View>

      {dates === null ? <Loading /> : null}
      {nextOcc ? (
        <Card tone="brand" style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SymbolView name={person.kind === 'shraddh' ? 'flame' : 'heart'} size={13} tintColor={c.brand} />
            <T kind="eyebrow" style={{ fontSize: 13 }}>{familyTitle(person, lang)} · {nextOcc.date === now.date ? s.today : s.relDays(daysBetween(now.date, nextOcc.date))}</T>
          </View>
          <T style={{ fontSize: 20, fontWeight: '600' }}>{longDate(nextOcc.date, lang)}</T>
          {nextOcc.aparahna ? <T kind="small">{s.aparahna} {clock(nextOcc.aparahna.start, lang, prefs.clock24)} – {clock(nextOcc.aparahna.end, lang, prefs.clock24)}</T> : null}
          {byDate ? <T kind="small">{s.byDate}: {longDate(byDate, lang)}</T> : null}
        </Card>
      ) : null}

      {dates && dates.length > 1 ? (
        <View style={{ gap: 7 }}>
          <T kind="label" style={{ marginLeft: 6 }}>{s.comingYears}</T>
          <Card style={{ paddingVertical: 4, gap: 0 }}>
            {dates.slice(1).map((d, i) => (
              <View key={d.date} style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 }, i > 0 && { borderTopWidth: 0.5, borderTopColor: c.line }]}>
                <T style={{ fontSize: 15 }}>{d.date.slice(0, 4)}</T>
                <T kind="value" style={{ fontSize: 15 }}>{shortDate(d.date, lang, true)}</T>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      <Group>
        <Cell first icon="bell" tint={c.brand} label={s.remindEve} sub={clock(hhmm(prefs.notify.family.minutes), lang, prefs.clock24, true)} toggle={reminding} onToggle={setRemind} disabled={!notificationsSupported} />
        {calendarSupported && nextOcc ? (
          <Cell icon="calendar.badge.plus" tint={c.good} label={s.addToIphoneCalendar} onPress={() => addAllDayEvent({ date: nextOcc.date, title: familyTitle(person, lang), notes: lunarLabel(person.lunar, lang) })} />
        ) : null}
      </Group>

      <Button kind="destructive" icon="trash" label={s.remove} onPress={remove} />
    </Screen>
  );
}

/** The next day (from `today`) with the month and day of `date`. */
function nextCivil(date: string, today: string): string {
  const md = date.slice(5);
  const y = Number(today.slice(0, 4));
  const thisYear = `${y}-${md === '02-29' ? '02-28' : md}`;
  return thisYear >= today ? thisYear : `${y + 1}-${md === '02-29' ? '02-28' : md}`;
}
