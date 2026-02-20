import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useGame } from '../src/context/GameContext';
import { RiddleService } from '../src/services/RiddleService';
import { ScoreService } from '../src/services/ScoreService';
import { AdBanner } from '../src/components/AdBanner';
import { AgeGroup } from '../src/types';
import { colors } from '../src/theme/colors';
import { fonts } from '../src/theme/fonts';
import { borderRadius, spacing } from '../src/theme/spacing';

const AGE_GROUPS: AgeGroup[] = ['4-6', '7-9', '10-12'];

const BADGE_DEFINITIONS = [
  { id: 'first_solve', name: 'İlk Adım', emoji: '\u2B50', description: 'İlk bilmeceyi çöz!' },
  { id: 'ten_solves', name: 'Bilmece Meraklısı', emoji: '\uD83E\uDDE0', description: '10 bilmece çöz!' },
  { id: 'fifty_solves', name: 'Bilmece Ustası', emoji: '\uD83C\uDFC6', description: '50 bilmece çöz!' },
  { id: 'streak_5', name: 'Seri Çözücü', emoji: '\uD83D\uDD25', description: '5 bilmeceyi üst üste çöz!' },
  { id: 'streak_10', name: 'Durdurulamaz', emoji: '\uD83D\uDE80', description: '10 bilmeceyi üst üste çöz!' },
  { id: 'score_100', name: 'Puan Avcısı', emoji: '\uD83D\uDCAF', description: '100 puan topla!' },
  { id: 'score_500', name: 'Puan Kralı', emoji: '\uD83D\uDC51', description: '500 puan topla!' },
];

export default function ScoreScreen() {
  const { progress } = useGame();

  const newBadges = ScoreService.checkBadges(progress);
  const allUnlockedIds = new Set([
    ...progress.badges.map((b) => b.id),
    ...newBadges.map((b) => b.id),
  ]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
            <Text style={styles.totalEmoji}>{'\u2B50'}</Text>
            <Text style={styles.totalScore}>{progress.totalScore}</Text>
            <Text style={styles.totalLabel}>Toplam Puan</Text>
          </Animated.View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>{'\u2705'}</Text>
              <Text style={styles.statValue}>{progress.solvedRiddles.length}</Text>
              <Text style={styles.statLabel}>Çözülen Bilmece</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>{'\uD83C\uDFC6'}</Text>
              <Text style={styles.statValue}>{progress.bestStreak}</Text>
              <Text style={styles.statLabel}>En İyi Seri</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>{'\uD83D\uDD25'}</Text>
              <Text style={styles.statValue}>{progress.currentStreak}</Text>
              <Text style={styles.statLabel}>Mevcut Seri</Text>
            </View>
          </View>

          <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>Rozetler</Text>
            <View style={styles.badgesGrid}>
              {BADGE_DEFINITIONS.map((badge) => {
                const isUnlocked = allUnlockedIds.has(badge.id);
                return (
                  <View
                    key={badge.id}
                    style={[styles.badgeCard, !isUnlocked && styles.badgeLocked]}
                  >
                    <Text style={[styles.badgeEmoji, !isUnlocked && styles.badgeEmojiLocked]}>
                      {badge.emoji}
                    </Text>
                    <Text style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]}>
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeDesc}>{badge.description}</Text>
                    {!isUnlocked && (
                      <Text style={styles.lockIcon}>{'\uD83D\uDD12'}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Yaş Grubuna Göre İlerleme</Text>
            {AGE_GROUPS.map((ag) => {
              const total = RiddleService.getRiddlesByAgeGroup(ag).length;
              const solved = progress.solvedRiddles.filter((id) => {
                const riddle = RiddleService.getRiddleById(id);
                return riddle && riddle.ageGroup === ag;
              }).length;
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

              return (
                <View key={ag} style={styles.progressItem}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{ag} Yaş</Text>
                    <Text style={styles.progressValue}>
                      {solved}/{total} ({pct}%)
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                  </View>
                </View>
              );
            })}
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
    paddingVertical: spacing.xl,
  },
  totalEmoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  totalScore: {
    fontSize: 72,
    fontWeight: fonts.weights.extraBold,
    color: colors.primaryDark,
  },
  totalLabel: {
    fontSize: fonts.sizes.lg,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.extraBold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  badgesSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  badgeLocked: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  badgeEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  badgeEmojiLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: colors.textLight,
  },
  badgeDesc: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  lockIcon: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    fontSize: 14,
  },
  progressSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  progressItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semiBold,
    color: colors.text,
  },
  progressValue: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
  },
});
