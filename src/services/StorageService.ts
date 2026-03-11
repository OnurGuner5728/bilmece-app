import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, SettingsState } from '../types';

const KEYS = {
  PROGRESS: '@bilmece/progress',
  SETTINGS: '@bilmece/settings',
  HIGH_SCORES: '@bilmece/highscores',
};

export const StorageService = {
  async getProgress(): Promise<UserProgress | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.PROGRESS);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveProgress(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
    } catch {}
  },

  async getSettings(): Promise<SettingsState | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.SETTINGS);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveSettings(settings: SettingsState): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  },

  async getHighScores(): Promise<{ name: string; score: number }[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.HIGH_SCORES);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async saveHighScore(name: string, score: number): Promise<void> {
    try {
      const scores = await this.getHighScores();
      scores.push({ name, score });
      scores.sort((a, b) => b.score - a.score);
      const top10 = scores.slice(0, 10);
      await AsyncStorage.setItem(KEYS.HIGH_SCORES, JSON.stringify(top10));
    } catch {}
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch {}
  },
};
