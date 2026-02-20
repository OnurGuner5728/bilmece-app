import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, SettingsState } from '../types';

const KEYS = {
  PROGRESS: '@bilmece/progress',
  SETTINGS: '@bilmece/settings',
  HIGH_SCORES: '@bilmece/highscores',
};

export const StorageService = {
  async getProgress(): Promise<UserProgress | null> {
    const json = await AsyncStorage.getItem(KEYS.PROGRESS);
    return json ? JSON.parse(json) : null;
  },

  async saveProgress(progress: UserProgress): Promise<void> {
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  },

  async getSettings(): Promise<SettingsState | null> {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    return json ? JSON.parse(json) : null;
  },

  async saveSettings(settings: SettingsState): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getHighScores(): Promise<{ name: string; score: number }[]> {
    const json = await AsyncStorage.getItem(KEYS.HIGH_SCORES);
    return json ? JSON.parse(json) : [];
  },

  async saveHighScore(name: string, score: number): Promise<void> {
    const scores = await this.getHighScores();
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    await AsyncStorage.setItem(KEYS.HIGH_SCORES, JSON.stringify(top10));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
