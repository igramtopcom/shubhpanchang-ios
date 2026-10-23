// Incoming links -> app screens.
//
// Universal Links: the website claims these paths for the app
// (src/utils/ios-links.ts in igramtopcom/shubhpanchang; its docs/api-v1.md,
// "Universal Links"). The app has one screen per subject rather than one per
// web page, so each path lands on the screen that answers the same question.
// The app's own scheme (shubhpanchang://vrat) and notification taps use the
// app's routes directly. Anything unknown opens Today rather than failing.

export type AppRoute = string

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
  if (/^\/choghadiya(\/|$)/.test(p)) return '/choghadiya'
  if (/^\/(panchang|hora)(\/|$)/.test(p)) return '/'
  if (/^\/(ekadashi|purnima|amavasya|sankashti-chaturthi)-\d{4}\/?$/.test(p)) return '/vrat'
  // A festival's page opens that festival in the app; the list page opens the list.
  const fest = /^\/festivals\/([a-z0-9-]+)\/?$/.exec(p)
  if (fest) return `/festival?slug=${fest[1]}`
  if (/^\/festivals\/?$/.test(p)) return '/vrat?seg=festivals'
  if (/^\/calendar(\/|$)/.test(p)) return '/calendar'
  // The app's own routes, when a notification, a widget or the app's scheme opens one.
  if (/^\/(vrat|family|calendar|settings|family-add|place|choghadiya|search)$/.test(p)) return `${p}${u.search}`
  if (/^\/(festival|observance|person|day)$/.test(p) && u.search) return `${p}${u.search}`
  return '/'
}
