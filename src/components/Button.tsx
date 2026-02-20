import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
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
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
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
    borderRadius: borderRadius.lg,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    height: 40,
    paddingHorizontal: spacing.md,
  },
  medium: {
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  large: {
    height: 60,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: fonts.weights.bold,
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
