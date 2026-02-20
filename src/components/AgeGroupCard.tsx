import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AgeGroup } from '../types';
import { ageGroupColors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { borderRadius, spacing } from '../theme/spacing';
import { getAgeGroupLabel, getAgeGroupEmoji } from '../utils/helpers';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AgeGroupCardProps {
  ageGroup: AgeGroup;
  onPress: (ageGroup: AgeGroup) => void;
  riddleCount?: number;
  solvedCount?: number;
}

export function AgeGroupCard({ ageGroup, onPress, riddleCount, solvedCount }: AgeGroupCardProps) {
  const colorScheme = ageGroupColors[ageGroup];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={() => onPress(ageGroup)}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={colorScheme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.emoji}>{getAgeGroupEmoji(ageGroup)}</Text>
        <Text style={styles.label}>{getAgeGroupLabel(ageGroup)}</Text>
        {riddleCount !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {solvedCount !== undefined
                ? `${solvedCount}/${riddleCount} cozuldu`
                : `${riddleCount} bilmece`}
            </Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginVertical: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  gradient: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: '#FFFFFF',
  },
  badge: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semiBold,
  },
});
