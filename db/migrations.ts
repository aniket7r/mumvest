import { db } from './client';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      currency TEXT NOT NULL DEFAULT 'USD',
      financial_situation TEXT,
      notification_time TEXT NOT NULL DEFAULT '08:00',
      notification_enabled INTEGER NOT NULL DEFAULT 1,
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      type TEXT NOT NULL,
      target_amount REAL NOT NULL,
      target_date TEXT,
      reminder_frequency TEXT NOT NULL DEFAULT 'weekly',
      reminder_day TEXT,
      is_archived INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS savings_entries (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      method TEXT,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      lesson_id TEXT PRIMARY KEY,
      level INTEGER NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      exercise_data TEXT,
      xp_earned INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS money_moment_state (
      moment_id TEXT PRIMARY KEY,
      is_read INTEGER NOT NULL DEFAULT 0,
      is_saved INTEGER NOT NULL DEFAULT 0,
      is_helpful INTEGER,
      shown_date TEXT,
      read_at TEXT
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS smart_swap_state (
      swap_id TEXT PRIMARY KEY,
      is_adopted INTEGER NOT NULL DEFAULT 0,
      adopted_at TEXT,
      follow_up_sent INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS challenge_state (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      check_ins TEXT
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS badges (
      badge_id TEXT PRIMARY KEY,
      is_earned INTEGER NOT NULL DEFAULT 0,
      earned_at TEXT
    )
  `);
}
