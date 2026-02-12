// Lesson content registry - imports all lesson JSON files
import lesson_1_1 from './level-1/1-1-where-does-your-money-go.json';
import lesson_1_2 from './level-1/1-2-the-50-30-20-rule.json';
import lesson_1_3 from './level-1/1-3-your-first-budget.json';
import lesson_1_4 from './level-1/1-4-tracking-without-obsessing.json';
import lesson_1_5 from './level-1/1-5-money-mindset-reset.json';
import lesson_2_1 from './level-2/2-1-why-emergencies-happen.json';
import lesson_2_2 from './level-2/2-2-the-500-dollar-starter-fund.json';
import lesson_2_3 from './level-2/2-3-sinking-funds-explained.json';
import lesson_2_4 from './level-2/2-4-debt-snowball-vs-avalanche.json';
import lesson_2_5 from './level-2/2-5-automating-your-savings.json';
import lesson_3_1 from './level-3/3-1-making-your-money-grow.json';
import lesson_3_2 from './level-3/3-2-the-snowball-method.json';
import lesson_3_3 from './level-3/3-3-the-avalanche-method.json';
import lesson_3_4 from './level-3/3-4-negotiating-bills-down.json';
import lesson_3_5 from './level-3/3-5-your-debt-free-date.json';
import lesson_4_1 from './level-4/4-1-investing-isnt-gambling.json';
import lesson_4_2 from './level-4/4-2-compound-interest.json';
import lesson_4_3 from './level-4/4-3-index-funds.json';
import lesson_4_4 from './level-4/4-4-first-investment-account.json';
import lesson_4_5 from './level-4/4-5-how-much-to-invest.json';
import lesson_4_6 from './level-4/4-6-kids-investment-accounts.json';
import lesson_5_1 from './level-5/5-1-beyond-index-funds.json';
import lesson_5_2 from './level-5/5-2-retirement.json';
import lesson_5_3 from './level-5/5-3-rent-vs-buy.json';
import lesson_5_4 from './level-5/5-4-multiple-income-streams.json';
import lesson_5_5 from './level-5/5-5-five-year-plan.json';
import type { Lesson } from '../../types';

const ALL_LESSONS: Lesson[] = [
  lesson_1_1 as Lesson,
  lesson_1_2 as Lesson,
  lesson_1_3 as Lesson,
  lesson_1_4 as Lesson,
  lesson_1_5 as Lesson,
  lesson_2_1 as Lesson,
  lesson_2_2 as Lesson,
  lesson_2_3 as Lesson,
  lesson_2_4 as Lesson,
  lesson_2_5 as Lesson,
  lesson_3_1 as Lesson,
  lesson_3_2 as Lesson,
  lesson_3_3 as Lesson,
  lesson_3_4 as Lesson,
  lesson_3_5 as Lesson,
  lesson_4_1 as Lesson,
  lesson_4_2 as Lesson,
  lesson_4_3 as Lesson,
  lesson_4_4 as Lesson,
  lesson_4_5 as Lesson,
  lesson_4_6 as Lesson,
  lesson_5_1 as Lesson,
  lesson_5_2 as Lesson,
  lesson_5_3 as Lesson,
  lesson_5_4 as Lesson,
  lesson_5_5 as Lesson,
];

export const LESSONS_BY_ID: Record<string, Lesson> = {};
ALL_LESSONS.forEach((lesson) => {
  LESSONS_BY_ID[lesson.id] = lesson;
});

export const LESSONS_BY_LEVEL: Record<number, Lesson[]> = {};
ALL_LESSONS.forEach((lesson) => {
  if (!LESSONS_BY_LEVEL[lesson.level]) {
    LESSONS_BY_LEVEL[lesson.level] = [];
  }
  LESSONS_BY_LEVEL[lesson.level].push(lesson);
});

// Sort each level by order
Object.keys(LESSONS_BY_LEVEL).forEach((level) => {
  LESSONS_BY_LEVEL[Number(level)].sort((a, b) => a.order - b.order);
});

export { ALL_LESSONS };
