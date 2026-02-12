import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../../utils/haptics';
import { useContentStore } from '../../stores/useContentStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useUserStore } from '../../stores/useUserStore';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';
import { XP_REWARDS } from '../../utils/constants';
import { checkBadges } from '../../utils/checkBadges';
import { boostCategory, sortByPreference } from '../../utils/personalization';
import type { SwapCategory } from '../../types';

const CATEGORIES: { id: SwapCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'dining', label: 'Dining' },
  { id: 'subscriptions', label: 'Subs' },
  { id: 'energy', label: 'Energy' },
  { id: 'transport', label: 'Transport' },
  { id: 'kids', label: 'Kids' },
  { id: 'shopping', label: 'Shopping' },
];

export default function SmartSwapScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<SwapCategory | 'all'>('all');
  const { swaps } = useContentStore();
  const adoptedSwapIds = useContentStore((s) => s.adoptedSwapIds);
  const adoptSwap = useContentStore((s) => s.adoptSwap);
  const dismissSwap = useContentStore((s) => s.dismissSwap);
  const addXP = useGamificationStore((s) => s.addXP);
  const recordActivity = useGamificationStore((s) => s.recordActivity);
  const currency = useUserStore((s) => s.currency);

  const handleAdoptSwap = async (swapId: string) => {
    const swap = swaps.find((s) => s.id === swapId);
    if (swap) boostCategory(swap.category, 2);
    await adoptSwap(swapId);
    addXP(XP_REWARDS.SWAP_ADOPTED);
    recordActivity();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkBadges();
  };

  const unadoptedSwaps = swaps.filter((s) => !adoptedSwapIds.has(s.id));
  const personalizedSwaps = activeCategory === 'all'
    ? sortByPreference(unadoptedSwaps)
    : unadoptedSwaps.filter((s) => s.category === activeCategory);
  const filteredSwaps = personalizedSwaps;

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold">Smart Swaps</Text>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-3">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setActiveCategory(cat.id)}
            className={`rounded-full px-4 py-2 mr-2 ${
              activeCategory === cat.id ? 'bg-coral' : 'bg-white'
            }`}
          >
            <Text className={`text-sm font-semibold ${
              activeCategory === cat.id ? 'text-white' : 'text-charcoal'
            }`}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {filteredSwaps.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🎉</Text>
            <Text className="text-charcoal text-base font-semibold mb-1">All caught up!</Text>
            <Text className="text-warmgrey text-sm text-center px-8">
              {activeCategory === 'all'
                ? "You've reviewed all the swaps. Check back later for new ones!"
                : "No more swaps in this category. Try another filter!"}
            </Text>
          </View>
        )}
        {filteredSwaps.map((swap) => (
          <Card key={swap.id} className="mb-3">
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
            <Text className="text-warmgrey text-xs mt-1">
              Adopted by {(1200 + parseInt(swap.id.replace('swap-', ''), 10) * 89).toLocaleString()} mums
            </Text>
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
    </SafeAreaView>
  );
}
