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
      colors={['#FF8E8E', '#FFCDB8', '#FFF9F5']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ flex: 1 }}
    >
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-center items-center px-8">
        {/* Hero branding block */}
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 700 }}
          className="items-center mb-6"
        >
          <Text className="text-7xl mb-5">💰</Text>
          <Text className="text-charcoal font-heading text-4xl text-center mb-2">
            MumVest
          </Text>
          <Text className="text-coral-dark font-body-semi text-lg text-center tracking-wide">
            Money Confidence for Busy Mums
          </Text>
        </MotiView>

        {/* Description + social proof + CTA */}
        <MotiView
          from={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 650, delay: 350 }}
          className="w-full"
        >
          <Text className="text-warmgrey font-body text-base text-center mb-8 leading-7 px-2">
            Small steps, big savings. Build your family's financial future with daily tips, savings goals, and smart money swaps.
          </Text>

          <View className="bg-white/60 rounded-2xl py-4 px-3 flex-row justify-center items-center mb-10">
            <View className="items-center flex-1">
              <Text className="text-charcoal font-body-bold text-xl">10,000+</Text>
              <Text className="text-warmgrey font-body text-xs mt-1">Mums saving</Text>
            </View>
            <View className="w-px h-10 bg-border" />
            <View className="items-center flex-1">
              <Text className="text-charcoal font-body-bold text-xl">$2.4M+</Text>
              <Text className="text-warmgrey font-body text-xs mt-1">Saved together</Text>
            </View>
            <View className="w-px h-10 bg-border" />
            <View className="items-center flex-1">
              <Text className="text-charcoal font-body-bold text-xl">4.9 ★</Text>
              <Text className="text-warmgrey font-body text-xs mt-1">App rating</Text>
            </View>
          </View>

          <Button
            title="Let's Get Started"
            onPress={() => router.push('/(onboarding)/rebecca-intro')}
            size="lg"
          />

          <TouchableOpacity
            onPress={() => Alert.alert('Coming Soon', 'Account sign-in will be available in a future update.')}
            className="mt-5 py-2"
          >
            <Text className="text-warmgrey font-body text-sm text-center">
              Already have an account? <Text className="text-coral font-body-semi">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>

      {/* Bottom quote card */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500, delay: 700 }}
        className="pb-5 px-8"
      >
        <View className="bg-white/80 rounded-2xl px-6 py-4 mb-3">
          <Text className="text-charcoal/80 font-body text-sm italic text-center leading-6">
            "Every mum deserves to feel confident about money."
          </Text>
          <Text className="text-coral-dark font-body-semi text-xs text-center mt-2">
            — Rebecca Louise
          </Text>
        </View>
        <Text className="text-warmgrey/60 font-body text-xs text-center">
          Built with love for families everywhere
        </Text>
      </MotiView>
    </SafeAreaView>
    </LinearGradient>
  );
}
