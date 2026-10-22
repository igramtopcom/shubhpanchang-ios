// Writes what Siri answers for "Today's tithi" and "Next vrat" (the App
// Shortcuts in plugins/app-shortcuts) into the app's UserDefaults, for the
// coming two weeks, whenever the days or the vrat list change.
import { useEffect } from 'react';
import { Platform, Settings } from 'react-native';

import { siriToday, siriVrat } from '@/lib/siri-feed';
import { shiftDate } from '@/lib/time';
import { useApp } from '@/state/app';
import { useFestivals, useNow, useObservances, usePanchangWindow } from '@/state/data';

export function SiriSync() {
  const { prefs } = useApp();
  const place = prefs.place;
  const now = useNow(place?.timezone);
  const days = usePanchangWindow();
  const obs = useObservances(now.date, shiftDate(now.date, 62));
  const fest = useFestivals(now.date, shiftDate(now.date, 62));

  const ready = Platform.OS === 'ios' && !!place && !!days.data && !!obs.data;
  const signature = ready ? JSON.stringify([now.date, prefs.notify.kinds, place!.lat, place!.lon, days.data!.length, obs.data!.length, fest.data?.length ?? 0]) : '';

  useEffect(() => {
    if (!ready) return;
    const name = place!.name?.en ?? 'your place';
    Settings.set({
      'siri.today': JSON.stringify(siriToday(days.data!, name, now.date, 14, fest.data ?? [])),
      'siri.vrat': JSON.stringify(siriVrat(obs.data!, prefs.notify.kinds, now.date)),
    });
    // Rewritten when what it reads changes, not on every clock tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return null;
}
