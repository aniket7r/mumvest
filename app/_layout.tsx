import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { runMigrations } from '../db/migrations';
import { useUserStore } from '../stores/useUserStore';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useGoalsStore } from '../stores/useGoalsStore';
import { useContentStore } from '../stores/useContentStore';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { requestPermissionAndSchedule } from '../services/notificationService';
import { colors } from '../theme/colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
  });
  const [isReady, setIsReady] = useState(false);
  const initUser = useUserStore((s) => s.initialize);
  const initGamification = useGamificationStore((s) => s.initialize);
  const loadGoals = useGoalsStore((s) => s.loadGoals);
  const initContent = useContentStore((s) => s.initialize);
  const initSubscription = useSubscriptionStore((s) => s.initialize);

  useEffect(() => {
    async function init() {
      try {
        await runMigrations();
        await Promise.all([
          initUser(),
          loadGoals(),
          initContent(),
          initSubscription(),
        ]);
        initGamification();
        // Schedule notifications if permission granted
        requestPermissionAndSchedule().catch(() => {});
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  if (!isReady || !fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="goal/create"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="log-savings"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="goal/[id]" />
          <Stack.Screen name="lesson/[id]" />
          <Stack.Screen name="money-moment/[id]" />
          <Stack.Screen name="money-moment/archive" />
          <Stack.Screen name="challenge/index" />
          <Stack.Screen name="challenge/[id]" />
          <Stack.Screen name="smart-swap/index" />
          <Stack.Screen name="savings-breakdown" />
          <Stack.Screen
            name="paywall"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="insights" />
          <Stack.Screen
            name="goal/edit"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/notifications" />
          <Stack.Screen name="settings/subscription" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
