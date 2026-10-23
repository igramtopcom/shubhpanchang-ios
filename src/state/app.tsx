// App-wide state: the reader's choices, kept on the phone only (no account,
// nothing sent anywhere but the place, rounded, to the API).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCalendars, getLocales } from 'expo-localization';

import { Api } from '@/lib/api';
import { DEFAULT_SETTINGS, type NotifySettings } from '@/lib/notify-plan';
import { kv } from '@/lib/storage';
import type { FamilyDate, Lang, Place, Sampradaya } from '@/lib/types';

export interface Prefs {
  onboarded: boolean;
  lang: Lang;
  place: Place | null;
  sampradaya: Sampradaya;
  notify: NotifySettings;
  family: FamilyDate[];
  /** Times as 18:21 rather than 6:21 pm / સાંજે 6:21. */
  clock24: boolean;
}

const PREFS_KEY = 'prefs:v1';

/** Gujarati unless the phone's first language is something else we do not offer, then English. */
function defaultLang(): Lang {
  const code = getLocales()[0]?.languageCode ?? 'gu';
  return code === 'gu' ? 'gu' : code === 'en' ? 'en' : 'gu';
}

export function deviceTimeZone(): string {
  return getCalendars()[0]?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Asia/Kolkata';
}

const initialPrefs = (): Prefs => ({
  onboarded: false,
  lang: defaultLang(),
  place: null,
  sampradaya: 'smarta',
  notify: DEFAULT_SETTINGS,
  family: [],
  clock24: false,
});

interface AppState {
  ready: boolean;
  prefs: Prefs;
  update: (patch: Partial<Prefs>) => void;
  api: Api;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs);
  const [ready, setReady] = useState(false);
  const api = useMemo(() => new Api(kv), []);

  useEffect(() => {
    kv.getItem(PREFS_KEY)
      .then(saved => {
        if (!saved) return;
        const s = JSON.parse(saved);
        // Settings added in later versions (notify.festivals...) take their defaults.
        setPrefs({ ...initialPrefs(), ...s, notify: { ...DEFAULT_SETTINGS, ...s.notify } });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      kv.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ready, prefs, update, api }), [ready, prefs, update, api]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}
