// Dates and clock times at the chosen place.
//
// Everything the API returns is a civil date ("2026-10-22") or a wall-clock
// time ("06:39") at the place, which need not be the phone's own time zone (a
// reader in London can follow Ahmedabad). Dates stay strings; only the moment a
// notification fires becomes a real instant, through zonedTimeToUtc.

export const DAY_MIN = 1440

/** "HH:MM" -> minutes after midnight, or -1 if it does not parse. */
export function toMinutes (hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  return m ? Number(m[1]) * 60 + Number(m[2]) : -1
}

export function hhmm (minutes: number): string {
  const m = ((Math.round(minutes) % DAY_MIN) + DAY_MIN) % DAY_MIN
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export const shiftDate = (date: string, days: number): string =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10)

export const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000)

/** Weekday 0 = Sunday for a civil date. */
export const weekday = (date: string): number => new Date(`${date}T12:00:00Z`).getUTCDay()

/** The civil date and minutes after midnight at `timeZone` for an instant. */
export function zonedNow (timeZone: string, at: Date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(at)
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? '00'
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

/**
 * The instant at which the wall clock at `timeZone` reads `minutes` after
 * midnight of `date`. Two passes settle the offset across a DST change.
 */
export function zonedTimeToUtc (date: string, minutes: number, timeZone: string): Date {
  const wall = Date.parse(`${date}T00:00:00Z`) + minutes * 60000
  let guess = wall
  for (let i = 0; i < 2; i++) {
    const seen = zonedNow(timeZone, new Date(guess))
    const seenWall = Date.parse(`${seen.date}T00:00:00Z`) + seen.minutes * 60000
    guess += wall - seenWall
  }
  return new Date(guess)
}
