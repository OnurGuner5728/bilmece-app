export interface AnswerOption {
  text: string;
  emoji: string;
  isCorrect: boolean;
}

export interface Riddle {
  id: string;
  question: string;
  answer: string;
  answerEmoji: string;
  answerImage: string;
  hint: string;
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  category: string;
  options: AnswerOption[];
}

export type AgeGroup = '4-6' | '7-9' | '10-12';
export type Difficulty = 'kolay' | 'orta' | 'zor';

export interface UserProgress {
  solvedRiddles: string[];
  totalScore: number;
  currentStreak: number;
  bestStreak: number;
  badges: Badge[];
  lastPositions?: Record<string, number>;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}

export interface GameState {
  selectedAgeGroup: AgeGroup | null;
  selectedDifficulty: Difficulty | null;
  selectedCategory: string | null;
  currentRiddleIndex: number;
  showHint: boolean;
  riddlesSinceLastAd: number;
  selectedAnswer: AnswerOption | null;
  isAnswered: boolean;
  isCorrect: boolean;
}

export interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  parentalControlEnabled: boolean;
  parentalPin: string;
}
