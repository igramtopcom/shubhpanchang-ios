// Drawn pieces of the sky: the moon in its phase, the sun's arc across the
// day, and the day's choghadiya as one ribbon with Rahu Kaal hatched over it.
import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, Path, Pattern, Rect } from 'react-native-svg';

import { chogTier, type Slot, type Span } from '@/lib/shubh';

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

/**
 * One day's choghadiya from sunrise to sunset as a ribbon: sage good, sand
 * in-between, brick to avoid, Rahu Kaal hatched over whatever it covers, and a
 * mark at now when now is inside the day.
 */
export function Ribbon({ slots, rahu, now, height = 14 }: { slots: Slot[]; rahu: Span | null; now: number | null; height?: number }) {
  const c = useColors();
  const [w, setW] = useState(300);
  if (!slots.length) return null;
  const start = slots[0].start, end = slots[slots.length - 1].end, span = end - start;
  const x = (m: number) => ((m - start) / span) * w;
  const gap = 3;
  const tone = (name: string) => {
    const tier = chogTier(name);
    return tier === 'best' ? c.good : tier === 'avoid' ? c.bad : c.fair;
  };
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)} style={{ height: height + 12, justifyContent: 'center' }}>
      <Svg width={w} height={height + 12}>
        <Defs>
          <Pattern id="hatch" patternUnits="userSpaceOnUse" width={5.5} height={5.5} patternTransform="rotate(45)">
            <Rect width={2.5} height={5.5} fill={c.bad} />
          </Pattern>
        </Defs>
        {slots.map((s, i) => (
          <Rect
            key={i}
            x={x(s.start) + (i ? gap / 2 : 0)}
            y={6}
            width={Math.max(1, x(s.end) - x(s.start) - (i ? gap / 2 : 0) - (i < slots.length - 1 ? gap / 2 : 0))}
            height={height}
            rx={3}
            fill={tone(s.name)}
            fillOpacity={chogTier(s.name) === 'avoid' ? 0.75 : 1}
          />
        ))}
        {rahu && rahu.end > start && rahu.start < end ? (
          <>
            <Rect x={x(Math.max(rahu.start, start))} y={6} width={x(Math.min(rahu.end, end)) - x(Math.max(rahu.start, start))} height={height} fill={c.card} />
            <Rect x={x(Math.max(rahu.start, start))} y={6} width={x(Math.min(rahu.end, end)) - x(Math.max(rahu.start, start))} height={height} fill="url(#hatch)" stroke={c.bad} strokeWidth={1.5} rx={2} />
          </>
        ) : null}
        {now !== null && now >= start && now <= end ? (
          <>
            <Rect x={x(now) - 1} y={0} width={2} height={height + 12} rx={1} fill={c.text} />
            <Circle cx={x(now)} cy={2} r={4} fill={c.text} />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

/** The ribbon's key: what each colour and the hatching mean. */
export function RibbonKey({ labels }: { labels: { good: string; fair: string; bad: string; rahu: string } }) {
  const c = useColors();
  const box = (fill: string, hatch?: boolean) => (
    <Svg width={10} height={10}>
      <Defs>
        <Pattern id="khatch" patternUnits="userSpaceOnUse" width={4} height={4} patternTransform="rotate(45)">
          <Rect width={2} height={4} fill={c.bad} />
        </Pattern>
      </Defs>
      <Rect width={10} height={10} rx={3} fill={hatch ? 'url(#khatch)' : fill} stroke={hatch ? c.bad : 'none'} strokeWidth={hatch ? 1.2 : 0} />
    </Svg>
  );
  const item = (el: ReactNode, label: string) => (
    <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      {el}
      <TextSmall color={c.textSecondary}>{label}</TextSmall>
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
      {item(box(c.good), labels.good)}
      {item(box(c.fair), labels.fair)}
      {item(box(c.bad), labels.bad)}
      {item(box(c.bad, true), labels.rahu)}
    </View>
  );
}

function TextSmall({ children, color }: { children: string; color: string }) {
  return <Text style={{ fontSize: 12.5, color }}>{children}</Text>;
}
