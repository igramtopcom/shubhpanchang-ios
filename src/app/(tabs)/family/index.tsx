// Family dates kept by tithi: each person's next day, worked out at the place.
import { Alert, Pressable, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Button, Card, Loading, Notice, Screen, T, Tag, useColors } from '@/components/ui';
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
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable accessibilityRole="button" accessibilityLabel={s.addPerson} hitSlop={10} onPress={() => router.push('/family-add')}>
              <SymbolView name="plus" size={22} weight="semibold" tintColor={c.brand} />
            </Pressable>
          ),
        }}
      />
      {!prefs.family.length ? (
        <Card style={{ alignItems: 'center', paddingVertical: 28, gap: 12 }}>
          <SymbolView name="person.2.fill" size={36} tintColor={c.brand} />
          <T kind="small" style={{ textAlign: 'center' }}>{s.familyEmpty}</T>
          <Button icon="plus" label={s.addPerson} onPress={() => router.push('/family-add')} />
        </Card>
      ) : null}
      {next.stale ? <Notice text={s.offline} /> : null}
      {next.loading && !next.data && prefs.family.length ? <Loading /> : null}
      {(next.data ?? []).map(({ person, next: occ }) => {
        const label = lunarLabel(person.lunar, lang);
        const kind = person.kind === 'birthday' ? s.birthday : s.shraddh;
        return (
          <Card key={person.id}>
            <Tag label={kind} tone="brand" />
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
                  compact
                  icon="calendar.badge.plus"
                  label={s.addToCalendar}
                  onPress={() => addAllDayEvent({ date: occ.date, title: `${person.name} · ${kind}`, notes: label })}
                />
              ) : null}
              <Button kind="destructive" compact icon="trash" label={s.remove} onPress={() => remove(person.id, person.name)} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
