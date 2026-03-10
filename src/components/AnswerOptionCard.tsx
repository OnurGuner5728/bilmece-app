import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { RealImage } from './RealImage';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { AnswerOption } from '../types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { borderRadius, spacing } from '../theme/spacing';

interface AnswerOptionCardProps {
    option: AnswerOption;
    onPress: (option: AnswerOption) => void;
    disabled: boolean;
    showResult: boolean;
    isSelected: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnswerOptionCard({
    option,
    onPress,
    disabled,
    showResult,
    isSelected,
}: AnswerOptionCardProps) {
    const scale = useSharedValue(1);
    const shakeX = useSharedValue(0);

    const handlePress = () => {
        if (disabled) return;

        if (option.isCorrect) {
            scale.value = withSequence(
                withSpring(1.08, { damping: 4 }),
                withSpring(1, { damping: 6 })
            );
        } else {
            shakeX.value = withSequence(
                withTiming(-8, { duration: 50 }),
                withTiming(8, { duration: 50 }),
                withTiming(-8, { duration: 50 }),
                withTiming(8, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
        }

        onPress(option);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateX: shakeX.value }],
    }));

    let cardStyle: ViewStyle[] = [styles.card];
    let borderAccentColor: string = colors.primaryLight;

    if (showResult && isSelected) {
        if (option.isCorrect) {
            cardStyle = [styles.card, styles.correct];
            borderAccentColor = colors.success;
        } else {
            cardStyle = [styles.card, styles.wrong];
            borderAccentColor = colors.error;
        }
    } else if (showResult && option.isCorrect) {
        cardStyle = [styles.card, styles.correctHint];
        borderAccentColor = colors.success;
    }

    return (
        <AnimatedTouchable
            style={[...cardStyle, { borderLeftColor: borderAccentColor }, animatedStyle]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={styles.emojiContainer}>
                <RealImage imageKey={option.text.toLowerCase()} emoji={option.emoji} size={52} />
            </View>
            <Text style={styles.text} numberOfLines={2}>{option.text}</Text>
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        margin: spacing.xs,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.04)',
        borderLeftWidth: 5,
        borderLeftColor: colors.primaryLight,
        minHeight: 130,
    },
    correct: {
        borderColor: colors.success,
        borderLeftColor: colors.success,
        backgroundColor: '#ECFDF5',
        shadowColor: colors.success,
        shadowOpacity: 0.25,
        elevation: 6,
    },
    wrong: {
        borderColor: colors.error,
        borderLeftColor: colors.error,
        backgroundColor: '#FEF2F2',
        shadowColor: colors.error,
        shadowOpacity: 0.2,
    },
    correctHint: {
        borderColor: colors.success,
        borderLeftColor: colors.success,
        backgroundColor: '#ECFDF5',
        opacity: 0.7,
    },
    emojiContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(37, 99, 235, 0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    text: {
        fontSize: fonts.sizes.md,
        fontWeight: fonts.weights.bold,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 20,
    },
});
