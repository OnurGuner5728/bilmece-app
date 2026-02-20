import { AgeGroup, Difficulty } from '../types';

export function getAgeGroupLabel(ageGroup: AgeGroup): string {
  const labels: Record<AgeGroup, string> = {
    '4-6': '4-6 Yas',
    '7-9': '7-9 Yas',
    '10-12': '10-12 Yas',
  };
  return labels[ageGroup];
}

export function getDifficultyLabel(difficulty: Difficulty): string {
  const labels: Record<Difficulty, string> = {
    kolay: 'Kolay',
    orta: 'Orta',
    zor: 'Zor',
  };
  return labels[difficulty];
}

export function getAgeGroupEmoji(ageGroup: AgeGroup): string {
  const emojis: Record<AgeGroup, string> = {
    '4-6': '\uD83D\uDC76',
    '7-9': '\uD83E\uDDD2',
    '10-12': '\uD83E\uDDD1',
  };
  return emojis[ageGroup];
}

export function getDifficultyEmoji(difficulty: Difficulty): string {
  const emojis: Record<Difficulty, string> = {
    kolay: '\u2B50',
    orta: '\u2B50\u2B50',
    zor: '\u2B50\u2B50\u2B50',
  };
  return emojis[difficulty];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function shouldShowAd(riddlesSinceLastAd: number): boolean {
  return riddlesSinceLastAd >= 5;
}

export function formatScore(score: number): string {
  return score.toLocaleString('tr-TR');
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Gunaydin';
  if (hour < 18) return 'Iyi gunler';
  return 'Iyi aksamlar';
}

export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}
