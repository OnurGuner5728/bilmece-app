import { AgeGroup, Difficulty } from '../types';

export function getAgeGroupLabel(ageGroup: AgeGroup): string {
  const labels: Record<AgeGroup, string> = {
    '4-6': '4-6 Yaş',
    '7-9': '7-9 Yaş',
    '10-12': '10-12 Yaş',
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
    '4-6': '\uD83D\uDC23',
    '7-9': '\uD83E\uDD8A',
    '10-12': '\uD83E\uDD81',
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
