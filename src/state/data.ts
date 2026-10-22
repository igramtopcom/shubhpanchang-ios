// Data hooks over the API client. Each returns what is known now (stored or
// fresh), whether it came from the stored copy, and a reload.
import { useCallback, useEffect, useState } from 'react';

import type { Fetched } from '@/lib/api';
import { shiftDate, zonedNow } from '@/lib/time';
import type { FamilyDate, Festival, Observance, PanchangDay, Place, TithiOccurrence } from '@/lib/types';

import { useApp } from './app';

export interface Loaded<T> {
  data: T | null;
  stale: boolean;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

function useLoad<T>(key: string | null, load: () => Promise<Fetched<T>>): Loaded<T> {
  // State is tagged with the request it answers, so "loading" and "which data
  // belongs to this key" are derived in render, never set at the start of the effect.
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<{ key: string | null; req: string | null; data: T | null; stale: boolean; error: string | null }>(
    { key: null, req: null, data: null, stale: false, error: null });
  const req = key ? `${key}#${tick}` : null;
  useEffect(() => {
    if (!key || !req) return;
    let live = true;
    load()
      .then(r => { if (live) setState({ key, req, data: r.data, stale: r.stale, error: null }); })
      .catch(e => { if (live) setState(s => ({ ...s, key, req, data: s.key === key ? s.data : null, error: String(e?.message ?? e) })); });
    return () => { live = false; };
    // `load` closes over the same inputs as `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req]);
  const reload = useCallback(() => setTick(t => t + 1), []);
  const mine = state.key === key;
  return {
    data: mine ? state.data : null,
    stale: mine && state.stale,
    error: mine ? state.error : null,
    loading: !!req && state.req !== req,
    reload,
  };
}

const placeKey = (p: Place | null) => (p ? (p.city ?? `${p.lat},${p.lon},${p.timezone}`) : null);

/** The place's clock, re-read every 30 seconds. */
export function useNow(timeZone: string | undefined) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);
  return zonedNow(timeZone ?? 'Asia/Kolkata');
}

/** Yesterday to eight weeks ahead: today's screen, the widgets and the notification plan. */
export function usePanchangWindow(): Loaded<PanchangDay[]> & { today: string } {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const today = useNow(place?.timezone).date;
  const from = shiftDate(today, -1);
  const sampradaya = prefs.sampradaya;
  const key = place ? `panchang:${placeKey(place)}:${sampradaya}:${from}` : null;
  const res = useLoad(key, () => api.panchang(place!, from, 62, sampradaya));
  return { ...res, today };
}

export function useMonth(month: string): Loaded<PanchangDay[]> {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const first = `${month}-01`;
  const [y, m] = month.split('-').map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const sampradaya = prefs.sampradaya;
  const key = place ? `month:${placeKey(place)}:${sampradaya}:${month}` : null;
  return useLoad(key, () => api.panchang(place!, first, days, sampradaya));
}

export function useObservances(from: string, to: string): Loaded<Observance[]> {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const sampradaya = prefs.sampradaya;
  const key = place ? `obs:${placeKey(place)}:${sampradaya}:${from}:${to}` : null;
  return useLoad(key, () => api.observances(place!, from, to, sampradaya));
}

export function useFestivals(from: string, to: string): Loaded<Festival[]> {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const key = place ? `fest:${placeKey(place)}:${from}:${to}` : null;
  return useLoad(key, () => api.festivals(place!, from, to));
}

/** The next day each family date falls on, from today. */
export function useFamilyNext(today: string): Loaded<{ person: FamilyDate; next: TithiOccurrence | null }[]> {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const key = place ? `family:${placeKey(place)}:${today}:${prefs.family.map(f => f.id + f.lunar.month + f.lunar.tithi + f.kind).join(',')}` : null;
  return useLoad(key, async () => {
    let stale = false;
    const rows = await Promise.all(prefs.family.map(async person => {
      try {
        const r = await api.tithiDates(place!, person.lunar, person.kind === 'shraddh' ? 'aparahna' : 'sunrise', today, 1);
        stale ||= r.stale;
        return { person, next: r.data[0] ?? null };
      } catch {
        return { person, next: null };
      }
    }));
    return { data: rows, stale, fetchedAt: Date.now() };
  });
}
