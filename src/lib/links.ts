// Incoming links -> app screens.
//
// Universal Links: the website claims these paths for the app
// (src/utils/ios-links.ts in igramtopcom/shubhpanchang; its docs/api-v1.md,
// "Universal Links"). The app has one screen per subject rather than one per
// web page, so each path lands on the screen that answers the same question.
// The app's own scheme (shubhpanchang://vrat) and notification taps use the
// app's routes directly. Anything unknown opens Today rather than failing.

export type AppRoute = '/' | '/vrat' | '/family' | '/calendar' | '/settings' | '/family-add' | '/place'

/** The path of a link: https://shubhpanchang.in/vrat and shubhpanchang://vrat both give "/vrat". */
function pathOf (u: URL): string {
  if (/^https?:$/.test(u.protocol)) return u.pathname
  // A custom scheme reads its first segment as the host: shubhpanchang://vrat/x -> host "vrat".
  return `/${u.host}${u.pathname}`.replace(/\/+$/, '') || '/'
}

export function routeForWebPath (path: string): AppRoute {
  let u: URL
  try { u = new URL(path, 'https://shubhpanchang.in') } catch { return '/' }
  const p = pathOf(u)
  if (p === '/' || p === '') return '/'
  if (/^\/(panchang|choghadiya|hora)(\/|$)/.test(p)) return '/'
  if (/^\/(ekadashi|purnima|amavasya|sankashti-chaturthi)-\d{4}\/?$/.test(p)) return '/vrat'
  if (/^\/festivals(\/|$)/.test(p)) return '/vrat'
  if (/^\/calendar(\/|$)/.test(p)) return '/calendar'
  // The app's own routes, when a notification, a widget or the app's scheme opens one.
  if (/^\/(vrat|family|calendar|settings|family-add|place)$/.test(p)) return p as AppRoute
  return '/'
}
