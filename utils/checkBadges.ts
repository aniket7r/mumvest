import { useGoalsStore } from '../stores/useGoalsStore';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useContentStore } from '../stores/useContentStore';
import { mmkv, KEYS } from '../stores/mmkv';
import { db, schema } from '../db/client';

/**
 * Gathers context from all stores and checks for newly earned badges.
 * Call this after any action that might qualify for a badge.
 * Returns the newly earned badge ID or null.
 */
export async function checkBadges(): Promise<string | null> {
  const { entries, goals } = useGoalsStore.getState();
  const { readMomentIds, adoptedSwapIds } = useContentStore.getState();
  const checkAndAwardBadges = useGamificationStore.getState().checkAndAwardBadges;

  // Count completed lessons
  let completedLessons = 0;
  try {
    const rows: any[] = await db.select().from(schema.lessonProgress);
    completedLessons = rows.filter((r: any) => r.isCompleted).length;
  } catch {
    // DB not ready
  }

  const totalSaved = entries.reduce((sum, e) => sum + e.amount, 0);
  const hasShared = mmkv.getBoolean(KEYS.HAS_SHARED);

  return checkAndAwardBadges({
    totalSaved,
    goalsCount: goals.length,
    completedLessons,
    adoptedSwaps: adoptedSwapIds.size,
    readMoments: readMomentIds.size,
    hasShared,
  });
}

/** Mark that the user has shared. Call after a successful Share action. */
export function markShared() {
  mmkv.set(KEYS.HAS_SHARED, true);
}
