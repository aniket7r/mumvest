import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../../utils/haptics';
import { useGoalsStore } from '../../stores/useGoalsStore';
import { useUserStore } from '../../stores/useUserStore';
import { Button } from '../../components/ui/Button';
import { getCurrencySymbol } from '../../utils/currency';
import { colors } from '../../theme/colors';
import type { ReminderFrequency } from '../../types/goal';

const REMINDER_OPTIONS: { value: ReminderFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
];

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditGoalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals } = useGoalsStore();
  const updateGoal = useGoalsStore((s) => s.updateGoal);
  const currency = useUserStore((s) => s.currency);

  const goal = goals.find((g) => g.id === id);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>('weekly');
  const [reminderDay, setReminderDay] = useState('Monday');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setTargetDate(goal.targetDate);
      setReminderFrequency(goal.reminderFrequency);
      setReminderDay(goal.reminderDay || 'Monday');
    }
  }, [goal?.id]);

  const handleSave = async () => {
    if (!goal || !name.trim() || !targetAmount) return;
    setIsSaving(true);
    try {
      await updateGoal(goal.id, {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        targetDate,
        reminderFrequency,
        reminderDay: reminderFrequency === 'weekly' || reminderFrequency === 'fortnightly' ? reminderDay : null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error('Edit goal error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!goal) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-warmgrey">Goal not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-charcoal text-xl font-bold flex-1">Edit Goal</Text>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          <View className="items-center my-4">
            <Text className="text-5xl">{goal.emoji}</Text>
          </View>

          <Text className="text-charcoal text-base font-semibold mb-2">Goal name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Goal name"
            className="bg-white rounded-xl px-4 py-3.5 text-base text-charcoal border border-border mb-6"
            placeholderTextColor="#BDC3C7"
          />

          <Text className="text-charcoal text-base font-semibold mb-2">Target amount</Text>
          <View className="flex-row items-center bg-white rounded-xl border border-border px-4 mb-6">
            <Text className="text-charcoal text-xl font-bold mr-2">{getCurrencySymbol(currency)}</Text>
            <TextInput
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="flex-1 py-3.5 text-xl text-charcoal font-bold"
              placeholderTextColor="#BDC3C7"
            />
          </View>

          <Text className="text-charcoal text-base font-semibold mb-2">Target date (optional)</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {[
              { value: 3, label: '3 months' },
              { value: 6, label: '6 months' },
              { value: 12, label: '1 year' },
              { value: 24, label: '2 years' },
            ].map((option) => {
              const optDate = new Date(Date.now() + option.value * 30 * 24 * 60 * 60 * 1000).toISOString();
              const isSelected = targetDate && Math.abs(new Date(targetDate).getTime() - new Date(optDate).getTime()) < 15 * 24 * 60 * 60 * 1000;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setTargetDate(isSelected ? null : optDate)}
                  className={`bg-white rounded-full px-4 py-2.5 border ${
                    isSelected ? 'border-coral' : 'border-border'
                  }`}
                >
                  <Text className={`text-sm font-semibold ${
                    isSelected ? 'text-coral' : 'text-charcoal'
                  }`}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
            {targetDate && (
              <TouchableOpacity onPress={() => setTargetDate(null)} className="bg-white rounded-full px-4 py-2.5 border border-border">
                <Text className="text-warmgrey text-sm">Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-charcoal text-base font-semibold mb-3">Reminder frequency</Text>
          {REMINDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setReminderFrequency(option.value)}
              className={`bg-white rounded-2xl p-4 mb-2 flex-row items-center border-2 ${
                reminderFrequency === option.value ? 'border-coral' : 'border-transparent'
              }`}
            >
              <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                reminderFrequency === option.value ? 'border-coral' : 'border-border'
              }`}>
                {reminderFrequency === option.value && (
                  <View className="w-3 h-3 rounded-full bg-coral" />
                )}
              </View>
              <Text className="text-charcoal text-base font-semibold">{option.label}</Text>
            </TouchableOpacity>
          ))}

          {(reminderFrequency === 'weekly' || reminderFrequency === 'fortnightly') && (
            <View className="mt-3 mb-6">
              <Text className="text-charcoal text-sm font-semibold mb-2">Which day?</Text>
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

          <View className="h-8" />
        </ScrollView>

        <View className="px-5 pb-6">
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isSaving}
            disabled={!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
