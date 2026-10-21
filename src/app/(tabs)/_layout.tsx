import AppTabs from '@/components/app-tabs';
import { NotificationSync } from '@/components/notification-sync';
import { WidgetSync } from '@/components/widget-sync';

export default function TabsLayout() {
  return (
    <>
      <NotificationSync />
      <WidgetSync />
      <AppTabs />
    </>
  );
}
