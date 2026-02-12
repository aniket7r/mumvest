export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

export interface BadgeState {
  badgeId: string;
  isEarned: boolean;
  earnedAt: string | null;
}
