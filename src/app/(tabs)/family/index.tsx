// Family dates kept by tithi: the next one on top, then birthdays and
// anniversaries, then punyatithis, each with the day it falls on this time.
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Avatar } from '@/components/avatar';
import { headerButtons } from '@/components/glass';
import { Card, Empty, List, ListRow, Loading, Notice, Screen, T, useColors } from '@/components/ui';
import { shortDate, shortWeekday } from '@/lib/format';
import { longDate, lunarLabel, t } from '@/lib/i18n';
import { daysBetween } from '@/lib/time';
import { familyTitle } from '@/lib/upcoming';
import type { FamilyDate, Lang, TithiOccurrence } from '@/lib/types';
import { useApp } from '@/state/app';
import { useFamilyNext, useNow } from '@/state/data';

export default function FamilyScreen() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const now = useNow(prefs.place!.timezone);
  const next = useFamilyNext(now.date);
  const rows = next.data ?? prefs.family.map(person => ({ person, next: null as TithiOccurrence | null }));
  const soonest = [...rows].filter(r => r.next).sort((a, b) => (a.next!.date < b.next!.date ? -1 : 1))[0];
  const living = rows.filter(r => r.person.kind !== 'shraddh');
  const remembered = rows.filter(r => r.person.kind === 'shraddh');

  return (
    <Screen header onRefresh={next.reload} refreshing={next.loading && !!next.data} gap={18}>
      <Stack.Screen options={headerButtons([
        ...(prefs.family.length ? [{ icon: 'plus' as const, label: s.addPerson, onPress: () => router.push('/family-add') }] : []),
        { icon: 'gearshape', label: s.tabSettings, onPress: () => router.push('/settings') },
      ], c.text)} />

      {!prefs.family.length ? (
        <Empty icon="person.2.fill" title={s.familyEmptyTitle} body={s.familyEmpty} action={s.addFirst} onAction={() => router.push('/family-add')} note={s.staysOnPhone} />
      ) : null}
      {next.stale ? <Notice text={s.offline} /> : null}
      {next.loading && !next.data && prefs.family.length ? <Loading /> : null}

      {soonest ? (
        <Card tone="brand" style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SymbolView name={soonest.person.kind === 'shraddh' ? 'flame' : 'heart'} size={13} tintColor={c.brand} />
            <T kind="eyebrow" style={{ fontSize: 13 }}>{s.nextUp} · {soonest.next!.date === now.date ? s.today : s.relDays(daysBetween(now.date, soonest.next!.date))}</T>
          </View>
          <T style={{ fontSize: 20, fontWeight: '600' }}>{familyTitle(soonest.person, lang)}</T>
          <T kind="small">{lunarLabel(soonest.person.lunar, lang)} · {longDate(soonest.next!.date, lang)}</T>
        </Card>
      ) : null}

      {living.length ? <Block title={s.livingDates} rows={living} today={now.date} lang={lang} /> : null}
      {remembered.length ? <Block title={s.punyatithiShraddh} rows={remembered} today={now.date} lang={lang} /> : null}
    </Screen>
  );
}

function Block({ title, rows, today, lang }: { title: string; rows: { person: FamilyDate; next: TithiOccurrence | null }[]; today: string; lang: Lang }) {
  return (
    <View style={{ gap: 7 }}>
      <T kind="label" style={{ marginLeft: 6 }}>{title}</T>
      <List>
        {rows.map((r, i) => <PersonRow key={r.person.id} person={r.person} next={r.next} first={i === 0} today={today} lang={lang} />)}
      </List>
    </View>
  );
}

function PersonRow({ person, next, first, today, lang }: { person: FamilyDate; next: TithiOccurrence | null; first: boolean; today: string; lang: Lang }) {
  const c = useColors();
  return (
    <ListRow
      first={first}
      lead={<Avatar name={person.name} kind={person.kind} />}
      title={person.name}
      detail={lunarLabel(person.lunar, lang)}
      trailing={next ? (
        <View style={{ alignItems: 'flex-end' }}>
          <T kind="value" style={{ fontSize: 14.5 }}>{shortDate(next.date, lang)}</T>
          <T kind="caption" color={c.textSecondary}>{next.date.slice(0, 4) !== today.slice(0, 4) ? next.date.slice(0, 4) : shortWeekday(next.date, lang)}</T>
        </View>
      ) : 'chevron'}
      onPress={() => router.push(`/person?id=${person.id}`)}
      a11y={`${person.name}, ${lunarLabel(person.lunar, lang)}${next ? `, ${longDate(next.date, lang)}` : ''}`}
    />
  );
}
