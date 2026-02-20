import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
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
import { shouldShowAd } from '../src/utils/helpers';

// TODO: Production icin asagidaki test ID'yi AdMob konsolundan aldiginiz
// gercek Interstitial Ad Unit ID ile degistirin.
// Su anki deger Google'in resmi test ID'sidir.
const INTERSTITIAL_AD_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712'  // Google test ID
  : 'ca-app-pub-XXXXXXXXXXXXX/ZZZZZZZZZZ';    // TODO: Gercek Interstitial ID yazin

let InterstitialAd: any = null;
let AdEventType: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
} catch {
  // ads module not available
}

export default function GameScreen() {
  const router = useRouter();
  const { state, progress, dispatch } = useGame();
  const { settings } = useSettings();
  const interstitialRef = useRef<any>(null);
  const interstitialLoadedRef = useRef(false);
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
        SpeechService.speak(currentRiddle.question, state.selectedAgeGroup!);
      }, 500);
      return () => {
        clearTimeout(timer);
        SpeechService.stop();
      };
    }
  }, [state.currentRiddleIndex, filteredRiddles.length, settings.soundEnabled]);

  // Cleanup auto-advance timer
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  // Interstitial ad setup (COPPA: requestNonPersonalizedAdsOnly)
  useEffect(() => {
    if (!InterstitialAd || Platform.OS === 'web') return;
    try {
      const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_ID, {
        requestNonPersonalizedAdsOnly: true,
      });
      const loadedUnsub = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitialLoadedRef.current = true;
      });
      const closedUnsub = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        interstitialLoadedRef.current = false;
        interstitial.load();
      });
      const errorUnsub = interstitial.addAdEventListener(AdEventType.ERROR, () => {
        interstitialLoadedRef.current = false;
      });
      interstitial.load();
      interstitialRef.current = interstitial;
      return () => {
        loadedUnsub();
        closedUnsub();
        errorUnsub();
      };
    } catch {
      // Ad SDK not available, skip gracefully
    }
  }, []);

  const showInterstitialAd = useCallback(() => {
    if (interstitialRef.current && interstitialLoadedRef.current) {
      interstitialRef.current.show();
      dispatch({ type: 'RESET_AD_COUNTER' });
    }
  }, [dispatch]);

  if (!state.selectedAgeGroup || !state.selectedDifficulty) {
    router.replace('/');
    return null;
  }

  const currentRiddle = filteredRiddles[state.currentRiddleIndex];
  const gradientColors = ageGroupColors[state.selectedAgeGroup]?.gradient ?? [colors.gradientStart, colors.gradientEnd];
  const isLast = state.currentRiddleIndex >= filteredRiddles.length - 1;

  if (!currentRiddle) {
    return (
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <SafeAreaView style={styles.centered}>
          <Text style={styles.emptyEmoji}>{'\uD83C\uDF89'}</Text>
          <Text style={styles.emptyText}>Tüm bilmeceleri tamamladın!</Text>
          <Button title="Ana Sayfaya Dön" onPress={() => router.replace('/')} variant="secondary" size="large" />
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
        SpeechService.speak(`Tebrikler! Doğru cevap: ${currentRiddle.answer}`, state.selectedAgeGroup!);
      }

      // Auto advance after 2 seconds
      if (!isLast) {
        autoAdvanceTimer.current = setTimeout(() => {
          if (shouldShowAd(state.riddlesSinceLastAd)) {
            showInterstitialAd();
          }
          dispatch({ type: 'NEXT_RIDDLE' });
        }, 2500);
      }
    } else {
      // Wrong answer
      dispatch({ type: 'RESET_STREAK' });
      if (settings.soundEnabled) {
        SpeechService.speak('Yanlış! Tekrar dene.', state.selectedAgeGroup!);
      }
      // Allow retry after 1 second
      autoAdvanceTimer.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_ANSWER' });
      }, 1200);
    }
  };

  const handleSpeakRiddle = () => {
    if (state.selectedAgeGroup) {
      SpeechService.speak(currentRiddle.question, state.selectedAgeGroup);
    }
  };

  const handleToggleHint = () => {
    dispatch({ type: 'TOGGLE_HINT' });
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

          {/* Correct answer celebration */}
          {state.isAnswered && state.isCorrect && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.celebration}>
              <Text style={styles.celebrationText}>
                {'\uD83C\uDF89'} Tebrikler! +{ScoreService.calculateScore(state.selectedDifficulty!, state.showHint, progress.currentStreak)} puan
              </Text>
            </Animated.View>
          )}
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
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyText: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xl,
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
  celebration: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  celebrationText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.extraBold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
