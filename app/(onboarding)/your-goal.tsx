import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Button } from '../../components/ui/Button';
import { GOAL_PRESETS } from '../../types/goal';
import { mmkv } from '../../stores/mmkv';

export default function YourGoalScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedGoal) {
      mmkv.set('onboarding.tempGoalType', selectedGoal);
      router.push('/(onboarding)/daily-moment');
    }
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
            className="mb-8"
          >
            <Text className="text-coral font-body-semi text-xs tracking-widest mb-3">STEP 2 OF 3</Text>
            <Text className="text-charcoal font-heading text-3xl mb-2">Your First Goal</Text>
            <Text className="text-warmgrey font-body text-base leading-6">
              What would you love to save for?
            </Text>
          </MotiView>

          {/* Goal grid */}
          <View className="flex-row flex-wrap justify-between">
            {GOAL_PRESETS.map((preset, index) => {
              const isSelected = selectedGoal === preset.type;
              return (
                <MotiView
                  key={preset.type}
                  from={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', duration: 300, delay: index * 70 }}
                  className="w-[48%] mb-4"
                >
                  <TouchableOpacity
                    onPress={() => setSelectedGoal(preset.type)}
                    className={`rounded-2xl py-5 px-4 items-center border-2 ${
                      isSelected
                        ? 'bg-coral-light/30 border-coral'
                        : 'bg-white border-border'
                    }`}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <View className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-coral items-center justify-center">
                        <Text className="text-white text-xs">✓</Text>
                      </View>
                    )}
                    <Text className="text-4xl mb-3">{preset.emoji}</Text>
                    <Text className="text-charcoal font-body-semi text-sm text-center">
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="px-7 pb-6 pt-3 bg-cream">
        <Button title="Continue" onPress={handleContinue} disabled={!selectedGoal} size="lg" />
      </View>
    </SafeAreaView>
  );
}
