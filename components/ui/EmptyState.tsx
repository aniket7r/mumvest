import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { Button } from './Button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      className="items-center justify-center py-12 px-8"
    >
      <Text className="text-5xl mb-4">{emoji}</Text>
      <Text className="text-charcoal text-lg font-bold text-center mb-2">{title}</Text>
      <Text className="text-warmgrey text-sm text-center leading-5 mb-6">{subtitle}</Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" size="sm" />
      )}
    </MotiView>
  );
}
