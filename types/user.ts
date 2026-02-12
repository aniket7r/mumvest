export interface UserProfile {
  id: number;
  name: string | null;
  currency: string;
  financialSituation: string | null;
  notificationTime: string;
  notificationEnabled: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}

export type Currency = 'USD' | 'GBP' | 'EUR' | 'AUD';

export type FinancialSituation =
  | 'just_starting'
  | 'some_savings'
  | 'debt_focused'
  | 'growing_wealth';

export interface OnboardingSelections {
  name: string;
  situation: FinancialSituation;
  goalType: string;
  notificationTime: string;
  notificationsEnabled: boolean;
}
