import { mmkv, KEYS } from '../stores/mmkv';

/**
 * Tracks which content categories a user prefers based on their
 * "helpful" votes on money moments and swap adoptions.
 * Stores a JSON map of { category: score } in MMKV.
 */

type CategoryScores = Record<string, number>;

function getScores(): CategoryScores {
  const raw = mmkv.getString(KEYS.CATEGORY_PREFERENCES);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CategoryScores;
  } catch {
    return {};
  }
}

function saveScores(scores: CategoryScores) {
  mmkv.set(KEYS.CATEGORY_PREFERENCES, JSON.stringify(scores));
}

/** Increment a category's preference score (called on thumbs-up / adopt) */
export function boostCategory(category: string, amount = 1) {
  const scores = getScores();
  scores[category] = (scores[category] || 0) + amount;
  saveScores(scores);
}

/** Decrement a category's score (called on thumbs-down) */
export function penalizeCategory(category: string, amount = 0.5) {
  const scores = getScores();
  scores[category] = Math.max((scores[category] || 0) - amount, 0);
  saveScores(scores);
}

/** Get all category scores sorted by preference (highest first) */
export function getPreferredCategories(): [string, number][] {
  const scores = getScores();
  return Object.entries(scores).sort(([, a], [, b]) => b - a);
}

/**
 * Sort an array of items by category preference.
 * Items in preferred categories float to the top.
 * Items without scores keep their original order.
 */
export function sortByPreference<T extends { category: string }>(items: T[]): T[] {
  const scores = getScores();
  const hasScores = Object.keys(scores).length > 0;
  if (!hasScores) return items;

  return [...items].sort((a, b) => {
    const scoreA = scores[a.category] || 0;
    const scoreB = scores[b.category] || 0;
    return scoreB - scoreA;
  });
}
