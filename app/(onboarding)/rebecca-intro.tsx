import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
      <ScrollView className="flex-1" contentContainerClassName="px-7 pt-8 pb-6" showsVerticalScrollIndicator={false}>
        {/* Header label */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="items-center mb-5"
        >
          <Text className="text-warmgrey font-body-semi text-xs tracking-widest uppercase">
            A Message From
          </Text>
        </MotiView>

        {/* Video Placeholder */}
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}
          className="w-full mb-6"
        >
          <View className="w-full bg-charcoal/5 rounded-3xl items-center justify-center overflow-hidden border border-border py-10">
            <View className="rounded-full bg-coral items-center justify-center" style={{ width: 56, height: 56 }}>
              <Ionicons name="play" size={26} color="white" style={{ marginLeft: 3 }} />
            </View>
            <Text className="text-charcoal/70 font-body-medium text-sm mt-3">
              30-second welcome from Rebecca
            </Text>
            <Text className="text-warmgrey/50 font-body text-xs mt-1">Video coming soon</Text>
          </View>
        </MotiView>

        {/* Name & bio */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 250 }}
          className="items-center mb-5"
        >
          <Text className="text-charcoal font-heading text-2xl text-center mb-2">
            Meet Rebecca Louise
          </Text>
          <Text className="text-warmgrey font-body text-sm text-center leading-6 px-2">
            Financial educator and mum of two. Rebecca created MumVest to help every mum feel confident about money — no jargon, no judgement, just practical steps.
          </Text>
        </MotiView>

        {/* Quote card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 400 }}
          className="mb-6"
        >
          <View className="bg-coral-light/50 rounded-2xl px-6 py-4 border border-coral/10">
            <Text className="text-charcoal font-body text-base italic text-center leading-7">
              "You don't need to be a finance expert to take control of your money. You just need to start."
            </Text>
            <Text className="text-coral-dark font-body-semi text-xs text-center mt-2">
              — Rebecca Louise
            </Text>
          </View>
        </MotiView>

        {/* CTA */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 550 }}
          className="w-full"
        >
          <Button
            title="Continue"
            onPress={() => router.push('/(onboarding)/about-you')}
            size="lg"
          />
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/about-you')}
            className="mt-4 py-2 items-center"
          >
            <Text className="text-warmgrey font-body text-sm">Skip intro</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
