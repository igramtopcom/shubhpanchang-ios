// What Siri says for "Today's tithi" and "Next vrat" (plugins/app-shortcuts):
// one English sentence per date for the coming two weeks, written ahead so
// the intents never compute. English because Siri has no Gujarati voice.
// Pure: tested directly.

import { longDate } from './i18n'
import { goodWindows, timeline } from './shubh'
import { hhmm, shiftDate, toMinutes } from './time'
import type { Observance, ObservanceKind, PanchangDay } from './types'

const say = (range: string) => range.replace('–', ' to ')

export function siriToday (days: PanchangDay[], placeName: string, from: string, count = 14): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < count; i++) {
    const date = shiftDate(from, i)
    const day = days.find(d => d.date === date)
    if (!day) continue
    const tl = timeline([day], date)
    // Daytime windows only, sunrise to sunset: the ones people plan by.
    const rise = toMinutes(day.sunrise), set = toMinutes(day.sunset)
    const good = goodWindows(tl)
      .filter(w => w.start >= rise && w.end <= set)
      .map(w => `${w.name} ${hhmm(w.start)} to ${hhmm(w.end)}`)
    const tithi = `${day.hinduMonth.en}${day.isAdhikMaas ? ' Adhik' : ''} ${day.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${day.tithi.name}`
    const vrat = day.vrat?.items?.length ? ` It is ${day.vrat.items.map(v => v.en).join(' and ')}.` : day.vrat ? ` It is ${day.vrat.en}.` : ''
    out[date] = `${longDate(date, 'en')} in ${placeName}: ${tithi}.${vrat} Rahu Kaal is ${day.rahuKaal.start} to ${day.rahuKaal.end}.`
      + (good.length ? ` Good times: ${good.join(', ')}.` : '')
  }
  return out
}

export function siriVrat (observances: Observance[], kinds: ObservanceKind[], from: string, count = 14): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < count; i++) {
    const date = shiftDate(from, i)
    const o = observances.find(x => kinds.includes(x.kind) && x.date >= date)
    if (!o) continue
    const when = o.date === date ? 'today' : o.date === shiftDate(date, 1) ? 'tomorrow' : `on ${longDate(o.date, 'en')}`
    let detail = ''
    if (o.parana) detail = o.parana.end
      ? ` Parana is on ${longDate(o.parana.date, 'en', false)}, ${say(`${o.parana.start}–${o.parana.end}`)}.`
      : ` Parana is on ${longDate(o.parana.date, 'en', false)} after ${o.parana.start}.`
    else if (o.moonrise) detail = ` Moonrise is at ${o.moonrise.time}.`
    else if (o.window) detail = ` ${o.kind === 'pradosh' ? 'Pradosh Kaal' : 'Nishita Kaal'} is ${say(`${o.window.start}–${o.window.end}`)}.`
    out[date] = `The next vrat is ${o.nameEn}, ${when}.${detail}`
  }
  return out
}
