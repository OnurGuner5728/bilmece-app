/**
 * Emoji karakterini Twemoji CDN URL'ine çevirir.
 * Twemoji: Twitter/X açık kaynak emoji seti (CC-BY 4.0)
 * Tüm cihazlarda aynı profesyonel görünüm sağlar.
 *
 * Örnek: 🐱 → https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/72x72/1f431.png
 */
export function emojiToTwemojiUrl(emoji: string): string {
  const codepoints: string[] = [];
  let i = 0;
  while (i < emoji.length) {
    const code = emoji.codePointAt(i);
    if (!code) break;
    // FE0F (emoji variation selector) — Twemoji dosya adlarında kullanılmaz
    if (code !== 0xFE0F && code !== 0xFE0E) {
      codepoints.push(code.toString(16));
    }
    i += code > 0xFFFF ? 2 : 1;
  }
  const filename = codepoints.join('-');
  return `https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/72x72/${filename}.png`;
}
