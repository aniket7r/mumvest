import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../stores/useUserStore';
import { useGoalsStore } from '../../stores/useGoalsStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useContentStore } from '../../stores/useContentStore';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { getGreeting } from '../../utils/dates';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';
import { mmkv, KEYS } from '../../stores/mmkv';

export default function HomeScreen() {
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const currency = useUserStore((s) => s.currency);
  const { currentStreak, longestStreak } = useGamificationStore();

  // Detect if streak was broken (longest > current and current is low)
  const streakBroken = currentStreak <= 1 && longestStreak > 3;

  // Show welcome banner on first visit
  const [showWelcome, setShowWelcome] = useState(() => {
    if (mmkv.getBoolean('home.welcomeSeen')) return false;
    mmkv.set('home.welcomeSeen', true);
    return true;
  });
  const { goals } = useGoalsStore();
  const getGoalProgress = useGoalsStore((s) => s.getGoalProgress);
  const getWeeklySummary = useGoalsStore((s) => s.getWeeklySummary);
  const todaysMoment = useContentStore((s) => s.todaysMoment);
  const yesterdaysMoment = useContentStore((s) => s.yesterdaysMoment);
  const readMomentIds = useContentStore((s) => s.readMomentIds);
  const activeChallenge = useContentStore((s) => s.activeChallenge);
  const challengesList = useContentStore((s) => s.challenges);

  const weeklySummary = getWeeklySummary();
  const isMomentRead = todaysMoment ? readMomentIds.has(todaysMoment.id) : false;
  const missedYesterday = yesterdaysMoment && !readMomentIds.has(yesterdaysMoment.id);
  const activeChallengeInfo = activeChallenge?.status === 'active'
    ? challengesList.find((c) => c.id === activeChallenge.challengeId)
    : null;
  const checkedCount = activeChallenge?.checkIns.filter(Boolean).length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        {/* Greeting Header */}
        <View className="px-5 pt-5 pb-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-warmgrey text-sm font-body-medium tracking-wide">{getGreeting()}</Text>
              <Text className="text-charcoal text-3xl font-bold font-heading">{name || 'Friend'}</Text>
            </View>
            <View className="flex-row items-center bg-white rounded-full px-4 py-2 border border-border shadow-card">
              <Text className="text-lg mr-1.5">🔥</Text>
              <Text className="text-charcoal text-base font-bold">{currentStreak}</Text>
              <Text className="text-warmgrey text-xs ml-1">day streak</Text>
            </View>
          </View>
        </View>

        {/* Welcome Banner */}
        {showWelcome && (
          <View className="px-5 mt-4">
            <Card className="bg-coral-light border-l-4 border-l-coral p-6">
              <View className="flex-row items-start">
                <View className="flex-1">
                  <Text className="text-charcoal text-lg font-bold font-heading mb-1.5">Welcome to MumVest! 🎉</Text>
                  <Text className="text-warmgrey text-sm leading-5">
                    Small steps lead to big confidence. Start by setting a goal, reading today's money moment, or trying a smart swap.
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowWelcome(false)} className="ml-3 p-1">
                  <Ionicons name="close" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Streak Broken Encouragement */}
        {streakBroken && !showWelcome && (
          <View className="px-5 mt-4">
            <Card className="bg-amber-light border-l-4 border-l-amber p-6">
              <View className="flex-row items-start">
                <Text className="text-3xl mr-4">💪</Text>
                <View className="flex-1">
                  <Text className="text-charcoal text-lg font-bold font-heading mb-1.5">Welcome Back!</Text>
                  <Text className="text-warmgrey text-sm leading-5">
                    Every expert was once a beginner. Your best streak was {longestStreak} days — let's beat it! Start fresh today.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Today's Money Moment */}
        {todaysMoment && (
          <View className="px-5 mt-5">
            <Card
              onPress={() => router.push(`/money-moment/${todaysMoment.id}`)}
              className={`border-l-4 p-6 ${isMomentRead ? 'border-l-teal bg-teal-light/30' : 'border-l-coral bg-coral-light/30'}`}
            >
              <View className="flex-row items-start">
                <Text className="text-3xl mr-4">💡</Text>
                <View className="flex-1">
                  <Text className="text-xs text-coral font-bold tracking-wider mb-1.5">
                    {isMomentRead ? '✓ READ' : "TODAY'S MONEY MOMENT"}
                  </Text>
                  <Text className="text-charcoal text-lg font-bold font-heading mb-1.5">
                    {todaysMoment.title}
                  </Text>
                  <Text className="text-warmgrey text-sm leading-5" numberOfLines={2}>
                    {todaysMoment.summary}
                  </Text>
                  {todaysMoment.potentialMonthlySaving > 0 && (
                    <View className="flex-row items-center mt-3 bg-savings-light rounded-full px-3 py-1.5 self-start">
                      <Text className="text-savings text-xs font-bold">
                        Potential saving: {formatCurrency(todaysMoment.potentialMonthlySaving, currency)}/month
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Missed Yesterday */}
        {missedYesterday && !isMomentRead && (
          <View className="px-5 mt-3">
            <TouchableOpacity
              onPress={() => router.push(`/money-moment/${yesterdaysMoment.id}`)}
              className="bg-amber-light rounded-2xl px-5 py-3.5 flex-row items-center"
            >
              <Text className="text-amber text-sm flex-1 leading-5">
                You missed yesterday's tip: <Text className="font-bold">{yesterdaysMoment.title}</Text>
              </Text>
              <Text className="text-amber text-xs font-bold ml-2">Catch up →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View All Moments Link */}
        {todaysMoment && (
          <TouchableOpacity
            onPress={() => router.push('/money-moment/archive')}
            className="px-5 mt-3"
          >
            <Text className="text-coral text-sm font-bold">View all Money Moments →</Text>
          </TouchableOpacity>
        )}

        {/* Goals Strip */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between px-5 mb-4">
            <Text className="text-charcoal text-xl font-bold font-heading">Your Goals</Text>
            <TouchableOpacity onPress={() => router.push('/goal/create')} accessibilityLabel="Add new goal">
              <Ionicons name="add-circle" size={30} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <View className="px-5">
              <Card onPress={() => router.push('/goal/create')} className="items-center py-10">
                <Text className="text-5xl mb-3">🎯</Text>
                <Text className="text-charcoal text-lg font-bold font-heading mb-1.5">Set Your First Goal</Text>
                <Text className="text-warmgrey text-sm text-center leading-5">
                  Start saving for something that matters to your family
                </Text>
              </Card>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-5 gap-4"
            >
              {goals.map((goal) => {
                const progress = getGoalProgress(goal.id);
                return (
                  <Card
                    key={goal.id}
                    onPress={() => router.push(`/goal/${goal.id}`)}
                    className="w-52 p-5"
                  >
                    <Text className="text-3xl mb-3">{goal.emoji}</Text>
                    <Text className="text-charcoal text-base font-bold font-heading mb-1" numberOfLines={1}>
                      {goal.name}
                    </Text>
                    <Text className="text-coral text-lg font-bold">
                      {formatCurrency(progress.saved, currency)}
                    </Text>
                    <Text className="text-warmgrey text-xs mb-3">
                      of {formatCurrency(progress.target, currency)}
                    </Text>
                    <ProgressBar progress={progress.percentage} height={6} />
                  </Card>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Weekly Summary */}
        <View className="px-5 mt-8">
          <Text className="text-charcoal text-xl font-bold font-heading mb-4">This Week</Text>
          <Card onPress={() => router.push('/savings-breakdown')} className="p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-warmgrey text-xs font-bold tracking-wider mb-1.5">TOTAL SAVED</Text>
                <Text className="text-charcoal text-3xl font-bold font-heading">
                  {formatCurrency(weeklySummary.totalSaved, currency)}
                </Text>
                <Text className="text-warmgrey text-sm mt-1">
                  {weeklySummary.entryCount} {weeklySummary.entryCount === 1 ? 'entry' : 'entries'} this week
                </Text>
              </View>
              <View className="items-end ml-4">
                {weeklySummary.comparedToLastWeek > 0 && (
                  <View className="flex-row items-center px-3 py-1.5 rounded-full bg-savings-light mb-2">
                    <Ionicons name="arrow-up" size={14} color={colors.success} />
                    <Text className="text-sm font-bold ml-1 text-savings">
                      {Math.round(weeklySummary.comparedToLastWeek)}%
                    </Text>
                  </View>
                )}
                {weeklySummary.comparedToLastWeek < 0 && (
                  <Text className="text-warmgrey text-xs text-right max-w-[120px] mb-2">
                    Every dollar counts
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
              </View>
            </View>
          </Card>
        </View>

        {/* Active Challenge / Challenge CTA */}
        <View className="px-5 mt-8">
          {activeChallengeInfo ? (
            <Card
              onPress={() => router.push(`/challenge/${activeChallengeInfo.id}`)}
              className="border-l-4 border-l-amber p-6"
            >
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-amber text-xs font-bold tracking-wider mb-1.5">ACTIVE CHALLENGE</Text>
                  <Text className="text-charcoal text-lg font-bold font-heading">{activeChallengeInfo.name}</Text>
                  <Text className="text-warmgrey text-sm mt-1">
                    {checkedCount}/{activeChallengeInfo.checkInCount} check-ins done
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
              </View>
            </Card>
          ) : (
            <Card onPress={() => router.push('/challenge/')} className="p-6">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-4">🏋️</Text>
                <View className="flex-1">
                  <Text className="text-charcoal text-lg font-bold font-heading">Try a Challenge</Text>
                  <Text className="text-warmgrey text-sm mt-0.5">Push yourself with fun money challenges</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
              </View>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-8 mb-4">
          <Text className="text-charcoal text-xl font-bold font-heading mb-4">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/log-savings')}
              className="flex-1 bg-coral rounded-3xl py-5 items-center shadow-card"
              activeOpacity={0.8}
              accessibilityLabel="Log savings"
              accessibilityRole="button"
            >
              <Text className="text-3xl mb-2">💰</Text>
              <Text className="text-white text-sm font-bold">Log Savings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/learn')}
              className="flex-1 bg-teal rounded-3xl py-5 items-center shadow-card"
              activeOpacity={0.8}
              accessibilityLabel="Go to lessons"
              accessibilityRole="button"
            >
              <Text className="text-3xl mb-2">📚</Text>
              <Text className="text-white text-sm font-bold">Learn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/smart-swap' as any)}
              className="flex-1 bg-amber rounded-3xl py-5 items-center shadow-card"
              activeOpacity={0.8}
              accessibilityLabel="Browse smart swaps"
              accessibilityRole="button"
            >
              <Text className="text-3xl mb-2">🔄</Text>
              <Text className="text-white text-sm font-bold">Swaps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
