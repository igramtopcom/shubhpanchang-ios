// Incoming links (Universal Links from shubhpanchang.in, the app's own scheme)
// rewritten to the app's screens. Runs outside React and must never throw.
import { routeForWebPath } from '@/lib/links';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    return routeForWebPath(path);
  } catch {
    return '/';
  }
}
