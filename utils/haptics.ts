import { Platform } from 'react-native';

// Web-safe haptics wrapper — no-ops on web
export const Haptics = {
  impactAsync: async (style?: any) => {
    if (Platform.OS === 'web') return;
    const mod = require('expo-haptics');
    return mod.impactAsync(style);
  },
  notificationAsync: async (type?: any) => {
    if (Platform.OS === 'web') return;
    const mod = require('expo-haptics');
    return mod.notificationAsync(type);
  },
  selectionAsync: async () => {
    if (Platform.OS === 'web') return;
    const mod = require('expo-haptics');
    return mod.selectionAsync();
  },
  ImpactFeedbackStyle: {
    Light: 'light' as const,
    Medium: 'medium' as const,
    Heavy: 'heavy' as const,
  },
  NotificationFeedbackType: {
    Success: 'success' as const,
    Warning: 'warning' as const,
    Error: 'error' as const,
  },
};
