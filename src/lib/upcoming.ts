// "Coming up" on Today: the next vrats, festivals and family dates in one
// list, by date, each with the one line that matters (Parana, moonrise, how
// soon) and where a tap goes.

import { clock, clockRange, shortDate } from './format'
import { lunarLabel, t } from './i18n'
import { norm } from './search'
import { daysBetween } from './time'
import type { FamilyDate, Festival, Lang, Observance, ObservanceKind, TithiOccurrence } from './types'

export interface UpcomingItem {
  kind: 'vrat' | 'festival' | 'family'
  date: string
  title: string
  detail: string
  href: string
}

const ORDER = { festival: 0, vrat: 1, family: 2 }

export type Repeat = NonNullable<FamilyDate['repeat']>
/** In the order the choice is offered. */
export const REPEATS: Repeat[] = ['tithi', 'date', 'both', 'once']

/** One day a family date falls on: by its tithi, on its calendar date, or the one day it happens. */
export interface FamilyOcc {
  date: string
  by: 'tithi' | 'date' | 'once'
  aparahna?: { start: string; end: string }
}

/** How a family date repeats. Without a calendar date it can only go by the tithi. */
export const repeatOf = (person: Pick<FamilyDate, 'origin' | 'repeat'>): Repeat =>
  person.origin ? person.repeat ?? 'tithi' : 'tithi'

/** Whether the tithi's days have to be looked up for it. */
export const needsTithi = (person: Pick<FamilyDate, 'origin' | 'repeat'>) => {
  const r = repeatOf(person)
  return r === 'tithi' || r === 'both'
}

/** A one-time event whose day is behind us. */
export const isPast = (person: Pick<FamilyDate, 'origin' | 'repeat'>, today: string) =>
  repeatOf(person) === 'once' && !!person.origin && person.origin.date < today

const leap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
/** Month-day in year `y`; 29 February falls on the 28th in a common year. */
const inYear = (md: string, y: number) => `${y}-${md === '02-29' && !leap(y) ? '02-28' : md}`

/** The next day, from `today`, with the month and day of `date`; the day itself while it is still to come. */
export function nextCivil (date: string, today: string): string {
  if (date >= today) return date
  const md = date.slice(5)
  const y = Number(today.slice(0, 4))
  const d = inYear(md, y)
  return d >= today ? d : inYear(md, y + 1)
}

/** `n` calendar-date anniversaries from the next one. */
export function civilYears (date: string, today: string, n: number): string[] {
  const first = nextCivil(date, today)
  const y = Number(first.slice(0, 4))
  return Array.from({ length: n }, (_, i) => (i === 0 ? first : inYear(date.slice(5), y + i)))
}

/**
 * The next day(s) a family date falls on, soonest first: the tithi's next day
 * (looked up by the caller), the calendar date's, or both; a one-time event
 * only while it is still to come. One day kept both ways is listed once.
 */
export function familyOccurrences (person: Pick<FamilyDate, 'origin' | 'repeat'>, today: string, tithi: TithiOccurrence | null): FamilyOcc[] {
  const r = repeatOf(person)
  const out: FamilyOcc[] = []
  if ((r === 'tithi' || r === 'both') && tithi) out.push({ date: tithi.date, by: 'tithi', ...(tithi.aparahna ? { aparahna: tithi.aparahna } : {}) })
  if ((r === 'date' || r === 'both') && person.origin) out.push({ date: nextCivil(person.origin.date, today), by: 'date' })
  if (r === 'once' && person.origin && person.origin.date >= today) out.push({ date: person.origin.date, by: 'once' })
  return out
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .filter((o, i, a) => i === 0 || o.date !== a[i - 1].date)
}

/** Where a family date's next occurrence is looked for: today, or the day itself while it is still to come. */
export const firstFrom = (person: Pick<FamilyDate, 'origin'>, today: string): string =>
  person.origin && person.origin.date > today ? person.origin.date : today

/** "બાની પુણ્યતિથિ" / "Ba's punyatithi". */
export function familyTitle (person: Pick<FamilyDate, 'name' | 'kind'>, lang: Lang): string {
  const s = t(lang)
  return person.kind === 'birthday' ? s.birthdayOf(person.name) : person.kind === 'anniversary' ? s.anniversaryOf(person.name) : s.punyatithiOf(person.name)
}

export function upcoming (
  obs: Observance[] | null,
  fest: Festival[] | null,
  fam: { person: FamilyDate; next: FamilyOcc | null; all?: FamilyOcc[] }[] | null,
  kinds: ObservanceKind[],
  today: string,
  lang: Lang,
  h24 = false,
): UpcomingItem[] {
  const s = t(lang)
  const gu = lang === 'gu'
  const soon = (date: string) => s.relDays(daysBetween(today, date))
  const out: UpcomingItem[] = []
  for (const o of obs ?? []) {
    if (o.date < today || !kinds.includes(o.kind)) continue
    const extra = o.parana
      ? `${s.parana} ${shortDate(o.parana.date, lang)}, ${o.parana.end ? clockRange(o.parana.start, o.parana.end, lang, h24) : s.paranaAfter(clock(o.parana.start, lang, h24))}`
      : o.moonrise ? `${s.moonrise} ${clock(o.moonrise.time, lang, h24, true)}` : null
    out.push({
      kind: 'vrat',
      date: o.date,
      title: gu ? o.nameGu : o.nameEn,
      detail: [o.date === today ? s.today : soon(o.date), extra].filter(Boolean).join(' · '),
      href: `/observance?kind=${o.kind}&date=${o.date}`,
    })
  }
  for (const f of fest ?? []) {
    if (f.date < today) continue
    out.push({ kind: 'festival', date: f.date, title: gu ? f.nameGu : f.nameEn, detail: f.date === today ? s.today : soon(f.date), href: `/festival?slug=${encodeURIComponent(f.slug)}` })
  }
  for (const { person, next, all } of fam ?? []) {
    for (const o of all ?? (next ? [next] : [])) {
      if (o.date < today) continue
      const how = o.by === 'tithi' ? lunarLabel(person.lunar, lang) : o.by === 'date' ? s.byDate : null
      out.push({ kind: 'family', date: o.date, title: familyTitle(person, lang), detail: [how, o.date === today ? s.today : soon(o.date)].filter(Boolean).join(' · '), href: `/person?id=${person.id}` })
    }
  }
  // A festival that is also a vrat (Sharad Punam) once, as the festival.
  const seen = new Set<string>()
  return out
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : ORDER[a.kind] - ORDER[b.kind]))
    .filter(x => { const k = `${x.date}:${norm(x.title)}`; if (seen.has(k)) return false; seen.add(k); return true })
}
