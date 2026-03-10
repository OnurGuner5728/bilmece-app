import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown, BounceIn } from 'react-native-reanimated';
import { colors } from '../src/theme/colors';
import { fonts } from '../src/theme/fonts';
import { spacing, borderRadius } from '../src/theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_KEY = 'onboarding_done';

interface SlideData {
  id: string;
  emoji: string;
  title: string;
  description: string;
  gradient: [string, string];
}

const slides: SlideData[] = [
  {
    id: '1',
    emoji: '\uD83D\uDD0A',
    title: 'Bilmeceyi Dinle',
    description: 'Her bilmece sesli okunur.\nDinle ve d\u00FC\u015F\u00FCn!',
    gradient: ['#4A90D9', '#7BB3E8'],
  },
  {
    id: '2',
    emoji: '\uD83C\uDFAF',
    title: 'Cevab\u0131 Se\u00E7',
    description: '4 se\u00E7enek aras\u0131ndan\ndo\u011Fru cevab\u0131 bul!',
    gradient: ['#FF6B9D', '#FF8E72'],
  },
  {
    id: '3',
    emoji: '\uD83C\uDFC6',
    title: 'Puan Kazan',
    description: 'Do\u011Fru cevaplarla puan topla\nve rozetler kazan!',
    gradient: ['#26A69A', '#4DB6AC'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/');
  };

  const isLastSlide = currentIndex === slides.length - 1;

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={styles.slide}>
      <Animated.View entering={BounceIn.duration(600)} style={styles.emojiContainer}>
        <LinearGradient
          colors={item.gradient}
          style={styles.emojiCircle}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
        </LinearGradient>
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={styles.slideTitle}>
        {item.title}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(350).duration(400)} style={styles.slideDescription}>
        {item.description}
      </Animated.Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.appTitle}>Bilmecelerce</Text>
          <Text style={styles.appSubtitle}>
            {'\u00C7'}ocuklar i{'\u00E7'}in e{'\u011F'}lenceli bilmece oyunu
          </Text>
        </Animated.View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
        />

        {/* Dots + Button */}
        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {isLastSlide ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleFinish}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF8E72']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Ba{'\u015F'}layal{'\u0131'}m!</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleFinish} style={styles.skipButton}>
                <Text style={styles.skipText}>Atla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextButtonText}>Devam</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    paddingBottom: spacing.md,
  },
  appTitle: {
    fontSize: fonts.sizes.title,
    fontWeight: fonts.weights.extraBold,
    color: colors.primaryDark,
  },
  appSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emojiContainer: {
    marginBottom: spacing.lg,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 56,
  },
  slideTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  slideDescription: {
    fontSize: fonts.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: 'rgba(74, 144, 217, 0.3)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: '#FFFFFF',
  },
  startButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  startButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.extraBold,
    color: '#FFFFFF',
  },
});
