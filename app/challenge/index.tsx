import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '../../stores/useContentStore';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useUserStore } from '../../stores/useUserStore';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';

export default function ChallengeLibraryScreen() {
  const router = useRouter();
  const { challenges, activeChallenge } = useContentStore();
  const isPro = useSubscriptionStore((s) => s.isPro);
  const currency = useUserStore((s) => s.currency);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold">Challenges</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-warmgrey text-sm mb-4 mt-2">
          Push yourself with fun money challenges
        </Text>

        {challenges.map((challenge) => {
          const isLocked = challenge.isPremium && !isPro;
          const isActive = activeChallenge?.challengeId === challenge.id && activeChallenge.status === 'active';
          const checkedCount = isActive ? activeChallenge!.checkIns.filter(Boolean).length : 0;
          const progressPct = isActive ? (checkedCount / challenge.checkInCount) * 100 : 0;

          return (
            <Card key={challenge.id} className={`mb-3 ${isLocked ? 'opacity-60' : ''}`}>
              <View className="flex-row items-start">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <View className={`rounded-full px-2 py-0.5 mr-2 ${
                      challenge.difficulty === 'beginner' ? 'bg-savings-light' :
                      challenge.difficulty === 'intermediate' ? 'bg-amber-light' : 'bg-coral-light'
                    }`}>
                      <Text className={`text-xs font-semibold capitalize ${
                        challenge.difficulty === 'beginner' ? 'text-savings' :
                        challenge.difficulty === 'intermediate' ? 'text-amber' : 'text-coral'
                      }`}>{challenge.difficulty}</Text>
                    </View>
                    {isActive && (
                      <View className="bg-teal rounded-full px-2 py-0.5 mr-2">
                        <Text className="text-white text-xs font-bold">IN PROGRESS</Text>
                      </View>
                    )}
                    {isLocked && (
                      <View className="bg-amber rounded-full px-2 py-0.5">
                        <Text className="text-white text-xs font-bold">PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-charcoal text-base font-semibold mb-1">{challenge.name}</Text>
                  <Text className="text-warmgrey text-sm mb-2">{challenge.description}</Text>
                  {isActive && (
                    <View className="mb-2">
                      <ProgressBar progress={progressPct} height={4} />
                      <Text className="text-warmgrey text-xs mt-1">{checkedCount}/{challenge.checkInCount} check-ins</Text>
                    </View>
                  )}
                  <Text className="text-savings text-sm font-semibold">
                    Est. saving: {formatCurrency(challenge.estimatedSaving, currency)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (isLocked) {
                    router.push('/paywall');
                  } else {
                    router.push(`/challenge/${challenge.id}`);
                  }
                }}
                className={`${isActive ? 'bg-teal' : 'bg-coral'} rounded-xl py-2.5 items-center mt-3`}
              >
                <Text className="text-white text-sm font-semibold">
                  {isLocked ? 'Unlock with Pro' : isActive ? 'Continue Challenge' : 'Start Challenge'}
                </Text>
              </TouchableOpacity>
            </Card>
          );
        })}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
