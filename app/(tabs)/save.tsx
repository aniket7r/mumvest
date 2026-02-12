import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../../utils/haptics';
import { useGoalsStore } from '../../stores/useGoalsStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useContentStore } from '../../stores/useContentStore';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/currency';
import { useUserStore } from '../../stores/useUserStore';
import { colors } from '../../theme/colors';
import { XP_REWARDS } from '../../utils/constants';
import { checkBadges } from '../../utils/checkBadges';

type TabType = 'goals' | 'swaps';

export default function SaveScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('goals');
  const { goals } = useGoalsStore();
  const getGoalProgress = useGoalsStore((s) => s.getGoalProgress);
  const getTotalSaved = useGoalsStore((s) => s.getTotalSaved);
  const currency = useUserStore((s) => s.currency);
  const { swaps } = useContentStore();
  const adoptedSwapIds = useContentStore((s) => s.adoptedSwapIds);
  const adoptSwap = useContentStore((s) => s.adoptSwap);
  const dismissSwap = useContentStore((s) => s.dismissSwap);
  const addXP = useGamificationStore((s) => s.addXP);
  const recordActivity = useGamificationStore((s) => s.recordActivity);

  const handleAdoptSwap = async (swapId: string) => {
    await adoptSwap(swapId);
    addXP(XP_REWARDS.SWAP_ADOPTED);
    recordActivity();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkBadges();
  };

  const totalSaved = getTotalSaved();
  const unadoptedSwaps = swaps.filter((s) => !adoptedSwapIds.has(s.id));
  const adoptedSwaps = swaps.filter((s) => adoptedSwapIds.has(s.id));
  const estimatedMonthlySavings = adoptedSwaps.reduce((sum, s) => sum + s.potentialMonthlySaving, 0);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-5 pb-3">
        <Text className="text-charcoal text-3xl font-bold font-heading">Save</Text>
      </View>

      {/* Tab Selector */}
      <View className="flex-row mx-5 mb-5 bg-white rounded-full p-1.5 border border-border shadow-card">
        <TouchableOpacity
          onPress={() => setActiveTab('goals')}
          className={`flex-1 py-3 rounded-full items-center ${
            activeTab === 'goals' ? 'bg-coral shadow-card' : ''
          }`}
        >
          <Text className={`font-bold text-sm ${
            activeTab === 'goals' ? 'text-white' : 'text-warmgrey'
          }`}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('swaps')}
          className={`flex-1 py-3 rounded-full items-center ${
            activeTab === 'swaps' ? 'bg-coral shadow-card' : ''
          }`}
        >
          <Text className={`font-bold text-sm ${
            activeTab === 'swaps' ? 'text-white' : 'text-warmgrey'
          }`}>Smart Swaps</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'goals' ? (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Total Saved Banner */}
          <Card className="mb-6 bg-coral items-center py-8 px-6">
            <Text className="text-white/70 text-xs font-bold tracking-wider mb-2">TOTAL SAVED</Text>
            <Text className="text-white text-4xl font-bold font-heading">
              {formatCurrency(totalSaved, currency)}
            </Text>
          </Card>

          {/* Goals List */}
          {goals.length === 0 ? (
            <EmptyState
              emoji="🎯"
              title="No Goals Yet"
              subtitle="Set your first savings goal and start tracking your progress. Even small goals add up!"
              actionLabel="Create a Goal"
              onAction={() => router.push('/goal/create')}
            />
          ) : (
            <>
              {goals.map((goal) => {
                const progress = getGoalProgress(goal.id);
                return (
                  <Card
                    key={goal.id}
                    onPress={() => router.push(`/goal/${goal.id}`)}
                    className="mb-4 flex-row items-center p-5"
                  >
                    <ProgressRing progress={progress.percentage} size={64} strokeWidth={5}>
                      <Text className="text-2xl">{goal.emoji}</Text>
                    </ProgressRing>
                    <View className="flex-1 ml-5">
                      <Text className="text-charcoal text-lg font-bold font-heading">{goal.name}</Text>
                      <Text className="text-warmgrey text-sm mt-0.5">
                        {formatCurrency(progress.saved, currency)} of {formatCurrency(progress.target, currency)}
                      </Text>
                      <ProgressBar progress={progress.percentage} height={5} className="mt-2.5" />
                    </View>
                    <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
                  </Card>
                );
              })}

              {/* Add Goal Button */}
              <TouchableOpacity
                onPress={() => router.push('/goal/create')}
                className="border-2 border-dashed border-border rounded-3xl py-8 items-center mb-8"
              >
                <Ionicons name="add-circle-outline" size={32} color={colors.textTertiary} />
                <Text className="text-warmgrey text-sm font-bold mt-2">Add a Goal</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Swaps Summary */}
          {adoptedSwaps.length > 0 && (
            <Card className="mb-6 bg-teal py-8 px-6 items-center">
              <Text className="text-white/70 text-xs font-bold tracking-wider mb-2">ESTIMATED MONTHLY SAVINGS</Text>
              <Text className="text-white text-3xl font-bold font-heading">
                {formatCurrency(estimatedMonthlySavings, currency)}/mo
              </Text>
              <Text className="text-white/70 text-sm mt-2">
                From {adoptedSwaps.length} active swap{adoptedSwaps.length !== 1 ? 's' : ''}
              </Text>
            </Card>
          )}

          {/* Unadopted Swaps */}
          {unadoptedSwaps.slice(0, 10).map((swap) => (
            <Card key={swap.id} className="mb-4 p-6">
              <View className="flex-row items-start">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    {swap.isRebeccaPick && (
                      <View className="bg-amber-light rounded-full px-3 py-1 mr-2">
                        <Text className="text-amber text-xs font-bold">Rebecca's Pick</Text>
                      </View>
                    )}
                    <Text className="text-warmgrey text-xs capitalize font-body-medium">{swap.category}</Text>
                  </View>
                  <Text className="text-charcoal text-lg font-bold font-heading mb-1.5">{swap.title}</Text>
                  <Text className="text-warmgrey text-sm leading-5 mb-3">{swap.description}</Text>
                  <View className="flex-row items-center bg-savings-light rounded-full px-3 py-1.5 self-start">
                    <Text className="text-savings text-sm font-bold">
                      Save ~{formatCurrency(swap.potentialMonthlySaving, currency)}/month
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row mt-4 gap-3">
                <TouchableOpacity
                  onPress={() => handleAdoptSwap(swap.id)}
                  className="flex-1 bg-teal rounded-2xl py-3 items-center shadow-card"
                >
                  <Text className="text-white text-sm font-bold">I'll try this</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => dismissSwap(swap.id)}
                  className="flex-1 border border-border rounded-2xl py-3 items-center"
                >
                  <Text className="text-warmgrey text-sm font-semibold">Not for me</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
