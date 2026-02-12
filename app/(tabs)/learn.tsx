import { useState, useCallback, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { colors } from '../../theme/colors';
import { LESSONS_BY_LEVEL, ALL_LESSONS } from '../../content/lessons';
import { db, schema } from '../../db/client';

const LEVEL_META: Record<number, { title: string; description: string; emoji: string; color: string; isPremium?: boolean }> = {
  1: { title: 'Money Basics', description: 'Build your foundation', emoji: '🌱', color: colors.success },
  2: { title: 'Smart Saving', description: 'Build your safety net', emoji: '💪', color: colors.primary },
  3: { title: 'Beating Debt', description: 'Take control of debt', emoji: '🎯', color: colors.accent, isPremium: true },
  4: { title: 'Investing 101', description: 'Start growing your money', emoji: '📈', color: '#6C5CE7', isPremium: true },
  5: { title: 'Growing Wealth', description: 'Long-term financial freedom', emoji: '🚀', color: '#00B894', isPremium: true },
};

const LEVELS = Object.entries(LESSONS_BY_LEVEL).map(([levelNum, lessons]) => {
  const level = Number(levelNum);
  const meta = LEVEL_META[level] || { title: `Level ${level}`, description: '', emoji: '📚', color: colors.primary };
  return {
    level,
    ...meta,
    lessons: lessons.map((l) => ({ id: l.id, title: l.title, minutes: l.readTimeMinutes, isPremium: l.isPremium })),
  };
}).sort((a, b) => a.level - b.level);

export default function LearnScreen() {
  const router = useRouter();
  const isPro = useSubscriptionStore((s) => s.isPro);
  const totalXP = useGamificationStore((s) => s.totalXP);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      db.select().from(schema.lessonProgress).then((rows: any[]) => {
        const ids = new Set<string>(rows.filter((r: any) => r.isCompleted).map((r: any) => r.lessonId));
        setCompletedLessonIds(ids);
      });
    }, [])
  );

  // Find the next lesson to tackle
  const nextLessonId = useMemo(() => {
    for (const level of LEVELS) {
      for (const lesson of level.lessons) {
        if (!completedLessonIds.has(lesson.id) && (!lesson.isPremium || isPro)) {
          return lesson.id;
        }
      }
    }
    return null;
  }, [completedLessonIds, isPro]);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-5 pb-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-charcoal text-3xl font-bold">Learn</Text>
            <View className="flex-row items-center bg-amber-light rounded-full px-4 py-2 border border-amber/20">
              <Text className="text-amber font-bold text-base">⭐ {totalXP} XP</Text>
            </View>
          </View>
          <Text className="text-warmgrey text-base mt-2">
            Bite-sized money lessons — just 5 minutes each
          </Text>
        </View>

        {/* All Complete Banner */}
        {completedLessonIds.size >= ALL_LESSONS.length && (
          <View className="px-5 mt-6">
            <View className="bg-savings-light rounded-3xl p-8 items-center border border-savings/20">
              <Text className="text-5xl mb-3">🎓</Text>
              <Text className="text-charcoal text-xl font-bold mb-2">You're a MumVest Graduate!</Text>
              <Text className="text-warmgrey text-base text-center leading-6">
                You've completed every lesson. Your financial confidence is truly inspiring!
              </Text>
              <Text className="text-savings text-sm font-semibold mt-3">All {ALL_LESSONS.length} lessons complete</Text>
            </View>
          </View>
        )}

        {/* Level Map */}
        <View className="px-5 mt-6 pb-10">
          {LEVELS.map((level, levelIndex) => (
            <View key={level.level} className="mb-8">
              {/* Level Header */}
              <View className="flex-row items-center mb-4">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: level.color + '20' }}
                >
                  <Text className="text-2xl">{level.emoji}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-charcoal text-lg font-bold">
                      Level {level.level}: {level.title}
                    </Text>
                    {level.isPremium && !isPro && (
                      <View className="ml-2 bg-amber rounded-full px-3 py-1">
                        <Text className="text-white text-xs font-bold">PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-warmgrey text-sm mt-0.5">{level.description}</Text>
                </View>
              </View>

              {/* Lessons */}
              {level.lessons.map((lesson, lessonIndex) => {
                const isLocked = lesson.isPremium && !isPro;
                const isTeaser = level.isPremium && !isPro && lessonIndex === 0 && !lesson.isPremium;
                const isCompleted = completedLessonIds.has(lesson.id);
                const isCurrent = lesson.id === nextLessonId;

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() => {
                      if (isLocked) {
                        router.push('/paywall');
                      } else {
                        router.push(`/lesson/${lesson.id}`);
                      }
                    }}
                    className={`flex-row items-center rounded-2xl px-5 py-4 mb-3 border ${
                      isCurrent ? 'border-coral bg-coral-light/30' :
                      isCompleted ? 'border-savings/20 bg-savings-light' :
                      'border-border bg-white'
                    } ${isLocked ? 'opacity-50' : ''}`}
                    activeOpacity={0.7}
                  >
                    {/* Lesson Node */}
                    {isCurrent ? (
                      <MotiView
                        from={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 1.15, opacity: 1 }}
                        transition={{ type: 'timing', duration: 1200, loop: true }}
                        className="w-10 h-10 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: level.color + '30' }}
                      >
                        <Text className="text-base font-bold" style={{ color: level.color }}>
                          {lessonIndex + 1}
                        </Text>
                      </MotiView>
                    ) : (
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: isLocked ? colors.border : isCompleted ? '#27AE6020' : level.color + '20' }}
                    >
                      {isLocked ? (
                        <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
                      ) : isCompleted ? (
                        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                      ) : (
                        <Text className="text-base font-bold" style={{ color: level.color }}>
                          {lessonIndex + 1}
                        </Text>
                      )}
                    </View>
                    )}
                    <View className="flex-1">
                      <Text className={`text-base font-semibold ${isCompleted ? 'text-savings' : 'text-charcoal'}`}>{lesson.title}</Text>
                      <Text className="text-warmgrey text-sm mt-0.5">
                        {lesson.minutes} min {isTeaser ? '· Free preview' : ''}{isCompleted ? ' · Complete' : ''}
                      </Text>
                    </View>
                    {isCurrent ? (
                      <View className="bg-coral rounded-full px-3 py-1">
                        <Text className="text-white text-xs font-bold">START</Text>
                      </View>
                    ) : (
                      <Ionicons
                        name={isLocked ? 'lock-closed' : isCompleted ? 'checkmark-circle' : 'chevron-forward'}
                        size={18}
                        color={isCompleted ? colors.success : colors.textTertiary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
