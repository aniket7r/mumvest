import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { useGoalsStore } from '../stores/useGoalsStore';
import { useContentStore } from '../stores/useContentStore';
import { useUserStore } from '../stores/useUserStore';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { Card } from '../components/ui/Card';
import { formatCurrency } from '../utils/currency';
import { colors } from '../theme/colors';

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export default function InsightsScreen() {
  const router = useRouter();
  const { entries, goals } = useGoalsStore();
  const adoptedSwapIds = useContentStore((s) => s.adoptedSwapIds);
  const currency = useUserStore((s) => s.currency);
  const isPro = useSubscriptionStore((s) => s.isPro);

  const analytics = useMemo(() => {
    // Group entries by month
    const monthlyMap: Record<string, number> = {};
    entries.forEach((e) => {
      const key = getMonthKey(e.createdAt);
      monthlyMap[key] = (monthlyMap[key] || 0) + e.amount;
    });

    const months = Object.keys(monthlyMap).sort();
    const monthlySavings = months.map((key) => ({
      month: key,
      label: getMonthLabel(key + '-01'),
      amount: monthlyMap[key],
    }));

    // Total saved
    const totalSaved = entries.reduce((sum, e) => sum + e.amount, 0);

    // Average monthly
    const avgMonthly = months.length > 0 ? totalSaved / months.length : 0;

    // Best month
    const bestMonth = monthlySavings.reduce(
      (best, m) => (m.amount > best.amount ? m : best),
      { month: '', label: 'N/A', amount: 0 }
    );

    // Best saving method
    const methodCounts: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.method) {
        methodCounts[e.method] = (methodCounts[e.method] || 0) + e.amount;
      }
    });
    const topMethod = Object.entries(methodCounts).sort(([, a], [, b]) => b - a)[0];

    // Projected annual savings
    const projectedAnnual = avgMonthly * 12;

    // Swaps impact (estimated)
    const swapImpact = adoptedSwapIds.size * 25; // rough estimate per swap/month

    // Trend (compare last 2 months)
    let trend = 0;
    if (monthlySavings.length >= 2) {
      const last = monthlySavings[monthlySavings.length - 1].amount;
      const prev = monthlySavings[monthlySavings.length - 2].amount;
      trend = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    }

    // Goals completed
    const completedGoals = goals.filter((g) => g.isCompleted).length;

    return {
      monthlySavings,
      totalSaved,
      avgMonthly,
      bestMonth,
      topMethod,
      projectedAnnual,
      swapImpact,
      trend,
      completedGoals,
    };
  }, [entries, goals, adoptedSwapIds.size]);

  if (!isPro) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-5">
        <Text className="text-4xl mb-4">📊</Text>
        <Text className="text-charcoal text-xl font-bold text-center mb-2">Premium Insights</Text>
        <Text className="text-warmgrey text-sm text-center mb-6">
          Upgrade to Pro to see your monthly savings trends, best methods, and projections.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/paywall')}
          className="bg-coral rounded-2xl px-8 py-3"
        >
          <Text className="text-white text-base font-semibold">Unlock Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-warmgrey text-sm">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const maxMonth = Math.max(...analytics.monthlySavings.map((m) => m.amount), 1);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold">Savings Insights</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Headline Stats */}
        <View className="px-5 mt-4 flex-row gap-3">
          <Card className="flex-1 items-center">
            <Text className="text-warmgrey text-xs mb-1">Total Saved</Text>
            <Text className="text-charcoal text-xl font-bold">
              {formatCurrency(analytics.totalSaved, currency)}
            </Text>
          </Card>
          <Card className="flex-1 items-center">
            <Text className="text-warmgrey text-xs mb-1">Monthly Avg</Text>
            <Text className="text-charcoal text-xl font-bold">
              {formatCurrency(analytics.avgMonthly, currency)}
            </Text>
          </Card>
        </View>

        {/* Trend */}
        <View className="px-5 mt-3">
          <Card className="flex-row items-center justify-between">
            <View>
              <Text className="text-warmgrey text-xs">Month-over-month</Text>
              <Text className="text-charcoal text-base font-bold">
                {analytics.trend >= 0 ? 'Trending up' : 'Dipped slightly'}
              </Text>
            </View>
            <View className={`rounded-full px-3 py-1 ${analytics.trend >= 0 ? 'bg-savings-light' : 'bg-coral-light'}`}>
              <Text className={`text-sm font-bold ${analytics.trend >= 0 ? 'text-savings' : 'text-coral'}`}>
                {analytics.trend >= 0 ? '+' : ''}{Math.round(analytics.trend)}%
              </Text>
            </View>
          </Card>
        </View>

        {/* Monthly Chart */}
        <View className="px-5 mt-4">
          <Card>
            <Text className="text-charcoal text-base font-semibold mb-4">Monthly Savings</Text>
            {analytics.monthlySavings.length === 0 ? (
              <Text className="text-warmgrey text-sm text-center py-4">
                Start saving to see your trends here
              </Text>
            ) : (
              analytics.monthlySavings.slice(-6).map((month) => (
                <View key={month.month} className="flex-row items-center mb-3">
                  <Text className="text-warmgrey text-xs w-16">{month.label}</Text>
                  <View className="flex-1 h-6 bg-cream rounded-full overflow-hidden mx-2">
                    <View
                      className="h-full bg-teal rounded-full"
                      style={{ width: `${Math.max((month.amount / maxMonth) * 100, 5)}%` }}
                    />
                  </View>
                  <Text className="text-charcoal text-xs font-semibold w-16 text-right">
                    {formatCurrency(month.amount, currency)}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Best Saving Method */}
        <View className="px-5 mt-3 flex-row gap-3">
          <Card className="flex-1">
            <Text className="text-warmgrey text-xs mb-1">Best Method</Text>
            <Text className="text-charcoal text-base font-bold capitalize">
              {analytics.topMethod ? analytics.topMethod[0].replace(/_/g, ' ') : 'N/A'}
            </Text>
            {analytics.topMethod && (
              <Text className="text-savings text-xs font-semibold">
                {formatCurrency(analytics.topMethod[1], currency)} saved
              </Text>
            )}
          </Card>
          <Card className="flex-1">
            <Text className="text-warmgrey text-xs mb-1">Best Month</Text>
            <Text className="text-charcoal text-base font-bold">{analytics.bestMonth.label}</Text>
            <Text className="text-savings text-xs font-semibold">
              {formatCurrency(analytics.bestMonth.amount, currency)}
            </Text>
          </Card>
        </View>

        {/* Projections */}
        <View className="px-5 mt-3">
          <Card className="bg-teal">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white/80 text-xs">Projected Annual Savings</Text>
                <Text className="text-white text-2xl font-bold">
                  {formatCurrency(analytics.projectedAnnual, currency)}
                </Text>
              </View>
              <Text className="text-4xl">📈</Text>
            </View>
          </Card>
        </View>

        {/* More stats */}
        <View className="px-5 mt-3 flex-row gap-3">
          <Card className="flex-1 items-center">
            <Text className="text-warmgrey text-xs mb-1">Goals Completed</Text>
            <Text className="text-charcoal text-2xl font-bold">{analytics.completedGoals}</Text>
          </Card>
          <Card className="flex-1 items-center">
            <Text className="text-warmgrey text-xs mb-1">Swaps Adopted</Text>
            <Text className="text-charcoal text-2xl font-bold">{adoptedSwapIds.size}</Text>
            <Text className="text-savings text-xs">
              ~{formatCurrency(analytics.swapImpact, currency)}/mo saved
            </Text>
          </Card>
        </View>

        {/* Export */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={async () => {
              try {
                const html = `
                  <html>
                    <body style="font-family: sans-serif; padding: 20px;">
                      <h1 style="color: #FF6B6B;">MumVest Savings Report</h1>
                      <p>Generated: ${new Date().toLocaleDateString()}</p>
                      <h2>Summary</h2>
                      <p><strong>Total Saved:</strong> ${formatCurrency(analytics.totalSaved, currency)}</p>
                      <p><strong>Monthly Average:</strong> ${formatCurrency(analytics.avgMonthly, currency)}</p>
                      <p><strong>Projected Annual:</strong> ${formatCurrency(analytics.projectedAnnual, currency)}</p>
                      <p><strong>Goals Completed:</strong> ${analytics.completedGoals}</p>
                      <h2>Monthly Breakdown</h2>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f5f5f5;"><th style="text-align: left; padding: 8px;">Month</th><th style="text-align: right; padding: 8px;">Amount</th></tr>
                        ${analytics.monthlySavings.map((m) => `<tr><td style="padding: 8px; border-top: 1px solid #eee;">${m.label}</td><td style="text-align: right; padding: 8px; border-top: 1px solid #eee;">${formatCurrency(m.amount, currency)}</td></tr>`).join('')}
                      </table>
                      <p style="color: #999; margin-top: 20px; font-size: 12px;">Generated by MumVest - Small steps, big confidence.</p>
                    </body>
                  </html>
                `;
                if (Platform.OS === 'web') {
                  // On web, open HTML in new tab for printing
                  const w = window.open('', '_blank');
                  if (w) { w.document.write(html); w.document.close(); w.print(); }
                } else {
                  const Print = require('expo-print');
                  const Sharing = require('expo-sharing');
                  const { uri } = await Print.printToFileAsync({ html });
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
                  }
                }
              } catch (e) {
                Alert.alert('Export Error', 'Could not generate the report. Please try again.');
              }
            }}
            className="bg-white rounded-2xl py-3 flex-row items-center justify-center border border-border"
          >
            <Ionicons name="download-outline" size={18} color={colors.textSecondary} />
            <Text className="text-charcoal text-sm font-semibold ml-2">Export as PDF</Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
