import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Notifications from 'expo-notifications';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../stores/useUserStore';
import { useGoalsStore } from '../../stores/useGoalsStore';
import { mmkv } from '../../stores/mmkv';
import { GOAL_PRESETS } from '../../types/goal';
import type { FinancialSituation, OnboardingSelections } from '../../types';
import { DEFAULT_NOTIFICATION_TIME } from '../../utils/constants';
import { scheduleMoneyMomentNotification } from '../../services/notificationService';

const TIME_OPTIONS = [
  { id: '07:00', label: '7:00 AM', description: 'Early bird' },
  { id: '08:00', label: '8:00 AM', description: 'Morning routine' },
  { id: '12:00', label: '12:00 PM', description: 'Lunch break' },
  { id: '20:00', label: '8:00 PM', description: 'Wind down' },
];

export default function DailyMomentScreen() {
  const router = useRouter();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const createGoal = useGoalsStore((s) => s.createGoal);
  const [selectedTime, setSelectedTime] = useState(DEFAULT_NOTIFICATION_TIME);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    setIsLoading(true);

    try {
      // Request notification permissions
      if (notificationsEnabled) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          setNotificationsEnabled(false);
        }
      }

      // Gather all onboarding selections
      const selections: OnboardingSelections = {
        name: mmkv.getString('onboarding.tempName') || 'Friend',
        situation: (mmkv.getString('onboarding.tempSituation') as FinancialSituation) || 'just_starting',
        goalType: mmkv.getString('onboarding.tempGoalType') || 'emergency',
        notificationTime: selectedTime,
        notificationsEnabled,
      };

      await completeOnboarding(selections);

      // Create the first goal from the selected preset
      const goalType = selections.goalType;
      const preset = GOAL_PRESETS.find((p) => p.type === goalType);
      if (preset) {
        await createGoal({
          name: preset.label,
          emoji: preset.emoji,
          type: preset.type,
          targetAmount: goalType === 'emergency' ? 1000 : goalType === 'holiday' ? 2000 : goalType === 'christmas' ? 500 : 1000,
        });
      }

      // Schedule daily notification
      if (notificationsEnabled) {
        await scheduleMoneyMomentNotification();
      }

      // Clean up temp values
      mmkv.delete('onboarding.tempName');
      mmkv.delete('onboarding.tempSituation');
      mmkv.delete('onboarding.tempGoalType');

      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Oops', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
          <Text className="text-warmgrey text-sm font-semibold mb-2">STEP 3 OF 3</Text>
          <Text className="text-charcoal text-2xl font-bold mb-2">Daily Money Moments</Text>
          <Text className="text-warmgrey text-base mb-8">
            Get a quick money tip every day — just 60 seconds to build smarter habits.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          className="bg-white rounded-2xl p-5 mb-6"
        >
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-3">💡</Text>
            <View className="flex-1">
              <Text className="text-charcoal text-base font-semibold">The Freezer Batch Trick</Text>
              <Text className="text-warmgrey text-sm">Save up to $120/month by cooking double...</Text>
            </View>
          </View>
          <Text className="text-xs text-warmgrey">Preview of your daily Money Moment</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
        >
          <View className="bg-coral-light rounded-xl px-4 py-3 mb-4">
            <Text className="text-charcoal text-sm">
              We'll send one gentle notification per day at your chosen time. You can change this anytime in settings.
            </Text>
          </View>

          <Text className="text-charcoal text-base font-semibold mb-3">
            When should we remind you?
          </Text>

          {TIME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                setSelectedTime(option.id);
                setNotificationsEnabled(true);
              }}
              className={`flex-row items-center bg-white rounded-xl px-4 py-3 mb-2 border ${
                selectedTime === option.id && notificationsEnabled
                  ? 'border-coral'
                  : 'border-border'
              }`}
              activeOpacity={0.7}
            >
              <Text className="text-charcoal text-base flex-1">{option.label}</Text>
              <Text className="text-warmgrey text-sm">{option.description}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => setNotificationsEnabled(false)}
            className={`flex-row items-center bg-white rounded-xl px-4 py-3 mt-2 border ${
              !notificationsEnabled ? 'border-coral' : 'border-border'
            }`}
            activeOpacity={0.7}
          >
            <Text className="text-warmgrey text-base flex-1">Maybe later</Text>
          </TouchableOpacity>
        </MotiView>
      </View>

      <View className="px-6 pb-6">
        <Button
          title="Start My Journey"
          onPress={handleFinish}
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}
