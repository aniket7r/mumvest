export interface Goal {
  id: string;
  name: string;
  emoji: string;
  type: GoalType;
  targetAmount: number;
  targetDate: string | null;
  reminderFrequency: ReminderFrequency;
  reminderDay: string | null;
  isArchived: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GoalType =
  | 'holiday'
  | 'emergency'
  | 'education'
  | 'home'
  | 'car'
  | 'baby'
  | 'christmas'
  | 'custom';

export type ReminderFrequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly';

export interface CreateGoalInput {
  name: string;
  emoji: string;
  type: GoalType;
  targetAmount: number;
  targetDate?: string;
  reminderFrequency?: ReminderFrequency;
  reminderDay?: string;
}

export interface GoalProgress {
  saved: number;
  target: number;
  percentage: number;
}

export const GOAL_PRESETS: { type: GoalType; emoji: string; label: string }[] = [
  { type: 'holiday', emoji: '✈️', label: 'Holiday Fund' },
  { type: 'emergency', emoji: '🛡️', label: 'Emergency Fund' },
  { type: 'education', emoji: '📚', label: 'Education' },
  { type: 'home', emoji: '🏠', label: 'Home Deposit' },
  { type: 'car', emoji: '🚗', label: 'Car Fund' },
  { type: 'baby', emoji: '👶', label: 'Baby Fund' },
  { type: 'christmas', emoji: '🎄', label: 'Christmas Fund' },
  { type: 'custom', emoji: '🎯', label: 'Custom Goal' },
];
