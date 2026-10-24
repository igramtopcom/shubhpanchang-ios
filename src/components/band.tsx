// The pieces of the Today style (docs/design/11-today-v5) that every screen
// shares: one coloured card on a quiet bandhani ground as the screen's single
// point of focus, its white type, a serif heading for a section, and the
// "all of it" row at the foot of a card.
import type { ReactNode } from 'react';
import { Pressable, View, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Bands, TitleFont } from '@/constants/theme';
import { tick } from '@/lib/haptics';
import { longDate, t } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { useApp } from '@/state/app';

import { Bandhani, Kairi } from './sky';
import { T, shadow, useColors } from './ui';

export const WHITE = '#FFFFFF';
export const WHITE2 = 'rgba(255,255,255,0.93)';
/** On the plum festival card. */
export const GOLD = '#EFC77A', CREAM = '#FFF4DE', SOFT = '#EBD6B4';

export type Band = readonly [string, string];
export type BandKind = keyof typeof Bands.light;

export function useBand(kind: BandKind): Band {
  return Bands[useColorScheme() === 'dark' ? 'dark' : 'light'][kind];
}

/** The coloured card: the band on bandhani, and an optional white part below it. */
export function BandCard({ band, id, children, below, onPress, a11y }: {
  band: Band; id: string; children: ReactNode; below?: ReactNode; onPress?: () => void; a11y?: string;
}) {
  const c = useColors();
  const top = (
    <View style={{ paddingTop: 15, paddingHorizontal: 18, paddingBottom: 17 }}>
      <Bandhani from={band[0]} to={band[1]} id={id} />
      {children}
    </View>
  );
  return (
    <View style={[{ borderRadius: 24, backgroundColor: c.card }, shadow(c)]}>
      <View style={{ borderRadius: 24, overflow: 'hidden' }}>
        {onPress ? (
          <Pressable accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>{top}</Pressable>
        ) : top}
        {below}
      </View>
    </View>
  );
}

/** The small line at the top of a band: what this is, when. */
export function BandEyebrow({ children, color = WHITE2 }: { children: ReactNode; color?: string }) {
  return <T style={{ color, fontSize: 13.5, fontWeight: '500' }}>{children}</T>;
}

/** The band's title, in the serif. */
export function BandTitle({ children, size = 34, color = WHITE, right = 0 }: { children: ReactNode; size?: number; color?: string; right?: number }) {
  const lang = useApp().prefs.lang;
  return <T style={{ fontFamily: TitleFont[lang], fontSize: size, lineHeight: Math.round(size * (lang === 'gu' ? 1.4 : 1.22)), color, paddingRight: right }}>{children}</T>;
}

/** An outlined word on the band: "સારું", "આજે", "12 દિવસમાં". */
export function BandPill({ text, color = WHITE }: { text: string; color?: string }) {
  return (
    <View style={{ alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 10, paddingVertical: 2 }}>
      <T style={{ color, fontSize: 13.5, fontWeight: '600' }}>{text}</T>
    </View>
  );
}

/** A hairline across the band, and the big figure under its label (a muhurat, a Parana). */
export function BandFigure({ label, value, note, labelColor = WHITE2, color = WHITE, noteColor = WHITE2, line = 'rgba(255,255,255,0.28)' }: {
  label: string; value: string; note?: string; labelColor?: string; color?: string; noteColor?: string; line?: string;
}) {
  return (
    <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: line }}>
      <T style={{ color: labelColor, fontSize: 13, fontWeight: '500' }}>{label}</T>
      <T style={{ color, fontSize: 23, lineHeight: 32, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{value}</T>
      {note ? <T style={{ color: noteColor, fontSize: 13 }}>{note}</T> : null}
    </View>
  );
}

/** "All of it ›" at the foot of a card. */
export function MoreRow({ label, onPress }: { label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={4}
      style={({ pressed }) => ({ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 11, paddingBottom: 13, borderTopWidth: 0.5, borderTopColor: c.line, opacity: pressed ? 0.6 : 1 })}>
      <T style={{ color: c.brand, fontWeight: '600', fontSize: 14.5 }}>{label}</T>
      <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={c.brand} />
    </Pressable>
  );
}

/** A section's heading in the serif, with an optional link on the right. */
export function Head({ title, action, onAction, sub }: { title: string; action?: string; onAction?: () => void; sub?: string }) {
  const c = useColors();
  const lang = useApp().prefs.lang;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 2, gap: 10 }}>
      <T style={{ fontFamily: TitleFont[lang], fontSize: 18, lineHeight: lang === 'gu' ? 27 : 23, flexShrink: 1 }}>{title}</T>
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10}>
          <T kind="small" color={c.brand} style={{ fontWeight: '600' }}>{action}</T>
        </Pressable>
      ) : sub ? <T kind="caption">{sub}</T> : null}
    </View>
  );
}

/** A card's own title, in the serif (smaller than a section's). */
export function CardTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  const lang = useApp().prefs.lang;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <T style={{ fontFamily: TitleFont[lang], fontSize: 17, lineHeight: lang === 'gu' ? 26 : 22, flexShrink: 1 }}>{children}</T>
      {sub ? <T kind="caption">{sub}</T> : null}
    </View>
  );
}

/** The day's date with the kairi mark, how far off it is, and ‹ › to step it. */
export function DateLine({ date, lang, rel, onPrev, onNext }: { date: string; lang: Lang; rel?: string; onPrev?: () => void; onNext?: () => void }) {
  const s = t(lang);
  const c = useColors();
  const step = (icon: 'chevron.left' | 'chevron.right', label: string, on?: () => void) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={!on} onPress={() => { tick(); on?.(); }} hitSlop={8}
      style={({ pressed }) => ({ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: c.backgroundElement, opacity: !on ? 0.35 : pressed ? 0.7 : 1 })}>
      <SymbolView name={icon} size={12} weight="semibold" tintColor={c.textSecondary} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 }} accessible accessibilityLabel={`${longDate(date, lang)}${rel ? `, ${rel}` : ''}`}>
        <Kairi />
        <T kind="small" style={{ fontSize: 14.5, fontWeight: '500' }} numberOfLines={1}>
          {longDate(date, lang)}{rel ? <T kind="small" color={c.brand} style={{ fontSize: 14.5, fontWeight: '600' }}>{`  ·  ${rel}`}</T> : null}
        </T>
      </View>
      {onPrev || onNext ? (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {step('chevron.left', s.prevDay, onPrev)}
          {step('chevron.right', s.nextDay, onNext)}
        </View>
      ) : null}
    </View>
  );
}
