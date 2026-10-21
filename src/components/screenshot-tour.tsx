// Walks the app through TOUR (src/lib/tour.ts) in a screenshot build.
// Rendered by the root layout only when SCREENSHOT_BUILD is true.
import { useEffect } from 'react';
import { router } from 'expo-router';

import { DEFAULT_SETTINGS } from '@/lib/notify-plan';
import { TOUR, TOUR_START, TOUR_STEP, type TourStep } from '@/lib/tour';
import { useApp } from '@/state/app';

export function ScreenshotTour() {
  const { api, update } = useApp();

  useEffect(() => {
    const seed = async (s: NonNullable<TourStep['seed']>) => {
      const cities = (await api.cities()).data;
      const c = cities.find(x => x.city === s.city) ?? cities[0];
      update({
        onboarded: true,
        lang: s.lang,
        place: { city: c.city, name: c.name, lat: c.lat, lon: c.lon, timezone: c.timezone },
        notify: { ...DEFAULT_SETTINGS, kinds: ['ekadashi', 'purnima', 'amavasya', 'sankashti', 'pradosh', 'shivaratri'] },
        family: [
          { id: 'tour-ba', name: s.lang === 'gu' ? 'બા' : 'Ba', kind: 'shraddh', lunar: { month: 5, adhik: false, tithi: 19 } },
          { id: 'tour-dada', name: s.lang === 'gu' ? 'દાદા' : 'Dada', kind: 'birthday', lunar: { month: 6, adhik: false, tithi: 9 }, origin: { date: '1946-10-05' } },
        ],
      });
    };
    const go = (route: TourStep['route']) => {
      // Leave any modal (family-add, place) before opening a tab.
      if (router.canDismiss()) router.dismissAll();
      if (route !== '/') router.navigate(route);
      else router.navigate('/');
    };
    const timers = TOUR.map((step, i) => setTimeout(async () => {
      try {
        if (step.seed) await seed(step.seed);
        // The protected stack needs a beat to swap onboarding for the tabs.
        setTimeout(() => go(step.route), step.seed ? 800 : 0);
      } catch { /* a missed step only costs its screenshot */ }
    }, (TOUR_START + i * TOUR_STEP) * 1000));
    return () => timers.forEach(clearTimeout);
  }, [api, update]);

  return null;
}
