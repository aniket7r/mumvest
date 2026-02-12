import { create } from 'zustand';
import { Platform } from 'react-native';
import { mmkv } from './mmkv';

// Conditional import — RevenueCat doesn't support web
let Purchases: any = null;
let LOG_LEVEL: any = null;
if (Platform.OS !== 'web') {
  const mod = require('react-native-purchases');
  Purchases = mod.default;
  LOG_LEVEL = mod.LOG_LEVEL;
}

import { REVENUECAT_IOS_API_KEY, REVENUECAT_ENTITLEMENT_ID } from '../utils/constants';

interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  currentOffering: any | null;

  initialize: () => Promise<void>;
  purchaseMonthly: () => Promise<boolean>;
  purchaseAnnual: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkEntitlement: (info?: any) => boolean;
  webUnlock: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPro: false,
  isLoading: true,
  currentOffering: null,

  initialize: async () => {
    // Check judge mode first
    const judgeUnlocked = mmkv.getBoolean('judge.unlocked');
    if (judgeUnlocked) {
      set({ isPro: true, isLoading: false });
      return;
    }

    // On web, start as free tier so judges can see the full monetization flow
    // They can upgrade via the paywall which instantly unlocks Pro
    if (Platform.OS === 'web') {
      set({ isPro: false, isLoading: false });
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
      }
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const offerings = await Purchases.getOfferings();
      const customerInfo = await Purchases.getCustomerInfo();

      set({
        currentOffering: offerings.current,
        isPro: get().checkEntitlement(customerInfo),
        isLoading: false,
      });
    } catch (error) {
      console.warn('RevenueCat init error:', error);
      set({ isLoading: false });
    }
  },

  webUnlock: () => {
    mmkv.set('judge.unlocked', true);
    set({ isPro: true });
  },

  purchaseMonthly: async () => {
    if (Platform.OS === 'web') { get().webUnlock(); return true; }
    try {
      const { currentOffering } = get();
      const monthly = currentOffering?.monthly;
      if (!monthly) return false;

      const { customerInfo } = await Purchases.purchasePackage(monthly);
      const isPro = get().checkEntitlement(customerInfo);
      set({ isPro });
      return isPro;
    } catch (error: any) {
      if (error.userCancelled) return false;
      console.error('Purchase error:', error);
      return false;
    }
  },

  purchaseAnnual: async () => {
    if (Platform.OS === 'web') { get().webUnlock(); return true; }
    try {
      const { currentOffering } = get();
      const annual = currentOffering?.annual;
      if (!annual) return false;

      const { customerInfo } = await Purchases.purchasePackage(annual);
      const isPro = get().checkEntitlement(customerInfo);
      set({ isPro });
      return isPro;
    } catch (error: any) {
      if (error.userCancelled) return false;
      console.error('Purchase error:', error);
      return false;
    }
  },

  restorePurchases: async () => {
    if (Platform.OS === 'web') { get().webUnlock(); return true; }
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPro = get().checkEntitlement(customerInfo);
      set({ isPro });
      return isPro;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  },

  checkEntitlement: (info?: any) => {
    if (!info) return false;
    return !!info.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
  },
}));
