import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GameState, AgeGroup, Difficulty, UserProgress, AnswerOption, Badge } from '../types';
import { StorageService } from '../services/StorageService';

type GameAction =
  | { type: 'SET_AGE_GROUP'; payload: AgeGroup }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'NEXT_RIDDLE' }
  | { type: 'PREV_RIDDLE' }
  | { type: 'SET_RIDDLE_INDEX'; payload: number }
  | { type: 'TOGGLE_HINT' }
  | { type: 'INCREMENT_AD_COUNTER' }
  | { type: 'RESET_AD_COUNTER' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_PROGRESS'; payload: UserProgress }
  | { type: 'MARK_RIDDLE_SOLVED'; payload: string }
  | { type: 'ADD_SCORE'; payload: number }
  | { type: 'INCREMENT_STREAK' }
  | { type: 'RESET_STREAK' }
  | { type: 'SELECT_ANSWER'; payload: AnswerOption }
  | { type: 'CLEAR_ANSWER' }
  | { type: 'SAVE_POSITION' }
  | { type: 'AWARD_BADGES'; payload: Badge[] };

interface GameContextValue {
  state: GameState;
  progress: UserProgress;
  dispatch: React.Dispatch<GameAction>;
}

const initialGameState: GameState = {
  selectedAgeGroup: null,
  selectedDifficulty: null,
  selectedCategory: null,
  currentRiddleIndex: 0,
  showHint: false,
  riddlesSinceLastAd: 0,
  selectedAnswer: null,
  isAnswered: false,
  isCorrect: false,
};

const initialProgress: UserProgress = {
  solvedRiddles: [],
  totalScore: 0,
  currentStreak: 0,
  bestStreak: 0,
  badges: [],
};

function gameReducer(
  state: { game: GameState; progress: UserProgress },
  action: GameAction
): { game: GameState; progress: UserProgress } {
  switch (action.type) {
    case 'SET_AGE_GROUP':
      return {
        ...state,
        game: { ...state.game, selectedAgeGroup: action.payload, currentRiddleIndex: 0 },
      };
    case 'SET_DIFFICULTY': {
      const key = `${state.game.selectedAgeGroup}_${action.payload}`;
      const savedIndex = state.progress.lastPositions?.[key] ?? 0;
      return {
        ...state,
        game: { ...state.game, selectedDifficulty: action.payload, currentRiddleIndex: savedIndex },
      };
    }
    case 'SET_CATEGORY': {
      const catKey = action.payload ?? '';
      const savedCatIndex = state.progress.lastPositions?.[`cat_${catKey}`] ?? 0;
      return {
        ...state,
        game: { ...state.game, selectedCategory: action.payload, currentRiddleIndex: savedCatIndex },
      };
    }
    case 'NEXT_RIDDLE':
      return {
        ...state,
        game: {
          ...state.game,
          currentRiddleIndex: state.game.currentRiddleIndex + 1,
          showHint: false,
          riddlesSinceLastAd: state.game.riddlesSinceLastAd + 1,
          selectedAnswer: null,
          isAnswered: false,
          isCorrect: false,
        },
      };
    case 'PREV_RIDDLE':
      return {
        ...state,
        game: {
          ...state.game,
          currentRiddleIndex: Math.max(0, state.game.currentRiddleIndex - 1),
          showHint: false,
          selectedAnswer: null,
          isAnswered: false,
          isCorrect: false,
        },
      };
    case 'SET_RIDDLE_INDEX':
      return {
        ...state,
        game: { ...state.game, currentRiddleIndex: action.payload, showHint: false, selectedAnswer: null, isAnswered: false, isCorrect: false },
      };
    case 'TOGGLE_HINT':
      return {
        ...state,
        game: { ...state.game, showHint: !state.game.showHint },
      };
    case 'INCREMENT_AD_COUNTER':
      return {
        ...state,
        game: { ...state.game, riddlesSinceLastAd: state.game.riddlesSinceLastAd + 1 },
      };
    case 'RESET_AD_COUNTER':
      return {
        ...state,
        game: { ...state.game, riddlesSinceLastAd: 0 },
      };
    case 'RESET_GAME':
      return {
        ...state,
        game: initialGameState,
      };
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };
    case 'MARK_RIDDLE_SOLVED':
      if (state.progress.solvedRiddles.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        progress: {
          ...state.progress,
          solvedRiddles: [...state.progress.solvedRiddles, action.payload],
        },
      };
    case 'ADD_SCORE':
      return {
        ...state,
        progress: {
          ...state.progress,
          totalScore: state.progress.totalScore + action.payload,
        },
      };
    case 'INCREMENT_STREAK': {
      const newStreak = state.progress.currentStreak + 1;
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStreak: newStreak,
          bestStreak: Math.max(newStreak, state.progress.bestStreak),
        },
      };
    }
    case 'RESET_STREAK':
      return {
        ...state,
        progress: { ...state.progress, currentStreak: 0 },
      };
    case 'SELECT_ANSWER':
      return {
        ...state,
        game: {
          ...state.game,
          selectedAnswer: action.payload,
          isAnswered: true,
          isCorrect: action.payload.isCorrect,
        },
      };
    case 'CLEAR_ANSWER':
      return {
        ...state,
        game: {
          ...state.game,
          selectedAnswer: null,
          isAnswered: false,
          isCorrect: false,
        },
      };
    case 'SAVE_POSITION': {
      let posKey: string | null = null;
      if (state.game.selectedAgeGroup && state.game.selectedDifficulty) {
        posKey = `${state.game.selectedAgeGroup}_${state.game.selectedDifficulty}`;
      } else if (state.game.selectedCategory) {
        posKey = `cat_${state.game.selectedCategory}`;
      }
      if (!posKey) return state;
      return {
        ...state,
        progress: {
          ...state.progress,
          lastPositions: { ...(state.progress.lastPositions ?? {}), [posKey]: state.game.currentRiddleIndex },
        },
      };
    }
    case 'AWARD_BADGES':
      if (action.payload.length === 0) return state;
      return {
        ...state,
        progress: {
          ...state.progress,
          badges: [...state.progress.badges, ...action.payload],
        },
      };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [combined, dispatch] = useReducer(gameReducer, {
    game: initialGameState,
    progress: initialProgress,
  });

  useEffect(() => {
    StorageService.getProgress().then((saved) => {
      if (saved) {
        dispatch({ type: 'SET_PROGRESS', payload: saved });
      }
    });
  }, []);

  useEffect(() => {
    StorageService.saveProgress(combined.progress);
  }, [combined.progress]);

  return (
    <GameContext.Provider
      value={{
        state: combined.game,
        progress: combined.progress,
        dispatch,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
