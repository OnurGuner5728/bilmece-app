import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
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
  color = colors.primary,
}: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const target = total > 0 ? current / total : 0;
    progress.value = withTiming(target, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [current, total]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value * 100, 100)}%` as any,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, animatedStyle]} />
      </View>
      <Text style={styles.label}>
        {current}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.round,
  },
  label: {
    marginLeft: spacing.sm,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'right',
  },
});
