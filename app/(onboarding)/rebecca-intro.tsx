import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';

export default function RebeccaIntroScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center items-center px-6">
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500 }}
          className="w-full items-center"
        >
          <Text className="text-warmgrey text-xs font-semibold tracking-wider mb-4">
            A MESSAGE FROM
          </Text>

          {/* Video Placeholder */}
          <View className="w-full aspect-video bg-charcoal/10 rounded-2xl items-center justify-center mb-6 overflow-hidden">
            <View className="w-16 h-16 rounded-full bg-coral/90 items-center justify-center">
              <Ionicons name="play" size={28} color="white" style={{ marginLeft: 3 }} />
            </View>
            <Text className="text-warmgrey text-sm mt-3">30-second welcome from Rebecca</Text>
            <Text className="text-warmgrey/60 text-xs mt-1">Video coming soon</Text>
          </View>

          <Text className="text-charcoal text-xl font-bold text-center mb-2">
            Meet Rebecca Louise
          </Text>
          <Text className="text-warmgrey text-sm text-center leading-6 mb-2">
            Financial educator and mum of two. Rebecca created MumVest to help every mum feel confident about money — no jargon, no judgement, just practical steps.
          </Text>

          <View className="bg-coral-light rounded-xl px-4 py-3 mt-2 mb-6">
            <Text className="text-warmgrey text-sm italic text-center">
              "You don't need to be a finance expert to take control of your money. You just need to start."
            </Text>
            <Text className="text-charcoal text-xs font-semibold text-center mt-1">
              — Rebecca Louise
            </Text>
          </View>
        </MotiView>

        <View className="w-full">
          <Button
            title="Continue"
            onPress={() => router.push('/(onboarding)/about-you')}
          />
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/about-you')}
            className="mt-3 items-center"
          >
            <Text className="text-warmgrey text-sm">Skip intro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
