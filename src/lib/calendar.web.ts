// Web preview: no system calendar editor. Subscribing opens the https feed.
export const calendarSupported = false;

export async function addAllDayEvent(_e: { date: string; title: string; notes?: string; url?: string }): Promise<string> {
  return 'canceled';
}

export async function subscribe(url: string): Promise<boolean> {
  try {
    globalThis.open?.(url.replace(/^webcal:/, 'https:'), '_blank');
    return true;
  } catch {
    return false;
  }
}
