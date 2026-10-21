// Haptics, kept to the moments iOS itself uses them: a selection tick when a
// chip or switch changes, a success tap when something is saved or added.
// expo-haptics does nothing where there is no Taptic Engine (web, simulator).
import * as Haptics from 'expo-haptics';

export const tick = () => { Haptics.selectionAsync().catch(() => {}); };
export const success = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };
