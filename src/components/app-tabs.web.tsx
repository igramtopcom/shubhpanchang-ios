// Web preview: a plain bottom bar built from expo-router's headless tabs.
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { t } from '@/lib/i18n';
import { useApp } from '@/state/app';

import { useColors } from './ui';

export default function AppTabs() {
  const s = t(useApp().prefs.lang);
  const c = useColors();
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        {/* A Slot child takes one style object, not an array (expo-router throws otherwise). */}
        <View style={StyleSheet.flatten([styles.bar, { backgroundColor: c.card, borderTopColor: c.cardBorder }])}>
          <TabTrigger name="(today)" href="/" asChild><TabButton>{s.tabToday}</TabButton></TabTrigger>
          <TabTrigger name="vrat" href="/vrat" asChild><TabButton>{s.tabVrat}</TabButton></TabTrigger>
          <TabTrigger name="family" href="/family" asChild><TabButton>{s.tabFamily}</TabButton></TabTrigger>
          <TabTrigger name="calendar" href="/calendar" asChild><TabButton>{s.tabCalendar}</TabButton></TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const c = useColors();
  return (
    <Pressable {...(props as PressableProps)} style={styles.button}>
      <Text style={{ color: isFocused ? c.brand : c.textSecondary, fontWeight: isFocused ? '700' : '500', fontSize: 14 }}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 8, paddingTop: 6 },
  button: { flex: 1, alignItems: 'center', paddingVertical: 8 },
});
