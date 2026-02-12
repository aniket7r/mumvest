export interface SavingsEntry {
  id: string;
  goalId: string;
  amount: number;
  method: string | null;
  note: string | null;
  createdAt: string;
}

export interface CreateSavingsInput {
  goalId: string;
  amount: number;
  method?: string;
  note?: string;
}

export interface WeeklySummary {
  totalSaved: number;
  entryCount: number;
  topGoal: string | null;
  comparedToLastWeek: number;
}

export const SAVINGS_METHODS = [
  { id: 'cooked_at_home', label: 'Cooked at home', emoji: '🍳' },
  { id: 'cheaper_alternative', label: 'Cheaper alternative', emoji: '💡' },
  { id: 'skipped_purchase', label: 'Skipped a purchase', emoji: '🚫' },
  { id: 'found_deal', label: 'Found a deal', emoji: '🏷️' },
  { id: 'cancelled_subscription', label: 'Cancelled subscription', emoji: '📵' },
  { id: 'side_income', label: 'Side income', emoji: '💪' },
  { id: 'other', label: 'Other', emoji: '✨' },
] as const;
