import { describe, it, expect } from 'vitest'
import { goodRuns, nowView } from '../src/lib/now-view'
import { timeline } from '../src/lib/shubh'
import { toMinutes } from '../src/lib/time'
import fx from './fixtures/ahmedabad-2026-10-24.json'

// Ahmedabad, Saturday 24 October 2026, from /api/v1/panchang (and the 25th for tomorrow).
const tl = timeline([fx.d1024, fx.d1025] as never, '2026-10-24')
const at = (hhmm: string) => toMinutes(hhmm)
const hm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

describe('the card on Today names the choghadiya running now', () => {
  it('2:20 pm: Labh, good until 3:15, then Amrit, Kaal, and the night Labh', () => {
    const v = nowView(tl, at('14:20'))!
    expect(v.kind).toBe('good')
    expect(v.slot!.name).toBe('Labh')
    expect(hm(v.end)).toBe('15:15')
    expect(v.next.map(x => `${x.name} ${hm(x.start)}`)).toEqual(['Amrit 15:15', 'Kaal 16:41', 'Labh 18:07'])
  })
  it('10:05 am: Rahu Kaal over Rog, until 10:58; then Udveg, Char, Labh', () => {
    const v = nowView(tl, at('10:05'))!
    expect(v.kind).toBe('rahu')
    expect(v.slot!.name).toBe('Rog')
    expect(hm(v.end)).toBe('10:58')
    expect(v.next.map(x => x.name)).toEqual(['Udveg', 'Char', 'Labh'])
  })
  it('8:30 pm: Udveg, to avoid until 9:16; the night runs on past midnight', () => {
    const v = nowView(tl, at('20:30'))!
    expect(v.kind).toBe('avoid')
    expect(hm(v.end)).toBe('21:16')
    expect(v.next.map(x => `${x.name} ${hm(x.start)}`)).toEqual(['Shubh 21:16', 'Amrit 22:50', 'Char 00:24'])
    expect(v.nextGood!.name).toBe('Shubh')
  })
  it('12:30 pm: Char is neutral', () => {
    expect(nowView(tl, at('12:30'))!.kind).toBe('fair')
  })
})

describe("tomorrow's good times, in runs", () => {
  it('Labh and Amrit run together, then Shubh; Rahu Kaal is not in them', () => {
    const t2 = timeline([fx.d1025] as never, '2026-10-25')
    const runs = goodRuns(t2, toMinutes(fx.d1025.sunrise), toMinutes(fx.d1025.sunset))
    expect(runs.map(r => `${r.names.join('+')} ${hm(r.start)}-${hm(r.end)}`)).toEqual(['Labh+Amrit 09:32-12:24', 'Shubh 13:49-15:15'])
  })
})
