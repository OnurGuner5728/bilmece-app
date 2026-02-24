import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp, Text } from 'react-native';

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/72x72';

function emojiToCodePoints(emoji: string): string {
  const codePoints: string[] = [];
  let i = 0;
  while (i < emoji.length) {
    const cp = emoji.codePointAt(i);
    if (cp === undefined) break;
    // FE0F variation selector atla — Twemoji dosya adlarında kullanmaz
    if (cp !== 0xFE0F && cp !== 0xFE0E) {
      codePoints.push(cp.toString(16));
    }
    i += cp > 0xFFFF ? 2 : 1;
  }
  return codePoints.join('-');
}

function emojiToTwemojiUrl(emoji: string): string {
  return `${TWEMOJI_BASE}/${emojiToCodePoints(emoji)}.png`;
}

interface EmojiImageProps {
  emoji: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Emoji karakterini Twemoji (Twitter/X açık kaynak, CC-BY 4.0) PNG görseli olarak render eder.
 * Tüm Android ve iOS cihazlarda tutarlı, profesyonel görünüm sağlar.
 * CDN erişimi yoksa emoji metin olarak fallback yapar.
 */
export function EmojiImage({ emoji, size = 48, style }: EmojiImageProps) {
  const [hasError, setHasError] = useState(false);
  const uri = emojiToTwemojiUrl(emoji);

  if (hasError) {
    return (
      <Text style={{ fontSize: size * 0.85, lineHeight: size * 1.1 }}>
        {emoji}
      </Text>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      onError={() => setHasError(true)}
    />
  );
}
