// Universal Links -> app screens.
//
// The website claims these paths for the app (src/utils/ios-links.ts in the
// repo root; docs/api-v1.md, "Universal Links"). The app has one screen per
// subject rather than one per web page, so each path lands on the screen that
// answers the same question. Anything unknown opens Today rather than failing.

export type AppRoute = '/' | '/vrat' | '/family' | '/calendar' | '/settings'

export function routeForWebPath (path: string): AppRoute {
  let p = path
  try { p = new URL(path, 'https://shubhpanchang.in').pathname } catch { return '/' }
  if (p === '/' || p === '') return '/'
  if (/^\/(panchang|choghadiya|hora)(\/|$)/.test(p)) return '/'
  if (/^\/(ekadashi|purnima|amavasya|sankashti-chaturthi)-\d{4}\/?$/.test(p)) return '/vrat'
  if (/^\/festivals(\/|$)/.test(p)) return '/vrat'
  if (/^\/calendar(\/|$)/.test(p)) return '/calendar'
  // The app's own routes, when a notification or a widget opens one.
  if (/^\/(vrat|family|calendar|settings)$/.test(p)) return p as AppRoute
  return '/'
}
