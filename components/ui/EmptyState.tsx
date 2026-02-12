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
      className="items-center justify-center py-16 px-10"
    >
      <Text className="text-6xl mb-6">{emoji}</Text>
      <Text className="text-charcoal text-xl font-heading text-center mb-3">{title}</Text>
      <Text className="text-warmgrey text-sm text-center leading-6 mb-8">{subtitle}</Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" size="sm" fullWidth={false} />
      )}
    </MotiView>
  );
}
