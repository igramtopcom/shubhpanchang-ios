// Turning a GPS fix into the place the app reckons for.
//
// A listed city within reach is preferred: its answers are the website's own
// (same city id, same cached days, the diaspora table), and its name reads
// better than coordinates. Further away, the rounded coordinates and the
// phone's time zone are used as they are.

import type { City, Place } from './types'

const R_KM = 6371

export function distanceKm (a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R_KM * Math.asin(Math.sqrt(h))
}

/** Within this distance a listed city stands in for the fix (sunrise moves ~4 s per km east-west). */
export const NEAREST_CITY_KM = 40

export function placeFromFix (fix: { lat: number; lon: number }, timezone: string, cities: City[]): Place {
  let best: City | null = null
  let bestKm = Infinity
  for (const c of cities) {
    const km = distanceKm(fix, c)
    if (km < bestKm) { best = c; bestKm = km }
  }
  if (best && bestKm <= NEAREST_CITY_KM && best.timezone === timezone) {
    return { city: best.city, name: best.name, lat: best.lat, lon: best.lon, timezone: best.timezone }
  }
  return {
    city: null,
    name: null,
    lat: Math.round(fix.lat * 100) / 100,
    lon: Math.round(fix.lon * 100) / 100,
    timezone,
  }
}

/** Cities whose English or Gujarati name contains the query, best matches first. */
export function searchCities (cities: City[], query: string): City[] {
  const q = query.trim().toLowerCase()
  if (!q) return cities
  const score = (c: City) => {
    const en = c.name.en.toLowerCase(), gu = c.name.gu
    if (en.startsWith(q) || gu.startsWith(query.trim())) return 0
    if (en.includes(q) || gu.includes(query.trim())) return 1
    return 2
  }
  return cities.filter(c => score(c) < 2).sort((a, b) => score(a) - score(b))
}
