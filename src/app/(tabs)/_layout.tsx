import AppTabs from '@/components/app-tabs';
import { NotificationSync } from '@/components/notification-sync';
import { WidgetSync } from '@/components/widget-sync';
import { WIDGETS } from '@/lib/features';

export default function TabsLayout() {
  return (
    <>
      <NotificationSync />
      {WIDGETS ? <WidgetSync /> : null}
      <AppTabs />
    </>
  );
}
