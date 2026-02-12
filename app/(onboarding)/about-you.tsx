import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
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
      <View className="flex-1 px-6 pt-8">
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <Text className="text-warmgrey text-sm font-semibold mb-2">STEP 1 OF 3</Text>
          <Text className="text-charcoal text-2xl font-bold mb-2">About You</Text>
          <Text className="text-warmgrey text-base mb-8">Let's personalize your experience</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <Text className="text-charcoal text-base font-semibold mb-2">What should we call you?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your first name"
            className="bg-white rounded-xl px-4 py-3.5 text-base text-charcoal border border-border mb-8"
            placeholderTextColor="#BDC3C7"
            autoCapitalize="words"
          />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
        >
          <Text className="text-charcoal text-base font-semibold mb-3">Where are you on your money journey?</Text>

          {SITUATIONS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSituation(item.id)}
              className={`flex-row items-center bg-white rounded-xl px-4 py-3.5 mb-3 border ${
                situation === item.id ? 'border-coral' : 'border-border'
              }`}
              activeOpacity={0.7}
            >
              <Text className="text-2xl mr-3">{item.emoji}</Text>
              <View className="flex-1">
                <Text className="text-charcoal text-base font-semibold">{item.label}</Text>
                <Text className="text-warmgrey text-sm">{item.description}</Text>
              </View>
              {situation === item.id && (
                <View className="w-5 h-5 rounded-full bg-coral items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </MotiView>
      </View>

      <View className="px-6 pb-6">
        <Button title="Continue" onPress={handleContinue} disabled={!canContinue} />
      </View>
    </SafeAreaView>
  );
}
