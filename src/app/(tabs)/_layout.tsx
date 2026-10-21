import AppTabs from '@/components/app-tabs';
import { NotificationSync } from '@/components/notification-sync';

export default function TabsLayout() {
  return (
    <>
      <NotificationSync />
      <AppTabs />
    </>
  );
}
