import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, View, ActivityIndicator, StyleSheet } from 'react-native';
import { EmojiImage } from './EmojiImage';
import { getImageUrl } from '../services/ImageService';
import { colors } from '../theme/colors';

interface RealImageProps {
  /** Turkish answer key (e.g., "kedi", "elma") */
  imageKey: string;
  /** Fallback emoji character */
  emoji: string;
  /** Image size in pixels */
  size?: number;
  /** Additional image styles */
  style?: StyleProp<ImageStyle>;
}

/**
 * Displays a real photo for an answer key.
 * Shows a shimmer/loading state while loading.
 * Falls back to EmojiImage on error or if no URL is available.
 */
export function RealImage({ imageKey, emoji, size = 48, style }: RealImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUrl = getImageUrl(imageKey);

  // No URL available — fall back to emoji
  if (!imageUrl || hasError) {
    return <EmojiImage emoji={emoji} size={size} style={style} />;
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      {isLoading && (
        <View style={[styles.loader, { width: size, height: size, borderRadius: size * 0.2 }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      <Image
        source={{ uri: imageUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size * 0.2,
          },
          isLoading && styles.hidden,
        ]}
        resizeMode="cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    backgroundColor: colors.pastel.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: {
    opacity: 0,
  },
});
