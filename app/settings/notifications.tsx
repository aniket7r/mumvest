import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useUserStore } from '../../stores/useUserStore';
import { scheduleMoneyMomentNotification } from '../../services/notificationService';
import { colors } from '../../theme/colors';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { notificationEnabled, notificationTime, toggleNotifications, updateNotificationTime } = useUserStore();

  const TIME_OPTIONS = ['07:00', '08:00', '12:00', '20:00'];
  const TIME_LABELS: Record<string, string> = {
    '07:00': '7:00 AM',
    '08:00': '8:00 AM',
    '12:00': '12:00 PM',
    '20:00': '8:00 PM',
  };

  const handleToggle = async (enabled: boolean) => {
    toggleNotifications(enabled);
    if (enabled) {
      await scheduleMoneyMomentNotification();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const handleTimeChange = async (time: string) => {
    updateNotificationTime(time);
    // Reschedule with the new time
    await scheduleMoneyMomentNotification();
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-charcoal text-xl font-bold">Notifications</Text>
      </View>

      <View className="px-5 mt-4">
        {/* Toggle */}
        <View className="bg-white rounded-xl px-4 py-4 flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-charcoal text-base font-semibold">Daily Money Moments</Text>
            <Text className="text-warmgrey text-sm">Get a daily money tip</Text>
          </View>
          <Switch
            value={notificationEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {/* Time Picker */}
        {notificationEnabled && (
          <View>
            <Text className="text-charcoal text-base font-semibold mb-3">Reminder time</Text>
            {TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => handleTimeChange(time)}
                className={`bg-white rounded-xl px-4 py-3.5 mb-2 flex-row items-center border ${
                  notificationTime === time ? 'border-coral' : 'border-transparent'
                }`}
              >
                <Text className="text-charcoal text-base flex-1">{TIME_LABELS[time]}</Text>
                {notificationTime === time && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
