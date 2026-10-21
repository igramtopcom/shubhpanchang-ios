import AppTabs from '@/components/app-tabs';
import { NotificationSync } from '@/components/notification-sync';
import { SiriSync } from '@/components/siri-sync';
import { WidgetSync } from '@/components/widget-sync';
import { WIDGETS } from '@/lib/features';

export default function TabsLayout() {
  return (
    <>
      <NotificationSync />
      <SiriSync />
      {WIDGETS ? <WidgetSync /> : null}
      <AppTabs />
    </>
  );
}
