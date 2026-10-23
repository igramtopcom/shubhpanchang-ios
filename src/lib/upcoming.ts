// "Coming up" on Today: the next vrats, festivals and family dates in one
// list, by date, each with the one line that matters (Parana, moonrise, how
// soon) and where a tap goes.

import { clock, clockRange, shortDate } from './format'
import { lunarLabel, t } from './i18n'
import { norm } from './search'
import { daysBetween } from './time'
import type { FamilyDate, Festival, Lang, Observance, ObservanceKind, TithiOccurrence } from './types'

export interface UpcomingItem {
  kind: 'vrat' | 'festival' | 'family'
  date: string
  title: string
  detail: string
  href: string
}

const ORDER = { festival: 0, vrat: 1, family: 2 }

/** "બાની પુણ્યતિથિ" / "Ba's punyatithi". */
export function familyTitle (person: Pick<FamilyDate, 'name' | 'kind'>, lang: Lang): string {
  const s = t(lang)
  return person.kind === 'birthday' ? s.birthdayOf(person.name) : person.kind === 'anniversary' ? s.anniversaryOf(person.name) : s.punyatithiOf(person.name)
}

export function upcoming (
  obs: Observance[] | null,
  fest: Festival[] | null,
  fam: { person: FamilyDate; next: TithiOccurrence | null }[] | null,
  kinds: ObservanceKind[],
  today: string,
  lang: Lang,
  h24 = false,
): UpcomingItem[] {
  const s = t(lang)
  const gu = lang === 'gu'
  const soon = (date: string) => s.relDays(daysBetween(today, date))
  const out: UpcomingItem[] = []
  for (const o of obs ?? []) {
    if (o.date < today || !kinds.includes(o.kind)) continue
    const extra = o.parana
      ? `${s.parana} ${shortDate(o.parana.date, lang)}, ${o.parana.end ? clockRange(o.parana.start, o.parana.end, lang, h24) : s.paranaAfter(clock(o.parana.start, lang, h24))}`
      : o.moonrise ? `${s.moonrise} ${clock(o.moonrise.time, lang, h24, true)}` : null
    out.push({
      kind: 'vrat',
      date: o.date,
      title: gu ? o.nameGu : o.nameEn,
      detail: [o.date === today ? s.today : soon(o.date), extra].filter(Boolean).join(' · '),
      href: `/observance?kind=${o.kind}&date=${o.date}`,
    })
  }
  for (const f of fest ?? []) {
    if (f.date < today) continue
    out.push({ kind: 'festival', date: f.date, title: gu ? f.nameGu : f.nameEn, detail: f.date === today ? s.today : soon(f.date), href: `/festival?slug=${encodeURIComponent(f.slug)}` })
  }
  for (const { person, next } of fam ?? []) {
    if (!next || next.date < today) continue
    const what = familyTitle(person, lang)
    out.push({ kind: 'family', date: next.date, title: what, detail: `${lunarLabel(person.lunar, lang)} · ${soon(next.date)}`, href: `/person?id=${person.id}` })
  }
  // A festival that is also a vrat (Sharad Punam) once, as the festival.
  const seen = new Set<string>()
  return out
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : ORDER[a.kind] - ORDER[b.kind]))
    .filter(x => { const k = `${x.date}:${norm(x.title)}`; if (seen.has(k)) return false; seen.add(k); return true })
}
