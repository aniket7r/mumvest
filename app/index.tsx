import { Redirect } from 'expo-router';
import { useUserStore } from '../stores/useUserStore';

export default function Index() {
  const onboardingCompleted = useUserStore((s) => s.onboardingCompleted);
  const isLoading = useUserStore((s) => s.isLoading);

  if (isLoading) return null;

  if (!onboardingCompleted) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
