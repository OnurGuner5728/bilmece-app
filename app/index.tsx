import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, BounceIn } from 'react-native-reanimated';
import { AgeGroupCard } from '../src/components/AgeGroupCard';
import { ScoreDisplay } from '../src/components/ScoreDisplay';
import { AdBanner } from '../src/components/AdBanner';
import { useGame } from '../src/context/GameContext';
import { RiddleService, CATEGORY_META } from '../src/services/RiddleService';
import { AgeGroup } from '../src/types';
import { EmojiImage } from '../src/components/EmojiImage';
import { RealImage } from '../src/components/RealImage';
import { colors, categoryColors } from '../src/theme/colors';
import { fonts } from '../src/theme/fonts';
import { spacing, borderRadius } from '../src/theme/spacing';

const AGE_GROUPS: AgeGroup[] = ['4-6', '7-9', '10-12'];
const CATEGORIES = ['hayvanlar', 'yiyecek', 'do\u011Fa', 'e\u015Fyalar', 'v\u00FCcut', 'ara\u00E7lar'];

export default function HomeScreen() {
  const router = useRouter();
  const { progress, dispatch } = useGame();

  const dailyRiddle = useMemo(() => RiddleService.getDailyRiddle(), []);

  const handleAgeGroupSelect = (ageGroup: AgeGroup) => {
    dispatch({ type: 'SET_AGE_GROUP', payload: ageGroup });
    router.push('/difficulty');
  };

  const handleDailyRiddle = () => {
    dispatch({ type: 'SET_AGE_GROUP', payload: dailyRiddle.ageGroup });
    dispatch({ type: 'SET_DIFFICULTY', payload: dailyRiddle.difficulty });
    const riddles = RiddleService.getFilteredRiddles(dailyRiddle.ageGroup, dailyRiddle.difficulty);
    const idx = riddles.findIndex((r) => r.id === dailyRiddle.id);
    dispatch({ type: 'SET_RIDDLE_INDEX', payload: idx >= 0 ? idx : 0 });
    router.push('/game');
  };

  const handleCategorySelect = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
    router.push('/category');
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header with mascot */}
          <View style={styles.header}>
            <Animated.View entering={BounceIn.duration(600)} style={styles.mascotRow}>
              <EmojiImage emoji={'\uD83E\uDD89'} size={44} />
            </Animated.View>
            <Text style={styles.title}>Bilmecelerce</Text>
            <Text style={styles.subtitle}>Ya\u015F grubunu se\u00E7 ve oynamaya ba\u015Fla!</Text>
          </View>

          <ScoreDisplay
            totalScore={progress.totalScore}
            currentStreak={progress.currentStreak}
            solvedCount={progress.solvedRiddles.length}
          />

          {/* Daily Riddle Card */}
          <Animated.View entering={FadeInDown.duration(500)}>
            <TouchableOpacity
              style={styles.dailyCard}
              onPress={handleDailyRiddle}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#F472B6', '#FB923C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dailyGradient}
              >
                <View style={styles.dailyHeader}>
                  <Animated.View entering={BounceIn.delay(300).duration(600)}>
                    <View style={styles.dailyEmojiCircle}>
                      <RealImage imageKey={dailyRiddle.answerImage} emoji={dailyRiddle.answerEmoji} size={40} style={{ borderRadius: 20 }} />
                    </View>
                  </Animated.View>
                  <View style={styles.dailyBadge}>
                    <EmojiImage emoji={'\u2728'} size={14} />
                    <Text style={styles.dailyBadgeText}> G\u00FCn\u00FCn Bilmecesi</Text>
                  </View>
                </View>
                <Text style={styles.dailyQuestion} numberOfLines={2}>
                  {dailyRiddle.question}
                </Text>
                <Text style={styles.dailyTap}>{'Cevaplamak i\u00E7in dokun \u2192'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Category Selector */}
          <Animated.View entering={FadeIn.delay(200).duration(400)}>
            <Text style={styles.sectionTitle}>Kategoriler</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((cat, idx) => {
                const meta = CATEGORY_META[cat];
                const count = RiddleService.getCategoryCount(cat);
                const accentColor = categoryColors[cat] || colors.primary;
                return (
                  <Animated.View key={cat} entering={FadeInDown.delay(idx * 80).duration(300)}>
                    <TouchableOpacity
                      style={[styles.categoryChip, { borderBottomColor: accentColor }]}
                      onPress={() => handleCategorySelect(cat)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.categoryEmojiCircle, { backgroundColor: accentColor + '18' }]}>
                        <RealImage
                          imageKey={`${cat}_icon`}
                          emoji={meta?.emoji ?? '\uD83D\uDCE6'}
                          size={26}
                          style={{ borderRadius: 13 }}
                        />
                      </View>
                      <Text style={styles.categoryLabel}>{meta?.label}</Text>
                      <Text style={[styles.categoryCount, { color: accentColor }]}>{count}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Age Group Cards */}
          <Text style={styles.sectionTitle}>Ya\u015F Gruplar\u0131</Text>
          <View style={styles.cards}>
            {AGE_GROUPS.map((ag) => {
              const total = RiddleService.getRiddlesByAgeGroup(ag).length;
              const solved = progress.solvedRiddles.filter((id) => {
                const riddle = RiddleService.getRiddleById(id);
                return riddle && riddle.ageGroup === ag;
              }).length;

              return (
                <AgeGroupCard
                  key={ag}
                  ageGroup={ag}
                  onPress={handleAgeGroupSelect}
                  riddleCount={total}
                  solvedCount={solved}
                />
              );
            })}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push('/score')}
            >
              <View style={styles.footerButtonContent}>
                <EmojiImage emoji={'\uD83C\uDFC6'} size={20} />
                <Text style={styles.footerButtonText}>Skor Tablosu</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push('/settings')}
            >
              <View style={styles.footerButtonContent}>
                <EmojiImage emoji={'\u2699\uFE0F'} size={20} />
                <Text style={styles.footerButtonText}>Ayarlar</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scroll: {
    paddingBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  mascotRow: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.extraBold,
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // Daily Riddle Card
  dailyCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  dailyGradient: {
    padding: spacing.lg,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dailyEmojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
  },
  dailyBadgeText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: '#FFFFFF',
  },
  dailyQuestion: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
    color: '#FFFFFF',
    lineHeight: 28,
  },
  dailyTap: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.sm,
    fontWeight: fonts.weights.medium,
  },
  // Section Title
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.extraBold,
    color: colors.primaryDark,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  // Category chips
  categoryScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minWidth: 86,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  categoryEmojiCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text,
  },
  categoryCount: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.semiBold,
    marginTop: 2,
  },
  // Age group cards
  cards: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  footerButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  footerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerButtonText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.primaryDark,
  },
});
