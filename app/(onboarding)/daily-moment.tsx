import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
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
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View className="px-7 pt-10">
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            className="mb-8"
          >
            <Text className="text-coral font-body-semi text-xs tracking-widest mb-3">STEP 3 OF 3</Text>
            <Text className="text-charcoal font-heading text-3xl mb-2">Daily Money Moments</Text>
            <Text className="text-warmgrey font-body text-base leading-7">
              Get a quick money tip every day — just 60 seconds to build smarter habits.
            </Text>
          </MotiView>

          {/* Preview card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            className="bg-white rounded-2xl p-5 mb-8 border border-border"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-amber-light items-center justify-center mr-3">
                <Text className="text-xl">💡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-charcoal font-body-semi text-base">The Freezer Batch Trick</Text>
                <Text className="text-warmgrey font-body text-sm mt-0.5">Save up to $120/month by cooking double...</Text>
              </View>
            </View>
            <View className="border-t border-border pt-3 mt-1">
              <Text className="text-warmgrey/60 font-body text-xs text-center">
                Preview of your daily Money Moment
              </Text>
            </View>
          </MotiView>

          {/* Notification info + time selector */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 400 }}
          >
            <View className="bg-coral-light/40 rounded-2xl px-5 py-4 mb-6 border border-coral/10">
              <Text className="text-charcoal font-body text-sm leading-6">
                We'll send one gentle notification per day at your chosen time. You can change this anytime in settings.
              </Text>
            </View>

            <Text className="text-charcoal font-body-semi text-base mb-4">
              When should we remind you?
            </Text>

            {TIME_OPTIONS.map((option) => {
              const isSelected = selectedTime === option.id && notificationsEnabled;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setSelectedTime(option.id);
                    setNotificationsEnabled(true);
                  }}
                  className={`flex-row items-center rounded-2xl px-5 py-4 mb-3 border-2 ${
                    isSelected
                      ? 'bg-coral-light/30 border-coral'
                      : 'bg-white border-border'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`font-body-semi text-base flex-1 ${isSelected ? 'text-coral-dark' : 'text-charcoal'}`}>
                    {option.label}
                  </Text>
                  <Text className="text-warmgrey font-body text-sm">{option.description}</Text>
                  <View
                    className={`w-5 h-5 rounded-full items-center justify-center ml-3 ${
                      isSelected ? 'bg-coral' : 'border-2 border-border'
                    }`}
                  >
                    {isSelected && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => setNotificationsEnabled(false)}
              className={`flex-row items-center rounded-2xl px-5 py-4 mt-1 border-2 ${
                !notificationsEnabled
                  ? 'bg-charcoal/5 border-charcoal/20'
                  : 'bg-white border-border'
              }`}
              activeOpacity={0.7}
            >
              <Text className="text-warmgrey font-body text-base flex-1">Maybe later</Text>
              {!notificationsEnabled && (
                <View className="w-5 h-5 rounded-full bg-charcoal/30 items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </MotiView>
        </View>
      </ScrollView>

      <View className="px-7 pb-6 pt-3 bg-cream">
        <Button
          title="Start My Journey"
          onPress={handleFinish}
          loading={isLoading}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
