// Search a festival or a vrat by name ("દિવાળી", "Diwali", "Rama Ekadashi")
// and see its day in every year the lists hold; a row opens it.
import { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Head } from '@/components/band';
import { DateTile, List, ListRow, Loading, Screen, T, useColors } from '@/components/ui';
import { longDate, t } from '@/lib/i18n';
import { searchItems, type SearchHit } from '@/lib/search';
import { daysBetween } from '@/lib/time';
import { useApp } from '@/state/app';
import { useFestivals, useNow, useObservances } from '@/state/data';

const R: [string, string][] = [['2026-01-01', '2027-01-31'], ['2027-02-01', '2028-03-01'], ['2028-03-02', '2029-04-01'], ['2029-04-02', '2030-05-01'], ['2030-05-02', '2030-12-31']];

export default function SearchScreen() {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const now = useNow(prefs.place!.timezone);
  const [q, setQ] = useState('');
  // The lists run 2026-2030: five spans of at most 400 days (the API's limit per request).
  const f1 = useFestivals(R[0][0], R[0][1]), f2 = useFestivals(R[1][0], R[1][1]), f3 = useFestivals(R[2][0], R[2][1]), f4 = useFestivals(R[3][0], R[3][1]), f5 = useFestivals(R[4][0], R[4][1]);
  const o1 = useObservances(R[0][0], R[0][1]), o2 = useObservances(R[1][0], R[1][1]), o3 = useObservances(R[2][0], R[2][1]), o4 = useObservances(R[3][0], R[3][1]), o5 = useObservances(R[4][0], R[4][1]);
  const fests = [f1, f2, f3, f4, f5].flatMap(x => x.data ?? []);
  const obs = [o1, o2, o3, o4, o5].flatMap(x => x.data ?? []);
  const loading = [f1, f2, f3, f4, f5, o1, o2, o3, o4, o5].some(x => x.loading && !x.data);
  const groups = useMemo(() => searchItems(q, fests, obs, lang), [q, fests.length, obs.length, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen header gap={18} bottom={60}>
      <Stack.Screen options={{ headerTitle: s.search, headerTransparent: false }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.backgroundElement, borderRadius: 999, paddingHorizontal: 14, minHeight: 44 }}>
        <SymbolView name="magnifyingglass" size={15} tintColor={c.textSecondary} />
        <TextInput value={q} onChangeText={setQ} autoFocus placeholder={s.searchPh} placeholderTextColor={c.textMuted} autoCorrect={false} clearButtonMode="while-editing"
          style={{ flex: 1, fontSize: 16, color: c.text, paddingVertical: 10 }} accessibilityLabel={s.search} returnKeyType="search" />
      </View>
      {loading && q ? <Loading /> : null}
      {q.trim().length >= 2 && !loading && !groups.length ? <T kind="small" center>{s.noResults}</T> : null}
      {groups.map(g => (
        <View key={g.name} style={{ gap: 7 }}>
          <Head title={g.name} />
          <List>
            {g.hits.map((h, i) => <HitRow key={h.href} h={h} first={i === 0} today={now.date} />)}
          </List>
        </View>
      ))}
      {!q ? <T kind="small" center style={{ marginTop: 24 }}>{s.searchHint}</T> : null}
    </Screen>
  );
}

function HitRow({ h, first, today }: { h: SearchHit; first: boolean; today: string }) {
  const { prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const d = daysBetween(today, h.date);
  return (
    <ListRow
      first={first}
      lead={<DateTile highlight={h.date.slice(0, 4) === today.slice(0, 4) && d >= 0}><T style={{ fontSize: 14, fontWeight: '600', color: h.date.slice(0, 4) === today.slice(0, 4) && d >= 0 ? '#FFFFFF' : undefined }}>{h.date.slice(0, 4)}</T></DateTile>}
      title={longDate(h.date, lang)}
      detail={[d >= 0 && d < 400 ? s.relDays(d) : null, h.detail].filter(Boolean).join(' · ')}
      trailing="chevron"
      onPress={() => router.push(h.href as never)}
    />
  );
}
