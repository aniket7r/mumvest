import { View } from 'react-native';
import { MotiView } from 'moti';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, className }: SkeletonProps) {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 0.7 }}
      transition={{
        type: 'timing',
        duration: 800,
        loop: true,
      }}
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: '#ECE8E4',
      }}
      className={className}
    />
  );
}

export function CardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3">
      <Skeleton width="60%" height={14} className="mb-3" />
      <Skeleton width="100%" height={12} className="mb-2" />
      <Skeleton width="80%" height={12} />
    </View>
  );
}

export function GoalCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 w-44 mr-3">
      <Skeleton width={40} height={40} borderRadius={20} className="mb-3" />
      <Skeleton width="70%" height={14} className="mb-2" />
      <Skeleton width="50%" height={18} className="mb-2" />
      <Skeleton width="100%" height={6} borderRadius={3} />
    </View>
  );
}
