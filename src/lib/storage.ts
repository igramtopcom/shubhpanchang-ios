// On the phone: expo-sqlite's key-value store (the documented replacement for
// AsyncStorage). The web build (storage.web.ts) uses localStorage instead,
// because expo-sqlite on web needs wasm and cross-origin isolation headers.
import Storage from 'expo-sqlite/kv-store';

import type { KV } from './api';

export const kv: KV = {
  getItem: key => Storage.getItem(key),
  setItem: (key, value) => Storage.setItem(key, value),
  removeItem: key => Storage.removeItem(key),
  getAllKeys: async () => [...(await Storage.getAllKeys())],
};
