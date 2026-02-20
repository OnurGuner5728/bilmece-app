import * as Speech from 'expo-speech';
import { AgeGroup } from '../types';

const SPEECH_RATES: Record<AgeGroup, number> = {
    '4-6': 0.75,
    '7-9': 0.85,
    '10-12': 0.95,
};

export const SpeechService = {
    speak(text: string, ageGroup: AgeGroup = '7-9'): void {
        Speech.stop();
        Speech.speak(text, {
            language: 'tr-TR',
            rate: SPEECH_RATES[ageGroup],
            pitch: 1.0,
        });
    },

    stop(): void {
        Speech.stop();
    },

    async isSpeaking(): Promise<boolean> {
        return Speech.isSpeakingAsync();
    },
};
