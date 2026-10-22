// The screenshot tour: screenshot builds only (EXPO_PUBLIC_SCREENSHOT_SEED=1,
// set by .github/workflows/ios-screens.yml for a simulator build).
//
// iOS asks "Open in ShubhPanchang?" for every custom-scheme link opened from
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
  route: '/' | '/vrat' | '/vrat?seg=festivals' | '/family' | '/calendar' | '/settings' | '/family-add' | '/place'
  /** File name of the capture CI takes at this step. */
  shot: string
}

export const TOUR: TourStep[] = [
  { seed: { lang: 'gu', city: 'ahmedabad' }, route: '/', shot: '02-today-gu' },
  { route: '/vrat', shot: '03-vrat-gu' },
  { route: '/family', shot: '04-family-gu' },
  { route: '/calendar', shot: '05-calendar-gu' },
  { route: '/settings', shot: '06-settings-gu' },
  { route: '/family-add', shot: '07-family-add-gu' },
  { route: '/place', shot: '08-place-gu' },
  { seed: { lang: 'en', city: 'newjersey-us' }, route: '/', shot: '09-today-en-nj' },
  { route: '/vrat', shot: '10-vrat-en-nj' },
  // CI switches the simulator to dark appearance before these two.
  { route: '/', shot: '11-today-dark-en' },
  { route: '/calendar', shot: '12-calendar-dark-en' },
  // CI switches back to light appearance for the festival lists.
  { seed: { lang: 'gu', city: 'ahmedabad' }, route: '/vrat?seg=festivals', shot: '13-festivals-gu' },
  { seed: { lang: 'en', city: 'newjersey-us' }, route: '/vrat?seg=festivals', shot: '14-festivals-en-nj' },
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
