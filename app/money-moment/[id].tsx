import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Haptics } from '../../utils/haptics';
import { useContentStore } from '../../stores/useContentStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useUserStore } from '../../stores/useUserStore';
import { formatCurrency } from '../../utils/currency';
import { XP_REWARDS } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { db, schema } from '../../db/client';
import { eq } from 'drizzle-orm';
import { checkBadges, markShared } from '../../utils/checkBadges';
import { boostCategory, penalizeCategory } from '../../utils/personalization';

export default function MoneyMomentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { moments } = useContentStore();
  const markMomentRead = useContentStore((s) => s.markMomentRead);
  const readMomentIds = useContentStore((s) => s.readMomentIds);
  const recordActivity = useGamificationStore((s) => s.recordActivity);
  const addXP = useGamificationStore((s) => s.addXP);
  const currency = useUserStore((s) => s.currency);

  const toggleMomentSaved = useContentStore((s) => s.toggleMomentSaved);
  const savedMomentIds = useContentStore((s) => s.savedMomentIds);
  const moment = moments.find((m) => m.id === id);
  const dayNumber = moment ? moments.indexOf(moment) + 1 : 0;
  const isSaved = moment ? savedMomentIds.has(moment.id) : false;
  const [helpfulVote, setHelpfulVote] = useState<boolean | null>(null);

  useEffect(() => {
    if (moment && !readMomentIds.has(moment.id)) {
      markMomentRead(moment.id);
      recordActivity();
      addXP(XP_REWARDS.MOMENT_READ);
      checkBadges();
    }
  }, [moment?.id]);

  const handleBookmark = async () => {
    if (!moment) return;
    await toggleMomentSaved(moment.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHelpful = async (helpful: boolean) => {
    if (!moment) return;
    setHelpfulVote(helpful);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Track category preference
    if (helpful) {
      boostCategory(moment.category);
    } else {
      penalizeCategory(moment.category);
    }
    try {
      await db.insert(schema.moneyMomentState).values({
        momentId: moment.id,
        isHelpful: helpful,
      }).onConflictDoUpdate({
        target: schema.moneyMomentState.momentId,
        set: { isHelpful: helpful },
      });
    } catch (e) {
      console.warn('Save helpful vote error:', e);
    }
  };

  const handleShare = async () => {
    if (!moment) return;
    try {
      const result = await Share.share({
        message: `${moment.title}\n\n${moment.summary}\n\nRead more in MumVest: mumvest://money-moment/${moment.id}\n\nDownload MumVest - Small steps. Big confidence.`,
      });
      if (result.action === Share.sharedAction) {
        markShared();
        checkBadges();
      }
    } catch (e) {
      // User cancelled
    }
  };

  if (!moment) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-warmgrey">Moment not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold flex-1">Money Moment</Text>
        <TouchableOpacity onPress={handleShare} className="mr-3">
          <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={isSaved ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          {/* Social Proof */}
          <View className="flex-row items-center mt-4 mb-2">
            <Ionicons name="heart" size={12} color={colors.primary} />
            <Text className="text-warmgrey text-xs ml-1">
              {(8200 + parseInt(moment.id.replace('mm-', ''), 10) * 137).toLocaleString()} mums found this helpful
            </Text>
          </View>

          {/* Category + Reading Time */}
          <View className="flex-row items-center mb-4">
            <View className="bg-teal/10 rounded-full px-3 py-1 mr-2">
              <Text className="text-teal text-xs font-bold">Day {dayNumber}</Text>
            </View>
            <View className="bg-coral-light rounded-full px-3 py-1 mr-2">
              <Text className="text-coral text-xs font-semibold capitalize">{moment.category}</Text>
            </View>
            <Text className="text-warmgrey text-xs">{moment.readTimeSeconds}s read</Text>
            {moment.isRebeccaPick && (
              <View className="bg-amber-light rounded-full px-2 py-0.5 ml-auto">
                <Text className="text-amber text-xs font-semibold">Rebecca's Pick</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text className="text-charcoal text-2xl font-bold mb-2">{moment.title}</Text>
          <Text className="text-warmgrey text-sm mb-6">{moment.summary}</Text>

          {/* Body */}
          <View className="bg-white rounded-2xl p-5 mb-6">
            <Text className="text-charcoal text-base leading-7">{moment.body}</Text>
          </View>

          {/* Potential Saving */}
          {moment.potentialMonthlySaving > 0 && (
            <View className="bg-savings-light rounded-2xl p-5 mb-6 items-center">
              <Text className="text-savings text-xs font-semibold mb-1">POTENTIAL SAVING</Text>
              <Text className="text-savings text-3xl font-bold">
                {formatCurrency(moment.potentialMonthlySaving, currency)}
              </Text>
              <Text className="text-savings text-sm">per month</Text>
              <Text className="text-savings/60 text-xs mt-1">
                That's {formatCurrency(moment.potentialMonthlySaving * 12, currency)} per year!
              </Text>
            </View>
          )}

          {/* Was this helpful? */}
          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-charcoal text-sm font-semibold mb-3 text-center">Was this helpful?</Text>
            <View className="flex-row justify-center gap-4">
              <TouchableOpacity
                onPress={() => handleHelpful(true)}
                className={`flex-row items-center px-5 py-2.5 rounded-full border ${
                  helpfulVote === true ? 'bg-savings-light border-savings' : 'border-border'
                }`}
              >
                <Ionicons name="thumbs-up" size={18} color={helpfulVote === true ? colors.success : colors.textTertiary} />
                <Text className={`ml-2 text-sm font-semibold ${helpfulVote === true ? 'text-savings' : 'text-warmgrey'}`}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleHelpful(false)}
                className={`flex-row items-center px-5 py-2.5 rounded-full border ${
                  helpfulVote === false ? 'bg-coral-light border-coral' : 'border-border'
                }`}
              >
                <Ionicons name="thumbs-down" size={18} color={helpfulVote === false ? colors.primary : colors.textTertiary} />
                <Text className={`ml-2 text-sm font-semibold ${helpfulVote === false ? 'text-coral' : 'text-warmgrey'}`}>Not really</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action */}
          <View className="bg-white rounded-2xl p-5 mb-8">
            <Text className="text-charcoal text-base font-semibold mb-2">💡 Your action step</Text>
            <Text className="text-warmgrey text-sm">
              Try this tip today and log any savings you make. Every small step counts!
            </Text>
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
