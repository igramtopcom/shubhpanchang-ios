// Gujarati and English, side by side. Gujarati is the default, as on the
// website, and every string exists in both (tests/i18n.test.ts checks it).
//
// Names follow the website: a Gujarati wall calendar's tithi names (એકમ ...
// અગિયારસ ... પૂનમ / અમાસ) with સુદ / વદ for the paksha and the Gujarati month
// names (જેઠ, ભાદરવો, not Sanskrit forms); English keeps the Sanskrit names.

import type { Lang } from './types'

export const MONTH_EN = ['Chaitra', 'Vaishakh', 'Jyeshtha', 'Ashadh', 'Shravan', 'Bhadrapad', 'Ashwin', 'Kartik', 'Margashirsh', 'Posh', 'Maha', 'Falgun']
export const MONTH_GU = ['ચૈત્ર', 'વૈશાખ', 'જેઠ', 'અષાઢ', 'શ્રાવણ', 'ભાદરવો', 'આસો', 'કારતક', 'માગસર', 'પોષ', 'મહા', 'ફાગણ']

const TITHI_EN_15 = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi']
const TITHI_GU_15 = ['એકમ', 'બીજ', 'ત્રીજ', 'ચોથ', 'પાંચમ', 'છઠ', 'સાતમ', 'આઠમ', 'નોમ', 'દશમ', 'અગિયારસ', 'બારસ', 'તેરસ', 'ચૌદસ']

/** Tithi name for index 0-29 (14 = Purnima, 29 = Amavasya). */
export function tithiName (index: number, lang: Lang): string {
  if (index === 14) return lang === 'gu' ? 'પૂનમ' : 'Purnima'
  if (index === 29) return lang === 'gu' ? 'અમાસ' : 'Amavasya'
  return (lang === 'gu' ? TITHI_GU_15 : TITHI_EN_15)[index % 15]
}

export const pakshaName = (tithi: number, lang: Lang) =>
  tithi < 15 ? (lang === 'gu' ? 'સુદ' : 'Shukla') : (lang === 'gu' ? 'વદ' : 'Krishna')

/** "આસો સુદ દશમ" / "Ashwin Shukla Dashami", with the Adhik mark when it applies. */
export function lunarLabel (l: { month: number; adhik: boolean; tithi: number }, lang: Lang): string {
  const month = (lang === 'gu' ? MONTH_GU : MONTH_EN)[l.month] + (l.adhik ? (lang === 'gu' ? ' (અધિક)' : ' (Adhik)') : '')
  return `${month} ${pakshaName(l.tithi, lang)} ${tithiName(l.tithi, lang)}`
}

const WEEKDAY = {
  gu: ['રવિવાર', 'સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}
const MONTH_CIVIL = {
  gu: ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટેમ્બર', 'ઑક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}

/** "ગુરુવાર, 22 ઑક્ટોબર" / "Thursday, 22 October" for a civil date string; the year too when asked. */
export function longDate (date: string, lang: Lang, withWeekday = true, withYear = false): string {
  const [y, m, d] = date.split('-').map(Number)
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  const body = `${d} ${MONTH_CIVIL[lang][m - 1]}${withYear ? ` ${y}` : ''}`
  return withWeekday ? `${WEEKDAY[lang][wd]}, ${body}` : body
}

export const STRINGS = {
  gu: {
    appName: 'શુભ પંચાંગ',
    tabToday: 'આજે',
    tabVrat: 'વ્રત',
    tabFamily: 'પરિવાર',
    tabCalendar: 'કેલેન્ડર',
    tabSettings: 'સેટિંગ્સ',
    sunrise: 'સૂર્યોદય',
    sunset: 'સૂર્યાસ્ત',
    moonrise: 'ચંદ્રોદય',
    rahuKaal: 'રાહુ કાળ',
    abhijit: 'અભિજિત મુહૂર્ત',
    nakshatra: 'નક્ષત્ર',
    tithiUntil: 'સુધી',
    goodNow: 'અત્યારે શુભ સમય',
    goodUntil: 'સુધી',
    notGoodNow: 'અત્યારે શુભ સમય નથી',
    inRahu: 'અત્યારે રાહુ કાળ',
    nextGood: 'આગામી શુભ સમય',
    inMinutes: (n: number) => (n < 60 ? `${n} મિનિટમાં` : `${Math.floor(n / 60)} કલાક ${n % 60} મિનિટમાં`),
    choghadiya: 'ચોઘડિયા',
    upcomingVrat: 'આગામી વ્રત',
    parana: 'પારણા',
    paranaAfter: (t: string) => `${t} પછી`,
    fastOn: 'ઉપવાસ',
    keptHere: (india: string) => `અહીંના સૂર્યોદય પ્રમાણે (ભારતમાં ${india})`,
    festivalIndiaDate: 'તહેવાર ભારતની તારીખે; અહીં તિથિ બીજા દિવસે આવે છે.',
    familyTitle: 'પરિવારની તિથિઓ',
    familyEmpty: 'જન્મદિવસ કે શ્રાદ્ધની તિથિ ઉમેરો. દર વર્ષે તે કયા દિવસે આવે છે તે અમે ગણી આપીશું.',
    addPerson: 'તિથિ ઉમેરો',
    birthday: 'જન્મદિવસ',
    shraddh: 'શ્રાદ્ધ / પુણ્યતિથિ',
    nextOn: 'આગામી',
    addToCalendar: 'કેલેન્ડરમાં ઉમેરો',
    subscribeFeed: 'iPhone કેલેન્ડરમાં બધા વ્રત-તહેવાર ઉમેરો',
    settingsPlace: 'સ્થળ',
    settingsLanguage: 'ભાષા',
    settingsNotifications: 'સૂચનાઓ',
    morningDigest: 'સવારનું પંચાંગ',
    vratEve: 'વ્રતની આગલી સાંજે યાદ',
    paranaAlert: 'પારણાનો સમય થાય ત્યારે',
    familyAlert: 'પરિવારની તિથિની આગલી સાંજે',
    offline: 'ઑફલાઇન: સાચવેલી માહિતી બતાવીએ છીએ',
    loading: 'લોડ થઈ રહ્યું છે…',
    retry: 'ફરી પ્રયાસ કરો',
    loadError: 'માહિતી લાવી શકાઈ નહીં. ઇન્ટરનેટ તપાસો.',
    welcome: 'નમસ્તે',
    welcomeBody: 'વ્રતના દિવસ, પારણાનો સમય અને પરિવારની તિથિઓ, તમે જ્યાં રહો છો ત્યાંના સૂર્યોદય પ્રમાણે.',
    chooseLanguage: 'ભાષા પસંદ કરો',
    choosePlace: 'તમે ક્યાં છો?',
    useMyLocation: 'મારું સ્થાન વાપરો',
    locating: 'સ્થાન શોધી રહ્યા છીએ…',
    locationDenied: 'સ્થાનની પરવાનગી નથી. નીચેથી શહેર પસંદ કરો.',
    searchCity: 'શહેર શોધો',
    placeChosen: 'પસંદ કરેલું સ્થળ',
    whichVrat: 'તમે કયા વ્રત રાખો છો?',
    kind_ekadashi: 'એકાદશી (અગિયારસ)',
    kind_purnima: 'પૂનમ',
    kind_amavasya: 'અમાસ',
    kind_sankashti: 'સંકષ્ટ ચતુર્થી',
    kind_pradosh: 'પ્રદોષ વ્રત',
    kind_shivaratri: 'માસિક શિવરાત્રી',
    pradoshKaal: 'પ્રદોષ કાળ',
    nishita: 'નિશીથ કાળ',
    remindQ: 'વ્રતની આગલી સાંજે અને પારણાના સમયે યાદ અપાવીએ?',
    allowNotifications: 'હા, યાદ અપાવો',
    notNow: 'હમણાં નહીં',
    next: 'આગળ',
    start: 'શરૂ કરો',
    change: 'બદલો',
    cancel: 'રદ કરો',
    save: 'સાચવો',
    remove: 'કાઢી નાખો',
    removeQ: (name: string) => `${name}ની તિથિ કાઢી નાખીએ?`,
    removeBody: 'તેની યાદ પણ બંધ થશે. iPhone કેલેન્ડરમાં ઉમેરેલી તારીખ રહેશે.',
    prevMonth: 'પાછલો મહિનો',
    nextMonth: 'આગલો મહિનો',
    tierBest: 'શુભ',
    tierOk: 'મધ્યમ',
    tierAvoid: 'ટાળો',
    vratDay: 'વ્રત',
    tomorrowCap: 'આવતીકાલે',
    paranaBeginsIn: 'પારણા શરૂ થવામાં',
    trackLive: 'લૉક સ્ક્રીન પર ગણતરી બતાવો',
    liveShowing: 'લૉક સ્ક્રીન પર દેખાય છે',
    moonriseIn: 'ચંદ્રોદય થવામાં',
    rahuBeginsIn: 'રાહુ કાળ શરૂ થવામાં',
    rahuEndsIn: 'રાહુ કાળ પૂરો થવામાં',
    noVratSoon: 'આવતા દિવસોમાં કોઈ વ્રત નથી.',
    personName: 'નામ',
    personNamePh: 'દા.ત. બા, દાદા',
    whatDate: 'શેની તિથિ?',
    fromDate: 'તારીખ પરથી (તિથિ અમે શોધીશું)',
    dateFormat: 'તારીખ (YYYY-MM-DD)',
    dateLabel: 'તારીખ',
    knowTime: 'સમય ખબર છે',
    timeOptional: 'સમય, જો ખબર હોય (HH:MM)',
    findTithi: 'તિથિ શોધો',
    orPickTithi: 'અથવા તિથિ સીધી પસંદ કરો',
    month: 'મહિનો',
    paksha: 'પક્ષ',
    tithi: 'તિથિ',
    adhikMonth: 'અધિક માસ',
    tithiIs: 'તિથિ',
    invalidDate: 'તારીખ YYYY-MM-DD રીતે લખો (1900 થી 2100).',
    birthdayRule: 'સૂર્યોદય વખતની તિથિ પ્રમાણે',
    shraddhRule: 'અપરાહ્ન કાળની તિથિ પ્રમાણે (દૃક પંચાંગની રીત)',
    calendarAdded: 'કેલેન્ડરમાં ઉમેર્યું',
    feedNote: 'એક વાર ઉમેરો, પછી નવા વ્રત-તહેવાર આપોઆપ આવશે. તારીખો આ સ્થળ પ્રમાણે છે.',
    notificationsWeb: 'સૂચનાઓ iPhone app માં જ ચાલે છે.',
    aboutTitle: 'ગણતરી વિશે',
    aboutBody: 'બધી તિથિ, સૂર્યોદય અને પારણાના સમય shubhpanchang.in ના એ જ engine માંથી આવે છે. એકાદશી અને પારણા દૃક પંચાંગની રીતે, અને શ્રાદ્ધની તારીખો દૃક પંચાંગના 346 પાનાં સાથે સરખાવીને ચકાસેલી છે.',
    today: 'આજે',
    tomorrow: 'આવતીકાલે',
    vratToday: 'આજનું વ્રત',
    until: (x: string) => `${x} સુધી`,
    aparahna: 'અપરાહ્ન',
  },
  en: {
    appName: 'ShubhPanchang',
    tabToday: 'Today',
    tabVrat: 'Vrat',
    tabFamily: 'Family',
    tabCalendar: 'Calendar',
    tabSettings: 'Settings',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    moonrise: 'Moonrise',
    rahuKaal: 'Rahu Kaal',
    abhijit: 'Abhijit Muhurat',
    nakshatra: 'Nakshatra',
    tithiUntil: 'until',
    goodNow: 'Good time now',
    goodUntil: 'until',
    notGoodNow: 'Not a good time now',
    inRahu: 'Rahu Kaal now',
    nextGood: 'Next good time',
    inMinutes: (n: number) => (n < 60 ? `in ${n} min` : `in ${Math.floor(n / 60)} h ${n % 60} min`),
    choghadiya: 'Choghadiya',
    upcomingVrat: 'Upcoming vrat',
    parana: 'Parana',
    paranaAfter: (t: string) => `after ${t}`,
    fastOn: 'Fast',
    keptHere: (india: string) => `By the local sunrise (India: ${india})`,
    festivalIndiaDate: "A festival, kept on India's date; the tithi falls on another day here.",
    familyTitle: 'Family dates',
    familyEmpty: 'Add a birthday or a shraddh by tithi. We work out the day it falls on each year.',
    addPerson: 'Add a date',
    birthday: 'Birthday',
    shraddh: 'Shraddh / Punyatithi',
    nextOn: 'Next',
    addToCalendar: 'Add to Calendar',
    subscribeFeed: 'Add every vrat and festival to iPhone Calendar',
    settingsPlace: 'Place',
    settingsLanguage: 'Language',
    settingsNotifications: 'Notifications',
    morningDigest: 'Morning panchang',
    vratEve: 'Reminder the evening before a vrat',
    paranaAlert: 'When Parana time begins',
    familyAlert: 'The evening before a family date',
    offline: 'Offline: showing saved data',
    loading: 'Loading…',
    retry: 'Try again',
    loadError: 'Could not load. Check the internet connection.',
    welcome: 'Namaste',
    welcomeBody: 'Vrat days, Parana times and family tithi dates, by the sunrise where you live.',
    chooseLanguage: 'Choose a language',
    choosePlace: 'Where are you?',
    useMyLocation: 'Use my location',
    locating: 'Finding your location…',
    locationDenied: 'No location permission. Choose a city below.',
    searchCity: 'Search a city',
    placeChosen: 'Chosen place',
    whichVrat: 'Which vrats do you keep?',
    kind_ekadashi: 'Ekadashi',
    kind_purnima: 'Purnima',
    kind_amavasya: 'Amavasya',
    kind_sankashti: 'Sankashti Chaturthi',
    kind_pradosh: 'Pradosh Vrat',
    kind_shivaratri: 'Masik Shivratri',
    pradoshKaal: 'Pradosh Kaal',
    nishita: 'Nishita Kaal',
    remindQ: 'Remind you the evening before a vrat and when Parana begins?',
    allowNotifications: 'Yes, remind me',
    notNow: 'Not now',
    next: 'Next',
    start: 'Start',
    change: 'Change',
    cancel: 'Cancel',
    save: 'Save',
    remove: 'Remove',
    removeQ: (name: string) => `Remove ${name}'s tithi?`,
    removeBody: 'Its reminders stop too. Dates already added to iPhone Calendar stay there.',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    tierBest: 'good',
    tierOk: 'fair',
    tierAvoid: 'avoid',
    vratDay: 'vrat',
    tomorrowCap: 'Tomorrow',
    paranaBeginsIn: 'Parana begins in',
    trackLive: 'Count down on the Lock Screen',
    liveShowing: 'Showing on the Lock Screen',
    moonriseIn: 'Moonrise in',
    rahuBeginsIn: 'Rahu Kaal begins in',
    rahuEndsIn: 'Rahu Kaal ends in',
    noVratSoon: 'No vrat in the coming days.',
    personName: 'Name',
    personNamePh: 'e.g. Ba, Dada',
    whatDate: 'Which date?',
    fromDate: 'From a date (we find the tithi)',
    dateFormat: 'Date (YYYY-MM-DD)',
    dateLabel: 'Date',
    knowTime: 'I know the time',
    timeOptional: 'Time, if known (HH:MM)',
    findTithi: 'Find the tithi',
    orPickTithi: 'Or pick the tithi directly',
    month: 'Month',
    paksha: 'Paksha',
    tithi: 'Tithi',
    adhikMonth: 'Adhik month',
    tithiIs: 'Tithi',
    invalidDate: 'Write the date as YYYY-MM-DD (1900 to 2100).',
    birthdayRule: 'By the tithi at sunrise',
    shraddhRule: 'By the tithi in Aparahna (Drik Panchang’s rule)',
    calendarAdded: 'Added to Calendar',
    feedNote: 'Add it once; new vrats and festivals arrive on their own. Dates are for this place.',
    notificationsWeb: 'Notifications work in the iPhone app only.',
    aboutTitle: 'About the calculations',
    aboutBody: 'Every tithi, sunrise and Parana time comes from the same engine as shubhpanchang.in. Ekadashi and Parana follow Drik Panchang’s rules, and shraddh dates were checked against 346 Drik Panchang pages.',
    today: 'Today',
    // Only ever inside parentheses after a time: "05:17 (tomorrow)".
    tomorrow: 'tomorrow',
    vratToday: "Today's vrat",
    until: (x: string) => `until ${x}`,
    aparahna: 'Aparahna',
  },
} as const

export type Strings = typeof STRINGS['gu']
export const t = (lang: Lang): Strings => STRINGS[lang] as unknown as Strings

/** Countries of the listed cities, for the place list (no ISO codes on screen). */
const COUNTRY: Record<string, { en: string; gu: string }> = {
  IN: { en: 'India', gu: 'ભારત' }, US: { en: 'United States', gu: 'અમેરિકા' }, GB: { en: 'United Kingdom', gu: 'યુકે' },
  CA: { en: 'Canada', gu: 'કેનેડા' }, AU: { en: 'Australia', gu: 'ઑસ્ટ્રેલિયા' }, KE: { en: 'Kenya', gu: 'કેન્યા' },
  TZ: { en: 'Tanzania', gu: 'તાન્ઝાનિયા' }, NL: { en: 'Netherlands', gu: 'નેધરલેન્ડ્સ' }, DE: { en: 'Germany', gu: 'જર્મની' },
  BE: { en: 'Belgium', gu: 'બેલ્જિયમ' }, FR: { en: 'France', gu: 'ફ્રાન્સ' }, PT: { en: 'Portugal', gu: 'પોર્ટુગલ' },
  CH: { en: 'Switzerland', gu: 'સ્વિત્ઝર્લેન્ડ' }, AE: { en: 'UAE', gu: 'યુએઈ' }, SG: { en: 'Singapore', gu: 'સિંગાપોર' },
}
export const countryName = (code: string, lang: Lang) => COUNTRY[code]?.[lang] ?? code

const CHOG_GU: Record<string, string> = {
  Amrit: 'અમૃત', Shubh: 'શુભ', Labh: 'લાભ', Char: 'ચલ', Udveg: 'ઉદ્વેગ', Rog: 'રોગ', Kaal: 'કાળ',
}
/** A choghadiya's name in the reader's language. */
export const chogName = (n: string, lang: Lang) => (lang === 'gu' ? CHOG_GU[n] ?? n : n)

/** A place's name in the reader's language. */
export const placeName = (p: { name: { en: string; gu: string } | null; lat: number; lon: number }, lang: Lang) =>
  p.name ? p.name[lang] : `${p.lat.toFixed(2)}, ${p.lon.toFixed(2)}`
