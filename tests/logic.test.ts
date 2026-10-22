import { describe, it, expect } from 'vitest'
import panchang from './fixtures/panchang-ahmedabad.json'
import observancesNj from './fixtures/observances-nj.json'
import njDst from './fixtures/panchang-nj-dst.json'
import { timeline, shubhNow, chogTier } from '../src/lib/shubh'
import { toMinutes, hhmm, zonedNow, zonedTimeToUtc, shiftDate } from '../src/lib/time'
import { planNotifications, DEFAULT_SETTINGS, PLAN_LIMIT } from '../src/lib/notify-plan'
import { STRINGS, lunarLabel, tithiName, longDate } from '../src/lib/i18n'
import { Api, feedUrl, placeQuery, type KV } from '../src/lib/api'
import { moonSymbol, offerCountdown, paranaCountdown, rahuCountdown, todayEntries, vratCountdown, vratEntries } from '../src/lib/widget-feed'
import { siriToday, siriVrat } from '../src/lib/siri-feed'
import { shareMessage } from '../src/lib/share'
import type { Festival, Observance, PanchangDay } from '../src/lib/types'

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
    expect(routeForWebPath('/festivals/diwali-2026')).toBe('/vrat?seg=festivals') // the festival list
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

import { TOUR, seedFor, stepIndex } from '../src/lib/tour'

describe('screenshot tour', () => {
  it('names every capture once and starts with a seeded Today', () => {
    expect(new Set(TOUR.map(s => s.shot)).size).toBe(TOUR.length)
    expect(TOUR[0].seed && TOUR[0].route).toBe('/')
    // A step carries the sample data of the last seed before it.
    expect(seedFor(3)).toEqual(TOUR[0].seed)
    expect(seedFor(8)?.lang).toBe('en')
    expect([stepIndex('4'), stepIndex(4), stepIndex(undefined), stepIndex('99'), stepIndex('x')]).toEqual([4, 4, null, null, null])
  })
})

describe('widget timeline (widget-feed.ts)', () => {
  // 22 Oct 2026 09:00 IST = 03:30 UTC. Rog until 09:32; next good window Labh 12:24-13:50;
  // Rahu Kaal 13:50-15:16 eats the Amrit slot.
  const nowMs = Date.parse('2026-10-22T03:30:00Z')
  const entries = todayEntries({
    nowMs, today: '2026-10-22', timeZone: 'Asia/Kolkata', lang: 'en',
    days, observances: [], kinds: ['ekadashi'], hours: 12,
  })
  const atIst = (h: number, m: number) => Date.parse(`2026-10-22T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+05:30`)

  it('starts now, waiting for Labh at 12:24, counting to that instant', () => {
    expect(entries[0].date.getTime()).toBe(nowMs)
    expect(entries[0].props).toMatchObject({ state: 'wait', name: 'Labh', at: '12:24', untilMs: atIst(12, 24) })
  })

  it('turns good at 12:24 and into Rahu Kaal at 13:50, with an entry at each change only', () => {
    const good = entries.find(e => e.props.state === 'good')!
    expect(good.date.getTime()).toBe(atIst(12, 24))
    expect(good.props).toMatchObject({ name: 'Labh', at: 'until 13:50' })
    const rahu = entries.find(e => e.props.state === 'rahu')!
    expect(rahu.date.getTime()).toBe(atIst(13, 50))
    expect(rahu.props.at).toBe('until 15:16')
    // 09:32 (Rog -> Udveg) changes nothing on the widget, so it is not an entry.
    expect(entries.some(e => e.date.getTime() === atIst(9, 32))).toBe(false)
    expect(entries.map(e => e.date.getTime())).toEqual([...entries.map(e => e.date.getTime())].sort((a, b) => a - b))
  })

  it('names the tithi and its moon', () => {
    expect(entries[0].props.tithi).toMatch(/Ashwin Shukla/)
    expect(moonSymbol(14)).toBe('moonphase.full.moon')
    expect(moonSymbol(29)).toBe('moonphase.new.moon')
    expect(moonSymbol(7)).toBe('moonphase.first.quarter')
  })

  it('next-vrat entries flip Tomorrow to Today at midnight', () => {
    const obs = observancesNj.observances as unknown as Observance[]
    const first = obs.find(o => o.kind === 'ekadashi')!
    const e = vratEntries({ nowMs: Date.parse(`${shiftDate(first.date, -1)}T12:00:00Z`), today: shiftDate(first.date, -1), timeZone: 'America/New_York', lang: 'en', observances: obs, kinds: ['ekadashi'] })
    expect(e[0].props).toMatchObject({ when: 'Tomorrow', name: first.nameEn })
    expect(e[1].props).toMatchObject({ when: 'Today', label: "Today's vrat" })
  })
})

describe('Siri answers (siri-feed.ts)', () => {
  it('says the tithi, Rahu Kaal and the daytime good windows', () => {
    const t = siriToday(days, 'Ahmedabad', '2026-10-22', 1)['2026-10-22']
    expect(t).toMatch(/^Thursday, 22 October in Ahmedabad: Ashwin .* Rahu Kaal is 13:50 to 15:16\./)
    expect(t).toContain('Labh 12:24 to 13:50')
    expect(t).not.toContain('Amrit') // all of it inside Rahu Kaal
  })
  it('names the next vrat and its Parana, today or tomorrow', () => {
    const obs = observancesNj.observances as unknown as Observance[]
    const first = obs.find(o => o.kind === 'ekadashi')!
    const v = siriVrat(obs, ['ekadashi'], shiftDate(first.date, -1), 2)
    expect(v[shiftDate(first.date, -1)]).toMatch(new RegExp(`^The next vrat is ${first.nameEn}, tomorrow\.`))
    expect(v[first.date]).toContain(', today.')
    if (first.parana?.end) expect(v[first.date]).toContain(`${first.parana.start} to ${first.parana.end}`)
  })
})

describe('Api request sharing', () => {
  it('sends one request for identical calls made together, and reuses it briefly', async () => {
    const store = new Map<string, string>()
    const kv: KV = {
      getItem: async k => store.get(k) ?? null, setItem: async (k, v) => { store.set(k, v) },
      removeItem: async k => { store.delete(k) }, getAllKeys: async () => [...store.keys()],
    }
    let calls = 0
    const fake = (async () => { calls++; await new Promise(r => setTimeout(r, 5)); return { ok: true, status: 200, json: async () => ({ engine: 'v12', cities: [] }) } }) as unknown as typeof fetch
    const api = new Api(kv, fake)
    await Promise.all([api.cities(), api.cities(), api.cities()])
    expect(calls).toBe(1)
    await api.cities()
    expect(calls).toBe(1)
  })
})

describe('widget timeline across midnight and the US clock change', () => {
  // New Jersey, 31 Oct to 2 Nov 2026: clocks go back at 02:00 on 1 Nov (EDT -> EST).
  const nj = (njDst as unknown as { days: PanchangDay[] }).days
  const tz = 'America/New_York'
  const nowMs = Date.parse('2026-11-01T00:00:00Z') // 31 Oct, 20:00 EDT
  const e = todayEntries({ nowMs, today: '2026-10-31', timeZone: tz, lang: 'en', days: nj, observances: [], kinds: [], hours: 48 })
  const times = e.map(x => x.date.getTime())

  it('keeps entries in order, each on a change of the answer', () => {
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(new Set(times).size).toBe(times.length)
  })

  it('turns the date at each local midnight, on either side of the change', () => {
    const at = (iso: string) => e.find(x => x.date.getTime() === Date.parse(iso))
    expect(at('2026-11-01T04:00:00Z')?.props.date).toBe('Sunday, 1 November') // midnight EDT
    expect(at('2026-11-02T05:00:00Z')?.props.date).toBe('Monday, 2 November') // midnight EST
  })

  it('starts Rahu Kaal on 1 Nov at 15:36 EST, after the change', () => {
    const r = e.find(x => x.props.state === 'rahu')!
    expect(r.date.toISOString()).toBe('2026-11-01T20:36:00.000Z')
    expect(zonedNow(tz, r.date)).toEqual({ date: '2026-11-01', minutes: 15 * 60 + 36 })
  })
})

describe('Lock Screen countdowns', () => {
  const obs = observancesNj.observances as unknown as Observance[]
  const tz = 'America/New_York'

  it('counts to the Parana start and ends with its window', () => {
    const o = obs.find(x => x.kind === 'ekadashi' && x.parana?.end)!
    const c = paranaCountdown(o, 'en', tz)!
    expect(c.targetMs).toBe(zonedTimeToUtc(o.parana!.date, toMinutes(o.parana!.start), tz).getTime())
    expect(c.endMs).toBe(zonedTimeToUtc(o.parana!.date, toMinutes(o.parana!.end!), tz).getTime())
    expect(offerCountdown(c, c.targetMs - 9 * 3600_000)).toBe(false) // more than eight hours ahead
    expect(offerCountdown(c, c.targetMs - 3600_000)).toBe(true)
    expect(offerCountdown(c, c.endMs)).toBe(false)
  })

  it('counts to Sankashti moonrise', () => {
    const o = obs.find(x => x.kind === 'sankashti' && x.moonrise)!
    expect(vratCountdown(o, 'en', tz)).toMatchObject({ window: o.moonrise!.time, label: 'Moonrise in' })
  })

  it('offers Rahu Kaal only from two hours before it, then counts to its end', () => {
    const d = days.find(x => x.date === '2026-10-22')! // Ahmedabad, Rahu 13:50-15:16
    const ms = (h: number, m: number) => zonedTimeToUtc('2026-10-22', h * 60 + m, 'Asia/Kolkata').getTime()
    expect(rahuCountdown(d, 'Ahmedabad', 'en', 'Asia/Kolkata', ms(11, 0))).toBeNull()
    expect(rahuCountdown(d, 'Ahmedabad', 'en', 'Asia/Kolkata', ms(12, 30))).toMatchObject({ label: 'Rahu Kaal begins in', targetMs: ms(13, 50) })
    expect(rahuCountdown(d, 'Ahmedabad', 'en', 'Asia/Kolkata', ms(14, 0))).toMatchObject({ label: 'Rahu Kaal ends in', targetMs: ms(15, 16) })
    expect(rahuCountdown(d, 'Ahmedabad', 'en', 'Asia/Kolkata', ms(15, 20))).toBeNull()
  })
})

describe("today's panchang message (share.ts)", () => {
  const d = days.find(x => x.date === '2026-10-22')!
  const ahd = { city: 'ahmedabad', name: { en: 'Ahmedabad', gu: 'અમદાવાદ' }, lat: 23.03, lon: 72.58, timezone: 'Asia/Kolkata' }
  it('follows the website message, for the reader\'s place, with ?ref=app', () => {
    const en = shareMessage(d, ahd, 'en')
    expect(en.split('\n')[0]).toBe("🙏 Today's Panchang · Thursday, 22 October · Ahmedabad")
    expect(en).toContain('🚫 Rahu Kaal: 13:50–15:16 (Avoid)')
    expect(en.endsWith('https://shubhpanchang.in/panchang/ahmedabad?lang=en&ref=app')).toBe(true)
    const gu = shareMessage(d, ahd, 'gu')
    expect(gu).toContain('રાહુ કાળ: 13:50–15:16 (ટાળો)')
    expect(gu.endsWith('https://shubhpanchang.in/panchang/ahmedabad?ref=app')).toBe(true)
    expect(en + gu).not.toContain('—')
  })
})

describe('festivals in the app', () => {
  const fest = (slug: string, date: string, nameEn: string): Festival => ({
    slug, date, nameEn, nameGu: `gu ${nameEn}`, type: 'major', about: { en: `${nameEn} is a festival.`, gu: 'તહેવાર' },
    indiaDate: date, reason: 'india-list', url: `https://shubhpanchang.in/festivals/${slug}`,
  })
  const diwali = fest('diwali-2026', '2026-11-08', 'Diwali')
  const base = {
    now: { date: '2026-11-01', minutes: 9 * 60 }, lang: 'en' as const, family: [], days: [],
  }

  it('reminds the evening before a festival, as a priority-2 notification', () => {
    const plan = planNotifications({ ...base, settings: { ...DEFAULT_SETTINGS, morning: { ...DEFAULT_SETTINGS.morning, on: false } }, observances: [], festivals: [diwali] })
    expect(plan).toEqual([expect.objectContaining({ id: 'fest:diwali-2026', date: '2026-11-07', title: 'Tomorrow: Diwali', body: 'Diwali is a festival.', priority: 2 })])
  })

  it('leaves a festival that is a chosen vrat day to the vrat reminder', () => {
    const ekadashi = { kind: 'ekadashi', date: '2026-11-08', nameEn: 'X Ekadashi', nameGu: 'x', reason: 'india-list' } as Observance
    const plan = planNotifications({ ...base, settings: { ...DEFAULT_SETTINGS, morning: { ...DEFAULT_SETTINGS.morning, on: false }, kinds: ['ekadashi'] }, observances: [ekadashi], festivals: [diwali] })
    expect(plan.map(n => n.id)).toEqual(['eve:ekadashi:2026-11-08'])
  })

  it('works with settings saved before festivals existed', () => {
    const { festivals: _, ...old } = DEFAULT_SETTINGS
    const plan = planNotifications({ ...base, settings: old as typeof DEFAULT_SETTINGS, observances: [], festivals: [diwali] })
    expect(plan.some(n => n.id.startsWith('fest:'))).toBe(false)
  })

  it('puts the day\'s festival and the next one on the Today widget', () => {
    const at = Date.parse('2026-10-22T03:30:00Z')
    const e = todayEntries({ nowMs: at, today: '2026-10-22', timeZone: 'Asia/Kolkata', lang: 'en', days, observances: [], kinds: [], hours: 2,
      festivals: [fest('x-2026', '2026-10-22', 'Today Fest'), diwali] })
    expect(e[0].props).toMatchObject({ festToday: 'Today Fest', nextFest: 'Diwali', nextFestWhen: 'Sunday, 8 November', festLabel: 'Next festival' })
    const far = todayEntries({ nowMs: at, today: '2026-10-22', timeZone: 'Asia/Kolkata', lang: 'en', days, observances: [], kinds: [], hours: 2,
      festivals: [fest('z-2026', '2026-12-25', 'Far Fest')] })
    expect(far[0].props).toMatchObject({ festToday: '', nextFest: '' }) // more than a month off
    const e2 = todayEntries({ nowMs: at, today: '2026-10-22', timeZone: 'Asia/Kolkata', lang: 'en', days, observances: [], kinds: [], hours: 2,
      festivals: [fest('y-2026', '2026-10-29', 'Soon Fest')] })
    expect(e2[0].props).toMatchObject({ festToday: '', nextFest: 'Soon Fest', nextFestWhen: 'Thursday, 29 October' })
  })

  it('has Siri name the day\'s festival', () => {
    const t = siriToday(days, 'Ahmedabad', '2026-10-22', 1, [fest('x-2026', '2026-10-22', 'Today Fest')])['2026-10-22']
    expect(t).toContain('It is Today Fest')
  })
})
