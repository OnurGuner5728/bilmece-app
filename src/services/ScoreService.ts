import { Difficulty, Badge, UserProgress } from '../types';

const SCORE_MAP: Record<Difficulty, number> = {
  kolay: 10,
  orta: 20,
  zor: 30,
};

const HINT_PENALTY = 5;
const STREAK_BONUS_THRESHOLD = 3;
const STREAK_BONUS_MULTIPLIER = 1.5;

export const ScoreService = {
  calculateScore(difficulty: Difficulty, usedHint: boolean, streak: number): number {
    let base = SCORE_MAP[difficulty];
    if (usedHint) {
      base -= HINT_PENALTY;
    }
    if (streak >= STREAK_BONUS_THRESHOLD) {
      base = Math.round(base * STREAK_BONUS_MULTIPLIER);
    }
    return Math.max(base, 1);
  },

  checkBadges(progress: UserProgress): Badge[] {
    const newBadges: Badge[] = [];
    const definitions: Omit<Badge, 'unlocked'>[] = [
      {
        id: 'first_solve',
        name: 'Ilk Adim',
        emoji: '\u2B50',
        description: 'Ilk bilmeceyi coz!',
      },
      {
        id: 'ten_solves',
        name: 'Bilmece Meraklisi',
        emoji: '\uD83E\uDDE0',
        description: '10 bilmece coz!',
      },
      {
        id: 'fifty_solves',
        name: 'Bilmece Ustasi',
        emoji: '\uD83C\uDFC6',
        description: '50 bilmece coz!',
      },
      {
        id: 'streak_5',
        name: 'Seri Cozucu',
        emoji: '\uD83D\uDD25',
        description: '5 bilmeceyi ust uste coz!',
      },
      {
        id: 'streak_10',
        name: 'Durdurulamaz',
        emoji: '\uD83D\uDE80',
        description: '10 bilmeceyi ust uste coz!',
      },
      {
        id: 'score_100',
        name: 'Puan Avcisi',
        emoji: '\uD83D\uDCAF',
        description: '100 puan topla!',
      },
      {
        id: 'score_500',
        name: 'Puan Kralı',
        emoji: '\uD83D\uDC51',
        description: '500 puan topla!',
      },
    ];

    const earned = new Set(progress.badges.map((b) => b.id));

    for (const def of definitions) {
      if (earned.has(def.id)) continue;

      let shouldUnlock = false;
      switch (def.id) {
        case 'first_solve':
          shouldUnlock = progress.solvedRiddles.length >= 1;
          break;
        case 'ten_solves':
          shouldUnlock = progress.solvedRiddles.length >= 10;
          break;
        case 'fifty_solves':
          shouldUnlock = progress.solvedRiddles.length >= 50;
          break;
        case 'streak_5':
          shouldUnlock = progress.bestStreak >= 5;
          break;
        case 'streak_10':
          shouldUnlock = progress.bestStreak >= 10;
          break;
        case 'score_100':
          shouldUnlock = progress.totalScore >= 100;
          break;
        case 'score_500':
          shouldUnlock = progress.totalScore >= 500;
          break;
      }

      if (shouldUnlock) {
        newBadges.push({ ...def, unlocked: true });
      }
    }

    return newBadges;
  },
};
