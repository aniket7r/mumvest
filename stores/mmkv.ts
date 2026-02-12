import { Platform } from 'react-native';

// Cross-platform storage: MMKV on native, localStorage on web
function createStorage() {
  if (Platform.OS === 'web') {
    return {
      getString: (key: string): string | undefined => {
        const v = localStorage.getItem(key);
        return v === null ? undefined : v;
      },
      getNumber: (key: string): number => {
        const v = localStorage.getItem(key);
        return v === null ? 0 : Number(v);
      },
      getBoolean: (key: string): boolean => {
        const v = localStorage.getItem(key);
        return v === 'true';
      },
      set: (key: string, value: string | number | boolean) => {
        localStorage.setItem(key, String(value));
      },
      remove: (key: string) => {
        localStorage.removeItem(key);
        return true;
      },
      contains: (key: string) => localStorage.getItem(key) !== null,
      clearAll: () => localStorage.clear(),
    };
  }

  // Native: use MMKV
  const { createMMKV } = require('react-native-mmkv');
  return createMMKV({ id: 'mumvest-storage' });
}

const storage = createStorage();

// Type-safe helpers
export const mmkv = {
  getString: (key: string): string | undefined => storage.getString(key),
  getNumber: (key: string): number => storage.getNumber(key) ?? 0,
  getBoolean: (key: string): boolean => storage.getBoolean(key) ?? false,
  set: (key: string, value: string | number | boolean) => storage.set(key, value),
  delete: (key: string) => storage.remove(key),
  contains: (key: string) => storage.contains(key),
};

// MMKV Keys
export const KEYS = {
  STREAK_CURRENT: 'streak.current',
  STREAK_LONGEST: 'streak.longest',
  STREAK_LAST_ACTIVE: 'streak.lastActiveDate',
  XP_TOTAL: 'xp.total',
  INDEPENDENCE_SCORE: 'independence.score',
  ONBOARDING_COMPLETED: 'onboarding.completed',
  ONBOARDING_SELECTIONS: 'onboarding.selections',
  CONTENT_MOMENT_INDEX: 'content.currentMomentIndex',
  CONTENT_MOMENT_START: 'content.momentStartDate',
  SETTINGS_CURRENCY: 'settings.currency',
  SETTINGS_NOTIFICATION_TIME: 'settings.notificationTime',
  APP_FIRST_LAUNCH: 'app.firstLaunchDate',
  APP_LAST_SESSION: 'app.lastSessionDate',
  NOTIF_LAST_SCHEDULED: 'notif.lastScheduled',
  HAS_SHARED: 'has_shared',
  VERSION_TAP_COUNT: 'version.tapCount',
  CATEGORY_PREFERENCES: 'personalization.categoryPreferences',
} as const;

// Helpers to clear all (for reset/delete account)
export function clearAll() {
  storage.clearAll();
}
