import { describe, it, expect } from 'vitest'
import panchang from './fixtures/panchang-ahmedabad.json'
import observancesNj from './fixtures/observances-nj.json'
import { timeline, shubhNow, chogTier } from '../src/lib/shubh'
import { toMinutes, hhmm, zonedNow, zonedTimeToUtc, shiftDate } from '../src/lib/time'
import { planNotifications, DEFAULT_SETTINGS, PLAN_LIMIT } from '../src/lib/notify-plan'
import { STRINGS, lunarLabel, tithiName, longDate } from '../src/lib/i18n'
import { Api, feedUrl, placeQuery, type KV } from '../src/lib/api'
import type { Observance, PanchangDay } from '../src/lib/types'

/* Fixtures are real /api/v1 answers: Ahmedabad 21-23 Oct 2026, New Jersey
 * observances Oct-Dec 2026. 22 Oct, day block: Shubh 06:39, Rog 08:06,
 * Udveg 09:32, Char 10:58, Labh 12:24, Amrit 13:50-15:16, Kaal, Shubh 16:42;
 * Rahu Kaal 13:50-15:16, which swallows the whole Amrit slot. */

const days = panchang.days as unknown as PanchangDay[]
const T = timeline(days, '2026-10-22')
const at = (h: number, m: number, dayOffset = 0) => dayOffset * 1440 + h * 60 + m

describe('next good time (shubh.ts)', () => {
  it('uses the website\'s tiers', () => {
    expect(['Amrit', 'Shubh', 'Labh'].map(chogTier)).toEqual(['best', 'best', 'best'])
    expect(chogTier('Char')).toBe('ok')
    expect(['Udveg', 'Rog', 'Kaal'].map(chogTier)).toEqual(['avoid', 'avoid', 'avoid'])
  })

  it('in a bad slot, points at the next good one', () => {
    const n = shubhNow(T, at(9, 0)) // Rog
    expect(n.slot?.name).toBe('Rog')
    expect(n.good).toBeNull()
    expect(n.next?.name).toBe('Labh')
    expect(hhmm(n.next!.start)).toBe('12:24')
  })

  it('a good slot swallowed by Rahu Kaal is not offered', () => {
    const n = shubhNow(T, at(13, 0)) // inside Labh 12:24-13:50
    expect(n.good?.name).toBe('Labh')
    expect(hhmm(n.good!.end)).toBe('13:50')
    // Amrit 13:50-15:16 is entirely Rahu Kaal, so the next is Shubh 16:42.
    expect(n.next?.name).toBe('Shubh')
    expect(hhmm(n.next!.start)).toBe('16:42')
  })

  it('reports Rahu Kaal while it runs', () => {
    const n = shubhNow(T, at(14, 0))
    expect(n.rahu).not.toBeNull()
    expect(hhmm(n.rahu!.end)).toBe('15:16')
    expect(n.good).toBeNull()
  })

  it('crosses midnight through the night block (00:24 Labh belongs to the evening before)', () => {
    const n = shubhNow(T, at(0, 30, 1)) // 23 Oct 00:30, inside 22 Oct's night block
    expect(n.slot?.name).toBe('Labh')
    expect(n.slot?.period).toBe('night')
    expect(n.good?.name).toBe('Labh')
  })

  it('before sunrise, the previous evening\'s night block is running', () => {
    const n = shubhNow(T, at(5, 30)) // 22 Oct 05:30: night block of 21 Oct
    expect(n.slot?.period).toBe('night')
  })
})

describe('time helpers', () => {
  it('parses and prints clock times', () => {
    expect(toMinutes('06:39')).toBe(399)
    expect(toMinutes('6:39pm')).toBe(-1)
    expect(hhmm(1439.6)).toBe('00:00')
  })

  it('turns a wall time at a place into an instant, across DST', () => {
    expect(zonedTimeToUtc('2026-10-22', 6 * 60 + 39, 'Asia/Kolkata').toISOString()).toBe('2026-10-22T01:09:00.000Z')
    // New York: EDT (-4) before 1 Nov 2026, EST (-5) after.
    expect(zonedTimeToUtc('2026-10-31', 19 * 60, 'America/New_York').toISOString()).toBe('2026-10-31T23:00:00.000Z')
    expect(zonedTimeToUtc('2026-11-02', 19 * 60, 'America/New_York').toISOString()).toBe('2026-11-03T00:00:00.000Z')
    expect(zonedNow('Asia/Kolkata', new Date('2026-10-21T20:00:00Z'))).toEqual({ date: '2026-10-22', minutes: 90 })
  })
})

describe('notification plan (notify-plan.ts)', () => {
  const obs = observancesNj.observances as unknown as Observance[]
  const base = {
    now: { date: '2026-10-01', minutes: 8 * 60 },
    settings: DEFAULT_SETTINGS,
    lang: 'en' as const,
    observances: obs,
    family: [],
    days: [] as PanchangDay[],
  }

  it('reminds the evening before each vrat and at Parana', () => {
    const plan = planNotifications(base)
    // Within the 60-day horizon from 1 Oct (reminders fire the evening before).
    const eka = obs.filter(o => o.kind === 'ekadashi' && shiftDate(o.date, -1) <= shiftDate('2026-10-01', 60))
    expect(eka.length).toBeGreaterThanOrEqual(4)
    // ...and nothing beyond it.
    expect(plan.every(p => p.date <= shiftDate('2026-10-01', 60))).toBe(true)
    for (const o of eka) {
      const eve = plan.find(p => p.id === `eve:ekadashi:${o.date}`)
      expect(eve?.date).toBe(shiftDate(o.date, -1))
      expect(eve?.minutes).toBe(19 * 60)
      if (o.parana) expect(plan.find(p => p.id === `parana:${o.date}`)?.minutes).toBe(toMinutes(o.parana.start))
    }
    expect(plan.some(p => p.id.startsWith('moon:'))).toBe(true)
  })

  it('never schedules in the past', () => {
    const plan = planNotifications({ ...base, now: { date: '2026-11-15', minutes: 12 * 60 } })
    expect(plan.every(p => p.date > '2026-11-15' || (p.date === '2026-11-15' && p.minutes > 720))).toBe(true)
  })

  it('stays under iOS\'s 64, dropping morning digests before any vrat reminder', () => {
    const many = Array.from({ length: 60 }, (_, i) => ({ ...days[1], date: shiftDate('2026-10-02', i) }))
    const plan = planNotifications({ ...base, days: many })
    expect(plan.length).toBe(PLAN_LIMIT)
    const vratAll = planNotifications({ ...base }).length
    expect(plan.filter(p => p.priority === 1).length).toBe(vratAll)
    expect(plan.filter(p => p.priority === 3).length).toBe(PLAN_LIMIT - vratAll)
    // What is kept is in time order.
    expect(plan.map(p => p.date + p.minutes).join()).toBe([...plan].sort((a, b) => a.date.localeCompare(b.date) || a.minutes - b.minutes).map(p => p.date + p.minutes).join())
  })

  it('family dates come before morning digests and read the lunar date', () => {
    const plan = planNotifications({
      ...base,
      lang: 'gu',
      family: [{ person: { id: 'ba', name: 'બા', kind: 'shraddh', lunar: { month: 5, adhik: false, tithi: 19 } }, date: '2026-10-28' }],
    })
    const f = plan.find(p => p.id.startsWith('family:ba'))!
    expect(f.date).toBe('2026-10-27')
    expect(f.body).toBe('શ્રાદ્ધ (ભાદરવો વદ પાંચમ)')
  })
})

describe('i18n', () => {
  it('has every string in both languages', () => {
    expect(Object.keys(STRINGS.gu).sort()).toEqual(Object.keys(STRINGS.en).sort())
  })
  it('names tithis the way a Gujarati wall calendar does', () => {
    expect(lunarLabel({ month: 6, adhik: false, tithi: 9 }, 'gu')).toBe('આસો સુદ દશમ')
    expect(lunarLabel({ month: 2, adhik: true, tithi: 10 }, 'en')).toBe('Jyeshtha (Adhik) Shukla Ekadashi')
    expect(tithiName(29, 'gu')).toBe('અમાસ')
    expect(longDate('2026-10-22', 'gu')).toBe('ગુરુવાર, 22 ઑક્ટોબર')
  })
})

describe('api client', () => {
  const memory = (): KV & { data: Map<string, string> } => {
    const data = new Map<string, string>()
    return {
      data,
      getItem: async k => data.get(k) ?? null,
      setItem: async (k, v) => { data.set(k, v) },
      removeItem: async k => { data.delete(k) },
      getAllKeys: async () => [...data.keys()],
    }
  }
  const ok = (body: unknown) => async () => new Response(JSON.stringify(body), { status: 200 })
  const place = { city: 'ahmedabad', name: null, lat: 23.02, lon: 72.57, timezone: 'Asia/Kolkata' }

  it('serves the stored copy, flagged stale, when the network fails', async () => {
    const kv = memory()
    const first = await new Api(kv, ok(panchang) as any).panchang(place, '2026-10-21', 3)
    expect(first.stale).toBe(false)
    const down = async () => { throw new TypeError('Network request failed') }
    const again = await new Api(kv, down as any).panchang(place, '2026-10-21', 3)
    expect(again.stale).toBe(true)
    expect(again.data[1].date).toBe('2026-10-22')
  })

  it('drops every stored answer when the engine version changes', async () => {
    const kv = memory()
    await new Api(kv, ok(panchang) as any).panchang(place, '2026-10-21', 3)
    await new Api(kv, ok({ ...panchang, engine: 'v99', cities: [] }) as any).cities()
    expect([...kv.data.keys()].filter(k => k.includes('/panchang'))).toEqual([])
  })

  it('does not hide a 4xx behind the stored copy', async () => {
    const kv = memory()
    const bad = async () => new Response(JSON.stringify({ error: 'INVALID_DATE', message: 'x' }), { status: 400 })
    await expect(new Api(kv, bad as any).panchang(place, '2031-01-01', 1)).rejects.toMatchObject({ code: 'INVALID_DATE' })
  })

  it('builds place queries and feed URLs like the server expects', () => {
    expect(placeQuery(place)).toEqual({ city: 'ahmedabad' })
    expect(placeQuery({ ...place, city: null, lat: 40.5187, lon: -74.4121, timezone: 'America/New_York' }))
      .toEqual({ lat: '40.52', lon: '-74.41', tz: 'America/New_York' })
    expect(feedUrl(place, 'gu')).toBe('webcal://shubhpanchang.in/feed/gu/ahmedabad.ics')
    expect(feedUrl({ ...place, city: null, lat: 40.5187, lon: -74.4121, timezone: 'America/New_York' }, 'en'))
      .toBe('webcal://shubhpanchang.in/feed/en/40.52,-74.41/America/New_York.ics')
  })
})

import { routeForWebPath } from '../src/lib/links'
import { placeFromFix, searchCities, distanceKm } from '../src/lib/places'
import type { City } from '../src/lib/types'

describe('Universal Links land on the right screen', () => {
  it('maps every path the website claims', () => {
    expect(routeForWebPath('/')).toBe('/')
    expect(routeForWebPath('/panchang/ahmedabad/2026-10-22')).toBe('/')
    expect(routeForWebPath('/choghadiya/surat?lang=en&ref=wa')).toBe('/')
    expect(routeForWebPath('/hora')).toBe('/')
    expect(routeForWebPath('/ekadashi-2027')).toBe('/vrat')
    expect(routeForWebPath('/sankashti-chaturthi-2026?city=london-uk')).toBe('/vrat')
    expect(routeForWebPath('/festivals/diwali-2026')).toBe('/vrat')
    expect(routeForWebPath('/calendar/2027/3')).toBe('/calendar')
    expect(routeForWebPath('https://shubhpanchang.in/purnima-2028')).toBe('/vrat')
  })
  it('opens Today for anything else, and never throws', () => {
    expect(routeForWebPath('/kundali')).toBe('/')
    expect(routeForWebPath('::not a url::')).toBe('/')
    expect(routeForWebPath('/family')).toBe('/family')
  })
})

describe('place from a GPS fix', () => {
  const cities: City[] = [
    { city: 'ahmedabad', name: { en: 'Ahmedabad', gu: 'અમદાવાદ' }, country: 'IN', region: 'gujarati', lat: 23.0225, lon: 72.5714, timezone: 'Asia/Kolkata' },
    { city: 'newjersey-us', name: { en: 'New Jersey', gu: 'ન્યૂ જર્સી' }, country: 'US', region: 'diaspora', lat: 40.7178, lon: -74.0431, timezone: 'America/New_York' },
  ]
  it('uses a listed city within reach', () => {
    expect(placeFromFix({ lat: 23.05, lon: 72.6 }, 'Asia/Kolkata', cities).city).toBe('ahmedabad')
  })
  it('keeps rounded coordinates further away', () => {
    const p = placeFromFix({ lat: 39.9526, lon: -75.1652 }, 'America/New_York', cities) // Philadelphia
    expect(p.city).toBeNull()
    expect([p.lat, p.lon, p.timezone]).toEqual([39.95, -75.17, 'America/New_York'])
    expect(distanceKm({ lat: 39.9526, lon: -75.1652 }, cities[1])).toBeGreaterThan(40)
  })
  it('searches English and Gujarati names', () => {
    expect(searchCities(cities, 'amd')).toEqual([])
    expect(searchCities(cities, 'ahm')[0].city).toBe('ahmedabad')
    expect(searchCities(cities, 'જર્સી')[0].city).toBe('newjersey-us')
  })
})

describe('api client calls fetch the way browsers allow', () => {
  it('never calls fetch with the client as `this`', async () => {
    // Browsers throw "Illegal invocation" for fetch called on another object.
    const strict = function (this: unknown) {
      if (this !== undefined && this !== globalThis) throw new TypeError('Illegal invocation')
      return Promise.resolve(new Response(JSON.stringify({ engine: 'v12', cities: [] }), { status: 200 }))
    } as unknown as typeof fetch
    const store = new Map<string, string>()
    const kv = {
      getItem: async (k: string) => store.get(k) ?? null,
      setItem: async (k: string, v: string) => { store.set(k, v) },
      removeItem: async (k: string) => { store.delete(k) },
      getAllKeys: async () => [...store.keys()],
    }
    await expect(new Api(kv, strict).cities()).resolves.toMatchObject({ stale: false })
  })
})

describe('the app scheme and the screenshot seed link', () => {
  it('reads shubhpanchang://<route> like the web paths', () => {
    expect(routeForWebPath('shubhpanchang://vrat')).toBe('/vrat')
    expect(routeForWebPath('shubhpanchang://family-add')).toBe('/family-add')
    expect(routeForWebPath('shubhpanchang://settings/')).toBe('/settings')
    expect(routeForWebPath('shubhpanchang://')).toBe('/')
  })
})

import { TOUR, TOUR_START, TOUR_STEP } from '../src/lib/tour'

describe('screenshot tour', () => {
  it('names every capture once and starts with a seeded Today', () => {
    expect(new Set(TOUR.map(s => s.shot)).size).toBe(TOUR.length)
    expect(TOUR[0].seed && TOUR[0].route).toBe('/')
    expect(TOUR_START).toBeGreaterThanOrEqual(15)
    expect(TOUR_STEP).toBeGreaterThanOrEqual(10)
  })
})
