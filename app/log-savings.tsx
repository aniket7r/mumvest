import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Haptics } from '../utils/haptics';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useGamificationStore } from '../stores/useGamificationStore';
import { Button } from '../components/ui/Button';
import { CelebrationOverlay } from '../components/ui/CelebrationOverlay';
import { SAVINGS_METHODS } from '../types/savings';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import { useUserStore } from '../stores/useUserStore';
import { XP_REWARDS } from '../utils/constants';
import { colors } from '../theme/colors';
import { checkBadges } from '../utils/checkBadges';

export default function LogSavingsScreen() {
  const router = useRouter();
  const { goals } = useGoalsStore();
  const logSavings = useGoalsStore((s) => s.logSavings);
  const currency = useUserStore((s) => s.currency);
  const recordActivity = useGamificationStore((s) => s.recordActivity);
  const addXP = useGamificationStore((s) => s.addXP);

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goals[0]?.id || null);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [goalCompleted, setGoalCompleted] = useState(false);
  const getGoalProgress = useGoalsStore((s) => s.getGoalProgress);

  const handleSubmit = async () => {
    if (!selectedGoalId || !amount || parseFloat(amount) <= 0) return;
    setIsLoading(true);

    try {
      await logSavings({
        goalId: selectedGoalId,
        amount: parseFloat(amount),
        method: selectedMethod || undefined,
        note: note.trim() || undefined,
      });

      recordActivity();
      addXP(XP_REWARDS.SAVINGS_LOGGED);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      checkBadges();

      // Check if goal just completed
      const progress = getGoalProgress(selectedGoalId);
      const justCompleted = progress.percentage >= 100;
      if (justCompleted) {
        setGoalCompleted(true);
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.back();
      }, justCompleted ? 2500 : 1500);
    } catch (error) {
      console.error('Log savings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <CelebrationOverlay
          visible
          emoji={goalCompleted ? '🏆' : '💰'}
          message={goalCompleted ? 'Goal Complete!' : 'Saved!'}
          subMessage={goalCompleted ? 'You did it! Amazing work!' : parseFloat(amount) >= 50 ? `Wow! ${formatCurrency(parseFloat(amount), currency)} — you're crushing it!` : parseFloat(amount) >= 10 ? `Nice save! ${formatCurrency(parseFloat(amount), currency)}` : `Every dollar counts! +${formatCurrency(parseFloat(amount), currency)}`}
        />
        <Text className="text-warmgrey text-sm mt-48">+{XP_REWARDS.SAVINGS_LOGGED} XP</Text>
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
        <View className="flex-row items-center px-5 pt-5 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-charcoal text-2xl font-bold">Log Savings</Text>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {goals.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-4xl mb-3">🎯</Text>
              <Text className="text-charcoal text-base font-semibold mb-2">Create a Goal First</Text>
              <Text className="text-warmgrey text-sm text-center mb-4">
                Set up a savings goal so you have somewhere to log your progress
              </Text>
              <Button title="Create Goal" onPress={() => router.push('/goal/create')} variant="primary" />
            </View>
          ) : null}

          {goals.length > 0 && (
            <>
          {/* Goal Selector */}
          <Text className="text-charcoal text-base font-bold mt-6 mb-3">Which goal?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                onPress={() => setSelectedGoalId(goal.id)}
                className={`mr-3 bg-white rounded-2xl px-5 py-4 items-center border-2 min-w-[90px] ${
                  selectedGoalId === goal.id ? 'border-coral' : 'border-transparent'
                }`}
              >
                <Text className="text-2xl mb-1.5">{goal.emoji}</Text>
                <Text className={`text-xs font-bold ${selectedGoalId === goal.id ? 'text-coral' : 'text-charcoal'}`} numberOfLines={1}>
                  {goal.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Amount */}
          <Text className="text-charcoal text-base font-bold mb-3">How much?</Text>
          <View className="flex-row items-center bg-white rounded-2xl border border-border px-5 mb-8">
            <Text className="text-charcoal text-3xl font-bold mr-2">{getCurrencySymbol(currency)}</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="flex-1 py-5 text-3xl text-charcoal font-bold"
              placeholderTextColor="#BDC3C7"
              autoFocus
            />
          </View>

          {/* Method */}
          <Text className="text-charcoal text-base font-bold mb-3">How did you save? (optional)</Text>
          <View className="flex-row flex-wrap gap-2.5 mb-8">
            {SAVINGS_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
                className={`bg-white rounded-full px-4 py-2.5 flex-row items-center border-2 ${
                  selectedMethod === method.id ? 'border-coral bg-coral-light' : 'border-border'
                }`}
              >
                <Text className="mr-1.5 text-base">{method.emoji}</Text>
                <Text className={`text-sm ${
                  selectedMethod === method.id ? 'text-coral font-bold' : 'text-charcoal font-medium'
                }`}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note */}
          <Text className="text-charcoal text-base font-bold mb-2">Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What did you save on?"
            className="bg-white rounded-2xl px-5 py-4 text-base text-charcoal border border-border mb-6"
            placeholderTextColor="#BDC3C7"
          />
            </>
          )}
        </ScrollView>

        <View className="px-5 pb-6">
          <Button
            title={amount ? `Save ${formatCurrency(parseFloat(amount) || 0, currency)}` : 'Enter amount'}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!selectedGoalId || !amount || parseFloat(amount) <= 0}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
