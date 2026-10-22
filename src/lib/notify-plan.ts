// Which local notifications to schedule, within iOS's limit.
//
// iOS keeps at most 64 pending local notifications per app and silently drops
// the rest. So the plan is built here, as data, and ranked:
//
//   1. vrat reminders: the evening before, Parana opening, Sankashti moonrise
//   2. family dates and festivals: the evening before
//   3. the morning panchang, one per day, filling what is left
//
// A reader who does not open the app for two weeks still gets every vrat and
// family reminder of the horizon; only the morning digests run out. The app
// rebuilds the plan each time it opens. Family dates also go into the iPhone
// Calendar with its own alarms, which do not count against the 64.
//
// Times are wall-clock at the chosen place; src/lib/notify.ts turns them into
// instants with zonedTimeToUtc.

import type { FamilyDate, Festival, Lang, Observance, PanchangDay } from './types'
import { lunarLabel, t, longDate } from './i18n'
import { shiftDate, toMinutes } from './time'

export const IOS_PENDING_LIMIT = 64
/** Room kept free under the limit, for anything scheduled outside the plan. */
export const PLAN_LIMIT = 60

export interface NotifySettings {
  morning: { on: boolean; minutes: number }
  vratEve: { on: boolean; minutes: number }
  parana: boolean
  family: { on: boolean; minutes: number }
  festivals: { on: boolean; minutes: number }
  kinds: Observance['kind'][]
}

export const DEFAULT_SETTINGS: NotifySettings = {
  morning: { on: true, minutes: 6 * 60 + 30 },
  vratEve: { on: true, minutes: 19 * 60 },
  parana: true,
  family: { on: true, minutes: 19 * 60 },
  festivals: { on: true, minutes: 19 * 60 + 30 },
  kinds: ['ekadashi', 'purnima', 'amavasya', 'sankashti'],
}

export interface PlannedNotification {
  id: string
  /** Civil date and minutes after midnight at the place. */
  date: string
  minutes: number
  title: string
  body: string
  priority: 1 | 2 | 3
  /** Route to open when tapped. */
  url: string
}

export interface PlanInput {
  now: { date: string; minutes: number }
  settings: NotifySettings
  lang: Lang
  observances: Observance[]
  family: { person: FamilyDate; date: string }[]
  festivals?: Festival[]
  days: PanchangDay[]
  horizonDays?: number
  limit?: number
}

const later = (a: { date: string; minutes: number }, b: { date: string; minutes: number }) =>
  a.date > b.date || (a.date === b.date && a.minutes > b.minutes)

export function planNotifications (input: PlanInput): PlannedNotification[] {
  const { now, settings, lang, observances, family, days } = input
  const s = t(lang)
  const gu = lang === 'gu'
  const horizonEnd = shiftDate(now.date, input.horizonDays ?? 60)
  const limit = input.limit ?? PLAN_LIMIT
  const out: PlannedNotification[] = []
  const push = (n: PlannedNotification) => {
    if (later(n, now) && n.date <= horizonEnd) out.push(n)
  }

  for (const o of observances) {
    if (!settings.kinds.includes(o.kind)) continue
    const name = gu ? o.nameGu : o.nameEn
    if (settings.vratEve.on) {
      const p = o.parana
      const paranaText = p
        ? (p.end ? `${longDate(p.date, lang)} ${p.start}–${p.end}` : `${longDate(p.date, lang)}, ${s.paranaAfter(p.start)}`)
        : null
      push({
        id: `eve:${o.kind}:${o.date}`,
        date: shiftDate(o.date, -1),
        minutes: settings.vratEve.minutes,
        title: gu ? `આવતીકાલે ${name}` : `Tomorrow: ${name}`,
        body: o.kind === 'sankashti' && o.moonrise
          ? (gu ? `ઉપવાસ આવતીકાલે. ચંદ્રોદય ${o.moonrise.time}.` : `Fast tomorrow. Moonrise ${o.moonrise.time}.`)
          : o.window
            ? `${o.kind === 'pradosh' ? s.pradoshKaal : s.nishita} ${o.window.start}–${o.window.end}.`
          : paranaText
            ? (gu ? `ઉપવાસ આવતીકાલે. પારણા ${paranaText}.` : `Fast tomorrow. Parana ${paranaText}.`)
            : (gu ? 'ઉપવાસ આવતીકાલે.' : 'Fast tomorrow.'),
        priority: 1,
        url: '/vrat',
      })
    }
    if (settings.parana && o.parana) {
      const start = toMinutes(o.parana.start)
      if (start >= 0) {
        push({
          id: `parana:${o.date}`,
          date: o.parana.date,
          minutes: start,
          title: gu ? 'પારણાનો સમય' : 'Parana time',
          body: o.parana.end
            ? (gu ? `${name}: હવે પારણા કરી શકાય, ${o.parana.end} સુધી.` : `${name}: you may break the fast now, until ${o.parana.end}.`)
            : (gu ? `${name}: હવે પારણા કરી શકાય.` : `${name}: you may break the fast now.`),
          priority: 1,
          url: '/vrat',
        })
      }
    }
    if (settings.parana && o.kind === 'sankashti' && o.moonrise) {
      const m = toMinutes(o.moonrise.time)
      if (m >= 0) {
        push({
          id: `moon:${o.date}`,
          date: o.moonrise.date,
          minutes: m,
          title: gu ? 'ચંદ્રોદય' : 'Moonrise',
          body: gu ? `${name}: ચંદ્રને અર્ઘ્ય આપીને વ્રત છોડો.` : `${name}: offer arghya to the Moon and break the fast.`,
          priority: 1,
          url: '/vrat',
        })
      }
    }
  }

  if (settings.family.on) {
    for (const f of family) {
      const label = lunarLabel(f.person.lunar, lang)
      push({
        id: `family:${f.person.id}:${f.date}`,
        date: shiftDate(f.date, -1),
        minutes: settings.family.minutes,
        title: gu ? `આવતીકાલે: ${f.person.name}` : `Tomorrow: ${f.person.name}`,
        body: f.person.kind === 'birthday'
          ? (gu ? `તિથિ પ્રમાણે જન્મદિવસ (${label})` : `Birthday by tithi (${label})`)
          : (gu ? `શ્રાદ્ધ (${label})` : `Shraddh (${label})`),
        priority: 2,
        url: '/family',
      })
    }
  }

  // Festivals: the evening before. A festival that is also a chosen vrat day
  // already has its reminder from the vrat list (one evening, one notification).
  if (settings.festivals?.on) {
    const vratDays = new Set(observances.filter(o => settings.kinds.includes(o.kind)).map(o => o.date))
    for (const f of input.festivals ?? []) {
      if (vratDays.has(f.date)) continue
      const name = gu ? f.nameGu : f.nameEn
      push({
        id: `fest:${f.slug}`,
        date: shiftDate(f.date, -1),
        minutes: settings.festivals.minutes,
        title: gu ? `આવતીકાલે ${name}` : `Tomorrow: ${name}`,
        body: f.about ? (gu ? f.about.gu : f.about.en) : (gu ? 'તહેવાર આવતીકાલે.' : 'Festival tomorrow.'),
        priority: 2,
        url: '/vrat',
      })
    }
  }

  if (settings.morning.on) {
    for (const d of days) {
      const tithi = gu ? `${d.hinduMonth.gu} ${d.tithi.paksha === 'shukla' ? 'સુદ' : 'વદ'} ${d.tithi.nameGu}` : `${d.hinduMonth.en} ${d.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${d.tithi.name}`
      const vrat = d.vrat ? ` · ${gu ? (d.vrat.guDialect ?? d.vrat.gu) : d.vrat.en}` : ''
      push({
        id: `morning:${d.date}`,
        date: d.date,
        minutes: settings.morning.minutes,
        title: gu ? 'આજનું પંચાંગ' : "Today's panchang",
        body: `${tithi}${vrat} · ${s.sunrise} ${d.sunrise} · ${s.rahuKaal} ${d.rahuKaal.start}–${d.rahuKaal.end}`,
        priority: 3,
        url: '/',
      })
    }
  }

  // Highest priority first, earliest first within it; then keep the first `limit`.
  const ranked = out.sort((a, b) =>
    a.priority - b.priority || (a.date < b.date ? -1 : a.date > b.date ? 1 : a.minutes - b.minutes))
  const kept = ranked.slice(0, limit)
  return kept.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.minutes - b.minutes))
}
