import { NativeTabs } from 'expo-router/native-tabs';

import { t } from '@/lib/i18n';
import { useApp } from '@/state/app';

import { useColors } from './ui';

export default function AppTabs() {
  const c = useColors();
  const s = t(useApp().prefs.lang);
  return (
    <NativeTabs
      backgroundColor={c.card}
      indicatorColor={c.backgroundSelected}
      labelStyle={{ selected: { color: c.brand } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{s.tabToday}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sun.max" md="wb_sunny" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="vrat">
        <NativeTabs.Trigger.Label>{s.tabVrat}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="moon.stars" md="bedtime" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="family">
        <NativeTabs.Trigger.Label>{s.tabFamily}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2" md="group" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>{s.tabCalendar}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{s.tabSettings}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
