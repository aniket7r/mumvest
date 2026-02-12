import { create } from 'zustand';
import { db, schema } from '../db/client';
import { eq } from 'drizzle-orm';
import { mmkv, KEYS } from './mmkv';
import type { Currency, FinancialSituation, OnboardingSelections } from '../types';

interface UserState {
  name: string | null;
  currency: Currency;
  financialSituation: FinancialSituation | null;
  notificationTime: string;
  notificationEnabled: boolean;
  onboardingCompleted: boolean;
  memberSince: string | null;
  isLoading: boolean;

  initialize: () => Promise<void>;
  completeOnboarding: (selections: OnboardingSelections) => Promise<void>;
  updateCurrency: (currency: Currency) => void;
  updateNotificationTime: (time: string) => void;
  toggleNotifications: (enabled: boolean) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  name: null,
  currency: 'USD',
  financialSituation: null,
  notificationTime: '08:00',
  notificationEnabled: true,
  onboardingCompleted: false,
  memberSince: null,
  isLoading: true,

  initialize: async () => {
    const onboardingDone = mmkv.getBoolean(KEYS.ONBOARDING_COMPLETED);

    if (onboardingDone) {
      const users = await db.select().from(schema.userProfile).limit(1);
      const user = users[0];
      if (user) {
        set({
          name: user.name,
          currency: (user.currency as Currency) || 'USD',
          financialSituation: user.financialSituation as FinancialSituation,
          notificationTime: user.notificationTime,
          notificationEnabled: user.notificationEnabled,
          onboardingCompleted: true,
          memberSince: mmkv.getString(KEYS.APP_FIRST_LAUNCH) || user.createdAt,
          isLoading: false,
        });
        return;
      }
    }

    set({ onboardingCompleted: false, isLoading: false });
  },

  completeOnboarding: async (selections: OnboardingSelections) => {
    await db.insert(schema.userProfile).values({
      name: selections.name,
      currency: 'USD',
      financialSituation: selections.situation,
      notificationTime: selections.notificationTime,
      notificationEnabled: selections.notificationsEnabled,
      onboardingCompleted: true,
    });

    mmkv.set(KEYS.ONBOARDING_COMPLETED, true);
    mmkv.set(KEYS.ONBOARDING_SELECTIONS, JSON.stringify(selections));
    mmkv.set(KEYS.APP_FIRST_LAUNCH, new Date().toISOString().split('T')[0]);
    mmkv.set(KEYS.CONTENT_MOMENT_START, new Date().toISOString().split('T')[0]);
    mmkv.set(KEYS.STREAK_CURRENT, 1);
    mmkv.set(KEYS.STREAK_LONGEST, 1);
    mmkv.set(KEYS.STREAK_LAST_ACTIVE, new Date().toISOString().split('T')[0]);

    set({
      name: selections.name,
      financialSituation: selections.situation,
      notificationTime: selections.notificationTime,
      notificationEnabled: selections.notificationsEnabled,
      onboardingCompleted: true,
    });
  },

  updateCurrency: (currency: Currency) => {
    mmkv.set(KEYS.SETTINGS_CURRENCY, currency);
    set({ currency });
    db.update(schema.userProfile)
      .set({ currency })
      .where(eq(schema.userProfile.id, 1));
  },

  updateNotificationTime: (time: string) => {
    mmkv.set(KEYS.SETTINGS_NOTIFICATION_TIME, time);
    set({ notificationTime: time });
    db.update(schema.userProfile)
      .set({ notificationTime: time })
      .where(eq(schema.userProfile.id, 1));
  },

  toggleNotifications: (enabled: boolean) => {
    set({ notificationEnabled: enabled });
    db.update(schema.userProfile)
      .set({ notificationEnabled: enabled })
      .where(eq(schema.userProfile.id, 1));
  },
}));
