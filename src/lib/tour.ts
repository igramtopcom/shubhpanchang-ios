// The screenshot tour: screenshot builds only (EXPO_PUBLIC_SCREENSHOT_SEED=1,
// set by .github/workflows/ios-screens.yml for a simulator build).
//
// iOS asks "Open in Divo?" for every custom-scheme link opened from
// outside (xcrun simctl openurl), and the dialog stays over the screen, so CI
// cannot drive the app by links. Instead CI launches the app once per step
// with a launch argument, `-tourStep N`; iOS puts launch arguments into
// NSUserDefaults, which React Native's Settings reads. The app fills in the
// sample data of that step and opens its screen, and CI takes the picture.
// Each step stands alone, so a slow capture cannot shift the next one (the
// old clock-driven tour did, runs 39609607254 and 39616676756).

import type { Lang } from './types'

export const SCREENSHOT_BUILD = process.env.EXPO_PUBLIC_SCREENSHOT_SEED === '1'

export interface TourStep {
  /** Fill in a language, a place and sample family dates first. */
  seed?: { lang: Lang; city: string }
  route: string
  /** File name of the capture CI takes at this step. */
  shot: string
}

// Every screen of the redesign (docs/design). Keep .github/workflows/ios-screens.yml's SHOTS in step.
export const TOUR: TourStep[] = [
  { seed: { lang: 'gu', city: 'ahmedabad' }, route: '/', shot: '02-today-gu' },
  { route: '/choghadiya', shot: '03-choghadiya-gu' },
  { route: '/vrat', shot: '04-vrat-gu' },
  { route: '/festival?slug=diwali-2026', shot: '05-festival-diwali-gu' },
  { route: '/observance?kind=ekadashi&date=2026-11-05', shot: '06-ekadashi-gu' },
  { route: '/calendar', shot: '07-calendar-gu' },
  { route: '/day?date=2026-11-08', shot: '08-day-sheet-gu' },
  { route: '/family', shot: '09-family-gu' },
  { route: '/person?id=tour-dada', shot: '10-person-gu' },
  { route: '/family-add', shot: '11-family-add-gu' },
  { route: '/settings', shot: '12-settings-gu' },
  { route: '/search', shot: '13-search-gu' },
  { seed: { lang: 'en', city: 'newjersey-us' }, route: '/', shot: '14-today-en-nj' },
  { route: '/vrat?seg=festivals', shot: '15-festivals-en-nj' },
  { route: '/observance?kind=ekadashi&date=2026-11-05', shot: '16-ekadashi-en-nj' },
  // CI switches the simulator to dark appearance before these three.
  { route: '/', shot: '17-today-dark-en' },
  { route: '/calendar', shot: '18-calendar-dark-en' },
  { route: '/festival?slug=diwali-2026', shot: '19-festival-dark-en' },
]

/** A `-tourStep` launch argument as a step index, or null (first launch: onboarding). */
export function stepIndex (raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === '') return null
  const v = Number(raw)
  return Number.isInteger(v) && v >= 0 && v < TOUR.length ? v : null
}

/** The sample data in force at step i: the last seed at or before it. */
export function seedFor (i: number): NonNullable<TourStep['seed']> {
  for (let k = i; k >= 0; k--) if (TOUR[k].seed) return TOUR[k].seed!
  return TOUR[0].seed!
}
