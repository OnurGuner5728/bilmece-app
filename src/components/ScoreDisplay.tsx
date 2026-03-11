import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmojiImage } from './EmojiImage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
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
  const scoreScale = useSharedValue(1);
  const streakScale = useSharedValue(1);

  useEffect(() => {
    scoreScale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  }, [totalScore]);

  useEffect(() => {
    if (currentStreak > 0) {
      streakScale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [currentStreak]);

  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const streakAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.statItem, styles.scoreItem, scoreAnimStyle]}>
        <View style={styles.iconCircle}>
          <EmojiImage emoji={'\u2B50'} size={20} />
        </View>
        <Text style={styles.statValue}>{totalScore}</Text>
        <Text style={styles.statLabel}>Puan</Text>
      </Animated.View>

      <Animated.View style={[styles.statItem, styles.streakItem, streakAnimStyle]}>
        <View style={[styles.iconCircle, currentStreak >= 3 && styles.fireCircle]}>
          <EmojiImage emoji={currentStreak >= 3 ? '\uD83D\uDD25' : '\u26A1'} size={20} />
        </View>
        <Text style={[styles.statValue, currentStreak >= 3 && styles.streakHighlight]}>
          {currentStreak}
        </Text>
        <Text style={styles.statLabel}>
          {currentStreak >= 5 ? 'Ate\u015F!' : currentStreak >= 3 ? 'Harika!' : 'Seri'}
        </Text>
      </Animated.View>

      <View style={[styles.statItem, styles.solvedItem]}>
        <View style={styles.iconCircle}>
          <EmojiImage emoji={'\u2705'} size={20} />
        </View>
        <Text style={styles.statValue}>{solvedCount}</Text>
        <Text style={styles.statLabel}>\u00C7\u00F6z\u00FClen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  scoreItem: {
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
  },
  streakItem: {
    borderBottomWidth: 3,
    borderBottomColor: colors.error,
  },
  solvedItem: {
    borderBottomWidth: 3,
    borderBottomColor: colors.success,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.pastel.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  fireCircle: {
    backgroundColor: '#FEF2F2',
  },
  statValue: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.extraBold,
    color: colors.primary,
  },
  streakHighlight: {
    color: colors.error,
  },
  statLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
    marginTop: 1,
  },
});
