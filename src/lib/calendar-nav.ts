// Moving about the calendar: months as "YYYY-MM", the range the API serves,
// the Vikram Samvat year's months (Kartik to Aso) on the civil calendar, and
// the short tithi a day cell has room for.

import type { Lang, PanchangDay } from './types'

/** The panchang API serves 2025 to 2030. */
export const CAL_FIRST = '2025-01'
export const CAL_LAST = '2030-12'

export function addMonths (month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + n, 1))
  return d.toISOString().slice(0, 7)
}

/** A Gujarati year runs Kartik to Aso: indices into the Chaitra-first month lists. */
export const LUNAR_FROM_KARTIK = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6]

/**
 * The civil month that holds most of the k-th month (0 = Kartik) of Vikram
 * Samvat `vs`. Samvat `vs` begins on Bestu Varas in the autumn of `vs - 57`,
 * so Kartik falls mostly in November of that year. A guide for jumping there,
 * not a date: lunar months slide against the civil ones.
 */
export function civilMonthOfLunar (vs: number, k: number): string {
  return addMonths(`${vs - 57}-11`, k)
}

/** "2082" or "2082–83" for the Vikram Samvat years a month's days fall in. */
export function samvatOfMonth (days: Pick<PanchangDay, 'vikramSamvat'>[]): string {
  const ys = [...new Set(days.map(d => d.vikramSamvat))].sort()
  if (!ys.length) return ''
  return ys.length === 1 ? String(ys[0]) : `${ys[0]}–${String(ys[ys.length - 1]).slice(-2)}`
}

/** "સુદ 5", "વદ 12", "પૂનમ", "અમાસ" / "S 5", "K 12", "Purnima", "Amavasya". */
export function tithiShort (d: Pick<PanchangDay, 'tithi'>, lang: Lang): string {
  const i = d.tithi.index
  if (i === 14) return lang === 'gu' ? 'પૂનમ' : 'Purnima'
  if (i === 29) return lang === 'gu' ? 'અમાસ' : 'Amavasya'
  const n = (i % 15) + 1
  return lang === 'gu' ? `${i < 15 ? 'સુદ' : 'વદ'} ${n}` : `${i < 15 ? 'S' : 'K'} ${n}`
}
