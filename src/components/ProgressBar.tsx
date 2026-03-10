import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing, borderRadius } from '../theme/spacing';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

export function ProgressBar({
  current,
  total,
  color = colors.secondary,
}: ProgressBarProps) {
  const progress = useSharedValue(0);
  const labelScale = useSharedValue(1);

  useEffect(() => {
    const target = total > 0 ? current / total : 0;
    progress.value = withTiming(target, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    labelScale.value = withSpring(1.15, { damping: 8, stiffness: 200 }, () => {
      labelScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
  }, [current, total]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value * 100, 100)}%` as any,
  }));

  const labelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: labelScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.labelContainer, labelAnimStyle]}>
        <Text style={styles.currentLabel}>{current}</Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.totalLabel}>{total}</Text>
      </Animated.View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]}>
          <View style={styles.fillShine} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    minWidth: 52,
    justifyContent: 'center',
  },
  currentLabel: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.extraBold,
    color: '#FFFFFF',
  },
  separator: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginHorizontal: 2,
  },
  totalLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semiBold,
    color: 'rgba(255,255,255,0.8)',
  },
  track: {
    flex: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  fillShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopLeftRadius: borderRadius.round,
    borderTopRightRadius: borderRadius.round,
  },
});
