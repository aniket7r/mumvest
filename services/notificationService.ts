import { Platform } from 'react-native';
import { mmkv, KEYS } from '../stores/mmkv';

// Web-safe: notifications are no-ops on web
const isNative = Platform.OS !== 'web';

let Notifications: any = null;
if (isNative) {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function scheduleMoneyMomentNotification() {
  if (!isNative) return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const timeStr = mmkv.getString(KEYS.SETTINGS_NOTIFICATION_TIME) || '08:00';
  const [hours, minutes] = timeStr.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Today's Money Moment \u{1F4A1}",
      body: "Your 60-second money tip is ready. Small steps, big confidence!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

export async function scheduleStreakReminder() {
  if (!isNative) return;
  const currentStreak = mmkv.getNumber(KEYS.STREAK_CURRENT) || 0;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Don't lose your ${currentStreak}-day streak! \u{1F525}`,
      body: currentStreak > 7
        ? `You've been on fire for ${currentStreak} days! Don't break the chain.`
        : "Open MumVest to keep your savings streak alive.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

export async function scheduleWeeklySavingsReminder() {
  if (!isNative) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to log your savings! \u{1F4B0}",
      body: "Even small amounts add up. Log what you've saved this week!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Monday
      hour: 10,
      minute: 0,
    },
  });
}

export async function scheduleMilestoneNotifications() {
  if (!isNative) return;
  const firstLaunch = mmkv.getString(KEYS.APP_FIRST_LAUNCH);
  if (!firstLaunch) return;

  const daysSinceLaunch = Math.floor(
    (Date.now() - new Date(firstLaunch).getTime()) / (1000 * 60 * 60 * 24)
  );

  const milestones: { day: number; title: string; body: string }[] = [
    { day: 3, title: "3 days in! \u{1F389}", body: "You're building a great habit. Check today's money tip!" },
    { day: 7, title: "1 week strong! \u{1F4AA}", body: "You've been learning for a whole week. Keep the momentum going!" },
    { day: 10, title: "10 days of growth! \u{1F331}", body: "You're in the top 20% of committed savers. Amazing work!" },
    { day: 14, title: "2 weeks of winning! \u{1F3C6}", body: "14 days of building money confidence. You're unstoppable!" },
  ];

  for (const milestone of milestones) {
    if (daysSinceLaunch < milestone.day) {
      const daysUntil = milestone.day - daysSinceLaunch;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: milestone.title,
          body: milestone.body,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: daysUntil * 24 * 60 * 60,
          repeats: false,
        },
      });
    }
  }
}

export async function requestPermissionAndSchedule() {
  if (!isNative) return true; // Skip on web
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') return false;
  }

  await scheduleMoneyMomentNotification();
  await scheduleStreakReminder();
  await scheduleWeeklySavingsReminder();
  await scheduleMilestoneNotifications();
  return true;
}
