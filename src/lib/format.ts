// How times and short dates read on screen. The API gives wall-clock "HH:MM"
// at the place; people read "સાંજે 6:21" or "6:21 pm" (Settings can switch to
// 24-hour). Gujarati says the part of the day in front; English says am/pm.

import type { Lang } from './types'
import { toMinutes } from './time'

/** સવારે / બપોરે / સાંજે / રાત્રે for a clock time, as a Gujarati household says it. */
export function dayPart (hhmm: string): 'સવારે' | 'બપોરે' | 'સાંજે' | 'રાત્રે' {
  const m = toMinutes(hhmm)
  if (m >= 4 * 60 && m < 12 * 60) return 'સવારે'
  if (m >= 12 * 60 && m < 16 * 60) return 'બપોરે'
  if (m >= 16 * 60 && m < 20 * 60) return 'સાંજે'
  return 'રાત્રે'
}

function h12 (hhmm: string): { text: string; pm: boolean } {
  const m = toMinutes(hhmm)
  if (m < 0) return { text: hhmm, pm: false }
  const h = Math.floor(m / 60) % 24, min = m % 60
  const hh = h % 12 === 0 ? 12 : h % 12
  return { text: `${hh}:${String(min).padStart(2, '0')}`, pm: h >= 12 }
}

/** "24:00" (the engine's midnight at a day's end) as the next day's "00:00"; other times unchanged. */
export function wallTime (hhmm: string): string {
  const m = toMinutes(hhmm)
  return m >= 24 * 60 ? `${String(Math.floor((m - 1440) / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` : hhmm
}

/** One time: "6:21 pm" / "6:21" (Gujarati, with `part` its part of the day) / "18:21". */
export function clock (hhmm: string, lang: Lang, h24 = false, part = false): string {
  if (toMinutes(hhmm) < 0) return hhmm
  if (h24) return hhmm.replace(/^0(\d)/, '$1')
  const { text, pm } = h12(hhmm)
  if (lang === 'en') return `${text} ${pm ? 'pm' : 'am'}`
  return part ? `${dayPart(hhmm)} ${text}` : text
}

/**
 * A span: "6:21 – 8:12 pm", "11:30 am – 1:05 pm"; Gujarati "સાંજે 6:21 – 8:12"
 * when `part`, else "6:21 – 8:12"; 24-hour "18:21 – 20:12".
 */
export function clockRange (a: string, b: string, lang: Lang, h24 = false, part = false): string {
  if (h24 || toMinutes(a) < 0 || toMinutes(b) < 0) return `${clock(a, lang, true)} – ${clock(b, lang, true)}`
  const x = h12(a), y = h12(b)
  if (lang === 'en') return x.pm === y.pm ? `${x.text} – ${y.text} ${y.pm ? 'pm' : 'am'}` : `${x.text} ${x.pm ? 'pm' : 'am'} – ${y.text} ${y.pm ? 'pm' : 'am'}`
  return `${part ? `${dayPart(a)} ` : ''}${x.text} – ${y.text}`
}

const SHORT_MONTH = {
  gu: ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો', 'નવે', 'ડિસે'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
const SHORT_WEEKDAY = {
  gu: ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

export const shortMonth = (m: number, lang: Lang) => SHORT_MONTH[lang][m]

/** "રવિ" / "Sun" for a civil date. */
export function shortWeekday (date: string, lang: Lang): string {
  const [y, m, d] = date.split('-').map(Number)
  return SHORT_WEEKDAY[lang][new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
}

/** "6 નવે" / "6 Nov", or "શુક્ર, 6 નવે" / "Fri, 6 Nov" with the weekday. */
export function shortDate (date: string, lang: Lang, withWeekday = false): string {
  const [, m, d] = date.split('-').map(Number)
  const body = `${d} ${SHORT_MONTH[lang][m - 1]}`
  return withWeekday ? `${shortWeekday(date, lang)}, ${body}` : body
}
