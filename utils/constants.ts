export const APP_NAME = 'MumVest';
export const REVENUECAT_IOS_API_KEY = 'REVENUECAT_IOS_API_KEY'; // Replace with actual key
export const REVENUECAT_ENTITLEMENT_ID = 'pro_access';
export const REVENUECAT_MONTHLY_PRODUCT = 'mumvest_pro_monthly';
export const REVENUECAT_ANNUAL_PRODUCT = 'mumvest_pro_annual';

export const MONTHLY_PRICE = '$4.99';
export const ANNUAL_PRICE = '$39.99';
export const TRIAL_DAYS = 7;

export const MAX_GOALS = 4;
export const TOTAL_MONEY_MOMENTS = 30;
export const TOTAL_SMART_SWAPS = 30;

export const STREAK_QUALIFYING_ACTIONS = [
  'log_savings',
  'complete_lesson',
  'read_moment',
  'adopt_swap',
  'check_in_challenge',
] as const;

export const XP_REWARDS = {
  LESSON_COMPLETE: 50,
  MOMENT_READ: 10,
  SAVINGS_LOGGED: 15,
  SWAP_ADOPTED: 20,
  CHALLENGE_COMPLETE: 100,
  CHALLENGE_CHECKIN: 10,
} as const;

export const DEFAULT_NOTIFICATION_TIME = '08:00';
export const DEFAULT_CURRENCY = 'USD';

export const JUDGE_SECRET_TAP_COUNT = 5;
