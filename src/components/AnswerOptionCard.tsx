import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { EmojiImage } from './EmojiImage';
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
                withSpring(1.1, { damping: 4 }),
                withSpring(1, { damping: 6 })
            );
        } else {
            shakeX.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
        }

        onPress(option);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateX: shakeX.value }],
    }));

    let cardStyle: ViewStyle = styles.card;
    if (showResult && isSelected) {
        cardStyle = option.isCorrect
            ? { ...styles.card, ...styles.correct }
            : { ...styles.card, ...styles.wrong };
    } else if (showResult && option.isCorrect) {
        cardStyle = { ...styles.card, ...styles.correctHint };
    }

    return (
        <AnimatedTouchable
            style={[cardStyle, animatedStyle]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <EmojiImage emoji={option.emoji} size={48} style={styles.emojiImage} />
            <Text style={styles.text} numberOfLines={1}>{option.text}</Text>
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        margin: spacing.xs,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        borderWidth: 3,
        borderColor: 'transparent',
        minHeight: 120,
    },
    correct: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    wrong: {
        borderColor: '#F44336',
        backgroundColor: '#FFEBEE',
    },
    correctHint: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
        opacity: 0.7,
    },
    emojiImage: {
        marginBottom: spacing.xs,
    },
    text: {
        fontSize: fonts.sizes.md,
        fontWeight: fonts.weights.bold,
        color: colors.text,
        textAlign: 'center',
    },
});
