// Choosing the place: GPS (rounded, nearest listed city when close) or a city
// from /api/v1/cities, searchable in English or Gujarati.
import { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';

import { countryName, placeName, t } from '@/lib/i18n';
import { placeFromFix, searchCities } from '@/lib/places';
import type { City, Place } from '@/lib/types';
import { deviceTimeZone, useApp } from '@/state/app';

import { Button, Card, Loading, Notice, T, useColors } from './ui';

export function PlacePicker({ value, onChange }: { value: Place | null; onChange: (p: Place) => void }) {
  const { api, prefs } = useApp();
  const s = t(prefs.lang);
  const c = useColors();
  const [cities, setCities] = useState<City[] | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'locating' | 'denied' | 'error'>('idle');

  useEffect(() => {
    api.cities().then(r => setCities(r.data)).catch(() => setStatus('error'));
  }, [api]);

  const shown = useMemo(() => (cities ? searchCities(cities, query).slice(0, 30) : []), [cities, query]);

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
    <View style={{ gap: 12 }}>
      {value ? (
        <Card>
          <T kind="label">{s.placeChosen}</T>
          <T kind="heading">{placeName(value, prefs.lang)}</T>
          {value.timezone !== 'Asia/Kolkata' ? <T kind="small">{value.timezone.replace(/_/g, ' ')}</T> : null}
        </Card>
      ) : null}
      <Button icon="location.fill" label={status === 'locating' ? s.locating : s.useMyLocation} onPress={locate} disabled={status === 'locating' || !cities} />
      {status === 'denied' ? <Notice text={s.locationDenied} /> : null}
      {status === 'error' ? <Notice text={s.loadError} /> : null}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={s.searchCity}
        placeholderTextColor={c.textMuted}
        autoCorrect={false}
        style={{ borderWidth: 1, borderColor: c.cardBorder, borderRadius: 12, padding: 12, fontSize: 16, color: c.text, backgroundColor: c.card }}
      />
      {!cities && status !== 'error' ? <Loading /> : null}
      <View style={{ gap: 2 }}>
        {shown.map(city => {
          const selected = value?.city === city.city;
          return (
            <Pressable
              key={city.city}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange({ city: city.city, name: city.name, lat: city.lat, lon: city.lon, timezone: city.timezone })}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10,
                backgroundColor: selected ? c.brandSoft : pressed ? c.backgroundElement : 'transparent',
              })}>
              <View style={{ flex: 1 }}>
                <T color={selected ? c.brand : undefined} style={selected ? { fontWeight: '600' } : null}>
                  {city.name[prefs.lang]}{prefs.lang === 'gu' ? `  ·  ${city.name.en}` : ''}
                </T>
                {city.region === 'diaspora' ? <T kind="small">{countryName(city.country, prefs.lang)}</T> : null}
              </View>
              {selected ? <SymbolView name="checkmark" size={15} weight="bold" tintColor={c.brand} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
