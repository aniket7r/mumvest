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
  const sizeClass = size === 'sm' ? 'py-2.5 px-5' : size === 'lg' ? 'py-4.5 px-10' : 'py-3.5 px-6';
  const widthClass = fullWidth ? 'w-full' : '';

  const variantClass = {
    primary: 'bg-coral shadow-sm',
    secondary: 'bg-teal shadow-sm',
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
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} />
      ) : (
        <Text className={`font-body-bold ${textSize} ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
