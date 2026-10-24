// The day's tithi as words (the date line with ‹ › is DateLine in band.tsx).
import type { Lang, PanchangDay } from '@/lib/types';

/** "આસો સુદ બારસ" / "Ashwin Shukla Dwadashi", with the Adhik mark when it applies. */
export function dayTithi(day: PanchangDay, lang: Lang): string {
  return lang === 'gu'
    ? `${day.hinduMonth.gu}${day.isAdhikMaas ? ' (અધિક)' : ''} ${day.tithi.paksha === 'shukla' ? 'સુદ' : 'વદ'} ${day.tithi.nameGu}`
    : `${day.hinduMonth.en}${day.isAdhikMaas ? ' (Adhik)' : ''} ${day.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${day.tithi.name}`;
}
