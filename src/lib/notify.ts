// Scheduling the plan from notify-plan.ts as iOS local notifications.
// The whole set is replaced each time: cancel everything, schedule the plan.
import * as Notifications from 'expo-notifications';

import type { PlannedNotification } from './notify-plan';
import { zonedTimeToUtc } from './time';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationsSupported = true;

export async function notificationPermission(ask: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || !ask) return current.granted;
  const asked = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return asked.granted;
}

/** Replace every pending notification with `plan`, read at the place's time zone. */
export async function applyPlan(plan: PlannedNotification[], timeZone: string): Promise<number> {
  if (!(await notificationPermission(false))) return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = Date.now();
  let scheduled = 0;
  for (const n of plan) {
    const when = zonedTimeToUtc(n.date, n.minutes, timeZone);
    if (when.getTime() <= now) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: n.id,
      content: { title: n.title, body: n.body, sound: 'default', data: { url: n.url } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
    scheduled++;
  }
  return scheduled;
}

/** The route a tapped notification asks for, if any. */
export function addTapListener(open: (url: string) => void): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(r => {
    const url = r.notification.request.content.data?.url;
    if (typeof url === 'string') open(url);
  });
  return () => sub.remove();
}
