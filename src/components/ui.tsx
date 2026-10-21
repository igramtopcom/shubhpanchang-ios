// The app's few building blocks, in the website's warm palette.
// Cards carry a hairline warm border, values are navy, good is green, Rahu red.
import type { ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme,
  type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

export function useColors() {
  return Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const c = useColors();
  const body = <View style={styles.inner}>{children}</View>;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.background }}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

export function T({ children, style, kind = 'body', color, numberOfLines, shrink }: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  kind?: 'title' | 'heading' | 'body' | 'small' | 'label' | 'value' | 'big';
  color?: string;
  numberOfLines?: number;
  /** Shrink the type (to 60%) rather than cut the word, for one-line labels in tight cells. */
  shrink?: boolean;
}) {
  const c = useColors();
  const base: TextStyle = {
    title: { fontSize: 28, fontWeight: '700', color: c.text, letterSpacing: -0.3 },
    heading: { fontSize: 18, fontWeight: '600', color: c.text },
    body: { fontSize: 16, color: c.text, lineHeight: 23 },
    small: { fontSize: 13.5, color: c.textSecondary, lineHeight: 19 },
    label: { fontSize: 12, fontWeight: '600', color: c.textMuted, letterSpacing: 0.6, textTransform: 'uppercase' },
    value: { fontSize: 17, fontWeight: '600', color: c.value, fontVariant: ['tabular-nums'] },
    big: { fontSize: 24, fontWeight: '700', color: c.value, fontVariant: ['tabular-nums'] },
  }[kind] as TextStyle;
  return (
    <Text
      numberOfLines={shrink ? 1 : numberOfLines}
      adjustsFontSizeToFit={shrink}
      minimumFontScale={shrink ? 0.6 : undefined}
      style={[base, color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style, tone }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'good' | 'bad' | 'neutral' }) {
  const c = useColors();
  const bg = tone === 'good' ? c.goodBg : tone === 'bad' ? c.badBg : tone === 'neutral' ? c.neutralBg : c.card;
  const border = tone === 'good' ? c.good : tone === 'bad' ? c.bad : tone === 'neutral' ? c.neutral : c.cardBorder;
  return <View style={[styles.card, { backgroundColor: bg, borderColor: border }, style]}>{children}</View>;
}

/** Label on the left, value on the right. */
export function Row({ label, value, note, color }: { label: string; value: string; note?: string; color?: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T kind="small">{label}</T>
        {note ? <T kind="small" style={{ fontSize: 12 }}>{note}</T> : null}
      </View>
      <T kind="value" color={color}>{value}</T>
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? c.brand : c.backgroundElement, borderColor: selected ? c.brand : c.cardBorder },
        pressed && { opacity: 0.75 },
      ]}>
      <Text style={{ color: selected ? c.onBrand : c.text, fontSize: 15, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}

export function Button({ label, onPress, kind = 'primary', disabled }: { label: string; onPress: () => void; kind?: 'primary' | 'quiet'; disabled?: boolean }) {
  const c = useColors();
  const primary = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: primary ? c.brand : 'transparent', borderColor: c.brand, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
      ]}>
      <Text style={{ color: primary ? c.onBrand : c.brand, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
    </Pressable>
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
  chip: { borderWidth: 1, borderRadius: Radius.chip, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three },
  button: { borderWidth: 1.5, borderRadius: Radius.button, paddingVertical: 12, paddingHorizontal: Spacing.three },
});
