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
      <ScrollView className="flex-1" contentContainerClassName="pb-6" showsVerticalScrollIndicator={false}>
        {/* Greeting Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-warmgrey text-sm">{getGreeting()}</Text>
              <Text className="text-charcoal text-2xl font-bold">{name || 'Friend'}</Text>
            </View>
            <View className="flex-row items-center bg-white rounded-full px-3 py-1.5">
              <Text className="text-base mr-1">🔥</Text>
              <Text className="text-charcoal font-semibold">{currentStreak}</Text>
              <Text className="text-warmgrey text-xs ml-1">day streak</Text>
            </View>
          </View>
        </View>

        {/* Welcome Banner */}
        {showWelcome && (
          <View className="px-5 mt-3">
            <Card className="bg-coral-light border-l-4 border-l-coral">
              <View className="flex-row items-start">
                <View className="flex-1">
                  <Text className="text-charcoal text-base font-bold mb-1">Welcome to MumVest! 🎉</Text>
                  <Text className="text-warmgrey text-sm">
                    Small steps lead to big confidence. Start by setting a goal, reading today's money moment, or trying a smart swap.
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowWelcome(false)} className="ml-2">
                  <Ionicons name="close" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Streak Broken Encouragement */}
        {streakBroken && !showWelcome && (
          <View className="px-5 mt-3">
            <Card className="bg-amber-light border-l-4 border-l-amber">
              <View className="flex-row items-start">
                <Text className="text-2xl mr-3">💪</Text>
                <View className="flex-1">
                  <Text className="text-charcoal text-base font-bold mb-1">Welcome Back!</Text>
                  <Text className="text-warmgrey text-sm">
                    Every expert was once a beginner. Your best streak was {longestStreak} days — let's beat it! Start fresh today.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Today's Money Moment */}
        {todaysMoment && (
          <View className="px-5 mt-4">
            <Card
              onPress={() => router.push(`/money-moment/${todaysMoment.id}`)}
              className={`border-l-4 ${isMomentRead ? 'border-l-teal' : 'border-l-coral'}`}
            >
              <View className="flex-row items-start">
                <Text className="text-2xl mr-3">💡</Text>
                <View className="flex-1">
                  <Text className="text-xs text-coral font-semibold mb-1">
                    {isMomentRead ? '✓ READ' : "TODAY'S MONEY MOMENT"}
                  </Text>
                  <Text className="text-charcoal text-base font-semibold mb-1">
                    {todaysMoment.title}
                  </Text>
                  <Text className="text-warmgrey text-sm" numberOfLines={2}>
                    {todaysMoment.summary}
                  </Text>
                  {todaysMoment.potentialMonthlySaving > 0 && (
                    <Text className="text-savings text-xs font-semibold mt-2">
                      Potential saving: {formatCurrency(todaysMoment.potentialMonthlySaving, currency)}/month
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Missed Yesterday */}
        {missedYesterday && !isMomentRead && (
          <View className="px-5 mt-2">
            <TouchableOpacity
              onPress={() => router.push(`/money-moment/${yesterdaysMoment.id}`)}
              className="bg-amber-light rounded-xl px-4 py-3 flex-row items-center"
            >
              <Text className="text-amber text-sm flex-1">
                You missed yesterday's tip: <Text className="font-semibold">{yesterdaysMoment.title}</Text>
              </Text>
              <Text className="text-amber text-xs font-semibold">Catch up →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View All Moments Link */}
        {todaysMoment && (
          <TouchableOpacity
            onPress={() => router.push('/money-moment/archive')}
            className="px-5 mt-2"
          >
            <Text className="text-coral text-sm font-semibold">View all Money Moments →</Text>
          </TouchableOpacity>
        )}

        {/* Goals Strip */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <Text className="text-charcoal text-lg font-bold">Your Goals</Text>
            <TouchableOpacity onPress={() => router.push('/goal/create')} accessibilityLabel="Add new goal">
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <View className="px-5">
              <Card onPress={() => router.push('/goal/create')} className="items-center py-8">
                <Text className="text-4xl mb-2">🎯</Text>
                <Text className="text-charcoal text-base font-semibold mb-1">Set Your First Goal</Text>
                <Text className="text-warmgrey text-sm text-center">
                  Start saving for something that matters to your family
                </Text>
              </Card>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-5 gap-3"
            >
              {goals.map((goal) => {
                const progress = getGoalProgress(goal.id);
                return (
                  <Card
                    key={goal.id}
                    onPress={() => router.push(`/goal/${goal.id}`)}
                    className="w-44"
                  >
                    <Text className="text-2xl mb-2">{goal.emoji}</Text>
                    <Text className="text-charcoal text-sm font-semibold mb-1" numberOfLines={1}>
                      {goal.name}
                    </Text>
                    <Text className="text-coral text-base font-bold">
                      {formatCurrency(progress.saved, currency)}
                    </Text>
                    <Text className="text-warmgrey text-xs mb-2">
                      of {formatCurrency(progress.target, currency)}
                    </Text>
                    <ProgressBar progress={progress.percentage} />
                  </Card>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Weekly Summary */}
        <View className="px-5 mt-6">
          <Card onPress={() => router.push('/savings-breakdown')}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-warmgrey text-xs font-semibold mb-1">THIS WEEK</Text>
                <Text className="text-charcoal text-2xl font-bold">
                  {formatCurrency(weeklySummary.totalSaved, currency)}
                </Text>
                <Text className="text-warmgrey text-sm">
                  {weeklySummary.entryCount} {weeklySummary.entryCount === 1 ? 'entry' : 'entries'}
                </Text>
              </View>
              <View className="items-end">
                {weeklySummary.comparedToLastWeek > 0 && (
                  <View className="flex-row items-center px-2 py-1 rounded-full bg-savings-light">
                    <Ionicons name="arrow-up" size={12} color={colors.success} />
                    <Text className="text-xs font-semibold ml-1 text-savings">
                      {Math.round(weeklySummary.comparedToLastWeek)}% more!
                    </Text>
                  </View>
                )}
                {weeklySummary.comparedToLastWeek < 0 && (
                  <Text className="text-warmgrey text-xs text-right max-w-[120px]">
                    Every dollar counts
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </View>
          </Card>
        </View>

        {/* Active Challenge / Challenge CTA */}
        <View className="px-5 mt-6">
          {activeChallengeInfo ? (
            <Card
              onPress={() => router.push(`/challenge/${activeChallengeInfo.id}`)}
              className="border-l-4 border-l-amber"
            >
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-amber text-xs font-semibold mb-1">ACTIVE CHALLENGE</Text>
                  <Text className="text-charcoal text-base font-semibold">{activeChallengeInfo.name}</Text>
                  <Text className="text-warmgrey text-sm">
                    {checkedCount}/{activeChallengeInfo.checkInCount} check-ins done
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </Card>
          ) : (
            <Card onPress={() => router.push('/challenge/')}>
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🏋️</Text>
                <View className="flex-1">
                  <Text className="text-charcoal text-base font-semibold">Try a Challenge</Text>
                  <Text className="text-warmgrey text-sm">Push yourself with fun money challenges</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-5 mt-6">
          <Text className="text-charcoal text-lg font-bold mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/log-savings')}
              className="flex-1 bg-coral rounded-2xl py-4 items-center"
              activeOpacity={0.8}
              accessibilityLabel="Log savings"
              accessibilityRole="button"
            >
              <Text className="text-2xl mb-1">💰</Text>
              <Text className="text-white text-sm font-semibold">Log Savings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/learn')}
              className="flex-1 bg-teal rounded-2xl py-4 items-center"
              activeOpacity={0.8}
              accessibilityLabel="Go to lessons"
              accessibilityRole="button"
            >
              <Text className="text-2xl mb-1">📚</Text>
              <Text className="text-white text-sm font-semibold">Learn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/smart-swap/index')}
              className="flex-1 bg-amber rounded-2xl py-4 items-center"
              activeOpacity={0.8}
              accessibilityLabel="Browse smart swaps"
              accessibilityRole="button"
            >
              <Text className="text-2xl mb-1">🔄</Text>
              <Text className="text-white text-sm font-semibold">Swaps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
