// Data hooks over the API client. Each returns what is known now (stored or
// fresh), whether it came from the stored copy, and a reload.
import { useCallback, useEffect, useState } from 'react';

import type { Fetched } from '@/lib/api';
import { shiftDate, zonedNow } from '@/lib/time';
import { firstFrom } from '@/lib/upcoming';
import type { FamilyDate, Festival, FestivalDetail, Observance, PanchangDay, Place, Sampradaya, TithiOccurrence } from '@/lib/types';

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

/** `days` days from `from` (a day the Today window does not cover: a date picked in the calendar). */
export function useDays(from: string | null, days: number): Loaded<PanchangDay[]> {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const sampradaya = prefs.sampradaya;
  const key = place && from ? `days:${placeKey(place)}:${sampradaya}:${from}:${days}` : null;
  return useLoad(key, () => api.panchang(place!, from!, days, sampradaya));
}

/** The panchang of `date` and the day after it (whose early hours finish the night's choghadiya). */
export function useDay(date: string): { day: PanchangDay | null; next: PanchangDay | null; prev: PanchangDay | null; loading: boolean; error: string | null; stale: boolean; reload: () => void } {
  const win = usePanchangWindow();
  const inWin = !!win.data?.some(d => d.date === date) && !!win.data?.some(d => d.date === shiftDate(date, 1));
  const own = useDays(inWin ? null : shiftDate(date, -1), 3);
  const src = inWin ? win : own;
  const pick = (d: string) => src.data?.find(x => x.date === d) ?? null;
  return { day: pick(date), next: pick(shiftDate(date, 1)), prev: pick(shiftDate(date, -1)), loading: src.loading, error: src.error, stale: src.stale, reload: src.reload };
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

/** The observances as one given sampradaya keeps them (to set the traditions side by side). */
export function useObservancesAs(from: string, to: string, sampradaya: Sampradaya | null): Loaded<Observance[]> {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const key = place && sampradaya ? `obs:${placeKey(place)}:${sampradaya}:${from}:${to}` : null;
  return useLoad(key, () => api.observances(place!, from, to, sampradaya!));
}

/** One festival with its write-up and muhurat at the place. */
export function useFestivalDetail(slug: string | null): Loaded<FestivalDetail> {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const key = place && slug ? `festdetail:${placeKey(place)}:${prefs.sampradaya}:${slug}` : null;
  return useLoad(key, () => api.festival(place!, slug!, prefs.sampradaya));
}

export function useFestivals(from: string, to: string): Loaded<Festival[]> {
  const { api, prefs } = useApp();
  const place = prefs.place;
  const sampradaya = prefs.sampradaya;
  const key = place ? `fest:${placeKey(place)}:${sampradaya}:${from}:${to}` : null;
  return useLoad(key, () => api.festivals(place!, from, to, sampradaya));
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
        const r = await api.tithiDates(place!, person.lunar, person.kind === 'shraddh' ? 'aparahna' : 'sunrise', firstFrom(person, today), 1);
        stale ||= r.stale;
        return { person, next: r.data[0] ?? null };
      } catch {
        return { person, next: null };
      }
    }));
    return { data: rows, stale, fetchedAt: Date.now() };
  });
}
