import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGame } from '../src/context/GameContext';
import { RiddleService } from '../src/services/RiddleService';
import { AdBanner } from '../src/components/AdBanner';
import { Difficulty } from '../src/types';
import { colors, difficultyColors, ageGroupColors } from '../src/theme/colors';
import { fonts } from '../src/theme/fonts';
import { borderRadius, spacing } from '../src/theme/spacing';
import { getDifficultyLabel, getDifficultyEmoji } from '../src/utils/helpers';
import { EmojiImage } from '../src/components/EmojiImage';

const DIFFICULTIES: Difficulty[] = ['kolay', 'orta', 'zor'];

export default function DifficultyScreen() {
  const router = useRouter();
  const { state, progress, dispatch } = useGame();
  const ageGroup = state.selectedAgeGroup;

  const handleSelect = (difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
    router.push('/game');
  };

  if (!ageGroup) {
    router.replace('/');
    return null;
  }

  const gradientColors = ageGroupColors[ageGroup]?.gradient ?? [colors.gradientStart, colors.gradientEnd];

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Zorluk Seç</Text>
          <Text style={styles.subtitle}>{ageGroup} yaş grubu</Text>
        </View>

        <View style={styles.list}>
          {DIFFICULTIES.map((diff, idx) => {
            const total = RiddleService.getFilteredRiddles(ageGroup, diff).length;
            const unsolved = RiddleService.getUnsolvedRiddles(ageGroup, diff, progress.solvedRiddles).length;
            const solved = total - unsolved;

            return (
              <Animated.View key={diff} entering={FadeInDown.delay(idx * 100).duration(400)}>
                <TouchableOpacity
                  style={[styles.card, { borderLeftColor: difficultyColors[diff] }]}
                  onPress={() => handleSelect(diff)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.emojiRow}>
                      {[...getDifficultyEmoji(diff)].map((e, i) => (
                        <EmojiImage key={i} emoji={e} size={32} />
                      ))}
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>{getDifficultyLabel(diff)}</Text>
                      <Text style={styles.cardSubtitle}>
                        {solved} / {total} çözüldü
                      </Text>
                    </View>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{unsolved}</Text>
                      <Text style={styles.countLabel}>kaldı</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.spacer} />
        <AdBanner />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.extraBold,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    marginRight: spacing.md,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: colors.pastel.blue,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  countText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.extraBold,
    color: colors.primary,
  },
  countLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
});
