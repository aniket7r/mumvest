import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  onPress?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Card({ onPress, className = '', children }: CardProps) {
  const baseClass = 'bg-white rounded-3xl p-5 shadow-md border border-border';

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.65}
        className={`${baseClass} ${className}`}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={`${baseClass} ${className}`}>
      {children}
    </View>
  );
}
