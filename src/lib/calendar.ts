// Adding one event to the iPhone Calendar through the system's own editor.
//
// The legacy createEventInCalendarAsync presents Apple's event sheet, which
// runs outside the app, so no calendar permission is asked (Expo SDK 58 docs,
// expo-calendar/legacy). The reader picks the calendar there, a shared family
// calendar included, and can edit before saving.
import * as Calendar from 'expo-calendar/legacy';
import * as Linking from 'expo-linking';

export const calendarSupported = true;

/** An all-day event on `date` (YYYY-MM-DD), every year on that date when `yearly`. Resolves to 'saved' | 'canceled' | 'deleted' | 'done'. */
export async function addAllDayEvent(e: { date: string; title: string; notes?: string; url?: string; yearly?: boolean }): Promise<string> {
  const [y, m, d] = e.date.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 1);
  const result = await Calendar.createEventInCalendarAsync({
    title: e.title,
    startDate: start,
    endDate: end,
    allDay: true,
    notes: e.notes,
    url: e.url,
    ...(e.yearly ? { recurrenceRule: { frequency: Calendar.Frequency.YEARLY } } : {}),
  });
  return result.action;
}

/** Subscribe the phone's Calendar to a live feed (webcal://...). */
export async function subscribe(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
