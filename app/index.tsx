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
import { colors } from '../src/theme/colors';
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
          <View style={styles.header}>
            <Text style={styles.title}>Bilmecelerce</Text>
            <Text style={styles.subtitle}>Yaş grubunu seç ve oynamaya başla!</Text>
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
                colors={['#FF6B9D', '#FF8E72']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dailyGradient}
              >
                <View style={styles.dailyHeader}>
                  <Animated.Text entering={BounceIn.delay(300).duration(600)} style={styles.dailyEmoji}>
                    {dailyRiddle.answerEmoji}
                  </Animated.Text>
                  <View style={styles.dailyBadge}>
                    <Text style={styles.dailyBadgeText}>Günün Bilmecesi</Text>
                  </View>
                </View>
                <Text style={styles.dailyQuestion} numberOfLines={2}>
                  {dailyRiddle.question}
                </Text>
                <Text style={styles.dailyTap}>Cevaplamak için dokun &rarr;</Text>
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
                return (
                  <Animated.View key={cat} entering={FadeInDown.delay(idx * 80).duration(300)}>
                    <TouchableOpacity
                      style={styles.categoryChip}
                      onPress={() => handleCategorySelect(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.categoryEmoji}>{meta?.emoji}</Text>
                      <Text style={styles.categoryLabel}>{meta?.label}</Text>
                      <Text style={styles.categoryCount}>{count}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Age Group Cards */}
          <Text style={styles.sectionTitle}>Yaş Grupları</Text>
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
              <Text style={styles.footerButtonText}>{'\uD83C\uDFC6'} Skor Tablosu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.footerButtonText}>{'\u2699\uFE0F'} Ayarlar</Text>
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
  title: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.extraBold,
    color: colors.primaryDark,
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
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
  dailyEmoji: {
    fontSize: 48,
  },
  dailyBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
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
    lineHeight: 26,
  },
  dailyTap: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
  },
  // Section Title
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minWidth: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  categoryCount: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
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
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    color: colors.primaryDark,
  },
});
