// What the widgets show, worked out in the app ahead of time.
//
// A widget cannot fetch or compute: it renders the props of the timeline
// entry whose date has come (src/widgets/*). So the app lays out, for the
// next two days, an entry at every moment the answer changes: a good window
// opening or closing, Rahu Kaal starting or ending, midnight (new date,
// tithi, next vrat). Every string is final, in the reader's language; times
// that tick (minutes until the next good window) are instants the widget
// hands to the system clock, so they stay right between entries.
//
// Pure: no expo-widgets import, so tests run it directly.

import { chogName, longDate, t } from './i18n'
import { shubhNow, timeline } from './shubh'
import { DAY_MIN, daysBetween, hhmm, shiftDate, zonedTimeToUtc } from './time'
import type { Festival, Lang, Observance, ObservanceKind, PanchangDay } from './types'

export interface TodayProps {
  /** 'good' = in a good window; 'rahu' = Rahu Kaal; 'wait' = neither. */
  state: 'good' | 'rahu' | 'wait'
  head: string
  /** Good window now (state good) or the next one. */
  name: string
  /** "until 12:47" (good, rahu) or "11:20" (wait). */
  at: string
  /** When the current state ends (good, rahu) or the next good window starts (wait); ms. */
  untilMs: number
  date: string
  tithi: string
  tithiShort: string
  /** Tithi number within the paksha, 1-15. */
  tithiNum: number
  /** SF Symbol for the moon on that tithi. */
  moon: string
  rahuLabel: string
  rahu: string
  vratLabel: string
  vrat: string
  vratWhen: string
  /** The day's festivals ('' if none). */
  festToday: string
  /** The next festival within a month, after today ('' if none). */
  festLabel: string
  nextFest: string
  nextFestWhen: string
  url: string
}

export interface VratProps {
  label: string
  name: string
  when: string
  detail: string
  url: string
}

export interface Entry<P> { date: Date; props: P }

/** The moon's look on tithi index 0-29 (0 = Shukla Pratipada, 14 = Purnima, 29 = Amavasya). */
export function moonSymbol (index: number): string {
  const i = ((index % 30) + 30) % 30
  if (i === 29) return 'moonphase.new.moon'
  if (i === 14) return 'moonphase.full.moon'
  if (i <= 4) return 'moonphase.waxing.crescent'
  if (i <= 8) return 'moonphase.first.quarter'
  if (i <= 13) return 'moonphase.waxing.gibbous'
  if (i <= 20) return 'moonphase.waning.gibbous'
  if (i <= 23) return 'moonphase.last.quarter'
  return 'moonphase.waning.crescent'
}

function tithiLine (d: PanchangDay, lang: Lang): string {
  return lang === 'gu'
    ? `${d.hinduMonth.gu} ${d.tithi.paksha === 'shukla' ? 'સુદ' : 'વદ'} ${d.tithi.nameGu}`
    : `${d.hinduMonth.en} ${d.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${d.tithi.name}`
}

function whenText (date: string, today: string, lang: Lang): string {
  const s = t(lang)
  const n = daysBetween(today, date)
  if (n === 0) return s.today
  if (n === 1) return s.tomorrowCap
  return longDate(date, lang)
}

function vratDetail (o: Observance, lang: Lang): string {
  const s = t(lang)
  if (o.parana) return `${s.parana} ${o.parana.end ? `${o.parana.start}–${o.parana.end}` : s.paranaAfter(o.parana.start)}`
  if (o.moonrise) return `${s.moonrise} ${o.moonrise.time}`
  if (o.window) return `${o.kind === 'pradosh' ? s.pradoshKaal : s.nishita} ${o.window.start}–${o.window.end}`
  return ''
}

/**
 * Today widget entries from `nowMs` for `hours` hours. `days` must cover the
 * day before through the day after that span (the app's 62-day window does).
 */
export function todayEntries (opts: {
  nowMs: number
  today: string
  timeZone: string
  lang: Lang
  days: PanchangDay[]
  observances: Observance[]
  kinds: ObservanceKind[]
  festivals?: Festival[]
  hours?: number
}): Entry<TodayProps>[] {
  const { nowMs, today, timeZone, lang, days, observances, kinds } = opts
  const festivals = opts.festivals ?? []
  const s = t(lang)
  const base = today
  const tl = timeline(days.filter(d => d.date >= shiftDate(base, -1) && d.date <= shiftDate(base, 3)), base)
  const msOf = (m: number) => zonedTimeToUtc(shiftDate(base, Math.floor(m / DAY_MIN)), ((m % DAY_MIN) + DAY_MIN) % DAY_MIN, timeZone).getTime()
  const startMin = Math.floor((nowMs - zonedTimeToUtc(base, 0, timeZone).getTime()) / 60000)
  const endMin = startMin + (opts.hours ?? 48) * 60

  // Every moment the answer can change.
  const marks = new Set<number>([startMin])
  for (const sl of tl.slots) { marks.add(sl.start); marks.add(sl.end) }
  for (const r of tl.rahu) { marks.add(r.start); marks.add(r.end) }
  for (let d = 1; d * DAY_MIN < endMin + DAY_MIN; d++) marks.add(d * DAY_MIN)
  const times = [...marks].filter(m => m >= startMin && m < endMin).sort((a, b) => a - b)

  const byDate = new Map(days.map(d => [d.date, d]))
  const entries: Entry<TodayProps>[] = []
  for (const m of times) {
    const date = shiftDate(base, Math.floor(m / DAY_MIN))
    const day = byDate.get(date)
    if (!day) continue
    const sh = shubhNow(tl, m)
    const next = observances.find(o => kinds.includes(o.kind) && o.date >= date)
    const nextFest = festivals.find(f => f.date > date && f.date <= shiftDate(date, 30))
    let props: Pick<TodayProps, 'state' | 'head' | 'name' | 'at' | 'untilMs'>
    if (sh.good) {
      props = { state: 'good', head: s.goodNow, name: chogName(sh.good.name, lang), at: s.until(hhmm(sh.good.end)), untilMs: msOf(sh.good.end) }
    } else if (sh.rahu) {
      props = {
        state: 'rahu', head: s.inRahu,
        name: sh.next ? chogName(sh.next.name, lang) : '', at: s.until(hhmm(sh.rahu.end)), untilMs: msOf(sh.rahu.end),
      }
    } else {
      props = {
        state: 'wait', head: s.nextGood,
        name: sh.next ? chogName(sh.next.name, lang) : '', at: sh.next ? hhmm(sh.next.start) : '', untilMs: sh.next ? msOf(sh.next.start) : 0,
      }
    }
    // A change that only moves the clock (same state, same text) needs no entry.
    const prev = entries[entries.length - 1]?.props
    const full: TodayProps = {
      ...props,
      date: longDate(date, lang),
      tithi: tithiLine(day, lang),
      tithiShort: lang === 'gu' ? day.tithi.nameGu : day.tithi.name,
      tithiNum: (day.tithi.index % 15) + 1,
      moon: moonSymbol(day.tithi.index),
      rahuLabel: s.rahuKaal,
      rahu: `${day.rahuKaal.start}–${day.rahuKaal.end}`,
      vratLabel: s.upcomingVrat,
      vrat: next ? (lang === 'gu' ? next.nameGu : next.nameEn) : s.noVratSoon,
      vratWhen: next ? whenText(next.date, date, lang) : '',
      festToday: festivals.filter(f => f.date === date).map(f => (lang === 'gu' ? f.nameGu : f.nameEn)).join(' · '),
      festLabel: s.festNext,
      nextFest: nextFest ? (lang === 'gu' ? nextFest.nameGu : nextFest.nameEn) : '',
      nextFestWhen: nextFest ? whenText(nextFest.date, date, lang) : '',
      url: 'shubhpanchang://',
    }
    if (prev && JSON.stringify(prev) === JSON.stringify(full)) continue
    entries.push({ date: new Date(m === startMin ? nowMs : msOf(m)), props: full })
  }
  return entries
}

/** Next-vrat widget entries: one per midnight for a week, so "Today/Tomorrow" stays true. */
export function vratEntries (opts: {
  nowMs: number
  today: string
  timeZone: string
  lang: Lang
  observances: Observance[]
  kinds: ObservanceKind[]
}): Entry<VratProps>[] {
  const { nowMs, today, timeZone, lang, observances, kinds } = opts
  const s = t(lang)
  const out: Entry<VratProps>[] = []
  for (let d = 0; d < 7; d++) {
    const date = shiftDate(today, d)
    const o = observances.find(x => kinds.includes(x.kind) && x.date >= date)
    const props: VratProps = o
      ? {
          label: o.date === date ? s.vratToday : s.upcomingVrat,
          name: lang === 'gu' ? o.nameGu : o.nameEn,
          when: whenText(o.date, date, lang),
          detail: vratDetail(o, lang),
          url: 'shubhpanchang://vrat',
        }
      : { label: s.upcomingVrat, name: s.noVratSoon, when: '', detail: '', url: 'shubhpanchang://vrat' }
    out.push({ date: new Date(d === 0 ? nowMs : zonedTimeToUtc(date, 0, timeZone).getTime()), props })
  }
  return out
}

/**
 * A Lock Screen / Dynamic Island countdown (src/widgets/countdown-activity.tsx):
 * to the Parana after an Ekadashi, to moonrise on Sankashti, to the start or
 * end of Rahu Kaal. The timer is the system's own, so it runs without the app.
 */
export interface CountdownProps {
  /** SF Symbol. */
  icon: string
  title: string
  name: string
  /** The window or moment, as clock text: "06:40–08:58", "19:33". */
  window: string
  /** The instant the timer counts down to. */
  targetMs: number
  /** When the activity has nothing left to say (it ends then). */
  endMs: number
  /** "Parana begins in", "Moonrise in", "Rahu Kaal ends in". */
  label: string
  tone: 'good' | 'bad'
  url: string
}

const toMin = (x: string) => Number(x.slice(0, 2)) * 60 + Number(x.slice(3, 5))

/** Parana of an Ekadashi with a start and an end; null otherwise. */
export function paranaCountdown (o: Observance, lang: Lang, timeZone: string): CountdownProps | null {
  if (!o.parana || !o.parana.end) return null
  const s = t(lang)
  return {
    icon: 'fork.knife.circle.fill',
    title: s.parana,
    name: lang === 'gu' ? o.nameGu : o.nameEn,
    window: `${o.parana.start}–${o.parana.end}`,
    targetMs: zonedTimeToUtc(o.parana.date, toMin(o.parana.start), timeZone).getTime(),
    endMs: zonedTimeToUtc(o.parana.date, toMin(o.parana.end), timeZone).getTime(),
    label: s.paranaBeginsIn,
    tone: 'good',
    url: 'shubhpanchang://vrat',
  }
}

/** Moonrise that ends a Sankashti fast; the activity stays an hour past it. */
export function moonriseCountdown (o: Observance, lang: Lang, timeZone: string): CountdownProps | null {
  if (!o.moonrise) return null
  const s = t(lang)
  const at = zonedTimeToUtc(o.moonrise.date, toMin(o.moonrise.time), timeZone).getTime()
  return {
    icon: 'moon.stars.fill',
    title: s.moonrise,
    name: lang === 'gu' ? o.nameGu : o.nameEn,
    window: o.moonrise.time,
    targetMs: at,
    endMs: at + 3600_000,
    label: s.moonriseIn,
    tone: 'good',
    url: 'shubhpanchang://vrat',
  }
}

export const vratCountdown = (o: Observance, lang: Lang, timeZone: string) =>
  paranaCountdown(o, lang, timeZone) ?? moonriseCountdown(o, lang, timeZone)

/** Rahu Kaal of `day`: to its start in the two hours before it, to its end while it runs. */
export function rahuCountdown (day: PanchangDay, placeName: string, lang: Lang, timeZone: string, nowMs: number): CountdownProps | null {
  const s = t(lang)
  const start = zonedTimeToUtc(day.date, toMin(day.rahuKaal.start), timeZone).getTime()
  const end = zonedTimeToUtc(day.date, toMin(day.rahuKaal.end), timeZone).getTime()
  // Over, or more than two hours off: a countdown that long is clutter, not help.
  if (nowMs >= end || start - nowMs > 2 * 3600_000) return null
  const running = nowMs >= start
  return {
    icon: 'exclamationmark.octagon.fill',
    title: s.rahuKaal,
    name: placeName,
    window: `${day.rahuKaal.start}–${day.rahuKaal.end}`,
    targetMs: running ? end : start,
    endMs: end,
    label: running ? s.rahuEndsIn : s.rahuBeginsIn,
    tone: 'bad',
    url: 'shubhpanchang://',
  }
}

/** Live Activities run eight hours at most: offer one only that close to its moment. */
export const COUNTDOWN_OFFER_MS = 8 * 3600_000

export const offerCountdown = (c: CountdownProps | null, nowMs: number): c is CountdownProps =>
  !!c && nowMs < c.endMs && c.targetMs - nowMs <= COUNTDOWN_OFFER_MS
