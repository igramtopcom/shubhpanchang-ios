// Keeps the Home Screen and Lock Screen widgets current: whenever the days,
// the vrat list, the language or the chosen vrats change (and each time the
// app opens), two days of Today entries and a week of Next-vrat entries are
// handed to WidgetKit. Between app opens the widgets run on that timeline.
import { useEffect } from 'react';

import { todayEntries, vratEntries } from '@/lib/widget-feed';
import { shiftDate } from '@/lib/time';
import { useApp } from '@/state/app';
import { useNow, useObservances, usePanchangWindow } from '@/state/data';
import TodayWidget from '@/widgets/today-widget';
import VratWidget from '@/widgets/vrat-widget';

export function WidgetSync() {
  const { prefs } = useApp();
  const place = prefs.place;
  const now = useNow(place?.timezone);
  const days = usePanchangWindow();
  const obs = useObservances(now.date, shiftDate(now.date, 62));

  const ready = !!place && !!days.data && !!obs.data;
  const signature = ready
    ? JSON.stringify([now.date, prefs.lang, prefs.notify.kinds, place!.timezone, days.data!.length, obs.data!.map(o => o.date + o.kind)])
    : '';

  useEffect(() => {
    if (!ready) return;
    const common = { nowMs: Date.now(), today: now.date, timeZone: place!.timezone, lang: prefs.lang, kinds: prefs.notify.kinds };
    try {
      TodayWidget.updateTimeline(todayEntries({ ...common, days: days.data!, observances: obs.data! }));
      VratWidget.updateTimeline(vratEntries({ ...common, observances: obs.data! }));
    } catch { /* no widget extension (web preview): nothing to update */ }
    // Rebuilt when what the timeline reads changes, not on every clock tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return null;
}
