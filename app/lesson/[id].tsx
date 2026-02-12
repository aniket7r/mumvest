import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../../utils/haptics';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { Button } from '../../components/ui/Button';
import { CelebrationOverlay } from '../../components/ui/CelebrationOverlay';
import { colors } from '../../theme/colors';
import { LESSONS_BY_ID, LESSONS_BY_LEVEL } from '../../content/lessons';
import { db, schema } from '../../db/client';
import { checkBadges } from '../../utils/checkBadges';

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addXP = useGamificationStore((s) => s.addXP);
  const recordActivity = useGamificationStore((s) => s.recordActivity);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const lesson = LESSONS_BY_ID[id || ''] || LESSONS_BY_ID['1-1'];

  const handleComplete = async () => {
    addXP(lesson.xpReward);
    recordActivity();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save lesson progress to DB
    const now = new Date().toISOString();
    try {
      await db.insert(schema.lessonProgress).values({
        lessonId: lesson.id,
        level: lesson.level,
        isCompleted: true,
        xpEarned: lesson.xpReward,
        completedAt: now,
        startedAt: now,
      }).onConflictDoUpdate({
        target: schema.lessonProgress.lessonId,
        set: { isCompleted: true, completedAt: now, xpEarned: lesson.xpReward },
      });
    } catch (e) {
      console.warn('Save lesson progress error:', e);
    }

    checkBadges();

    // Check if this completes the level
    try {
      const levelLessons = LESSONS_BY_LEVEL[lesson.level] || [];
      const progress: any[] = await db.select().from(schema.lessonProgress);
      const completedIds = new Set<string>(progress.filter((p: any) => p.isCompleted).map((p: any) => p.lessonId));
      completedIds.add(lesson.id); // include current
      const allLevelDone = levelLessons.every((l) => completedIds.has(l.id));
      if (allLevelDone) {
        setLevelComplete(true);
      }
    } catch {}

    setIsComplete(true);
  };

  if (isComplete && levelComplete) {
    const LEVEL_NAMES: Record<number, string> = {
      1: 'Money Basics',
      2: 'Building Safety Nets',
      3: 'Beating Debt',
      4: 'Investing 101',
      5: 'Growing Your Wealth',
    };
    const showPaywall = lesson.level === 2 && !isPro;

    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-8">
        <CelebrationOverlay
          visible
          emoji="🏆"
          message={`Level ${lesson.level} Complete!`}
          subMessage={`You've finished ${LEVEL_NAMES[lesson.level] || 'this level'}!`}
        />
        <View className="absolute bottom-12 left-5 right-5">
          {showPaywall ? (
            <>
              <Text className="text-charcoal text-lg font-bold text-center mb-2">
                Ready for the next chapter?
              </Text>
              <Text className="text-warmgrey text-sm text-center mb-4">
                Unlock all levels to continue your journey
              </Text>
              <Button title="Unlock All Levels" onPress={() => { router.back(); router.push('/paywall'); }} />
              <TouchableOpacity onPress={() => router.back()} className="items-center mt-4 py-2">
                <Text className="text-warmgrey text-base">Maybe later</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Button title="Continue Learning" onPress={() => router.back()} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-8">
        <CelebrationOverlay
          visible
          emoji="🎓"
          message="Lesson Complete!"
          subMessage={`+${lesson.xpReward} XP earned`}
        />
        <View className="absolute bottom-12 left-5 right-5">
          <Text className="text-warmgrey text-sm text-center mb-4">Great work! Keep going.</Text>
          <Button title="Continue" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-5 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-lg font-bold flex-1" numberOfLines={1}>
          {lesson.title}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Lesson Title Hero */}
        <View className="mt-2 mb-4">
          <Text className="text-charcoal text-2xl font-bold">{lesson.title}</Text>
        </View>

        {lesson.sections.map((section, index) => (
          <View key={index} className="mb-5">
            {section.type === 'heading' && (
              <Text className="text-charcoal text-xl font-bold mt-4 mb-2">{section.content}</Text>
            )}
            {section.type === 'text' && (
              <Text className="text-charcoal text-base leading-7">{section.content}</Text>
            )}
            {section.type === 'exercise' && (
              <View className="bg-amber-light/50 rounded-2xl p-6 my-2 border border-amber-light">
                <View className="flex-row items-center mb-3">
                  <View className="bg-amber/20 rounded-full px-3 py-1">
                    <Text className="text-amber font-bold text-xs tracking-wider">
                      {section.exerciseType === 'checklist' ? 'CHECKLIST' : 'EXERCISE'}
                    </Text>
                  </View>
                </View>
                <Text className="text-charcoal text-base font-semibold mb-4">{section.prompt}</Text>
                {section.exerciseType === 'checklist' && section.options ? (
                  <View>
                    {section.options.map((option, optIdx) => {
                      const key = `${index}-${optIdx}`;
                      return (
                        <TouchableOpacity
                          key={key}
                          onPress={() => setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }))}
                          className={`flex-row items-center bg-white rounded-xl px-4 py-3.5 mb-2.5 border ${
                            checkedItems[key] ? 'border-teal' : 'border-transparent'
                          }`}
                        >
                          <Ionicons
                            name={checkedItems[key] ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={checkedItems[key] ? colors.secondary : colors.textTertiary}
                          />
                          <Text className={`text-base ml-3 flex-1 ${checkedItems[key] ? 'text-charcoal font-medium' : 'text-charcoal'}`}>{option}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    value={exerciseAnswers[index] || ''}
                    onChangeText={(text) => setExerciseAnswers((prev) => ({ ...prev, [index]: text }))}
                    placeholder="Type your answer..."
                    multiline
                    className="bg-white rounded-xl px-4 py-4 text-base text-charcoal min-h-[100px] border border-white"
                    placeholderTextColor="#BDC3C7"
                    textAlignVertical="top"
                    keyboardType={section.inputType === 'number' ? 'decimal-pad' : 'default'}
                  />
                )}
              </View>
            )}
            {section.type === 'takeaway' && (
              <View className="bg-teal/10 rounded-2xl p-6 my-2 border-l-4 border-l-teal">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="bulb" size={18} color={colors.secondary} />
                  <Text className="text-teal font-bold text-xs tracking-wider ml-2">KEY TAKEAWAY</Text>
                </View>
                <Text className="text-charcoal text-base font-semibold leading-6">{section.content}</Text>
              </View>
            )}
            {section.type === 'encouragement' && (
              <View className="bg-coral-light/40 rounded-2xl p-6 my-2 items-center">
                <Text className="text-coral text-base font-semibold text-center leading-6">{section.content}</Text>
              </View>
            )}
          </View>
        ))}

        <View className="my-8">
          <Button title="Complete Lesson" onPress={handleComplete} />
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
