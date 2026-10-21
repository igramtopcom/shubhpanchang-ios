// "Is now a good time, and if not, until when?" - the question behind the
// million "aaj na choghadiya" searches, answered from the day's choghadiya and
// Rahu Kaal.
//
// The tiers and the night-block arithmetic are the website's own
// (src/utils/chog-tier.ts, src/utils/chog-state.ts in the repo root): Amrit,
// Shubh, Labh are good; Char neutral; Udveg, Rog, Kaal to avoid. A night block
// runs sunset -> next sunrise, so its clock times wrap past midnight and are
// laid on one timeline by bumping a day whenever a start goes backwards.
//
// A good window is a good choghadiya slot minus any Rahu Kaal inside it.
// Times are minutes on a timeline whose zero is midnight of `base` at the place.

import type { ChoghadiyaSlot, PanchangDay } from './types'
import { DAY_MIN, daysBetween, toMinutes } from './time'

export type ChogTier = 'best' | 'ok' | 'avoid'

const TIER: Record<string, ChogTier> = {
  Amrit: 'best', Shubh: 'best', Labh: 'best',
  Char: 'ok',
  Udveg: 'avoid', Rog: 'avoid', Kaal: 'avoid',
}
export const chogTier = (name: string): ChogTier => TIER[name] ?? 'ok'

export interface Slot { name: string; tier: ChogTier; start: number; end: number; period: 'day' | 'night' }
export interface Span { start: number; end: number }

/** A block's slots on one timeline (night slots after midnight land on the next day). */
function blockWindows (slots: ChoghadiyaSlot[], offset: number): Slot[] {
  let bump = 0
  let prevStart = -1
  return slots.flatMap(s => {
    const a = toMinutes(s.start), b = toMinutes(s.end)
    if (a < 0 || b < 0) return []
    if (a + bump < prevStart) bump += DAY_MIN
    const start = a + bump
    let end = b + bump
    if (end <= start) end += DAY_MIN
    prevStart = start
    return [{ name: s.name, tier: chogTier(s.name), start: start + offset, end: end + offset, period: s.period }]
  })
}

export interface Timeline { slots: Slot[]; rahu: Span[] }

/** Every slot and Rahu Kaal of `days`, on the timeline of `base`. */
export function timeline (days: Pick<PanchangDay, 'date' | 'choghadiya' | 'rahuKaal'>[], base: string): Timeline {
  const slots: Slot[] = []
  const rahu: Span[] = []
  for (const d of days) {
    const off = daysBetween(base, d.date) * DAY_MIN
    slots.push(...blockWindows(d.choghadiya.filter(s => s.period === 'day'), off))
    slots.push(...blockWindows(d.choghadiya.filter(s => s.period === 'night'), off))
    const rs = toMinutes(d.rahuKaal.start), re = toMinutes(d.rahuKaal.end)
    if (rs >= 0 && re > rs) rahu.push({ start: rs + off, end: re + off })
  }
  slots.sort((a, b) => a.start - b.start)
  rahu.sort((a, b) => a.start - b.start)
  return { slots, rahu }
}

/** A good slot with any Rahu Kaal cut out of it, as one or two spans. */
function minusRahu (s: Slot, rahu: Span[]): Span[] {
  let parts: Span[] = [{ start: s.start, end: s.end }]
  for (const r of rahu) {
    parts = parts.flatMap(p => {
      if (r.end <= p.start || r.start >= p.end) return [p]
      const out: Span[] = []
      if (r.start > p.start) out.push({ start: p.start, end: r.start })
      if (r.end < p.end) out.push({ start: r.end, end: p.end })
      return out
    })
  }
  return parts
}

export interface ShubhNow {
  /** The slot running now, if the timeline covers now. */
  slot: Slot | null
  /** Rahu Kaal, when it is running now. */
  rahu: Span | null
  /** A good window running now (good slot, not in Rahu Kaal). */
  good: (Span & { name: string }) | null
  /** The next good window that starts after now. */
  next: (Span & { name: string }) | null
}

export function shubhNow (t: Timeline, now: number): ShubhNow {
  const slot = t.slots.find(s => now >= s.start && now < s.end) ?? null
  const rahu = t.rahu.find(r => now >= r.start && now < r.end) ?? null
  const windows = t.slots
    .filter(s => s.tier === 'best')
    .flatMap(s => minusRahu(s, t.rahu).map(p => ({ ...p, name: s.name })))
    .sort((a, b) => a.start - b.start)
  const good = windows.find(w => now >= w.start && now < w.end) ?? null
  const next = windows.find(w => w.start > now) ?? null
  return { slot, rahu, good, next }
}
