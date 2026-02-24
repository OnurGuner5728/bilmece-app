import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Riddle } from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { borderRadius, spacing } from '../theme/spacing';

interface RiddleCardProps {
  riddle: Riddle;
  showHint: boolean;
  onToggleHint: () => void;
  index: number;
  total: number;
}

export function RiddleCard({ riddle, showHint, onToggleHint, index, total }: RiddleCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify()}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.category}>{riddle.category.toUpperCase()}</Text>
        <Text style={styles.counter}>
          {index + 1} / {total}
        </Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionMark}>?</Text>
        <Text style={styles.question}>{riddle.question}</Text>
      </View>

      {showHint ? (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.hintContainer}>
          <Text style={styles.hintLabel}>İpucu:</Text>
          <Text style={styles.hintText}>{riddle.hint}</Text>
        </Animated.View>
      ) : (
        <TouchableOpacity style={styles.hintButton} onPress={onToggleHint}>
          <Text style={styles.hintButtonText}>{'\uD83D\uDCA1'} İpucu Göster</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    margin: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  category: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  counter: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  questionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  questionMark: {
    fontSize: 64,
    color: colors.primaryLight,
    fontWeight: fonts.weights.extraBold,
    marginBottom: spacing.md,
  },
  question: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  hintContainer: {
    backgroundColor: colors.pastel.yellow,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  hintLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.secondaryDark,
    marginBottom: spacing.xs,
  },
  hintText: {
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
  hintButton: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.pastel.yellow,
    borderRadius: borderRadius.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hintButtonText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    color: colors.secondaryDark,
  },
});
