import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { colors } from '../../theme/colors';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  height = 8,
  color = colors.primary,
  backgroundColor = colors.border,
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View className={className}>
      <View
        style={{ height, backgroundColor, borderRadius: height / 2, overflow: 'hidden' }}
      >
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ type: 'timing', duration: 600 }}
          style={{
            height: '100%',
            backgroundColor: color,
            borderRadius: height / 2,
          }}
        />
      </View>
      {showLabel && (
        <Text className="text-warmgrey text-xs mt-1 text-right">
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}
