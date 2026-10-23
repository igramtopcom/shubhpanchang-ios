// The day's heading with ‹ › to step it, and the day's tithi as words.
import { Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { tick } from '@/lib/haptics';
import { longDate, t } from '@/lib/i18n';
import type { Lang, PanchangDay } from '@/lib/types';

import { T, useColors } from './ui';

/** "આસો સુદ બારસ" / "Ashwin Shukla Dwadashi", with the Adhik mark when it applies. */
export function dayTithi(day: PanchangDay, lang: Lang): string {
  return lang === 'gu'
    ? `${day.hinduMonth.gu}${day.isAdhikMaas ? ' (અધિક)' : ''} ${day.tithi.paksha === 'shukla' ? 'સુદ' : 'વદ'} ${day.tithi.nameGu}`
    : `${day.hinduMonth.en}${day.isAdhikMaas ? ' (Adhik)' : ''} ${day.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${day.tithi.name}`;
}

export function DayStep({ date, lang, sub, onPrev, onNext, today }: { date: string; lang: Lang; sub: string; onPrev?: () => void; onNext?: () => void; today?: boolean }) {
  const c = useColors();
  const s = t(lang);
  const btn = (icon: 'chevron.left' | 'chevron.right', label: string, on?: () => void) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={!on} onPress={() => { tick(); on?.(); }} hitSlop={8}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.card, opacity: !on ? 0.35 : pressed ? 0.7 : 1, borderWidth: 0.5, borderColor: c.line })}>
      <SymbolView name={icon} size={14} weight="semibold" tintColor={c.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {btn('chevron.left', s.prevDay, onPrev)}
      <View style={{ alignItems: 'center', flex: 1 }} accessible accessibilityLabel={`${longDate(date, lang)}${sub ? `, ${sub}` : ''}`}>
        <T kind="heading" style={{ fontSize: 16 }}>{longDate(date, lang)}</T>
        {sub ? <T kind="caption" color={today ? c.textSecondary : c.brand}>{sub}</T> : null}
      </View>
      {btn('chevron.right', s.nextDay, onNext)}
    </View>
  );
}

