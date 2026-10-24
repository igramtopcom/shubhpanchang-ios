// Drawn pieces of the sky and of Gujarat: the moon in its phase (on Today, in
// a ring of abhla stitches, as in Kutch mirror work), the sun's arc across the
// day, the kairi mark, the bandhani ground of the coloured card, and the diya.
// Each is one colour and small; the culture is in the detail, not in garlands.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';

import { useColors } from './ui';

/**
 * The moon for tithi index 0-29 (0 = Shukla Pratipada, 14 = Purnima, 29 =
 * Amavasya): lit on the right while waxing, on the left while waning, the
 * terminator an ellipse whose width follows the phase.
 */
export function Moon({ tithi, size = 58 }: { tithi: number; size?: number }) {
  const c = useColors();
  const r = 28;
  const k = ((tithi + 0.5) / 30) % 1; // 0 new, 0.5 full
  const waxing = k < 0.5;
  const rx = Math.abs(Math.cos(2 * Math.PI * k)) * r;
  const gibbous = (k > 0.25 && k < 0.75);
  // Right half while waxing, left half while waning; then back along the terminator.
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (gibbous ? 1 : 0) : (gibbous ? 0 : 1);
  const lit = `M32 4 A${r} ${r} 0 0 ${outer} 32 60 A${rx.toFixed(2)} ${r} 0 0 ${inner} 32 4 Z`;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={r} fill={c.moonDark} />
      {tithi === 29 ? null : tithi === 14 ? <Circle cx={32} cy={32} r={r} fill={c.moonLit} /> : <Path d={lit} fill={c.moonLit} />}
      <Circle cx={32} cy={32} r={r} fill="none" stroke={c.moonRim} strokeWidth={1} />
    </Svg>
  );
}

/** The sun's path from sunrise to sunset, travelled so far up to `progress` (0-1). */
export function SunArc({ progress, height = 92 }: { progress: number; height?: number }) {
  const c = useColors();
  const [w, setW] = useState(320);
  const p0 = { x: 14, y: height - 12 }, p1 = { x: w / 2, y: -12 }, p2 = { x: w - 14, y: height - 12 };
  const t = Math.max(0, Math.min(1, progress));
  const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, u: number) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
  const q0 = lerp(p0, p1, t), q1 = lerp(p1, p2, t), sun = lerp(q0, q1, t);
  const up = progress > 0 && progress < 1;
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)} style={{ height }} accessibilityElementsHidden>
      <Svg width={w} height={height}>
        <Path d={`M${p0.x} ${p0.y} Q${p1.x} ${p1.y} ${p2.x} ${p2.y}`} fill="none" stroke={c.line} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 7" />
        {up ? <Path d={`M${p0.x} ${p0.y} Q${q0.x} ${q0.y} ${sun.x} ${sun.y}`} fill="none" stroke={c.brand} strokeOpacity={0.8} strokeWidth={2.5} strokeLinecap="round" /> : null}
        {up ? <Circle cx={sun.x} cy={sun.y} r={9} fill={c.brand} fillOpacity={0.18} /> : null}
        {up ? <Circle cx={sun.x} cy={sun.y} r={5.5} fill={c.brand} /> : null}
        <Line x1={0} y1={p0.y} x2={w} y2={p0.y} stroke={c.line} strokeWidth={1} />
      </Svg>
    </View>
  );
}

/** The moon inside a ring of abhla stitches: a dotted ring and a thin one, in saffron. */
export function MoonRing({ tithi, size = 58 }: { tithi: number; size?: number }) {
  const c = useColors();
  const moon = Math.round(size * 0.74);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden>
      <Svg width={size} height={size} viewBox="0 0 72 72" style={StyleSheet.absoluteFill}>
        <Circle cx={36} cy={36} r={33.5} fill="none" stroke={c.brand} strokeOpacity={0.55} strokeWidth={1.6} strokeLinecap="round" strokeDasharray="0.1 5.25" />
        <Circle cx={36} cy={36} r={30} fill="none" stroke={c.brand} strokeOpacity={0.28} strokeWidth={1} />
      </Svg>
      <Moon tithi={tithi} size={moon} />
    </View>
  );
}

/** Kairi, the young-mango paisley of Gujarati cloth: a small mark before the day's date. */
export function Kairi({ size = 14 }: { size?: number }) {
  const c = useColors();
  return (
    <Svg width={size * 13 / 16} height={size} viewBox="0 0 13 16">
      <Path d="M6.5 15C3.3 15 1.2 12.6 1.2 9.8 1.2 5.6 4.6 2.4 8.6 1.4c1.8-.4 3.3.2 3.3 1.6 0 1.2-1.3 1.6-2 1M8.6 1.4c2.6 2 3.8 5.2 3.2 8.4-.5 3-2.6 5.2-5.3 5.2"
        fill="none" stroke={c.brand} strokeWidth={1.3} strokeLinecap="round" />
      <Circle cx={6.4} cy={10} r={1.3} fill={c.brand} />
    </Svg>
  );
}

/**
 * The ground of a coloured card: a quiet two-stop gradient with bandhani (tie-dye)
 * dots in fours over it, faint enough to see only up close. Fills its parent.
 */
export function Bandhani({ from, to, id, dots = 0.085 }: { from: string; to: string; id: string; dots?: number }) {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={`bg-${id}`} x1="0" y1="0" x2="0.18" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
        <Pattern id={`bd-${id}`} patternUnits="userSpaceOnUse" width={26} height={26}>
          <Circle cx={13} cy={9} r={1.1} fill="#FFFFFF" fillOpacity={dots} />
          <Circle cx={17} cy={13} r={1.1} fill="#FFFFFF" fillOpacity={dots} />
          <Circle cx={13} cy={17} r={1.1} fill="#FFFFFF" fillOpacity={dots} />
          <Circle cx={9} cy={13} r={1.1} fill="#FFFFFF" fillOpacity={dots} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#bg-${id})`} />
      <Rect width="100%" height="100%" fill={`url(#bd-${id})`} />
    </Svg>
  );
}

/** A diya in fine gold line, its flame lit, for a festival day. */
export function Diya({ size = 76 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="diya-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FFD37A" stopOpacity={0.4} />
          <Stop offset="1" stopColor="#FFD37A" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Circle cx={40} cy={30} r={24} fill="url(#diya-glow)" />
      <Path d="M40 14 C45 22 46 29 40 37 C34 29 35 22 40 14Z" fill="#F7CF7A" />
      <Path d="M40 22 C42.5 26.5 42.5 31 40 35 C37.5 31 37.5 26.5 40 22Z" fill="#FFF3D6" />
      <Path d="M14 44 H66 C64.5 56 54 62 40 62 C26 62 15.5 56 14 44Z" fill="none" stroke="#EFC77A" strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M22 50 H58" stroke="#EFC77A" strokeOpacity={0.5} strokeWidth={1} strokeDasharray="0.1 4" strokeLinecap="round" />
    </Svg>
  );
}
