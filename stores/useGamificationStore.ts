import { create } from 'zustand';
import { mmkv, KEYS } from './mmkv';
import { formatDate, addDays } from '../utils/dates';
import { XP_REWARDS } from '../utils/constants';

interface EarnedBadge {
  id: string;
  earnedAt: string;
}

interface GamificationState {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  independenceScore: number;
  earnedBadges: EarnedBadge[];

  initialize: () => void;
  recordActivity: () => void;
  addXP: (amount: number) => void;
  checkAndAwardBadges: (context: {
    totalSaved: number;
    goalsCount: number;
    completedLessons: number;
    adoptedSwaps: number;
    readMoments: number;
    hasShared: boolean;
  }) => string | null; // Returns newly earned badge ID or null
  calculateIndependenceScore: (params: {
    completedLessons: number;
    goalsWithSavings: number;
    totalSaved: number;
    adoptedSwaps: number;
    earnedBadges: number;
  }) => number;
}

const BADGE_RULES: { id: string; check: (ctx: Parameters<GamificationState['checkAndAwardBadges']>[0], state: GamificationState) => boolean }[] = [
  { id: 'first-step', check: (ctx) => ctx.totalSaved > 0 },
  { id: 'money-aware', check: (ctx) => ctx.completedLessons >= 5 },
  { id: 'smart-saver', check: (ctx) => ctx.completedLessons >= 10 },
  { id: '7-day-streak', check: (_, s) => s.currentStreak >= 7 },
  { id: '30-day-streak', check: (_, s) => s.currentStreak >= 30 },
  { id: 'century-saver', check: (ctx) => ctx.totalSaved >= 100 },
  { id: 'grand-saver', check: (ctx) => ctx.totalSaved >= 1000 },
  { id: 'iron-will', check: (_, s) => s.longestStreak >= 14 },
  { id: 'meal-master', check: (ctx) => ctx.adoptedSwaps >= 5 },
  { id: 'smart-swapper', check: (ctx) => ctx.adoptedSwaps >= 10 },
  { id: 'moment-reader', check: (ctx) => ctx.readMoments >= 15 },
  { id: 'goal-getter', check: (ctx) => ctx.goalsCount >= 3 },
  { id: 'sharing-is-caring', check: (ctx) => ctx.hasShared },
];

export const useGamificationStore = create<GamificationState>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  totalXP: 0,
  independenceScore: 0,
  earnedBadges: [],

  initialize: () => {
    const savedBadges = mmkv.getString('badges.earned');
    const earnedBadges: EarnedBadge[] = savedBadges ? JSON.parse(savedBadges) : [];

    set({
      currentStreak: mmkv.getNumber(KEYS.STREAK_CURRENT),
      longestStreak: mmkv.getNumber(KEYS.STREAK_LONGEST),
      totalXP: mmkv.getNumber(KEYS.XP_TOTAL),
      independenceScore: mmkv.getNumber(KEYS.INDEPENDENCE_SCORE),
      earnedBadges,
    });
  },

  recordActivity: () => {
    const today = formatDate(new Date());
    const lastActive = mmkv.getString(KEYS.STREAK_LAST_ACTIVE);

    if (lastActive === today) return;

    const yesterday = formatDate(addDays(new Date(), -1));

    let newStreak: number;
    if (lastActive === yesterday) {
      newStreak = mmkv.getNumber(KEYS.STREAK_CURRENT) + 1;
    } else {
      newStreak = 1;
    }

    const longest = Math.max(newStreak, mmkv.getNumber(KEYS.STREAK_LONGEST));

    mmkv.set(KEYS.STREAK_CURRENT, newStreak);
    mmkv.set(KEYS.STREAK_LONGEST, longest);
    mmkv.set(KEYS.STREAK_LAST_ACTIVE, today);

    set({ currentStreak: newStreak, longestStreak: longest });
  },

  addXP: (amount: number) => {
    const current = mmkv.getNumber(KEYS.XP_TOTAL);
    const newTotal = current + amount;
    mmkv.set(KEYS.XP_TOTAL, newTotal);
    set({ totalXP: newTotal });
  },

  checkAndAwardBadges: (context) => {
    const state = get();
    const earnedIds = new Set(state.earnedBadges.map((b) => b.id));
    let newBadgeId: string | null = null;

    for (const rule of BADGE_RULES) {
      if (!earnedIds.has(rule.id) && rule.check(context, state)) {
        const badge: EarnedBadge = { id: rule.id, earnedAt: new Date().toISOString() };
        const updated = [...state.earnedBadges, badge];
        mmkv.set('badges.earned', JSON.stringify(updated));
        set({ earnedBadges: updated });
        newBadgeId = rule.id;
        // Award first new badge found this check (can call again for more)
        break;
      }
    }
    return newBadgeId;
  },

  calculateIndependenceScore: ({ completedLessons, goalsWithSavings, totalSaved, adoptedSwaps, earnedBadges }) => {
    let score = 0;

    // Streak contribution (max 15)
    score += Math.min(15, get().currentStreak);

    // Lessons (max 26)
    score += Math.min(26, completedLessons);

    // Goals with progress (max 20)
    score += Math.min(20, goalsWithSavings * 5);

    // Total savings (max 20)
    if (totalSaved >= 100) score += 5;
    if (totalSaved >= 500) score += 5;
    if (totalSaved >= 1000) score += 5;
    if (totalSaved >= 2500) score += 5;

    // Swaps (max 10)
    score += Math.min(10, adoptedSwaps);

    // Badges (max 9)
    score += Math.min(9, earnedBadges);

    const finalScore = Math.min(100, score);
    mmkv.set(KEYS.INDEPENDENCE_SCORE, finalScore);
    set({ independenceScore: finalScore });
    return finalScore;
  },
}));
