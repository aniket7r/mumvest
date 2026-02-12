import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Button } from '../../components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#FF8E8E', '#FFB89A', '#FFF9F5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-center items-center px-8">
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 600 }}
          className="items-center"
        >
          <Text className="text-6xl mb-4">💰</Text>
          <Text className="text-charcoal text-3xl font-bold text-center mb-3">
            MumVest
          </Text>
          <Text className="text-coral text-lg font-semibold text-center mb-6">
            Money Confidence for Busy Mums
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
          className="w-full"
        >
          <Text className="text-warmgrey text-base text-center mb-6 leading-6">
            Small steps, big savings. Build your family's financial future with daily tips, savings goals, and smart money swaps.
          </Text>

          <View className="flex-row justify-center items-center mb-8">
            <View className="items-center mx-4">
              <Text className="text-charcoal text-lg font-bold">10,000+</Text>
              <Text className="text-warmgrey text-xs">Mums saving</Text>
            </View>
            <View className="w-px h-8 bg-border" />
            <View className="items-center mx-4">
              <Text className="text-charcoal text-lg font-bold">$2.4M+</Text>
              <Text className="text-warmgrey text-xs">Saved together</Text>
            </View>
            <View className="w-px h-8 bg-border" />
            <View className="items-center mx-4">
              <Text className="text-charcoal text-lg font-bold">4.9 ★</Text>
              <Text className="text-warmgrey text-xs">App rating</Text>
            </View>
          </View>

          <Button
            title="Let's Get Started"
            onPress={() => router.push('/(onboarding)/rebecca-intro')}
          />

          <TouchableOpacity
            onPress={() => Alert.alert('Coming Soon', 'Account sign-in will be available in a future update.')}
            className="mt-4"
          >
            <Text className="text-warmgrey text-sm text-center">
              Already have an account? <Text className="text-coral font-semibold">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 600 }}
        className="pb-4 px-8"
      >
        <View className="bg-white rounded-xl px-4 py-3 mb-3">
          <Text className="text-warmgrey text-sm italic text-center">
            "Every mum deserves to feel confident about money."
          </Text>
          <Text className="text-charcoal text-xs font-semibold text-center mt-1">— Rebecca Louise</Text>
        </View>
        <Text className="text-warmgrey text-xs text-center">
          Built with love for families everywhere
        </Text>
      </MotiView>
    </SafeAreaView>
    </LinearGradient>
  );
}
