export interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number;
  checkInCount: number;
  checkInLabels: string[];
  badgeReward: string;
  estimatedSaving: number;
  isPremium: boolean;
}

export interface ChallengeState {
  id: string;
  challengeId: string;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt: string | null;
  checkIns: boolean[];
}
