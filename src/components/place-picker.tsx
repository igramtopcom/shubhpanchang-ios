// Choosing the place: GPS (rounded, nearest listed city when close) or a city
// from /api/v1/cities, searchable in English or Gujarati.
import { useEffect, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';

import { countryName, t } from '@/lib/i18n';
import { placeFromFix, searchCities } from '@/lib/places';
import type { City, Place } from '@/lib/types';
import { deviceTimeZone, useApp } from '@/state/app';

import { Cell, Group, List, Loading, Notice, T, useColors } from './ui';

export function PlacePicker({ value, onChange }: { value: Place | null; onChange: (p: Place) => void }) {
  const { api, prefs } = useApp();
  const lang = prefs.lang;
  const s = t(lang);
  const c = useColors();
  const [cities, setCities] = useState<City[] | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'locating' | 'denied' | 'error'>('idle');

  useEffect(() => {
    api.cities().then(r => setCities(r.data)).catch(() => setStatus('error'));
  }, [api]);

  const shown = useMemo(() => (cities ? searchCities(cities, query).slice(0, 40) : []), [cities, query]);
  // Without a query: the cities abroad first for a phone set to a zone outside India, Gujarat's first otherwise.
  const abroad = !deviceTimeZone().startsWith('Asia/Kolkata') && !deviceTimeZone().startsWith('Asia/Calcutta');
  const groups = query ? [{ title: '', rows: shown }] : [
    { title: abroad ? s.citiesAbroad : s.citiesGujarat, rows: shown.filter(x => (abroad ? x.region === 'diaspora' : x.region === 'gujarati')) },
    { title: abroad ? s.citiesGujarat : s.citiesAbroad, rows: shown.filter(x => (abroad ? x.region === 'gujarati' : x.region === 'diaspora')) },
  ];

  async function locate() {
    setStatus('locating');
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { setStatus('denied'); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      onChange(placeFromFix({ lat: pos.coords.latitude, lon: pos.coords.longitude }, deviceTimeZone(), cities ?? []));
      setStatus('idle');
    } catch {
      setStatus('denied');
    }
  }

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.backgroundElement, borderRadius: 999, paddingHorizontal: 14, minHeight: 44 }}>
        <SymbolView name="magnifyingglass" size={15} tintColor={c.textSecondary} />
        <TextInput value={query} onChangeText={setQuery} placeholder={s.searchCity} placeholderTextColor={c.textMuted} autoCorrect={false} clearButtonMode="while-editing"
          style={{ flex: 1, fontSize: 16, color: c.text, paddingVertical: 10 }} accessibilityLabel={s.searchCity} />
      </View>
      <List>
        <Cell first icon="location.fill" tint={c.brand} label={status === 'locating' ? s.locating : s.useMyLocation} sub={s.locationRounded} onPress={cities ? locate : undefined} />
      </List>
      {status === 'denied' ? <Notice text={s.locationDenied} /> : null}
      {status === 'error' ? <Notice text={s.loadError} /> : null}
      {!cities && status !== 'error' ? <Loading /> : null}
      {groups.filter(g => g.rows.length).map(g => (
        <Group key={g.title || 'all'} title={g.title || undefined}>
          {g.rows.map((city, i) => (
            <Cell key={city.city} first={i === 0}
              label={`${city.name[lang]}${lang === 'gu' && city.name.en !== city.name.gu ? `  ·  ${city.name.en}` : ''}`}
              sub={city.region === 'diaspora' ? countryName(city.country, lang) : undefined}
              radio={value?.city === city.city}
              onPress={() => onChange({ city: city.city, name: city.name, lat: city.lat, lon: city.lon, timezone: city.timezone })} />
          ))}
        </Group>
      ))}
      {value && !value.city ? <T kind="caption" style={{ marginLeft: 6 }}>{s.placeChosen}: {value.lat.toFixed(2)}, {value.lon.toFixed(2)}</T> : null}
    </View>
  );
}
