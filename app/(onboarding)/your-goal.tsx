import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
      <View className="flex-1 px-6 pt-8">
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <Text className="text-warmgrey text-sm font-semibold mb-2">STEP 2 OF 3</Text>
          <Text className="text-charcoal text-2xl font-bold mb-2">Your First Goal</Text>
          <Text className="text-warmgrey text-base mb-8">What would you love to save for?</Text>
        </MotiView>

        <View className="flex-row flex-wrap justify-between">
          {GOAL_PRESETS.map((preset, index) => (
            <MotiView
              key={preset.type}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 300, delay: index * 80 }}
              className="w-[48%] mb-4"
            >
              <TouchableOpacity
                onPress={() => setSelectedGoal(preset.type)}
                className={`bg-white rounded-2xl p-4 items-center border-2 ${
                  selectedGoal === preset.type ? 'border-coral' : 'border-transparent'
                }`}
                activeOpacity={0.7}
              >
                <Text className="text-4xl mb-2">{preset.emoji}</Text>
                <Text className="text-charcoal text-sm font-semibold text-center">
                  {preset.label}
                </Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      </View>

      <View className="px-6 pb-6">
        <Button title="Continue" onPress={handleContinue} disabled={!selectedGoal} />
      </View>
    </SafeAreaView>
  );
}
