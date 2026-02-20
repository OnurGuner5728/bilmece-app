import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { borderRadius, spacing } from '../theme/spacing';

interface ScoreDisplayProps {
  totalScore: number;
  currentStreak: number;
  solvedCount: number;
}

export function ScoreDisplay({ totalScore, currentStreak, solvedCount }: ScoreDisplayProps) {
  const animScale = useSharedValue(1);

  useEffect(() => {
    animScale.value = withSpring(1.1, { damping: 8, stiffness: 200 }, () => {
      animScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
  }, [totalScore]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{'\u2B50'} {totalScore}</Text>
        <Text style={styles.statLabel}>Puan</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{'\uD83D\uDD25'} {currentStreak}</Text>
        <Text style={styles.statLabel}>Seri</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{'\u2705'} {solvedCount}</Text>
        <Text style={styles.statLabel}>Cozulen</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.extraBold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.textLight,
    marginVertical: spacing.xs,
  },
});
