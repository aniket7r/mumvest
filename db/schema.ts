import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const userProfile = sqliteTable('user_profile', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  currency: text('currency').default('USD').notNull(),
  financialSituation: text('financial_situation'),
  notificationTime: text('notification_time').default('08:00').notNull(),
  notificationEnabled: integer('notification_enabled', { mode: 'boolean' }).default(true).notNull(),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  type: text('type').notNull(),
  targetAmount: real('target_amount').notNull(),
  targetDate: text('target_date'),
  reminderFrequency: text('reminder_frequency').default('weekly').notNull(),
  reminderDay: text('reminder_day'),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false).notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false).notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

export const savingsEntries = sqliteTable('savings_entries', {
  id: text('id').primaryKey(),
  goalId: text('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  method: text('method'),
  note: text('note'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

export const lessonProgress = sqliteTable('lesson_progress', {
  lessonId: text('lesson_id').primaryKey(),
  level: integer('level').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false).notNull(),
  exerciseData: text('exercise_data'),
  xpEarned: integer('xp_earned').default(0).notNull(),
  completedAt: text('completed_at'),
  startedAt: text('started_at').default(sql`(datetime('now'))`).notNull(),
});

export const moneyMomentState = sqliteTable('money_moment_state', {
  momentId: text('moment_id').primaryKey(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  isSaved: integer('is_saved', { mode: 'boolean' }).default(false).notNull(),
  isHelpful: integer('is_helpful', { mode: 'boolean' }),
  shownDate: text('shown_date'),
  readAt: text('read_at'),
});

export const smartSwapState = sqliteTable('smart_swap_state', {
  swapId: text('swap_id').primaryKey(),
  isAdopted: integer('is_adopted', { mode: 'boolean' }).default(false).notNull(),
  adoptedAt: text('adopted_at'),
  followUpSent: integer('follow_up_sent', { mode: 'boolean' }).default(false).notNull(),
});

export const challengeState = sqliteTable('challenge_state', {
  id: text('id').primaryKey(),
  challengeId: text('challenge_id').notNull(),
  status: text('status').default('active').notNull(),
  startedAt: text('started_at').default(sql`(datetime('now'))`).notNull(),
  completedAt: text('completed_at'),
  checkIns: text('check_ins'),
});

export const badges = sqliteTable('badges', {
  badgeId: text('badge_id').primaryKey(),
  isEarned: integer('is_earned', { mode: 'boolean' }).default(false).notNull(),
  earnedAt: text('earned_at'),
});
