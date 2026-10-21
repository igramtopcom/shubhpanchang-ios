// Asking for a rating, the way Apple asks it to be done: only right after
// something worked for the reader (a family date saved, the Parana countdown
// started), never at launch, and from us at most once in four months (iOS
// itself shows the prompt at most three times a year and may skip it).
import * as StoreReview from 'expo-store-review';

import { kv } from './storage';

const KEY = 'review:asked';
const GAP_MS = 120 * 86400_000;

export async function askAfterSuccess(): Promise<void> {
  try {
    const last = Number((await kv.getItem(KEY)) ?? 0);
    if (Date.now() - last < GAP_MS) return;
    if (!(await StoreReview.hasAction())) return;
    await kv.setItem(KEY, String(Date.now()));
    // A moment after the success, not on top of it.
    setTimeout(() => { StoreReview.requestReview().catch(() => {}); }, 1500);
  } catch { /* a rating is never worth an error */ }
}
