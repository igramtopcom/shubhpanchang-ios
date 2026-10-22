// Client for https://shubhpanchang.in/api/v1 (docs/api-v1.md), with an
// offline copy of every answer.
//
// The server engine is the one source of truth (the app never computes a
// tithi itself, so it cannot drift from the website). Every answer is stored
// with the engine version that produced it; when a fresh answer arrives with a
// different engine, everything stored is dropped, because any of it could now
// be wrong. Offline, the last stored answer is served and flagged `stale`.

import type { City, FamilyDate, Festival, LunarDate, Observance, PanchangDay, Place, TithiOccurrence, Sampradaya } from './types'

export const API_BASE = 'https://shubhpanchang.in/api/v1'

/** Minimal async key-value store (src/lib/storage.ts provides the real one). */
export interface KV {
  getItem (key: string): Promise<string | null>
  setItem (key: string, value: string): Promise<void>
  removeItem (key: string): Promise<void>
  getAllKeys (): Promise<string[]>
}

export interface Fetched<T> {
  data: T
  /** True when served from the stored copy because the network failed. */
  stale: boolean
  fetchedAt: number
}

export class ApiError extends Error {
  constructor (public code: string, message: string, public status: number) { super(message) }
}

const CACHE_PREFIX = 'api:'
const ENGINE_KEY = 'api-engine'

/** Location query: a city id when there is one, else rounded coordinates and zone. */
export function placeQuery (p: Place): Record<string, string> {
  return p.city
    ? { city: p.city }
    : { lat: p.lat.toFixed(2), lon: p.lon.toFixed(2), tz: p.timezone }
}

/** Left out for Smarta, so a Smarta reader's stored answers and URLs stay as they were. */
export function sampradayaQuery (s: Sampradaya): Record<string, string> {
  return s === 'smarta' ? {} : { sampradaya: s }
}

function urlFor (path: string, params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return `${API_BASE}${path}${q ? `?${q}` : ''}`
}

/**
 * The global fetch, called as a plain function. Browsers throw "Illegal
 * invocation" when fetch runs with any other `this`, which is what calling it
 * as `this.fetchImpl(...)` would do.
 */
const globalFetch: typeof fetch = (input, init) => fetch(input, init)

/** Identical requests within this window share one answer. */
const RECENT_MS = 30_000
/** Give up on a request after this long and serve the stored answer. */
const TIMEOUT_MS = 15_000

export class Api {
  private fetchImpl: typeof fetch
  constructor (private kv: KV, fetchImpl: typeof fetch = globalFetch) {
    this.fetchImpl = fetchImpl
  }

  /**
   * One request per URL at a time, and its answer reused for a short while:
   * Today, the notification plan, the widgets and Siri all read the same
   * 62-day window when the app opens (four identical requests before this).
   */
  private inFlight = new Map<string, Promise<{ body: any; fetchedAt: number }>>()
  private recent = new Map<string, { body: any; fetchedAt: number }>()

  private fetchBody (url: string): Promise<{ body: any; fetchedAt: number }> {
    const hit = this.recent.get(url)
    if (hit && Date.now() - hit.fetchedAt < RECENT_MS) return Promise.resolve(hit)
    let p = this.inFlight.get(url)
    if (!p) {
      p = (async () => {
        // A request that hangs falls back to the stored answer instead of spinning on.
        const ctl = typeof AbortController === 'function' ? new AbortController() : null
        const timer = ctl ? setTimeout(() => ctl.abort(), TIMEOUT_MS) : null
        try {
          const f = this.fetchImpl
          const res = await f(url, { headers: { Accept: 'application/json' }, signal: ctl?.signal })
          const body = await res.json()
          if (!res.ok) throw new ApiError(body?.error ?? 'HTTP_ERROR', body?.message ?? `HTTP ${res.status}`, res.status)
          await this.noteEngine(body.engine)
          const got = { body, fetchedAt: Date.now() }
          await this.kv.setItem(CACHE_PREFIX + url, JSON.stringify(got))
          this.recent.set(url, got)
          return got
        } finally {
          if (timer) clearTimeout(timer)
          this.inFlight.delete(url)
        }
      })()
      this.inFlight.set(url, p)
    }
    return p
  }

  private async get<T> (path: string, params: Record<string, string | number | undefined>, pick: (body: any) => T): Promise<Fetched<T>> {
    const url = urlFor(path, params)
    const key = CACHE_PREFIX + url
    try {
      const { body, fetchedAt } = await this.fetchBody(url)
      return { data: pick(body), stale: false, fetchedAt }
    } catch (e) {
      // A 4xx is a real answer (bad input), not a network failure: never mask it.
      if (e instanceof ApiError && e.status < 500) throw e
      const saved = await this.kv.getItem(key)
      if (!saved) throw e
      const { body, fetchedAt } = JSON.parse(saved)
      return { data: pick(body), stale: true, fetchedAt }
    }
  }

  /** A new engine version invalidates every stored answer. */
  private async noteEngine (engine: string | undefined) {
    if (!engine) return
    const known = await this.kv.getItem(ENGINE_KEY)
    if (known === engine) return
    if (known !== null) {
      const keys = (await this.kv.getAllKeys()).filter(k => k.startsWith(CACHE_PREFIX))
      await Promise.all(keys.map(k => this.kv.removeItem(k)))
    }
    await this.kv.setItem(ENGINE_KEY, engine)
  }

  cities () {
    return this.get('/cities', {}, b => b.cities.map((c: any) => ({
      city: c.id, name: c.name, country: c.country, region: c.region, lat: c.lat, lon: c.lon, timezone: c.timezone,
    })) as City[])
  }

  panchang (place: Place, from: string, days: number, sampradaya: Sampradaya = 'smarta') {
    return this.get('/panchang', { ...placeQuery(place), from, days, ...sampradayaQuery(sampradaya) }, b => b.days as PanchangDay[])
  }

  observances (place: Place, from: string, to: string, sampradaya: Sampradaya = 'smarta') {
    return this.get('/observances', { ...placeQuery(place), from, to, ...sampradayaQuery(sampradaya) }, b => b.observances as Observance[])
  }

  festivals (place: Place, from: string, to: string, sampradaya: Sampradaya = 'smarta') {
    return this.get('/festivals', { ...placeQuery(place), from, to, ...sampradayaQuery(sampradaya) }, b => b.festivals as Festival[])
  }

  tithiOf (place: Place, date: string, time?: string) {
    return this.get('/tithi-of', { ...placeQuery(place), date, time }, b => b.lunar as LunarDate)
  }

  tithiDates (place: Place, lunar: FamilyDate['lunar'], rule: 'sunrise' | 'aparahna', from: string, count = 1) {
    const paksha = lunar.tithi < 15 ? 'shukla' : 'krishna'
    return this.get('/tithi-dates', {
      ...placeQuery(place),
      month: lunar.month,
      paksha,
      tithi: (lunar.tithi % 15) + 1,
      adhik: lunar.adhik ? 1 : 0,
      rule,
      from,
      count,
    }, b => b.dates as TithiOccurrence[])
  }
}

/** The subscription feed URL for a place (docs/api-v1.md, "Calendar feed for one place"). */
export function feedUrl (p: Place, lang: 'gu' | 'en', scheme: 'webcal' | 'https' = 'webcal', sampradaya: Sampradaya = 'smarta'): string {
  const path = p.city
    ? `${p.city}.ics`
    : `${p.lat.toFixed(2)},${p.lon.toFixed(2)}/${p.timezone}.ics`
  return `${scheme}://shubhpanchang.in/feed/${lang}/${path}${sampradaya === 'smarta' ? '' : `?sampradaya=${sampradaya}`}`
}
