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
      <View className="px-5 pt-4 pb-2">
        <Text className="text-charcoal text-2xl font-bold">Save</Text>
      </View>

      {/* Tab Selector */}
      <View className="flex-row mx-5 mb-4 bg-white rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setActiveTab('goals')}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            activeTab === 'goals' ? 'bg-coral' : ''
          }`}
        >
          <Text className={`font-semibold text-sm ${
            activeTab === 'goals' ? 'text-white' : 'text-warmgrey'
          }`}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('swaps')}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            activeTab === 'swaps' ? 'bg-coral' : ''
          }`}
        >
          <Text className={`font-semibold text-sm ${
            activeTab === 'swaps' ? 'text-white' : 'text-warmgrey'
          }`}>Smart Swaps</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'goals' ? (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Total Saved Banner */}
          <Card className="mb-4 bg-coral items-center py-6">
            <Text className="text-white/70 text-sm font-semibold mb-1">TOTAL SAVED</Text>
            <Text className="text-white text-3xl font-bold">
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
                    className="mb-3 flex-row items-center"
                  >
                    <ProgressRing progress={progress.percentage} size={56} strokeWidth={5}>
                      <Text className="text-xl">{goal.emoji}</Text>
                    </ProgressRing>
                    <View className="flex-1 ml-4">
                      <Text className="text-charcoal text-base font-semibold">{goal.name}</Text>
                      <Text className="text-warmgrey text-sm">
                        {formatCurrency(progress.saved, currency)} of {formatCurrency(progress.target, currency)}
                      </Text>
                      <ProgressBar progress={progress.percentage} height={4} className="mt-2" />
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </Card>
                );
              })}

              {/* Add Goal Button */}
              <TouchableOpacity
                onPress={() => router.push('/goal/create')}
                className="border-2 border-dashed border-border rounded-2xl py-6 items-center mb-8"
              >
                <Ionicons name="add" size={28} color={colors.textTertiary} />
                <Text className="text-warmgrey text-sm font-semibold mt-1">Add a Goal</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Swaps Summary */}
          {adoptedSwaps.length > 0 && (
            <Card className="mb-4 bg-teal">
              <Text className="text-white/70 text-xs font-semibold mb-1">ESTIMATED MONTHLY SAVINGS</Text>
              <Text className="text-white text-2xl font-bold">
                {formatCurrency(estimatedMonthlySavings, currency)}/mo
              </Text>
              <Text className="text-white/70 text-xs mt-1">
                From {adoptedSwaps.length} active swap{adoptedSwaps.length !== 1 ? 's' : ''}
              </Text>
            </Card>
          )}

          {/* Unadopted Swaps */}
          {unadoptedSwaps.slice(0, 10).map((swap) => (
            <Card key={swap.id} className="mb-3">
              <View className="flex-row items-start">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    {swap.isRebeccaPick && (
                      <View className="bg-amber-light rounded-full px-2 py-0.5 mr-2">
                        <Text className="text-amber text-xs font-semibold">Rebecca's Pick</Text>
                      </View>
                    )}
                    <Text className="text-warmgrey text-xs capitalize">{swap.category}</Text>
                  </View>
                  <Text className="text-charcoal text-base font-semibold mb-1">{swap.title}</Text>
                  <Text className="text-warmgrey text-sm mb-2">{swap.description}</Text>
                  <Text className="text-savings text-sm font-semibold">
                    Save ~{formatCurrency(swap.potentialMonthlySaving, currency)}/month
                  </Text>
                </View>
              </View>
              <View className="flex-row mt-3 gap-3">
                <TouchableOpacity
                  onPress={() => handleAdoptSwap(swap.id)}
                  className="flex-1 bg-teal rounded-xl py-2.5 items-center"
                >
                  <Text className="text-white text-sm font-semibold">I'll try this</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => dismissSwap(swap.id)}
                  className="flex-1 border border-border rounded-xl py-2.5 items-center"
                >
                  <Text className="text-warmgrey text-sm">Not for me</Text>
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
