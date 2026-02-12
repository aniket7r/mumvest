import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../../utils/haptics';
import { useContentStore } from '../../stores/useContentStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CelebrationOverlay } from '../../components/ui/CelebrationOverlay';
import { useUserStore } from '../../stores/useUserStore';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';
import { XP_REWARDS } from '../../utils/constants';
import { checkBadges } from '../../utils/checkBadges';

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { challenges, activeChallenge } = useContentStore();
  const startChallenge = useContentStore((s) => s.startChallenge);
  const checkInChallenge = useContentStore((s) => s.checkInChallenge);
  const abandonChallenge = useContentStore((s) => s.abandonChallenge);
  const addXP = useGamificationStore((s) => s.addXP);
  const recordActivity = useGamificationStore((s) => s.recordActivity);
  const currency = useUserStore((s) => s.currency);
  const [showComplete, setShowComplete] = useState(false);

  const challenge = challenges.find((c) => c.id === id);
  const isThisChallengeActive = activeChallenge?.challengeId === id && activeChallenge.status === 'active';
  const hasOtherActive = activeChallenge?.status === 'active' && activeChallenge.challengeId !== id;

  if (!challenge) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-warmgrey">Challenge not found</Text>
      </SafeAreaView>
    );
  }

  const handleStart = async () => {
    await startChallenge(challenge.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCheckIn = async (index: number) => {
    const allDone = await checkInChallenge(index);
    addXP(XP_REWARDS.CHALLENGE_CHECKIN);
    recordActivity();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (allDone) {
      addXP(XP_REWARDS.CHALLENGE_COMPLETE);
      checkBadges();
      setShowComplete(true);
      setTimeout(() => {
        router.back();
      }, 2500);
    }
  };

  const handleAbandon = () => {
    Alert.alert(
      'Skip This Challenge?',
      "This one didn't work out, and that's okay. Every step teaches you something. You can always try again or pick a different challenge!",
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Skip It',
          onPress: async () => {
            await abandonChallenge();
            router.back();
          },
        },
      ]
    );
  };

  if (showComplete) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <CelebrationOverlay
          visible
          emoji="🏆"
          message="Challenge Complete!"
          subMessage={`+${XP_REWARDS.CHALLENGE_COMPLETE} XP`}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold flex-1">{challenge.name}</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Card className="mt-4">
          <Text className="text-charcoal text-base mb-4">{challenge.description}</Text>

          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Text className="text-warmgrey text-xs">Duration</Text>
              <Text className="text-charcoal font-bold">{challenge.durationHours}h</Text>
            </View>
            <View className="items-center">
              <Text className="text-warmgrey text-xs">Check-ins</Text>
              <Text className="text-charcoal font-bold">{challenge.checkInCount}</Text>
            </View>
            <View className="items-center">
              <Text className="text-warmgrey text-xs">Est. Saving</Text>
              <Text className="text-savings font-bold">{formatCurrency(challenge.estimatedSaving, currency)}</Text>
            </View>
          </View>

          <Text className="text-charcoal text-sm font-semibold mb-2">Check-in points:</Text>
          {challenge.checkInLabels.map((label, i) => {
            const isChecked = isThisChallengeActive && activeChallenge!.checkIns[i];
            const canCheck = isThisChallengeActive && !isChecked;

            return (
              <TouchableOpacity
                key={i}
                onPress={() => canCheck && handleCheckIn(i)}
                disabled={!canCheck}
                className="flex-row items-center mb-2"
              >
                <View className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${
                  isChecked ? 'bg-savings' : isThisChallengeActive ? 'bg-white border-2 border-coral' : 'border-2 border-border'
                }`}>
                  {isChecked ? (
                    <Ionicons name="checkmark" size={16} color="white" />
                  ) : (
                    <Text className="text-warmgrey text-xs">{i + 1}</Text>
                  )}
                </View>
                <Text className={`text-sm flex-1 ${isChecked ? 'text-warmgrey line-through' : 'text-charcoal'}`}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Card>

        {isThisChallengeActive && (
          <TouchableOpacity onPress={handleAbandon} className="items-center mt-4 mb-4">
            <Text className="text-warmgrey text-sm">Abandon challenge</Text>
          </TouchableOpacity>
        )}
        <View className="h-8" />
      </ScrollView>

      {!isThisChallengeActive && (
        <View className="px-5 pb-6">
          <Button
            title={hasOtherActive ? 'Finish current challenge first' : 'Start This Challenge'}
            onPress={handleStart}
            disabled={hasOtherActive}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
