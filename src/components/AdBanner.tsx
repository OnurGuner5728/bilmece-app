import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { borderRadius, spacing } from '../theme/spacing';

// TODO: AdMob entegrasyonu için aşağıdaki adımları uygula:
// 1. react-native-google-mobile-ads paketi New Arch + Android SDK 36 ile
//    uyumlu bir versiyona ulaştığında package.json'a ekle
// 2. Bu dosyayı gerçek BannerAd implementasyonuyla güncelle
// 3. app.json plugins'e react-native-google-mobile-ads config'ini geri ekle
// 4. metro.config.js'deki empty shim resolver'ını kaldır

interface AdBannerProps {
  size?: 'banner' | 'interstitial';
}

export function AdBanner({ size = 'banner' }: AdBannerProps) {
  if (size === 'interstitial') {
    return null;
  }

  // Reklam şu an devre dışı — AdMob entegrasyonu için TODO'ya bak
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Reklam Alanı</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 60,
    backgroundColor: colors.pastel.purple,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  placeholderText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
});
