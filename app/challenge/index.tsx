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
      <View className="flex-row items-center px-5 pt-5 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-charcoal text-2xl font-bold">Challenges</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-warmgrey text-base mb-5 mt-2">
          Push yourself with fun money challenges
        </Text>

        {challenges.map((challenge) => {
          const isLocked = challenge.isPremium && !isPro;
          const isActive = activeChallenge?.challengeId === challenge.id && activeChallenge.status === 'active';
          const checkedCount = isActive ? activeChallenge!.checkIns.filter(Boolean).length : 0;
          const progressPct = isActive ? (checkedCount / challenge.checkInCount) * 100 : 0;

          return (
            <Card key={challenge.id} className={`mb-4 ${isLocked ? 'opacity-60' : ''}`}>
              <View className="flex-row items-start">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2 flex-wrap gap-1.5">
                    <View className={`rounded-full px-3 py-1 ${
                      challenge.difficulty === 'beginner' ? 'bg-savings-light' :
                      challenge.difficulty === 'intermediate' ? 'bg-amber-light' : 'bg-coral-light'
                    }`}>
                      <Text className={`text-xs font-bold capitalize ${
                        challenge.difficulty === 'beginner' ? 'text-savings' :
                        challenge.difficulty === 'intermediate' ? 'text-amber' : 'text-coral'
                      }`}>{challenge.difficulty}</Text>
                    </View>
                    {isActive && (
                      <View className="bg-teal rounded-full px-3 py-1">
                        <Text className="text-white text-xs font-bold">IN PROGRESS</Text>
                      </View>
                    )}
                    {isLocked && (
                      <View className="bg-amber rounded-full px-3 py-1 flex-row items-center">
                        <Ionicons name="lock-closed" size={10} color="white" />
                        <Text className="text-white text-xs font-bold ml-1">PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-charcoal text-lg font-bold mb-1">{challenge.name}</Text>
                  <Text className="text-warmgrey text-sm leading-5 mb-3">{challenge.description}</Text>
                  {isActive && (
                    <View className="mb-3">
                      <ProgressBar progress={progressPct} height={6} />
                      <Text className="text-warmgrey text-xs mt-1.5 font-medium">{checkedCount}/{challenge.checkInCount} check-ins</Text>
                    </View>
                  )}
                  <View className="bg-savings-light rounded-lg px-3 py-2 self-start">
                    <Text className="text-savings text-sm font-bold">
                      Est. saving: {formatCurrency(challenge.estimatedSaving, currency)}
                    </Text>
                  </View>
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
                className={`${isActive ? 'bg-teal' : 'bg-coral'} rounded-xl py-3.5 items-center mt-4 flex-row justify-center`}
              >
                {isLocked && <Ionicons name="lock-open-outline" size={16} color="white" />}
                {isActive && <Ionicons name="play" size={16} color="white" />}
                {!isLocked && !isActive && <Ionicons name="rocket-outline" size={16} color="white" />}
                <Text className="text-white text-sm font-bold ml-2">
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
