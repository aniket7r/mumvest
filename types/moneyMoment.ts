export interface MoneyMoment {
  id: string;
  day: number;
  category: MomentCategory;
  title: string;
  summary: string;
  body: string;
  potentialMonthlySaving: number;
  readTimeSeconds: number;
  isRebeccaPick: boolean;
}

export type MomentCategory =
  | 'groceries'
  | 'subscriptions'
  | 'energy'
  | 'transport'
  | 'dining'
  | 'shopping'
  | 'kids'
  | 'mindset';

export interface MoneyMomentState {
  momentId: string;
  isRead: boolean;
  isSaved: boolean;
  isHelpful: boolean | null;
  shownDate: string;
  readAt: string | null;
}
