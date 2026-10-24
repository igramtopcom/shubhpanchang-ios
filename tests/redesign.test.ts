import { describe, it, expect } from 'vitest'
import { clock, clockRange, dayPart, shortDate, shortWeekday, wallTime } from '../src/lib/format'
import { addMonths, civilMonthOfLunar, samvatOfMonth, tithiShort } from '../src/lib/calendar-nav'
import { norm, searchItems } from '../src/lib/search'
import { civilYears, familyOccurrences, familyTitle, firstFrom, isPast, nextCivil, upcoming } from '../src/lib/upcoming'
import { planNotifications, DEFAULT_SETTINGS } from '../src/lib/notify-plan'
import { STRINGS } from '../src/lib/i18n'
import type { Festival, Observance } from '../src/lib/types'

describe('times read as people say them', () => {
  it('Gujarati puts the part of the day in front, English says am/pm', () => {
    expect(clock('18:21', 'gu', false, true)).toBe('સાંજે 6:21')
    expect(clock('13:05', 'gu', false, true)).toBe('બપોરે 1:05')
    expect(clock('06:40', 'gu')).toBe('6:40')
    expect(clock('06:40', 'en')).toBe('6:40 am')
    expect(clock('00:15', 'en')).toBe('12:15 am')
    expect(clock('12:00', 'en')).toBe('12:00 pm')
    expect(clock('18:21', 'en', true)).toBe('18:21')
    expect(clock('06:40', 'gu', true)).toBe('6:40')
  })
  it('a span names am/pm once when both ends share it', () => {
    expect(clockRange('18:21', '20:12', 'en')).toBe('6:21 – 8:12 pm')
    expect(clockRange('11:30', '13:05', 'en')).toBe('11:30 am – 1:05 pm')
    expect(clockRange('18:21', '20:12', 'gu', false, true)).toBe('સાંજે 6:21 – 8:12')
    expect(clockRange('18:21', '20:12', 'gu', true)).toBe('18:21 – 20:12')
  })
  it('the engine\'s "24:00" is the next midnight, not noon or 12:00 the same day', () => {
    expect(wallTime('24:00')).toBe('00:00')
    expect(wallTime('24:17')).toBe('00:17')
    expect(wallTime('23:59')).toBe('23:59')
    expect(clock(wallTime('24:00'), 'en')).toBe('12:00 am')
  })
  it('parts of the day follow the household words', () => {
    expect(dayPart('04:30')).toBe('સવારે')
    expect(dayPart('12:00')).toBe('બપોરે')
    expect(dayPart('16:10')).toBe('સાંજે')
    expect(dayPart('21:00')).toBe('રાત્રે')
    expect(dayPart('02:00')).toBe('રાત્રે')
  })
  it('short dates', () => {
    expect(shortDate('2026-11-08', 'gu')).toBe('8 નવે')
    expect(shortDate('2026-11-08', 'en', true)).toBe('Sun, 8 Nov')
    expect(shortWeekday('2026-10-23', 'gu')).toBe('શુક્ર')
  })
})

describe('moving about the calendar', () => {
  it('months add across years', () => {
    expect(addMonths('2026-11', 3)).toBe('2027-02')
    expect(addMonths('2027-01', -1)).toBe('2026-12')
  })
  it('a Vikram Samvat year runs Kartik (November) to Aso (October)', () => {
    // Samvat 2083 begins on Bestu Varas, 10 November 2026.
    expect(civilMonthOfLunar(2083, 0)).toBe('2026-11')
    expect(civilMonthOfLunar(2083, 11)).toBe('2027-10')
    expect(civilMonthOfLunar(2085, 0)).toBe('2028-11')
  })
  it('a month that crosses Bestu Varas shows both years', () => {
    expect(samvatOfMonth([{ vikramSamvat: 2082 }, { vikramSamvat: 2083 }])).toBe('2082–83')
    expect(samvatOfMonth([{ vikramSamvat: 2083 }])).toBe('2083')
    expect(samvatOfMonth([])).toBe('')
  })
  it('a day cell names Punam and Amas, and numbers the rest by paksha', () => {
    const d = (index: number) => ({ tithi: { index, name: '', nameGu: '', paksha: 'shukla' as const, endTime: '', endDayOffset: 0 } })
    expect(tithiShort(d(4), 'gu')).toBe('સુદ 5')
    expect(tithiShort(d(26), 'gu')).toBe('વદ 12')
    expect(tithiShort(d(14), 'gu')).toBe('પૂનમ')
    expect(tithiShort(d(29), 'en')).toBe('Amavasya')
    expect(tithiShort(d(26), 'en')).toBe('K 12')
  })
})

const fest = (slug: string, date: string, nameEn: string, nameGu: string): Festival => ({
  slug, date, nameEn, nameGu, type: 'major', about: null, indiaDate: date, reason: 'india-list', url: null,
})
const obs = (kind: Observance['kind'], date: string, nameEn: string, nameGu: string, extra: Partial<Observance> = {}): Observance => ({
  kind, date, nameEn, nameGu, reason: 'india-list', ...extra,
})

describe('search finds a festival in every year', () => {
  const fests = [fest('diwali-2026', '2026-11-08', 'Diwali', 'દિવાળી'), fest('diwali-2027', '2027-10-29', 'Diwali', 'દિવાળી'), fest('dev-diwali-2026', '2026-11-24', 'Dev Diwali', 'દેવ દિવાળી')]
  const vrats = [obs('ekadashi', '2026-11-05', 'Rama Ekadashi', 'રમા અગિયારસ')]
  it('in Gujarati or English, the exact name first', () => {
    const r = searchItems('દિવાળી', fests, vrats, 'gu')
    expect(r[0].name).toBe('દિવાળી')
    expect(r[0].hits.map(h => h.date)).toEqual(['2026-11-08', '2027-10-29'])
    expect(r[1].name).toBe('દેવ દિવાળી')
    expect(searchItems('diwali', fests, vrats, 'en')[0].hits[0].href).toBe('/festival?slug=diwali-2026')
  })
  it('a vrat named like a festival is not listed twice', () => {
    const r = searchItems('diwali', fests, [...vrats, obs('amavasya', '2026-11-09', 'Diwali', 'દિવાળી')], 'en')
    expect(r[0].hits.map(h => h.date)).toEqual(['2026-11-08', '2027-10-29'])
  })
  it('meets common spellings', () => {
    expect(norm('Deepavali')).toBe('diwali')
    expect(searchItems('rama agiyaras', fests, vrats, 'en')[0].hits[0].href).toBe('/observance?kind=ekadashi&date=2026-11-05')
    expect(searchItems('d', fests, vrats, 'en')).toEqual([])
  })
})

describe('coming up on Today', () => {
  it('a festival that is also a vrat shows once, as the festival', () => {
    const list = upcoming(
      [obs('purnima', '2026-10-26', 'Sharad Purnima', 'શરદ પૂનમ'), obs('ekadashi', '2026-11-05', 'Rama Ekadashi', 'રમા અગિયારસ', { parana: { date: '2026-11-06', start: '06:47', end: '09:02', kind: 'drik' } })],
      [fest('sharad-purnima-2026', '2026-10-26', 'Sharad Purnima', 'શરદ પૂનમ')],
      [{ person: { id: 'a', name: 'બા', kind: 'shraddh', lunar: { month: 6, adhik: false, tithi: 27 } }, next: { date: '2026-11-06' } as never }],
      ['purnima', 'ekadashi'], '2026-10-23', 'gu')
    expect(list.map(x => x.kind)).toEqual(['festival', 'vrat', 'family'])
    expect(list[1].detail).toBe('13 દિવસમાં · પારણાં 6 નવે, 6:47 – 9:02')
    expect(list[2].title).toBe('બાની પુણ્યતિથિ')
    expect(list[2].href).toBe('/person?id=a')
  })
  it('an event still to come counts from its own day, a past one from today', () => {
    expect(firstFrom({ origin: { date: '2026-12-10' } }, '2026-10-24')).toBe('2026-12-10')
    expect(firstFrom({ origin: { date: '1972-11-13' } }, '2026-10-24')).toBe('2026-10-24')
    expect(firstFrom({}, '2026-10-24')).toBe('2026-10-24')
  })
  it('family titles by kind', () => {
    expect(familyTitle({ name: 'Mom', kind: 'birthday' }, 'en')).toBe("Mom's birthday")
    expect(familyTitle({ name: 'મમ્મી-પપ્પા', kind: 'anniversary' }, 'gu')).toBe('મમ્મી-પપ્પાની લગ્નતિથિ')
  })
})

describe('a family date repeats by tithi, by date, both, or once', () => {
  const tithi = { date: '2027-11-02', aparahna: { start: '13:10', end: '15:25' } } as never
  it('the calendar date comes round every year; 29 February on the 28th in a common year', () => {
    expect(nextCivil('1972-11-13', '2026-10-24')).toBe('2026-11-13')
    expect(nextCivil('1972-03-01', '2026-10-24')).toBe('2027-03-01')
    expect(nextCivil('2026-12-10', '2026-10-24')).toBe('2026-12-10')
    expect(nextCivil('1988-02-29', '2026-10-24')).toBe('2027-02-28')
    expect(civilYears('1988-02-29', '2026-10-24', 3)).toEqual(['2027-02-28', '2028-02-29', '2029-02-28'])
  })
  it('the tithi by default, and always without a calendar date', () => {
    expect(familyOccurrences({ origin: { date: '1972-11-13' } }, '2026-10-24', tithi)).toEqual([{ date: '2027-11-02', by: 'tithi', aparahna: { start: '13:10', end: '15:25' } }])
    expect(familyOccurrences({ repeat: 'date' }, '2026-10-24', tithi).map(o => o.by)).toEqual(['tithi'])
  })
  it('by date, both (soonest first), and once', () => {
    const origin = { date: '1972-11-13' }
    expect(familyOccurrences({ origin, repeat: 'date' }, '2026-10-24', null)).toEqual([{ date: '2026-11-13', by: 'date' }])
    expect(familyOccurrences({ origin, repeat: 'both' }, '2026-10-24', tithi).map(o => `${o.by}:${o.date}`)).toEqual(['date:2026-11-13', 'tithi:2027-11-02'])
    expect(familyOccurrences({ origin: { date: '2026-12-10' }, repeat: 'once' }, '2026-10-24', null)).toEqual([{ date: '2026-12-10', by: 'once' }])
    expect(familyOccurrences({ origin: { date: '2026-10-01' }, repeat: 'once' }, '2026-10-24', null)).toEqual([])
    expect(isPast({ origin: { date: '2026-10-01' }, repeat: 'once' }, '2026-10-24')).toBe(true)
    expect(isPast({ origin: { date: '2026-10-01' }, repeat: 'date' }, '2026-10-24')).toBe(false)
  })
  it('kept both ways on one day, it is one day', () => {
    expect(familyOccurrences({ origin: { date: '1972-11-02' }, repeat: 'both' }, '2026-10-24', { date: '2026-11-02' } as never)).toHaveLength(1)
  })
  it('both days show on Today and get a reminder each', () => {
    const person = { id: 'm', name: 'Mom', kind: 'birthday' as const, lunar: { month: 7, adhik: false, tithi: 4 }, origin: { date: '1972-11-13' }, repeat: 'both' as const }
    const all = [{ date: '2026-11-13', by: 'date' as const }, { date: '2026-11-15', by: 'tithi' as const }]
    const list = upcoming([], [], [{ person, next: all[0], all }], [], '2026-10-24', 'en')
    expect(list.map(x => x.detail)).toEqual(['By date · in 20 days', 'Kartik Shukla Panchami · in 22 days'])
    const plan = planNotifications({ now: { date: '2026-10-24', minutes: 600 }, lang: 'en', observances: [], days: [], family: all.map(o => ({ person, date: o.date, by: o.by })), settings: { ...DEFAULT_SETTINGS, morning: { ...DEFAULT_SETTINGS.morning, on: false } } })
    expect(plan.map(n => `${n.id} ${n.body}`)).toEqual(['family:m:2026-11-13 Birthday by date', 'family:m:2026-11-15 Birthday by tithi (Kartik Shukla Panchami)'])
  })
})

describe('reminders', () => {
  const o = obs('ekadashi', '2026-11-05', 'Rama Ekadashi', 'રમા અગિયારસ', { parana: { date: '2026-11-06', start: '06:47', end: '09:02', kind: 'drik' } })
  const base = { now: { date: '2026-10-23', minutes: 600 }, lang: 'gu' as const, observances: [o], family: [], days: [] }
  it('one vrat can be muted without turning reminders off', () => {
    const all = planNotifications({ ...base, settings: { ...DEFAULT_SETTINGS, morning: { ...DEFAULT_SETTINGS.morning, on: false } } })
    expect(all.map(n => n.id)).toEqual(['eve:ekadashi:2026-11-05', 'parana:2026-11-05'])
    expect(all[0].url).toBe('/observance?kind=ekadashi&date=2026-11-05')
    const muted = planNotifications({ ...base, settings: { ...DEFAULT_SETTINGS, morning: { ...DEFAULT_SETTINGS.morning, on: false }, muted: ['eve:ekadashi:2026-11-05'] } })
    expect(muted.map(n => n.id)).toEqual(['parana:2026-11-05'])
  })
  it('a person can be left out of the reminders', () => {
    const person = { id: 'p', name: 'બા', kind: 'shraddh' as const, lunar: { month: 6, adhik: false, tithi: 27 }, remind: false }
    const plan = planNotifications({ ...base, observances: [], family: [{ person, date: '2026-11-06' }], settings: { ...DEFAULT_SETTINGS, morning: { ...DEFAULT_SETTINGS.morning, on: false } } })
    expect(plan).toEqual([])
  })
})

describe('every new string exists in both languages', () => {
  it('Gujarati and English have the same keys', () => {
    expect(Object.keys(STRINGS.en).sort()).toEqual(Object.keys(STRINGS.gu).sort())
  })
  it('no em-dash in the strings people read', () => {
    const all = [...Object.values(STRINGS.gu), ...Object.values(STRINGS.en)].filter(v => typeof v === 'string') as string[]
    expect(all.filter(v => v.includes('—'))).toEqual([])
  })
})
