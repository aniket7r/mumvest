import { TouchableOpacity, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { Haptics } from '../../utils/haptics';
import { colors } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  className = '',
}: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const baseClass = 'items-center justify-center rounded-2xl';
  const sizeClass = size === 'sm' ? 'py-2 px-4' : size === 'lg' ? 'py-4 px-8' : 'py-3.5 px-6';
  const widthClass = fullWidth ? 'w-full' : '';

  const variantClass = {
    primary: 'bg-coral',
    secondary: 'bg-teal',
    outline: 'border-2 border-coral bg-transparent',
    ghost: 'bg-transparent',
  }[variant];

  const textClass = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-coral',
    ghost: 'text-coral',
  }[variant];

  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClass} ${widthClass} ${variantClass} ${disabled ? 'opacity-50' : ''} ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} />
      ) : (
        <Text className={`font-body-semi ${textSize} ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
