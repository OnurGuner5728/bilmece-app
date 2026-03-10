import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { borderRadius, spacing } from '../theme/spacing';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  const isGradient = variant === 'primary' || variant === 'secondary';

  const gradientColors: [string, string] = variant === 'secondary'
    ? [colors.secondary, colors.secondaryDark]
    : [colors.primary, colors.primaryDark];

  const buttonStyles = [
    styles.base,
    styles[size],
    !isGradient && styles[variant],
    disabled && styles.disabled,
    variant !== 'ghost' && styles.shadow,
    animatedStyle,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
    disabled && styles.disabledText,
    textStyle,
  ];

  if (isGradient && !disabled) {
    return (
      <AnimatedTouchable
        style={[styles.base, styles[size], styles.shadow, animatedStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientInner, styles[size]]}
        >
          <Text style={textStyles}>{title}</Text>
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      style={buttonStyles}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>{title}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  gradientInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xxl,
  },
  shadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    height: 42,
    paddingHorizontal: spacing.lg,
  },
  medium: {
    height: 54,
    paddingHorizontal: spacing.xl,
  },
  large: {
    height: 62,
    paddingHorizontal: spacing.xl + spacing.sm,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontWeight: fonts.weights.bold,
    letterSpacing: 0.3,
  },
  primaryText: {
    color: colors.textOnPrimary,
    fontSize: fonts.sizes.md,
  },
  secondaryText: {
    color: colors.textOnPrimary,
    fontSize: fonts.sizes.md,
  },
  outlineText: {
    color: colors.primary,
    fontSize: fonts.sizes.md,
  },
  ghostText: {
    color: colors.primary,
    fontSize: fonts.sizes.md,
  },
  smallText: {
    fontSize: fonts.sizes.sm,
  },
  mediumText: {
    fontSize: fonts.sizes.md,
  },
  largeText: {
    fontSize: fonts.sizes.lg,
  },
  disabledText: {
    color: colors.textLight,
  },
});
