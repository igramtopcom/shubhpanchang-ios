// Web preview only: localStorage, which can be blocked (private mode), so
// every call is guarded and a failure behaves like an empty store.
import type { KV } from './api';

const ls = (): Storage | null => {
  try { return globalThis.localStorage ?? null } catch { return null }
};

export const kv: KV = {
  getItem: async key => { try { return ls()?.getItem(key) ?? null } catch { return null } },
  setItem: async (key, value) => { try { ls()?.setItem(key, value) } catch { /* full or blocked */ } },
  removeItem: async key => { try { ls()?.removeItem(key) } catch { /* blocked */ } },
  getAllKeys: async () => { try { const s = ls(); return s ? Object.keys(s) : [] } catch { return [] } },
};
