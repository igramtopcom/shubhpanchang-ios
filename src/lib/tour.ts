// The screenshot tour: screenshot builds only (EXPO_PUBLIC_SCREENSHOT_SEED=1,
// set by .github/workflows/ios-screens.yml for a simulator build).
//
// iOS asks "Open in ShubhPanchang?" for every custom-scheme link opened from
// outside (xcrun simctl openurl), and the dialog stays over the screen, so CI
// cannot drive the app by links. Instead the app walks through its own screens
// on a fixed clock from launch, and CI captures each at the matching moment.
// The workflow's capture times are TOUR_START + i * TOUR_STEP + a few seconds;
// keep the two in step.

import type { Lang } from './types'

export const SCREENSHOT_BUILD = process.env.EXPO_PUBLIC_SCREENSHOT_SEED === '1'

/** Seconds after launch of the first step (onboarding is captured before it). */
export const TOUR_START = 20
/** Seconds between steps: room for the API answers to arrive. */
export const TOUR_STEP = 12

export interface TourStep {
  /** Fill in a language, a place and sample family dates first. */
  seed?: { lang: Lang; city: string }
  route: '/' | '/vrat' | '/family' | '/calendar' | '/settings' | '/family-add' | '/place'
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
]
