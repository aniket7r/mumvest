import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../../utils/haptics';
import { useGoalsStore } from '../../stores/useGoalsStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useUserStore } from '../../stores/useUserStore';
import { Button } from '../../components/ui/Button';
import { CelebrationOverlay } from '../../components/ui/CelebrationOverlay';
import { GOAL_PRESETS, type GoalType, type ReminderFrequency } from '../../types/goal';
import { getCurrencySymbol } from '../../utils/currency';
import { colors } from '../../theme/colors';
import { XP_REWARDS } from '../../utils/constants';
import { checkBadges } from '../../utils/checkBadges';

const REMINDER_OPTIONS: { value: ReminderFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'A gentle daily nudge' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week check-in' },
  { value: 'fortnightly', label: 'Fortnightly', description: 'Every two weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Monthly reminder' },
];

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CreateGoalScreen() {
  const router = useRouter();
  const createGoal = useGoalsStore((s) => s.createGoal);
  const canCreateGoal = useGoalsStore((s) => s.canCreateGoal);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const currency = useUserStore((s) => s.currency);
  const recordActivity = useGamificationStore((s) => s.recordActivity);
  const goalLimitReached = !canCreateGoal(isPro);

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetMonths, setTargetMonths] = useState<string>('');
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('weekly');
  const [reminderDay, setReminderDay] = useState('Monday');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const addXP = useGamificationStore((s) => s.addXP);

  const selectedPreset = GOAL_PRESETS.find((p) => p.type === selectedType);

  const handleSelectType = (type: GoalType) => {
    const preset = GOAL_PRESETS.find((p) => p.type === type);
    setSelectedType(type);
    if (preset && type !== 'custom') {
      setName(preset.label);
      setEmoji(preset.emoji);
    }
    setStep(2);
  };

  const handleCreate = async () => {
    if (!selectedType || !name.trim() || !targetAmount) return;
    setIsLoading(true);

    try {
      const months = parseInt(targetMonths, 10);
      const targetDate = months > 0
        ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await createGoal({
        name: name.trim(),
        emoji: emoji || '🎯',
        type: selectedType,
        targetAmount: parseFloat(targetAmount),
        targetDate,
        reminderFrequency,
        reminderDay: reminderFrequency === 'weekly' || reminderFrequency === 'fortnightly' ? reminderDay : undefined,
      });
      recordActivity();
      addXP(XP_REWARDS.SAVINGS_LOGGED);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      checkBadges();
      setShowSuccess(true);
    } catch (error) {
      console.error('Create goal error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-5">
        <CelebrationOverlay
          visible
          emoji={emoji || '🎯'}
          message="Goal Created!"
          subMessage="You're one step closer to your dream"
        />
        <View className="absolute bottom-12 left-5 right-5">
          <Button title="Start Logging Savings" onPress={() => router.back()} />
          <Text className="text-warmgrey text-xs text-center mt-3">
            Log your first saving to get started!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSteps = 3;

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-5 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-charcoal text-xl font-bold flex-1">New Goal</Text>
          <View className="bg-coral-light rounded-full px-3 py-1">
            <Text className="text-coral text-xs font-bold">Step {step}/{totalSteps}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="px-5 mb-4">
          <View className="h-1.5 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-coral rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </View>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {step === 1 && goalLimitReached && (
            <View className="items-center py-8 px-4">
              <Text className="text-4xl mb-3">🔒</Text>
              <Text className="text-charcoal text-lg font-bold text-center mb-2">
                Free plan allows 2 goals
              </Text>
              <Text className="text-warmgrey text-sm text-center mb-6">
                Upgrade to MumVest Pro for unlimited savings goals and 16 more lessons!
              </Text>
              <Button title="Unlock Unlimited Goals" onPress={() => router.push('/paywall')} />
            </View>
          )}

          {step === 1 && !goalLimitReached && (
            <View>
              <Text className="text-charcoal text-2xl font-bold mb-2 mt-4">
                What are you saving for?
              </Text>
              <Text className="text-warmgrey text-sm mb-6">
                Pick a goal type to get started
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {GOAL_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.type}
                    onPress={() => handleSelectType(preset.type)}
                    className={`w-[48%] bg-white rounded-2xl p-5 items-center mb-4 border-2 ${
                      selectedType === preset.type ? 'border-coral' : 'border-transparent'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text className="text-4xl mb-3">{preset.emoji}</Text>
                    <Text className="text-charcoal text-sm font-bold text-center">
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <View className="items-center my-8">
                <View className="w-20 h-20 rounded-full bg-white items-center justify-center">
                  <Text className="text-5xl">{emoji || '🎯'}</Text>
                </View>
              </View>

              <Text className="text-charcoal text-base font-bold mb-2">Goal name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Family Holiday to Spain"
                className="bg-white rounded-2xl px-5 py-4 text-base text-charcoal border border-border mb-6"
                placeholderTextColor="#BDC3C7"
              />

              <Text className="text-charcoal text-base font-bold mb-2">How much do you need?</Text>
              <View className="flex-row items-center bg-white rounded-2xl border border-border px-5 mb-6">
                <Text className="text-charcoal text-2xl font-bold mr-2">{getCurrencySymbol(currency)}</Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="flex-1 py-4 text-2xl text-charcoal font-bold"
                  placeholderTextColor="#BDC3C7"
                />
              </View>

              <Text className="text-charcoal text-base font-bold mb-3">By when? (optional)</Text>
              <View className="flex-row flex-wrap gap-2.5 mb-6">
                {[
                  { value: '3', label: '3 months' },
                  { value: '6', label: '6 months' },
                  { value: '12', label: '1 year' },
                  { value: '24', label: '2 years' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setTargetMonths(targetMonths === option.value ? '' : option.value)}
                    className={`bg-white rounded-full px-5 py-3 border-2 ${
                      targetMonths === option.value ? 'border-coral bg-coral-light' : 'border-border'
                    }`}
                  >
                    <Text className={`text-sm font-bold ${
                      targetMonths === option.value ? 'text-coral' : 'text-charcoal'
                    }`}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {targetMonths && targetAmount && parseFloat(targetAmount) > 0 && (
                <View className="bg-savings-light rounded-2xl px-5 py-4 mb-6 flex-row items-center">
                  <Ionicons name="calculator-outline" size={20} color={colors.success} />
                  <Text className="text-savings text-sm font-bold ml-3">
                    That's about {getCurrencySymbol(currency)}{(parseFloat(targetAmount) / parseInt(targetMonths, 10)).toFixed(0)}/month to hit your goal
                  </Text>
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View>
              <View className="items-center my-8">
                <View className="w-16 h-16 rounded-full bg-amber-light items-center justify-center mb-3">
                  <Text className="text-3xl">🔔</Text>
                </View>
                <Text className="text-charcoal text-xl font-bold">Saving reminders</Text>
                <Text className="text-warmgrey text-sm mt-2 text-center px-4">
                  We'll gently nudge you to log your savings
                </Text>
              </View>

              {REMINDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setReminderFrequency(option.value)}
                  className={`bg-white rounded-2xl p-5 mb-3 flex-row items-center border-2 ${
                    reminderFrequency === option.value ? 'border-coral' : 'border-transparent'
                  }`}
                >
                  <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                    reminderFrequency === option.value ? 'border-coral' : 'border-border'
                  }`}>
                    {reminderFrequency === option.value && (
                      <View className="w-3.5 h-3.5 rounded-full bg-coral" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-charcoal text-base font-bold">{option.label}</Text>
                    <Text className="text-warmgrey text-sm mt-0.5">{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {(reminderFrequency === 'weekly' || reminderFrequency === 'fortnightly') && (
                <View className="mt-4">
                  <Text className="text-charcoal text-base font-semibold mb-3">Which day?</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {DAY_OPTIONS.map((day) => (
                      <TouchableOpacity
                        key={day}
                        onPress={() => setReminderDay(day)}
                        className={`rounded-full px-4 py-2.5 mr-2 border ${
                          reminderDay === day ? 'bg-coral border-coral' : 'bg-white border-border'
                        }`}
                      >
                        <Text className={`text-sm font-semibold ${
                          reminderDay === day ? 'text-white' : 'text-charcoal'
                        }`}>{day.slice(0, 3)}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {step === 2 && (
          <View className="px-5 pb-6">
            <Button
              title="Next"
              onPress={() => setStep(3)}
              disabled={!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
            />
            <TouchableOpacity onPress={() => setStep(1)} className="items-center mt-3">
              <Text className="text-warmgrey text-sm">Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View className="px-5 pb-6">
            <Button
              title="Create Goal"
              onPress={handleCreate}
              loading={isLoading}
            />
            <TouchableOpacity onPress={() => setStep(2)} className="items-center mt-3">
              <Text className="text-warmgrey text-sm">Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
