import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { spacing } from '../theme/spacing';

// Bilmecelerce AdMob Banner
// DEV: Google resmi test banner ID kullanılır
// PROD: ca-app-pub-9813586099759759/3942483813
const BANNER_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111'        // Google resmi test banner ID
  : 'ca-app-pub-9813586099759759/3942483813';        // Bilmecelerce banner reklamı

let BannerAd: any = null;
let BannerAdSize: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
} catch {
  // Native modül mevcut değil (Expo Go / web), banner gösterilmez
}

interface AdBannerProps {
  size?: 'banner' | 'interstitial';
}

export function AdBanner({ size = 'banner' }: AdBannerProps) {
  if (size === 'interstitial' || Platform.OS === 'web' || !BannerAd) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize?.ANCHORED_ADAPTIVE_BANNER ?? 'ANCHORED_ADAPTIVE_BANNER'}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
});
