// What the Today card says about now: the choghadiya running by its own name
// (or Rahu Kaal over it), until when, and the three that follow; and, for
// tomorrow or another day, its good choghadiya as a few runs of time.
// Built on the timeline in shubh.ts; times are minutes on that timeline.

import { goodWindows, shubhNow, type Slot, type Timeline } from './shubh'

export interface NowView {
  /** good: a good choghadiya; fair: Char; avoid: Udveg, Rog, Kaal; rahu: Rahu Kaal over whatever runs. */
  kind: 'good' | 'fair' | 'avoid' | 'rahu'
  /** The choghadiya running now. */
  slot: Slot | null
  /** What the card counts down: the good window, Rahu Kaal, or the slot. */
  start: number
  end: number
  /** The three choghadiya after the one running now. */
  next: Slot[]
  /** The next good window after now (for the one-line form on a festival day). */
  nextGood: { name: string; start: number; end: number } | null
}

export function nowView (t: Timeline, now: number): NowView | null {
  const sh = shubhNow(t, now)
  if (!sh.slot && !sh.rahu) return null
  // A good choghadiya with Rahu Kaal inside it is good only up to Rahu Kaal.
  const kind: NowView['kind'] = sh.rahu ? 'rahu' : sh.good ? 'good' : sh.slot!.tier === 'ok' ? 'fair' : sh.slot!.tier === 'best' ? 'good' : 'avoid'
  const span = sh.rahu ?? sh.good ?? sh.slot!
  const after = sh.slot ? sh.slot.end : span.end
  return {
    kind,
    slot: sh.slot,
    start: span.start,
    end: span.end,
    next: t.slots.filter(s => s.start >= after).slice(0, 3),
    nextGood: sh.next,
  }
}

export interface GoodRun { names: string[]; start: number; end: number }

/** The good choghadiya between `from` and `to`, Rahu Kaal cut out, touching ones as one run ("Labh, Amrit 9:32 - 12:24"). */
export function goodRuns (t: Timeline, from: number, to: number): GoodRun[] {
  const runs: GoodRun[] = []
  for (const w of goodWindows(t)) {
    if (w.start < from || w.end > to) continue
    const last = runs[runs.length - 1]
    if (last && last.end === w.start) {
      last.end = w.end
      if (!last.names.includes(w.name)) last.names.push(w.name)
    } else {
      runs.push({ names: [w.name], start: w.start, end: w.end })
    }
  }
  return runs
}
