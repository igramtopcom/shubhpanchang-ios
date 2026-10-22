// The app's few building blocks, in the website's warm palette.
// Cards carry a hairline warm border, values are navy, good is green, Rahu red.
import type { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useColorScheme,
  type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { tick } from '@/lib/haptics';
import { useApp } from '@/state/app';

export type Symbol = SymbolViewProps['name'];

export function useColors() {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

/**
 * A page. `header`: it sits under a native navigation bar (the tabs, see
 * tab-stack.tsx), so the ScrollView is the screen's own and lets iOS inset it
 * under the bar and fold the large title. onRefresh adds pull-to-refresh;
 * refreshing is true while that reload runs.
 */
export function Screen({ children, scroll = true, header = false, onRefresh, refreshing = false }: {
  children: ReactNode; scroll?: boolean; header?: boolean; onRefresh?: () => void; refreshing?: boolean;
}) {
  const c = useColors();
  const body = <View style={[styles.inner, header && { paddingTop: Spacing.two }]}>{children}</View>;
  const refresh = onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.brand} /> : undefined;
  if (header) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scroll}
        refreshControl={refresh}>
        {body}
      </ScrollView>
    );
  }
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.background }}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll} refreshControl={refresh}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

export function T({ children, style, kind = 'body', color, numberOfLines, shrink, maxScale }: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  kind?: 'title' | 'heading' | 'body' | 'small' | 'label' | 'value' | 'big';
  color?: string;
  numberOfLines?: number;
  /** Shrink the type (to 60%) rather than cut the word, for one-line labels in tight cells. */
  shrink?: boolean;
  /** Largest Dynamic Type scale, for text in fixed-size cells (calendar days). */
  maxScale?: number;
}) {
  const c = useColors();
  const gu = useApp().prefs.lang === 'gu';
  const base: TextStyle = {
    title: { fontSize: 28, fontWeight: '700', color: c.text, letterSpacing: -0.3 },
    heading: { fontSize: 18, fontWeight: '600', color: c.text },
    body: { fontSize: 16, color: c.text, lineHeight: 23 },
    small: { fontSize: 13.5, color: c.textSecondary, lineHeight: 19 },
    label: { fontSize: 12, fontWeight: '600', color: c.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
    value: { fontSize: 17, fontWeight: '600', color: c.value, fontVariant: ['tabular-nums'] },
    big: { fontSize: 24, fontWeight: '700', color: c.value, fontVariant: ['tabular-nums'] },
  }[kind] as TextStyle;
  // Gujarati glyphs sit smaller on the same size and break apart when spaced:
  // set small text a touch larger and never letter-space it.
  const script: TextStyle | null = gu
    ? { letterSpacing: 0, ...(kind === 'small' || kind === 'label' ? { fontSize: (base.fontSize ?? 13) + 1 } : null) }
    : null;
  return (
    <Text
      numberOfLines={shrink ? 1 : numberOfLines}
      adjustsFontSizeToFit={shrink}
      minimumFontScale={shrink ? 0.6 : undefined}
      maxFontSizeMultiplier={maxScale}
      style={[base, script, color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style, tone }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'good' | 'bad' | 'neutral' }) {
  const c = useColors();
  const bg = tone === 'good' ? c.goodBg : tone === 'bad' ? c.badBg : tone === 'neutral' ? c.neutralBg : c.card;
  const border = tone === 'good' ? c.goodBorder : tone === 'bad' ? c.badBorder : tone === 'neutral' ? c.neutralBorder : c.cardBorder;
  return <View style={[styles.card, { backgroundColor: bg, borderColor: border }, style]}>{children}</View>;
}

/** Label on the left, value on the right. */
export function Row({ label, value, note, color }: { label: string; value: string; note?: string; color?: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}${note ? `, ${note}` : ''}: ${value}`}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T kind="small">{label}</T>
        {note ? <T kind="small" style={{ fontSize: 12 }}>{note}</T> : null}
      </View>
      <T kind="value" color={color}>{value}</T>
    </View>
  );
}

/** A choice. Selected: tinted with a check, so a row of chosen chips stays calm. */
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress ? () => { tick(); onPress(); } : undefined}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: c.brandSoft, borderColor: c.brand }
          : { backgroundColor: c.backgroundElement, borderColor: c.cardBorder },
        pressed && { opacity: 0.75 },
      ]}>
      {selected ? <SymbolView name="checkmark" size={13} weight="bold" tintColor={c.brand} /> : null}
      <Text style={{ color: selected ? c.brand : c.text, fontSize: 15, fontWeight: selected ? '600' : '500' }}>{label}</Text>
    </Pressable>
  );
}

/**
 * primary: the one main action of a screen (filled). quiet: secondary actions
 * (tinted, no border). plain: a text button. destructive: red text.
 * compact: sized to its label, for actions inside a card.
 */
export function Button({ label, onPress, kind = 'primary', disabled, a11yLabel, icon, compact }: {
  label: string; onPress: () => void; kind?: 'primary' | 'quiet' | 'plain' | 'destructive';
  disabled?: boolean; a11yLabel?: string; icon?: Symbol; compact?: boolean;
}) {
  const c = useColors();
  const bg = kind === 'primary' ? c.brand : kind === 'quiet' ? c.brandSoft : 'transparent';
  const fg = kind === 'primary' ? c.onBrand : kind === 'destructive' ? c.bad : c.brand;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}>
      {icon ? <SymbolView name={icon} size={compact ? 16 : 18} weight="semibold" tintColor={fg} /> : null}
      {label ? <Text style={{ color: fg, fontSize: compact ? 15 : 16, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>{label}</Text> : null}
    </Pressable>
  );
}

/** Two or three views of one list, as iOS draws a segmented control. */
export function Segmented({ values, index, onChange }: { values: string[]; index: number; onChange: (i: number) => void }) {
  const c = useColors();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', padding: 3, borderRadius: 12, backgroundColor: c.backgroundElement, gap: 3 }}>
      {values.map((v, i) => (
        <Pressable
          key={v}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === index }}
          onPress={() => { if (i !== index) { tick(); onChange(i); } }}
          style={{
            flex: 1, minHeight: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
            backgroundColor: i === index ? c.card : 'transparent',
            shadowColor: '#000', shadowOpacity: i === index ? 0.08 : 0, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
          }}>
          <Text style={{ color: i === index ? c.brand : c.textSecondary, fontSize: 15, fontWeight: i === index ? '700' : '500' }}>{v}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** A small label on a card: an observance of the day, a kind of date. */
export function Tag({ label, tone = 'good' }: { label: string; tone?: 'good' | 'brand' }) {
  const c = useColors();
  const fg = tone === 'good' ? c.good : c.brand;
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: tone === 'good' ? c.goodBg : c.brandSoft, borderRadius: Radius.chip, paddingVertical: 4, paddingHorizontal: 10 }}>
      <T kind="small" color={fg} style={{ fontWeight: '600' }}>{label}</T>
    </View>
  );
}

export function Notice({ text, onRetry, retryLabel }: { text: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <Card tone="neutral" style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
      <T kind="small" style={{ flex: 1 }}>{text}</T>
      {onRetry && retryLabel ? <Button kind="quiet" label={retryLabel} onPress={onRetry} /> : null}
    </Card>
  );
}

export function Loading() {
  const c = useColors();
  return <View style={{ paddingVertical: Spacing.five }}><ActivityIndicator color={c.brand} /></View>;
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T kind="label">{title}</T>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120 },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.four,
  },
  card: { borderWidth: 1, borderRadius: Radius.card, padding: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.one },
  // 44 pt: the smallest target the Human Interface Guidelines allow.
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: Radius.chip, minHeight: 44, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three,
  },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: Radius.button, minHeight: 48, paddingVertical: 12, paddingHorizontal: Spacing.three,
  },
  buttonCompact: { alignSelf: 'flex-start', minHeight: 44, paddingVertical: 10, paddingHorizontal: 14 },
});
