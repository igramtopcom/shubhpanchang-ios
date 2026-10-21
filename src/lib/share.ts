// "Send today's panchang": the same forward-ready WhatsApp message as the
// website's (src/pages/index.astro in igramtopcom/shubhpanchang, growth ②),
// for the reader's own place. ?ref=app tells the site which visits the app's
// shares bring; on an iPhone with the app the link opens the app instead
// (Universal Links). Pure: tested directly.

import { longDate } from './i18n'
import type { Lang, PanchangDay, Place } from './types'

export function shareMessage (day: PanchangDay, place: Place, lang: Lang): string {
  const gu = lang === 'gu'
  const where = place.name ? place.name[lang] : `${place.lat.toFixed(2)}, ${place.lon.toFixed(2)}`
  const vrat = (day.vrat?.items ?? (day.vrat ? [{ en: day.vrat.en, gu: day.vrat.guDialect ?? day.vrat.gu }] : []))
    .map(v => (gu ? v.gu : v.en)).join(', ')
  const lines = gu ? [
    `🙏 આજનું પંચાંગ · ${longDate(day.date, 'gu')} · ${where}`,
    `📿 તિથિ: ${day.hinduMonth.gu} ${day.tithi.paksha === 'shukla' ? 'સુદ' : 'વદ'} ${day.tithi.nameGu}`,
    `⭐ નક્ષત્ર: ${day.nakshatra.nameGu}`,
    `🕉️ અભિજિત મુહૂર્ત: ${day.abhijitMuhurta.start}–${day.abhijitMuhurta.end}`,
    `🚫 રાહુ કાળ: ${day.rahuKaal.start}–${day.rahuKaal.end} (ટાળો)`,
    `🌅 સૂર્યોદય: ${day.sunrise} · 🌇 સૂર્યાસ્ત: ${day.sunset}`,
    vrat ? `🪔 આજે: ${vrat}` : '',
  ] : [
    `🙏 Today's Panchang · ${longDate(day.date, 'en')} · ${where}`,
    `📿 Tithi: ${day.hinduMonth.en} ${day.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${day.tithi.name}`,
    `⭐ Nakshatra: ${day.nakshatra.name}`,
    `🕉️ Abhijit Muhurat: ${day.abhijitMuhurta.start}–${day.abhijitMuhurta.end}`,
    `🚫 Rahu Kaal: ${day.rahuKaal.start}–${day.rahuKaal.end} (Avoid)`,
    `🌅 Sunrise: ${day.sunrise} · 🌇 Sunset: ${day.sunset}`,
    vrat ? `🪔 Today: ${vrat}` : '',
  ]
  const query = [gu ? '' : 'lang=en', 'ref=app'].filter(Boolean).join('&')
  const link = `https://shubhpanchang.in/${place.city ? `panchang/${place.city}` : ''}?${query}`
  return `${lines.filter(Boolean).join('\n')}\n\n📲 ${gu ? 'સંપૂર્ણ પંચાંગ' : 'Full panchang'}: ${link}`
}
