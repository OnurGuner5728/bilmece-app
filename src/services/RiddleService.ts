import { Riddle, AgeGroup, Difficulty } from '../types';
import riddlesData from '../data/riddles.json';

const riddles: Riddle[] = riddlesData.riddles as Riddle[];

function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  hayvanlar: { emoji: '\uD83D\uDC3E', label: 'Hayvanlar' },
  yiyecek: { emoji: '\uD83C\uDF54', label: 'Yiyecek' },
  'do\u011Fa': { emoji: '\uD83C\uDF3F', label: 'Do\u011Fa' },
  'e\u015Fyalar': { emoji: '\uD83D\uDCE6', label: 'E\u015Fyalar' },
  'v\u00FCcut': { emoji: '\uD83E\uDDB4', label: 'V\u00FCcut' },
  'ara\u00E7lar': { emoji: '\uD83D\uDE97', label: 'Ara\u00E7lar' },
};

export const RiddleService = {
  getAllRiddles(): Riddle[] {
    return riddles;
  },

  getRiddlesByAgeGroup(ageGroup: AgeGroup): Riddle[] {
    return riddles.filter((r) => r.ageGroup === ageGroup);
  },

  getRiddlesByDifficulty(difficulty: Difficulty): Riddle[] {
    return riddles.filter((r) => r.difficulty === difficulty);
  },

  getFilteredRiddles(ageGroup: AgeGroup, difficulty: Difficulty): Riddle[] {
    return riddles.filter(
      (r) => r.ageGroup === ageGroup && r.difficulty === difficulty
    );
  },

  getRiddleById(id: string): Riddle | undefined {
    return riddles.find((r) => r.id === id);
  },

  getUnsolvedRiddles(
    ageGroup: AgeGroup,
    difficulty: Difficulty,
    solvedIds: string[]
  ): Riddle[] {
    return riddles.filter(
      (r) =>
        r.ageGroup === ageGroup &&
        r.difficulty === difficulty &&
        !solvedIds.includes(r.id)
    );
  },

  getCategories(ageGroup: AgeGroup): string[] {
    const categories = riddles
      .filter((r) => r.ageGroup === ageGroup)
      .map((r) => r.category);
    return [...new Set(categories)];
  },

  getRandomRiddle(ageGroup: AgeGroup, excludeIds: string[] = []): Riddle | null {
    const available = riddles.filter(
      (r) => r.ageGroup === ageGroup && !excludeIds.includes(r.id)
    );
    if (available.length === 0) return null;
    const index = Math.floor(Math.random() * available.length);
    return available[index];
  },

  getDailyRiddle(): Riddle {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const hash = hashDateString(dateStr);
    const index = hash % riddles.length;
    return riddles[index];
  },

  getFilteredByCategory(category: string): Riddle[] {
    return riddles.filter((r) => r.category === category);
  },

  getCategoryCount(category: string): number {
    return riddles.filter((r) => r.category === category).length;
  },
};
