import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  onPress?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Card({ onPress, className = '', children }: CardProps) {
  const baseClass = 'bg-white rounded-2xl p-4 shadow-sm';

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
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
