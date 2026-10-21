// The web preview has no local notifications (expo-notifications is iOS/Android only).
import type { PlannedNotification } from './notify-plan';

export const notificationsSupported = false;
export async function notificationPermission(_ask: boolean): Promise<boolean> { return false }
export async function applyPlan(_plan: PlannedNotification[], _timeZone: string): Promise<number> { return 0 }
export function addTapListener(_open: (url: string) => void): () => void { return () => {} }
