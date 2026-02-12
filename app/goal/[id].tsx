import { View, Text, ScrollView, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../../utils/haptics';
import { useGoalsStore } from '../../stores/useGoalsStore';
import { useUserStore } from '../../stores/useUserStore';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/currency';
import { getRelativeTimeString } from '../../utils/dates';
import { colors } from '../../theme/colors';
import { markShared, checkBadges } from '../../utils/checkBadges';

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals } = useGoalsStore();
  const getGoalProgress = useGoalsStore((s) => s.getGoalProgress);
  const getGoalEntries = useGoalsStore((s) => s.getGoalEntries);
  const getProjectedCompletion = useGoalsStore((s) => s.getProjectedCompletion);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);
  const archiveGoal = useGoalsStore((s) => s.archiveGoal);
  const updateSavingsEntry = useGoalsStore((s) => s.updateSavingsEntry);
  const deleteSavingsEntry = useGoalsStore((s) => s.deleteSavingsEntry);
  const currency = useUserStore((s) => s.currency);

  const handleDeleteGoal = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure? This will delete the goal and all its savings entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(id!);
            router.back();
          },
        },
      ]
    );
  };

  const handleEntryOptions = (entryId: string, currentAmount: number) => {
    Alert.alert('Edit Entry', undefined, [
      {
        text: 'Edit Amount',
        onPress: () => {
          if (Platform.OS === 'web') {
            const value = window.prompt('Enter the new amount:', currentAmount.toString());
            if (value) {
              const newAmount = parseFloat(value);
              if (newAmount > 0) updateSavingsEntry(entryId, newAmount);
            }
          } else {
            Alert.prompt(
              'Edit Amount',
              'Enter the new amount:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Save',
                  onPress: (value?: string) => {
                    const newAmount = parseFloat(value || '0');
                    if (newAmount > 0) updateSavingsEntry(entryId, newAmount);
                  },
                },
              ],
              'plain-text',
              currentAmount.toString()
            );
          }
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSavingsEntry(entryId),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const goal = goals.find((g) => g.id === id);
  if (!goal) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-warmgrey">Goal not found</Text>
      </SafeAreaView>
    );
  }

  const progress = getGoalProgress(goal.id);
  const entries = getGoalEntries(goal.id);
  const projected = getProjectedCompletion(goal.id);

  // Calculate weekly/monthly averages
  const daysSinceCreated = entries.length > 0
    ? Math.max(1, Math.ceil((Date.now() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const weeklyAvg = daysSinceCreated > 0 ? (progress.saved / daysSinceCreated) * 7 : 0;
  const monthlyAvg = daysSinceCreated > 0 ? (progress.saved / daysSinceCreated) * 30 : 0;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-3xl mr-2">{goal.emoji}</Text>
        <Text className="text-charcoal text-xl font-bold flex-1" numberOfLines={1}>{goal.name}</Text>
        <TouchableOpacity onPress={() => router.push(`/goal/edit?id=${goal.id}`)} className="w-10 h-10 rounded-full bg-white items-center justify-center mr-2">
          <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteGoal} className="w-10 h-10 rounded-full bg-white items-center justify-center">
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Progress Circle */}
        <View className="items-center my-8">
          <ProgressRing progress={progress.percentage} size={160} strokeWidth={12}>
            <View className="items-center">
              <Text className="text-charcoal text-3xl font-bold">
                {Math.round(progress.percentage)}%
              </Text>
              <Text className="text-warmgrey text-sm">saved</Text>
            </View>
          </ProgressRing>

          <View className="flex-row mt-6 px-5">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center mr-3">
              <Text className="text-warmgrey text-xs mb-1">Saved</Text>
              <Text className="text-coral text-xl font-bold">
                {formatCurrency(progress.saved, currency)}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 items-center">
              <Text className="text-warmgrey text-xs mb-1">Remaining</Text>
              <Text className="text-charcoal text-xl font-bold">
                {formatCurrency(progress.target - progress.saved, currency)}
              </Text>
            </View>
          </View>

          {goal.targetDate && (
            <View className="bg-amber-light rounded-full px-4 py-1.5 mt-4">
              <Text className="text-amber text-xs font-semibold">
                Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          )}

          {projected && (
            <Text className="text-warmgrey text-sm mt-3">
              On track to reach your goal by{' '}
              <Text className="text-teal font-bold">
                {projected.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </Text>
          )}
        </View>

        {/* Averages */}
        {entries.length > 0 && (
          <View className="px-5 mb-4 flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl px-4 py-4 items-center">
              <Ionicons name="calendar-outline" size={18} color={colors.textTertiary} />
              <Text className="text-warmgrey text-xs mt-1">Weekly Avg</Text>
              <Text className="text-charcoal text-lg font-bold">{formatCurrency(weeklyAvg, currency)}</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl px-4 py-4 items-center">
              <Ionicons name="trending-up" size={18} color={colors.textTertiary} />
              <Text className="text-warmgrey text-xs mt-1">Monthly Avg</Text>
              <Text className="text-charcoal text-lg font-bold">{formatCurrency(monthlyAvg, currency)}</Text>
            </View>
          </View>
        )}

        {/* Log Savings Button */}
        <View className="px-5 mb-3">
          <Button
            title="Log Savings"
            onPress={() => router.push('/log-savings')}
          />
        </View>

        {/* Share Progress */}
        <View className="px-5 mb-6">
          <TouchableOpacity
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              try {
                const result = await Share.share({
                  message: `I'm ${Math.round(progress.percentage)}% of the way to my "${goal.name}" goal! ${formatCurrency(progress.saved, currency)} saved so far.\n\nTracking my progress with MumVest - Small steps, big confidence!`,
                });
                if (result.action === Share.sharedAction) {
                  markShared();
                  checkBadges();
                }
              } catch {}
            }}
            className="bg-teal/10 rounded-2xl py-3.5 flex-row items-center justify-center border border-teal/30"
          >
            <Ionicons name="share-social" size={18} color={colors.secondary} />
            <Text className="text-teal text-sm font-bold ml-2">Share My Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Entries */}
        <View className="px-5">
          <Text className="text-charcoal text-lg font-bold mb-4">Savings History</Text>

          {entries.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Text className="text-3xl mb-3">💰</Text>
              <Text className="text-charcoal text-base font-semibold mb-1">No entries yet</Text>
              <Text className="text-warmgrey text-sm">Log your first saving to get started!</Text>
            </View>
          ) : (
            entries.map((entry, idx) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() => handleEntryOptions(entry.id, entry.amount)}
                className={`bg-white px-5 py-4 flex-row items-center ${
                  idx === 0 ? 'rounded-t-2xl' : ''
                } ${idx === entries.length - 1 ? 'rounded-b-2xl' : 'border-b border-border'}`}
                activeOpacity={0.7}
              >
                <View className="w-9 h-9 rounded-full bg-savings-light items-center justify-center mr-3">
                  <Ionicons name="add" size={18} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text className="text-charcoal text-base font-bold">
                    +{formatCurrency(entry.amount, currency)}
                  </Text>
                  <Text className="text-warmgrey text-xs mt-0.5">
                    {getRelativeTimeString(entry.createdAt)}
                    {entry.method ? ` · ${entry.method.replace(/_/g, ' ')}` : ''}
                  </Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))
          )}
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
