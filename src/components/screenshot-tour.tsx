// Opens the tour step CI launched the app for (src/lib/tour.ts).
// Rendered by the root layout only when SCREENSHOT_BUILD is true.
import { useEffect } from 'react';
import { Platform, Settings } from 'react-native';
import { router } from 'expo-router';

import { DEFAULT_SETTINGS } from '@/lib/notify-plan';
import { TOUR, seedFor, stepIndex } from '@/lib/tour';
import { useApp } from '@/state/app';

export function ScreenshotTour() {
  const { api, update } = useApp();

  useEffect(() => {
    // iOS keeps launch arguments (-tourStep N) in NSUserDefaults, which Settings reads.
    const step = Platform.OS === 'ios' ? stepIndex(Settings.get('tourStep')) : null;
    if (step === null) return;
    let live = true;
    (async () => {
      const s = seedFor(step);
      const cities = (await api.cities()).data;
      const c = cities.find(x => x.city === s.city) ?? cities[0];
      if (!live) return;
      update({
        onboarded: true,
        lang: s.lang,
        place: { city: c.city, name: c.name, lat: c.lat, lon: c.lon, timezone: c.timezone },
        notify: { ...DEFAULT_SETTINGS, kinds: ['ekadashi', 'purnima', 'amavasya', 'sankashti', 'pradosh', 'shivaratri'] },
        family: [
          { id: 'tour-ba', name: s.lang === 'gu' ? 'બા' : 'Ba', kind: 'shraddh', lunar: { month: 5, adhik: false, tithi: 19 } },
          { id: 'tour-dada', name: s.lang === 'gu' ? 'દાદા' : 'Dada', kind: 'birthday', lunar: { month: 6, adhik: false, tithi: 9 }, origin: { date: '1946-10-05' } },
          { id: 'tour-mom', name: s.lang === 'gu' ? 'મમ્મી' : 'Mom', kind: 'birthday', lunar: { month: 7, adhik: false, tithi: 4 }, origin: { date: '1972-11-13' } },
        ],
      });
      // The protected stack needs a beat to swap onboarding for the tabs.
      setTimeout(() => { if (live) router.navigate(TOUR[step].route as never); }, 800);
    })().catch(() => { /* a missed step only costs its screenshot */ });
    return () => { live = false; };
  }, [api, update]);

  return null;
}
