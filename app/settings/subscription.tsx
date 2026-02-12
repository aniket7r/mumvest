import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';

export default function SubscriptionScreen() {
  const router = useRouter();
  const isPro = useSubscriptionStore((s) => s.isPro);

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold">Subscription</Text>
      </View>

      <View className="px-5 mt-4">
        <Card className="items-center py-6">
          <Text className="text-4xl mb-3">{isPro ? '💎' : '🆓'}</Text>
          <Text className="text-charcoal text-xl font-bold mb-1">
            {isPro ? 'MumVest Pro' : 'Free Plan'}
          </Text>
          <Text className="text-warmgrey text-sm text-center">
            {isPro
              ? 'You have full access to all features'
              : 'Upgrade to unlock all lessons, challenges, and more'}
          </Text>
        </Card>

        {!isPro && (
          <TouchableOpacity
            onPress={() => router.push('/paywall')}
            className="bg-coral rounded-2xl py-4 items-center mt-4"
          >
            <Text className="text-white text-base font-bold">Upgrade to Pro</Text>
          </TouchableOpacity>
        )}

        <Text className="text-warmgrey text-xs text-center mt-6">
          Manage your subscription in the App Store settings
        </Text>
      </View>
    </SafeAreaView>
  );
}
