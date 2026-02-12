import { create } from 'zustand';
import { db, schema } from '../db/client';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { mmkv, KEYS } from './mmkv';
import { daysBetween } from '../utils/dates';
import { TOTAL_MONEY_MOMENTS } from '../utils/constants';

// Import content
import moneyMoments from '../content/money-moments.json';
import smartSwaps from '../content/smart-swaps.json';
import challenges from '../content/challenges.json';
import badgeDefinitions from '../content/badges.json';

import type { MoneyMoment, SmartSwap, Challenge, Badge } from '../types';

interface ActiveChallenge {
  id: string;
  challengeId: string;
  status: 'active' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  checkIns: boolean[];
}

interface ContentState {
  moments: MoneyMoment[];
  swaps: SmartSwap[];
  challenges: Challenge[];
  badges: Badge[];
  todaysMoment: MoneyMoment | null;
  yesterdaysMoment: MoneyMoment | null;
  readMomentIds: Set<string>;
  savedMomentIds: Set<string>;
  adoptedSwapIds: Set<string>;
  activeChallenge: ActiveChallenge | null;

  initialize: () => Promise<void>;
  getTodaysMoment: () => MoneyMoment | null;
  markMomentRead: (momentId: string) => Promise<void>;
  toggleMomentSaved: (momentId: string) => Promise<void>;
  adoptSwap: (swapId: string) => Promise<void>;
  dismissSwap: (swapId: string) => void;
  startChallenge: (challengeId: string) => Promise<void>;
  checkInChallenge: (checkInIndex: number) => Promise<boolean>;
  abandonChallenge: () => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  moments: moneyMoments as MoneyMoment[],
  swaps: smartSwaps as SmartSwap[],
  challenges: challenges as Challenge[],
  badges: badgeDefinitions as Badge[],
  todaysMoment: null,
  yesterdaysMoment: null,
  readMomentIds: new Set(),
  savedMomentIds: new Set(),
  adoptedSwapIds: new Set(),
  activeChallenge: null,

  initialize: async () => {
    // Load read moments
    const momentStates = await db.select().from(schema.moneyMomentState);
    const readIds = new Set(momentStates.filter((m) => m.isRead).map((m) => m.momentId));
    const savedIds = new Set(momentStates.filter((m) => m.isSaved).map((m) => m.momentId));

    // Load adopted swaps
    const swapStates = await db.select().from(schema.smartSwapState);
    const adoptedIds = new Set(swapStates.filter((s) => s.isAdopted).map((s) => s.swapId));

    // Calculate today's & yesterday's moment
    const startDate = mmkv.getString(KEYS.CONTENT_MOMENT_START);
    let todaysMoment: MoneyMoment | null = null;
    let yesterdaysMoment: MoneyMoment | null = null;

    if (startDate) {
      const daysSinceStart = daysBetween(new Date(startDate), new Date());
      const momentIndex = daysSinceStart % TOTAL_MONEY_MOMENTS;
      todaysMoment = (moneyMoments as MoneyMoment[])[momentIndex] || null;
      if (daysSinceStart > 0) {
        const yesterdayIndex = (daysSinceStart - 1) % TOTAL_MONEY_MOMENTS;
        yesterdaysMoment = (moneyMoments as MoneyMoment[])[yesterdayIndex] || null;
      }
    } else {
      todaysMoment = (moneyMoments as MoneyMoment[])[0] || null;
    }

    // Load active challenge
    let activeChallenge: ActiveChallenge | null = null;
    try {
      const challengeRows = await db.select().from(schema.challengeState);
      const active = challengeRows.find((r) => r.status === 'active');
      if (active) {
        activeChallenge = {
          id: active.id,
          challengeId: active.challengeId,
          status: 'active',
          startedAt: active.startedAt,
          completedAt: active.completedAt,
          checkIns: active.checkIns ? JSON.parse(active.checkIns) : [],
        };
      }
    } catch {
      // Table may not exist yet
    }

    set({ readMomentIds: readIds, savedMomentIds: savedIds, adoptedSwapIds: adoptedIds, todaysMoment, yesterdaysMoment, activeChallenge });
  },

  getTodaysMoment: () => get().todaysMoment,

  markMomentRead: async (momentId: string) => {
    const now = new Date().toISOString();
    await db
      .insert(schema.moneyMomentState)
      .values({
        momentId,
        isRead: true,
        shownDate: now.split('T')[0],
        readAt: now,
      })
      .onConflictDoUpdate({
        target: schema.moneyMomentState.momentId,
        set: { isRead: true, readAt: now },
      });

    set((state) => {
      const readIds = new Set(state.readMomentIds);
      readIds.add(momentId);
      return { readMomentIds: readIds };
    });
  },

  toggleMomentSaved: async (momentId: string) => {
    const current = await db
      .select()
      .from(schema.moneyMomentState)
      .where(eq(schema.moneyMomentState.momentId, momentId));

    const isSaved = current[0]?.isSaved ?? false;
    const newSaved = !isSaved;

    await db
      .insert(schema.moneyMomentState)
      .values({ momentId, isSaved: newSaved })
      .onConflictDoUpdate({
        target: schema.moneyMomentState.momentId,
        set: { isSaved: newSaved },
      });

    set((state) => {
      const savedIds = new Set(state.savedMomentIds);
      if (newSaved) savedIds.add(momentId);
      else savedIds.delete(momentId);
      return { savedMomentIds: savedIds };
    });
  },

  adoptSwap: async (swapId: string) => {
    await db
      .insert(schema.smartSwapState)
      .values({
        swapId,
        isAdopted: true,
        adoptedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.smartSwapState.swapId,
        set: { isAdopted: true, adoptedAt: new Date().toISOString() },
      });

    set((state) => {
      const ids = new Set(state.adoptedSwapIds);
      ids.add(swapId);
      return { adoptedSwapIds: ids };
    });
  },

  dismissSwap: (swapId: string) => {
    // Remove from the visible swaps list in state
    set((state) => ({
      swaps: state.swaps.filter((s) => s.id !== swapId),
    }));
  },

  startChallenge: async (challengeId: string) => {
    const existing = get().activeChallenge;
    if (existing && existing.status === 'active') return; // Already have an active challenge

    const challenge = get().challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const id = uuid();
    const now = new Date().toISOString();
    const checkIns = new Array(challenge.checkInCount).fill(false);

    await db.insert(schema.challengeState).values({
      id,
      challengeId,
      status: 'active',
      startedAt: now,
      checkIns: JSON.stringify(checkIns),
    });

    set({
      activeChallenge: {
        id,
        challengeId,
        status: 'active',
        startedAt: now,
        completedAt: null,
        checkIns,
      },
    });
  },

  checkInChallenge: async (checkInIndex: number) => {
    const active = get().activeChallenge;
    if (!active || active.status !== 'active') return false;

    const newCheckIns = [...active.checkIns];
    newCheckIns[checkInIndex] = true;

    const allComplete = newCheckIns.every(Boolean);
    const newStatus = allComplete ? 'completed' : 'active';
    const completedAt = allComplete ? new Date().toISOString() : null;

    await db
      .update(schema.challengeState)
      .set({
        checkIns: JSON.stringify(newCheckIns),
        status: newStatus,
        completedAt,
      })
      .where(eq(schema.challengeState.id, active.id));

    set({
      activeChallenge: {
        ...active,
        checkIns: newCheckIns,
        status: newStatus,
        completedAt,
      },
    });

    return allComplete;
  },

  abandonChallenge: async () => {
    const active = get().activeChallenge;
    if (!active) return;

    await db
      .update(schema.challengeState)
      .set({ status: 'failed' })
      .where(eq(schema.challengeState.id, active.id));

    set({ activeChallenge: null });
  },
}));
