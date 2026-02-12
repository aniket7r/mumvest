export interface Lesson {
  id: string;
  level: number;
  order: number;
  title: string;
  readTimeMinutes: number;
  isPremium: boolean;
  sections: LessonSection[];
  xpReward: number;
}

export type LessonSectionType = 'text' | 'heading' | 'exercise' | 'takeaway' | 'encouragement';

export interface LessonSection {
  type: LessonSectionType;
  content?: string;
  exerciseType?: 'reflection' | 'calculator' | 'checklist' | 'quiz';
  prompt?: string;
  inputType?: 'text' | 'number' | 'multiChoice';
  options?: string[];
}

export interface LessonProgress {
  lessonId: string;
  level: number;
  isCompleted: boolean;
  exerciseData: string | null;
  xpEarned: number;
  completedAt: string | null;
  startedAt: string;
}
