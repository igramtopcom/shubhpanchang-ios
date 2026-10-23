// Finding a festival or a vrat by name, in Gujarati or English, loosely: case
// and spacing do not matter, and common spellings meet (Diwali / Deepavali,
// Ekadashi / Agiyaras). Results group by name, one row per year.

import type { Festival, Lang, Observance } from './types'

export interface SearchHit { date: string; href: string; detail: string }
export interface SearchGroup { name: string; hits: SearchHit[] }

/** Spellings people type for the same thing. */
const ALIASES: [RegExp, string][] = [
  [/deepavali|dipavali|divali/g, 'diwali'],
  [/agiyaras|agyaras|ekadasi/g, 'ekadashi'],
  [/poonam|punam|purnima/g, 'purnima'],
  [/amas|amavasya|amavas/g, 'amavasya'],
  [/navaratri|navratri|norta/g, 'navratri'],
  [/sankashti|sankasti|sankat/g, 'sankashti'],
]

export function norm (s: string): string {
  let x = s.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  for (const [re, to] of ALIASES) x = x.replace(re, to)
  return x
}

export function searchItems (query: string, fests: Festival[], obs: Observance[], lang: Lang): SearchGroup[] {
  const q = norm(query)
  if (q.length < 2) return []
  const groups = new Map<string, SearchHit[]>()
  const seen = new Set<string>()
  const add = (name: string, hit: SearchHit) => {
    if (seen.has(hit.href)) return
    seen.add(hit.href)
    groups.set(name, [...(groups.get(name) ?? []), hit])
  }
  for (const f of fests) {
    if (!norm(`${f.nameEn} ${f.nameGu}`).includes(q)) continue
    add(lang === 'gu' ? f.nameGu : f.nameEn, { date: f.date, href: `/festival?slug=${encodeURIComponent(f.slug)}`, detail: f.about ? f.about[lang] : '' })
  }
  // A vrat named like a festival (the Amavasya the list calls "Diwali") is that festival: keep the festival.
  const festNames = new Set(fests.flatMap(f => [norm(f.nameEn), norm(f.nameGu)]))
  for (const o of obs) {
    if (!norm(`${o.nameEn} ${o.nameGu}`).includes(q)) continue
    if (festNames.has(norm(o.nameEn)) || festNames.has(norm(o.nameGu))) continue
    add(lang === 'gu' ? o.nameGu : o.nameEn, { date: o.date, href: `/observance?kind=${o.kind}&date=${o.date}`, detail: '' })
  }
  // Names that start with the query first, then by how soon they come.
  return [...groups.entries()]
    .map(([name, hits]) => ({ name, hits: hits.sort((a, b) => (a.date < b.date ? -1 : 1)) }))
    .sort((a, b) => Number(!norm(a.name).startsWith(q)) - Number(!norm(b.name).startsWith(q)) || (a.hits[0].date < b.hits[0].date ? -1 : 1))
    .slice(0, 12)
}
