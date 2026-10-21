// Family dates kept by tithi: each person's next day, worked out at the place.
import { Alert, View } from 'react-native';
import { router } from 'expo-router';

import { Button, Card, Loading, Notice, Screen, T, useColors } from '@/components/ui';
import { addAllDayEvent, calendarSupported } from '@/lib/calendar';
import { longDate, lunarLabel, t } from '@/lib/i18n';
import { useApp } from '@/state/app';
import { useFamilyNext, useNow } from '@/state/data';

export default function FamilyScreen() {
  const { prefs, update } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const now = useNow(prefs.place!.timezone);
  const next = useFamilyNext(now.date);

  const remove = (id: string, name: string) => Alert.alert(s.removeQ(name), s.removeBody, [
    { text: s.cancel, style: 'cancel' },
    { text: s.remove, style: 'destructive', onPress: () => update({ family: prefs.family.filter(f => f.id !== id) }) },
  ]);

  return (
    <Screen header onRefresh={next.reload} refreshing={next.loading && !!next.data}>
      {!prefs.family.length ? <Card><T kind="small">{s.familyEmpty}</T></Card> : null}
      <Button label={s.addPerson} onPress={() => router.push('/family-add')} />
      {next.stale ? <Notice text={s.offline} /> : null}
      {next.loading && !next.data && prefs.family.length ? <Loading /> : null}
      {(next.data ?? []).map(({ person, next: occ }) => {
        const label = lunarLabel(person.lunar, lang);
        const kind = person.kind === 'birthday' ? s.birthday : s.shraddh;
        return (
          <Card key={person.id}>
            <T kind="label">{kind}</T>
            <T kind="heading">{person.name}</T>
            <T kind="small">{label} · {person.kind === 'birthday' ? s.birthdayRule : s.shraddhRule}</T>
            {occ ? (
              <>
                <T kind="value">{occ.date === now.date ? s.today : s.nextOn}: {longDate(occ.date, lang, true, occ.date.slice(0, 4) !== now.date.slice(0, 4))}</T>
                {occ.aparahna ? <T kind="small" color={c.good}>{s.aparahna} {occ.aparahna.start}–{occ.aparahna.end}</T> : null}
              </>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {occ && calendarSupported ? (
                <Button
                  kind="quiet"
                  label={s.addToCalendar}
                  onPress={() => addAllDayEvent({ date: occ.date, title: `${person.name} · ${kind}`, notes: label })}
                />
              ) : null}
              <Button kind="destructive" label={s.remove} onPress={() => remove(person.id, person.name)} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
