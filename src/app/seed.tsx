// shubhpanchang://seed?lang=gu&city=ahmedabad: screenshot builds only.
//
// Fills in the language, the place and two sample family dates, then opens
// Today, so the CI screenshot run can show every screen without tapping
// through onboarding. In every other build (SEED_ENABLED false) it only
// redirects to Today and changes nothing.
import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { SEED_ENABLED } from '@/lib/links';
import { DEFAULT_SETTINGS } from '@/lib/notify-plan';
import type { Lang } from '@/lib/types';
import { useApp } from '@/state/app';

export default function Seed() {
  const { lang, city } = useLocalSearchParams<{ lang?: string; city?: string }>();
  const { api, update } = useApp();

  useEffect(() => {
    if (!SEED_ENABLED) {
      router.replace('/');
      return;
    }
    const l: Lang = lang === 'en' ? 'en' : 'gu';
    api.cities()
      .then(r => {
        const c = r.data.find(x => x.city === (city || 'ahmedabad')) ?? r.data[0];
        update({
          onboarded: true,
          lang: l,
          place: { city: c.city, name: c.name, lat: c.lat, lon: c.lon, timezone: c.timezone },
          notify: { ...DEFAULT_SETTINGS, kinds: ['ekadashi', 'purnima', 'amavasya', 'sankashti', 'pradosh', 'shivaratri'] },
          family: [
            { id: 'seed-ba', name: l === 'gu' ? 'બા' : 'Ba', kind: 'shraddh', lunar: { month: 5, adhik: false, tithi: 19 } },
            { id: 'seed-dada', name: l === 'gu' ? 'દાદા' : 'Dada', kind: 'birthday', lunar: { month: 6, adhik: false, tithi: 9 }, origin: { date: '1946-10-05' } },
          ],
        });
      })
      .catch(() => {})
      .finally(() => router.replace('/'));
  }, [api, city, lang, update]);

  return null;
}
