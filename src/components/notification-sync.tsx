// Keeps the phone's pending notifications equal to the current plan: whenever
// the days, the vrat list, the family dates or the settings change (and each
// time the app opens), the plan is rebuilt and scheduled again.
import { useEffect } from 'react';
import { router } from 'expo-router';

import { addTapListener, applyPlan, notificationsSupported } from '@/lib/notify';
import { planNotifications } from '@/lib/notify-plan';
import { shiftDate } from '@/lib/time';
import { routeForWebPath } from '@/lib/links';
import { useApp } from '@/state/app';
import { useFamilyNext, useNow, useObservances, usePanchangWindow } from '@/state/data';

export function NotificationSync() {
  const { prefs } = useApp();
  const place = prefs.place;
  const now = useNow(place?.timezone);
  const days = usePanchangWindow();
  const obs = useObservances(now.date, shiftDate(now.date, 62));
  const family = useFamilyNext(now.date);

  useEffect(() => addTapListener(url => router.navigate(routeForWebPath(url))), []);

  const ready = !!place && !!days.data && !!obs.data && !!family.data;
  const signature = ready
    ? JSON.stringify([now.date, prefs.lang, prefs.notify, days.data!.length, obs.data!.map(o => o.date), family.data!.map(f => f.next?.date)])
    : '';

  useEffect(() => {
    if (!ready || !notificationsSupported) return;
    const plan = planNotifications({
      now,
      settings: prefs.notify,
      lang: prefs.lang,
      observances: obs.data!,
      family: family.data!.filter(f => f.next).map(f => ({ person: f.person, date: f.next!.date })),
      days: days.data!.filter(d => d.date >= now.date),
    });
    applyPlan(plan, place!.timezone).catch(() => {});
    // Rebuilt when what the plan reads changes, not on every clock tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return null;
}
