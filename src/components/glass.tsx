// Liquid Glass for the navigation layer only (docs/design/08-liquid-glass):
// the action bar of a detail screen, the month picker, the bar buttons.
// Content stays on solid paper. Where the system has no glass (before iOS 26,
// web, Reduce Transparency) the same shapes are drawn solid.
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';

import { tick } from '@/lib/haptics';

import { shadow, T, useColors, type Symbol } from './ui';

function useReduceTransparency() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceTransparencyEnabled?.().then(setOn).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceTransparencyChanged', setOn);
    return () => sub?.remove();
  }, []);
  return on;
}

/** A glass surface, or a solid card-coloured one where glass is not available. */
export function Glass({ children, style, radius = 32 }: { children: ReactNode; style?: StyleProp<ViewStyle>; radius?: number }) {
  const c = useColors();
  const reduce = useReduceTransparency();
  if (Platform.OS === 'ios' && isLiquidGlassAvailable() && !reduce) {
    return <GlassView glassEffectStyle="regular" style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>{children}</GlassView>;
  }
  return (
    <View style={[{ borderRadius: radius, backgroundColor: c.card, borderWidth: 0.5, borderColor: c.line }, shadow(c), style]}>
      {children}
    </View>
  );
}

export interface BarAction {
  icon: Symbol;
  label: string;
  onPress: () => void;
  /** Wide, filled and labelled: the one main action. The rest are round icons. */
  primary?: boolean;
  /** An icon in its "on" state (a reminder set). */
  on?: boolean;
}

/** The floating action bar of a detail screen: one wide action, then icons, on one glass capsule. */
export function ActionBar({ actions }: { actions: BarAction[] }) {
  const c = useColors();
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: 26 }}>
      <Glass style={{ flexDirection: 'row', alignItems: 'center', padding: 6, gap: 6 }}>
        {actions.map(a => (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            accessibilityState={a.on !== undefined ? { selected: a.on } : undefined}
            onPress={() => { tick(); a.onPress(); }}
            style={({ pressed }) => [
              { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, opacity: pressed ? 0.75 : 1 },
              a.primary ? { flex: 1, backgroundColor: c.brand, paddingHorizontal: 14 } : { width: 52 },
            ]}>
            <SymbolView name={a.icon} size={18} weight="semibold" tintColor={a.primary ? c.onBrand : a.on ? c.brand : c.text} />
            {a.primary ? <T style={{ color: c.onBrand, fontWeight: '600', fontSize: 15.5 }} numberOfLines={1}>{a.label}</T> : null}
          </Pressable>
        ))}
      </Glass>
    </View>
  );
}

export interface HeaderButton { icon: Symbol; label: string; onPress: () => void; text?: string }

/**
 * Bar buttons on the right of a native navigation bar. On iOS they are real
 * bar items, so iOS 26 draws them as one glass capsule; elsewhere plain icons.
 */
export function headerButtons(buttons: HeaderButton[], tint: string) {
  return {
    unstable_headerRightItems: () => buttons.map(b => (b.text
      ? { type: 'button' as const, label: b.text, onPress: b.onPress, tintColor: tint, accessibilityLabel: b.label }
      : { type: 'button' as const, label: b.label, icon: { type: 'sfSymbol' as const, name: b.icon as never }, onPress: b.onPress, tintColor: tint, accessibilityLabel: b.label })),
    headerRight: () => (
      <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
        {buttons.map(b => (
          <Pressable key={b.label} accessibilityRole="button" accessibilityLabel={b.label} hitSlop={10} onPress={b.onPress}>
            {b.text ? <T style={{ color: tint, fontWeight: '600' }}>{b.text}</T> : <SymbolView name={b.icon} size={21} tintColor={tint} />}
          </Pressable>
        ))}
      </View>
    ),
  };
}
