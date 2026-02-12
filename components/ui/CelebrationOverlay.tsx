import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

const PARTICLE_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#A8E6CF', '#FF8A5C'];
const PARTICLE_COUNT = 24;

interface CelebrationOverlayProps {
  visible: boolean;
  emoji?: string;
  message?: string;
  subMessage?: string;
}

function Particle({ index }: { index: number }) {
  const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length];
  const startX = width / 2 + (Math.random() - 0.5) * 40;
  const startY = height * 0.4;
  const endX = startX + (Math.random() - 0.5) * width * 0.8;
  const endY = startY + Math.random() * height * 0.4 - 100;
  const size = 6 + Math.random() * 10;
  const delay = Math.random() * 300;
  const isCircle = index % 3 !== 0;

  return (
    <MotiView
      from={{ opacity: 1, translateX: 0, translateY: 0, scale: 1, rotate: '0deg' }}
      animate={{ opacity: 0, translateX: endX - startX, translateY: endY - startY, scale: 0.3, rotate: '360deg' }}
      transition={{ type: 'timing', duration: 1200, delay }}
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          width: size,
          height: isCircle ? size : size * 0.5,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
        },
      ]}
    />
  );
}

export function CelebrationOverlay({ visible, emoji = '🎉', message, subMessage }: CelebrationOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Particles */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}

      {/* Center content */}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 100 }}
        style={styles.center}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        {message && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 300 }}
          >
            <Text style={styles.message}>{message}</Text>
          </MotiView>
        )}
        {subMessage && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 500 }}
          >
            <Text style={styles.subMessage}>{subMessage}</Text>
          </MotiView>
        )}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 4,
  },
});
