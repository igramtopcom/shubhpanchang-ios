// The app's building blocks, in the approved design (docs/design): warm paper,
// borderless cards on a soft shadow, one saffron accent, sage / sand / brick
// for good, in-between and avoid. Navigation and controls float on Liquid
// Glass (glass.tsx); content stays on solid paper so it reads well.
import type { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View, useColorScheme,
  type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { Colors, MaxContentWidth, Radius, Spacing, TitleFont } from '@/constants/theme';
import { tick } from '@/lib/haptics';
import { useApp } from '@/state/app';

export type Symbol = SymbolViewProps['name'];
export type Tone = 'good' | 'fair' | 'bad' | 'brand' | 'muted';

export function useColors() {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

export function toneColor(c: ReturnType<typeof useColors>, tone: Tone): string {
  return tone === 'good' ? c.good : tone === 'bad' ? c.bad : tone === 'fair' ? c.neutral : tone === 'brand' ? c.brand : c.textSecondary;
}

/**
 * A page. `header`: it sits under a native navigation bar, so the ScrollView
 * is the screen's own and lets iOS inset it under the bar and fold the large
 * title. `bottom` leaves room for a floating action bar. onRefresh adds
 * pull-to-refresh.
 */
export function Screen({ children, scroll = true, header = false, onRefresh, refreshing = false, bottom = 120, gap = Spacing.four, startAt }: {
  children: ReactNode; scroll?: boolean; header?: boolean; onRefresh?: () => void; refreshing?: boolean; bottom?: number; gap?: number;
  /** Open scrolled this far down (the screenshot tour checks the folded title). */
  startAt?: number;
}) {
  const c = useColors();
  const body = <View style={[styles.inner, { gap }, header && { paddingTop: Spacing.two }]}>{children}</View>;
  const refresh = onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.brand} /> : undefined;
  if (header) {
    return (
      <ScrollView
        contentOffset={startAt ? { x: 0, y: startAt } : undefined}
        style={{ flex: 1, backgroundColor: c.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: bottom }}
        refreshControl={refresh}>
        {body}
      </ScrollView>
    );
  }
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.background }}>
      {scroll ? <ScrollView contentContainerStyle={{ paddingBottom: bottom }} refreshControl={refresh}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

type Kind = 'title' | 'display' | 'serif' | 'heading' | 'body' | 'small' | 'label' | 'value' | 'big' | 'eyebrow' | 'caption';

export function T({ children, style, kind = 'body', color, numberOfLines, shrink, maxScale, center }: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  kind?: Kind;
  color?: string;
  numberOfLines?: number;
  /** Shrink the type (to 60%) rather than cut the word, for one-line labels in tight cells. */
  shrink?: boolean;
  /** Largest Dynamic Type scale, for text in fixed-size cells (calendar days). */
  maxScale?: number;
  center?: boolean;
}) {
  const c = useColors();
  const lang = useApp().prefs.lang;
  const gu = lang === 'gu';
  const serif = TitleFont[lang];
  const base: TextStyle = {
    // Screen titles and the day's tithi: the serif, as on a printed panchang.
    display: { fontFamily: serif, fontSize: gu ? 30 : 31, color: c.text, letterSpacing: gu ? 0 : -0.4, lineHeight: gu ? 42 : 37 },
    serif: { fontFamily: serif, fontSize: gu ? 28 : 28, color: c.text, lineHeight: gu ? 40 : 34 },
    title: { fontSize: 22, fontWeight: '600', color: c.text, letterSpacing: -0.2 },
    heading: { fontSize: 17, fontWeight: '600', color: c.text },
    body: { fontSize: 16, color: c.text, lineHeight: 23 },
    small: { fontSize: 13.5, color: c.textSecondary, lineHeight: 19 },
    caption: { fontSize: 12, color: c.textSecondary, lineHeight: 16 },
    label: { fontSize: 13.5, fontWeight: '500', color: c.textSecondary },
    eyebrow: { fontSize: 13.5, fontWeight: '600', color: c.brand },
    value: { fontSize: 16, fontWeight: '600', color: c.text, fontVariant: ['tabular-nums'] },
    big: { fontSize: 25, fontWeight: '600', color: c.text, letterSpacing: -0.2, fontVariant: ['tabular-nums'] },
  }[kind] as TextStyle;
  // Gujarati glyphs sit smaller on the same size and break apart when spaced:
  // set small text a touch larger and never letter-space it.
  const script: TextStyle | null = gu && kind !== 'display' && kind !== 'serif'
    ? { letterSpacing: 0, ...(kind === 'small' || kind === 'label' || kind === 'caption' || kind === 'eyebrow' ? { fontSize: (base.fontSize ?? 13) + 0.5 } : null) }
    : null;
  return (
    <Text
      numberOfLines={shrink ? 1 : numberOfLines}
      adjustsFontSizeToFit={shrink}
      minimumFontScale={shrink ? 0.6 : undefined}
      maxFontSizeMultiplier={maxScale}
      style={[base, script, color ? { color } : null, center ? { textAlign: 'center' } : null, style]}>
      {children}
    </Text>
  );
}

/** A card: white on paper, no outline, a soft warm shadow. */
export function Card({ children, style, tone, flat }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'good' | 'bad' | 'neutral' | 'brand'; flat?: boolean }) {
  const c = useColors();
  const bg = tone === 'good' ? c.goodBg : tone === 'bad' ? c.badBg : tone === 'neutral' ? c.neutralBg : tone === 'brand' ? c.brandSoft : c.card;
  return <View style={[styles.card, !flat && shadow(c), { backgroundColor: bg }, style]}>{children}</View>;
}

export const shadow = (c: ReturnType<typeof useColors>): ViewStyle => ({
  shadowColor: '#3C230F', shadowOpacity: c.background === '#15100C' ? 0.5 : 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 5 },
});

/** Label on the left, value on the right. */
export function Row({ label, value, note, color }: { label: string; value: string; note?: string; color?: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}${note ? `, ${note}` : ''}: ${value}`}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T kind="small">{label}</T>
        {note ? <T kind="caption">{note}</T> : null}
      </View>
      <T kind="value" color={color}>{value}</T>
    </View>
  );
}

/** A filter chip (capsule). Selected: ink filled, as a segmented choice. */
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress ? () => { tick(); onPress(); } : undefined}
      style={({ pressed }) => [
        styles.chip,
        selected ? { backgroundColor: c.text } : { backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
        pressed && { opacity: 0.75 },
      ]}>
      <Text style={{ color: selected ? c.background : c.textSecondary, fontSize: 14, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}

/**
 * primary: the one main action of a screen (filled saffron). quiet: secondary
 * (white, hairline). plain: a text button. destructive: brick text.
 * compact: sized to its label, for actions inside a card.
 */
export function Button({ label, onPress, kind = 'primary', disabled, a11yLabel, icon, compact, style }: {
  label: string; onPress: () => void; kind?: 'primary' | 'quiet' | 'plain' | 'destructive';
  disabled?: boolean; a11yLabel?: string; icon?: Symbol; compact?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const bg = kind === 'primary' ? c.brand : kind === 'quiet' ? c.card : 'transparent';
  const fg = kind === 'primary' ? c.onBrand : kind === 'destructive' ? c.bad : kind === 'quiet' ? c.text : c.brand;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => { tick(); onPress(); }}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        kind === 'quiet' && { borderWidth: 1, borderColor: c.line },
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
        style,
      ]}>
      {icon ? <SymbolView name={icon} size={compact ? 15 : 17} weight="semibold" tintColor={fg} /> : null}
      {label ? <Text style={{ color: fg, fontSize: compact ? 15 : 16, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>{label}</Text> : null}
    </Pressable>
  );
}

/** Two or three views of one list: a capsule segmented control. */
export function Segmented({ values, index, onChange }: { values: string[]; index: number; onChange: (i: number) => void }) {
  const c = useColors();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: c.backgroundElement, gap: 3 }}>
      {values.map((v, i) => (
        <Pressable
          key={v}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === index }}
          onPress={() => { if (i !== index) { tick(); onChange(i); } }}
          style={[
            { flex: 1, minHeight: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
            i === index && { backgroundColor: c.card, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
          ]}>
          <Text numberOfLines={1} style={{ color: i === index ? c.text : c.textSecondary, fontSize: 14.5, fontWeight: '600' }}>{v}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** A small label: a kind of date, a sampradaya. */
export function Tag({ label, tone = 'good' }: { label: string; tone?: 'good' | 'brand' }) {
  const c = useColors();
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: tone === 'good' ? c.goodBg : c.brandSoft, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 7 }}>
      <Text style={{ color: tone === 'good' ? c.good : c.brand, fontSize: 11.5, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

/** A dot and a word, the kind of a day in a mixed list (festival, vrat, family). */
export function Kind({ label, tone }: { label: string; tone: 'brand' | 'good' | 'fair' }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: tone === 'brand' ? c.brand : tone === 'good' ? c.good : c.neutral }} />
      <T kind="caption">{label}</T>
    </View>
  );
}

/** A fact pill under the hero: "નક્ષત્ર ચિત્રા". */
export function Fact({ label, value, tone }: { label?: string; value: string; tone?: 'good' }) {
  const c = useColors();
  return (
    <View style={{ borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11, backgroundColor: tone === 'good' ? c.goodBg : c.backgroundElement }}>
      <Text style={{ fontSize: 13.5, color: tone === 'good' ? c.good : c.textSecondary, fontWeight: tone === 'good' ? '600' : '400', fontVariant: ['tabular-nums'] }}>
        {label ? `${label} ` : ''}<Text style={{ color: tone === 'good' ? c.good : c.text, fontWeight: '600' }}>{value}</Text>
      </Text>
    </View>
  );
}

export function Notice({ text, onRetry, retryLabel, tone = 'neutral', icon = 'info.circle', action, onAction }: {
  text: string; onRetry?: () => void; retryLabel?: string; tone?: 'neutral' | 'good' | 'brand'; icon?: Symbol; action?: string; onAction?: () => void;
}) {
  const c = useColors();
  const fg = tone === 'good' ? c.good : tone === 'brand' ? c.brand : c.neutral;
  return (
    <Card flat tone={tone === 'good' ? 'good' : tone === 'brand' ? 'brand' : 'neutral'} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingVertical: 12 }}>
      <SymbolView name={icon} size={16} tintColor={fg} />
      <T kind="small" color={c.text} style={{ flex: 1 }}>{text}</T>
      {onRetry && retryLabel ? <Button kind="plain" compact label={retryLabel} onPress={onRetry} /> : null}
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <T kind="small" color={fg} style={{ fontWeight: '600' }}>{action}</T>
          <SymbolView name="chevron.right" size={11} weight="semibold" tintColor={fg} />
        </Pressable>
      ) : null}
    </Card>
  );
}

export function Loading() {
  const c = useColors();
  return <View style={{ paddingVertical: Spacing.five }}><ActivityIndicator color={c.brand} /></View>;
}

/** A section's heading in the serif, as on Today. */
function SerifHead({ children }: { children: ReactNode }) {
  const lang = useApp().prefs.lang;
  return <T style={{ fontFamily: TitleFont[lang], fontSize: 18, lineHeight: lang === 'gu' ? 27 : 23, flexShrink: 1 }}>{children}</T>;
}

/** A section: a serif heading and an optional link on its right. */
export function Section({ title, children, action, onAction, gap = 8 }: { title: string; children: ReactNode; action?: ReactNode | string; onAction?: () => void; gap?: number }) {
  const c = useColors();
  return (
    <View style={{ gap }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 2 }}>
        <SerifHead>{title}</SerifHead>
        {typeof action === 'string'
          ? <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10}><T kind="small" color={c.brand} style={{ fontWeight: '600' }}>{action}</T></Pressable>
          : action}
      </View>
      {children}
    </View>
  );
}

/** A month heading in a long list: "નવેમ્બર 2026 · આસો · કારતક". */
export function MonthHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 2, marginTop: 6 }}>
      <SerifHead>{title}</SerifHead>
      {sub ? <T kind="caption">{sub}</T> : null}
    </View>
  );
}

/** The date tile at the start of a list row: day number over weekday. */
export function DateTile({ day, sub, highlight, children }: { day?: string; sub?: string; highlight?: boolean; children?: ReactNode }) {
  const c = useColors();
  return (
    <View style={[styles.tile, { backgroundColor: highlight ? c.brand : c.backgroundElement }]}>
      {children ?? (
        <>
          <Text style={{ fontSize: 18, fontWeight: '600', color: highlight ? c.onBrand : c.text, fontVariant: ['tabular-nums'] }} maxFontSizeMultiplier={1.4}>{day}</Text>
          {sub ? <Text style={{ fontSize: 12, color: highlight ? c.onBrand : c.textSecondary, marginTop: 1 }} numberOfLines={1} maxFontSizeMultiplier={1.3}>{sub}</Text> : null}
        </>
      )}
    </View>
  );
}

/** A card of rows separated by hairlines, the iOS inset list. */
export function List({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Card style={[{ padding: 0, gap: 0, overflow: 'hidden' }, style]}>{children}</Card>;
}

/**
 * A list row: a leading tile, a title over a line of detail, and a trailing
 * chevron or element. `first` drops the hairline above it.
 */
export function ListRow({ lead, title, detail, trailing, onPress, first, a11y, badge }: {
  lead?: ReactNode; title: string; detail?: string; trailing?: ReactNode | 'chevron'; onPress?: () => void; first?: boolean; a11y?: string; badge?: ReactNode;
}) {
  const c = useColors();
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14 }}>
      {lead}
      <View style={[{ flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <T kind="heading" style={{ fontSize: 16 }}>{title}</T>
          {badge}
        </View>
        {detail ? <T kind="small" numberOfLines={2} style={{ fontVariant: ['tabular-nums'] }}>{detail}</T> : null}
      </View>
      {trailing === 'chevron' ? <SymbolView name="chevron.right" size={13} weight="semibold" tintColor={c.textMuted} /> : trailing}
    </View>
  );
  const sep = first ? null : <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginLeft: lead ? 70 : 14 }} />;
  return (
    <View>
      {sep}
      {onPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel={a11y} onPress={() => { tick(); onPress(); }} style={({ pressed }) => (pressed ? { backgroundColor: c.backgroundElement } : null)}>
          {body}
        </Pressable>
      ) : body}
    </View>
  );
}

/** A settings cell: coloured icon tile, label (and a line under it), value or switch. */
export function Cell({ icon, tint, label, sub, value, onPress, toggle, onToggle, first, disabled, radio }: {
  icon?: Symbol; tint?: string; label: string; sub?: string; value?: string; onPress?: () => void;
  toggle?: boolean; onToggle?: (v: boolean) => void; first?: boolean; disabled?: boolean; radio?: boolean;
}) {
  const c = useColors();
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 16, minHeight: 52 }}>
      {icon ? (
        <View style={{ width: 29, height: 29, borderRadius: 8, backgroundColor: tint ?? c.brand, alignItems: 'center', justifyContent: 'center' }}>
          <SymbolView name={icon} size={15} weight="semibold" tintColor="#FFFFFF" />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <T style={{ fontSize: 16 }}>{label}</T>
        {sub ? <T kind="caption" style={{ fontSize: 13 }}>{sub}</T> : null}
      </View>
      {value ? <T kind="small">{value}</T> : null}
      {toggle !== undefined ? (
        <Switch value={toggle} disabled={disabled} onValueChange={v => { tick(); onToggle?.(v); }} trackColor={{ true: c.good }} accessibilityLabel={label} />
      ) : null}
      {radio !== undefined ? (
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: radio ? 6 : 2, borderColor: radio ? c.brand : c.line }} />
      ) : null}
      {onPress && toggle === undefined && radio === undefined ? <SymbolView name="chevron.right" size={13} weight="semibold" tintColor={c.textMuted} /> : null}
    </View>
  );
  return (
    <View>
      {first ? null : <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginLeft: icon ? 57 : 16 }} />}
      {onPress ? (
        <Pressable accessibilityRole={radio !== undefined ? 'radio' : 'button'} accessibilityState={radio !== undefined ? { checked: radio } : undefined}
          onPress={() => { tick(); onPress(); }} style={({ pressed }) => (pressed ? { backgroundColor: c.backgroundElement } : null)}>
          {inner}
        </Pressable>
      ) : inner}
    </View>
  );
}

/** A grouped list with its caption above and an optional note below, iOS style. */
export function Group({ title, note, children }: { title?: string; note?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 7 }}>
      {title ? <T kind="label" style={{ marginLeft: 6 }}>{title}</T> : null}
      <List>{children}</List>
      {note ? <T kind="caption" style={{ marginHorizontal: 6, fontSize: 12.5, lineHeight: 18 }}>{note}</T> : null}
    </View>
  );
}

/** A first-time screen: what this is for, and the one thing to do. */
export function Empty({ icon, title, body, action, onAction, note }: { icon: Symbol; title: string; body: string; action: string; onAction: () => void; note?: string }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', paddingTop: 36, gap: 12, paddingHorizontal: 8 }}>
      <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <SymbolView name={icon} size={38} tintColor={c.brand} />
      </View>
      <T kind="serif" center style={{ fontSize: 22, lineHeight: 30 }}>{title}</T>
      <T kind="small" center style={{ fontSize: 15, lineHeight: 22 }}>{body}</T>
      <Button icon="plus" label={action} onPress={onAction} style={{ alignSelf: 'stretch', marginTop: 8 }} />
      {note ? <T kind="caption" center>{note}</T> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three + 2,
    paddingTop: Spacing.three,
  },
  card: { borderRadius: Radius.card, padding: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.one },
  chip: { borderRadius: Radius.chip, minHeight: 34, paddingVertical: 6, paddingHorizontal: 13, justifyContent: 'center' },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: Radius.button, minHeight: 50, paddingVertical: 12, paddingHorizontal: Spacing.three,
  },
  buttonCompact: { alignSelf: 'flex-start', minHeight: 44, paddingVertical: 10, paddingHorizontal: 14 },
  tile: { width: 46, height: 48, borderRadius: Radius.tile, alignItems: 'center', justifyContent: 'center' },
});
