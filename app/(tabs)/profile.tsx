import { useMemo, useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Share } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../../utils/haptics';
import { useUserStore } from '../../stores/useUserStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useGoalsStore } from '../../stores/useGoalsStore';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useContentStore } from '../../stores/useContentStore';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';
import { db, schema } from '../../db/client';
import { checkBadges, markShared } from '../../utils/checkBadges';

import badgeDefinitions from '../../content/badges.json';
import { ALL_LESSONS } from '../../content/lessons';

export default function ProfileScreen() {
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const currency = useUserStore((s) => s.currency);
  const memberSince = useUserStore((s) => s.memberSince);
  const { currentStreak, longestStreak, totalXP, independenceScore, earnedBadges } = useGamificationStore();
  const calculateIndependenceScore = useGamificationStore((s) => s.calculateIndependenceScore);
  const getTotalSaved = useGoalsStore((s) => s.getTotalSaved);
  const goals = useGoalsStore((s) => s.goals);
  const getGoalProgress = useGoalsStore((s) => s.getGoalProgress);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const adoptedSwapIds = useContentStore((s) => s.adoptedSwapIds);
  const entries = useGoalsStore((s) => s.entries);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);

  const totalSaved = getTotalSaved();

  // Recalculate independence score when profile is focused
  useFocusEffect(
    useCallback(() => {
      async function recalcScore() {
        let completedLessons = 0;
        try {
          const rows: any[] = await db.select().from(schema.lessonProgress);
          completedLessons = rows.filter((r: any) => r.isCompleted).length;
        } catch {}

        setLessonsCompleted(completedLessons);

        const goalsWithSavings = goals.filter((g) => {
          const p = getGoalProgress(g.id);
          return p.saved > 0;
        }).length;

        calculateIndependenceScore({
          completedLessons,
          goalsWithSavings,
          totalSaved,
          adoptedSwaps: adoptedSwapIds.size,
          earnedBadges: earnedBadges.length,
        });
      }
      recalcScore();
    }, [totalSaved, adoptedSwapIds.size, earnedBadges.length, goals.length])
  );
  const earnedBadgeIds = useMemo(() => new Set(earnedBadges.map((b) => b.id)), [earnedBadges]);

  const monthlySavings = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => {
      const key = e.createdAt.slice(0, 7);
      map[key] = (map[key] || 0) + e.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
      .map(([key, amount]) => ({
        label: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount,
      }));
  }, [entries]);

  const handleShareProgress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await Share.share({
        message: `I've saved ${formatCurrency(totalSaved, currency)} with MumVest! ${currentStreak} day streak and ${earnedBadges.length} badges earned. Small steps, big confidence!\n\nDownload MumVest and start your journey today!`,
      });
      if (result.action === Share.sharedAction) {
        markShared();
        checkBadges();
      }
    } catch (e) {
      // User cancelled
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="pb-8">
        {/* Header */}
        <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
          <Text className="text-charcoal text-3xl font-bold">Profile</Text>
          <TouchableOpacity
            onPress={() => router.push('/settings' as any)}
            className="w-10 h-10 rounded-full bg-white border border-border items-center justify-center"
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="px-5 mt-5">
          <Card className="items-center py-8">
            <View className="w-24 h-24 rounded-full bg-coral-light items-center justify-center mb-4 border-4 border-coral/20">
              <Text className="text-4xl">👩</Text>
            </View>
            <Text className="text-charcoal text-2xl font-bold">{name || 'Friend'}</Text>
            {memberSince && (
              <Text className="text-warmgrey text-sm mt-1.5">
                Member since {new Date(memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            )}
            <Text className="text-warmgrey text-sm mt-1">
              {lessonsCompleted}/{ALL_LESSONS.length} lessons completed
            </Text>
            {isPro && (
              <View className="bg-amber rounded-full px-4 py-1.5 mt-3 border border-amber/20">
                <Text className="text-white text-sm font-bold">PRO MEMBER</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Financial Independence Score */}
        <View className="px-5 mt-6">
          <Card className="items-center py-6">
            <Text className="text-warmgrey text-xs font-bold tracking-wider mb-4">FINANCIAL INDEPENDENCE SCORE</Text>
            <ProgressRing progress={independenceScore} size={120} strokeWidth={10} color={colors.primary}>
              <Text className="text-charcoal text-3xl font-bold">{independenceScore}</Text>
            </ProgressRing>
            <Text className="text-warmgrey text-base mt-4">
              {independenceScore < 25 ? 'Just getting started -- keep going!' :
               independenceScore < 50 ? 'Building momentum -- you got this!' :
               independenceScore < 75 ? 'Making great progress -- amazing!' :
               'Financial confidence champion!'}
            </Text>
          </Card>
        </View>

        {/* Stats Grid */}
        <View className="px-5 mt-6 flex-row gap-3">
          <Card className="flex-1 items-center py-5">
            <Text className="text-3xl mb-2">🔥</Text>
            <Text className="text-charcoal text-2xl font-bold">{currentStreak}</Text>
            <Text className="text-warmgrey text-sm mt-1">Day Streak</Text>
          </Card>
          <Card className="flex-1 items-center py-5">
            <Text className="text-3xl mb-2">💰</Text>
            <Text className="text-charcoal text-2xl font-bold">{formatCurrency(totalSaved, currency)}</Text>
            <Text className="text-warmgrey text-sm mt-1">Total Saved</Text>
          </Card>
          <Card className="flex-1 items-center py-5">
            <Text className="text-3xl mb-2">⭐</Text>
            <Text className="text-charcoal text-2xl font-bold">{totalXP}</Text>
            <Text className="text-warmgrey text-sm mt-1">XP Earned</Text>
          </Card>
        </View>

        {/* More Stats */}
        <View className="px-5 mt-4 flex-row gap-3">
          <Card className="flex-1 items-center py-4">
            <Text className="text-warmgrey text-sm mb-1">Longest Streak</Text>
            <Text className="text-charcoal text-xl font-bold">{longestStreak} days</Text>
          </Card>
          <Card className="flex-1 items-center py-4">
            <Text className="text-warmgrey text-sm mb-1">Swaps Adopted</Text>
            <Text className="text-charcoal text-xl font-bold">{adoptedSwapIds.size}</Text>
          </Card>
        </View>

        {/* Monthly Savings */}
        {monthlySavings.length > 0 && (
          <View className="px-5 mt-8">
            <Text className="text-charcoal text-xl font-bold mb-4">Monthly Savings</Text>
            <Card className="py-2">
              {monthlySavings.map((m, i) => (
                <View key={m.label} className={`flex-row items-center justify-between py-3 px-1 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <Text className="text-warmgrey text-base">{m.label}</Text>
                  <Text className="text-charcoal text-lg font-bold">{formatCurrency(m.amount, currency)}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Badges */}
        <View className="px-5 mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-charcoal text-xl font-bold">Badges</Text>
            <View className="bg-amber-light rounded-full px-3 py-1">
              <Text className="text-amber text-sm font-bold">{earnedBadges.length}/{badgeDefinitions.length}</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-4">
            {badgeDefinitions.map((badge) => {
              const isEarned = earnedBadgeIds.has(badge.id);
              return (
                <View
                  key={badge.id}
                  className={`w-20 items-center ${isEarned ? '' : 'opacity-25'}`}
                >
                  <View className={`w-14 h-14 rounded-full items-center justify-center mb-1.5 ${isEarned ? 'bg-amber-light border-2 border-amber/30' : 'bg-border'}`}>
                    <Text className="text-2xl">{badge.icon}</Text>
                  </View>
                  <Text className={`text-xs text-center ${isEarned ? 'text-charcoal font-semibold' : 'text-warmgrey'}`} numberOfLines={2}>{badge.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Insights */}
        <View className="px-5 mt-8">
          <Card onPress={() => router.push('/insights')} className="flex-row items-center py-5">
            <View className="w-12 h-12 rounded-full bg-amber-light items-center justify-center">
              <Ionicons name="bar-chart" size={24} color={colors.accent} />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-charcoal text-base font-bold">Savings Insights</Text>
              <Text className="text-warmgrey text-sm mt-0.5">Monthly trends, projections & more</Text>
            </View>
            {isPro ? (
              <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
            ) : (
              <View className="bg-coral rounded-full px-3 py-1">
                <Text className="text-white text-xs font-bold">PRO</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Share Progress */}
        <View className="px-5 mt-4">
          <Card onPress={handleShareProgress} className="bg-teal py-5">
            <View className="flex-row items-center justify-center">
              <Ionicons name="share-social" size={22} color="white" />
              <Text className="text-white text-lg font-bold ml-3">Share My Progress</Text>
            </View>
          </Card>
        </View>

        {/* Upgrade CTA */}
        {!isPro && (
          <View className="px-5 mt-8 mb-2">
            <Card
              onPress={() => router.push('/paywall')}
              className="bg-coral py-6"
            >
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold">Unlock Premium</Text>
                  <Text className="text-white/80 text-base mt-1">
                    All lessons, challenges & insights
                  </Text>
                </View>
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="arrow-forward" size={24} color="white" />
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
