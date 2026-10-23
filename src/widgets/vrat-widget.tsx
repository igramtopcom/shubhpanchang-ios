// "Next vrat" widget: the coming fast at the place and when it may be broken
// (Parana, moonrise, Pradosh Kaal). Home Screen small, Lock Screen rectangular.
// Same runtime rules as today-widget.tsx.
import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, lineLimit, minimumScaleFactor, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { VratProps } from '@/lib/widget-feed';

const VratWidget = (p: VratProps, env: WidgetEnvironment) => {
  'widget';
  const dark = env.colorScheme === 'dark';
  const plain = env.widgetRenderingMode === 'accented' || env.widgetRenderingMode === 'vibrant';
  const ink = dark ? '#F3EADF' : '#2A201A';
  const soft = dark ? '#BDAE9F' : '#6A5D54';
  const good = plain ? ink : dark ? '#7DB592' : '#44735A';
  const brand = plain ? ink : dark ? '#E6894A' : '#AC5118';

  if (env.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[widgetURL(p.url)]}>
        <Text modifiers={[font({ textStyle: 'caption', weight: 'bold' }), lineLimit(1)]}>{p.when || p.label}</Text>
        <Text modifiers={[font({ textStyle: 'headline' }), lineLimit(1), minimumScaleFactor(0.7)]}>{p.name}</Text>
        {p.detail ? <Text modifiers={[font({ textStyle: 'caption' }), lineLimit(1), minimumScaleFactor(0.8)]}>{p.detail}</Text> : null}
      </VStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={3} modifiers={[containerBackground(dark ? '#201913' : '#FFFFFF', 'widget'), widgetURL(p.url)]}>
      <HStack spacing={5}>
        <Image systemName="moon.stars.fill" size={13} color={brand} />
        <Text modifiers={[font({ textStyle: 'caption2', weight: 'semibold' }), foregroundStyle(brand), lineLimit(1)]}>{p.label}</Text>
      </HStack>
      <Spacer />
      <Text modifiers={[font({ textStyle: 'headline' }), foregroundStyle(ink), lineLimit(3), minimumScaleFactor(0.75)]}>{p.name}</Text>
      <Text modifiers={[font({ textStyle: 'caption' }), foregroundStyle(soft), lineLimit(1), minimumScaleFactor(0.8)]}>{p.when}</Text>
      <Spacer />
      {p.detail ? <Text modifiers={[font({ textStyle: 'caption', weight: 'semibold' }), foregroundStyle(good), lineLimit(2), minimumScaleFactor(0.8)]}>{p.detail}</Text> : null}
    </VStack>
  );
};

export default createWidget<VratProps>('VratWidget', VratWidget, {
  label: 'Divo', name: '', when: '', detail: '', url: 'shubhpanchang://vrat',
});
