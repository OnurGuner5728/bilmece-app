import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { AnswerOptionCard } from '../src/components/AnswerOptionCard';
import { ScoreDisplay } from '../src/components/ScoreDisplay';
import { ProgressBar } from '../src/components/ProgressBar';
import { AdBanner } from '../src/components/AdBanner';
import { Button } from '../src/components/Button';
import { useGame } from '../src/context/GameContext';
import { useSettings } from '../src/context/SettingsContext';
import { RiddleService } from '../src/services/RiddleService';
import { ScoreService } from '../src/services/ScoreService';
import { SpeechService } from '../src/services/SpeechService';
import { AnswerOption } from '../src/types';
import { colors, ageGroupColors } from '../src/theme/colors';
import { fonts } from '../src/theme/fonts';
import { spacing } from '../src/theme/spacing';
import { EmojiImage } from '../src/components/EmojiImage';
import { shouldShowAd } from '../src/utils/helpers';
import { useInterstitialAd } from '../src/hooks/useInterstitialAd';

export default function GameScreen() {
  const router = useRouter();
  const { state, progress, dispatch } = useGame();
  const { settings } = useSettings();
  const { showInterstitialAd } = useInterstitialAd();
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredRiddles = useMemo(() => {
    if (!state.selectedAgeGroup || !state.selectedDifficulty) return [];
    return RiddleService.getFilteredRiddles(state.selectedAgeGroup, state.selectedDifficulty);
  }, [state.selectedAgeGroup, state.selectedDifficulty]);

  // TTS: read riddle aloud when it changes
  useEffect(() => {
    const currentRiddle = filteredRiddles[state.currentRiddleIndex];
    if (currentRiddle && settings.soundEnabled && state.selectedAgeGroup) {
      const timer = setTimeout(() => {
        SpeechService.speak(currentRiddle.question, state.selectedAgeGroup!, currentRiddle.id);
      }, 500);
      return () => {
        clearTimeout(timer);
        SpeechService.stop();
      };
    }
  }, [state.currentRiddleIndex, filteredRiddles.length, settings.soundEnabled, state.selectedAgeGroup]);

  // Cleanup auto-advance timer
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  // Save position on unmount
  useEffect(() => {
    return () => {
      dispatch({ type: 'SAVE_POSITION' });
    };
  }, []);

  if (!state.selectedAgeGroup || !state.selectedDifficulty) {
    router.replace('/');
    return null;
  }

  const currentRiddle = filteredRiddles[state.currentRiddleIndex];
  const gradientColors = ageGroupColors[state.selectedAgeGroup]?.gradient ?? [colors.gradientStart, colors.gradientEnd];

  // Play "bitti" sound when all riddles are completed
  useEffect(() => {
    if (!currentRiddle && settings.soundEnabled && state.selectedAgeGroup) {
      SpeechService.speak('Tüm bilmeceleri tamamladın, tebrikler!', state.selectedAgeGroup, 'bitti');
    }
  }, [currentRiddle?.id, settings.soundEnabled, state.selectedAgeGroup]);

  if (!currentRiddle) {
    const isEmpty = filteredRiddles.length === 0;
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <SafeAreaView style={styles.centered}>
          <EmojiImage
            emoji={isEmpty ? '\uD83D\uDD27' : '\uD83C\uDF89'}
            size={64}
            style={{ marginBottom: spacing.md }}
          />
          <Text style={styles.emptyText}>
            {isEmpty
              ? 'Bu seviyede henüz bilmece eklenmedi'
              : 'Tüm bilmeceleri tamamladın!'}
          </Text>
          {!isEmpty && (
            <Text style={styles.emptySubText}>Harika iş çıkardın!</Text>
          )}
          <Button
            title="Ana Sayfaya Dön"
            onPress={() => router.replace('/')}
            variant="secondary"
            size="large"
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleAnswerSelect = (option: AnswerOption) => {
    if (state.isAnswered) return;

    SpeechService.stop();
    dispatch({ type: 'SELECT_ANSWER', payload: option });

    if (option.isCorrect) {
      // Correct answer
      const score = ScoreService.calculateScore(
        state.selectedDifficulty!,
        state.showHint,
        progress.currentStreak
      );
      dispatch({ type: 'MARK_RIDDLE_SOLVED', payload: currentRiddle.id });
      dispatch({ type: 'ADD_SCORE', payload: score });
      dispatch({ type: 'INCREMENT_STREAK' });

      if (settings.soundEnabled) {
        SpeechService.speak('Harika! Doğru bildin!', state.selectedAgeGroup!, 'harika');
      }

      autoAdvanceTimer.current = setTimeout(() => {
        SpeechService.stop();
        if (shouldShowAd(state.riddlesSinceLastAd)) {
          showInterstitialAd();
        }
        router.push('/answer');
      }, 800);
    } else {
      // Wrong answer
      dispatch({ type: 'RESET_STREAK' });
      if (settings.soundEnabled) {
        SpeechService.speak('Yanlış! Tekrar dene.', state.selectedAgeGroup!, 'yanlis');
      }
      // Allow retry after 1 second
      autoAdvanceTimer.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_ANSWER' });
      }, 1200);
    }
  };

  const handleSpeakRiddle = () => {
    if (state.selectedAgeGroup) {
      SpeechService.speak(currentRiddle.question, state.selectedAgeGroup, currentRiddle.id);
    }
  };

  const handleToggleHint = () => {
    dispatch({ type: 'TOGGLE_HINT' });
    if (!state.showHint && settings.soundEnabled && state.selectedAgeGroup) {
      SpeechService.speak('İpucu!', state.selectedAgeGroup, 'ipucu');
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScoreDisplay
          totalScore={progress.totalScore}
          currentStreak={progress.currentStreak}
          solvedCount={progress.solvedRiddles.length}
        />

        <ProgressBar
          current={state.currentRiddleIndex + 1}
          total={filteredRiddles.length}
          color="#FFFFFF"
        />

        <View style={styles.content}>
          {/* Navigation Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={[styles.navButton, state.currentRiddleIndex <= 0 && styles.navButtonDisabled]}
              onPress={() => dispatch({ type: 'PREV_RIDDLE' })}
              disabled={state.currentRiddleIndex <= 0}
            >
              <Text style={styles.navArrow}>{'\u25C0'}</Text>
            </TouchableOpacity>
            <Text style={styles.navCount}>{state.currentRiddleIndex + 1} / {filteredRiddles.length}</Text>
            <TouchableOpacity
              style={[styles.navButton, !(state.isAnswered || progress.solvedRiddles.includes(currentRiddle.id)) && styles.navButtonDisabled]}
              onPress={() => dispatch({ type: 'NEXT_RIDDLE' })}
              disabled={!(state.isAnswered || progress.solvedRiddles.includes(currentRiddle.id))}
            >
              <Text style={styles.navArrow}>{'\u25B6'}</Text>
            </TouchableOpacity>
          </View>

          {/* Riddle Question */}
          <View style={styles.questionSection}>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.category}>{currentRiddle.category.toUpperCase()}</Text>
                <TouchableOpacity onPress={handleSpeakRiddle} style={styles.speakerButton}>
                  <Text style={styles.speakerIcon}>{'\uD83D\uDD0A'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.questionText}>{currentRiddle.question}</Text>
              {state.showHint ? (
                <View style={styles.hintBox}>
                  <Text style={styles.hintLabel}>İpucu:</Text>
                  <Text style={styles.hintText}>{currentRiddle.hint}</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.hintButton} onPress={handleToggleHint}>
                  <Text style={styles.hintButtonText}>{'\uD83D\uDCA1'} İpucu</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>

          {/* Answer Options — 2x2 Grid */}
          <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.optionsGrid}>
            <View style={styles.optionRow}>
              {currentRiddle.options.slice(0, 2).map((option, i) => (
                <AnswerOptionCard
                  key={`${currentRiddle.id}-${i}`}
                  option={option}
                  onPress={handleAnswerSelect}
                  disabled={state.isAnswered}
                  showResult={state.isAnswered}
                  isSelected={state.selectedAnswer?.text === option.text}
                />
              ))}
            </View>
            <View style={styles.optionRow}>
              {currentRiddle.options.slice(2, 4).map((option, i) => (
                <AnswerOptionCard
                  key={`${currentRiddle.id}-${i + 2}`}
                  option={option}
                  onPress={handleAnswerSelect}
                  disabled={state.isAnswered}
                  showResult={state.isAnswered}
                  isSelected={state.selectedAnswer?.text === option.text}
                />
              ))}
            </View>
          </Animated.View>

        </View>

        <AdBanner />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptySubText: {
    fontSize: fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navArrow: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  navCount: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semiBold,
    color: '#FFFFFF',
    marginHorizontal: spacing.md,
  },
  content: { flex: 1, justifyContent: 'space-between' },
  questionSection: { paddingHorizontal: spacing.md },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  category: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  speakerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pastel.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerIcon: { fontSize: 24 },
  questionText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  hintBox: {
    backgroundColor: colors.pastel.yellow,
    borderRadius: 12,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  hintLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.secondaryDark,
    marginBottom: 2,
  },
  hintText: { fontSize: fonts.sizes.md, color: colors.text },
  hintButton: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.pastel.yellow,
    borderRadius: 20,
  },
  hintButtonText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semiBold,
    color: colors.secondaryDark,
  },
  optionsGrid: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
});
