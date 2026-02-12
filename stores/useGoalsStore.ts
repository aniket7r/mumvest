import { create } from 'zustand';
import { db, schema } from '../db/client';
import { eq, and, desc, gte } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import type { Goal, CreateGoalInput, SavingsEntry, CreateSavingsInput, WeeklySummary } from '../types';
import { getStartOfWeek, daysBetween, addDays } from '../utils/dates';

interface GoalsState {
  goals: Goal[];
  entries: SavingsEntry[];
  isLoading: boolean;

  loadGoals: () => Promise<void>;
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  archiveGoal: (id: string) => Promise<void>;
  logSavings: (input: CreateSavingsInput) => Promise<SavingsEntry>;
  updateSavingsEntry: (id: string, amount: number) => Promise<void>;
  deleteSavingsEntry: (id: string) => Promise<void>;
  getGoalEntries: (goalId: string) => SavingsEntry[];
  getGoalProgress: (goalId: string) => { saved: number; target: number; percentage: number };
  getWeeklySummary: () => WeeklySummary;
  getTotalSaved: () => number;
  getProjectedCompletion: (goalId: string) => Date | null;
  canCreateGoal: (isPro: boolean) => boolean;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  entries: [],
  isLoading: true,

  loadGoals: async () => {
    const goalsData = await db.select().from(schema.goals).where(eq(schema.goals.isArchived, false));
    const entriesData = await db.select().from(schema.savingsEntries).orderBy(desc(schema.savingsEntries.createdAt));

    const mappedGoals: Goal[] = goalsData.map((g) => ({
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      type: g.type as Goal['type'],
      targetAmount: g.targetAmount,
      targetDate: g.targetDate,
      reminderFrequency: g.reminderFrequency as Goal['reminderFrequency'],
      reminderDay: g.reminderDay,
      isArchived: g.isArchived,
      isCompleted: g.isCompleted,
      completedAt: g.completedAt,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));

    const mappedEntries: SavingsEntry[] = entriesData.map((e) => ({
      id: e.id,
      goalId: e.goalId,
      amount: e.amount,
      method: e.method,
      note: e.note,
      createdAt: e.createdAt,
    }));

    set({ goals: mappedGoals, entries: mappedEntries, isLoading: false });
  },

  createGoal: async (input: CreateGoalInput) => {
    const id = uuid();
    const now = new Date().toISOString();
    const goal: Goal = {
      id,
      name: input.name,
      emoji: input.emoji,
      type: input.type,
      targetAmount: input.targetAmount,
      targetDate: input.targetDate || null,
      reminderFrequency: input.reminderFrequency || 'weekly',
      reminderDay: input.reminderDay || null,
      isArchived: false,
      isCompleted: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(schema.goals).values({
      id: goal.id,
      name: goal.name,
      emoji: goal.emoji,
      type: goal.type,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate,
      reminderFrequency: goal.reminderFrequency,
      reminderDay: goal.reminderDay,
    });

    set((state) => ({ goals: [...state.goals, goal] }));
    return goal;
  },

  updateGoal: async (id, updates) => {
    await db.update(schema.goals).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(schema.goals.id, id));
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  deleteGoal: async (id) => {
    await db.delete(schema.goals).where(eq(schema.goals.id, id));
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
      entries: state.entries.filter((e) => e.goalId !== id),
    }));
  },

  archiveGoal: async (id) => {
    await db.update(schema.goals).set({ isArchived: true }).where(eq(schema.goals.id, id));
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
  },

  logSavings: async (input: CreateSavingsInput) => {
    const id = uuid();
    const entry: SavingsEntry = {
      id,
      goalId: input.goalId,
      amount: input.amount,
      method: input.method || null,
      note: input.note || null,
      createdAt: new Date().toISOString(),
    };

    await db.insert(schema.savingsEntries).values({
      id: entry.id,
      goalId: entry.goalId,
      amount: entry.amount,
      method: entry.method,
      note: entry.note,
    });

    set((state) => ({ entries: [entry, ...state.entries] }));

    // Check if goal is now completed
    const progress = get().getGoalProgress(input.goalId);
    if (progress.percentage >= 100) {
      await get().updateGoal(input.goalId, {
        isCompleted: true,
        completedAt: new Date().toISOString(),
      });
    }

    return entry;
  },

  updateSavingsEntry: async (id: string, amount: number) => {
    await db.update(schema.savingsEntries).set({ amount }).where(eq(schema.savingsEntries.id, id));
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, amount } : e)),
    }));
  },

  deleteSavingsEntry: async (id) => {
    await db.delete(schema.savingsEntries).where(eq(schema.savingsEntries.id, id));
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
  },

  getGoalEntries: (goalId) => {
    return get().entries.filter((e) => e.goalId === goalId);
  },

  getGoalProgress: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return { saved: 0, target: 0, percentage: 0 };
    const saved = get()
      .entries.filter((e) => e.goalId === goalId)
      .reduce((sum, e) => sum + e.amount, 0);
    const percentage = Math.min(100, (saved / goal.targetAmount) * 100);
    return { saved, target: goal.targetAmount, percentage };
  },

  getWeeklySummary: () => {
    const weekStart = getStartOfWeek().toISOString();
    const weekEntries = get().entries.filter((e) => e.createdAt >= weekStart);
    const totalSaved = weekEntries.reduce((sum, e) => sum + e.amount, 0);

    // Find top goal
    const goalCounts: Record<string, number> = {};
    weekEntries.forEach((e) => {
      goalCounts[e.goalId] = (goalCounts[e.goalId] || 0) + e.amount;
    });
    const topGoalId = Object.entries(goalCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
    const topGoal = get().goals.find((g) => g.id === topGoalId)?.name || null;

    // Last week comparison
    const lastWeekStart = addDays(getStartOfWeek(), -7).toISOString();
    const lastWeekEntries = get().entries.filter(
      (e) => e.createdAt >= lastWeekStart && e.createdAt < weekStart
    );
    const lastWeekTotal = lastWeekEntries.reduce((sum, e) => sum + e.amount, 0);
    const comparedToLastWeek = lastWeekTotal > 0 ? ((totalSaved - lastWeekTotal) / lastWeekTotal) * 100 : 0;

    return {
      totalSaved,
      entryCount: weekEntries.length,
      topGoal,
      comparedToLastWeek,
    };
  },

  getTotalSaved: () => {
    return get().entries.reduce((sum, e) => sum + e.amount, 0);
  },

  canCreateGoal: (isPro) => {
    if (isPro) return true;
    const activeGoals = get().goals.filter((g) => !g.isArchived && !g.isCompleted);
    return activeGoals.length < 2;
  },

  getProjectedCompletion: (goalId) => {
    const goalEntries = get().getGoalEntries(goalId);
    if (goalEntries.length < 2) return null;

    const { saved, target } = get().getGoalProgress(goalId);
    const remaining = target - saved;
    if (remaining <= 0) return null;

    const oldest = goalEntries[goalEntries.length - 1];
    const days = daysBetween(new Date(oldest.createdAt), new Date());
    if (days === 0) return null;

    const dailyRate = saved / days;
    const daysToComplete = remaining / dailyRate;
    return addDays(new Date(), Math.ceil(daysToComplete));
  },
}));
