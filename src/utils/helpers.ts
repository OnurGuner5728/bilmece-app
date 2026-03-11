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

export function shouldShowAd(riddlesSinceLastAd: number): boolean {
  return riddlesSinceLastAd >= 5;
}
