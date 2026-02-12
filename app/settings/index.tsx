import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Haptics } from '../../utils/haptics';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useUserStore } from '../../stores/useUserStore';
import { mmkv, KEYS, clearAll } from '../../stores/mmkv';
import { JUDGE_SECRET_TAP_COUNT } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { markShared, checkBadges } from '../../utils/checkBadges';

export default function SettingsScreen() {
  const router = useRouter();
  const isPro = useSubscriptionStore((s) => s.isPro);
  const currency = useUserStore((s) => s.currency);
  const updateCurrency = useUserStore((s) => s.updateCurrency);
  const [versionTaps, setVersionTaps] = useState(0);

  const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  ];

  const handleCurrencyChange = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      CURRENCIES.map((c) => ({
        text: `${c.symbol} ${c.label}${c.code === currency ? ' ✓' : ''}`,
        onPress: () => updateCurrency(c.code as any),
      }))
    );
  };

  const handleVersionTap = () => {
    const newCount = versionTaps + 1;
    setVersionTaps(newCount);
    if (newCount >= JUDGE_SECRET_TAP_COUNT) {
      Alert.alert(
        'Judge Mode',
        'Premium features unlocked for evaluation. Thank you for reviewing MumVest!',
        [{ text: 'OK' }]
      );
      // Unlock premium for judges
      mmkv.set('judge.unlocked', true);
      useSubscriptionStore.setState({ isPro: true });
      setVersionTaps(0);
    }
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === currency);

  const handleReferral = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await Share.share({
        message: `Hey! I've been using MumVest to learn about money and track my savings. It's really helping me build financial confidence.\n\nDownload it and we both get a free week of Pro features!\n\nhttps://mumvest.app/invite`,
      });
      if (result.action === Share.sharedAction) {
        markShared();
        checkBadges();
      }
    } catch {}
  };

  const MENU_ITEMS = [
    {
      title: 'Currency',
      icon: 'cash-outline' as const,
      onPress: handleCurrencyChange,
      subtitle: `${currentCurrency?.symbol || '$'} ${currentCurrency?.code || 'USD'}`,
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline' as const,
      onPress: () => router.push('/settings/notifications'),
    },
    {
      title: 'Subscription',
      icon: 'card-outline' as const,
      onPress: () => isPro ? router.push('/settings/subscription') : router.push('/paywall'),
      subtitle: isPro ? 'Pro Member' : 'Free Plan',
    },
    {
      title: 'Refer a Friend',
      icon: 'gift-outline' as const,
      onPress: handleReferral,
      subtitle: 'Both get 1 week Pro free',
    },
    {
      title: 'Restore Purchases',
      icon: 'refresh-outline' as const,
      onPress: async () => {
        const restored = await useSubscriptionStore.getState().restorePurchases();
        Alert.alert(
          restored ? 'Restored!' : 'No Purchases Found',
          restored ? 'Your purchases have been restored.' : 'No active subscriptions found for this account.'
        );
      },
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3">
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-2xl font-bold">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-warmgrey text-xs mb-2.5 font-bold tracking-wider">GENERAL</Text>
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.title}
            onPress={item.onPress}
            className={`bg-white px-4 py-4 flex-row items-center ${
              idx === 0 ? 'rounded-t-2xl' : ''
            } ${idx === MENU_ITEMS.length - 1 ? 'rounded-b-2xl' : 'border-b border-border'}`}
            activeOpacity={0.7}
          >
            <View className="w-9 h-9 rounded-full bg-cream items-center justify-center">
              <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
            </View>
            <Text className="text-charcoal text-base font-medium flex-1 ml-3">{item.title}</Text>
            {item.subtitle && (
              <Text className="text-warmgrey text-sm mr-2">{item.subtitle}</Text>
            )}
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* Support */}
        <Text className="text-warmgrey text-xs mt-8 mb-2.5 font-bold tracking-wider">SUPPORT</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:hello@mumvest.app?subject=MumVest Feedback')}
          className="bg-white rounded-t-2xl px-4 py-4 flex-row items-center border-b border-border"
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-full bg-cream items-center justify-center">
            <Ionicons name="chatbox-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text className="text-charcoal text-base font-medium flex-1 ml-3">Send Feedback</Text>
          <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert('About MumVest', 'MumVest helps busy mums build money confidence through daily tips, savings goals, and smart money swaps.\n\nFounded by Rebecca Louise.\nVersion 1.0.0\n\nMade with love for families everywhere.')}
          className="bg-white rounded-b-2xl px-4 py-4 flex-row items-center mb-3"
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-full bg-cream items-center justify-center">
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text className="text-charcoal text-base font-medium flex-1 ml-3">About MumVest</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Account */}
        <Text className="text-warmgrey text-xs mt-8 mb-2.5 font-bold tracking-wider">ACCOUNT</Text>
        <TouchableOpacity
          onPress={() => Alert.alert(
            'Reset Progress',
            'This will clear all your savings data, lesson progress, and badges. This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Reset Everything',
                style: 'destructive',
                onPress: () => {
                  clearAll();
                  Alert.alert('Progress Reset', 'Please restart the app to complete the reset.');
                },
              },
            ]
          )}
          className="bg-white rounded-t-2xl px-4 py-4 flex-row items-center border-b border-border"
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-full bg-amber-light items-center justify-center">
            <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text className="text-charcoal text-base font-medium flex-1 ml-3">Reset Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert(
            'Delete Account',
            'This will permanently delete all your data from this device. This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete Account',
                style: 'destructive',
                onPress: () => {
                  clearAll();
                  Alert.alert('Account Deleted', 'All data has been removed. Please restart the app.');
                },
              },
            ]
          )}
          className="bg-white rounded-b-2xl px-4 py-4 flex-row items-center mb-3"
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-full bg-coral-light items-center justify-center">
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </View>
          <Text className="text-error text-base font-medium flex-1 ml-3">Delete Account</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text className="text-warmgrey text-xs mt-8 mb-2.5 font-bold tracking-wider">LEGAL</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://mumvest.app/privacy')}
          className="bg-white rounded-t-2xl px-4 py-4 flex-row items-center border-b border-border"
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-full bg-cream items-center justify-center">
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text className="text-charcoal text-base font-medium flex-1 ml-3">Privacy Policy</Text>
          <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://mumvest.app/terms')}
          className="bg-white rounded-b-2xl px-4 py-4 flex-row items-center mb-3"
          activeOpacity={0.7}
        >
          <View className="w-9 h-9 rounded-full bg-cream items-center justify-center">
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text className="text-charcoal text-base font-medium flex-1 ml-3">Terms of Service</Text>
          <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <View className="bg-white rounded-2xl px-5 py-4 mb-6">
          <Text className="text-warmgrey/60 text-xs leading-5">
            MumVest provides general financial education only. Nothing in this app constitutes financial advice. Always consult a qualified financial advisor for decisions specific to your situation. Past performance and savings estimates are not guarantees of future results.
          </Text>
        </View>

        {/* Version */}
        <TouchableOpacity onPress={handleVersionTap} className="items-center mb-8" activeOpacity={0.9}>
          <Text className="text-warmgrey text-xs">
            MumVest v1.0.0
          </Text>
          <Text className="text-warmgrey/40 text-xs mt-1">
            Made with ❤️ for busy mums
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
