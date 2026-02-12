import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '../../stores/useContentStore';
import { useUserStore } from '../../stores/useUserStore';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';
import type { MomentCategory } from '../../types';

const CATEGORIES: { id: MomentCategory | 'all' | 'saved'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'saved', label: 'Saved' },
  { id: 'groceries', label: 'Groceries' },
  { id: 'dining', label: 'Dining' },
  { id: 'subscriptions', label: 'Subs' },
  { id: 'energy', label: 'Energy' },
  { id: 'transport', label: 'Transport' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'kids', label: 'Kids' },
  { id: 'mindset', label: 'Mindset' },
];

export default function MoneyMomentArchiveScreen() {
  const router = useRouter();
  const { moments } = useContentStore();
  const readMomentIds = useContentStore((s) => s.readMomentIds);
  const savedMomentIds = useContentStore((s) => s.savedMomentIds);
  const currency = useUserStore((s) => s.currency);
  const [activeCategory, setActiveCategory] = useState<MomentCategory | 'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let list = moments;

    if (activeCategory === 'saved') {
      list = list.filter((m) => savedMomentIds.has(m.id));
    } else if (activeCategory !== 'all') {
      list = list.filter((m) => m.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.summary.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [moments, activeCategory, searchQuery, savedMomentIds]);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold">All Money Moments</Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 pt-2 pb-1">
        <View className="bg-white rounded-xl flex-row items-center px-3 border border-border">
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tips..."
            className="flex-1 py-2.5 px-2 text-sm text-charcoal"
            placeholderTextColor="#BDC3C7"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-3">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setActiveCategory(cat.id)}
            className={`rounded-full px-4 py-2 mr-2 flex-row items-center ${
              activeCategory === cat.id ? 'bg-coral' : 'bg-white'
            }`}
          >
            {cat.id === 'saved' && (
              <Ionicons
                name="bookmark"
                size={12}
                color={activeCategory === 'saved' ? 'white' : colors.accent}
                style={{ marginRight: 4 }}
              />
            )}
            <Text className={`text-sm font-semibold ${
              activeCategory === cat.id ? 'text-white' : 'text-charcoal'
            }`}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {activeCategory === 'saved' && savedMomentIds.size === 0 && !searchQuery && (
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🔖</Text>
            <Text className="text-charcoal text-base font-semibold mb-1">No saved tips yet</Text>
            <Text className="text-warmgrey text-sm text-center px-8">
              Tap the bookmark icon on any money moment to save it here for easy access.
            </Text>
          </View>
        )}

        {activeCategory !== 'saved' && (
          <Text className="text-warmgrey text-sm mb-4">
            {readMomentIds.size} of {moments.length} read
          </Text>
        )}

        {activeCategory === 'saved' && savedMomentIds.size > 0 && (
          <Text className="text-warmgrey text-sm mb-4">
            {savedMomentIds.size} saved tip{savedMomentIds.size !== 1 ? 's' : ''}
          </Text>
        )}

        {filtered.length === 0 && searchQuery && (
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🔍</Text>
            <Text className="text-charcoal text-base font-semibold mb-1">No results found</Text>
            <Text className="text-warmgrey text-sm text-center">
              Try a different search term
            </Text>
          </View>
        )}

        {filtered.map((moment) => {
          const isRead = readMomentIds.has(moment.id);
          const isSaved = savedMomentIds.has(moment.id);
          return (
            <Card
              key={moment.id}
              onPress={() => router.push(`/money-moment/${moment.id}`)}
              className={`mb-3 ${isRead ? 'opacity-70' : ''}`}
            >
              <View className="flex-row items-start">
                <Text className="text-xl mr-3">💡</Text>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <View className="bg-coral-light rounded-full px-2 py-0.5 mr-2">
                      <Text className="text-coral text-xs font-semibold capitalize">{moment.category}</Text>
                    </View>
                    {moment.isRebeccaPick && (
                      <View className="bg-amber-light rounded-full px-2 py-0.5">
                        <Text className="text-amber text-xs font-semibold">Rebecca's Pick</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-charcoal text-base font-semibold">{moment.title}</Text>
                  <Text className="text-warmgrey text-sm" numberOfLines={1}>{moment.summary}</Text>
                  {moment.potentialMonthlySaving > 0 && (
                    <Text className="text-savings text-xs font-semibold mt-1">
                      Save {formatCurrency(moment.potentialMonthlySaving, currency)}/mo
                    </Text>
                  )}
                </View>
                <View className="items-center">
                  {isSaved && <Ionicons name="bookmark" size={16} color={colors.accent} />}
                  {isRead && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                </View>
              </View>
            </Card>
          );
        })}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
