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
import { RealImage } from './RealImage';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AgeGroupCardProps {
  ageGroup: AgeGroup;
  onPress: (ageGroup: AgeGroup) => void;
  riddleCount?: number;
  solvedCount?: number;
}

function StarProgress({ solved, total }: { solved: number; total: number }) {
  const maxStars = 5;
  const ratio = total > 0 ? solved / total : 0;
  const filledStars = Math.round(ratio * maxStars);
  return (
    <View style={starStyles.container}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <Text key={i} style={[starStyles.star, i < filledStars && starStyles.starFilled]}>
          {i < filledStars ? '\u2B50' : '\u2606'}
        </Text>
      ))}
    </View>
  );
}

const starStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 2,
    marginTop: spacing.xs,
  },
  star: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  starFilled: {
    color: '#FCD34D',
  },
});

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
        <View style={styles.iconCircle}>
          <RealImage
            imageKey={ageGroup === '4-6' ? 'cocuk_46' : ageGroup === '7-9' ? 'cocuk_79' : 'cocuk_1012'}
            emoji={getAgeGroupEmoji(ageGroup)}
            size={52}
            style={{ borderRadius: 26 }}
          />
        </View>
        <View style={styles.textArea}>
          <Text style={styles.label}>{getAgeGroupLabel(ageGroup)}</Text>
          {riddleCount !== undefined && solvedCount !== undefined && (
            <>
              <StarProgress solved={solvedCount} total={riddleCount} />
              <Text style={styles.progressText}>
                {solvedCount}/{riddleCount} tamamland\u0131
              </Text>
            </>
          )}
          {riddleCount !== undefined && solvedCount === undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{riddleCount} bilmece</Text>
            </View>
          )}
        </View>
        <Text style={styles.arrow}>{'\u203A'}</Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginVertical: spacing.sm,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 110,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textArea: {
    flex: 1,
  },
  label: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.extraBold,
    color: '#FFFFFF',
  },
  progressText: {
    fontSize: fonts.sizes.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  badge: {
    marginTop: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semiBold,
  },
  arrow: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: fonts.weights.bold,
    marginLeft: spacing.sm,
  },
});
