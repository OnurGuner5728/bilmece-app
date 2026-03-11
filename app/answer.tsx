import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { BounceIn, FadeIn, ZoomIn } from 'react-native-reanimated';
import { AdBanner } from '../src/components/AdBanner';
import { Button } from '../src/components/Button';
import { EmojiImage } from '../src/components/EmojiImage';
import { RealImage } from '../src/components/RealImage';
import { useGame } from '../src/context/GameContext';
import { RiddleService } from '../src/services/RiddleService';
import { ScoreService } from '../src/services/ScoreService';
import { SpeechService } from '../src/services/SpeechService';
import { useSettings } from '../src/context/SettingsContext';
import { colors, ageGroupColors } from '../src/theme/colors';
import { fonts } from '../src/theme/fonts';
import { spacing, borderRadius } from '../src/theme/spacing';

export default function AnswerScreen() {
  const router = useRouter();
  const { state, progress, dispatch } = useGame();
  const { settings } = useSettings();

  const filteredRiddles = useMemo(() => {
    if (state.selectedCategory) {
      return RiddleService.getFilteredByCategory(state.selectedCategory);
    }
    if (!state.selectedAgeGroup || !state.selectedDifficulty) return [];
    return RiddleService.getFilteredRiddles(state.selectedAgeGroup, state.selectedDifficulty);
  }, [state.selectedAgeGroup, state.selectedDifficulty, state.selectedCategory]);

  const currentRiddle = filteredRiddles[state.currentRiddleIndex];
  const isCategoryMode = !!state.selectedCategory;
  const ageGroupForDisplay = state.selectedAgeGroup ?? currentRiddle?.ageGroup;
  const gradientColors: [string, string] = ageGroupForDisplay
    ? ageGroupColors[ageGroupForDisplay]?.gradient ?? [colors.gradientStart, colors.gradientEnd]
    : [colors.gradientStart, colors.gradientEnd];

  useEffect(() => {
    const ageGroup = state.selectedAgeGroup ?? currentRiddle?.ageGroup;
    if (currentRiddle && settings.soundEnabled && ageGroup) {
      SpeechService.speakSequence(
        [
          { text: 'Tebrikler!', audioId: 'tebrikler' },
          { text: currentRiddle.answer, audioId: `${currentRiddle.id}_cevap` },
        ],
        ageGroup
      );
    }
    return () => {
      SpeechService.stop();
    };
  }, [currentRiddle?.id, settings.soundEnabled, state.selectedAgeGroup]);

  useEffect(() => {
    const newBadges = ScoreService.checkBadges(progress);
    if (newBadges.length > 0) {
      dispatch({ type: 'AWARD_BADGES', payload: newBadges });
    }
  }, [progress.solvedRiddles.length, progress.totalScore, progress.currentStreak]);

  if (!currentRiddle || (!isCategoryMode && (!state.selectedAgeGroup || !state.selectedDifficulty))) {
    router.replace('/');
    return null;
  }

  const score = ScoreService.calculateScore(
    state.selectedDifficulty ?? currentRiddle.difficulty,
    state.showHint,
    progress.currentStreak
  );

  const handleNext = () => {
    dispatch({ type: 'NEXT_RIDDLE' });
    router.replace(isCategoryMode ? '/category' : '/game');
  };

  const handleHome = () => {
    dispatch({ type: 'RESET_GAME' });
    router.replace('/');
  };

  const isLast = state.currentRiddleIndex >= filteredRiddles.length - 1;

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.content}>
          <Animated.View entering={BounceIn.duration(800)}>
            <RealImage imageKey={currentRiddle.answerImage} emoji={currentRiddle.answerEmoji} size={100} />
          </Animated.View>

          <Animated.Text entering={FadeIn.delay(400).duration(500)} style={styles.answer}>
            {currentRiddle.answer}
          </Animated.Text>

          <Animated.View entering={ZoomIn.delay(600).duration(400)} style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Kazanılan Puan</Text>
            <Text style={styles.scoreValue}>+{score}</Text>
            {state.showHint && <Text style={styles.hintPenalty}>(-5 ipucu kullanıldı)</Text>}
          </Animated.View>

          <Animated.View entering={FadeIn.delay(900).duration(500)} style={styles.confettiContainer}>
            <View style={styles.confettiRow}>
              <EmojiImage emoji="🎉" size={32} />
              <EmojiImage emoji="🎊" size={32} />
              <EmojiImage emoji="⭐" size={32} />
              <EmojiImage emoji="🌟" size={32} />
              <EmojiImage emoji="🎉" size={32} />
            </View>
          </Animated.View>

          <View style={styles.actions}>
            {!isLast && (
              <Button
                title="➡ Sonraki Bilmece"
                onPress={handleNext}
                variant="primary"
                size="large"
              />
            )}
            <Button
              title="Ana Sayfa"
              onPress={handleHome}
              variant="outline"
              size="medium"
              style={styles.homeButton}
              textStyle={{ color: '#FFFFFF' }}
            />
          </View>
        </View>
        <AdBanner />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  answer: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.extraBold,
    color: '#FFFFFF',
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
  },
  scoreLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  scoreValue: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.extraBold,
    color: colors.success,
  },
  hintPenalty: {
    fontSize: fonts.sizes.xs,
    color: colors.secondaryDark,
    marginTop: spacing.xs,
  },
  confettiContainer: { marginTop: spacing.md },
  confettiRow: { flexDirection: 'row' as const, gap: 8, justifyContent: 'center' as const },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
    width: '100%',
  },
  homeButton: { borderColor: '#FFFFFF' },
});
