// Incoming links -> app screens.
//
// Universal Links: the website claims these paths for the app
// (src/utils/ios-links.ts in igramtopcom/shubhpanchang; its docs/api-v1.md,
// "Universal Links"). The app has one screen per subject rather than one per
// web page, so each path lands on the screen that answers the same question.
// The app's own scheme (shubhpanchang://vrat) and notification taps use the
// app's routes directly. Anything unknown opens Today rather than failing.

export type AppRoute = '/' | '/vrat' | '/family' | '/calendar' | '/settings' | '/family-add' | '/place'

/**
 * Screenshot builds only (EXPO_PUBLIC_SCREENSHOT_SEED=1, set by
 * .github/workflows/ios-screens.yml for a simulator build): shubhpanchang://seed?...
 * fills in a language, a place and sample family dates (src/app/seed.tsx), so
 * CI can open every screen without tapping through onboarding. Off in every
 * other build, where the link opens Today.
 */
export const SEED_ENABLED = process.env.EXPO_PUBLIC_SCREENSHOT_SEED === '1'

/** The path of a link: https://shubhpanchang.in/vrat and shubhpanchang://vrat both give "/vrat". */
function pathOf (u: URL): string {
  if (/^https?:$/.test(u.protocol)) return u.pathname
  // A custom scheme reads its first segment as the host: shubhpanchang://vrat/x -> host "vrat".
  return `/${u.host}${u.pathname}`.replace(/\/+$/, '') || '/'
}

export function routeForWebPath (path: string, seed = SEED_ENABLED): AppRoute | `/seed${string}` {
  let u: URL
  try { u = new URL(path, 'https://shubhpanchang.in') } catch { return '/' }
  const p = pathOf(u)
  if (p === '/' || p === '') return '/'
  if (seed && p === '/seed') return `/seed${u.search}`
  if (/^\/(panchang|choghadiya|hora)(\/|$)/.test(p)) return '/'
  if (/^\/(ekadashi|purnima|amavasya|sankashti-chaturthi)-\d{4}\/?$/.test(p)) return '/vrat'
  if (/^\/festivals(\/|$)/.test(p)) return '/vrat'
  if (/^\/calendar(\/|$)/.test(p)) return '/calendar'
  // The app's own routes, when a notification, a widget or the app's scheme opens one.
  if (/^\/(vrat|family|calendar|settings|family-add|place)$/.test(p)) return p as AppRoute
  return '/'
}
