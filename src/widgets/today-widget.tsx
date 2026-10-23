// "Today" widget: is now a good time, until when, else when next; the tithi
// and its moon; on the medium size also Rahu Kaal and the next vrat.
// Home Screen (small, medium) and Lock Screen (rectangular, inline, circular).
//
// The function below runs in the widget's own runtime ('widget' directive):
// only its props, the environment and @expo/ui components exist there, so
// colours and helpers live inside it. The app fills the timeline
// (src/lib/widget-feed.ts, src/components/widget-sync.tsx).
import { AccessoryWidgetBackground, HStack, Image, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  containerBackground, font, foregroundStyle, frame, lineLimit, minimumScaleFactor, padding, widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { TodayProps } from '@/lib/widget-feed';

const TodayWidget = (p: TodayProps, env: WidgetEnvironment) => {
  'widget';
  const dark = env.colorScheme === 'dark';
  // Tinted and clear Home Screens and the Lock Screen colour widgets themselves:
  // meaning then rests on the words ("Rahu Kaal now"), never on hue.
  const plain = env.widgetRenderingMode === 'accented' || env.widgetRenderingMode === 'vibrant';
  const ink = dark ? '#F5E9E0' : '#3E2723';
  const soft = dark ? '#D7C2B4' : '#6D4C41';
  const tone = plain ? ink
    : p.state === 'good' ? (dark ? '#81C784' : '#1B5E20')
      : p.state === 'rahu' ? (dark ? '#EF9A9A' : '#C62828')
        : (dark ? '#FFCC80' : '#8D5A00');
  const ground = dark ? '#1B1411' : '#FFF8F0';
  const counting = p.untilMs > 0 && p.state !== 'good';
  const headline = p.state === 'good' ? `${p.name} · ${p.at}` : p.state === 'rahu' ? p.at : `${p.name} · ${p.at}`;

  if (env.widgetFamily === 'accessoryInline') {
    return (
      <HStack modifiers={[widgetURL(p.url)]}>
        <Image systemName={p.moon as never} />
        <Text>{p.state === 'good' ? `${p.name} ${p.at}` : `${p.name} ${p.state === 'rahu' ? '' : p.at}`.trim()} · {p.tithiShort}</Text>
      </HStack>
    );
  }

  if (env.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[widgetURL(p.url)]}>
        <AccessoryWidgetBackground />
        <VStack spacing={0}>
          <Image systemName={p.moon as never} size={18} />
          <Text modifiers={[font({ size: 17, weight: 'bold' })]}>{String(p.tithiNum)}</Text>
        </VStack>
      </ZStack>
    );
  }

  if (env.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[widgetURL(p.url)]}>
        <Text modifiers={[font({ textStyle: 'caption', weight: 'bold' }), lineLimit(1)]}>{p.head}</Text>
        <Text modifiers={[font({ textStyle: 'headline' }), lineLimit(1), minimumScaleFactor(0.7)]}>{headline}</Text>
        <Text modifiers={[font({ textStyle: 'caption' }), lineLimit(1)]}>{p.festToday || p.tithi}</Text>
      </VStack>
    );
  }

  const now = (
    <VStack alignment="leading" spacing={3}>
      <HStack spacing={5}>
        <Image systemName={p.moon as never} size={13} color={soft} />
        <Text modifiers={[font({ textStyle: 'caption2', weight: p.festToday ? 'bold' : 'regular' }), foregroundStyle(p.festToday && !plain ? (dark ? '#FF8A65' : '#C0390E') : soft), lineLimit(1), minimumScaleFactor(0.7)]}>{p.festToday || p.date}</Text>
      </HStack>
      <Spacer />
      <Text modifiers={[font({ textStyle: 'caption', weight: 'semibold' }), foregroundStyle(tone), lineLimit(2)]}>{p.head}</Text>
      <Text modifiers={[font({ textStyle: 'title3', weight: 'bold' }), foregroundStyle(plain ? ink : tone), lineLimit(1), minimumScaleFactor(0.6)]}>{headline}</Text>
      {counting ? (
        <Text date={new Date(p.untilMs)} dateStyle="relative" modifiers={[font({ textStyle: 'caption' }), foregroundStyle(soft), lineLimit(1)]} />
      ) : null}
      <Spacer />
      <Text modifiers={[font({ textStyle: 'footnote', weight: 'medium' }), foregroundStyle(ink), lineLimit(2), minimumScaleFactor(0.8)]}>{p.tithi}</Text>
    </VStack>
  );

  if (env.widgetFamily === 'systemMedium') {
    return (
      <HStack spacing={14} modifiers={[containerBackground(ground, 'widget'), widgetURL(p.url)]}>
        {now}
        <VStack alignment="leading" spacing={3} modifiers={[frame({ maxWidth: 10000, alignment: 'leading' })]}>
          <Text modifiers={[font({ textStyle: 'caption2' }), foregroundStyle(soft)]}>{p.rahuLabel}</Text>
          <Text modifiers={[font({ textStyle: 'headline' }), foregroundStyle(plain ? ink : (dark ? '#EF9A9A' : '#C62828')), lineLimit(1)]}>{p.rahu}</Text>
          <Spacer />
          <Text modifiers={[font({ textStyle: 'caption2' }), foregroundStyle(soft)]}>{p.vratLabel}</Text>
          <Text modifiers={[font({ textStyle: 'subheadline', weight: 'semibold' }), foregroundStyle(ink), lineLimit(1), minimumScaleFactor(0.75)]}>{p.vratWhen ? `${p.vrat} · ${p.vratWhen}` : p.vrat}</Text>
          {p.nextFest ? <Spacer /> : null}
          {p.nextFest ? <Text modifiers={[font({ textStyle: 'caption2' }), foregroundStyle(soft)]}>{p.festLabel}</Text> : null}
          {p.nextFest ? (
            <Text modifiers={[font({ textStyle: 'subheadline', weight: 'semibold' }), foregroundStyle(plain ? ink : (dark ? '#FF8A65' : '#C0390E')), lineLimit(1), minimumScaleFactor(0.75)]}>{`${p.nextFest} · ${p.nextFestWhen}`}</Text>
          ) : null}
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack alignment="leading" modifiers={[containerBackground(ground, 'widget'), widgetURL(p.url), padding({ all: 0 })]}>
      {now}
    </VStack>
  );
};

export default createWidget<TodayProps>('TodayWidget', TodayWidget, {
  state: 'wait', head: 'Divo', name: '', at: '', untilMs: 0, date: '', tithi: '', tithiShort: '',
  tithiNum: 1, moon: 'moon.stars', rahuLabel: '', rahu: '', vratLabel: '', vrat: '', vratWhen: '',
  festToday: '', festLabel: '', nextFest: '', nextFestWhen: '', url: 'shubhpanchang://',
});
