import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useUserStore } from '../stores/useUserStore';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/currency';
import { getRelativeTimeString } from '../utils/dates';
import { colors } from '../theme/colors';

export default function SavingsBreakdownScreen() {
  const router = useRouter();
  const { goals, entries } = useGoalsStore();
  const getGoalProgress = useGoalsStore((s) => s.getGoalProgress);
  const getWeeklySummary = useGoalsStore((s) => s.getWeeklySummary);
  const currency = useUserStore((s) => s.currency);

  const weeklySummary = getWeeklySummary();
  const recentEntries = entries.slice(0, 20);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold">Savings Breakdown</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Weekly Summary */}
        <Card className="mt-4 bg-coral">
          <Text className="text-white/70 text-xs font-semibold mb-1">THIS WEEK</Text>
          <Text className="text-white text-3xl font-bold">
            {formatCurrency(weeklySummary.totalSaved, currency)}
          </Text>
          <Text className="text-white/70 text-sm">
            {weeklySummary.entryCount} entries
          </Text>
        </Card>

        {/* Goals Breakdown */}
        <Text className="text-charcoal text-lg font-bold mt-6 mb-3">By Goal</Text>
        {goals.map((goal) => {
          const progress = getGoalProgress(goal.id);
          return (
            <Card key={goal.id} className="mb-2 flex-row items-center">
              <Text className="text-xl mr-3">{goal.emoji}</Text>
              <View className="flex-1">
                <Text className="text-charcoal text-sm font-semibold">{goal.name}</Text>
              </View>
              <Text className="text-charcoal text-base font-bold">
                {formatCurrency(progress.saved, currency)}
              </Text>
            </Card>
          );
        })}

        {/* By Method */}
        {(() => {
          const methodTotals: Record<string, number> = {};
          entries.forEach((e) => {
            const key = e.method || 'other';
            methodTotals[key] = (methodTotals[key] || 0) + e.amount;
          });
          const sorted = Object.entries(methodTotals).sort(([, a], [, b]) => b - a);
          if (sorted.length === 0) return null;
          return (
            <>
              <Text className="text-charcoal text-lg font-bold mt-6 mb-3">By Method</Text>
              {sorted.map(([method, total]) => (
                <Card key={method} className="mb-2 flex-row items-center">
                  <Text className="text-charcoal text-sm font-semibold flex-1 capitalize">
                    {method.replace(/_/g, ' ')}
                  </Text>
                  <Text className="text-charcoal text-base font-bold">
                    {formatCurrency(total, currency)}
                  </Text>
                </Card>
              ))}
            </>
          );
        })()}

        {/* Recent Entries */}
        <Text className="text-charcoal text-lg font-bold mt-6 mb-3">Recent Activity</Text>
        {recentEntries.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="No Savings Yet"
            subtitle="Start logging your savings to see your activity here. Every dollar counts!"
            actionLabel="Log Savings"
            onAction={() => router.push('/log-savings')}
          />
        ) : (
          recentEntries.map((entry) => {
            const goal = goals.find((g) => g.id === entry.goalId);
            return (
              <View key={entry.id} className="bg-white rounded-xl px-4 py-3 mb-2 flex-row items-center">
                <Text className="text-lg mr-3">{goal?.emoji || '💰'}</Text>
                <View className="flex-1">
                  <Text className="text-charcoal text-sm font-semibold">
                    +{formatCurrency(entry.amount, currency)}
                  </Text>
                  <Text className="text-warmgrey text-xs">
                    {goal?.name} · {getRelativeTimeString(entry.createdAt)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
