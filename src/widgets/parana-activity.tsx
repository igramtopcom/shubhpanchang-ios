// Parana Live Activity: after an Ekadashi fast, a countdown to the moment it
// may be broken, on the Lock Screen and in the Dynamic Island. The reader
// starts it from the Vrat tab within eight hours of the Parana (the system's
// limit for a Live Activity); the countdown is the system's own timer text,
// so it runs without the app. Same runtime rules as today-widget.tsx.
import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, lineLimit, monospacedDigit, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

import type { ParanaProps } from '@/lib/widget-feed';

const ParanaActivity = (p: ParanaProps, env: LiveActivityEnvironment) => {
  'widget';
  const dark = env.colorScheme === 'dark';
  const accent = env.isLuminanceReduced ? '#FFFFFF' : dark ? '#81C784' : '#1B5E20';
  const soft = dark ? '#D7C2B4' : '#6D4C41';
  const range = { lower: new Date(Math.min(Date.now(), p.startMs)), upper: new Date(p.startMs) };
  const timer = (size: number) => (
    <Text timerInterval={range} countsDown modifiers={[font({ size, weight: 'bold' }), monospacedDigit(), foregroundStyle(accent), lineLimit(1)]} />
  );

  return {
    banner: (
      <HStack spacing={12} modifiers={[padding({ all: 14 })]}>
        <Image systemName="fork.knife.circle.fill" size={34} color={accent} />
        <VStack alignment="leading" spacing={2}>
          <Text modifiers={[font({ textStyle: 'caption', weight: 'semibold' }), foregroundStyle(soft)]}>{p.name}</Text>
          <Text modifiers={[font({ textStyle: 'headline' })]}>{`${p.title} ${p.window}`}</Text>
          <Text modifiers={[font({ textStyle: 'caption' }), foregroundStyle(soft)]}>{p.beginsIn}</Text>
        </VStack>
        <Spacer />
        {timer(26)}
      </HStack>
    ),
    compactLeading: <Image systemName="fork.knife" color={accent} />,
    compactTrailing: (
      <Text timerInterval={range} countsDown modifiers={[monospacedDigit(), foregroundStyle(accent), frame({ maxWidth: 64 })]} />
    ),
    minimal: <Image systemName="fork.knife" color={accent} />,
    expandedLeading: (
      <VStack alignment="leading" modifiers={[padding({ leading: 6 })]}>
        <Image systemName="fork.knife.circle.fill" size={26} color={accent} />
        <Text modifiers={[font({ textStyle: 'caption' })]}>{p.title}</Text>
      </VStack>
    ),
    expandedTrailing: <VStack modifiers={[padding({ trailing: 6 })]}>{timer(22)}</VStack>,
    expandedBottom: (
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ textStyle: 'headline' })]}>{p.name}</Text>
        <Text modifiers={[font({ textStyle: 'subheadline' }), foregroundStyle(soft)]}>{`${p.title} ${p.window}`}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity<ParanaProps>('ParanaActivity', ParanaActivity);
