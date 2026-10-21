// Countdown Live Activity: to the Parana after an Ekadashi, to moonrise on a
// Sankashti, to the start or end of Rahu Kaal (src/lib/widget-feed.ts,
// CountdownProps). The reader starts it within eight hours of the moment
// (the system's limit for a Live Activity); the countdown is the system's own
// timer text, so it runs without the app. Same runtime rules as
// today-widget.tsx: only props, environment and @expo/ui exist in here.
import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, lineLimit, monospacedDigit, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

import type { CountdownProps } from '@/lib/widget-feed';

const CountdownActivity = (p: CountdownProps, env: LiveActivityEnvironment) => {
  'widget';
  const dark = env.colorScheme === 'dark';
  const accent = env.isLuminanceReduced ? '#FFFFFF'
    : p.tone === 'bad' ? (dark ? '#EF9A9A' : '#C62828') : (dark ? '#81C784' : '#1B5E20');
  const soft = dark ? '#D7C2B4' : '#6D4C41';
  const range = { lower: new Date(Math.min(Date.now(), p.targetMs)), upper: new Date(p.targetMs) };
  const timer = (size: number) => (
    <Text timerInterval={range} countsDown modifiers={[font({ size, weight: 'bold' }), monospacedDigit(), foregroundStyle(accent), lineLimit(1)]} />
  );

  return {
    banner: (
      <HStack spacing={12} modifiers={[padding({ all: 14 })]}>
        <Image systemName={p.icon as never} size={34} color={accent} />
        <VStack alignment="leading" spacing={2}>
          <Text modifiers={[font({ textStyle: 'caption', weight: 'semibold' }), foregroundStyle(soft), lineLimit(1)]}>{p.name}</Text>
          <Text modifiers={[font({ textStyle: 'headline' }), lineLimit(1)]}>{`${p.title} ${p.window}`}</Text>
          <Text modifiers={[font({ textStyle: 'caption' }), foregroundStyle(soft), lineLimit(1)]}>{p.label}</Text>
        </VStack>
        <Spacer />
        {timer(26)}
      </HStack>
    ),
    compactLeading: <Image systemName={p.icon as never} color={accent} />,
    compactTrailing: (
      <Text timerInterval={range} countsDown modifiers={[monospacedDigit(), foregroundStyle(accent), frame({ maxWidth: 64 })]} />
    ),
    minimal: <Image systemName={p.icon as never} color={accent} />,
    expandedLeading: (
      <VStack alignment="leading" modifiers={[padding({ leading: 6 })]}>
        <Image systemName={p.icon as never} size={26} color={accent} />
        <Text modifiers={[font({ textStyle: 'caption' })]}>{p.title}</Text>
      </VStack>
    ),
    expandedTrailing: <VStack modifiers={[padding({ trailing: 6 })]}>{timer(22)}</VStack>,
    expandedBottom: (
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ textStyle: 'headline' }), lineLimit(1)]}>{p.name}</Text>
        <Text modifiers={[font({ textStyle: 'subheadline' }), foregroundStyle(soft)]}>{`${p.label} · ${p.title} ${p.window}`}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity<CountdownProps>('CountdownActivity', CountdownActivity);
