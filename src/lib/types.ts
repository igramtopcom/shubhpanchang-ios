// Shapes of the /api/v1 responses the app reads (docs/api-v1.md in the repo root).
// Only the fields the app uses are typed; the server sends more.

export type Lang = 'gu' | 'en'

export interface Place {
  /** City id from /api/v1/cities, or null for raw coordinates. */
  city: string | null
  name: { en: string; gu: string } | null
  lat: number
  lon: number
  timezone: string
}

export interface City extends Place {
  city: string
  name: { en: string; gu: string }
  country: string
  region: 'gujarati' | 'diaspora'
}

export interface TimeRange { start: string; end: string }

export interface ChoghadiyaSlot {
  period: 'day' | 'night'
  index: number
  name: string
  type: 'auspicious' | 'inauspicious' | 'neutral'
  start: string
  end: string
}

export interface PanchangDay {
  date: string
  tithi: { index: number; name: string; nameGu: string; paksha: 'shukla' | 'krishna'; endTime: string; endDayOffset: number }
  nakshatra: { index: number; name: string; nameGu: string; endTime: string; endDayOffset: number }
  yoga: { name: string; nameGu: string; type: string }
  vara: { index: number; name: string; nameGu: string }
  rahuKaal: TimeRange
  gulikaKaal: TimeRange
  yamaghanta: TimeRange
  abhijitMuhurta: TimeRange
  choghadiya: ChoghadiyaSlot[]
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  hinduMonth: { en: string; gu: string }
  isAdhikMaas: boolean
  vikramSamvat: number
  vrat: {
    en: string; gu: string; guDialect?: string; importance: string
    /** Each observance of the day, with its time where it has one (dayVrat on the server). */
    items?: { en: string; gu: string; time?: { label: { en: string; gu: string }; value: string } }[]
  } | null
}

export type ObservanceKind = 'ekadashi' | 'purnima' | 'amavasya' | 'sankashti' | 'pradosh' | 'shivaratri'

export interface Observance {
  kind: ObservanceKind
  date: string
  nameEn: string
  nameGu: string
  indiaDate?: string
  reason: string
  parana?: { date: string; start: string; end: string | null; kind: string } | null
  moonrise?: { date: string; time: string }
  angaraki?: boolean
  popular?: { en: string; gu: string } | null
  /** Pradosh Kaal / Nishita Kaal, local HH:MM; endDate is the next day when it passes midnight. */
  window?: { start: string; end: string; endDate: string }
}

export interface LunarDate {
  month: number
  adhik: boolean
  tithi: number
  monthEn: string
  monthGu: string
  paksha: 'shukla' | 'krishna'
  tithiEn: string
  tithiGu: string
}

export interface TithiOccurrence extends LunarDate {
  date: string
  reason: string
  rule: 'sunrise' | 'aparahna'
  tithiStart: { date: string; time: string }
  tithiEnd: { date: string; time: string }
  aparahna?: { start: string; end: string }
}

/** A family date the user keeps by tithi. Lives only on the phone. */
export interface FamilyDate {
  id: string
  name: string
  kind: 'birthday' | 'shraddh'
  lunar: Pick<LunarDate, 'month' | 'adhik' | 'tithi'>
  /** The Gregorian date the user entered, if any (for display). */
  origin?: { date: string; time?: string }
}
