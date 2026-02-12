import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { Button } from '../components/ui/Button';
import { MONTHLY_PRICE, ANNUAL_PRICE, TRIAL_DAYS } from '../utils/constants';
import { colors } from '../theme/colors';
import { useState } from 'react';

const FEATURES = [
  { icon: '📚', title: 'All 26 Lessons', description: 'Including Level 3: Growing Wealth' },
  { icon: '🏆', title: 'All Challenges', description: 'Advanced challenges to push yourself' },
  { icon: '💡', title: 'Saved Money Moments', description: 'Bookmark your favorites' },
  { icon: '📊', title: 'Advanced Analytics', description: 'Detailed savings breakdowns' },
  { icon: '🔔', title: 'Smart Reminders', description: 'Personalized notification timing' },
];

type PlanType = 'annual' | 'monthly';

export default function PaywallScreen() {
  const router = useRouter();
  const { purchaseMonthly, purchaseAnnual, restorePurchases, isLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    let success = false;
    if (selectedPlan === 'annual') {
      success = await purchaseAnnual();
    } else {
      success = await purchaseMonthly();
    }
    setPurchasing(false);
    if (success) {
      router.back();
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Close Button */}
        <View className="px-5 pt-5">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center">
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          className="items-center px-8 mt-6"
        >
          <View className="w-20 h-20 rounded-full bg-coral-light items-center justify-center mb-4">
            <Text className="text-4xl">💎</Text>
          </View>
          <Text className="text-charcoal text-3xl font-bold text-center mb-3">
            Unlock Your Full{'\n'}Money Potential
          </Text>
          <Text className="text-warmgrey text-base text-center leading-6 mb-4">
            Get everything MumVest has to offer with a Pro membership
          </Text>
          <View className="bg-amber-light rounded-full px-5 py-2.5">
            <Text className="text-amber text-sm font-bold text-center">
              Trusted by 10,000+ mums building financial confidence
            </Text>
          </View>
        </MotiView>

        {/* Features */}
        <View className="px-5 mt-8">
          {FEATURES.map((feature, index) => (
            <MotiView
              key={feature.title}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 300, delay: index * 100 }}
              className="flex-row items-center bg-white rounded-2xl px-5 py-4 mb-3"
            >
              <View className="w-10 h-10 rounded-full bg-coral-light items-center justify-center mr-4">
                <Text className="text-lg">{feature.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-charcoal text-base font-bold">{feature.title}</Text>
                <Text className="text-warmgrey text-sm mt-0.5">{feature.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            </MotiView>
          ))}
        </View>

        {/* Rebecca's Quote */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: FEATURES.length * 100 + 100 }}
          className="px-5 mt-6"
        >
          <View className="bg-white rounded-2xl p-5 border-l-4 border-l-coral">
            <Text className="text-charcoal text-base italic leading-6 mb-3">
              "Financial confidence isn't about how much you earn — it's about making smart choices every day. MumVest Pro gives you the tools to do exactly that."
            </Text>
            <Text className="text-charcoal text-sm font-bold">— Rebecca Louise</Text>
          </View>
        </MotiView>

        {/* Plan Selection */}
        <View className="px-5 mt-8">
          <Text className="text-charcoal text-lg font-bold mb-4">Choose your plan</Text>

          {/* Annual */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('annual')}
            className={`bg-white rounded-2xl p-5 mb-3 border-2 ${
              selectedPlan === 'annual' ? 'border-coral' : 'border-transparent'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-charcoal text-lg font-bold">Annual</Text>
                  <View className="bg-savings-light rounded-full px-3 py-1 ml-3">
                    <Text className="text-savings text-xs font-bold">SAVE 33%</Text>
                  </View>
                </View>
                <Text className="text-charcoal text-xl font-bold">{ANNUAL_PRICE}<Text className="text-warmgrey text-sm font-normal">/year</Text></Text>
                <View className="flex-row items-center mt-1.5">
                  <Ionicons name="gift-outline" size={14} color={colors.primary} />
                  <Text className="text-coral text-sm font-semibold ml-1">
                    {TRIAL_DAYS}-day free trial
                  </Text>
                </View>
              </View>
              <View className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                selectedPlan === 'annual' ? 'border-coral bg-coral' : 'border-border'
              }`}>
                {selectedPlan === 'annual' && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            className={`bg-white rounded-2xl p-5 mb-3 border-2 ${
              selectedPlan === 'monthly' ? 'border-coral' : 'border-transparent'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-charcoal text-lg font-bold mb-1">Monthly</Text>
                <Text className="text-charcoal text-xl font-bold">{MONTHLY_PRICE}<Text className="text-warmgrey text-sm font-normal">/month</Text></Text>
              </View>
              <View className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                selectedPlan === 'monthly' ? 'border-coral bg-coral' : 'border-border'
              }`}>
                {selectedPlan === 'monthly' && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <View className="px-5 mt-6">
          <Button
            title={selectedPlan === 'annual' ? `Start Free Trial` : `Subscribe for ${MONTHLY_PRICE}/mo`}
            onPress={handlePurchase}
            loading={purchasing}
          />

          <TouchableOpacity onPress={handleRestore} className="items-center mt-5 mb-2 py-1">
            <Text className="text-warmgrey text-sm font-medium">Restore Purchases</Text>
          </TouchableOpacity>

          <Text className="text-warmgrey/60 text-xs text-center mt-3 px-4 leading-5">
            Cancel anytime. Payment will be charged to your Apple ID account.
            Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
          </Text>
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
