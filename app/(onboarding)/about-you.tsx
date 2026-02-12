import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Button } from '../../components/ui/Button';
import { mmkv, KEYS } from '../../stores/mmkv';
import type { FinancialSituation } from '../../types';

const SITUATIONS: { id: FinancialSituation; emoji: string; label: string; description: string }[] = [
  { id: 'just_starting', emoji: '🌱', label: 'Just Starting', description: "I'm new to managing money" },
  { id: 'some_savings', emoji: '💪', label: 'Building Up', description: 'I have some savings going' },
  { id: 'debt_focused', emoji: '🎯', label: 'Paying Off Debt', description: 'Focused on reducing debt' },
  { id: 'growing_wealth', emoji: '🚀', label: 'Growing Wealth', description: 'Ready to grow what I have' },
];

export default function AboutYouScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [situation, setSituation] = useState<FinancialSituation | null>(null);

  const canContinue = name.trim().length > 0 && situation !== null;

  const handleContinue = () => {
    // Store temporarily in MMKV until onboarding completes
    mmkv.set('onboarding.tempName', name.trim());
    mmkv.set('onboarding.tempSituation', situation!);
    router.push('/(onboarding)/your-goal');
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-7 pt-10">
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            className="mb-10"
          >
            <Text className="text-coral font-body-semi text-xs tracking-widest mb-3">STEP 1 OF 3</Text>
            <Text className="text-charcoal font-heading text-3xl mb-2">About You</Text>
            <Text className="text-warmgrey font-body text-base leading-6">
              Let's personalize your experience
            </Text>
          </MotiView>

          {/* Name input section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            className="mb-10"
          >
            <Text className="text-charcoal font-body-semi text-base mb-3">
              What should we call you?
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your first name"
              className="bg-white rounded-2xl px-5 py-4 text-base text-charcoal border-2 border-border font-body"
              placeholderTextColor="#BDC3C7"
              autoCapitalize="words"
            />
          </MotiView>

          {/* Financial situation section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 400 }}
          >
            <Text className="text-charcoal font-body-semi text-base mb-4">
              Where are you on your money journey?
            </Text>

            {SITUATIONS.map((item) => {
              const isSelected = situation === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSituation(item.id)}
                  className={`flex-row items-center rounded-2xl px-5 py-4 mb-3 border-2 ${
                    isSelected
                      ? 'bg-coral-light/30 border-coral'
                      : 'bg-white border-border'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-3xl mr-4">{item.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-charcoal font-body-semi text-base">{item.label}</Text>
                    <Text className="text-warmgrey font-body text-sm mt-0.5">{item.description}</Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      isSelected ? 'bg-coral' : 'border-2 border-border'
                    }`}
                  >
                    {isSelected && (
                      <Text className="text-white text-xs font-body-semi">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </MotiView>
        </View>
      </ScrollView>

      <View className="px-7 pb-6 pt-3 bg-cream">
        <Button title="Continue" onPress={handleContinue} disabled={!canContinue} size="lg" />
      </View>
    </SafeAreaView>
  );
}
