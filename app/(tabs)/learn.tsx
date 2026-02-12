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
      db.select().from(schema.lessonProgress).then((rows) => {
        const ids = new Set(rows.filter((r) => r.isCompleted).map((r) => r.lessonId));
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
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-charcoal text-2xl font-bold">Learn</Text>
            <View className="flex-row items-center bg-amber-light rounded-full px-3 py-1.5">
              <Text className="text-amber font-bold text-sm">{totalXP} XP</Text>
            </View>
          </View>
          <Text className="text-warmgrey text-sm mt-1">
            Bite-sized money lessons — 5 minutes each
          </Text>
        </View>

        {/* All Complete Banner */}
        {completedLessonIds.size >= ALL_LESSONS.length && (
          <View className="px-5 mt-4">
            <View className="bg-savings-light rounded-2xl p-6 items-center">
              <Text className="text-4xl mb-2">🎓</Text>
              <Text className="text-charcoal text-lg font-bold mb-1">You're a MumVest Graduate!</Text>
              <Text className="text-warmgrey text-sm text-center">
                You've completed every lesson. Your financial confidence is inspiring!
              </Text>
            </View>
          </View>
        )}

        {/* Level Map */}
        <View className="px-5 mt-4 pb-8">
          {LEVELS.map((level, levelIndex) => (
            <View key={level.level} className="mb-6">
              {/* Level Header */}
              <View className="flex-row items-center mb-4">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: level.color + '20' }}
                >
                  <Text className="text-xl">{level.emoji}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-charcoal text-lg font-bold">
                      Level {level.level}: {level.title}
                    </Text>
                    {level.isPremium && !isPro && (
                      <View className="ml-2 bg-amber rounded-full px-2 py-0.5">
                        <Text className="text-white text-xs font-bold">PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-warmgrey text-sm">{level.description}</Text>
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
                    className={`flex-row items-center bg-white rounded-xl px-4 py-3.5 mb-2 border ${
                      isCurrent ? 'border-coral' : 'border-border'
                    } ${isLocked ? 'opacity-60' : ''}`}
                    activeOpacity={0.7}
                  >
                    {/* Lesson Node */}
                    {isCurrent ? (
                      <MotiView
                        from={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        transition={{ type: 'timing', duration: 1000, loop: true }}
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: level.color + '20' }}
                      >
                        <Text className="text-sm font-bold" style={{ color: level.color }}>
                          {lessonIndex + 1}
                        </Text>
                      </MotiView>
                    ) : (
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: isLocked ? colors.border : level.color + '20' }}
                    >
                      {isLocked ? (
                        <Ionicons name="lock-closed" size={14} color={colors.textTertiary} />
                      ) : isCompleted ? (
                        <Ionicons name="checkmark" size={16} color={colors.success} />
                      ) : (
                        <Text className="text-sm font-bold" style={{ color: level.color }}>
                          {lessonIndex + 1}
                        </Text>
                      )}
                    </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-charcoal text-sm font-semibold">{lesson.title}</Text>
                      <Text className="text-warmgrey text-xs">
                        {lesson.minutes} min {isTeaser ? '· Free preview' : ''}
                      </Text>
                    </View>
                    <Ionicons
                      name={isLocked ? 'lock-closed' : 'chevron-forward'}
                      size={16}
                      color={colors.textTertiary}
                    />
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
