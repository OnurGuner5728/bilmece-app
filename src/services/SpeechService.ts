import * as Speech from 'expo-speech';
import { AgeGroup } from '../types';

// Yaş grubuna göre konuşma hızı — çocuklar için daha yavaş ve net
const SPEECH_RATES: Record<AgeGroup, number> = {
    '4-6': 0.72,   // Çok küçük çocuklar: belirgin yavaş ve net
    '7-9': 0.82,   // Okul çağı: rahat ve takip edilebilir
    '10-12': 0.92, // Büyük çocuklar: doğal konuşma temposuna yakın
};

// Yaş grubuna göre ses tonu — yüksek pitch sıcak ve çocuk dostu
const SPEECH_PITCH: Record<AgeGroup, number> = {
    '4-6': 1.25,   // Neşeli ve canlı ton
    '7-9': 1.15,   // Sıcak ve dostane ton
    '10-12': 1.05, // Doğal ama biraz vurgulanmış ton
};

export const SpeechService = {
    speak(text: string, ageGroup: AgeGroup = '7-9'): void {
        Speech.stop();
        Speech.speak(text, {
            language: 'tr-TR',
            rate: SPEECH_RATES[ageGroup],
            pitch: SPEECH_PITCH[ageGroup],
        });
    },

    stop(): void {
        Speech.stop();
    },

    async isSpeaking(): Promise<boolean> {
        return Speech.isSpeakingAsync();
    },
};
