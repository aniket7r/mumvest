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
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold flex-1">{goal.name}</Text>
        <Text className="text-3xl mr-2">{goal.emoji}</Text>
        <TouchableOpacity onPress={() => router.push(`/goal/edit?id=${goal.id}`)} className="mr-3">
          <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteGoal}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Progress Circle */}
        <View className="items-center my-6">
          <ProgressRing progress={progress.percentage} size={140} strokeWidth={10}>
            <View className="items-center">
              <Text className="text-charcoal text-2xl font-bold">
                {Math.round(progress.percentage)}%
              </Text>
              <Text className="text-warmgrey text-xs">saved</Text>
            </View>
          </ProgressRing>

          <View className="flex-row mt-4">
            <View className="items-center mx-6">
              <Text className="text-coral text-xl font-bold">
                {formatCurrency(progress.saved, currency)}
              </Text>
              <Text className="text-warmgrey text-xs">Saved</Text>
            </View>
            <View className="items-center mx-6">
              <Text className="text-charcoal text-xl font-bold">
                {formatCurrency(progress.target - progress.saved, currency)}
              </Text>
              <Text className="text-warmgrey text-xs">Remaining</Text>
            </View>
          </View>

          {goal.targetDate && (
            <View className="bg-amber-light rounded-full px-3 py-1 mt-3">
              <Text className="text-amber text-xs font-semibold">
                Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          )}

          {projected && (
            <Text className="text-warmgrey text-sm mt-2">
              On track to reach your goal by{' '}
              <Text className="text-teal font-semibold">
                {projected.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </Text>
          )}
        </View>

        {/* Averages */}
        {entries.length > 0 && (
          <View className="px-5 mb-4 flex-row gap-3">
            <View className="flex-1 bg-white rounded-xl px-4 py-3 items-center">
              <Text className="text-warmgrey text-xs">Weekly Avg</Text>
              <Text className="text-charcoal text-base font-bold">{formatCurrency(weeklyAvg, currency)}</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl px-4 py-3 items-center">
              <Text className="text-warmgrey text-xs">Monthly Avg</Text>
              <Text className="text-charcoal text-base font-bold">{formatCurrency(monthlyAvg, currency)}</Text>
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
            className="bg-teal rounded-2xl py-3 flex-row items-center justify-center"
          >
            <Ionicons name="share-social" size={18} color="white" />
            <Text className="text-white text-sm font-semibold ml-2">Share My Progress</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Entries */}
        <View className="px-5">
          <Text className="text-charcoal text-lg font-bold mb-3">Savings History</Text>

          {entries.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-warmgrey text-sm">No entries yet. Start saving!</Text>
            </View>
          ) : (
            entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                onPress={() => handleEntryOptions(entry.id, entry.amount)}
                className="bg-white rounded-xl px-4 py-3 mb-2 flex-row items-center"
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className="text-charcoal text-base font-semibold">
                    +{formatCurrency(entry.amount, currency)}
                  </Text>
                  <Text className="text-warmgrey text-xs">
                    {getRelativeTimeString(entry.createdAt)}
                    {entry.method ? ` · ${entry.method.replace(/_/g, ' ')}` : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
