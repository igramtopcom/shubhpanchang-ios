// Shapes of the /api/v1 responses the app reads (docs/api-v1.md in the repo root).
// Only the fields the app uses are typed; the server sends more.

export type Lang = 'gu' | 'en'

/**
 * Whose Ekadashi the reader keeps: the Smarta panchang, or a Vaishnava
 * sampradaya of Gujarat, whose calendars keep some a day later
 * (docs/sampradaya-ekadashi.md in the website repo).
 */
export type Sampradaya = 'smarta' | 'swaminarayan' | 'baps' | 'pushtimarg' | 'jain'

export const SAMPRADAYAS: Sampradaya[] = ['smarta', 'swaminarayan', 'baps', 'pushtimarg', 'jain']

/** The sampradayas that keep the Vaishnava Ekadashi (a day later at times). Jains keep the parva tithis instead. */
export const isVaishnava = (s: Sampradaya) => s === 'swaminarayan' || s === 'baps' || s === 'pushtimarg'

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

export type ObservanceKind = 'ekadashi' | 'purnima' | 'amavasya' | 'sankashti' | 'pradosh' | 'shivaratri' | 'parva'

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

/** A festival at the place (/api/v1/festivals): Diwali, Navratri, Uttarayan... */
export interface Festival {
  slug: string
  date: string
  nameEn: string
  nameGu: string
  type: 'major' | 'regional' | 'vrat'
  about: { en: string; gu: string } | null
  indiaDate: string
  /** india-list; local-day (moved to the place's day); local-same (worked out here, India's day too); india-date (abroad, kept on India's date); sampradaya (an utsav of the reader's sampradaya). */
  reason: 'india-list' | 'local-day' | 'local-same' | 'india-date' | 'sampradaya'
  /** The festival's page on the site; null for a sampradaya utsav, which has none. */
  url: string | null
  sampradaya?: Sampradaya
  /** The festival has a full write-up (/api/v1/festival): story, vidhi, mantra, FAQ. */
  hasContent?: boolean
}

export interface Bi { en: string; gu: string }

/** /api/v1/festival: one festival at the place with its write-up and, for Diwali and Dhanteras, the puja muhurat. */
export interface FestivalDetail {
  festival: Festival & { tithi?: Bi }
  content: {
    calendarContext: Bi
    story: { heading: Bi; paragraphs: Bi[]; subsections: { heading: Bi; en: string; gu: string }[] }
    fasting: { heading: Bi | null; rules: Bi[] } | null
    vidhi: { heading: Bi | null; steps: Bi[] } | null
    mantra: { devanagari: string; gujarati: string; roman: string; meaning: Bi; note: Bi | null } | null
    dosDontsHeading: Bi | null
    dos: Bi[]
    donts: Bi[]
    faqHeading: Bi
    faqs: { q: Bi; a: Bi }[]
  } | null
  muhurat: {
    label: Bi
    start: string
    end: string
    pradoshKaal: TimeRange
    vrishabha: TimeRange
    tithi: { name: Bi; start: { date: string; time: string }; end: { date: string; time: string } }
    /** Chopda Pujan (Diwali): the Amrit / Shubh / Labh runs while Amavasya holds. */
    chopda: { names: Bi; start: { date: string; time: string }; end: { date: string; time: string } }[]
  } | null
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

/**
 * A family date the user keeps by tithi. Lives only on the phone. An event
 * still to come (a wedding next month) counts from its own day (firstFrom).
 */
export interface FamilyDate {
  id: string
  name: string
  /** A wedding anniversary counts by the sunrise tithi, like a birthday. */
  kind: 'birthday' | 'shraddh' | 'anniversary'
  lunar: Pick<LunarDate, 'month' | 'adhik' | 'tithi'>
  /** The Gregorian date the user entered, if any (for display). */
  origin?: { date: string; time?: string }
  /** false: no reminder for this person (on by default). */
  remind?: boolean
  /**
   * How it comes round: on the tithi every year (the default), on the same
   * calendar date, on both days, or just once (a wedding still to come).
   * Anything but 'tithi' needs `origin`.
   */
  repeat?: 'tithi' | 'date' | 'both' | 'once'
}
